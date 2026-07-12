// controllers/yogaIncentiveController.js
const db = require('../db');

// Region-based subsidy: plain area 25%, hilly area 50%
const SUBSIDY_RATES = { PLAIN: 25, HILLY: 50 };

// Helper: get training_centre id for logged-in user
async function getCentreId(userId) {
  const r = await db.query('SELECT id FROM training_centres WHERE user_id = $1', [userId]);
  return r.rows[0]?.id || null;
}

// ── POST /api/training-centre/incentives ────────────────────────────────────
// Applicant submits a new incentive application
async function submitApplication(req, res) {
  try {
    const userId = req.user.userId;
    const centreId = await getCentreId(userId);

    // Limit check: A logged-in user can submit only one application at most.
    const existing = await db.query('SELECT id FROM yoga_incentive_applications WHERE user_id = $1', [userId]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'You have already submitted an incentive application. Only one application is allowed.' });
    }

    const {
      region,
      projectType, // Greenfield or Expansion
      proposedLocation,
      otherLocationName,
      gpsCoordinates,
      proposedCentreName,
      investmentAmount,
      eligibleAssetsAmount,
      applicantName,
      designation,
      entityType,
      mobileNumber,
      emailId,
      siteTotalArea,
      proposedConstructedArea,
      servicesOffered,
      tentativeEmployees,
      ycbCertifiedInstructors,
      clinicalServicesProvided,
      certifiedAyushDoctors,
      proposedSitePhoto
    } = req.body;

    if (!SUBSIDY_RATES[region]) {
      return res.status(400).json({ message: 'Invalid region. Use PLAIN or HILLY.' });
    }
    if (!projectType || !proposedCentreName || !investmentAmount || !eligibleAssetsAmount) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const totalInv = parseFloat(investmentAmount) || 0;
    const eligibleEca = parseFloat(eligibleAssetsAmount) || 0;

    if (eligibleEca > totalInv) {
      return res.status(400).json({ message: 'Eligible Capital Assets Amount cannot be greater than Total Investment Amount.' });
    }

    // Auto calculate subsidy with capping
    let subsidyPct = SUBSIDY_RATES[region];
    let subsidyAmount = 0;
    if (region === 'HILLY') {
      subsidyAmount = Math.min(eligibleEca * 0.50, 2000000); // 50% max 20 Lakh
    } else {
      subsidyAmount = Math.min(eligibleEca * 0.25, 1000000); // 25% max 10 Lakh
    }

    const incentiveType = projectType === 'Expansion' ? 'EXPANSION' : 'NEW_SETUP';

    // Generate UPN in format: UK-YMC-26-27-Serial Number
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const fyStart = currentMonth >= 3 ? currentYear : currentYear - 1;
    const fyEnd = fyStart + 1;
    const fyStr = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;

    const seqResult = await db.query('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM yoga_incentive_applications');
    const nextId = seqResult.rows[0].next_id;
    const upn = `UK-YMC-${fyStr}-${nextId.toString().padStart(4, '0')}`;

    const files = req.files || {};
    const filePath = (field) => files[field]?.[0]?.path || req.body[field] || null;

    const result = await db.query(
      `INSERT INTO yoga_incentive_applications
        (user_id, centre_id, region, subsidy_percentage,
         centre_name, district, investment_amount, claim_amount, subsidy_amount,
         project_type, upn, proposed_location, other_location_name, gps_coordinates,
         proposed_centre_name, eligible_assets_amount,
         applicant_name, designation, entity_type, mobile_number, email_id,
         site_total_area, proposed_constructed_area, services_offered, tentative_employees,
         ycb_certified_instructors, clinical_services_provided, certified_ayush_doctors, proposed_site_photo,
         doc_fire_safety, doc_udyog_reg, doc_gst_reg, doc_pollution_cert,
         doc_dpr, doc_ca_project_cost, doc_ca_eca, doc_land_document, doc_constitution,
         doc_entity_registration, doc_map_approval, doc_non_agri_land, doc_land_possession,
         doc_others, doc_affidavit, status, incentive_type)
       VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
         $22, $23, $24, $25, $26, $27, $28, $29,
         $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, 'SUBMITTED', $45
       )
       RETURNING *`,
      [
        userId, centreId, region, subsidyPct,
        proposedCentreName, district || null, totalInv, eligibleEca, subsidyAmount,
        projectType, upn, proposedLocation || null, otherLocationName || null, gpsCoordinates || null,
        proposedCentreName, eligibleEca,
        applicantName || null, designation || null, entityType || null, mobileNumber || null, emailId || null,
        parseFloat(siteTotalArea) || null, parseFloat(proposedConstructedArea) || null,
        servicesOffered || null, parseInt(tentativeEmployees, 10) || null,
        parseInt(ycbCertifiedInstructors, 10) || null, clinicalServicesProvided === 'true' || clinicalServicesProvided === true,
        parseInt(certifiedAyushDoctors, 10) || null, proposedSitePhoto || null,
        filePath('doc_fire_safety'), filePath('doc_udyog_reg'),
        filePath('doc_gst_reg'),     filePath('doc_pollution_cert'),
        filePath('doc_dpr'),         filePath('doc_ca_project_cost'), filePath('doc_ca_eca'),
        filePath('doc_land_document'),filePath('doc_constitution'),
        filePath('doc_entity_registration'), filePath('doc_map_approval'),
        filePath('doc_non_agri_land'), filePath('doc_land_possession'),
        filePath('doc_others'),
        filePath('doc_affidavit'),
        incentiveType
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitApplication error:', err);
    res.status(500).json({ message: 'Server error during submission.' });
  }
}

// ── GET /api/training-centre/incentives ─────────────────────────────────────
// Applicant views their own applications
async function getMyApplications(req, res) {
  try {
    const userId = req.user.userId;
    const result = await db.query(
      `SELECT * FROM yoga_incentive_applications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMyApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/incentives/district ──────────────────────────────────────
// District Officer: see all SUBMITTED applications for their district
async function getDistrictApplications(req, res) {
  try {
    const { district, status } = req.query;
    let query = `SELECT a.*, u.email as applicant_email, u.full_name as applicant_name
                 FROM yoga_incentive_applications a
                 JOIN users u ON u.id = a.user_id
                 WHERE a.status IN ('SUBMITTED','DISTRICT_UNDER_REVIEW')`;
    const params = [];
    if (district) { params.push(district); query += ` AND a.district = $${params.length}`; }
    query += ' ORDER BY a.created_at ASC';
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getDistrictApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/district/:id ───────────────────────────────────
// District Officer: approve or disapprove
async function districtDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body;  // decision: APPROVED | DISAPPROVED

    if (!['APPROVED', 'DISAPPROVED'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be APPROVED or DISAPPROVED.' });
    }

    const newStatus = decision === 'APPROVED' ? 'DISTRICT_APPROVED' : 'DISTRICT_DISAPPROVED';

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = $1, district_decision = $2, district_remarks = $3,
           district_reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [newStatus, decision, remarks || null, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('districtDecision error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/incentives/directorate ───────────────────────────────────
// Directorate: see all district-approved applications
async function getDirectorateApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT a.*, u.email as applicant_email, u.full_name as applicant_name
       FROM yoga_incentive_applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.status IN ('DISTRICT_APPROVED','DIRECTORATE_UNDER_REVIEW')
       ORDER BY a.district_reviewed_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getDirectorateApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/incentives/directorate/:id ────────────────────────────────
// Directorate: final approve or reject
async function directorateDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body;  // decision: APPROVED | REJECTED

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED.' });
    }

    const newStatus = decision === 'APPROVED' ? 'DIRECTORATE_APPROVED' : 'DIRECTORATE_REJECTED';

    const result = await db.query(
      `UPDATE yoga_incentive_applications
       SET status = $1, directorate_decision = $2, directorate_remarks = $3,
           directorate_reviewed_at = NOW(), updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [newStatus, decision, remarks || null, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateDecision error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/incentives/all ─────────────────────────────────────────
// Admin: all applications with full details
async function getAllApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT a.*, u.email as applicant_email, u.full_name as applicant_name
       FROM yoga_incentive_applications a
       JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAllApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  submitApplication,
  getMyApplications,
  getDistrictApplications,
  districtDecision,
  getDirectorateApplications,
  directorateDecision,
  getAllApplications,
};
