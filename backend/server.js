// server.js
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const { URL }      = require('url');
const dns          = require('dns').promises;
const { Pool }     = require('pg');
const bcrypt       = require('bcrypt');
require('dotenv').config();

const authRoutes             = require('./routes/authRoutes');
const registerRoutes         = require('./routes/registerRoutes');
const trainingCentreRoutes   = require('./routes/trainingCentreRoutes');
const yogaProfessionalRoutes = require('./routes/yogaProfessionalRoutes');
const wellnessCentreRoutes   = require('./routes/wellnessCentreRoutes');
const ayushHospitalRoutes    = require('./routes/ayushHospitalRoutes');
const adminRoutes            = require('./routes/adminRouter');
const researchGrantRoutes    = require('./routes/researchGrantRoutes');
const ayushCollegeRoutes     = require('./routes/ayushCollegeRoutes');
const institutionRoutes      = require('./routes/institutionRoutes');

const app = express();

// ── Fix #1/#2: Remove Express & server version tokens ───────────────────────
app.disable('x-powered-by');
// The 'Server' header is set by Node's http module; suppress it
app.use((req, res, next) => {
  res.removeHeader('Server');
  next();
});

// ── Fix #4/#5: Security headers via Helmet ───────────────────────────────────
// frame-ancestors 'none'   → fix #4 Clickjacking
// xXssProtection: false    → fix #5 remove deprecated X-XSS-Protection header
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc:              ["'self'"],
        scriptSrc:               ["'self'"],
        styleSrc:                ["'self'", "'unsafe-inline'"],
        imgSrc:                  ["'self'", 'data:', 'blob:', 'https://cdnbbsr.s3waas.gov.in', 'https://images.unsplash.com'],
        connectSrc:              ["'self'"],
        fontSrc:                 ["'self'"],
        objectSrc:               ["'none'"],
        frameSrc:                ["'none'"],
        frameAncestors:          ["'none'"],   // #11 Clickjacking
        formAction:              ["'self'"],
        baseUri:                 ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    xXssProtection:            false,         // #12 remove deprecated header
    strictTransportSecurity:   { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy:            { policy: 'strict-origin-when-cross-origin' },
    xFrameOptions:             { action: 'deny' },
    crossOriginEmbedderPolicy: false,
  })
);

// ── #13: Permissions-Policy — helmet 8 doesn't emit this; set it directly ────
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), camera=(), microphone=(), payment=(), usb=(), fullscreen=(self), accelerometer=(), gyroscope=(), magnetometer=()'
  );
  next();
});

// ── Fix #7: No Cache-Control on sensitive responses ──────────────────────────
// API responses must never be cached by proxies or browsers
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// ── Fix #3: Host header injection — whitelist allowed hostnames ──────────────
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS || 'localhost:4000,localhost')
  .split(',').map(h => h.trim().toLowerCase());

app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase().split(':')[0]; // strip port
  const hostWithPort = (req.headers.host || '').toLowerCase();
  if (!ALLOWED_HOSTS.some(h => h === host || h === hostWithPort)) {
    return res.status(400).json({ message: 'Invalid Host header.' });
  }
  next();
});

// ── CORS — credentials + origin whitelist ────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5174,http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Cookie parser ─────────────────────────────────────────────────────────────
app.use(cookieParser(process.env.COOKIE_SECRET || process.env.JWT_SECRET));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

// ── Fix #8: SSRF protection — block requests whose body/query contains ────────
// URLs pointing at internal/private IP ranges
const PRIVATE_IP_RE = /^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.0\.0\.0|::1|fc00:|fe80:)/i;
const INTERNAL_HOSTS_RE = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|metadata\.google\.internal|169\.254\.169\.254)$/i;

function containsSsrfUrl(value) {
  if (typeof value !== 'string') return false;
  // Check for URL-shaped strings
  const urlPatterns = value.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  for (const raw of urlPatterns) {
    try {
      const { hostname } = new URL(raw);
      if (PRIVATE_IP_RE.test(hostname) || INTERNAL_HOSTS_RE.test(hostname)) return true;
    } catch { /* not a valid URL, skip */ }
  }
  return false;
}

function deepSsrfCheck(obj, depth = 0) {
  if (depth > 5 || !obj) return false;
  if (typeof obj === 'string') return containsSsrfUrl(obj);
  if (Array.isArray(obj)) return obj.some(v => deepSsrfCheck(v, depth + 1));
  if (typeof obj === 'object') return Object.values(obj).some(v => deepSsrfCheck(v, depth + 1));
  return false;
}

app.use((req, res, next) => {
  if (deepSsrfCheck(req.body) || deepSsrfCheck(req.query)) {
    return res.status(400).json({ message: 'Request contains a disallowed internal URL.' });
  }
  next();
});

// ── Fix #9/#10: Block dangerous HTTP methods ──────────────────────────────────
// TRACE and TRACK are never needed and can leak auth headers
app.use((req, res, next) => {
  if (['TRACE', 'TRACK'].includes(req.method)) {
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  next();
});

// ── Rate limiting on auth endpoints ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Static uploads — no directory listing ─────────────────────────────────────
app.use('/uploads', (req, res, next) => {
  if (req.path === '/' || req.path.endsWith('/')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}, express.static(require('path').join(__dirname, 'uploads'), { index: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/register',          registerRoutes);
app.use('/api/training-centre',   trainingCentreRoutes);
app.use('/api/yoga-professional', yogaProfessionalRoutes);
app.use('/api/wellness',          wellnessCentreRoutes);
app.use('/api/ayush-hospital',    ayushHospitalRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api/research-grants',   researchGrantRoutes);
app.use('/api/ayush-college',     ayushCollegeRoutes);
app.use('/api/institution',       institutionRoutes);
app.use('/api/dashboard',         require('./routes/dashboardRoutes'));
app.use('/api/registry',          require('./routes/registryRoutes'));

// ── Global error handler — no stack traces in production ─────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// ── DB health check ───────────────────────────────────────────────────────────
const pool = new Pool({
  user:     process.env.DB_USER,
  host:     process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port:     process.env.DB_PORT,
});

async function bootstrapAdmin() {
  const adminEmail = process.env.INIT_ADMIN_EMAIL;
  const adminPassword = process.env.INIT_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log("Bootstrap: INIT_ADMIN_EMAIL or INIT_ADMIN_PASSWORD not defined in environment. Skipping admin seed.");
    return;
  }

  try {
    const res = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND role = $2",
      [adminEmail.trim(), 'admin']
    );

    if (res.rows.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_verified, registration_status)
         VALUES ($1, LOWER($2), $3, $4, $5, $6)`,
        ['System Admin', adminEmail.trim(), passwordHash, 'admin', true, 'approved']
      );
      console.log(`Bootstrap: Permanent Admin account created successfully for ${adminEmail}`);
    } else {
      console.log("Bootstrap: System Admin account already exists. Skipping creation.");
    }
  } catch (error) {
    console.error("Bootstrap: Error during Admin account verification/creation:", error);
  }
}

async function runTrainingCentresMigration() {
  try {
    await pool.query(`
      ALTER TABLE training_centres 
      ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS designation VARCHAR(255),
      ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS entity_certificate_path TEXT,
      ADD COLUMN IF NOT EXISTS already_operating VARCHAR(100),
      ADD COLUMN IF NOT EXISTS other_business VARCHAR(255),
      ADD COLUMN IF NOT EXISTS operational_business_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS operational_business_reg_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS operational_business_certificate_path TEXT,
      ADD COLUMN IF NOT EXISTS id_proof_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS id_proof_number VARCHAR(100),
      ADD COLUMN IF NOT EXISTS id_proof_path TEXT,
      ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(100),
      ADD COLUMN IF NOT EXISTS website VARCHAR(255);
    `);
    console.log("Database Migration: training_centres table updated successfully with revised fields");
  } catch (err) {
    console.error("Database Migration: Failed to update training_centres table:", err);
  }
}

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
    bootstrapAdmin();
    runTrainingCentresMigration();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
