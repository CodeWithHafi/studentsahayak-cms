const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const db = require("../config/db");

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer in-memory storage (RAM) for Vercel compatibility
const storage = multer.memoryStorage();

// File Filter (Only allow images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const isExtValid = allowedTypes.test(
    file.originalname.split(".").pop().toLowerCase(),
  );
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files and PDFs are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
}).single("mediaFile"); // Matches the 'mediaFile' field name in your frontend form

// Handle the Upload Request
const uploadMedia = (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
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

    try {
      // Helper function to stream buffer from memory into Cloudinary
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "studentsahayak_cms",
              resource_type: "auto", // Automatically handles both images and PDFs
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          Readable.from(req.file.buffer).pipe(uploadStream);
        });
      };

      const cloudinaryResult = await uploadToCloudinary();
      const file_path = cloudinaryResult.secure_url;
      const uploader_id = req.session.userId;

      // Insert Cloudinary CDN URL and details into MySQL
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

      return res.status(201).json({
        message: "File uploaded successfully to cloud",
        url: file_path,
        mediaId: result.insertId,
      });
    } catch (error) {
      console.error("Cloudinary / Database Error:", error);
      return res.status(500).json({
        error: "Failed to upload media file to cloud storage.",
      });
    }
  });
};

// Fetch Media Library List
const getMediaLibrary = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM media_assets ORDER BY created_at DESC`,
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Fetch Media Error:", err);
    return res.status(500).json({ error: "Failed to fetch media library." });
  }
};

const deleteMedia = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  const mediaId = req.params.id;

  try {
    // Delete the record from your Aiven MySQL database
    const [result] = await db.query(`DELETE FROM media_assets WHERE id = ?`, [
      mediaId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Media file not found." });
    }

    return res.status(200).json({ message: "Media deleted successfully." });
  } catch (error) {
    console.error("Delete Media Error:", error);
    return res.status(500).json({ error: "Failed to delete media file." });
  }
};

module.exports = { uploadMedia, getMediaLibrary, deleteMedia };
