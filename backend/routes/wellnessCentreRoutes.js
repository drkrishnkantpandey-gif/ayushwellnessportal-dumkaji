// server/routes/wellnessCentreRoutes.js
const express = require("express");
const router = express.Router();

const {
  getWellnessCentreDashboard,
  getPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  getSessions,
  addSession,
  deleteSession,
  getIncentives,
  addIncentive,
  getCentreProfile,
  updateCentreProfile,
  getPendingActions,
  uploadDocuments,
  getPublicProfile,
  getCentreRegistration,
  saveCentreRegistration
} = require("../controllers/wellnessCentreController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

// Configure Multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware to restrict access to Wellness Centres only
const restrictToWellnessCentre = (req, res, next) => {
  const role = req.user.role ? req.user.role.toUpperCase() : '';
  if (role !== 'WELLNESS_CENTRE') {
    return res.status(403).json({ message: "Access denied: Only Wellness Centres allowed" });
  }
  next();
};

// Public routes (No login required)
router.get("/public/profile/:id", getPublicProfile);

// Apply protection to all other routes
router.use(protect);
router.use(restrictToWellnessCentre);

// Dashboard & Profile
router.get("/dashboard", getWellnessCentreDashboard);
router.get("/profile", getCentreProfile);
router.put("/profile", updateCentreProfile);
router.get("/centre-registration", getCentreRegistration);
router.post("/centre-registration", saveCentreRegistration);
router.get("/pending-actions", getPendingActions);
router.post("/documents", upload.fields([
  { name: 'registration_certificate', maxCount: 1 },
  { name: 'accreditation_docs', maxCount: 1 },
  { name: 'other_docs', maxCount: 5 }
]), uploadDocuments);

// Programs
router.get("/programs", getPrograms);
router.post("/programs", addProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

// Staff
router.get("/staff", getStaff);
router.post("/staff", addStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

// Sessions
router.get("/sessions", getSessions);
router.post("/sessions", addSession);
router.delete("/sessions/:id", deleteSession);

// Incentives
router.get("/incentives", getIncentives);
router.post("/incentives", addIncentive);

module.exports = router;
