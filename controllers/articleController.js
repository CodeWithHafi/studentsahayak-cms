const db = require("../config/db");

const createArticle = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  const {
    title,
    slug,
    category,
    featured_image_url,
    seo_title,
    meta_description,
    content_json,
    status,
  } = req.body;
  const author_id = req.session.userId;
  const department_id = req.session.departmentId || 1;
  const userRole = req.userRole;

  let initialStatus = status || "Draft";
  if (
    userRole === "Article Writer" &&
    !["Draft", "Pending Proofread"].includes(initialStatus)
  ) {
    return res.status(403).json({
      error: "Writers can only create Drafts or submit to Pending Proofread.",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO articles (title, slug, category, author_id, department_id, status, content_json, seo_title, meta_description, featured_image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        category,
        author_id,
        department_id,
        initialStatus,
        content_json,
        seo_title,
        meta_description,
        featured_image_url,
      ],
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [
        author_id,
        `Created Article as ${initialStatus}`,
        "articles",
        result.insertId,
      ],
    );

    res.status(201).json({
      message: "Article created successfully",
      articleId: result.insertId,
    });
  } catch (err) {
    console.error("Database Error:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "URL slug already exists." });
    res.status(500).json({ error: "Internal server error." });
  }
};

const getAllArticles = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.title, a.category, a.status, a.updated_at, u.first_name, u.last_name 
             FROM articles a 
             LEFT JOIN users u ON a.author_id = u.id 
             ORDER BY a.updated_at DESC`,
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch articles." });
  }
};

const getArticleById = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });
  try {
    const [rows] = await db.query(`SELECT * FROM articles WHERE id = ?`, [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Article not found." });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error." });
  }
};

const updateArticle = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  const {
    title,
    slug,
    category,
    featured_image_url,
    seo_title,
    meta_description,
    content_json,
    status,
  } = req.body;
  const userRole = req.userRole;

  try {
    // Enforce Role-Based State Machine transitions
    if (userRole !== "CEO") {
      if (
        userRole === "Article Writer" &&
        !["Draft", "Pending Proofread"].includes(status)
      ) {
        return res.status(403).json({
          error:
            "Writers can only save as Draft or submit to Pending Proofread.",
        });
      } else if (
        userRole === "Proofreader" &&
        !["Draft", "Pending Proofread", "Pending Edit"].includes(status)
      ) {
        return res.status(403).json({
          error:
            "Proofreaders can only approve to Pending Edit or reject to Draft.",
        });
      } else if (
        userRole === "Content Manager & Editor" &&
        ![
          "Draft",
          "Pending Proofread",
          "Pending Edit",
          "Pending Manager",
        ].includes(status)
      ) {
        return res.status(403).json({
          error:
            "Editors can only approve to Pending Manager or reject to previous stages.",
        });
      } else if (
        userRole === "Manager" &&
        ![
          "Draft",
          "Pending Proofread",
          "Pending Edit",
          "Pending Manager",
          "Pending CEO",
        ].includes(status)
      ) {
        return res.status(403).json({
          error:
            "Managers can only approve to Pending CEO or reject to previous stages.",
        });
      }
    }

    await db.query(
      `UPDATE articles SET title=?, slug=?, category=?, featured_image_url=?, seo_title=?, meta_description=?, content_json=?, status=? WHERE id=?`,
      [
        title,
        slug,
        category,
        featured_image_url,
        seo_title,
        meta_description,
        content_json,
        status,
        req.params.id,
      ],
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [
        req.session.userId,
        `Updated Article to ${status}`,
        "articles",
        req.params.id,
      ],
    );

    res
      .status(200)
      .json({ message: `Article successfully moved to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update article." });
  }
};

const deleteArticle = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });
  try {
    await db.query(`DELETE FROM articles WHERE id=?`, [req.params.id]);
    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [req.session.userId, "Deleted Article", "articles", req.params.id],
    );
    res.status(200).json({ message: "Article deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete article." });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
