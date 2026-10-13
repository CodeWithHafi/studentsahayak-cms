const express = require("express");
const router = express.Router();
const {
  uploadMedia,
  getMediaLibrary,
} = require("../controllers/mediaController");

router.post("/upload", uploadMedia);
router.get("/", getMediaLibrary);

module.exports = router;
