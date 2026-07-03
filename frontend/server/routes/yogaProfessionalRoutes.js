const express = require('express');
const router = express.Router();
const yogaDashboardController = require('../controllers/yogaDashboardController');
const yogaProfileController = require('../controllers/yogaProfileController');
const yogaCertificateController = require('../controllers/yogaCertificateController');
const yogaReimbursementController = require('../controllers/yogaReimbursementController');
const yogaSessionController = require('../controllers/yogaSessionController');
const yogaNotificationController = require('../controllers/yogaNotificationController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Dashboard Overview
router.get('/overview', protect, yogaDashboardController.getOverview);

// Profile Management
router.get('/profile', protect, yogaProfileController.getProfile);
router.put('/profile', protect, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'certificateFile', maxCount: 1 },
    { name: 'idProofFile', maxCount: 1 }
]), yogaProfileController.updateProfile);

// Certification Module
router.post('/certificate', protect, upload.single('certificateFile'), yogaCertificateController.uploadCertificate);
router.get('/certificates', protect, yogaCertificateController.getCertificates);
router.get('/certificate/:id/download', protect, yogaCertificateController.generateDigitalCertificate);
router.get('/registration-certificate', protect, yogaCertificateController.generateRegistrationCertificate);

// Reimbursement Module
router.post('/reimbursement', protect, upload.single('receiptFile'), yogaReimbursementController.submitApplication);
router.get('/reimbursements', protect, yogaReimbursementController.getApplications);

// Session Tracker
router.post('/session', protect, upload.single('sessionPhoto'), yogaSessionController.logSession);
router.get('/sessions', protect, yogaSessionController.getSessions);
router.delete('/session/:id', protect, yogaSessionController.deleteSession);

// Notifications
router.get('/notifications', protect, yogaNotificationController.getAllNotifications);
router.put('/notification/:id/read', protect, yogaNotificationController.markAsRead);

module.exports = router;
