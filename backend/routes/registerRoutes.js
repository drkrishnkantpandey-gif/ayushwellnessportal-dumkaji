const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  registerWellnessCentre,
  registerTrainingCentre,
  registerYogaProfessional,
  registerAyushCollege
} = require("../controllers/registerController");

const router = express.Router();

// Ensure uploads directory exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// store files in /server/uploads with original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

const populatePreUploadedFiles = (req, res, next) => {
  if (!req.files) req.files = {};
  
  const fileFields = [
    "idUpload", "authorityOrder", "orgRegDoc", "relevantDocs",
    "profilePhoto", "certificateFiles", "centrePhotos", "idProofFile",
    "ownershipProof", "therapyMenu", "facilityImages", "staffCerts",
    "naacCertificate", "auditReport", "extraNaac", "affiliationLetter",
    "trustCertificate", "digitalSign", "idProof", "entityCertificate", "operationalBusinessCertificate"
  ];

  fileFields.forEach(field => {
    if (req.body[field] && (!req.files[field] || req.files[field].length === 0)) {
      let value = req.body[field];
      if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // ignore
        }
      }
      if (Array.isArray(value)) {
        req.files[field] = value.map(filename => ({
          fieldname: field,
          filename,
          originalname: filename,
          path: path.join(__dirname, "..", "uploads", filename)
        }));
      } else if (typeof value === "string" && value.trim() !== "") {
        req.files[field] = [{
          fieldname: field,
          filename: value,
          originalname: value,
          path: path.join(__dirname, "..", "uploads", value)
        }];
      }
    }
  });
  next();
};

// Temp file upload for progress tracking and registration
router.post("/upload-temp-file", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  return res.json({
    success: true,
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: `/uploads/${req.file.filename}`
  });
});

// expects multipart/form-data
router.post(
  "/wellness-centre",
  upload.fields([
    { name: "ownershipProof", maxCount: 1 },
    { name: "therapyMenu", maxCount: 1 },
    { name: "facilityImages", maxCount: 10 },
    { name: "staffCerts", maxCount: 1 },
  ]),
  populatePreUploadedFiles,
  registerWellnessCentre
);

// Training Centre Registration
router.post(
  "/training-centre",
  upload.fields([
    { name: "entityCertificate", maxCount: 1 },
    { name: "operationalBusinessCertificate", maxCount: 1 },
    { name: "idProofFile", maxCount: 1 }
  ]),
  populatePreUploadedFiles,
  registerTrainingCentre
);

// Yoga Professional Registration
router.post(
  "/yoga-professional",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "certificateFiles", maxCount: 5 },
  ]),
  populatePreUploadedFiles,
  registerYogaProfessional
);

// Ayush College Registration
router.post(
  "/ayush-college",
  upload.fields([
    { name: "naacCertificate", maxCount: 1 },
    { name: "auditReport", maxCount: 1 },
    { name: "extraNaac", maxCount: 1 },
    { name: "affiliationLetter", maxCount: 1 },
    { name: "trustCertificate", maxCount: 1 },
    { name: "digitalSign", maxCount: 1 },
    { name: "idProof", maxCount: 1 }
  ]),
  populatePreUploadedFiles,
  registerAyushCollege
);

// Research Institution Registration
const { registerResearchOrg, registerDistrictOfficer, registerDirectorate } = require("../controllers/registerController");
router.post(
  "/research-org",
  upload.fields([
    { name: "orgRegDoc", maxCount: 1 },
    { name: "relevantDocs", maxCount: 5 }
  ]),
  populatePreUploadedFiles,
  registerResearchOrg
);

// District Officer Registration
router.post(
  "/district-officer",
  upload.fields([
    { name: "idUpload", maxCount: 1 },
    { name: "authorityOrder", maxCount: 1 }
  ]),
  populatePreUploadedFiles,
  registerDistrictOfficer
);

// Directorate Registration
router.post(
  "/directorate",
  upload.fields([
    { name: "idUpload", maxCount: 1 },
    { name: "authorityOrder", maxCount: 1 }
  ]),
  populatePreUploadedFiles,
  registerDirectorate
);

module.exports = router;