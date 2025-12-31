import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===============================
   🔧 HELPERS
================================ */
const toJson = v =>
  v === undefined || v === null ? null : JSON.stringify(v);

/* ===============================
   🔌 DATABASE
================================ */
let db;

async function connectDB() {
  try {
    db = await mysql.createPool({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: process.env.MYSQLPORT || 3306,
      waitForConnections: true,
      connectionLimit: 10
    });

    await db.query("SELECT 1");
    console.log("✅ MySQL connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
}

/* ===============================
   🏠 ROOT
================================ */
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Dashboard.html"));
});

app.get("/allocate", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Allocate.html"));
});

app.get("/drafting", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Drafting.html"));
});

app.get("/designer", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "Designer.html"));
});

/* ===============================
   📥 GET APIs
================================ */
const simpleGet = table => async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM ${table}`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.get("/projects", simpleGet("projects"));
app.get("/customers", simpleGet("customers"));
app.get("/designers", simpleGet("designers"));
app.get("/processes", simpleGet("processes"));
app.get("/employee", simpleGet("employee"));
app.get("/live_projects", simpleGet("live_projects"));

app.get("/employee/headers", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'employee'
        AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    res.json(rows.map(r => r.COLUMN_NAME));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   📤 POST APIs
================================ */
app.post("/customers", async (req, res) => {
  try {
    const [r] = await db.query(
      "INSERT INTO customers (all_customers) VALUES (?)",
      [req.body.all_customers]
    );
    res.json({ id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/designers", async (req, res) => {
  try {
    const [r] = await db.query(
      "INSERT INTO designers (designers_name) VALUES (?)",
      [req.body.designers_name]
    );
    res.json({ id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/projects", async (req, res) => {
  try {
    const t = req.body;

    const [r] = await db.query(`
      INSERT INTO projects
      (jobno, project_type, enquery_date, project_name, customer, contact_person,
       quantity, expected_date, designer_name, design_start_date, design_end_date, overallstatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      t.jobno,
      toJson(t.project_type),
      toJson(t.enquery_date),
      t.project_name,
      t.customer,
      t.contact_person,
      toJson(t.quantity),
      toJson(t.expected_date),
      toJson(t.designer_name),
      toJson(t.design_start_date),
      toJson(t.design_end_date),
      t.overallstatus
    ]);

    res.json({ id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/employee", async (req, res) => {
  try {
    const t = req.body;

    const [r] = await db.query(`
      INSERT INTO employee
      (employee_names, department)
      VALUES (?, ?)
    `, [
      toJson(t.employee_names),
      toJson(t.department)
    ]);

    res.json({ id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/processes", async (req, res) => {
  try {
    const { process_name, process_type } = req.body;

    const [r] = await db.query(
      "INSERT INTO processes (process_name, process_type) VALUES (?, ?)",
      [process_name, process_type]
    );

    res.json({ id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/live_projects", async (req, res) => {
  try {
    const { jobno } = req.body;

    const [r] = await db.query(
      "INSERT INTO live_projects (jobno) VALUES (?)",
      [jobno]
    );

    res.json({ id: r.insertId, jobno });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   ✏️ PUT APIs (UNIVERSAL)
================================ */
const dynamicUpdate = table => async (req, res) => {
  try {
    const fields = [];
    const values = [];

    for (const key in req.body) {
      fields.push(`${key}=?`);
      values.push(
        typeof req.body[key] === "object"
          ? toJson(req.body[key])
          : req.body[key]
      );
    }

    if (!fields.length)
      return res.status(400).json({ error: "No fields" });

    values.push(req.params.id);

    await db.query(
      `UPDATE ${table} SET ${fields.join(", ")} WHERE id=?`,
      values
    );

    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.put("/projects/:id", dynamicUpdate("projects"));
app.put("/customers/:id", dynamicUpdate("customers"));
app.put("/employee/:id", dynamicUpdate("employee"));
app.put("/designers/:id", dynamicUpdate("designers"));
app.put("/processes/:id", dynamicUpdate("processes"));
app.put("/live_projects/:id", dynamicUpdate("live_projects"));

/* ===============================
   🗑️ DELETE APIs
================================ */
const simpleDelete = table => async (req, res) => {
  try {
    await db.query(`DELETE FROM ${table} WHERE id=?`, [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

app.delete("/projects/:id", simpleDelete("projects"));
app.delete("/customers/:id", simpleDelete("customers"));
app.delete("/designers/:id", simpleDelete("designers"));
app.delete("/employee/:id", simpleDelete("employee"));
app.delete("/processes/:id", simpleDelete("processes"));
app.delete("/live_projects/:id", simpleDelete("live_projects"));

app.delete("/employee/department/delete", async (req, res) => {
  try {
    const { key } = req.body;

    const [rows] = await db.query(
      "SELECT department FROM employee WHERE id = 1"
    );

    let departments = JSON.parse(rows[0].department);

    departments = departments.filter(obj => !obj[key]);

    await db.query(
      "UPDATE employee SET department = ? WHERE id = 1",
      [JSON.stringify(departments)]
    );

    res.json({ message: "Department deleted", departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/employee/department/edit", async (req, res) => {
  try {
    const { key, value } = req.body;
    // key = department_1, value = NEW NAME

    const [rows] = await db.query(
      "SELECT department FROM employee WHERE id = 1"
    );

    let departments = JSON.parse(rows[0].department);

    departments = departments.map(obj =>
      obj[key] ? { [key]: value } : obj
    );

    await db.query(
      "UPDATE employee SET department = ? WHERE id = 1",
      [JSON.stringify(departments)]
    );

    res.json({ message: "Department updated", departments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* ===============================
   🚀 START
================================ */
async function start() {
  await connectDB();

   await db.query("TRUNCATE TABLE employee");
   await db.query("ALTER TABLE employee MODIFY COLUMN department VARCHAR(255)");
   //await db.query("ALTER TABLE employee DROP COLUMN assembly;");
   //await db.query("ALTER TABLE employee DROP COLUMN delivery;");
   //await db.query("ALTER TABLE employee RENAME COLUMN designers_name TO employee_names;");
   //await db.query("ALTER TABLE projects MODIFY designer_name JSON NULL");
      

  console.log("Column updated!");
   
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
}

start();























