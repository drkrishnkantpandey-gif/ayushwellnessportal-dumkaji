const db = require("../db");

const getUserByModule = async (req, res) => {
  try {
    const { module } = req.params;

    if (!module) {
      return res.status(400).json({
        success: false,
        message: "Module (role) is required"
      });
    }

    const query = `
      SELECT 
        id,
        full_name,
        email,
        phone,
        role,
        is_verified,
        created_at,
        updated_at,
        aadhaar_number,
        pan_number,
        qualification,
        registration_status
      FROM users
      WHERE role = $1
    `;

    const { rows } = await db.query(query, [module]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const updateUserApproval = async (req, res) => {
  try {
    const { userId } = req.params;
    const { registration_status } = req.body;

    // ✅ Validate input
    const allowedStatus = ['approved', 'rejected'];

    if (!registration_status || !allowedStatus.includes(registration_status)) {
      return res.status(400).json({
        success: false,
        message: "registration_status must be 'approved' or 'rejected'"
      });
    }

    // Get user details
    const userCheck = await db.query('SELECT role, registration_status FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const user = userCheck.rows[0];

    // Allocate registration number if approved
    if (registration_status === 'approved' && user.registration_status !== 'approved') {
      if (user.role === 'yoga_professional') {
        const profileCheck = await db.query('SELECT registration_number FROM yoga_professional_profile WHERE user_id = $1', [userId]);
        if (profileCheck.rows.length > 0) {
          let regNum = profileCheck.rows[0].registration_number;
          if (!regNum) {
            const seqRes = await db.query("SELECT nextval('seq_yoga_professional_reg_serial') as seq");
            const serial = seqRes.rows[0].seq;
            regNum = `UK-YP-${String(serial).padStart(4, '0')}`;
            await db.query('UPDATE yoga_professional_profile SET registration_number = $1 WHERE user_id = $2', [regNum, userId]);
          }
        }
      } else if (user.role === 'wellness_centre') {
        const centreCheck = await db.query('SELECT registration_number, entity_type, services FROM wellness_centres WHERE user_id = $1', [userId]);
        if (centreCheck.rows.length > 0) {
          let regNum = centreCheck.rows[0].registration_number;
          const entityType = centreCheck.rows[0].entity_type;
          const services = centreCheck.rows[0].services;
          if (!regNum) {
            const seqRes = await db.query("SELECT nextval('seq_wellness_centre_reg_serial') as seq");
            const serial = seqRes.rows[0].seq;

            let mid = 'WC';
            if (entityType === 'WELLNESS_CENTRE_HOSPITAL') mid = 'WH';
            else if (entityType === 'WELLNESS_RESORT') mid = 'WR';

            let serviceCode = '';
            const svcArray = Array.isArray(services) ? services : [];
            const upperSvcs = svcArray.map(s => s.trim().toUpperCase());
            if (upperSvcs.includes('PANCHKARMA')) serviceCode += 'P';
            if (upperSvcs.includes('YOGA')) serviceCode += 'Y';
            if (upperSvcs.includes('NATUROPATHY')) serviceCode += 'N';

            regNum = `UK-${mid}${serviceCode ? `-${serviceCode}` : ''}-${String(serial).padStart(4, '0')}`;
            await db.query("UPDATE wellness_centres SET registration_number = $1, registration_status = 'approved' WHERE user_id = $2", [regNum, userId]);
          } else {
            await db.query("UPDATE wellness_centres SET registration_status = 'approved' WHERE user_id = $2", [userId]);
          }
        }
      }
    }

    const query = `
      UPDATE users
      SET registration_status = $1
      WHERE id = $2
      RETURNING id, full_name, email, role, registration_status
    `;

    const { rows } = await db.query(query, [registration_status, userId]);

    return res.status(200).json({
      success: true,
      message: `User ${registration_status} successfully`,
      data: rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = { getUserByModule, updateUserApproval };