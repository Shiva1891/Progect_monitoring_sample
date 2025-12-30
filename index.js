require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());

// Serve static files from 'public'
app.use(express.static("public"));

let db;
if (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLDATABASE) {
  try {
    const mysql = require("mysql2");
    db = mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT || 3306
    });

    db.getConnection((err, connection) => {
      if (err) {
        console.error("❌ DB connection failed. Check Railway env vars.", err);
      } else {
        console.log("✅ MySQL connected");
        connection.release();
      }
    });
  } catch (err) {
    console.warn("⚠️ mysql2 module not installed. DB routes disabled.");
  }
} else {
  console.warn("⚠️ DB environment variables not set. DB routes disabled.");
}

// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Example API route for DB
app.get("/users", (req, res) => {
  if (!db) return res.status(503).send("DB not available");
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
