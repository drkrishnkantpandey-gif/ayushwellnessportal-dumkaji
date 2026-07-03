// controllers/examFeeController.js
const db = require('../db');

// ── POST /api/yoga-professional/exam-fee ─────────────────────────────────────
async function submitReimbursement(req, res) {
  try {
    const userId = req.user.userId;
    const {
      course_name, course_code, certifying_board, course_duration, completion_date,
      applicant_name, registration_number, exam_center,
      exam_fee_paid, claimed_amount,
      bank_account_number, ifsc_code, branch_name, beneficiary_name,
    } = req.body;

    if (!course_name || !certifying_board || !completion_date || !applicant_name || !exam_fee_paid || !claimed_amount)
      return res.status(400).json({ message: 'Missing required fields.' });

    const files     = req.files || {};
    const filePath  = (f) => files[f]?.[0]?.path || null;

    const result = await db.query(
      `INSERT INTO exam_fee_reimbursements (
         user_id, course_name, course_code, certifying_board, course_duration, completion_date,
         applicant_name, registration_number, exam_center,
         exam_fee_paid, claimed_amount,
         doc_certificate, doc_fee_receipt, doc_marksheet, doc_id_proof, doc_board_approval,
         bank_account_number, ifsc_code, branch_name, beneficiary_name,
         status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,'SUBMITTED')
       RETURNING *`,
      [
        userId, course_name, course_code || null, certifying_board, course_duration || null, completion_date,
        applicant_name, registration_number || null, exam_center || null,
        exam_fee_paid, claimed_amount,
        filePath('doc_certificate'), filePath('doc_fee_receipt'),
        filePath('doc_marksheet'),   filePath('doc_id_proof'), filePath('doc_board_approval'),
        bank_account_number || null, ifsc_code || null, branch_name || null, beneficiary_name || null,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('submitReimbursement:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/yoga-professional/exam-fee ──────────────────────────────────────
async function getMyReimbursements(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM exam_fee_reimbursements WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getMyReimbursements:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/exam-fee/pending  (directorate) ───────────────────────────
async function getPendingReimbursements(req, res) {
  try {
    const result = await db.query(
      `SELECT e.*, u.email AS applicant_email, u.full_name AS applicant_user_name
       FROM exam_fee_reimbursements e
       JOIN users u ON u.id = e.user_id
       WHERE e.status IN ('SUBMITTED','UNDER_REVIEW')
       ORDER BY e.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getPendingReimbursements:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/exam-fee/:id  (directorate decision) ──────────────────────
async function directorateDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks, approved_amount } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision))
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED.' });

    const result = await db.query(
      `UPDATE exam_fee_reimbursements
       SET status=$1, directorate_remarks=$2, approved_amount=$3,
           directorate_reviewed_at=NOW(), reviewed_by=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [decision, remarks || null, approved_amount || null, req.user.userId, id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('directorateDecision (exam-fee):', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { submitReimbursement, getMyReimbursements, getPendingReimbursements, directorateDecision };
