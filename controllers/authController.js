
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  try {
    const [users] = await db.query(
      `SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          u.password_hash,
          u.department_id,
          r.role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?
       LIMIT 1`,
      [email.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const user = users[0];

    if (
      typeof user.password_hash !== "string" ||
      !user.password_hash.trim()
    ) {
      console.error("Login failed: Stored password hash is missing or invalid.");

      return res.status(500).json({
        error: "Unable to authenticate this account.",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    if (!req.session) {
      throw new Error("Session middleware is not available.");
    }

    req.session.userId = user.id;
    req.session.departmentId = user.department_id || 1;

    req.session.save((err) => {
      if (err) {
        console.error("Session save failed:", err);

        return res.status(500).json({
          error: "Unable to create login session.",
        });
      }

      return res.status(200).json({
        message: "Logged in successfully",
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role_name: user.role_name,
        },
      });
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      error: "Server error during login.",
    });
  }
};

const logout = (req, res) => {
  if (!req.session) {
    return res.status(200).json({
      message: "Logged out successfully.",
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);

      return res.status(500).json({
        error: "Failed to log out.",
      });
    }

    res.clearCookie("connect.sid");
    return res.status(200).json({
      message: "Logged out successfully.",
    });
  });
};

module.exports = { login, logout };
