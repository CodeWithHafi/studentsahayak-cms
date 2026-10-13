// Protects routes, ensuring only logged-in users have access
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized access. Please log in." });
};

// Protects routes based on hierarchy (e.g., only CEO or Admin can access)
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.role) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (allowedRoles.includes(req.session.role)) {
      return next();
    }
    return res
      .status(403)
      .json({ error: "Forbidden: Insufficient permissions for this action." });
  };
};

module.exports = { requireAuth, requireRole };
