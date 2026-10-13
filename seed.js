require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  try {
    console.log("Connecting to Aiven MySQL database...");

    // Establish connection with Aiven SSL configuration and parsed port
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
      ssl: {
        rejectUnauthorized: false, // Required for Aiven cloud connection
      },
    });

    console.log("Connected to Aiven MySQL successfully!");
    console.log("Starting database seed...");

    // 1. Create Department
    const [deptResult] = await db.query(
      `INSERT INTO departments (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ["CEO / SUPER ADMIN"],
    );
    const deptId = deptResult.insertId || 1;

    // 2. Create Role
    const [roleResult] = await db.query(
      `INSERT INTO roles (role_name, can_publish, can_approve) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ["Super Admin", true, true],
    );
    const roleId = roleResult.insertId || 1;

    // 3. Create Admin User (Hafijul Islam)
    const passwordHash = await bcrypt.hash("admin123", 10);
    const [userResult] = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, department_id, role_id) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Hafijul",
        "Islam",
        "admin@studentsahayak.online",
        passwordHash,
        deptId,
        roleId,
      ],
    );
    const userId = userResult.insertId;

    // 4. Create Sample Article (Matching the Biology Template)
    const sampleHtmlContent = `
            <p class="intro">Biology often looks easy from a distance, but requires active recall.</p>
            <div class="highlight-box">
                <strong>Important Reality:</strong> Many students who complain about "weak memory" are actually facing revision overload.
            </div>
            <h2>Common Mistakes That Reduce Biology Retention</h2>
            <h3>1. Passive Reading Without Recall</h3>
            <p>This is probably the biggest reason students forget Biology quickly.</p>
            <table class="table-style">
                <tr><th>Revision Stage</th><th>Ideal Timing</th></tr>
                <tr><td>First Revision</td><td>Within 24 hours</td></tr>
            </table>
        `;

    const contentJson = JSON.stringify({ html: sampleHtmlContent });

    await db.query(
      `INSERT INTO articles (title, slug, category, author_id, department_id, status, content_json, seo_title, meta_description, featured_image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "NEET Preparation Tips for Better Biology Retention",
        "better-biology-retention",
        "study-tips",
        userId,
        deptId,
        "Published",
        contentJson,
        "NEET Biology Retention Tips | Student Sahayak",
        "Discover practical NEET Biology retention strategies and memory techniques.",
        "https://www.studentsahayak.online/articles/resources/bio-retention.jpeg",
      ],
    );

    console.log(
      "Database seeded successfully! You can now log in with admin@studentsahayak.online / admin123",
    );

    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
