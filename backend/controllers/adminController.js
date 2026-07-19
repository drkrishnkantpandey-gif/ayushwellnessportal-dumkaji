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
      "SELECT COUNT(*) as count FROM users WHERE registration_status IN ('approved', 'APPROVED') AND role NOT IN ('admin', 'directorate')"
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
      WHERE u.registration_status IN ('approved', 'APPROVED') AND u.role NOT IN ('admin', 'directorate')
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
      SELECT role, COUNT(*) as count, COUNT(CASE WHEN registration_status IN ('approved', 'APPROVED') THEN 1 END) as active, COUNT(CASE WHEN registration_status IN ('pending', 'PENDING', 'under_review', 'UNDER_REVIEW') THEN 1 END) as pending
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

const getPendingRegistrations = async (req, res) => {
  const requesterId = req.user.id || req.user.userId;
  const requesterRole = req.user.role;
  const filterStatus = req.query.status || 'pending';

  let statuses = "(u.registration_status IN ('pending', 'PENDING', 'under_review', 'UNDER_REVIEW') OR u.registration_status IS NULL)";
  if (filterStatus === 'approved') {
    statuses = "u.registration_status IN ('approved', 'APPROVED')";
  } else if (filterStatus === 'rejected') {
    statuses = "u.registration_status IN ('rejected', 'REJECTED')";
  }

  try {
    if (requesterRole === 'admin') {
      // Admin sees pending/processed Directorate users
      const query = `
        SELECT u.id, u.full_name, u.email, u.phone, u.role, u.registration_status, u.created_at,
               dp.designation, dp.id_type, dp.id_number, dp.id_upload_path, dp.authority_order_path
        FROM users u
        LEFT JOIN directorate_profile dp ON dp.user_id = u.id
        WHERE u.role = 'directorate' AND ${statuses}
        ORDER BY u.created_at DESC
      `;
      const { rows } = await db.query(query);
      return res.status(200).json({ success: true, data: rows });

    } else if (requesterRole === 'directorate') {
      // Directorate sees pending/processed District Officers, Colleges, Research Orgs, plus other entities
      const query = `
        SELECT u.id, u.full_name, u.email, u.phone, u.role, u.registration_status, u.created_at,
               COALESCE(w.district, t.district, y.district, r.district, c.city, h.district, dop.district) as district,
               dop.employee_id, dop.designation, dop.id_type, dop.id_number, dop.id_upload_path, dop.authority_order_path,
               t.applicant_name as tc_applicant_name, t.designation as tc_designation, t.entity_type as tc_entity_type,
               t.entity_certificate_path as tc_entity_certificate, t.already_operating as tc_already_operating,
               t.other_business as tc_other_business, t.operational_business_name as tc_operational_business_name,
               t.operational_business_reg_number as tc_operational_business_reg_number,
               t.operational_business_certificate_path as tc_operational_business_certificate,
               t.id_proof_type as tc_id_proof_type, t.id_proof_number as tc_id_proof_number,
               t.id_proof_path as tc_id_proof_path, t.gps_coordinates as tc_gps_coordinates, t.website as tc_website,
               t.address as tc_address,
               r.applicant_name as ro_applicant_name, r.designation as ro_designation, r.organization_type as ro_organization_type,
               r.organization_name as ro_organization_name, r.work_experience_years as ro_work_experience_years,
               r.email as ro_email, r.contact_number as ro_contact_number, r.registration_doc_path as ro_registration_doc_path,
               r.registration_doc_id as ro_registration_doc_id, r.website as ro_website, r.physical_address as ro_physical_address,
               r.latitude as ro_latitude, r.longitude as ro_longitude, r.projects_completed as ro_projects_completed,
               r.funding_received as ro_funding_received, r.association_with_yoga as ro_association_with_yoga,
               r.affiliations as ro_affiliations, r.relevant_docs_paths as ro_relevant_docs_paths,
               w.applicant_name as wc_applicant_name, w.designation as wc_designation, w.entity_type as wc_entity_type,
               w.entity_certificate as wc_entity_certificate, w.id_proof_file as wc_id_proof_file, w.address as wc_address
        FROM users u
        LEFT JOIN wellness_centres w ON w.user_id = u.id
        LEFT JOIN training_centres t ON t.user_id = u.id
        LEFT JOIN yoga_professional_profile y ON y.user_id = u.id
        LEFT JOIN research_org_profile r ON r.user_id = u.id
        LEFT JOIN ayush_colleges c ON c.id = u.id
        LEFT JOIN ayush_hospitals h ON h.user_id = u.id
        LEFT JOIN district_officer_profile dop ON dop.user_id = u.id
        WHERE u.role NOT IN ('admin', 'directorate') AND ${statuses}
        ORDER BY u.created_at DESC
      `;
      const { rows } = await db.query(query);
      return res.status(200).json({ success: true, data: rows });

    } else if (requesterRole === 'district_officer') {
      // Find officer's district
      const officerCheck = await db.query('SELECT district FROM district_officer_profile WHERE user_id = $1', [requesterId]);
      if (officerCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'District Officer profile not found' });
      }
      const officerDistrict = officerCheck.rows[0].district;

      // District Officer sees pending/processed wellness_centre, yoga_centre, yoga_professional, ayush_hospital in their district
      const query = `
        SELECT u.id, u.full_name, u.email, u.phone, u.role, u.registration_status, u.created_at,
               COALESCE(w.district, t.district, y.district, h.district) as district,
               t.applicant_name as tc_applicant_name, t.designation as tc_designation, t.entity_type as tc_entity_type,
               t.entity_certificate_path as tc_entity_certificate, t.already_operating as tc_already_operating,
               t.other_business as tc_other_business, t.operational_business_name as tc_operational_business_name,
               t.operational_business_reg_number as tc_operational_business_reg_number,
               t.operational_business_certificate_path as tc_operational_business_certificate,
               t.id_proof_type as tc_id_proof_type, t.id_proof_number as tc_id_proof_number,
               t.id_proof_path as tc_id_proof_path, t.gps_coordinates as tc_gps_coordinates, t.website as tc_website,
               t.address as tc_address,
               w.applicant_name as wc_applicant_name, w.designation as wc_designation, w.entity_type as wc_entity_type,
               w.entity_certificate as wc_entity_certificate, w.id_proof_file as wc_id_proof_file, w.address as wc_address
        FROM users u
        LEFT JOIN wellness_centres w ON w.user_id = u.id
        LEFT JOIN training_centres t ON t.user_id = u.id
        LEFT JOIN yoga_professional_profile y ON y.user_id = u.id
        LEFT JOIN ayush_hospitals h ON h.user_id = u.id
        WHERE u.role IN ('wellness_centre', 'yoga_centre', 'yoga_professional', 'ayush_hospital')
          AND COALESCE(w.district, t.district, y.district, h.district) = $1
          AND ${statuses}
        ORDER BY u.created_at DESC
      `;
      const { rows } = await db.query(query, [officerDistrict]);
      return res.status(200).json({ success: true, data: rows });

    } else {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching registrations' });
  }
};

const approveUserRegistration = async (req, res) => {
  const requesterId = req.user.id || req.user.userId;
  const requesterRole = req.user.role;
  const { targetUserId } = req.params;
  const { decision } = req.body; // 'approved' or 'rejected'

  if (!decision || !['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
  }

  try {
    // 1. Fetch target user
    const targetUserCheck = await db.query('SELECT id, role, full_name, email FROM users WHERE id = $1', [targetUserId]);
    if (targetUserCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }
    const targetUser = targetUserCheck.rows[0];

    // 2. Authorisation checks based on rules
    if (targetUser.role === 'directorate') {
      if (requesterRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only System Admin can approve Directorate users' });
      }
    } else if (targetUser.role === 'district_officer') {
      if (requesterRole !== 'directorate') {
        return res.status(403).json({ success: false, message: 'Only Directorate Nodal Officers can approve District users' });
      }
    } else if (['ayush_college', 'research_org'].includes(targetUser.role)) {
      if (requesterRole !== 'directorate') {
        return res.status(403).json({ success: false, message: 'Only Directorate Nodal Officers can approve AYUSH Colleges or Research Institutions' });
      }
    } else if (['wellness_centre', 'yoga_centre', 'yoga_professional', 'ayush_hospital'].includes(targetUser.role)) {
      if (requesterRole === 'district_officer') {
        // District Officer: verify target district matches officer's district
        const officerCheck = await db.query('SELECT district FROM district_officer_profile WHERE user_id = $1', [requesterId]);
        if (officerCheck.rows.length === 0) {
          return res.status(400).json({ success: false, message: 'District Officer profile not found' });
        }
        const officerDistrict = officerCheck.rows[0].district;

        // Fetch target district
        const targetDistrictCheck = await db.query(`
          SELECT COALESCE(w.district, t.district, y.district, h.district) as district
          FROM users u
          LEFT JOIN wellness_centres w ON w.user_id = u.id
          LEFT JOIN training_centres t ON t.user_id = u.id
          LEFT JOIN yoga_professional_profile y ON y.user_id = u.id
          LEFT JOIN ayush_hospitals h ON h.user_id = u.id
          WHERE u.id = $1
        `, [targetUserId]);

        if (targetDistrictCheck.rows.length === 0 || targetDistrictCheck.rows[0].district !== officerDistrict) {
          return res.status(403).json({ success: false, message: 'You can only approve entities registered in your assigned district' });
        }
      } else if (requesterRole !== 'directorate') {
        return res.status(403).json({ success: false, message: 'Only District Officers or Directorate can approve this entity' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid target user role for approval' });
    }

    // 3. Perform approval update
    await db.query('BEGIN');
    
    // Update users table status
    await db.query(
      "UPDATE users SET registration_status = $1, is_verified = true WHERE id = $2",
      [decision, targetUserId]
    );

    // Sync status with profile tables
    const targetRole = targetUser.role;
    if (targetRole === 'wellness_centre') {
      await db.query("UPDATE wellness_centres SET registration_status = $1 WHERE user_id = $2", [decision === 'approved' ? 'approved' : 'rejected', targetUserId]);
    } else if (targetRole === 'yoga_centre') {
      await db.query("UPDATE training_centres SET is_operational = $1 WHERE user_id = $2", [decision === 'approved', targetUserId]);
    } else if (targetRole === 'yoga_professional') {
      await db.query("UPDATE yoga_professional_profile SET approval_status = $1 WHERE user_id = $2", [decision === 'approved' ? 'APPROVED' : 'REJECTED', targetUserId]);
    } else if (targetRole === 'research_org') {
      await db.query("UPDATE research_org_profile SET registration_status = $1 WHERE user_id = $2", [decision === 'approved' ? 'approved' : 'rejected', targetUserId]);
    } else if (targetRole === 'ayush_college') {
      await db.query("UPDATE ayush_colleges SET naac_status = $1 WHERE id = $2", [decision === 'approved' ? 'Accredited' : 'Not Accredited', targetUserId]);
    }

    await db.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `User registration has been successfully ${decision}`
    });

  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Error in approveUserRegistration:', error);
    return res.status(500).json({ success: false, message: 'Server error processing approval' });
  }
};

// One-time data fix: set all users with NULL registration_status to 'pending'
// so they appear in the approval dashboards. Call via POST /api/admin/fix-null-statuses (admin only)
const fixNullRegistrationStatuses = async (req, res) => {
  try {
    const result = await db.query(`
      UPDATE users
      SET registration_status = 'pending'
      WHERE registration_status IS NULL
        AND role NOT IN ('admin')
      RETURNING id, email, role, registration_status
    `);
    return res.status(200).json({
      success: true,
      message: `Fixed ${result.rows.length} users with NULL registration_status → 'pending'`,
      fixed: result.rows
    });
  } catch (error) {
    console.error('Error in fixNullRegistrationStatuses:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getUserByModule, updateUserApproval, toggleCentreOperational, getDashboardStats, getPendingRegistrations, approveUserRegistration, fixNullRegistrationStatuses };