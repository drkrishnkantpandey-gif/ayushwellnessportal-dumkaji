// routes/researchGrantRoutes.js
const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  submitApplication,
  getMyApplications,
  submitBankDetails,
  getAllApplications,
  getPendingApplications,
  directorateDecision,
} = require('../controllers/researchGrantController');

// Accept PDF and Word documents for the proposal
const researchUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF and Word documents are allowed for proposals.'));
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// ── Applicant routes ─────────────────────────────────────────────────────────
router.get('/',    protect, getMyApplications);
router.post('/',   protect, researchUpload.single('doc_proposal'), submitApplication);
router.put('/:id/bank-details', protect, submitBankDetails);

// ── Directorate routes ───────────────────────────────────────────────────────
router.get('/admin/pending', protect, getPendingApplications);
router.get('/admin/all',     protect, getAllApplications);
router.put('/admin/:id',     protect, directorateDecision);

module.exports = router;
