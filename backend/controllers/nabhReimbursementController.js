// controllers/nabhReimbursementController.js
const db = require('../db');

// ── POST /api/ayush-hospital/nabh-reimbursement ──────────────────────────────
async function submitReimbursement(req, res) {
  try {
    const userId = req.user.userId;
    const {
      hospital_name,
      nabh_certificate_number,
      nabh_accreditation_type,
      nabh_valid_from,
      nabh_valid_to,
      accreditation_year,
      fee_paid_amount,
      requested_amount,
      bank_account_number,
      ifsc_code,
      branch_name,
      beneficiary_name,
    } = req.body;

    if (!hospital_name || !nabh_accreditation_type || !accreditation_year || !fee_paid_amount)
      return res.status(400).json({ message: 'Hospital name, accreditation type, year, and fee paid amount are required.' });

    // Prevent duplicate active application for same year
    const existing = await db.query(
      `SELECT id FROM nabh_reimbursements
       WHERE user_id = $1 AND accreditation_year = $2 AND status NOT IN ('REJECTED')`,
      [userId, parseInt(accreditation_year)]
    );
    if (existing.rows.length)
      return res.status(409).json({ message: 'An active reimbursement claim already exists for this accreditation year.' });

    // Resolve hospital_id (optional — hospital may not have a profile record yet)
    let hospitalId = null;
    try {
      const hRes = await db.query('SELECT id FROM ayush_hospitals WHERE user_id = $1', [userId]);
      if (hRes.rows.length) hospitalId = hRes.rows[0].id;
    } catch (_) {}

    const files = req.files || {};
    const fp = (f) => files[f]?.[0]?.path || null;

    const result = await db.query(
      `INSERT INTO nabh_reimbursements (
         user_id, hospital_id,
         hospital_name, nabh_certificate_number, nabh_accreditation_type,
         nabh_valid_from, nabh_valid_to, accreditation_year,
         fee_paid_amount, requested_amount,
         bank_account_number, ifsc_code, branch_name, beneficiary_name,
         doc_nabh_certificate, doc_fee_receipt, doc_bank_details, doc_others,
         status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'SUBMITTED')
       RETURNING *`,
      [
        userId, hospitalId,
        hospital_name, nabh_certificate_number || null, nabh_accreditation_type,
        nabh_valid_from || null, nabh_valid_to || null, parseInt(accreditation_year),
        parseFloat(fee_paid_amount), requested_amount ? parseFloat(requested_amount) : null,
        bank_account_number || null, ifsc_code || null, branch_name || null, beneficiary_name || null,
        fp('doc_nabh_certificate'), fp('doc_fee_receipt'), fp('doc_bank_details'), fp('doc_others'),
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('nabh submitReimbursement:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/ayush-hospital/nabh-reimbursement ───────────────────────────────
async function getMyReimbursements(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM nabh_reimbursements WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('nabh getMyReimbursements:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/nabh-reimbursement/pending  (directorate) ─────────────────
async function getPendingReimbursements(req, res) {
  try {
    const result = await db.query(
      `SELECT n.*, u.email AS applicant_email, u.full_name AS applicant_user_name
       FROM nabh_reimbursements n
       JOIN users u ON u.id = n.user_id
       WHERE n.status IN ('SUBMITTED', 'UNDER_REVIEW')
       ORDER BY n.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('nabh getPending:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/nabh-reimbursement/:id  (directorate decision) ─────────────
async function directorateDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks, approved_amount } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision))
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED.' });

    const result = await db.query(
      `UPDATE nabh_reimbursements
       SET status = $1, directorate_remarks = $2, approved_amount = $3,
           directorate_reviewed_at = NOW(), reviewed_by = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [decision, remarks || null, approved_amount || null, req.user.userId, id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('nabh directorateDecision:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  submitReimbursement,
  getMyReimbursements,
  getPendingReimbursements,
  directorateDecision,
};
