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

    const query = `
      UPDATE users
      SET registration_status = $1
      WHERE id = $2
      RETURNING id, full_name, email, role, registration_status
    `;

    const { rows } = await db.query(query, [registration_status, userId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

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