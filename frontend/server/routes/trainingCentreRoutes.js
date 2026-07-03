// server/routes/trainingCentreRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getTrainingCentre,
  updateTrainingCentre,
  getTrainingCentreStats,
  getTrainers,
  addTrainer,
  updateTrainer,
  deleteTrainer,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getInfrastructure,
  addInfrastructure,
  deleteInfrastructure,
  getAnalytics
} = require('../controllers/trainingCentreController');

// Protected routes (require authentication)
router.use(protect);

// Get analytics
router.get('/analytics', getAnalytics);

// Get training center profile
router.get('/profile', getTrainingCentre);

// Update training center profile (supports file uploads)
router.put('/profile', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), updateTrainingCentre);

// Get training center statistics
router.get('/stats', getTrainingCentreStats);

// Trainer management routes
router.get('/trainers', getTrainers);
router.post('/trainers', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certification', maxCount: 1 }
]), addTrainer);
router.put('/trainers/:id', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certification', maxCount: 1 }
]), updateTrainer);
router.delete('/trainers/:id', deleteTrainer);

// Course management routes
router.get('/courses', getCourses);
router.post('/courses', addCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Infrastructure management routes
router.get('/infrastructure', getInfrastructure);
router.post('/infrastructure', upload.fields([
  { name: 'media', maxCount: 10 }
]), addInfrastructure);
router.delete('/infrastructure/:id', deleteInfrastructure);

module.exports = router;