const bcrypt = require("bcryptjs");
const db = require("../config/db");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch the user AND their specific role name
    const [users] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, r.role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.email = ?`,
      [email],
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Set session
    req.session.userId = user.id;
    req.session.departmentId = user.department_id || 1;

    // Send user data (including role_name) back to the frontend
    res.status(200).json({
      message: "Logged in successfully",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_name: user.role_name, // This is the crucial missing piece!
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during login." });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to log out." });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out successfully." });
  });
};

module.exports = { login, logout };
