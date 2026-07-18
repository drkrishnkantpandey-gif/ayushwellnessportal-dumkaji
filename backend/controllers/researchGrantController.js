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

async function checkApplicationsAccepted() {
  try {
    const result = await db.query("SELECT value FROM system_settings WHERE key = 'accept_research_applications'");
    const setting = result.rows[0]?.value || 'AUTO';
    if (setting === 'ON') return true;
    if (setting === 'OFF') return false;
    
    const m = new Date().getMonth() + 1;
    return (m === 4 || m === 5 || m === 10 || m === 11);
  } catch (err) {
    console.error('Error checking applications acceptance:', err);
    const m = new Date().getMonth() + 1;
    return (m === 4 || m === 5 || m === 10 || m === 11);
  }
}

// ── POST /api/research-grants  ───────────────────────────────────────────────
async function submitApplication(req, res) {
  try {
    const accepted = await checkApplicationsAccepted();
    if (!accepted) {
      return res.status(400).json({ message: 'Submissions for research grants are currently closed.' });
    }

    const userId = req.user.userId;
    
    // Check if applicant already has an active application
    const activeCheck = await db.query(
      `SELECT id, status, serial_number FROM research_grants 
       WHERE user_id = $1 AND status NOT IN ('REJECTED_BY_RPAC', 'SLRC_REJECTED')`,
      [userId]
    );
    if (activeCheck.rows.length) {
      return res.status(400).json({ 
        message: `You already have an active or approved research grant application (Serial: ${activeCheck.rows[0].serial_number}). You cannot submit a new application.` 
      });
    }

    const win    = getActiveWindow();
    const appWindow = win || (req.body.application_window) || 'APR_MAY';
    const appYear   = new Date().getFullYear();

    const {
      organization_name, organization_type, yoga_experience_years, doc_proof_path,
      received_prior_grant, prior_grant_app_number, prior_grant_approval_doc_path, behalf_affidavit_path,
      completed_research_count, max_funding_amount, research_proof_doc_path,
      applicant_name, applicant_designation, authorized_by, authorization_letter_path, no_prior_grant_affidavit_path,
      pi_name, pi_dob, pi_dob_proof_path, pi_id_proof_path, pi_qualifications, pi_qualifications_doc_path,
      pi_position, pi_position_other, pi_position_proof_path, co_pis,
      title, abstract, synopsis_path, research_duration_months, other_doc_path, expected_outcomes,
      literature_review, methodology, timeline, milestone_chart_path,
      requested_amount, budget_equipment, budget_manpower, budget_documentation,
      budget_travel, budget_contingency, budget_details_doc_path, ethical_clearance_doc_path,
      team_cvs_path, other_relevant_doc_path, other_relevant_doc_desc, originality_affidavit_path
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

    const reqAmt = parseFloat(requested_amount) || 0;
    if (reqAmt > MAX_GRANT) {
      return res.status(400).json({ message: `Maximum grant amount is ₹10,00,000 (10 lakh).` });
    }

    if (organization_type === "Yoga Research Institution" || organization_type === "Research Institution") {
      const exp = parseInt(yoga_experience_years) || 0;
      if (exp < 3) {
        return res.status(400).json({ message: "Minimum 3 years of experience in Yoga Field is required for Research Institute." });
      }
    }
    if (organization_type === "Health Organization") {
      const exp = parseInt(yoga_experience_years) || 0;
      if (exp < 5) {
        return res.status(400).json({ message: "Minimum 5 years of experience in Yoga Field is required for Health Organisation." });
      }
    }

    if (parseInt(completed_research_count) < 1) {
      return res.status(400).json({ message: "Number of completed research works must be at least 1." });
    }

    if (parseFloat(max_funding_amount) < 500000) {
      return res.status(400).json({ message: "Maximum funding received for a single research work must be at least ₹5 Lakh." });
    }

    const equip = parseFloat(budget_equipment) || 0;
    const power = parseFloat(budget_manpower) || 0;
    const docum = parseFloat(budget_documentation) || 0;
    const trav = parseFloat(budget_travel) || 0;
    const cont = parseFloat(budget_contingency) || 0;

    if (equip > reqAmt * 0.40) return res.status(400).json({ message: "Equipment budget cannot exceed 40% of requested grant." });
    if (power > reqAmt * 0.20) return res.status(400).json({ message: "Manpower budget cannot exceed 20% of requested grant." });
    if (docum > reqAmt * 0.15) return res.status(400).json({ message: "Documentation budget cannot exceed 15% of requested grant." });
    if (trav > reqAmt * 0.20) return res.status(400).json({ message: "Travel & Fieldwork budget cannot exceed 20% of requested grant." });
    if (cont > reqAmt * 0.05) return res.status(400).json({ message: "Contingency budget cannot exceed 5% of requested grant." });

    const totalBudget = equip + power + docum + trav + cont;
    if (totalBudget > reqAmt) return res.status(400).json({ message: "Total of budget heads exceeds the Requested Grant amount." });
    if (totalBudget !== reqAmt) return res.status(400).json({ message: `Total of budget heads must equal the Requested Grant amount (₹${reqAmt.toLocaleString('en-IN')}).` });

    const seqRes = await db.query("SELECT nextval('seq_research_grant_serial')");
    const num = seqRes.rows[0].nextval;
    const paddedNum = num.toString().padStart(4, '0');
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    let fy = "";
    if (month >= 4) {
      fy = `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      fy = `${year - 1}-${year.toString().slice(-2)}`;
    }
    const serialNumber = `UK-RG-FY${fy}-${paddedNum}`;

    const coPisArr = (() => {
      try { return typeof co_pis === 'string' ? JSON.parse(co_pis) : (co_pis || []); }
      catch { return []; }
    })();

    const result = await db.query(
      `INSERT INTO research_grants (
        user_id, organization_name, organization_type, yoga_experience_years, doc_proof_path,
        application_window, application_year, received_prior_grant, prior_grant_app_number,
        prior_grant_approval_doc_path, behalf_affidavit_path, completed_research_count,
        max_funding_amount, research_proof_doc_path, applicant_name, applicant_designation,
        authorized_by, authorization_letter_path, no_prior_grant_affidavit_path,
        pi_name, pi_dob, pi_dob_proof_path, pi_id_proof_path, pi_qualifications,
        pi_qualifications_doc_path, pi_position, pi_position_other, pi_position_proof_path,
        co_pis, title, abstract, synopsis_path, research_duration_months, other_doc_path,
        expected_outcomes, literature_review, methodology, timeline, milestone_chart_path,
        requested_amount, budget_equipment, budget_manpower, budget_documentation,
        budget_travel, budget_contingency, budget_details_doc_path, ethical_clearance_doc_path,
        team_cvs_path, other_relevant_doc_path, other_relevant_doc_desc, originality_affidavit_path,
        serial_number, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
        $41, $42, $43, $44, $45, $46, $47, $48, $49, $50,
        $51, $52, 'SUBMITTED'
      ) RETURNING *`,
      [
        userId, organization_name, organization_type, parseInt(yoga_experience_years) || null, doc_proof_path || null,
        appWindow, appYear, received_prior_grant === 'true' || received_prior_grant === true, prior_grant_app_number || null,
        prior_grant_approval_doc_path || null, behalf_affidavit_path || null, parseInt(completed_research_count) || null,
        parseFloat(max_funding_amount) || null, research_proof_doc_path || null, applicant_name, applicant_designation,
        authorized_by, authorization_letter_path || null, no_prior_grant_affidavit_path || null,
        pi_name, pi_dob || null, pi_dob_proof_path || null, pi_id_proof_path || null, JSON.stringify(pi_qualifications || []),
        pi_qualifications_doc_path || null, pi_position || null, pi_position_other || null, pi_position_proof_path || null,
        JSON.stringify(coPisArr), title, abstract, synopsis_path || null, parseInt(research_duration_months) || null, other_doc_path || null,
        expected_outcomes || null, literature_review || null, methodology || null, timeline || null, milestone_chart_path || null,
        parseFloat(requested_amount) || null, parseFloat(budget_equipment) || null, parseFloat(budget_manpower) || null, parseFloat(budget_documentation) || null,
        parseFloat(budget_travel) || null, parseFloat(budget_contingency) || null, budget_details_doc_path || null, ethical_clearance_doc_path || null,
        team_cvs_path || null, other_relevant_doc_path || null, other_relevant_doc_desc || null, originality_affidavit_path || null,
        serialNumber
      ]
    );

    // Log the initial submission
    const newGrant = result.rows[0];
    await db.query(
      `INSERT INTO research_grant_logs (grant_id, action_by, action_by_user_id, from_status, to_status, comments)
       VALUES ($1, 'APPLICANT', $2, NULL, 'SUBMITTED', 'Initial submission of the Research Grant application proposal.')`,
      [newGrant.id, userId]
    );

    res.status(201).json({ success: true, data: newGrant });
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
    const { decision, remarks, approved_amount, attachment_path } = req.body;

    const validDecisions = [
      'REVERTED_TO_APPLICANT', 
      'FORWARDED_TO_RPAC', 
      'APPROVED_BY_RPAC', 
      'REJECTED_BY_RPAC', 
      'FORWARDED_TO_SLRC', 
      'SLRC_APPROVED', 
      'SLRC_REJECTED'
    ];

    if (!validDecisions.includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision / status transition.' });
    }

    // Fetch current status
    const current = await db.query(`SELECT status FROM research_grants WHERE id = $1`, [id]);
    if (!current.rows.length) return res.status(404).json({ message: 'Application not found.' });
    const fromStatus = current.rows[0].status;

    // Update grant status and optionally approved amount
    const result = await db.query(
      `UPDATE research_grants
       SET status=$1, directorate_remarks=$2, directorate_reviewed_at=NOW(),
           reviewed_by=$3, approved_amount=COALESCE($4, approved_amount), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [decision, remarks || null, req.user.userId, approved_amount ? parseFloat(approved_amount) : null, id]
    );

    // Log the transaction
    await db.query(
      `INSERT INTO research_grant_logs (grant_id, action_by, action_by_user_id, from_status, to_status, comments, attachment_path)
       VALUES ($1, 'DIRECTORATE', $2, $3, $4, $5, $6)`,
      [id, req.user.userId, fromStatus, decision, remarks || null, attachment_path || null]
    );

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

async function getSettings(req, res) {
  try {
    const result = await db.query("SELECT value FROM system_settings WHERE key = 'accept_research_applications'");
    const setting = result.rows[0]?.value || 'AUTO';
    
    const isCurrentlyAccepting = setting === 'ON' ? true : (setting === 'OFF' ? false : (() => {
      const m = new Date().getMonth() + 1;
      return (m === 4 || m === 5 || m === 10 || m === 11);
    })());
    
    res.json({ success: true, setting, isCurrentlyAccepting });
  } catch (err) {
    console.error('getSettings:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function updateSettings(req, res) {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'directorate') {
      return res.status(403).json({ message: 'Access denied: insufficient role.' });
    }
    const { value } = req.body;
    if (!['AUTO', 'ON', 'OFF'].includes(value)) {
      return res.status(400).json({ message: 'Invalid settings value. Must be AUTO, ON, or OFF.' });
    }
    
    await db.query(
      `INSERT INTO system_settings (key, value) 
       VALUES ('accept_research_applications', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [value]
    );
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('updateSettings:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── Compliance Submissions ───────────────────────────────────────────────────
async function submitCompliance(req, res) {
  try {
    const { id } = req.params;
    const { comments, attachment_path } = req.body;

    const current = await db.query(`SELECT status FROM research_grants WHERE id = $1`, [id]);
    if (!current.rows.length) return res.status(404).json({ message: 'Application not found.' });
    const fromStatus = current.rows[0].status;

    if (fromStatus !== 'REVERTED_TO_APPLICANT') {
      return res.status(400).json({ message: 'Only reverted applications can submit compliance details.' });
    }

    const nextStatus = 'RESUBMITTED';
    const result = await db.query(
      `UPDATE research_grants SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [nextStatus, id]
    );

    await db.query(
      `INSERT INTO research_grant_logs (grant_id, action_by, action_by_user_id, from_status, to_status, comments, attachment_path)
       VALUES ($1, 'APPLICANT', $2, $3, $4, $5, $6)`,
      [id, req.user.userId, fromStatus, nextStatus, comments || null, attachment_path || null]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitCompliance:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET Logs ─────────────────────────────────────────────────────────────────
async function getGrantLogs(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM research_grant_logs WHERE grant_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getGrantLogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── Disbursal Requests ───────────────────────────────────────────────────────
async function getDisbursals(req, res) {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT * FROM research_grant_disbursals WHERE grant_id = $1 ORDER BY installment_num ASC`,
      [id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getDisbursals:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function submitDisbursalRequest(req, res) {
  try {
    const { id } = req.params;
    const {
      installment_num, progress_details, slrc_approval_doc_path, milestone_chart_path,
      account_number, account_holder_name, ifsc_code, bank_name, cancelled_cheque_path,
      utilization_certificate_path, other_doc_path
    } = req.body;

    const instNum = parseInt(installment_num);
    if (![1, 2, 3].includes(instNum)) {
      return res.status(400).json({ message: 'Invalid installment number (must be 1, 2, or 3).' });
    }

    // Verify application status is SLRC_APPROVED, APPROVED_BY_RPAC, or FORWARDED_TO_SLRC
    const grantRes = await db.query(`SELECT status, approved_amount, requested_amount FROM research_grants WHERE id = $1`, [id]);
    if (!grantRes.rows.length) return res.status(404).json({ message: 'Application not found.' });
    
    const { status, approved_amount, requested_amount } = grantRes.rows[0];
    const validStatuses = ['SLRC_APPROVED', 'APPROVED_BY_RPAC', 'FORWARDED_TO_SLRC', 'APPROVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Grant disbursal can only be requested after RPAC or SLRC Approval.' });
    }

    const approvedAmt = parseFloat(approved_amount) || parseFloat(requested_amount) || 0;
    if (approvedAmt <= 0) {
      return res.status(400).json({ message: 'Approved grant amount is zero or invalid.' });
    }

    // Determine requested amount based on installment percentage
    const pct = instNum === 1 ? 0.40 : 0.30;
    const amount = approvedAmt * pct;

    // Checks for prerequisites
    if (instNum === 2) {
      const prev = await db.query(
        `SELECT status FROM research_grant_disbursals WHERE grant_id = $1 AND installment_num = 1`,
        [id]
      );
      if (!prev.rows.length || prev.rows[0].status !== 'APPROVED') {
        return res.status(400).json({ message: 'You must get approval for the 1st Installment before requesting the 2nd.' });
      }
      if (!utilization_certificate_path) {
        return res.status(400).json({ message: 'Utilization Certificate is required for the 2nd Installment.' });
      }
    }

    if (instNum === 3) {
      const prev = await db.query(
        `SELECT status FROM research_grant_disbursals WHERE grant_id = $1 AND installment_num = 2`,
        [id]
      );
      if (!prev.rows.length || prev.rows[0].status !== 'APPROVED') {
        return res.status(400).json({ message: 'You must get approval for the 2nd Installment before requesting the 3rd.' });
      }
      if (!utilization_certificate_path) {
        return res.status(400).json({ message: 'Utilization Certificate is required for the 3rd Installment.' });
      }
    }

    // Check for existing request of same installment number
    const check = await db.query(
      `SELECT id, status FROM research_grant_disbursals WHERE grant_id = $1 AND installment_num = $2`,
      [id, instNum]
    );
    if (check.rows.length) {
      const existingStatus = check.rows[0].status;
      if (existingStatus === 'PENDING') {
        return res.status(400).json({ message: `A request for Installment ${instNum} is already pending review.` });
      }
      if (existingStatus === 'APPROVED') {
        return res.status(400).json({ message: `Installment ${instNum} has already been approved.` });
      }
      if (existingStatus === 'REVERTED') {
        // Overwrite the reverted request
        await db.query(
          `DELETE FROM research_grant_disbursals WHERE grant_id = $1 AND installment_num = $2`,
          [id, instNum]
        );
      }
    }

    // Save request
    const result = await db.query(
      `INSERT INTO research_grant_disbursals (
        grant_id, installment_num, percentage, amount, progress_details,
        slrc_approval_doc_path, milestone_chart_path, account_number,
        account_holder_name, ifsc_code, bank_name, cancelled_cheque_path,
        utilization_certificate_path, other_doc_path, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PENDING')
       RETURNING *`,
      [
        id, instNum, pct * 100, amount, progress_details,
        slrc_approval_doc_path, milestone_chart_path, account_number,
        account_holder_name, ifsc_code, bank_name, cancelled_cheque_path,
        utilization_certificate_path || null, other_doc_path || null
      ]
    );

    // Log the request
    await db.query(
      `INSERT INTO research_grant_logs (grant_id, action_by, action_by_user_id, from_status, to_status, comments)
       VALUES ($1, 'APPLICANT', $2, $3, $4, $5)`,
      [id, req.user.userId, status, `DISB_REQ_INSTALLMENT_${instNum}`, `Submitted request for installment #${instNum} (${pct*100}%).`]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitDisbursalRequest:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

async function reviewDisbursalRequest(req, res) {
  try {
    const { id, disbursalId } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ['APPROVED', 'REVERTED', 'FORWARDED_TO_SLRC', 'SLRC_APPROVED', 'SLRC_REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status transition for disbursal request.' });
    }

    const disb = await db.query(
      `SELECT installment_num, status FROM research_grant_disbursals WHERE id = $1 AND grant_id = $2`,
      [disbursalId, id]
    );
    if (!disb.rows.length) return res.status(404).json({ message: 'Disbursal request not found.' });

    const instNum = disb.rows[0].installment_num;
    const fromStatus = disb.rows[0].status;

    await db.query(
      `UPDATE research_grant_disbursals
       SET status = $1, directorate_remarks = $2, updated_at = NOW()
       WHERE id = $3`,
      [status, remarks || null, disbursalId]
    );

    if (status === 'SLRC_REJECTED') {
      await db.query(
        `UPDATE research_grants SET status = 'SLRC_REJECTED', updated_at = NOW() WHERE id = $1`,
        [id]
      );
    }

    // Log the review
    await db.query(
      `INSERT INTO research_grant_logs (grant_id, action_by, action_by_user_id, from_status, to_status, comments)
       VALUES ($1, 'DIRECTORATE', $2, $3, $4, $5)`,
      [id, req.user.userId, `DISB_REQ_INSTALLMENT_${instNum}_${fromStatus}`, `DISB_REQ_INSTALLMENT_${instNum}_${status}`, remarks || null]
    );

    res.json({ success: true, message: `Disbursal request has been ${status.toLowerCase()}.` });
  } catch (err) {
    console.error('reviewDisbursalRequest:', err);
    res.status(500).json({ message: 'Server error' });
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
  getSettings,
  updateSettings,
  submitCompliance,
  getGrantLogs,
  getDisbursals,
  submitDisbursalRequest,
  reviewDisbursalRequest
};
