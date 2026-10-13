const bcrypt = require("bcryptjs");
const db = require("../config/db");

// 1. Fetch the logged-in user's profile (Self-Service)
const getMyProfile = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  try {
    const [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at, r.role_name, d.name AS department_name
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

module.exports = { getMyProfile, updateMyPassword, getAllUsers, createUser };
