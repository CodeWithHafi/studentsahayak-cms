const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Fetch a single article by its URL slug
router.get("/article/:slug", async (req, res) => {
  try {
    const [article] = await db.query(
      `SELECT title, content, seo_title, meta_description, published_at 
       FROM articles 
       WHERE slug = ? AND status = 'published'`,
      [req.params.slug],
    );

    if (article.length === 0) {
      return res.status(404).json({ error: "Article not found." });
    }

    res.status(200).json(article[0]);
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
