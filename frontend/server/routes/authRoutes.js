// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/upload');

// Registration route
router.post('/register', upload.none(), authController.registerUser);

// Verify OTP route
router.post('/verify-otp', upload.none(), authController.verifyOTP);

// Resend OTP route
router.post('/resend-otp', upload.none(), authController.resendOTP);

// Login route
router.post('/login', upload.none(), authController.loginUser);

// Logout route
router.post('/logout', authController.logoutUser);

module.exports = router;
