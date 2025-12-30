require("dotenv").config();
const express = require("express");
//const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
app.use(express.json());

// Serve static files
app.use(express.static("public"));

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

/* ===============================
   🏠 ROUTES
================================ */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Dashboard.html"));
});

/* ===============================
   ✅ GET APIs
================================ */
app.get("/projects", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM projects");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/customers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ✅ POST APIs
================================ */
app.post("/customers", async (req, res) => {
  try {
    const { all_customers } = req.body;
    const [result] = await db.query(
      "INSERT INTO customers (all_customers) VALUES (?)",
      [all_customers]
    );
    res.json({ id: result.insertId, all_customers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ✅ PUT APIs
================================ */
app.put("/designers/:id", async (req, res) => {
  try {
    await db.query(
      "UPDATE designers SET designers_name=? WHERE id=?",
      [req.body.designers_name, req.params.id]
    );
    res.json({ message: "Designer updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ✅ DELETE APIs
================================ */
app.delete("/designers/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM designers WHERE id=?", [req.params.id]);
    res.json({ message: "Designer deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   🚀 START SERVER (ONLY ONCE)
================================ */
async function startServer() {
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();

