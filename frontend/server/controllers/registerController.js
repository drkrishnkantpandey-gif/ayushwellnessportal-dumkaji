const db = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
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
    centreType,
    ownershipType,
    registrationNumber,
    contactPerson,
    contactEmail,
    contactPhone,
    userType,
    password,
  } = req.body;

  if (!contactEmail || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (userType !== "wellness_centre") {
    return res.status(400).json({ message: "Invalid userType for this route" });
  }

  if (
    !centreName ||
    !centreType ||
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
          centre_type,
          ownership_type,
          registration_number,
          contact_person,
          contact_email,
          contact_phone
        )
        VALUES (
          $1, $2,
          'UNDER_REVIEW',
          NULL,
          NULL,
          'NOT_LISTED',
          NULL,
          NULL,
          $3, $4, $5, $6, $7, $8
        )
        RETURNING id`,
      [
        userId,
        centreName,
        centreType,
        ownershipType,
        registrationNumber,
        contactPerson,
        contactEmail,
        contactPhone,
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
        institution_type, address, city, state, pincode, 
        registration_number, registration_authority, description, 
        facilities, courses_offered, centre_photos
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
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
        message: `This ${field} is already registered. Please log in or use a different ${field}.`
      });
    }

    // More specific error messages
    if (error.code === '42703') { // Column does not exist
      return res.status(500).json({
        success: false,
        message: 'Database schema error. Please contact support.'
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. " + (error.message || "Please try again."),
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
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
    bio
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
        experience_years, bio, profile_photo, certificate_paths
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
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
        certificatePaths
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
        message: `This ${field} is already registered. Please log in or use a different ${field}.`
      });
    }

    if (error.code === '42703') { // Column does not exist
      return res.status(500).json({
        success: false,
        message: 'Database schema error. Please contact support.'
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration failed. " + (error.message || "Please try again."),
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  } finally {
    if (client) client.release();
  }
}

module.exports = {
  registerWellnessCentre,
  registerTrainingCentre,
  registerYogaProfessional
};
