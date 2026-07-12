// middleware/cloudinaryUpload.js
// Replaces local-disk multer with Cloudinary storage.
// Set these 3 env vars in Render (and local .env):
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
//
// Falls back to local disk if Cloudinary vars are missing (dev mode).

const multer = require('multer');
const path = require('path');
require('dotenv').config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

let upload;

if (CLOUD_NAME && API_KEY && API_SECRET) {
  // ── Cloudinary mode (production / Render) ──────────────────────────────────
  const cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const isPdf = ext === '.pdf';
      return {
        folder: 'ayush_portal',
        resource_type: isPdf ? 'raw' : 'image',
        format: isPdf ? 'pdf' : undefined,
        public_id: `${Date.now()}-${file.fieldname}`,
        // Allow PDFs and images
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      };
    },
  });

  const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .png and .pdf files are allowed!'));
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  });

  console.log('✅ Cloudinary file storage configured');
} else {
  // ── Local disk mode (development fallback) ─────────────────────────────────
  const fs = require('fs');
  const localDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });

  const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only .jpeg, .jpg, .png and .pdf files are allowed!'));
  };

  upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  console.log('⚠️  Cloudinary env vars missing — using LOCAL disk storage (dev mode)');
}

module.exports = upload;
