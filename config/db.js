const mysql = require("mysql2/promise");
require("dotenv").config();

// Create a connection pool using cleaned environment variables and mandatory SSL
const pool = mysql.createPool({
  host: String(process.env.DB_HOST).trim(),
  user: String(process.env.DB_USER).trim(),
  password: String(process.env.DB_PASSWORD).trim(),
  database: String(process.env.DB_NAME).trim(),
  port: parseInt(String(process.env.DB_PORT).trim(), 10),
  ssl: {
    rejectUnauthorized: false, // Required by Aiven to accept the connection
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
