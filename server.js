const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Security and Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Serve static assets (CSS, images, admin dashboard UI)
app.use(express.static("public"));

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
app.set("views", "./templates");

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

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "Student Sahayak CMS API is running securely." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CMS Backend initializing on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Only listen on a port if we are running locally (not on Vercel)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on port ${PORT}`);
  });
}
