const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a clean, unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const cleanName = file.originalname
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(ext, "");
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// File Filter (Only allow images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files and PDFs are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
}).single("mediaFile"); // 'mediaFile' is the form field name

// Handle the Upload Request
const uploadMedia = (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file selected." });
    }

    const file_path = `/uploads/${req.file.filename}`;
    const uploader_id = req.session.userId;

    try {
      const [result] = await db.query(
        `INSERT INTO media_assets (uploader_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)`,
        [
          uploader_id,
          req.file.originalname,
          file_path,
          req.file.mimetype,
          req.file.size,
        ],
      );

      res.status(201).json({
        message: "File uploaded successfully",
        url: file_path,
        mediaId: result.insertId,
      });
    } catch (dbErr) {
      console.error("Database Error:", dbErr);
      res
        .status(500)
        .json({ error: "Failed to save media record to database." });
    }
  });
};

const getMediaLibrary = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM media_assets ORDER BY created_at DESC`,
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch media library." });
  }
};

module.exports = { uploadMedia, getMediaLibrary };
