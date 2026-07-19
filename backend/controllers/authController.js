const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Generate random 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const registerUser = async (req, res) => {
  const client = await pool.connect();

  try {
    let {
      fullName,
      email,
      phone,
      password,
      userType: role,
    } = req.body;

    // Handle AYUSH College specific field names from frontend
    if (role === 'ayush_college') {
      fullName = fullName || req.body.collegeName;
      email = email || req.body.collegeEmail;
      phone = phone || req.body.collegePhone;
    }

    if (!email || !password || !role || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: fullName, email, password, and userType',
      });
    }

    console.log('Registration attempt:', { email, role });

    // 1. Check if user already exists (case-insensitive)
    const normalizedEmail = email.trim().toLowerCase();
    const userCheck = await client.query(
      'SELECT id, is_verified, role FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    let existingUser = userCheck.rows[0];

    // If user exists and is verified, it's a real conflict
    if (existingUser && existingUser.is_verified) {
      console.log('User already exists and verified:', normalizedEmail);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists and is verified. Please log in.',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Start transaction
    await client.query('BEGIN');

    try {
      let userId;

      if (existingUser) {
        // Retry/Resume logic: Update existing unverified user
        userId = existingUser.id;
        console.log('Updating existing unverified user:', normalizedEmail);

        await client.query(
          `UPDATE users SET 
            full_name = $1, 
            phone = $2, 
            password_hash = $3, 
            role = $4,
            updated_at = NOW()
           WHERE id = $5`,
          [fullName, phone, hashedPassword, role, userId]
        );

        // Clear previous state for this user to ensure clean retry
        await client.query('DELETE FROM user_otps WHERE user_id = $1', [userId]);

        // If it was/is a college, clean previous college entry to avoid conflicts
        await client.query('DELETE FROM ayush_colleges WHERE id = $1', [userId]);

      } else {
        // New user registration
        const newUser = await client.query(
          `INSERT INTO users (
            full_name, 
            email, 
            phone, 
            password_hash, 
            role, 
            is_verified,
            registration_status
          ) VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
          RETURNING id`,
          [fullName, normalizedEmail, phone, hashedPassword, role, true]
        );
        userId = newUser.rows[0].id;
      }

      // If AYUSH College, also insert into ayush_colleges table
      if (role === 'ayush_college') {
        console.log('Populating ayush_colleges table for:', normalizedEmail);
        await client.query(
          `INSERT INTO ayush_colleges (
            id, 
            college_name, 
            college_email, 
            password_hash
          ) VALUES ($1, $2, $3, $4)`,
          [userId, fullName, normalizedEmail, hashedPassword]
        );
      }

      // Store OTP
      await client.query(
        `INSERT INTO user_otps (
          user_id, 
          otp, 
          expires_at, 
          is_used
        ) VALUES ($1, $2, $3, $4)`,
        [userId, otp, otpExpiresAt, false]
      );

      // Commit transaction
      await client.query('COMMIT');
      console.log('Registration DB operations successful:', normalizedEmail);

      // Send verification email (Gracefully - don't fail registration if email fails)
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: normalizedEmail,
        subject: 'Verify Your Email - AYUSH Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to AYUSH Portal</h2>
            <p>Hello ${fullName},</p>
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
        await sendMail(mailOptions);
        console.log('Verification email sent to:', normalizedEmail);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // We continue because the account is created and user can resend OTP
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful.',
        user: {
          id: userId,
          email: normalizedEmail,
          role: role,
          is_verified: true
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Registration transaction error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};


// Verify OTP
const verifyOTP = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, otp } = req.body;
    console.log('OTP verification attempt:', { email, otp });

    // Start transaction
    await client.query('BEGIN');

    try {
      // Find user by email (case-insensitive) with FOR UPDATE to lock the row
      const user = await client.query(
        'SELECT id, email, is_verified FROM users WHERE LOWER(email) = LOWER($1) FOR UPDATE',
        [email]
      );

      if (user.rows.length === 0) {
        console.log('User not found:', email);
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user is already verified
      if (user.rows[0].is_verified) {
        console.log('User already verified:', email);
        await client.query('COMMIT');
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }

      // Find valid OTP
      const otpRecord = await client.query(
        `SELECT id, user_id, expires_at, is_used 
         FROM user_otps 
         WHERE user_id = $1 AND otp = $2 
         AND is_used = false AND expires_at > NOW() 
         ORDER BY created_at DESC 
         LIMIT 1 FOR UPDATE`,
        [user.rows[0].id, otp]
      );

      if (otpRecord.rows.length === 0) {
        console.log('Invalid or expired OTP for user:', email);
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP',
        });
      }

      // Mark OTP as used
      await client.query(
        'UPDATE user_otps SET is_used = true WHERE id = $1',
        [otpRecord.rows[0].id]
      );

      // Mark user as verified
      await client.query(
        'UPDATE users SET is_verified = true WHERE id = $1',
        [user.rows[0].id]
      );

      // Commit the transaction
      await client.query('COMMIT');
      console.log('Email verified successfully:', email);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('OTP verification transaction error:', error);
      throw error;
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;
    console.log('Resend OTP request for:', email);

    // Find user by email (case-insensitive)
    const user = await client.query(
      'SELECT id, email, is_verified FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (user.rows.length === 0) {
      console.log('User not found for OTP resend:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is already verified
    if (user.rows[0].is_verified) {
      console.log('User already verified, cannot resend OTP:', email);
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Invalidate previous OTPs
    await client.query(
      'UPDATE user_otps SET is_used = true WHERE user_id = $1',
      [user.rows[0].id]
    );

    // Store new OTP
    await client.query(
      'INSERT INTO user_otps (user_id, otp, expires_at, is_used) VALUES ($1, $2, $3, false)',
      [user.rows[0].id, otp, otpExpiresAt]
    );

    // Get user's full name for email
    const userResult = await client.query(
      'SELECT full_name FROM users WHERE id = $1',
      [user.rows[0].id]
    );
    const fullName = userResult.rows[0].full_name;

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'New Verification Code - AYUSH Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Verification Code</h2>
          <p>Hello ${fullName},</p>
          <p>Your new verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px;">
            <strong>${otp}</strong>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please contact support.</p>
          <p>Best regards,<br>AYUSH Portal Team</p>
        </div>
      `,
    };

    await sendMail(mailOptions);
    console.log('New OTP sent to:', email);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Login user
const loginUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, password, role } = req.body;
    console.log('Login attempt:', { email, role });

    // Validate input
    if (!email || !password || !role) {
      console.log('Missing fields:', {
        email,
        password: password ? '***' : 'missing',
        role
      });
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role',
      });
    }

    let user;
    let userResult;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.trim().toLowerCase();

    // 1. Initial check in users table to identify the user and their actual role
    const globalUserCheck = await client.query(
      'SELECT id, email, password_hash, role, is_verified, registration_status, full_name FROM users WHERE LOWER(TRIM(email)) = $1',
      [normalizedEmail]
    );

    if (globalUserCheck.rows.length === 0) {
      console.log('User not found in users table:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or user not registered',
      });
    }

    const dbUser = globalUserCheck.rows[0];
    const dbRole = dbUser.role ? dbUser.role.toLowerCase() : '';

    // 2. Check for role mismatch
    if (dbRole !== normalizedRole) {
      console.log('Role mismatch:', { provided: normalizedRole, database: dbRole });
      return res.status(401).json({
        success: false,
        message: `Account found, but it is registered as ${dbRole.replace('_', ' ')}. Please select the correct role.`,
      });
    }

    // 3. User type specific fetching
    if (normalizedRole === 'ayush_college') {
      console.log('Searching in ayush_colleges for email:', normalizedEmail);
      userResult = await client.query(
        'SELECT id, college_email as email, password_hash, college_name as full_name FROM ayush_colleges WHERE id = $1',
        [dbUser.id]
      );

      if (userResult.rows.length > 0) {
        user = userResult.rows[0];
      } else if (dbUser.is_verified) {
        // SELF-HEALING: If verified in users but missing in ayush_colleges, heal it
        console.log('Self-healing missing ayush_colleges record for verified user:', dbUser.id);
        await client.query(
          'INSERT INTO ayush_colleges (id, college_name, college_email, password_hash) VALUES ($1, $2, $3, $4)',
          [dbUser.id, dbUser.full_name, dbUser.email, dbUser.password_hash]
        );
        user = {
          id: dbUser.id,
          email: dbUser.email,
          password_hash: dbUser.password_hash,
          full_name: dbUser.full_name
        };
      }

      if (user) {
        user.role = 'ayush_college';
        user.is_verified = true;
      }
    } else if (normalizedRole === 'wellness_centre') {
      console.log('Searching in wellness_centres for user_id:', dbUser.id);
      userResult = await client.query(
        'SELECT id, name as full_name, contact_email as email, registration_status FROM wellness_centres WHERE user_id = $1',
        [dbUser.id]
      );

      if (userResult.rows.length > 0) {
        const centreProfile = userResult.rows[0];
        user = {
          ...dbUser,
          centre_id: centreProfile.id,
          registration_status: centreProfile.registration_status,
          role: 'wellness_centre'
        };
      } else if (dbUser.is_verified) {
        // SELF-HEALING: Create basic profile if missing
        const newCentre = await client.query(
          `INSERT INTO wellness_centres (user_id, name, contact_email, registration_status, centre_type, ownership_type, registration_number)
           VALUES ($1, $2, $3, 'UNDER_REVIEW', 'MIXED', 'PRIVATE', 'PENDING')
           RETURNING id`,
          [dbUser.id, dbUser.full_name, dbUser.email]
        );
        user = { ...dbUser, role: 'wellness_centre' };
      }
    } else {
      user = { ...dbUser, role: dbRole };
    }

    console.log('Database query result:', user ? `User found (ID: ${user.id})` : 'User not found or inaccessible');

    if (!user) {
      console.log('User not found or role mismatch:', { email: normalizedEmail, role });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or user not registered with this role',
      });
    }


    console.log('User found:', {

      id: user.id,
      email: user.email,
      role: user.role,
      is_verified: user.is_verified
    });

    // email verification check (from users table)
if (!user.is_verified) {
  return res.status(403).json({
    success: false,
    message: "Please verify your email before logging in"
  });
}

// admin approval check
if (dbUser.registration_status !== 'approved') {
  return res.status(403).json({
    success: false,
    message:
      dbUser.registration_status === 'pending'
        ? "Your account is under admin review. Please wait for approval."
        : "Your registration has been rejected. Please contact support."
  });
}

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Password comparison result for', normalizedEmail, ':', isPasswordValid ? 'Valid' : 'Invalid');

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );
    console.log('Generated token for user:', user.email);

    // Fix #6: set token as httpOnly cookie so JS cannot read it
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure:   isProduction,          // HTTPS-only in production
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove sensitive data before sending user data
    const { password_hash, ...userData } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      // token still returned for backward-compat with components using Authorization header;
      // will be removed in a future cleanup once all clients use the cookie
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Logout — clear httpOnly cookie (fix #6)
const logoutUser = (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.status(200).json({ success: true, message: 'Logout successful' });
};

const getUserProfile = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const client = await pool.connect();
  try {
    const userRes = await client.query(
      `SELECT u.id, u.email, u.full_name, u.role, dop.district,
              COALESCE(
                u.phone,
                w.contact_phone,
                t.phone,
                y.phone,
                r.contact_number,
                c.phone,
                h.contact_mobile,
                dop.contact_number,
                dp.contact_number
              ) as phone
       FROM users u
       LEFT JOIN district_officer_profile dop ON dop.user_id = u.id
       LEFT JOIN wellness_centres w ON w.user_id = u.id
       LEFT JOIN training_centres t ON t.user_id = u.id
       LEFT JOIN yoga_professional_profile y ON y.user_id = u.id
       LEFT JOIN research_org_profile r ON r.user_id = u.id
       LEFT JOIN ayush_colleges c ON c.id = u.id
       LEFT JOIN ayush_hospitals h ON h.user_id = u.id
       LEFT JOIN directorate_profile dp ON dp.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: userRes.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  } finally {
    client.release();
  }
};

const updateUserProfile = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { fullName, phone, password } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ success: false, message: 'Name and Phone are required' });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Fetch the user's role to sync with profile table
    const userRes = await client.query('SELECT role FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const role = userRes.rows[0].role;

    // Build update query for users table
    let updateQuery;
    let params;
    if (password && password.trim() !== '') {
      // Validate password strength
      if (password.length < 8) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
      }
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        });
      }

      const passwordHash = await bcrypt.hash(password.trim(), 10);
      updateQuery = 'UPDATE users SET full_name = $1, phone = $2, password_hash = $3 WHERE id = $4';
      params = [fullName.trim(), phone.trim(), passwordHash, userId];
    } else {
      updateQuery = 'UPDATE users SET full_name = $1, phone = $2 WHERE id = $3';
      params = [fullName.trim(), phone.trim(), userId];
    }

    await client.query(updateQuery, params);

    // Sync with corresponding profile table based on role
    if (role === 'wellness_centre') {
      await client.query('UPDATE wellness_centres SET name = $1, contact_phone = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'yoga_centre') {
      await client.query('UPDATE training_centres SET name = $1, phone = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'yoga_professional') {
      await client.query('UPDATE yoga_professional_profile SET name = $1, phone = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'research_org') {
      await client.query('UPDATE research_org_profile SET applicant_name = $1, contact_number = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'ayush_college') {
      await client.query('UPDATE ayush_colleges SET college_name = $1, phone = $2 WHERE id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'ayush_hospital') {
      await client.query('UPDATE ayush_hospitals SET hospital_name = $1, contact_mobile = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'district_officer') {
      await client.query('UPDATE district_officer_profile SET name = $1, contact_number = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    } else if (role === 'directorate') {
      await client.query('UPDATE directorate_profile SET name = $1, contact_number = $2 WHERE user_id = $3', [fullName.trim(), phone.trim(), userId]);
    }

    await client.query("COMMIT");
    return res.status(200).json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  } finally {
    client.release();
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
};