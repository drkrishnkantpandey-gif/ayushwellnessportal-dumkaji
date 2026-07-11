const db = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ── Email / SMTP Configuration ────────────────────────────────────────────────
// All SMTP settings come from environment variables.
// For Gmail (testing):  EMAIL_HOST=smtp.gmail.com  EMAIL_PORT=587  EMAIL_SECURE=false
// For NIC Cloud (prod): EMAIL_HOST=<nic-smtp-server>  EMAIL_PORT=<port>  EMAIL_SECURE=true/false
// No code change needed when switching — just update the env variables.
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',   // true = port 465, false = STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false   // keeps working even with self-signed certs on NIC
  }
});

// Verify SMTP connection on startup — result appears immediately in server logs
transporter.verify((error) => {
  if (error) {
    console.error('[Email] SMTP verification FAILED:', error.message,
      '| host:', process.env.EMAIL_HOST, 'port:', process.env.EMAIL_PORT);
  } else {
    console.log('[Email] SMTP ready — sending via', process.env.EMAIL_USER,
      'on', process.env.EMAIL_HOST || 'smtp.gmail.com');
  }
});

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

/**
 * POST /api/register/wellness-centre
 * Body (multipart/form-data):
 *  - centreName, centreType, ownershipType, registrationNumber
 *  - contactPerson, contactEmail, contactPhone
 *  - userType  (should be 'wellness_centre')
 *  - files: ownershipProof, therapyMenu, facilityImages[], staffCerts
 */
async function registerWellnessCentre(req, res) {
  const {
    centreName,
    entityType,   // WELLNESS_CENTRE | WELLNESS_CENTRE_HOSPITAL | WELLNESS_RESORT
    centreType,   // legacy field (kept for backward compat)
    ownershipType,
    registrationNumber,
    contactPerson,
    contactEmail,
    contactPhone,
    userType,
    password,
    address,
    city,
    state,
    district,
    pincode,
  } = req.body;

  // services may arrive as JSON string or array
  let services = req.body.services || [];
  if (typeof services === "string") {
    try { services = JSON.parse(services); } catch { services = [services]; }
  }

  if (!contactEmail || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (userType !== "wellness_centre") {
    return res.status(400).json({ message: "Invalid userType for this route" });
  }

  const VALID_ENTITY_TYPES = ["WELLNESS_CENTRE", "WELLNESS_CENTRE_HOSPITAL", "WELLNESS_RESORT"];
  const VALID_SERVICES     = ["PANCHKARMA", "YOGA", "NATUROPATHY"];

  if (!entityType || !VALID_ENTITY_TYPES.includes(entityType)) {
    return res.status(400).json({ message: "Please select a valid wellness facility type." });
  }

  if (!services.length || !services.every((s) => VALID_SERVICES.includes(s))) {
    return res.status(400).json({ message: "Please select at least one valid service (Panchkarma, Yoga, Naturopathy)." });
  }

  if (
    !centreName ||
    !ownershipType ||
    !registrationNumber ||
    !contactPerson ||
    !contactEmail ||
    !contactPhone
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // uploaded files
  const files = req.files || {};

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // 1) create or update user row
    const existingUser = await client.query(
      `SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1) AND LOWER(role) = LOWER($2)`,
      [contactEmail, 'wellness_centre']
    );

    let userId;
    if (existingUser.rows.length > 0) {
      if (existingUser.rows[0].is_verified) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Email already registered and verified." });
      }
      userId = existingUser.rows[0].id;
      const passwordHash = await bcrypt.hash(password, 10);
      await client.query(
        `UPDATE users SET full_name = $1, password_hash = $2 WHERE id = $3`,
        [contactPerson, passwordHash, userId]
      );
      // Clean up previous registration attempts
      await client.query(`DELETE FROM wellness_centres WHERE user_id = $1`, [userId]);
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_verified)
         VALUES ($1, LOWER($2), $3, $4, false)
         RETURNING id`,
        [contactPerson, contactEmail, passwordHash, "wellness_centre"]
      );
      userId = userResult.rows[0].id;
    }

    // 2) create wellness_centre row
    const centreResult = await client.query(
      `INSERT INTO wellness_centres (
          user_id,
          name,
          registration_status,
          accreditation_level,
          star_rating,
          tourism_listing_status,
          tourism_listing_url,
          registration_valid_to,
          entity_type,
          centre_type,
          services,
          ownership_type,
          registration_number,
          contact_person,
          contact_email,
          contact_phone,
          address,
          city,
          state,
          district,
          pincode
        )
        VALUES (
          $1, $2,
          'UNDER_REVIEW',
          NULL,
          NULL,
          'NOT_LISTED',
          NULL,
          NULL,
          $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15
        )
        RETURNING id`,
      [
        userId,
        centreName,
        entityType,
        centreType || entityType,   // legacy fallback
        services,                   // stored as PostgreSQL array
        ownershipType,
        registrationNumber,
        contactPerson,
        contactEmail,
        contactPhone,
        address || null,
        city || null,
        state || null,
        district || null,
        pincode || null,
      ]
    );

    const centreId = centreResult.rows[0].id;

    // 3) helper to create document rows if file exists
    async function insertDoc(docType, file) {
      if (!file) return;
      await client.query(
        `INSERT INTO centre_documents (
            centre_id,
            doc_type,
            status,
            remarks,
            uploaded_at,
            file_path
          )
          VALUES ($1, $2, 'UPLOADED', NULL, NOW(), $3)`,
        [centreId, docType, file.path]
      );
    }

    await insertDoc(
      "OWNERSHIP",
      files.ownershipProof && files.ownershipProof[0]
    );
    await insertDoc("THERAPY_MENU", files.therapyMenu && files.therapyMenu[0]);

    if (files.facilityImages && files.facilityImages.length > 0) {
      for (const f of files.facilityImages) {
        await insertDoc("FACILITY_PHOTO", f);
      }
    }

    await insertDoc("STAFF_CERTS", files.staffCerts && files.staffCerts[0]);

    // Extra docs based on entity type
    if (entityType === "WELLNESS_CENTRE_HOSPITAL") {
      await insertDoc("HOSPITAL_CERT", files.hospitalCert && files.hospitalCert[0]);
    }
    if (entityType === "WELLNESS_RESORT") {
      await insertDoc("RESORT_LICENSE", files.resortLicense && files.resortLicense[0]);
    }

    // 4) Generate and store OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await client.query(
      `INSERT INTO user_otps (user_id, otp, expires_at, is_used)
       VALUES ($1, $2, $3, false)`,
      [userId, otp, otpExpiresAt]
    );

    await client.query("COMMIT");

    // 5) Send verification email (after commit to ensure user exists)
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: contactEmail,
      subject: 'Verify Your Wellness Centre - AYUSH Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AYUSH Portal</h2>
          <p>Hello ${contactPerson},</p>
          <p>Thank you for registering <strong>${centreName}</strong> as a Wellness Centre!</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>Best regards,<br>AYUSH Portal Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error("Failed to send registration email:", mailErr);
    }

    return res.status(201).json({
      message: "Wellness centre registered successfully",
      centreId,
      userId,
      contactEmail, // Use original email from body
      status: "UNDER_REVIEW",
    });
  } catch (err) {
    console.error("Error in registerWellnessCentre:", err);
    try { await client.query("ROLLBACK"); } catch (rbErr) { }
    return res.status(500).json({ message: "Server error while registering" });
  } finally {
    client.release();
  }
}

/**
 * POST /api/register/training-centre
 * Body (multipart/form-data):
 *  - centreName, establishmentYear, email, phone, institutionType
 *  - address, city, state, pincode, registrationNumber, registrationAuthority
 *  - description, facilities (comma-separated), coursesOffered (comma-separated)
 *  - files: centrePhotos[]
 */
async function registerTrainingCentre(req, res) {
  const {
    centreName,
    establishmentYear,
    email,
    phone,
    institutionType,
    address,
    city,
    state,
    district,
    pincode,
    registrationNumber,
    registrationAuthority,
    description,
    facilities,
    coursesOffered,
    password,
    confirmPassword
  } = req.body;

  // Basic validation
  if (!centreName || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Process arrays from comma-separated strings
  const facilitiesArray = facilities ? facilities.split(',').map(f => f.trim()) : [];
  const coursesArray = coursesOffered ? coursesOffered.split(',').map(c => c.trim()) : [];

  // Process uploaded files
  const files = req.files || {};
  const photoPaths = (files.centrePhotos || []).map(file => file.path);

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check for existing user with same email/role (case-insensitive)
    const existingUser = await client.query(
      `SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1) AND role = $2`,
      [email, 'yoga_centre']
    );

    let userId;

    if (existingUser.rows.length > 0) {
      const userRecord = existingUser.rows[0];

      if (userRecord.is_verified) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email already registered and verified. Please log in.",
        });
      }

      userId = userRecord.id;

      await client.query(
        `UPDATE users 
         SET full_name = $1, phone = $2, password_hash = $3 
         WHERE id = $4`,
        [centreName, phone, passwordHash, userId]
      );

      await client.query(`DELETE FROM training_centres WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM user_otps WHERE user_id = $1`, [userId]);
    } else {
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, LOWER($2), $3, $4, $5, $6)
         RETURNING id`,
        [centreName, email, phone, passwordHash, 'yoga_centre', false]
      );
      userId = userResult.rows[0].id;
    }

    // Create training centre
    await client.query(
      `INSERT INTO training_centres (
        user_id, centre_name, establishment_year, email, phone, 
        institution_type, address, city, state, district, pincode, 
        registration_number, registration_authority, description, 
        facilities, courses_offered, centre_photos
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )`,
      [
        userId,
        centreName,
        establishmentYear || null,
        email,
        phone,
        institutionType || null,
        address || null,
        city || null,
        state || null,
        district || null,
        pincode || null,
        registrationNumber || null,
        registrationAuthority || null,
        description || null,
        facilitiesArray,
        coursesArray,
        photoPaths
      ]
    );

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await client.query(
      `INSERT INTO user_otps (user_id, otp, expires_at, is_used)
       VALUES ($1, $2, $3, false)`,
      [userId, otp, otpExpiresAt]
    );

    await client.query("COMMIT");

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - AYUSH Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AYUSH Portal</h2>
          <p>Hello ${centreName},</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>AYUSH Portal Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Training centre registered successfully. Please check your email to verify your account.",
      email
    });

  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (rbErr) { }
    console.error("Registration error:", error);

    if (error.code === '23505') { // Unique violation
      const field = error.constraint?.includes('email') ? 'email' : 'phone';
      return res.status(400).json({
        success: false,
        message: `${field} already registered`
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  } finally {
    client.release();
  }
}

/**
 * POST /api/register/yoga-professional
 * Body (multipart/form-data):
 *  - fullName, email, phone, password, confirmPassword
 *  - dob, gender, aadhaar, pan, qualification
 *  - address, city, state, pincode
 *  - experienceYears, specialization, bio
 *  - files: profilePhoto, certificateFiles[]
 */
async function registerYogaProfessional(req, res) {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    dob,
    gender,
    aadhaar,
    pan,
    qualification,
    address,
    city,
    state,
    pincode,
    experienceYears,
    specialization,
    bio,
    ycbCertificateNumber,
    otherQualificationName
  } = req.body;

  // Basic validation
  if (!fullName || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  // Process uploaded files
  const files = req.files || {};
  const profilePhotoPath = files.profilePhoto?.[0]?.path || null;
  const certificatePaths = (files.certificateFiles || []).map(file => file.path);

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check for existing user with same email/role (case-insensitive)
    const existingUser = await client.query(
      `SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1) AND role = $2`,
      [email, 'yoga_professional']
    );

    let userId;

    if (existingUser.rows.length > 0) {
      const userRecord = existingUser.rows[0];

      if (userRecord.is_verified) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email already registered and verified. Please log in.",
        });
      }

      userId = userRecord.id;

      // Update existing unverified user
      await client.query(
        `UPDATE users 
         SET full_name = $1, phone = $2, password_hash = $3, aadhaar_number = $4, pan_number = $5, qualification = $6
         WHERE id = $7`,
        [fullName, phone, passwordHash, aadhaar || null, pan || null, qualification || null, userId]
      );

      // Delete existing profile and OTPs
      await client.query(`DELETE FROM yoga_professional_profile WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM user_otps WHERE user_id = $1`, [userId]);
    } else {
      // Create new user
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified, aadhaar_number, pan_number, qualification)
         VALUES ($1, LOWER($2), $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [fullName, email, phone, passwordHash, 'yoga_professional', false, aadhaar || null, pan || null, qualification || null]
      );
      userId = userResult.rows[0].id;
    }

    // Create yoga professional profile
    await client.query(
      `INSERT INTO yoga_professional_profile (
        user_id, dob, gender, address, city, state, pincode,
        experience_years, bio, profile_photo, certificate_paths,
        ycb_certificate_number, other_qualification_name
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )`,
      [
        userId,
        dob || null,
        gender || null,
        address || null,
        city || null,
        state || null,
        pincode || null,
        experienceYears && !isNaN(parseInt(experienceYears)) ? parseInt(experienceYears) : 0,
        bio || null,
        profilePhotoPath,
        certificatePaths,
        ycbCertificateNumber || null,
        otherQualificationName || null
      ]
    );

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await client.query(
      `INSERT INTO user_otps (user_id, otp, expires_at, is_used)
       VALUES ($1, $2, $3, false)`,
      [userId, otp, otpExpiresAt]
    );

    await client.query("COMMIT");

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - AYUSH Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AYUSH Portal</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for registering as a Yoga Professional!</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>AYUSH Portal Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`OTP Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error(`Failed to send OTP email to ${email}:`, emailError);
      // We don't return error here because the user is already created
      // They can try to resend OTP from the frontend
    }

    res.status(201).json({
      success: true,
      message: "Yoga Professional registered successfully. Please check your email to verify your account.",
      email
    });

  } catch (error) {
    if (client) {
      try { await client.query("ROLLBACK"); } catch (rbErr) { console.error("Rollback error:", rbErr); }
    }
    console.error("Yoga Professional Registration error:", error);

    if (error.code === '23505') { // Unique violation
      const field = error.constraint?.includes('email') ? 'email' : 'phone';
      return res.status(400).json({
        success: false,
        message: `${field} already registered`
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. " + error.message
    });
  } finally {
    if (client) client.release();
  }
}




async function registerAyushCollege(req, res) {
  const {
    collegeName,
    collegeType,
    affiliation,
    collegeCode,
    estYear,
    collegeEmail,
    collegePhone,
    website,
    district,
    block,
    fullAddress,
    pin,
    password,
    principalName,
    principalEmail,
    principalPhone,
    designation,
    naacStatus,
    naacGrade,
    cgpa,
    validityDate,
    cycle,
    univReg,
    aishe,
    misId
  } = req.body;

  const state = req.body.state || "Uttarakhand";

  // Basic Validation
  if (!collegeName || !collegeEmail || !password || !state || !district) {
    // We'll trust the frontend validation mostly, but basic check
    // Note: 'state' is hardcoded 'Uttarakhand' in frontend form usually
  }

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // FORCE RESET (Debug Step) - REMOVED for Production
    // await client.query("DROP TABLE IF EXISTS public.ayush_colleges CASCADE"); 

    await client.query(`
            CREATE TABLE IF NOT EXISTS public.ayush_colleges (
                id SERIAL PRIMARY KEY,
                college_name VARCHAR(255) NOT NULL,
                college_email VARCHAR(255) UNIQUE NOT NULL,
                college_phone VARCHAR(50),
                password_hash VARCHAR(255) NOT NULL,
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                state VARCHAR(100),
                district VARCHAR(100),
                address TEXT,
                pincode VARCHAR(20),
                block_tehsil VARCHAR(100),
                college_type VARCHAR(100),
                university_affiliation VARCHAR(255),
                college_code VARCHAR(50),
                establishment_year INTEGER,
                website_url VARCHAR(255),
                principal_name VARCHAR(255),
                principal_email VARCHAR(255),
                principal_phone VARCHAR(50),
                naac_status VARCHAR(50),
                naac_grade VARCHAR(20),
                cgpa DECIMAL(4, 2),
                naac_valid_upto DATE,
                naac_cycle VARCHAR(50),
                university_reg_number VARCHAR(100),
                aishe_code VARCHAR(50),
                mis_id VARCHAR(50),
                recognition_authority VARCHAR(255),
                ownership_type VARCHAR(50),
                institution_category VARCHAR(50),
                city VARCHAR(100),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_ayush_colleges_email ON public.ayush_colleges(college_email);
      `);

    // Explicitly Commit DDL
    await client.query("COMMIT");
    await client.query("BEGIN");

    // 1. Check if college already exists
    const existing = await client.query(
      `SELECT id FROM public.ayush_colleges WHERE LOWER(college_email) = LOWER($1)`,
      [collegeEmail]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "College with this email already exists" });
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert into ayush_colleges
    const insertQuery = `
          INSERT INTO public.ayush_colleges (
              college_name,
              college_type,
              university_affiliation,
              college_code,
              establishment_year,
              college_email,
              college_phone,
              website_url,
              state,
              district,
              block_tehsil,
              address,
              pincode,
              principal_name,
              principal_email,
              principal_phone,
              naac_status,
              naac_grade,
              cgpa,
              naac_valid_upto,
              naac_cycle,
              university_reg_number,
              aishe_code,
              mis_id,
              password_hash
          ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
          ) RETURNING id
      `;

    const values = [
      collegeName,
      collegeType,
      affiliation,
      collegeCode,
      estYear ? parseInt(estYear) : null,
      collegeEmail,
      collegePhone,
      website,
      state,
      district,
      block,
      fullAddress,
      pin,
      principalName,
      principalEmail,
      principalPhone,
      naacStatus,
      naacGrade,
      cgpa ? parseFloat(cgpa) : null,
      validityDate ? new Date(validityDate) : null,
      cycle,
      univReg,
      aishe,
      misId,
      passwordHash
    ];

    const result = await client.query(insertQuery, values);
    const collegeId = result.rows[0].id;

    // ---------------------------------------------------------
    // 3b. Insert into college_naac_status (Sync with canonical table)
    // ---------------------------------------------------------
    await client.query(`
        INSERT INTO college_naac_status (
            college_id, current_status, cycle, grade, cgpa, valid_till, verified_by_admin
        ) VALUES ($1, $2, $3, $4, $5, $6, false)
        ON CONFLICT (college_id) DO UPDATE SET
            current_status = EXCLUDED.current_status,
            cycle = EXCLUDED.cycle,
            grade = EXCLUDED.grade,
            cgpa = EXCLUDED.cgpa,
            valid_till = EXCLUDED.valid_till
    `, [
      collegeId,
      naacStatus || 'Not Accredited',
      cycle || 'Cycle 1',
      naacGrade,
      cgpa ? parseFloat(cgpa) : null,
      validityDate ? new Date(validityDate) : null
    ]);

    // ---------------------------------------------------------
    // 3c. Handle NAAC Documents (Canonical: college_naac_documents)
    // ---------------------------------------------------------
    const files = req.files || {};
    // Maps field names from registerRoutes.js to Document Types
    const docMap = [
      { field: 'naacCertificate', type: 'NAAC_CERTIFICATE', name: 'NAAC Certificate' },
      { field: 'auditReport', type: 'AUDIT_REPORT', name: 'Audit Report' },
      { field: 'extraNaac', type: 'OTHER_NAAC', name: 'Additional NAAC Document' },
      { field: 'affiliationLetter', type: 'AFFILIATION', name: 'Affiliation Letter' },
      { field: 'trustCertificate', type: 'TRUST_CERT', name: 'Trust Certificate' },
      { field: 'digitalSign', type: 'SIGNATURE', name: 'Digital Signature' },
    ];

    try {
      for (const d of docMap) {
        if (files[d.field] && files[d.field][0]) {
          const file = files[d.field][0];
          const fileUrl = '/uploads/' + file.filename;

          // Ensure table exists (just in case migration didn't run yet, though it should have)
          await client.query(`
                    INSERT INTO college_naac_documents (
                        college_id, document_name, document_type, file_url, status, uploaded_at, related_phase
                    ) VALUES ($1, $2, $3, $4, 'Verified', NOW(), 'Registration')
                 `, [
            collegeId,
            d.name,
            d.type,
            fileUrl
          ]);
        }
      }
    } catch (docErr) {
      console.error("Error saving NAAC documents:", docErr);
      // Don't fail the whole registration for a document error, but maybe log it well.
      // Proceeding.
    }

    // 4. Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store in unified OTP table
    await client.query(
      `INSERT INTO verification_otps (account_type, account_id, otp, expires_at, is_used)
       VALUES ($1, $2, $3, $4, false)`,
      ['ayush_college', collegeId, otp, otpExpiresAt]
    );

    await client.query("COMMIT");

    // 5. Send OTP Email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: collegeEmail,
      subject: 'Verify Your Email - AYUSH Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AYUSH Portal</h2>
          <p>Hello ${collegeName},</p>
          <p>Thank you for registering your College.</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>AYUSH Portal Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('OTP sent to college:', collegeEmail);
    } catch (emailErr) {
      console.error("Failed to send College OTP email:", emailErr);
    }

    // Return success with email for OTP verification
    return res.status(201).json({
      success: true,
      message: "College registered successfully. Please check your email for OTP.",
      collegeId,
      email: collegeEmail
    });

  } catch (err) {
    console.error("Register College Error", err);
    try { await client.query("ROLLBACK"); } catch (e) { } // Handle rollback safely

    return res.status(500).json({ message: "Registration failed: " + err.message });
  } finally {
    client.release();
  }
}

async function registerResearchOrg(req, res) {
  const {
    applicantName,
    designation,
    organizationType,
    organizationName,
    district,
    workExperienceYears,
    email,
    contactNumber,
    registrationDocId,
    website,
    physicalAddress,
    latitude,
    longitude,
    projectsCompleted,
    fundingReceived,
    associationWithYoga,
    affiliations,
    password
  } = req.body;

  // Basic validation
  if (!applicantName || !designation || !organizationType || !organizationName || 
      !district || !workExperienceYears || !email || !contactNumber || 
      !registrationDocId || !physicalAddress || !latitude || !longitude || 
      !projectsCompleted || !fundingReceived || !associationWithYoga || !affiliations || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Process files
  const files = req.files || {};
  const regDocFile = files.orgRegDoc && files.orgRegDoc[0];
  if (!regDocFile) {
    return res.status(400).json({ message: "Organization registration document is required" });
  }
  const regDocPath = `/uploads/${regDocFile.filename}`;

  const relevantDocsPaths = (files.relevantDocs || []).map(f => `/uploads/${f.filename}`);

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check for existing user with same email/role (case-insensitive)
    const existingUser = await client.query(
      `SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1) AND role = $2`,
      [email, 'research_org']
    );

    let userId;

    if (existingUser.rows.length > 0) {
      const userRecord = existingUser.rows[0];

      if (userRecord.is_verified) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email already registered and verified. Please log in.",
        });
      }

      userId = userRecord.id;

      await client.query(
        `UPDATE users 
         SET full_name = $1, phone = $2, password_hash = $3 
         WHERE id = $4`,
        [applicantName, contactNumber, passwordHash, userId]
      );

      await client.query(`DELETE FROM research_org_profile WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM user_otps WHERE user_id = $1`, [userId]);
    } else {
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, LOWER($2), $3, $4, $5, $6)
         RETURNING id`,
        [applicantName, email, contactNumber, passwordHash, 'research_org', false]
      );
      userId = userResult.rows[0].id;
    }

    // Insert profile details
    await client.query(
      `INSERT INTO research_org_profile (
         user_id, applicant_name, designation, organization_type, organization_name,
         district, work_experience_years, email, contact_number,
         registration_doc_path, registration_doc_id, website, physical_address,
         latitude, longitude, projects_completed, funding_received,
         association_with_yoga, affiliations, relevant_docs_paths
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
       )`,
      [
        userId,
        applicantName,
        designation,
        organizationType,
        organizationName,
        district,
        parseInt(workExperienceYears) || 0,
        email,
        contactNumber,
        regDocPath,
        registrationDocId,
        website || null,
        physicalAddress,
        parseFloat(latitude) || 0,
        parseFloat(longitude) || 0,
        projectsCompleted,
        parseFloat(fundingReceived) || 0,
        associationWithYoga,
        affiliations,
        relevantDocsPaths
      ]
    );

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await client.query(
      `INSERT INTO user_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)`,
      [userId, otp, expiresAt]
    );

    // Send OTP Email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email for AYUSH Setu Registration",
      text: `Your OTP code for verification is: ${otp}. It is valid for 10 minutes.`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] OTP sent to', email, ':', info.response);
    } catch (mailErr) {
      console.error('[Email] Failed to send OTP to', email, ':', mailErr.message);
      // Do not block registration — OTP is already stored in DB
    }

    await client.query("COMMIT");
    client.release();

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      userId
    });

  } catch (error) {
    console.error("Error in registerResearchOrg:", error);
    await client.query("ROLLBACK");
    client.release();
    return res.status(500).json({ message: "Server error during registration." });
  }
}

async function registerDistrictOfficer(req, res) {
  const {
    district,
    fullName,
    designation,
    email,
    contactNumber,
    employeeId,
    idType,
    idNumber,
    password
  } = req.body;

  // Basic validation
  if (!district || !fullName || !designation || !email || !contactNumber || 
      !employeeId || !idType || !idNumber || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Process files
  const files = req.files || {};
  const idUploadFile = files.idUpload && files.idUpload[0];
  const authorityOrderFile = files.authorityOrder && files.authorityOrder[0];

  if (!idUploadFile || !authorityOrderFile) {
    return res.status(400).json({ message: "Both ID upload and Authority Order PDF are required" });
  }

  const idUploadPath = `/uploads/${idUploadFile.filename}`;
  const authorityOrderPath = `/uploads/${authorityOrderFile.filename}`;

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check for existing user with same email/role (case-insensitive)
    const existingUser = await client.query(
      `SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1) AND role = $2`,
      [email, 'district_officer']
    );

    let userId;

    if (existingUser.rows.length > 0) {
      const userRecord = existingUser.rows[0];

      if (userRecord.is_verified) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email already registered and verified. Please log in.",
        });
      }

      userId = userRecord.id;

      await client.query(
        `UPDATE users 
         SET full_name = $1, phone = $2, password_hash = $3 
         WHERE id = $4`,
        [fullName, contactNumber, passwordHash, userId]
      );

      await client.query(`DELETE FROM district_officer_profile WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM user_otps WHERE user_id = $1`, [userId]);
    } else {
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, LOWER($2), $3, $4, $5, $6)
         RETURNING id`,
        [fullName, email, contactNumber, passwordHash, 'district_officer', false]
      );
      userId = userResult.rows[0].id;
    }

    // Insert profile details
    await client.query(
      `INSERT INTO district_officer_profile (
         user_id, district, name, designation, email, contact_number,
         employee_id, id_type, id_number, id_upload_path, authority_order_path
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
       )`,
      [
        userId,
        district,
        fullName,
        designation,
        email,
        contactNumber,
        employeeId,
        idType,
        idNumber,
        idUploadPath,
        authorityOrderPath
      ]
    );

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await client.query(
      `INSERT INTO user_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)`,
      [userId, otp, expiresAt]
    );

    // Send OTP Email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email for AYUSH Setu Registration",
      text: `Your OTP code for verification is: ${otp}. It is valid for 10 minutes.`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] OTP sent to', email, ':', info.response);
    } catch (mailErr) {
      console.error('[Email] Failed to send OTP to', email, ':', mailErr.message);
      // Do not block registration — OTP is already stored in DB
    }

    await client.query("COMMIT");
    client.release();

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      userId
    });

  } catch (error) {
    console.error("Error in registerDistrictOfficer:", error);
    await client.query("ROLLBACK");
    client.release();
    return res.status(500).json({ message: "Server error during registration." });
  }
}

async function registerDirectorate(req, res) {
  const {
    fullName,
    designation,
    email,
    contactNumber,
    idType,
    idNumber,
    password
  } = req.body;

  // Basic validation
  if (!fullName || !designation || !email || !contactNumber || 
      !idType || !idNumber || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Process files
  const files = req.files || {};
  const idUploadFile = files.idUpload && files.idUpload[0];
  const authorityOrderFile = files.authorityOrder && files.authorityOrder[0];

  if (!idUploadFile || !authorityOrderFile) {
    return res.status(400).json({ message: "Both ID upload and Authority Order PDF are required" });
  }

  const idUploadPath = `/uploads/${idUploadFile.filename}`;
  const authorityOrderPath = `/uploads/${authorityOrderFile.filename}`;

  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Check for existing user with same email/role (case-insensitive)
    const existingUser = await client.query(
      `SELECT id, is_verified FROM users WHERE LOWER(email) = LOWER($1) AND role = $2`,
      [email, 'directorate']
    );

    let userId;

    if (existingUser.rows.length > 0) {
      const userRecord = existingUser.rows[0];

      if (userRecord.is_verified) {
        await client.query("ROLLBACK");
        client.release();
        return res.status(400).json({
          success: false,
          message: "Email already registered and verified. Please log in.",
        });
      }

      userId = userRecord.id;

      await client.query(
        `UPDATE users 
         SET full_name = $1, phone = $2, password_hash = $3 
         WHERE id = $4`,
        [fullName, contactNumber, passwordHash, userId]
      );

      await client.query(`DELETE FROM directorate_profile WHERE user_id = $1`, [userId]);
      await client.query(`DELETE FROM user_otps WHERE user_id = $1`, [userId]);
    } else {
      const userResult = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, is_verified)
         VALUES ($1, LOWER($2), $3, $4, $5, $6)
         RETURNING id`,
        [fullName, email, contactNumber, passwordHash, 'directorate', false]
      );
      userId = userResult.rows[0].id;
    }

    // Insert profile details
    await client.query(
      `INSERT INTO directorate_profile (
         user_id, nodal_officer_name, designation, email, contact_number,
         id_type, id_number, id_upload_path, authority_order_path
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9
       )`,
      [
        userId,
        fullName,
        designation,
        email,
        contactNumber,
        idType,
        idNumber,
        idUploadPath,
        authorityOrderPath
      ]
    );

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await client.query(
      `INSERT INTO user_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)`,
      [userId, otp, expiresAt]
    );

    // Send OTP Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your email for AYUSH Setu Registration",
      text: `Your OTP code for verification is: ${otp}. It is valid for 10 minutes.`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('[Email] OTP sent to', email, ':', info.response);
    } catch (mailErr) {
      console.error('[Email] Failed to send OTP to', email, ':', mailErr.message);
      // Do not block registration — OTP is already stored in DB
    }

    await client.query("COMMIT");
    client.release();

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      userId
    });

  } catch (error) {
    console.error("Error in registerDirectorate:", error);
    await client.query("ROLLBACK");
    client.release();
    return res.status(500).json({ message: "Server error during registration." });
  }
}

module.exports = {
  registerWellnessCentre,
  registerTrainingCentre,
  registerYogaProfessional,
  registerAyushCollege,
  registerResearchOrg,
  registerDistrictOfficer,
  registerDirectorate
};
