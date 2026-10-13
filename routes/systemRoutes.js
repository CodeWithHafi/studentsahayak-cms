const express = require('express');
const pool = require('../config/db');
const { renderArticle, renderChapter } = require('../controllers/templateController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
});

router.get('/articles/:id/render', requireAuth, renderArticle);
router.get('/chapters/:id/render', requireAuth, renderChapter);

module.exports = router;
