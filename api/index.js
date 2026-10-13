const path = require("path");

// Ensure your static middleware points correctly out of the api folder into root's public folder:
app.use(express.static(path.join(__dirname, "../public")));
