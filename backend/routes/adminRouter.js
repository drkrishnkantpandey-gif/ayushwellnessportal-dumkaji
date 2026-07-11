// routes/adminRouter.js
const express      = require('express');
const router       = express.Router();
const adminController = require('../controllers/adminController');
const { protect }  = require('../middleware/authMiddleware');
const isAdmin      = require('../middleware/adminAuth');
const requireRole  = require('../middleware/roleAuth');

const {
  getDistrictApplications,
  districtDecision,
  getDirectorateApplications,
  directorateDecision,
  getAllApplications,
} = require('../controllers/yogaIncentiveController');

const {
  getPendingReimbursements,
  directorateDecision: examFeeDecision,
} = require('../controllers/examFeeController');

const {
  getPendingReimbursements: naacPending,
  directorateDecision: naacDecision,
} = require('../controllers/naacReimbursementController');

const {
  getPendingApplications: trainerFeePending,
  directorateDecision: trainerFeeDecision,
} = require('../controllers/trainerFeeController');

const {
  getPendingReimbursements: nabhPending,
  directorateDecision: nabhDecision,
} = require('../controllers/nabhReimbursementController');

// Fix #5: shorthand role guards
const districtOnly   = requireRole('district_officer');
const directorateOnly = requireRole('directorate', 'admin');

// ── Admin-only ────────────────────────────────────────────────────────────────
router.get('/getUsersByModule/:module', protect, isAdmin, adminController.getUserByModule);
router.put('/approveUser/:userId',      protect, isAdmin, adminController.updateUserApproval);
router.put('/centre/:userId/operational', protect, requireRole('directorate', 'admin', 'district_officer'), adminController.toggleCentreOperational);

// ── District Officer — Yoga TC Incentive ─────────────────────────────────────
router.get('/incentives/district',      protect, districtOnly,    getDistrictApplications);
router.put('/incentives/district/:id',  protect, districtOnly,    districtDecision);

// ── Directorate — Yoga TC Incentive ──────────────────────────────────────────
router.get('/incentives/directorate',     protect, directorateOnly, getDirectorateApplications);
router.put('/incentives/directorate/:id', protect, directorateOnly, directorateDecision);

// ── Admin — all incentive applications ───────────────────────────────────────
router.get('/incentives/all', protect, isAdmin, getAllApplications);

// ── Directorate — Exam Fee Reimbursement ─────────────────────────────────────
router.get('/exam-fee/pending', protect, directorateOnly, getPendingReimbursements);
router.put('/exam-fee/:id',     protect, directorateOnly, examFeeDecision);

// ── Directorate — NAAC Reimbursement ─────────────────────────────────────────
router.get('/naac-reimbursement/pending', protect, directorateOnly, naacPending);
router.put('/naac-reimbursement/:id',     protect, directorateOnly, naacDecision);

// ── Directorate — Trainer Fee Reimbursement ───────────────────────────────────
router.get('/trainer-fee/pending', protect, directorateOnly, trainerFeePending);
router.put('/trainer-fee/:id',     protect, directorateOnly, trainerFeeDecision);

// ── Directorate — NABH Accreditation Fee Reimbursement ───────────────────────
router.get('/nabh-reimbursement/pending', protect, directorateOnly, nabhPending);
router.put('/nabh-reimbursement/:id',     protect, directorateOnly, nabhDecision);

module.exports = router;
