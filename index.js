const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

db.query("SELECT 1", (err) => {
    if (err) {
        console.error("❌ DB error:", err);
    } else {
        console.log("✅ MySQL connected");
    }
});

app.get("/", (req, res) => {
    res.send("API running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started");
});
