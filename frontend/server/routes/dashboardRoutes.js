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

router.get('/overview', authMiddleware.verifyToken, dashboardController.getOverview);
router.get('/naac-progress', authMiddleware.verifyToken, dashboardController.getNaacProgress);
router.get('/departments', authMiddleware.verifyToken, dashboardController.getDepartments);
router.get('/research', authMiddleware.verifyToken, dashboardController.getResearch);
router.get('/incentives', authMiddleware.verifyToken, dashboardController.getIncentives);
router.get('/naac-criteria', authMiddleware.verifyToken, dashboardController.getNaacCriteria);

module.exports = router;
