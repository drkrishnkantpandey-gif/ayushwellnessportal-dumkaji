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
const bcrypt       = require('bcryptjs');
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

// ── Static uploads served BEFORE host-header check so documents are accessible
// on any server (NIC Cloud, Render, localhost) without needing to whitelist the
// server's own hostname.
app.use('/uploads', (req, res, next) => {
  if (req.path === '/' || req.path.endsWith('/')) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}, express.static(require('path').join(__dirname, 'uploads'), { index: false }));

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

async function runIncentiveApplicationsMigration() {
  try {
    await pool.query(`
      ALTER TABLE yoga_incentive_applications 
      ADD COLUMN IF NOT EXISTS region VARCHAR(50),
      ADD COLUMN IF NOT EXISTS project_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS proposed_location VARCHAR(100),
      ADD COLUMN IF NOT EXISTS other_location_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(100),
      ADD COLUMN IF NOT EXISTS proposed_centre_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS eligible_assets_amount NUMERIC,
      ADD COLUMN IF NOT EXISTS site_total_area NUMERIC,
      ADD COLUMN IF NOT EXISTS proposed_constructed_area NUMERIC,
      ADD COLUMN IF NOT EXISTS services_offered TEXT[],
      ADD COLUMN IF NOT EXISTS tentative_employees INTEGER,
      ADD COLUMN IF NOT EXISTS ycb_certified_instructors INTEGER,
      ADD COLUMN IF NOT EXISTS clinical_services_provided BOOLEAN,
      ADD COLUMN IF NOT EXISTS certified_ayush_doctors INTEGER,
      ADD COLUMN IF NOT EXISTS proposed_site_photo TEXT,
      ADD COLUMN IF NOT EXISTS doc_ca_eca TEXT,
      ADD COLUMN IF NOT EXISTS doc_entity_registration TEXT,
      ADD COLUMN IF NOT EXISTS doc_map_approval TEXT,
      ADD COLUMN IF NOT EXISTS doc_non_agri_land TEXT,
      ADD COLUMN IF NOT EXISTS doc_land_possession TEXT,
      ADD COLUMN IF NOT EXISTS doc_affidavit TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS designation VARCHAR(255),
      ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100),
      ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS email_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS upn VARCHAR(100),
      ADD COLUMN IF NOT EXISTS incentive_type VARCHAR(20),
      ADD COLUMN IF NOT EXISTS forwarded_to_district_at  TIMESTAMP,
      ADD COLUMN IF NOT EXISTS district_verified_at       TIMESTAMP,
      ADD COLUMN IF NOT EXISTS district_verification_note TEXT,
      ADD COLUMN IF NOT EXISTS reverted_at                TIMESTAMP,
      ADD COLUMN IF NOT EXISTS revert_comment             TEXT,
      ADD COLUMN IF NOT EXISTS resubmitted_at             TIMESTAMP,
      ADD COLUMN IF NOT EXISTS forwarded_to_slrc_at       TIMESTAMP,
      ADD COLUMN IF NOT EXISTS slrc_approval_date         DATE,
      ADD COLUMN IF NOT EXISTS slrc_reference_number      VARCHAR(100),
      ADD COLUMN IF NOT EXISTS in_principle_approved_at   TIMESTAMP,
      ADD COLUMN IF NOT EXISTS in_principle_order_number  VARCHAR(100);

      CREATE TABLE IF NOT EXISTS yoga_incentive_events (
        id             SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES yoga_incentive_applications(id) ON DELETE CASCADE,
        event_type     VARCHAR(60) NOT NULL,
        actor_role     VARCHAR(40),
        actor_id       INTEGER,
        actor_name     VARCHAR(255),
        comment        TEXT,
        attachment_paths TEXT[],
        created_at     TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE yoga_incentive_events 
      ADD COLUMN IF NOT EXISTS actor_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS attachment_paths TEXT[];

      CREATE TABLE IF NOT EXISTS yoga_incentive_disbursal_claims (
        id                          SERIAL PRIMARY KEY,
        application_id              INTEGER NOT NULL REFERENCES yoga_incentive_applications(id) ON DELETE CASCADE,
        claim_type                  VARCHAR(20) NOT NULL,
        status                      VARCHAR(50) NOT NULL,
        bank_account_number         VARCHAR(100) NOT NULL,
        bank_name                   VARCHAR(255) NOT NULL,
        branch_address              TEXT NOT NULL,
        loan_account_number         VARCHAR(100),
        capex_incurred              NUMERIC NOT NULL,
        doc_bank_detail             TEXT NOT NULL,
        doc_ca_eca_report           TEXT NOT NULL,
        doc_fire_safety_audit       TEXT NOT NULL,
        doc_wellness_registration   TEXT NOT NULL,
        doc_capex_certificate       TEXT NOT NULL,
        doc_actual_bills            TEXT NOT NULL,
        doc_others                  TEXT,
        doc_sessions_workshops      TEXT,
        revert_comment              TEXT,
        committee_verification_note TEXT,
        committee_verified_at       TIMESTAMP,
        slrc_disbursal_note         TEXT,
        released_at                 TIMESTAMP,
        created_at                  TIMESTAMP DEFAULT NOW(),
        updated_at                  TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database Migration: yoga_incentive_applications table and events tracker updated successfully");
  } catch (err) {
    console.error("Database Migration: Failed to update yoga_incentive_applications / events table:", err);
  }
}

async function runResearchGrantsCleanupMigration() {
  try {
    const res = await pool.query(`
      UPDATE research_grants
      SET approved_amount = requested_amount
      WHERE (approved_amount IS NULL OR approved_amount = 0)
        AND status IN ('APPROVED', 'SLRC_APPROVED', 'APPROVED_BY_RPAC', 'FORWARDED_TO_SLRC')
    `);
    if (res.rowCount > 0) {
      console.log(`Database Migration: Cleaned up ${res.rowCount} legacy research grant approved amounts.`);
    }
  } catch (err) {
    console.error("Database Migration: Failed to clean up legacy research grant approved amounts:", err);
  }
}

async function runWellnessCentreOperationalMigration() {
  try {
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS seq_wc_operational_reg_serial START 1;

      CREATE TABLE IF NOT EXISTS wellness_centre_registrations (
        id                          SERIAL PRIMARY KEY,
        user_id                     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        registration_number         VARCHAR(30) UNIQUE,
        already_on_portal           BOOLEAN DEFAULT FALSE,
        portal_reg_reason           VARCHAR(50),
        previous_reg_number         VARCHAR(100),
        previous_reg_certificate    TEXT,
        centre_name                 VARCHAR(255) NOT NULL DEFAULT '',
        district                    VARCHAR(100) NOT NULL DEFAULT '',
        address                     TEXT NOT NULL DEFAULT '',
        gps_lat                     VARCHAR(50),
        gps_lng                     VARCHAR(50),
        google_map_link             TEXT,
        owner_name                  VARCHAR(255),
        mobile                      VARCHAR(20),
        is_residential              BOOLEAN DEFAULT FALSE,
        offers_clinical             BOOLEAN DEFAULT FALSE,
        category                    VARCHAR(100),
        services_offered            TEXT[],
        doctor_appointed            BOOLEAN DEFAULT FALSE,
        doctor_name                 VARCHAR(255),
        doctor_qualification        VARCHAR(255),
        doctor_qual_doc             TEXT,
        bcp_reg_number              VARCHAR(100),
        bcp_reg_doc                 TEXT,
        cea_reg_number              VARCHAR(100),
        cea_valid_till              DATE,
        cea_reg_certificate         TEXT,
        cea_registered              BOOLEAN DEFAULT FALSE,
        declaration_board           BOOLEAN DEFAULT FALSE,
        declaration_signboard       BOOLEAN DEFAULT FALSE,
        clinical_affidavit          TEXT,
        reception_area_sqft         NUMERIC(10,2),
        waiting_capacity            INTEGER,
        consultation_rooms          INTEGER,
        incharge_name               VARCHAR(255),
        incharge_mobile             VARCHAR(20),
        emergency_centre_name       VARCHAR(255),
        emergency_distance_m        NUMERIC(10,2),
        offers_prakruti             BOOLEAN DEFAULT FALSE,
        website                     TEXT,
        service_charges_doc         TEXT,
        brochure_doc                TEXT,
        num_beds                    INTEGER,
        kitchen_available           BOOLEAN DEFAULT FALSE,
        dosha_dietetics             BOOLEAN DEFAULT FALSE,
        parking_cars                INTEGER,
        cctv_supervised             BOOLEAN DEFAULT FALSE,
        abhyanga_rooms              INTEGER,
        vasti_rooms                 INTEGER,
        post_therapy_waiting_rooms  INTEGER,
        medicine_dispensing_rooms   INTEGER,
        marma_rooms                 INTEGER,
        para_surgical_rooms         INTEGER,
        kshar_sutra_ot              INTEGER,
        yoga_halls                  INTEGER,
        meditation_halls            INTEGER,
        shatkarma_rooms             INTEGER,
        massage_rooms               INTEGER,
        enema_rooms                 INTEGER,
        hydrotherapy_rooms          INTEGER,
        receptionist_count          INTEGER,
        sanitation_worker_count     INTEGER,
        mpw_count                   INTEGER,
        cook_count                  INTEGER,
        watchman_count              INTEGER,
        pharmacist_name             VARCHAR(255),
        pharmacist_reg_number       VARCHAR(100),
        pharmacist_bcp_doc          TEXT,
        wc_attendant_count          INTEGER,
        ayurveda_nurse_count        INTEGER,
        male_panchakarma_therapist  INTEGER,
        female_panchakarma_therapist INTEGER,
        panchakarma_staff_bcp_doc   TEXT,
        yoga_instructor_count       INTEGER,
        yoga_instructor_qual_doc    TEXT,
        bnys_doctor_name            VARCHAR(255),
        bnys_reg_certificate        TEXT,
        male_naturopathy_attendant  INTEGER,
        female_naturopathy_attendant INTEGER,
        fee_deposited               BOOLEAN DEFAULT FALSE,
        fee_receipt_doc             TEXT,
        all_declarations_accepted   BOOLEAN DEFAULT FALSE,
        declaration_affidavit       TEXT,
        status                      VARCHAR(30) DEFAULT 'SUBMITTED',
        district_comment            TEXT,
        approved_at                 TIMESTAMP,
        certificate_valid_till      DATE,
        approved_by_user_id         INTEGER REFERENCES users(id),
        submitted_at                TIMESTAMP DEFAULT NOW(),
        updated_at                  TIMESTAMP DEFAULT NOW()
      );

      CREATE UNIQUE INDEX IF NOT EXISTS uniq_wc_op_reg_user ON wellness_centre_registrations(user_id);

      CREATE TABLE IF NOT EXISTS wellness_centre_reg_events (
        id               SERIAL PRIMARY KEY,
        registration_id  INTEGER NOT NULL REFERENCES wellness_centre_registrations(id) ON DELETE CASCADE,
        event_type       VARCHAR(60) NOT NULL,
        actor_role       VARCHAR(40),
        actor_id         INTEGER REFERENCES users(id),
        actor_name       VARCHAR(255),
        comment          TEXT,
        created_at       TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE wellness_centre_registrations ADD COLUMN IF NOT EXISTS naturopathy_staff_bcp_doc TEXT;
    `);
    console.log('Database Migration: wellness_centre_registrations tables created/verified successfully');
  } catch (err) {
    console.error('Database Migration: Failed to create wellness_centre_registrations tables:', err);
  }
}

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to the database');
    bootstrapAdmin();
    runTrainingCentresMigration();
    runIncentiveApplicationsMigration();
    runResearchGrantsCleanupMigration();
    runWellnessCentreOperationalMigration();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
