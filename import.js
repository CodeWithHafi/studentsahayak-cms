require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");

async function importDatabase() {
  try {
    console.log(
      "Connecting to Aiven MySQL database with cleaned credentials...",
    );

    // Clean and trim environment variables to prevent buffer offset errors
    const db = await mysql.createConnection({
      host: String(process.env.DB_HOST).trim(),
      user: String(process.env.DB_USER).trim(),
      password: String(process.env.DB_PASSWORD).trim(),
      database: String(process.env.DB_NAME).trim(),
      port: parseInt(String(process.env.DB_PORT).trim(), 10),
      ssl: {
        rejectUnauthorized: false,
      },
      multipleStatements: true,
    });

    console.log("Connected successfully! Reading SQL dump file...");

    const sqlDump = fs.readFileSync("./Dump20261014.sql", "utf8");

    console.log("Importing tables and data into Aiven...");
    await db.query(sqlDump);

    console.log(
      "Database import completed successfully! All tables and admin user are now on Aiven.",
    );
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error("Error importing database:", error);
    process.exit(1);
  }
}

importDatabase();
