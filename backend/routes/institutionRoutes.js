// routes/institutionRoutes.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const { protect } = require('../middleware/authMiddleware');
const {
  submitApplication,
  getMyApplications,
} = require('../controllers/trainerFeeController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    const fs = require('fs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename:    (req, file, cb) =>
    cb(null, `trainerfee-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const docFields = upload.fields([
  { name: 'doc_attendance_m1',      maxCount: 1 },
  { name: 'doc_attendance_m2',      maxCount: 1 },
  { name: 'doc_attendance_m3',      maxCount: 1 },
  { name: 'doc_trainer_certificate', maxCount: 1 },
  { name: 'doc_others',             maxCount: 1 },
]);

router.get('/trainer-fee', protect, getMyApplications);
router.post('/trainer-fee', protect, docFields, submitApplication);

module.exports = router;
