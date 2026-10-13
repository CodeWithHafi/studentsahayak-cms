const express = require("express");
const router = express.Router();
const {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
} = require("../controllers/chapterController");
const { checkRole } = require("../middleware/rbac");

router.get("/", getAllChapters);
router.get("/:id", getChapterById);

router.post(
  "/",
  checkRole([
    "Educational Content Writer",
    "Content Manager & Editor",
    "Manager",
    "CEO",
  ]),
  createChapter,
);
router.put(
  "/:id",
  checkRole([
    "Educational Content Writer",
    "Content Manager & Editor",
    "Manager",
    "CEO",
  ]),
  updateChapter,
);

router.delete("/:id", checkRole(["CEO"]), deleteChapter);

module.exports = router;
