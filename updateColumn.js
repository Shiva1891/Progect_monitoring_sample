import 'dotenv/config';
import mysql from 'mysql2/promise';
import { URL } from 'url';

async function updateColumn() {
  try {
    console.log("Attempting to connect to database...");

    let dbConfig;

    if (process.env.DATABASE_URL) {
      // Parse Railway's DATABASE_URL
      const url = new URL(process.env.DATABASE_URL);

      dbConfig = {
        host: url.hostname,
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: url.port || 3306
      };
    } else {
      // Fallback to individual env vars
      dbConfig = {
        host: process.env.MYSQLHOST || process.env.MYSQL_PUBLIC_URL,
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE,
        port: process.env.MYSQLPORT || 3306
      };
    }

    console.log("Using DB config:", dbConfig);

    const db = await mysql.createConnection(dbConfig);

    console.log("✅ Database connected successfully");

    const [results] = await db.query(
      "ALTER TABLE projects MODIFY quantity JSON NULL; ALTER TABLE projects MODIFY expected_date JSON NULL; ALTER TABLE projects MODIFY designer_name JSON NULL; ALTER TABLE projects MODIFY design_start_date JSON NULL;"
    );

    console.log("Column updated!", results);

    await db.end();
    console.log("Connection closed.");
  } catch (err) {
    console.error("❌ Database connection or query failed:", err);
    process.exit(1);
  }
}

updateColumn();
