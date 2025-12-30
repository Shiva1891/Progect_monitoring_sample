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

// MySQL setup
let db;
/* ===============================
   🔌 DATABASE CONNECTION
================================ */
async function connectDB() {
  try {
    console.log("Attempting to connect to database...");

    db = await mysql.createPool({
      uri: process.env.MYSQL_URL || process.env.DATABASE_URL, // Railway MySQL URL
    });

    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

// Serve Dashboard.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Dashboard.html"));
});

// GET projects
app.get("/projects", (req, res) => {
  if (!db) return res.status(503).json({ error: "DB not available" });

  db.query("SELECT * FROM projects", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST projects (CREATE)
app.post("/projects", (req, res) => {
  if (!db) return res.status(503).json({ error: "DB not available" });

  const {
    jobno,
    project_type,
    project_name,
    customer,
    contact_person,
    overallstatus
  } = req.body;

  if (!jobno || !project_name || !customer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO projects
    (jobno, project_type, project_name, customer, contact_person, overallstatus)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [jobno, project_type, project_name, customer, contact_person, overallstatus],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        message: "Project created",
        id: result.insertId
      });
    }
  );
});

// GET customers
app.get("/customers", (req, res) => {
  if (!db) return res.status(503).json({ error: "DB not available" });

  db.query("SELECT * FROM customers", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/customers", (req, res) => {
    const { all_customers } = req.body;

    db.query(
        "INSERT INTO customers (all_customers) VALUES (?)",
        [all_customers],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, all_customers });
        }
    );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

