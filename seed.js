require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function seedDatabase() {
  try {
    console.log("Connecting to Aiven MySQL database...");

    // Pass explicit ssl parameters that avoid buffer-offset parsing errors
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
      ssl: {
        rejectUnauthorized: false,
        secureProtocol: "TLS_method",
      },
    });

    console.log("Connected to Aiven MySQL successfully!");
    console.log("Starting database seed...");

    // 1. Create Departments Table & Record
    await db.query(`
            CREATE TABLE IF NOT EXISTS departments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    const [deptResult] = await db.query(
      `INSERT INTO departments (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ["CEO / SUPER ADMIN"],
    );
    const deptId = deptResult.insertId || 1;

    // 2. Create Roles Table & Record
    await db.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                role_name VARCHAR(255) NOT NULL UNIQUE,
                can_publish BOOLEAN DEFAULT TRUE,
                can_approve BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    const [roleResult] = await db.query(
      `INSERT INTO roles (role_name, can_publish, can_approve) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ["Super Admin", true, true],
    );
    const roleId = roleResult.insertId || 1;

    // 3. Create Users Table & Admin User
    await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                department_id INT,
                role_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    const passwordHash = await bcrypt.hash("admin123", 10);

    // Check if admin already exists
    const [existingUser] = await db.query(
      `SELECT id FROM users WHERE email = ?`,
      ["admin@studentsahayak.online"],
    );

    let userId;
    if (existingUser.length === 0) {
      const [userResult] = await db.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, department_id, role_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "Hafijul",
          "Islam",
          "admin@studentsahayak.online",
          passwordHash,
          deptId,
          roleId,
        ],
      );
      userId = userResult.insertId;
    } else {
      userId = existingUser[0].id;
    }

    // 4. Create Articles Table & Sample Article
    await db.query(`
            CREATE TABLE IF NOT EXISTS articles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                category VARCHAR(100),
                author_id INT,
                department_id INT,
                status VARCHAR(50),
                content_json TEXT,
                seo_title VARCHAR(255),
                meta_description TEXT,
                featured_image_url VARCHAR(508),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    const sampleHtmlContent = `
            <p class="intro">Biology often looks easy from a distance, but requires active recall.</p>
            <div class="highlight-box">
                <strong>Important Reality:</strong> Many students who complain about "weak memory" are actually facing revision overload.
            </div>
            <h2>Common Mistakes That Reduce Biology Retention</h2>
            <h3>1. Passive Reading Without Recall</h3>
            <p>This is probably the biggest reason students forget Biology quickly.</p>
        `;

    await db.query(
      `INSERT IGNORE INTO articles (title, slug, category, author_id, department_id, status, content_json, seo_title, meta_description, featured_image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "NEET Preparation Tips for Better Biology Retention",
        "better-biology-retention",
        "study-tips",
        userId,
        deptId,
        "Published",
        JSON.stringify({ html: sampleHtmlContent }),
        "NEET Biology Retention Tips | Student Sahayak",
        "Discover practical NEET Biology retention strategies and memory techniques.",
        "https://www.studentsahayak.online/articles/resources/bio-retention.jpeg",
      ],
    );

    console.log(
      "Database seeded successfully! Tables created and admin account ready.",
    );
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
