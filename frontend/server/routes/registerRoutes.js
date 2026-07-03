const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  registerWellnessCentre,
  registerTrainingCentre,
  registerYogaProfessional
} = require("../controllers/registerController");

const router = express.Router();

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

// expects multipart/form-data
router.post(
  "/wellness-centre",
  upload.fields([
    { name: "ownershipProof", maxCount: 1 },
    { name: "therapyMenu", maxCount: 1 },
    { name: "facilityImages", maxCount: 10 },
    { name: "staffCerts", maxCount: 1 },
  ]),
  registerWellnessCentre
);

// Training Centre Registration
router.post(
  "/training-centre",
  upload.fields([
    { name: "centrePhotos", maxCount: 10 },
    { name: "idProofFile", maxCount: 1 },
  ]),
  registerTrainingCentre
);

// Yoga Professional Registration
router.post(
  "/yoga-professional",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "certificateFiles", maxCount: 5 },
  ]),
  registerYogaProfessional
);

module.exports = router;

