const db = require("../config/db");

const createChapter = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  const {
    board_id,
    class_id,
    subject_id,
    chapter_number,
    title,
    slug,
    seo_title,
    meta_description,
    content_json,
    status,
  } = req.body;
  const author_id = req.session.userId;
  const userRole = req.userRole;

  let initialStatus = status || "Draft";
  if (
    userRole === "Educational Content Writer" &&
    !["Draft", "Pending Edit"].includes(initialStatus)
  ) {
    return res.status(403).json({
      error: "Chapter writers can only submit Drafts or Pending Edit.",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO chapters (board_id, class_id, subject_id, chapter_number, title, slug, content_json, author_id, status, seo_title, meta_description) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        board_id,
        class_id,
        subject_id,
        chapter_number,
        title,
        slug,
        content_json,
        author_id,
        initialStatus,
        seo_title,
        meta_description,
      ],
    );

    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [
        author_id,
        `Created Chapter as ${initialStatus}`,
        "chapters",
        result.insertId,
      ],
    );

    res.status(201).json({
      message: "Chapter created successfully",
      chapterId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "URL slug already exists." });
    res.status(500).json({ error: "Internal server error." });
  }
};

const getAllChapters = async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  try {
    const [rows] = await db.query(
      `SELECT ch.id, ch.title, ch.chapter_number, ch.status, ch.updated_at, 
                    b.name AS board_name, c.name AS class_name, s.name AS subject_name
             FROM chapters ch
             LEFT JOIN boards b ON ch.board_id = b.id
             LEFT JOIN classes c ON ch.class_id = c.id
             LEFT JOIN subjects s ON ch.subject_id = s.id
             ORDER BY ch.updated_at DESC`,
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chapters." });
  }
};

const getChapterById = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });
  try {
    const [rows] = await db.query(`SELECT * FROM chapters WHERE id = ?`, [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Chapter not found." });
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error." });
  }
};

const updateChapter = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });

  const {
    board_id,
    class_id,
    subject_id,
    chapter_number,
    title,
    slug,
    seo_title,
    meta_description,
    content_json,
    status,
  } = req.body;
  const userRole = req.userRole;

  try {
    if (userRole !== "CEO") {
      if (
        userRole === "Educational Content Writer" &&
        !["Draft", "Pending Edit"].includes(status)
      ) {
        return res.status(403).json({
          error:
            "Chapter writers can only save Drafts or submit to Pending Edit.",
        });
      } else if (
        userRole === "Content Manager & Editor" &&
        !["Draft", "Pending Edit", "Pending Manager"].includes(status)
      ) {
        return res.status(403).json({
          error: "Editors can only approve to Pending Manager or reject.",
        });
      } else if (
        userRole === "Manager" &&
        !["Draft", "Pending Edit", "Pending Manager", "Pending CEO"].includes(
          status,
        )
      ) {
        return res.status(403).json({
          error: "Managers can only approve to Pending CEO or reject.",
        });
      }
    }

    await db.query(
      `UPDATE chapters SET board_id=?, class_id=?, subject_id=?, chapter_number=?, title=?, slug=?, seo_title=?, meta_description=?, content_json=?, status=? WHERE id=?`,
      [
        board_id,
        class_id,
        subject_id,
        chapter_number,
        title,
        slug,
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
        `Updated Chapter to ${status}`,
        "chapters",
        req.params.id,
      ],
    );

    res.status(200).json({ message: `Chapter updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: "Failed to update chapter." });
  }
};

const deleteChapter = async (req, res) => {
  if (!req.session || !req.session.userId)
    return res.status(401).json({ error: "Unauthorized." });
  try {
    await db.query(`DELETE FROM chapters WHERE id=?`, [req.params.id]);
    await db.query(
      `INSERT INTO audit_logs (user_id, action, target_table, target_id) VALUES (?, ?, ?, ?)`,
      [req.session.userId, "Deleted Chapter", "chapters", req.params.id],
    );
    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete chapter." });
  }
};

module.exports = {
  createChapter,
  getAllChapters,
  getChapterById,
  updateChapter,
  deleteChapter,
};
