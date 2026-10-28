const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Required for secure session cookies on Vercel
app.set("trust proxy", 1);

// Security and Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS to allow both the CMS Admin and the Public Website
const allowedOrigins = [
  process.env.FRONTEND_URL, // Your CMS admin URL from Vercel env
  "https://studentsahayak.online", // Your public website
  "https://www.studentsahayak.online", // Your public website (www variant)
  "http://localhost:3000", // For local frontend testing
  "http://localhost:5000", // For local backend testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like server-to-server or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Serve static assets (CSS, images, admin dashboard UI)
app.use(express.static(path.join(__dirname, "public")));

// Secure Server-Side Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8, // 8 hours
    },
  }),
);

// Configure EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

// Import Routes and Controllers
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const {
  previewArticle,
  previewChapter,
} = require("./controllers/templateController");
const userRoutes = require("./routes/userRoutes");

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/users", userRoutes);
app.get("/preview/article/:id", previewArticle);
app.get("/preview/chapter/:id", previewChapter);
app.use("/api/public", require("./routes/publicRoutes"));

// Serve the admin dashboard HTML on /admin
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "Student Sahayak CMS API is running securely." });
});

// Only listen on a port if we are running locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}

// CRITICAL FOR VERCEL: Export the app instance
module.exports = app;
