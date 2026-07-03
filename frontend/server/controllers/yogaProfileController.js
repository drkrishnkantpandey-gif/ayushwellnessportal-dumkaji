const db = require('../db');

/**
 * Get detailed profile for Yoga Professional
 */
exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(`
      SELECT 
        u.full_name as "fullName",
        u.email,
        u.phone,
        u.aadhaar_number as "aadhaar",
        u.pan_number as "pan",
        p.dob,
        p.gender,
        p.address,
        p.city,
        p.state,
        p.district,
        p.pincode,
        u.qualification,
        p.experience_years,
        p.teaching_category,
        p.specialization,
        p.bio,
        p.bank_name,
        p.bank_account_no,
        p.bank_ifsc,
        p.profile_photo,
        p.degree_certificate_path as "certificate_file",
        p.govt_id_proof_path as "id_proof_file",
        p.approval_status,
        p.profile_locked
      FROM users u
      LEFT JOIN yoga_professional_profile p ON u.id = p.user_id
      WHERE u.id = $1
    `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Update profile for Yoga Professional
 */
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        fullName, dob, gender, address, city, state, district, pincode,
        qualification, experience_years, teaching_category, specialization, bio,
        aadhaar, pan, bank_name, bank_account_no, bank_ifsc
    } = req.body;

    // Handle multiple file uploads
    const files = req.files || {};
    const profilePhoto = files['profilePhoto'] ? files['profilePhoto'][0].path : null;
    const certificateFile = files['certificateFile'] ? files['certificateFile'][0].path : null;
    const idProofFile = files['idProofFile'] ? files['idProofFile'][0].path : null;

    try {
        await db.query('BEGIN');

        // 1. Update users table (including Identity Info)
        await db.query(`
            UPDATE users 
            SET full_name = $1, qualification = $2, aadhaar_number = $3, pan_number = $4 
            WHERE id = $5`,
            [fullName, qualification, aadhaar, pan, userId]
        );

        // 2. Update profile table
        let query = `
      UPDATE yoga_professional_profile SET
        dob = $1, gender = $2, address = $3, city = $4, state = $5, district = $6, 
        pincode = $7, experience_years = $8, 
        teaching_category = $9, specialization = $10, bio = $11,
        bank_name = $12, bank_account_no = $13, bank_ifsc = $14
    `;

        const params = [
            dob, gender, address, city, state, district, pincode,
            experience_years, teaching_category, specialization, bio,
            bank_name, bank_account_no, bank_ifsc
        ];

        let paramCount = params.length;

        if (profilePhoto) {
            paramCount++;
            query += `, profile_photo = $${paramCount}`;
            params.push(profilePhoto);
        }

        if (certificateFile) {
            paramCount++;
            query += `, degree_certificate_path = $${paramCount}`;
            params.push(certificateFile);
        }

        if (idProofFile) {
            paramCount++;
            query += `, govt_id_proof_path = $${paramCount}`;
            params.push(idProofFile);
        }

        paramCount++;
        query += `, updated_at = NOW() WHERE user_id = $${paramCount}`;
        params.push(userId);

        await db.query(query, params);

        await db.query('COMMIT');
        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};
