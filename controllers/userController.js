const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer in-memory storage (RAM) for Vercel compatibility

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for avatar
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
}).single("avatar");

// Upload or Replace Profile Picture
const updateProfilePicture = (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file)
      return res.status(400).json({ error: "No image file provided." });

    try {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "studentsahayak_avatars" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
          Readable.from(req.file.buffer).pipe(stream);
        });
      };

      const result = await uploadToCloudinary();
      const imageUrl = result.secure_url;

      await db.query("UPDATE users SET profile_picture_url = ? WHERE id = ?", [
        imageUrl,
        req.session.userId,
      ]);

      return res.status(200).json({
        message: "Profile picture updated successfully.",
        profile_picture_url: imageUrl,
      });
    } catch (error) {
      console.error("Avatar Upload Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to upload profile picture." });
    }
  });
};

// Remove Profile Picture
const removeProfilePicture = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    await db.query("UPDATE users SET profile_picture_url = NULL WHERE id = ?", [
      req.session.userId,
    ]);
    return res
      .status(200)
      .json({ message: "Profile picture removed successfully." });
  } catch (error) {
    console.error("Remove Avatar Error:", error);
    return res.status(500).json({ error: "Failed to remove profile picture." });
  }
};

// 1. Fetch the logged-in user's profile (Self-Service)
const getMyProfile = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  try {
    const [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, r.role_name, d.name AS department_name, u.profile_picture_url
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN departments d ON u.department_id = d.id
             WHERE u.id = ?`,
      [req.session.userId],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "User not found." });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error." });
  }
};

// 2. Secure Password Update (Self-Service)
const updateMyPassword = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  const { currentPassword, newPassword } = req.body;

  try {
    const [users] = await db.query(
      `SELECT password_hash FROM users WHERE id = ?`,
      [req.session.userId],
    );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found." });

    const validPassword = await bcrypt.compare(
      currentPassword,
      users[0].password_hash,
    );
    if (!validPassword)
      return res.status(400).json({ error: "Incorrect current password." });

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [
      newHash,
      req.session.userId,
    ]);

    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [req.session.userId, "Updated Password", "users", req.session.userId],
    );

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update password." });
  }
};

// 3. Fetch all active employees (Manager/CEO Only)
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, r.role_name, d.name AS department_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN departments d ON u.department_id = d.id
             ORDER BY u.created_at DESC`,
    );
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users." });
  }
};

// 4. Provision a new employee account (Manager/CEO Only)
const createUser = async (req, res) => {
  const { first_name, last_name, email, password, role_name } = req.body;

  try {
    const [roles] = await db.query(`SELECT id FROM roles WHERE role_name = ?`, [
      role_name,
    ]);
    if (roles.length === 0)
      return res.status(400).json({ error: "Invalid role." });
    const role_id = roles[0].id;

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Defaulting department_id to 1 for now
    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role_id, department_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, password_hash, role_id, 1],
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [
        req.session.userId,
        `Created new employee: ${email}`,
        "users",
        result.insertId,
      ],
    );

    res.status(201).json({ message: "Employee account created successfully." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ error: "An account with this email already exists." });
    res.status(500).json({ error: "Failed to create user." });
  }
};

// Update User (CEO & Manager)
const updateUser = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  const { first_name, last_name, email, role_name } = req.body;
  const targetUserId = req.params.id;

  try {
    // Look up the role_id for the given role_name
    const [roles] = await db.query("SELECT id FROM roles WHERE role_name = ?", [
      role_name,
    ]);
    if (roles.length === 0)
      return res.status(400).json({ error: "Invalid role selected." });

    const role_id = roles[0].id;

    await db.query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, role_id = ? WHERE id = ?`,
      [first_name, last_name, email, role_id, targetUserId],
    );

    return res.status(200).json({ message: "User updated successfully." });
  } catch (error) {
    console.error("Update User Error:", error);
    return res.status(500).json({ error: "Failed to update user." });
  }
};

// Delete User (CEO Only)
const deleteUser = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized access." });
  }

  try {
    // SECURITY CHECK: Verify the requester is actually a CEO
    const [requester] = await db.query(
      `SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
      [req.session.userId],
    );

    if (requester.length === 0 || requester[0].role_name !== "CEO") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only the CEO can delete accounts." });
    }

    // Prevent the CEO from deleting themselves
    if (parseInt(req.params.id) === req.session.userId) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account." });
    }

    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({ error: "Failed to delete user." });
  }
};

module.exports = {
  getMyProfile,
  updateMyPassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateProfilePicture,
  removeProfilePicture,
};
