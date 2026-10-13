const express = require("express");
const router = express.Router();
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const { checkRole } = require("../middleware/rbac"); // Import the security gate

// Anyone logged in can read the list and view individual articles in the dashboard
router.get("/", getAllArticles);
router.get("/:id", getArticleById);

// ONLY Writers, Editors, Managers, and CEOs can create or update articles
router.post(
  "/",
  checkRole([
    "Article Writer",
    "Proofreader",
    "Content Manager & Editor",
    "Manager",
  ]),
  createArticle,
);
router.put(
  "/:id",
  checkRole([
    "Article Writer",
    "Proofreader",
    "Content Manager & Editor",
    "Manager",
  ]),
  updateArticle,
);

// ONLY the CEO can permanently delete an article
router.delete("/:id", checkRole(["CEO"]), deleteArticle);

module.exports = router;
