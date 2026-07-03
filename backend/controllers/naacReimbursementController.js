// controllers/naacReimbursementController.js
const db = require('../db');

// Grade → fixed reimbursement amount (in rupees)
const GRADE_AMOUNTS = {
  'B++': 250000,   // ₹2.5 lakh
  'A':   500000,   // ₹5 lakh
  'A+':  1000000,  // ₹10 lakh
  'A++': 1500000,  // ₹15 lakh
};

// ── POST /api/ayush-college/naac-reimbursement ───────────────────────────────
async function submitReimbursement(req, res) {
  try {
    const userId = req.user.userId;
    const {
      college_name, naac_grade, accreditation_year, accreditation_valid_until,
      naac_certificate_number,
      bank_account_number, ifsc_code, branch_name, beneficiary_name,
    } = req.body;

    if (!college_name || !naac_grade || !accreditation_year)
      return res.status(400).json({ message: 'College name, NAAC grade, and accreditation year are required.' });

    if (!GRADE_AMOUNTS[naac_grade])
      return res.status(400).json({ message: 'Invalid NAAC grade. Must be B++, A, A+, or A++.' });

    // Check if same user already has an approved/submitted claim for same year
    const existing = await db.query(
      `SELECT id FROM naac_reimbursements
       WHERE user_id=$1 AND accreditation_year=$2 AND status NOT IN ('REJECTED')`,
      [userId, accreditation_year]
    );
    if (existing.rows.length)
      return res.status(409).json({ message: 'You already have an active reimbursement claim for this accreditation year.' });

    const reimbursementAmount = GRADE_AMOUNTS[naac_grade];
    const files   = req.files || {};
    const fp      = (f) => files[f]?.[0]?.path || null;

    const result = await db.query(
      `INSERT INTO naac_reimbursements (
         user_id, college_name, naac_grade, accreditation_year, accreditation_valid_until,
         naac_certificate_number, reimbursement_amount,
         doc_naac_certificate, doc_grade_sheet, doc_fee_receipt, doc_bank_details, doc_others,
         bank_account_number, ifsc_code, branch_name, beneficiary_name,
         status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'SUBMITTED')
       RETURNING *`,
      [
        userId, college_name, naac_grade,
        parseInt(accreditation_year), accreditation_valid_until ? parseInt(accreditation_valid_until) : null,
        naac_certificate_number || null, reimbursementAmount,
        fp('doc_naac_certificate'), fp('doc_grade_sheet'), fp('doc_fee_receipt'),
        fp('doc_bank_details'),     fp('doc_others'),
        bank_account_number || null, ifsc_code || null, branch_name || null, beneficiary_name || null,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('naac submitReimbursement:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/ayush-college/naac-reimbursement ────────────────────────────────
async function getMyReimbursements(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM naac_reimbursements WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('naac getMyReimbursements:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/naac-reimbursement/pending  (directorate) ────────────────
async function getPendingReimbursements(req, res) {
  try {
    const result = await db.query(
      `SELECT n.*, u.email AS applicant_email, u.full_name AS applicant_user_name
       FROM naac_reimbursements n
       JOIN users u ON u.id = n.user_id
       WHERE n.status IN ('SUBMITTED','UNDER_REVIEW')
       ORDER BY n.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('naac getPending:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/naac-reimbursement/:id  (directorate decision) ────────────
async function directorateDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks, approved_amount } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision))
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED.' });

    const result = await db.query(
      `UPDATE naac_reimbursements
       SET status=$1, directorate_remarks=$2, approved_amount=$3,
           directorate_reviewed_at=NOW(), reviewed_by=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [decision, remarks || null, approved_amount || null, req.user.userId, id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('naac directorateDecision:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  GRADE_AMOUNTS,
  submitReimbursement,
  getMyReimbursements,
  getPendingReimbursements,
  directorateDecision,
};
