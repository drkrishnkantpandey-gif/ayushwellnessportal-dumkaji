// controllers/researchGrantController.js
const db = require('../db');

const MAX_GRANT = 1000000; // ₹10 lakh

// April-May window → reviewed in June
// October-November window → reviewed in December
function getActiveWindow() {
  const m = new Date().getMonth() + 1;
  if (m === 4 || m === 5)  return 'APR_MAY';
  if (m === 10 || m === 11) return 'OCT_NOV';
  return null;
}

function getNextWindow() {
  const m = new Date().getMonth() + 1;
  if (m <= 3)  return { window: 'APR_MAY',  opens: 'April' };
  if (m <= 5)  return { window: 'APR_MAY',  opens: 'April' }; // currently open
  if (m <= 9)  return { window: 'OCT_NOV',  opens: 'October' };
  if (m <= 11) return { window: 'OCT_NOV',  opens: 'October' }; // currently open
  return { window: 'APR_MAY', opens: 'April (next year)' };
}

// ── POST /api/research-grants  ───────────────────────────────────────────────
async function submitApplication(req, res) {
  try {
    const userId = req.user.userId;
    const win    = getActiveWindow();
    // Allow submission even outside window for testing; validate strictly in prod
    const appWindow = win || (req.body.application_window) || 'APR_MAY';
    const appYear   = new Date().getFullYear();

    const {
      organization_name, organization_type,
      pi_name, pi_designation, pi_qualification, pi_email, pi_phone,
      pi_is_yoga_background, co_pis, yoga_background_member,
      title, abstract, keywords, problem_statement, objectives_hypotheses,
      literature_review, methodology, feasibility, timeline,
      budget_justification, institutional_capabilities, biographical_sketches,
      ethical_considerations, endorsement_letters, expected_outcomes,
      requested_amount,
    } = req.body;

    if (!organization_name || !organization_type || !pi_name || !title || !requested_amount) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const validOrgTypes = [
      "University",
      "College",
      "AYUSH Organization",
      "AYUSH Related NGO",
      "Yoga Research Institution",
      "Health Organization"
    ];
    if (!validOrgTypes.includes(organization_type)) {
      return res.status(400).json({ message: 'Invalid organization type.' });
    }

    if (parseFloat(requested_amount) > MAX_GRANT) {
      return res.status(400).json({ message: `Maximum grant amount is ₹10,00,000 (10 lakh).` });
    }

    const coPisArr = (() => {
      try { return typeof co_pis === 'string' ? JSON.parse(co_pis) : (co_pis || []); }
      catch { return []; }
    })();

    const docPath = req.file?.path || null;

    const result = await db.query(
      `INSERT INTO research_grants (
        user_id, organization_name, organization_type,
        application_window, application_year,
        pi_name, pi_designation, pi_qualification, pi_email, pi_phone,
        pi_is_yoga_background, co_pis, yoga_background_member,
        title, abstract, keywords, problem_statement, objectives_hypotheses,
        literature_review, methodology, feasibility, timeline,
        budget_justification, institutional_capabilities, biographical_sketches,
        ethical_considerations, endorsement_letters, expected_outcomes,
        requested_amount, doc_proposal, status
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,'SUBMITTED'
      ) RETURNING *`,
      [
        userId, organization_name, organization_type,
        appWindow, appYear,
        pi_name, pi_designation || null, pi_qualification || null, pi_email || null, pi_phone || null,
        pi_is_yoga_background === 'true' || pi_is_yoga_background === true,
        JSON.stringify(coPisArr), yoga_background_member || null,
        title, abstract || null, keywords || null, problem_statement || null, objectives_hypotheses || null,
        literature_review || null, methodology || null, feasibility || null, timeline || null,
        budget_justification || null, institutional_capabilities || null, biographical_sketches || null,
        ethical_considerations || null, endorsement_letters || null, expected_outcomes || null,
        requested_amount, docPath,
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitApplication (research):', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/research-grants  ────────────────────────────────────────────────
async function getMyApplications(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM research_grants WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMyApplications (research):', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/research-grants/:id/bank-details  ───────────────────────────────
async function submitBankDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { bank_account_number, ifsc_code, branch_name, beneficiary_name,
            progress_report_url, utilization_certificate_url } = req.body;

    // Verify ownership + approved status
    const check = await db.query(
      'SELECT id, status FROM research_grants WHERE id=$1 AND user_id=$2',
      [id, userId]
    );
    if (!check.rows.length) return res.status(404).json({ message: 'Application not found.' });
    if (check.rows[0].status !== 'APPROVED')
      return res.status(403).json({ message: 'Bank details can only be submitted after approval.' });

    const result = await db.query(
      `UPDATE research_grants
       SET bank_account_number=$1, ifsc_code=$2, branch_name=$3, beneficiary_name=$4,
           progress_report_url=$5, utilization_certificate_url=$6,
           bank_details_submitted=true, updated_at=NOW()
       WHERE id=$7 AND user_id=$8 RETURNING *`,
      [bank_account_number, ifsc_code, branch_name, beneficiary_name,
       progress_report_url || null, utilization_certificate_url || null, id, userId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitBankDetails:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/research-grants  (directorate) ───────────────────────────
async function getAllApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT r.*, u.email AS applicant_email, u.full_name AS applicant_name
       FROM research_grants r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAllApplications (research):', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/research-grants/pending  (directorate review queue) ──────
async function getPendingApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT r.*, u.email AS applicant_email, u.full_name AS applicant_name
       FROM research_grants r
       JOIN users u ON u.id = r.user_id
       WHERE r.status IN ('SUBMITTED','UNDER_REVIEW')
       ORDER BY r.application_window, r.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getPendingApplications (research):', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/research-grants/:id  (directorate decision) ──────────────
async function directorateDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks, approved_amount } = req.body;

    if (!['APPROVED','REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED.' });
    }

    const result = await db.query(
      `UPDATE research_grants
       SET status=$1, directorate_remarks=$2, directorate_reviewed_at=NOW(),
           reviewed_by=$3, approved_amount=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [decision, remarks || null, req.user.userId, approved_amount || null, id]
    );
    if (!result.rows.length) return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateDecision (research):', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/research-grants/profile ─────────────────────────────────────────
async function getResearchOrgProfile(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const result = await db.query(
      'SELECT * FROM research_org_profile WHERE user_id = $1',
      [userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getResearchOrgProfile:', err);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
}

// ── PUT /api/research-grants/profile ─────────────────────────────────────────
async function updateResearchOrgProfile(req, res) {
  try {
    const userId = req.user.id || req.user.userId;
    const {
      applicant_name, designation, organization_type, organization_name,
      district, work_experience_years, email, contact_number,
      registration_doc_id, website, physical_address,
      latitude, longitude, projects_completed, funding_received,
      association_with_yoga, affiliations
    } = req.body;

    if (!applicant_name || !organization_name || !organization_type || !contact_number) {
      return res.status(400).json({ message: 'Missing required profile fields.' });
    }

    let regDocPath = null;
    let relevantDocsPaths = null;

    if (req.files) {
      if (req.files.registration_doc && req.files.registration_doc[0]) {
        regDocPath = req.files.registration_doc[0].path;
      }
      if (req.files.relevant_docs) {
        relevantDocsPaths = req.files.relevant_docs.map(f => f.path);
      }
    }

    await db.query('BEGIN');

    // Update users table
    await db.query(
      'UPDATE users SET full_name = $1, phone = $2, email = LOWER($3) WHERE id = $4',
      [applicant_name, contact_number, email, userId]
    );

    // Update research_org_profile table
    let profileQuery = `
      UPDATE research_org_profile
      SET applicant_name = $1, designation = $2, organization_type = $3, organization_name = $4,
          district = $5, work_experience_years = $6, email = $7, contact_number = $8,
          registration_doc_id = $9, website = $10, physical_address = $11,
          latitude = $12, longitude = $13, projects_completed = $14, funding_received = $15,
          association_with_yoga = $16, affiliations = $17, updated_at = NOW()
    `;
    const params = [
      applicant_name, designation, organization_type, organization_name,
      district, parseInt(work_experience_years) || 0, email, contact_number,
      registration_doc_id, website || null, physical_address,
      parseFloat(latitude) || 0, parseFloat(longitude) || 0, projects_completed, parseFloat(funding_received) || 0,
      association_with_yoga, affiliations
    ];

    let paramIndex = 18;

    if (regDocPath) {
      profileQuery += `, registration_doc_path = $${paramIndex}`;
      params.push(regDocPath);
      paramIndex++;
    }

    if (relevantDocsPaths && relevantDocsPaths.length > 0) {
      profileQuery += `, relevant_docs_paths = $${paramIndex}`;
      params.push(relevantDocsPaths);
      paramIndex++;
    }

    profileQuery += ` WHERE user_id = $${paramIndex} RETURNING *`;
    params.push(userId);

    const result = await db.query(profileQuery, params);

    await db.query('COMMIT');

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('updateResearchOrgProfile:', err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
}

module.exports = {
  submitApplication,
  getMyApplications,
  submitBankDetails,
  getAllApplications,
  getPendingApplications,
  directorateDecision,
  getResearchOrgProfile,
  updateResearchOrgProfile,
};
