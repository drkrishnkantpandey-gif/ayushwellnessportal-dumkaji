// controllers/trainerFeeController.js
const db = require('../db');

const RATE_PER_SESSION  = 250;
const MAX_SESSIONS      = 20;
const MAX_MONTHLY       = 5000;   // 20 × 250
const MAX_TOTAL         = 15000;  // 3 × 5000

function calcAmount(sessions) {
  const s = Math.min(Math.max(parseInt(sessions) || 0, 0), MAX_SESSIONS);
  return Math.min(s * RATE_PER_SESSION, MAX_MONTHLY);
}

// ── POST /api/institution/trainer-fee ────────────────────────────────────────
async function submitApplication(req, res) {
  try {
    const userId = req.user.userId;
    const {
      institute_name, institute_type,
      institute_address, contact_person, contact_phone, contact_email,
      trainer_name, trainer_qualification, trainer_cert_number,
      month_1_label, month_1_sessions,
      month_2_label, month_2_sessions,
      month_3_label, month_3_sessions,
      bank_account_number, ifsc_code, branch_name, beneficiary_name,
    } = req.body;

    if (!institute_name || !institute_type || !month_1_label || !month_2_label || !month_3_label)
      return res.status(400).json({ message: 'Institute name, type, and all 3 month labels are required.' });

    const validTypes = ['INSTITUTION','HOMESTAY','RESORT','HOTEL','SCHOOL','COLLEGE','YOGA_CENTRE','YOGA_INSTITUTE'];
    if (!validTypes.includes(institute_type))
      return res.status(400).json({ message: 'Invalid institute type.' });

    const m1s = parseInt(month_1_sessions) || 0;
    const m2s = parseInt(month_2_sessions) || 0;
    const m3s = parseInt(month_3_sessions) || 0;

    if (m1s > MAX_SESSIONS || m2s > MAX_SESSIONS || m3s > MAX_SESSIONS)
      return res.status(400).json({ message: `Maximum ${MAX_SESSIONS} sessions allowed per month.` });

    const m1a = calcAmount(m1s);
    const m2a = calcAmount(m2s);
    const m3a = calcAmount(m3s);
    const total = Math.min(m1a + m2a + m3a, MAX_TOTAL);

    const files  = req.files || {};
    const fp     = (f) => files[f]?.[0]?.path || null;

    const result = await db.query(
      `INSERT INTO trainer_fee_reimbursements (
         user_id, institute_name, institute_type,
         institute_address, contact_person, contact_phone, contact_email,
         trainer_name, trainer_qualification, trainer_cert_number,
         month_1_label, month_1_sessions, month_1_amount,
         month_2_label, month_2_sessions, month_2_amount,
         month_3_label, month_3_sessions, month_3_amount,
         total_claimed_amount,
         bank_account_number, ifsc_code, branch_name, beneficiary_name,
         doc_attendance_m1, doc_attendance_m2, doc_attendance_m3,
         doc_trainer_certificate, doc_others,
         status
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
         $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
         $21,$22,$23,$24,$25,$26,$27,$28,$29,
         'SUBMITTED'
       ) RETURNING *`,
      [
        userId, institute_name, institute_type,
        institute_address || null, contact_person || null,
        contact_phone || null, contact_email || null,
        trainer_name || null, trainer_qualification || null, trainer_cert_number || null,
        month_1_label, m1s, m1a,
        month_2_label, m2s, m2a,
        month_3_label, m3s, m3a,
        total,
        bank_account_number || null, ifsc_code || null,
        branch_name || null, beneficiary_name || null,
        fp('doc_attendance_m1'), fp('doc_attendance_m2'), fp('doc_attendance_m3'),
        fp('doc_trainer_certificate'), fp('doc_others'),
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('trainerFee submitApplication:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/institution/trainer-fee ─────────────────────────────────────────
async function getMyApplications(req, res) {
  try {
    const result = await db.query(
      'SELECT * FROM trainer_fee_reimbursements WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('trainerFee getMyApplications:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── GET /api/admin/trainer-fee/pending  (directorate) ────────────────────────
async function getPendingApplications(req, res) {
  try {
    const result = await db.query(
      `SELECT t.*, u.email AS applicant_email, u.full_name AS applicant_user_name
       FROM trainer_fee_reimbursements t
       JOIN users u ON u.id = t.user_id
       WHERE t.status IN ('SUBMITTED','UNDER_REVIEW')
       ORDER BY t.created_at ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('trainerFee getPending:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ── PUT /api/admin/trainer-fee/:id  (directorate decision) ───────────────────
async function directorateDecision(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks, approved_amount } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision))
      return res.status(400).json({ message: 'Decision must be APPROVED or REJECTED.' });

    const result = await db.query(
      `UPDATE trainer_fee_reimbursements
       SET status=$1, directorate_remarks=$2, approved_amount=$3,
           directorate_reviewed_at=NOW(), reviewed_by=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [decision, remarks || null, approved_amount || null, req.user.userId, id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: 'Application not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('trainerFee directorateDecision:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  RATE_PER_SESSION, MAX_SESSIONS, MAX_MONTHLY, MAX_TOTAL,
  submitApplication, getMyApplications, getPendingApplications, directorateDecision,
};
