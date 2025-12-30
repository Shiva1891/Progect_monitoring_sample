import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2/promise";

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
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    await db.query("SELECT 1");
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
}

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
    if (!all_customers) {
      return res.status(400).json({ error: "Customer name required" });
    }

    const [result] = await db.query(
      "INSERT INTO customers (all_customers) VALUES (?)",
      [all_customers]
    );

    res.status(201).json({
      id: result.insertId,
      all_customers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/projects", (req, res) => {
    const t = req.body;

    const sql = `
        INSERT INTO projects
        (jobno, project_type, enquery_date, project_name, customer, contact_person, quantity,
         expected_date, designer_name, design_start_date, design_end_date, overallstatus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        t.jobno, JSON.stringify(t.project_type), JSON.stringify(t.enquery_date), t.project_name, t.customer,
        t.contact_person, JSON.stringify(t.quantity), JSON.stringify(t.expected_date),
        JSON.stringify(t.designer_name), JSON.stringify(t.design_start_date), JSON.stringify(t.design_end_date), t.overallstatus
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...t });
    });
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
   🚀 START SERVER
================================ */
async function startServer() {
  await connectDB();


   await db.query("create table live_projects(jobno varchar(255), common_status json null, dno_1 json null, dno_2 json null, dno_3 json null, dno_4 json null, dno_5 json null, dno_6 json null, dno_7 json null, dno_8 json null, dno_9 json null, dno_10 json null, dno_11 json null, dno_12 json null, dno_13 json null, dno_14 json null, dno_15 json null, dno_16 json null, dno_17 json null, dno_18 json null, dno_19 json null, dno_20 json null, dno_21 json null, dno_22 json null, dno_23 json null, dno_24 json null, dno_25 json null, dno_26 json null, dno_27 json null, dno_28 json null, dno_29 json null, dno_30 json null, dno_31 json null, dno_32 json null, dno_33 json null, dno_34 json null, dno_35 json null, dno_36 json null, dno_37 json null, dno_38 json null, dno_39 json null, dno_40 json null, dno_41 json null, dno_42 json null, dno_43 json null, dno_44 json null, dno_45 json null, dno_46 json null, dno_47 json null, dno_48 json null, dno_49 json null, dno_50 json null, dno_51 json null);");
   //await db.query("ALTER TABLE projects MODIFY drafting JSON NULL");
   //await db.query("ALTER TABLE projects MODIFY enquery_date JSON NULL");
   //await db.query("ALTER TABLE projects MODIFY quantity JSON NULL");
   //await db.query("ALTER TABLE projects MODIFY expected_date JSON NULL");
   //await db.query("ALTER TABLE projects MODIFY designer_name JSON NULL");
      

  console.log("Column updated!");
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();










