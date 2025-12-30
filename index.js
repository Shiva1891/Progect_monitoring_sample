import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// MySQL setup (optional, only if env vars are set)
let db;
if (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLDATABASE) {
  db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
  });

  db.getConnection((err, connection) => {
    if (err) console.error("❌ DB connection failed.", err);
    else {
      console.log("✅ MySQL connected");
      connection.release();
    }
  });
}

// Serve Dashboard.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Dashboard.html"));
});

// Example API route
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
