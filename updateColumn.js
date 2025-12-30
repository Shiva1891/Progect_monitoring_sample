import 'dotenv/config';
import mysql from 'mysql2/promise'; // use promise-based API

async function updateColumn() {
  try {
    console.log("Attempting to connect to database...");

    // Create a connection using environment variables
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log("✅ Database connected successfully");

    // Run your ALTER TABLE query
    const [results] = await db.query(
      "ALTER TABLE projects MODIFY project_type JSON NULL;"
    );

    console.log("Column updated!", results);

    await db.end();
    console.log("Connection closed.");
  } catch (err) {
    console.error("❌ Database connection or query failed:", err.message);
    process.exit(1);
  }
}

updateColumn();
