// routes/authRoutes.js
const express = require('express');
const router  = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Input sanitisation helper
const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, message: errors.array()[0].msg });
    next();
  },
];

const loginRules = validate([
  body('email')
    .isEmail().withMessage('Invalid email address.')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 1, max: 200 }).withMessage('Password is required.')
    .trim(),
  body('role')
    .isString().notEmpty().withMessage('Role is required.')
    .trim().escape(),
]);

const registerRules = validate([
  body('email').isEmail().normalizeEmail().trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('fullName').notEmpty().trim().escape().withMessage('Full name is required.'),
]);

const { protect } = require('../middleware/authMiddleware');

router.post('/register', upload.none(), registerRules, authController.registerUser);
router.post('/verify-otp', upload.none(), authController.verifyOTP);
router.post('/resend-otp', upload.none(), authController.resendOTP);
router.post('/login', upload.none(), loginRules, authController.loginUser);
router.post('/logout', authController.logoutUser);

router.get('/profile', protect, authController.getUserProfile);
router.post('/update-profile', protect, upload.none(), authController.updateUserProfile);

const db = require('../db');
router.get('/debug-users', async (req, res) => {
  try {
    const statuses = "(u.registration_status IN ('pending', 'PENDING', 'under_review', 'UNDER_REVIEW') OR u.registration_status IS NULL)";
    const query = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.registration_status, u.created_at,
             COALESCE(w.district, t.district, y.district, r.district, c.city, h.district, dop.district) as district,
             dop.employee_id, dop.designation, dop.id_type, dop.id_number, dop.id_upload_path, dop.authority_order_path
      FROM users u
      LEFT JOIN wellness_centres w ON w.user_id = u.id
      LEFT JOIN training_centres t ON t.user_id = u.id
      LEFT JOIN yoga_professional_profile y ON y.user_id = u.id
      LEFT JOIN research_org_profile r ON r.user_id = u.id
      LEFT JOIN ayush_colleges c ON c.id = u.id
      LEFT JOIN ayush_hospitals h ON h.user_id = u.id
      LEFT JOIN district_officer_profile dop ON dop.user_id = u.id
      WHERE u.role NOT IN ('admin', 'directorate') AND ${statuses}
      ORDER BY u.created_at DESC
    `;
    const result = await db.query(query);
    return res.status(200).json({ results: result.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
