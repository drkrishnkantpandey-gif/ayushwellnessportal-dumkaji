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
    const users = await db.query('SELECT id, email, role, is_verified, registration_status, created_at FROM users ORDER BY created_at DESC LIMIT 50');
    const profiles = await db.query('SELECT * FROM district_officer_profile LIMIT 50');
    return res.status(200).json({ users: users.rows, profiles: profiles.rows });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
