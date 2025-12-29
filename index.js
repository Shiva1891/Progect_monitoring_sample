require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());

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

// Health check route
app.get("/", (req, res) => res.send("API running"));

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
