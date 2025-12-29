require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

let db;
try {
  const mysql = require("mysql2");
  db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
  });

  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ DB connection failed:", err);
    } else {
      console.log("✅ MySQL connected");
      connection.release();
    }
  });
} catch (err) {
  console.warn("⚠️ mysql2 module not found or DB not configured. DB features disabled.");
}

// Simple health check route
app.get("/", (req, res) => {
  res.send("API running");
});

// Example DB route (only works if DB is configured)
app.get("/users", (req, res) => {
  if (!db) return res.status(503).send("DB not available");
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Listen on Railway port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
