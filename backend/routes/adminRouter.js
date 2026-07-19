// routes/adminRouter.js
const express      = require('express');
const router       = express.Router();
const adminController = require('../controllers/adminController');
const { protect }  = require('../middleware/authMiddleware');
const isAdmin      = require('../middleware/adminAuth');
const requireRole  = require('../middleware/roleAuth');

const {
  getDistrictApplications,
  districtSubmitVerification,
  getDirectorateApplications,
  directorateForwardToDistrict,
  directorateRevertToApplicant,
  directorateForwardToSlrc,
  directorateMarkSlrcApproved,
  directorateGrantInPrinciple,
  getAllApplications,
  rejectApplicationByDirectorate,
  markSLRCApproval,
  getDisbursalClaims,
  forwardClaimToCommittee,
  verifyClaimByCommittee,
  revertClaimToApplicant,
  recommendClaimBySLRC,
  releaseClaimSubsidy,
  updateApplicationGpsCoordinates,
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
router.get('/dashboard-stats', protect, requireRole('directorate', 'admin', 'district_officer'), adminController.getDashboardStats);
router.get('/pending-registrations', protect, requireRole('directorate', 'admin', 'district_officer'), adminController.getPendingRegistrations);
router.put('/approve-user-registration/:targetUserId', protect, requireRole('directorate', 'admin', 'district_officer'), adminController.approveUserRegistration);
router.post('/fix-null-statuses', protect, isAdmin, adminController.fixNullRegistrationStatuses);

// ── District Officer — Yoga TC Incentive ─────────────────────────────────────
router.get('/incentives/district',              protect, districtOnly, getDistrictApplications);
router.put('/incentives/district/:id/verify',   protect, districtOnly, districtSubmitVerification);

// ── Shared Gps Update — DO / Directorate / Admin ──────────────────────────────
router.put('/incentives/:id/gps', protect, requireRole('directorate', 'admin', 'district_officer'), updateApplicationGpsCoordinates);

// ── Directorate — Yoga TC Incentive ──────────────────────────────────────────
router.get('/incentives/directorate',                       protect, directorateOnly, getDirectorateApplications);
router.put('/incentives/directorate/:id/forward-district',   protect, directorateOnly, directorateForwardToDistrict);
router.put('/incentives/directorate/:id/revert',             protect, directorateOnly, directorateRevertToApplicant);
router.put('/incentives/directorate/:id/reject',             protect, directorateOnly, rejectApplicationByDirectorate);
router.put('/incentives/directorate/:id/forward-slrc',       protect, directorateOnly, directorateForwardToSlrc);
router.put('/incentives/directorate/:id/slrc-approved',      protect, directorateOnly, directorateMarkSlrcApproved);
router.put('/incentives/directorate/:id/slrc-approval',      protect, directorateOnly, markSLRCApproval);
router.put('/incentives/directorate/:id/grant-approval',     protect, directorateOnly, directorateGrantInPrinciple);

// ── Directorate — Disbursal Claims management ────────────────────────────────
router.get('/incentives/directorate/:applicationId/disbursal-claims', protect, directorateOnly, getDisbursalClaims);
router.put('/incentives/directorate/claims/:claimId/forward-committee', protect, directorateOnly, forwardClaimToCommittee);
router.put('/incentives/directorate/claims/:claimId/verify-committee', protect, directorateOnly, verifyClaimByCommittee);
router.put('/incentives/directorate/claims/:claimId/revert-claim', protect, directorateOnly, revertClaimToApplicant);
router.put('/incentives/directorate/claims/:claimId/slrc-recommend', protect, directorateOnly, recommendClaimBySLRC);
router.put('/incentives/directorate/claims/:claimId/release-subsidy', protect, directorateOnly, releaseClaimSubsidy);

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

// ── Wellness Centre Operational Registrations (District: action; Directorate: view) ─
const {
  getPendingWellnessCentreRegistrations,
  actionWellnessCentreRegistration
} = require('../controllers/wellnessCentreController');

router.get('/wellness-centre-operational-registrations',
  protect, requireRole('district_officer', 'directorate', 'admin'),
  getPendingWellnessCentreRegistrations
);
router.put('/wellness-centre-operational-registrations/:id',
  protect, requireRole('district_officer', 'admin'),
  actionWellnessCentreRegistration
);

module.exports = router;

