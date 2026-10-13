const express = require("express");
const path = require("path");
const session = require("express-session");

// 1. Initialize Express app FIRST
const app = express();

// 2. Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// 3. Static files middleware (pointing out of 'api' folder to root 'public')
app.use(express.static(path.join(__dirname, "../public")));

// 4. Your Routes (Example: app.use('/api', apiRoutes); or your admin/auth routes)
// Make sure you use 'app' here AFTER it is initialized above:
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// 5. CRITICAL FOR VERCEL: Export the app instance
module.exports = app;
