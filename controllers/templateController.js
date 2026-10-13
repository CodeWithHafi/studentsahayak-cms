const db = require("../config/db");

const previewArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT a.*, u.first_name, u.last_name 
             FROM articles a 
             LEFT JOIN users u ON a.author_id = u.id 
             WHERE a.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).send("Article not found");
    }

    const article = rows[0];
    const formattedDate = new Date(article.updated_at).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    const contentJson =
      typeof article.content_json === "string"
        ? JSON.parse(article.content_json)
        : article.content_json;

    res.render("article-template", {
      article: article,
      authorName: `${article.first_name} ${article.last_name}`,
      formattedDate: formattedDate,
      contentHtml: contentJson ? contentJson.html : "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rendering template");
  }
};

// Add this below your existing previewArticle function
const previewChapter = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT ch.*, b.name AS board_name, c.name AS class_name, s.name AS subject_name, u.first_name, u.last_name 
             FROM chapters ch
             LEFT JOIN boards b ON ch.board_id = b.id
             LEFT JOIN classes c ON ch.class_id = c.id
             LEFT JOIN subjects s ON ch.subject_id = s.id
             LEFT JOIN users u ON ch.author_id = u.id 
             WHERE ch.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).send("Chapter not found");
    }

    const chapter = rows[0];
    const contentJson =
      typeof chapter.content_json === "string"
        ? JSON.parse(chapter.content_json)
        : chapter.content_json;

    res.render("chapter-template", {
      chapter: chapter,
      authorName: `${chapter.first_name} ${chapter.last_name}`,
      contentHtml: contentJson
        ? contentJson.html
        : "<p>No content available.</p>",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rendering chapter template");
  }
};

module.exports = { previewArticle, previewChapter };
