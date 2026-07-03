// routes/ayushCollegeRoutes.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload  = require('../middleware/upload');
const {
  submitReimbursement,
  getMyReimbursements,
} = require('../controllers/naacReimbursementController');

// NAAC Reimbursement — college side
router.get('/naac-reimbursement',  protect, getMyReimbursements);
router.post('/naac-reimbursement', protect, upload.fields([
  { name: 'doc_naac_certificate', maxCount: 1 },
  { name: 'doc_grade_sheet',      maxCount: 1 },
  { name: 'doc_fee_receipt',      maxCount: 1 },
  { name: 'doc_bank_details',     maxCount: 1 },
  { name: 'doc_others',           maxCount: 1 },
]), submitReimbursement);

module.exports = router;
