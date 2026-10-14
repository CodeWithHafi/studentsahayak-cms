const mysql = require("mysql2/promise");
require("dotenv").config();

// Enforce strict type conversions, trim hidden whitespace, and require SSL
const pool = mysql.createPool({
  host: String(process.env.DB_HOST).trim(),
  user: String(process.env.DB_USER).trim(),
  password: String(process.env.DB_PASSWORD).trim(),
  database: String(process.env.DB_NAME).trim(),
  port: parseInt(String(process.env.DB_PORT).trim(), 10),
  ssl: {
    rejectUnauthorized: false,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection immediately on startup
pool
  .getConnection()
  .then((connection) => {
    console.log("Successfully connected to Aiven database on Vercel!");
    connection.release();
  })
  .catch((err) => {
    console.error("Vercel Database Connection Error:", err);
  });

module.exports = pool;
