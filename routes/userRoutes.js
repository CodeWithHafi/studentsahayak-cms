const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyPassword,
  getAllUsers,
  createUser,
} = require("../controllers/userController");
const { checkRole } = require("../middleware/rbac");

// Self-service profile routes (Any logged-in user)
router.get("/profile", getMyProfile);
router.put("/password", updateMyPassword);

// Admin-only User Management routes (Strictly CEO & Manager)
router.get("/", checkRole(["CEO", "Manager"]), getAllUsers);
router.post("/", checkRole(["CEO", "Manager"]), createUser);

module.exports = router;
