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
  getResearchOrgProfile,
  updateResearchOrgProfile,
} = require('../controllers/researchGrantController');

// Accept PDF and Word documents for the proposal
const researchUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads');
      const fs = require('fs');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
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

const profileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads');
      const fs = require('fs');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// ── Applicant routes ─────────────────────────────────────────────────────────
router.get('/',    protect, getMyApplications);
router.post('/',   protect, researchUpload.single('doc_proposal'), submitApplication);
router.put('/:id/bank-details', protect, submitBankDetails);
router.get('/profile', protect, getResearchOrgProfile);
router.put('/profile', protect, profileUpload.fields([
  { name: 'registration_doc', maxCount: 1 },
  { name: 'relevant_docs', maxCount: 5 }
]), updateResearchOrgProfile);

// ── Directorate routes ───────────────────────────────────────────────────────
router.get('/admin/pending', protect, getPendingApplications);
router.get('/admin/all',     protect, getAllApplications);
router.put('/admin/:id',     protect, directorateDecision);

module.exports = router;
