const db = require("../config/db");

// Middleware to check if the user has the required role for an action
const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: "Unauthorized. Please log in." });
    }

    try {
      // Fetch the user's current role from the database
      const [users] = await db.query(
        `SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
        [req.session.userId],
      );

      if (users.length === 0)
        return res.status(401).json({ error: "User invalid." });

      const userRole = users[0].role_name;
      req.userRole = userRole; // Attach role to request for later use

      // CEO (Super Admin) bypasses all restrictions
      if (userRole === "CEO") {
        return next();
      }

      // Check if the user's role is in the allowed list for this specific route
      if (allowedRoles.includes(userRole)) {
        return next();
      }

      return res.status(403).json({
        error: "Forbidden. Your role does not have permission for this action.",
      });
    } catch (error) {
      return res.status(500).json({ error: "Security validation failed." });
    }
  };
};

module.exports = { checkRole };
