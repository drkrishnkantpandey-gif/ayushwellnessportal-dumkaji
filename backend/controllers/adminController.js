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
      } else if (user.role === 'research_org') {
        const profileCheck = await db.query('SELECT registration_number FROM research_org_profile WHERE user_id = $1', [userId]);
        if (profileCheck.rows.length > 0) {
          let regNum = profileCheck.rows[0].registration_number;
          if (!regNum) {
            const seqRes = await db.query("SELECT nextval('seq_research_org_reg_serial') as seq");
            const serial = seqRes.rows[0].seq;
            regNum = `UK-RI-${String(serial).padStart(4, '0')}`;
            await db.query("UPDATE research_org_profile SET registration_number = $1, registration_status = 'approved' WHERE user_id = $2", [regNum, userId]);
          } else {
            await db.query("UPDATE research_org_profile SET registration_status = 'approved' WHERE user_id = $2", [userId]);
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
    console.error("Error in updateUserApproval:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const toggleCentreOperational = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_operational, district } = req.body;

    // Fetch the centre's district first to enforce district officers' boundaries
    const centreCheck = await db.query('SELECT district FROM training_centres WHERE user_id = $1', [userId]);
    if (centreCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Yoga Centre not found"
      });
    }

    const centreDistrict = centreCheck.rows[0].district;
    
    // Check if the user is a district officer and enforce match
    if (req.user.role === 'district_officer') {
      const officerDistrict = district || req.query.district;
      if (!officerDistrict) {
        return res.status(400).json({
          success: false,
          message: "Officer district parameter is required to verify ownership."
        });
      }
      if (centreDistrict !== officerDistrict) {
        return res.status(403).json({
          success: false,
          message: "You can only mark centres in your own district as operational"
        });
      }
    }

    const result = await db.query(
      `UPDATE training_centres 
       SET is_operational = $1, updated_at = NOW()
       WHERE user_id = $2
       RETURNING *`,
      [!!is_operational, userId]
    );

    return res.status(200).json({
      success: true,
      message: `Operational status updated to ${is_operational} successfully`,
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    // 1. Total users count
    const usersCountRes = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersCountRes.rows[0].count) || 0;

    // 2. Pending verifications count
    const pendingCountRes = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE registration_status IN ('pending', 'under_review', 'UNDER_REVIEW', 'PENDING')"
    );
    const pendingVerifications = parseInt(pendingCountRes.rows[0].count) || 0;

    // 3. Approved entities count
    const approvedEntitiesRes = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE registration_status = 'approved' AND role NOT IN ('admin', 'directorate')"
    );
    const totalEntities = parseInt(approvedEntitiesRes.rows[0].count) || 0;

    // 4. District wise stats
    const districtStatsQuery = `
      SELECT COALESCE(w.district, t.district, y.district, r.district) as district_name, COUNT(DISTINCT u.id) as count
      FROM users u
      LEFT JOIN wellness_centres w ON w.user_id = u.id
      LEFT JOIN training_centres t ON t.user_id = u.id
      LEFT JOIN yoga_professional_profile y ON y.user_id = u.id
      LEFT JOIN research_org_profile r ON r.user_id = u.id
      WHERE u.registration_status = 'approved' AND u.role NOT IN ('admin', 'directorate')
      GROUP BY district_name
      HAVING COALESCE(w.district, t.district, y.district, r.district) IS NOT NULL
    `;
    const districtStatsRes = await db.query(districtStatsQuery);
    const districtStats = districtStatsRes.rows.map(row => ({
      district: row.district_name,
      entities: parseInt(row.count) || 0,
      incentives: "₹0",
      pending: 0,
      officer: "Nodal Officer"
    }));

    // 5. Incentive Schemes Overview stats
    const schemesStats = [];
    
    // Yoga Trainer Fee Reimbursements
    const trainerFeeRes = await db.query(
      "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved, COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN amount END), 0) as amount FROM trainer_fee_reimbursements"
    );
    schemesStats.push({
      scheme: "Yoga Trainer Fee Reimbursement",
      totalApplications: parseInt(trainerFeeRes.rows[0].total) || 0,
      approved: parseInt(trainerFeeRes.rows[0].approved) || 0,
      amount: `₹${parseFloat(trainerFeeRes.rows[0].amount).toLocaleString("en-IN")}`,
      utilization: "0%"
    });

    // NAAC Accreditation Reimbursements
    const naacRes = await db.query(
      "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved, COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN claim_amount END), 0) as amount FROM naac_reimbursements"
    );
    schemesStats.push({
      scheme: "NAAC Accreditation Reimbursement",
      totalApplications: parseInt(naacRes.rows[0].total) || 0,
      approved: parseInt(naacRes.rows[0].approved) || 0,
      amount: `₹${parseFloat(naacRes.rows[0].amount).toLocaleString("en-IN")}`,
      utilization: "0%"
    });

    // NABH Accreditation Reimbursements
    const nabhRes = await db.query(
      "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved, COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN claim_amount END), 0) as amount FROM nabh_reimbursements"
    );
    schemesStats.push({
      scheme: "NABH Accreditation Reimbursement",
      totalApplications: parseInt(nabhRes.rows[0].total) || 0,
      approved: parseInt(nabhRes.rows[0].approved) || 0,
      amount: `₹${parseFloat(nabhRes.rows[0].amount).toLocaleString("en-IN")}`,
      utilization: "0%"
    });

    // Research Grants
    const researchRes = await db.query(
      "SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved, COALESCE(SUM(CASE WHEN status = 'APPROVED' THEN approved_amount END), 0) as amount FROM research_grants"
    );
    schemesStats.push({
      scheme: "Research & Development Grant",
      totalApplications: parseInt(researchRes.rows[0].total) || 0,
      approved: parseInt(researchRes.rows[0].approved) || 0,
      amount: `₹${parseFloat(researchRes.rows[0].amount).toLocaleString("en-IN")}`,
      utilization: "0%"
    });

    // 6. Entity overview by role/type
    const roleStatsQuery = `
      SELECT role, COUNT(*) as count, COUNT(CASE WHEN registration_status = 'approved' THEN 1 END) as active, COUNT(CASE WHEN registration_status IN ('pending', 'under_review', 'UNDER_REVIEW') THEN 1 END) as pending
      FROM users
      WHERE role NOT IN ('admin', 'directorate')
      GROUP BY role
    `;
    const roleStatsRes = await db.query(roleStatsQuery);
    const roleMap = {
      'wellness_centre': 'Wellness Centres',
      'yoga_centre': 'Yoga Centres',
      'yoga_professional': 'Yoga Professionals',
      'research_org': 'Research Institutions',
      'ayush_college': 'AYUSH Colleges',
      'ayush_hospital': 'AYUSH Hospitals'
    };
    const roleStats = roleStatsRes.rows.map(row => ({
      type: roleMap[row.role] || row.role,
      registered: parseInt(row.count) || 0,
      active: parseInt(row.active) || 0,
      pending: parseInt(row.pending) || 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        pendingVerifications,
        totalEntities,
        districtStats,
        schemesStats,
        roleStats
      }
    });

  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching stats"
    });
  }
};

module.exports = { getUserByModule, updateUserApproval, toggleCentreOperational, getDashboardStats };