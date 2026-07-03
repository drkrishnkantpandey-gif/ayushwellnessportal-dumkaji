// server/routes/ayushHospitalRoutes.js
const express = require('express');
const router = express.Router();
const ayushHospitalController = require('../controllers/ayushHospitalController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check role
const roleMiddleware = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Authorized role: ' + role });
        }
    };
};

const ayushHospitalUpload = require('../middleware/ayushHospitalUpload');

router.get('/dashboard', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalDashboard);
router.post('/register-after-otp', ayushHospitalController.registerAfterOtp);
router.post('/upload-documents', protect, roleMiddleware('ayush_hospital'), ayushHospitalUpload.fields([
    { name: 'nabhCertificate', maxCount: 1 },
    { name: 'supportingDocument', maxCount: 1 }
]), ayushHospitalController.uploadDocuments);
router.get('/profile', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalProfile);
router.get('/documents', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalDocuments);
router.get('/incentive', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalIncentive);
router.get('/application-status', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalApplicationStatus);
router.get('/validity', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalValidity);
router.get('/patient-summary', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalPatientSummary);
router.get('/patient-stats', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getAyushHospitalPatientStats);
router.post('/update-profile', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.updateAyushHospitalProfile);
router.get('/clinical-infra', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getClinicalInfra);
router.post('/clinical-infra', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.updateClinicalInfra);
router.get('/operational-stats', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.getOperationalStats);
router.post('/operational-stats', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.updateOperationalStats);
router.post('/incentive/apply', protect, roleMiddleware('ayush_hospital'), ayushHospitalController.applyForIncentive);

module.exports = router;
