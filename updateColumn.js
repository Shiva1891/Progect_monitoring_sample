import 'dotenv/config';
import mysql from 'mysql2/promise';
import { URL } from 'url';

async function updateColumn() {
  try {
    console.log("Attempting to connect to database...");

    let dbConfig;

    if (process.env.DATABASE_URL) {
      // Parse DATABASE_URL if provided
      const url = new URL(process.env.DATABASE_URL);

      // Detect if running inside Railway
      const isRailwayInternal = process.env.RAILWAY_ENVIRONMENT === 'production'; // Railway sets this

      dbConfig = {
        host: isRailwayInternal ? url.hostname : url.hostname, // internal or public host can be same here
        user: url.username,
        password: url.password,
        database: url.pathname.slice(1),
        port: url.port || 3306
      };
    } else {
      // Fallback to separate DB env variables
      dbConfig = {
        host: process.env.RAILWAY_ENVIRONMENT === 'production'
          ? process.env.DB_HOST_INTERNAL  // internal host for Railway tasks
          : process.env.DB_HOST,          // public host for local/Docker
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
      };
    }

    console.log("Using DB config:", dbConfig);

    const db = await mysql.createConnection(dbConfig);

    console.log("✅ Database connected successfully");

    const [results] = await db.query(
      "ALTER TABLE projects MODIFY project_type JSON NULL;"
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
