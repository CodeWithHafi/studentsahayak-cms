const express = require("express");
const router = express.Router();
const {
  uploadMedia,
  getMediaLibrary,
} = require("../controllers/mediaController");

// Mount upload and media library endpoints
router.post("/upload", uploadMedia);
router.get("/", getMediaLibrary);

module.exports = router;
