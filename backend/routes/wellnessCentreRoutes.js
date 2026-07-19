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
  submitOperationalRegistration,
  getMyOperationalRegistration,
  downloadRegistrationCertificate,
  uploadSingleFile
} = require("../controllers/wellnessCentreController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

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

// Multer fields for the 5-section operational registration form
const opRegFields = upload.fields([
  { name: 'previous_reg_certificate', maxCount: 1 },
  { name: 'doctor_qual_doc', maxCount: 1 },
  { name: 'bcp_reg_doc', maxCount: 1 },
  { name: 'cea_reg_certificate', maxCount: 1 },
  { name: 'clinical_affidavit', maxCount: 1 },
  { name: 'service_charges_doc', maxCount: 1 },
  { name: 'brochure_doc', maxCount: 1 },
  { name: 'pharmacist_bcp_doc', maxCount: 1 },
  { name: 'panchakarma_staff_bcp_doc', maxCount: 1 },
  { name: 'yoga_instructor_qual_doc', maxCount: 1 },
  { name: 'bnys_reg_certificate', maxCount: 1 },
  { name: 'naturopathy_staff_bcp_doc', maxCount: 1 },
  { name: 'fee_receipt_doc', maxCount: 1 },
  { name: 'declaration_affidavit', maxCount: 1 }
]);

const restrictToWellnessCentre = (req, res, next) => {
  const role = req.user.role ? req.user.role.toUpperCase() : '';
  if (role !== 'WELLNESS_CENTRE') {
    return res.status(403).json({ message: "Access denied: Only Wellness Centres allowed" });
  }
  next();
};

// Public routes
router.get("/public/profile/:id", getPublicProfile);

// Protected routes
router.use(protect);
router.use(restrictToWellnessCentre);

router.get("/dashboard", getWellnessCentreDashboard);
router.get("/profile", getCentreProfile);
router.put("/profile", updateCentreProfile);
router.get("/pending-actions", getPendingActions);
router.post("/documents", upload.fields([
  { name: 'registration_certificate', maxCount: 1 },
  { name: 'accreditation_docs', maxCount: 1 },
  { name: 'other_docs', maxCount: 5 }
]), uploadDocuments);

// Operational Registration (5-section form)
router.get("/operational-registration/certificate", downloadRegistrationCertificate);
router.get("/operational-registration", getMyOperationalRegistration);
router.post("/operational-registration", opRegFields, submitOperationalRegistration);
router.post("/upload-single-file", upload.single('file'), uploadSingleFile);

router.get("/programs", getPrograms);
router.post("/programs", addProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

router.get("/staff", getStaff);
router.post("/staff", addStaff);
router.put("/staff/:id", updateStaff);
router.delete("/staff/:id", deleteStaff);

router.get("/sessions", getSessions);
router.post("/sessions", addSession);
router.delete("/sessions/:id", deleteSession);

router.get("/incentives", getIncentives);
router.post("/incentives", addIncentive);

module.exports = router;
