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

app.get("/live_projects", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM live_projects");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/processes", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM processes");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/employee", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employee");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/employee/headers", (req, res) => {
    const sql = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'employee'
        AND TABLE_SCHEMA = DATABASE()
        ORDER BY ORDINAL_POSITION
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }

        res.json(rows.map(r => r.COLUMN_NAME));
    });
});
/* ===============================
   ✅ POST APIs
================================ */
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

app.post("/designers", (req, res) => {
    const { designers_name } = req.body;

    db.query(
        "INSERT INTO designers (designers_name) VALUES (?)",
        [designers_name],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, designers_name });
        }
    );
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

app.post("/processes", (req, res) => {
    const { process_name, process_type } = req.body;

    db.query(
        "INSERT INTO processes (process_name, process_type) VALUES (?, ?)",
        [process_name, process_type],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, process_name, process_type });
        }
    );
});

app.post("/live_projects", (req, res) => {
    const { jobno } = req.body;

    db.query(
        "INSERT INTO live_projects (jobno) VALUES (?)",
        [jobno],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: result.insertId, jobno });
        }
    );
});

app.post("/employee", (req, res) => {
    const t = req.body;

    const sql = `
        INSERT INTO employee
        (designers_name, drafting, production, finish, assembly, delivery)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [
        JSON.stringify(t.designers_name), JSON.stringify(t.drafting), JSON.stringify(t.production), JSON.stringify(t.finish), JSON.stringify(t.assembly), JSON.stringify(t.delivery)
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: result.insertId, ...t });
    });
});

/* ===============================
   ✅ PUT APIs
================================ */
app.put("/projects/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body;

    let fields = [];
    let values = [];

    for (let key in body) {
        fields.push(`${key} = ?`);
        values.push(
            typeof body[key] === "object"
                ? JSON.stringify(body[key])
                : body[key]
        );
    }

    if (!fields.length)
        return res.status(400).json({ error: "No fields provided" });

    const sql = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.query(sql, values, err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Project updated", id });
    });
});

app.put("/processes/:id", (req, res) => {
    const { process_name, process_type } = req.body;

    db.query(
        "UPDATE processes SET process_name=?, process_type=? WHERE id=?",
        [process_name, process_type, req.params.id],
        err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Process updated" });
        }
    );
});

app.put("/designers/:id", (req, res) => {
    db.query(
        "UPDATE designers SET designers_name=? WHERE id=?",
        [req.body.designers_name, req.params.id],
        err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Designer updated" });
        }
    );
});

app.put("/live_projects/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body;

    let fields = [];
    let values = [];

    for (let key in body) {
        fields.push(`${key} = ?`);
        values.push(
            typeof body[key] === "object"
                ? JSON.stringify(body[key])
                : body[key]
        );
    }

    if (!fields.length)
        return res.status(400).json({ error: "No fields provided" });

    const sql = `UPDATE live_projects SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.query(sql, values, err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Project updated", id });
    });
});

app.put("/employee/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body;

    let fields = [];
    let values = [];

    for (let key in body) {
        fields.push(`${key} = ?`);
        values.push(
            typeof body[key] === "object"
                ? JSON.stringify(body[key])
                : body[key]
        );
    }

    if (!fields.length)
        return res.status(400).json({ error: "No fields provided" });

    const sql = `UPDATE employee SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    db.query(sql, values, err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Change successfully", id });
    });
});

/* ===============================
   ✅ DELETE APIs
================================ */
app.delete("/projects/:id", (req, res) => {
    db.query("DELETE FROM projects WHERE id=?", [req.params.id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Project deleted" });
    });
});

app.delete("/designers/:id", (req, res) => {
    db.query("DELETE FROM designers WHERE id=?", [req.params.id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Designer deleted" });
    });
});

app.delete("/live_projects/:jobno/dno/:dno", (req, res) => {
    const file = `C:/live_projects/${req.params.jobno}/dno/${req.params.dno}.json`;

    fs.unlink(file, err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "File deleted" });
    });
});
app.delete("/customers/:id", (req, res) => {
    db.query("DELETE FROM customers WHERE id=?", [req.params.id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Project deleted" });
    });
});
app.delete("/employee/:id", (req, res) => {
    db.query("DELETE FROM employee WHERE id=?", [req.params.id], err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "deleted" });
    });
});

/* ===============================
   🚀 START SERVER
================================ */
async function startServer() {
  await connectDB();


   //await db.query("create table processes(id int key auto_increment, process_name varchar(255), process_type varchar(255));");
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













