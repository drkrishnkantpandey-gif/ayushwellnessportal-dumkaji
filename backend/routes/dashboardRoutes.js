const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/authMiddleware');

// Define routes
// All routes protected by verifyToken. 
// Note: You must ensure verifyToken is available. If it's not exported from a file, you might need to extract it.
// Assuming verifyToken is in ../middleware/authMiddleware.js. 
// ERROR: I saw 'middleware' dir but not the file content. I will write a basic verifyToken inline or try to import if standard.
// For now, I'll attempt to standard import. *If it fails, I'll fix it.*

const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.get('/overview', authMiddleware.verifyToken, dashboardController.getOverview);
router.get('/naac-progress', authMiddleware.verifyToken, dashboardController.getNaacProgress);
router.get('/departments', authMiddleware.verifyToken, dashboardController.getDepartments);
router.get('/research', authMiddleware.verifyToken, dashboardController.getResearch);
router.get('/incentives', authMiddleware.verifyToken, dashboardController.getIncentives);
router.get('/naac-criteria', authMiddleware.verifyToken, dashboardController.getNaacCriteria);

// Profile Routes
router.get('/profile', authMiddleware.verifyToken, dashboardController.getProfile);
router.patch('/profile', authMiddleware.verifyToken, dashboardController.updateProfile);

// Faculty Routes
router.get('/faculty', authMiddleware.verifyToken, dashboardController.getFaculty);
router.post('/faculty', authMiddleware.verifyToken, dashboardController.addFaculty);
router.patch('/faculty/:id', authMiddleware.verifyToken, dashboardController.updateFaculty);
router.delete('/faculty/:id', authMiddleware.verifyToken, dashboardController.deleteFaculty);

// Student Enrollment Routes
router.get('/student-enrollment', authMiddleware.verifyToken, dashboardController.getStudentEnrollment);
router.patch('/student-enrollment', authMiddleware.verifyToken, dashboardController.updateStudentEnrollment);

// NAAC Routes (Phase 6 Enhancement)
router.get('/naac/overview', authMiddleware.verifyToken, dashboardController.getNaacOverview);
router.post('/naac/visit-portal', authMiddleware.verifyToken, dashboardController.trackPortalVisit);

// Documents
router.get('/naac/documents', authMiddleware.verifyToken, dashboardController.getNaacDocuments);
router.post('/naac/documents/upload', authMiddleware.verifyToken, upload.single('file'), dashboardController.uploadNaacDocument);

// Timeline
router.get('/naac/timeline', authMiddleware.verifyToken, dashboardController.getNaacTimeline);

// Criteria
router.get('/naac/criteria', authMiddleware.verifyToken, dashboardController.getNaacCriteriaData);
router.post('/naac/criteria/update', authMiddleware.verifyToken, dashboardController.updateNaacCriteria);

// Tasks (Existing + Enhancement)
router.get('/naac/tasks', authMiddleware.verifyToken, dashboardController.getNaacTasks);
// router.post('/naac/tasks/add', ...) // Future
// router.patch('/naac/tasks/:id', ...) // Future

router.post('/naac/compliance', authMiddleware.verifyToken, dashboardController.submitNaacCompliance);

// Incentive Routes
router.post('/incentives/apply', authMiddleware.verifyToken, dashboardController.applyIncentive);
router.get('/incentives/payments', authMiddleware.verifyToken, dashboardController.getIncentivePayments);

// Department & Course Routes
router.post('/departments', authMiddleware.verifyToken, dashboardController.addDepartment);
router.post('/courses', authMiddleware.verifyToken, dashboardController.addCourse);

// Bulk Upload Routes
router.post('/students/bulk-upload', authMiddleware.verifyToken, upload.single('file'), dashboardController.bulkUploadStudents);
router.post('/faculty/bulk-upload', authMiddleware.verifyToken, upload.single('file'), dashboardController.bulkUploadFaculty);
router.post('/departments/bulk-upload', authMiddleware.verifyToken, upload.single('file'), dashboardController.bulkUploadDepartments);

module.exports = router;