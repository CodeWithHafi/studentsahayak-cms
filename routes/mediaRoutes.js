const express = require("express");
const router = express.Router();
const {
  uploadMedia,
  getMediaLibrary,
  deleteMedia,
} = require("../controllers/mediaController");

// Mount upload and media library endpoints
router.post("/upload", uploadMedia);
router.get("/", getMediaLibrary);
router.delete("/:id", deleteMedia);

module.exports = router;
