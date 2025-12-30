import 'dotenv/config';   // load environment variables
import mysql from 'mysql2';

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
  
  // Run your query
  connection.query(
    "ALTER TABLE projects MODIFY project_type JSON NULL;", 
    (err, results) => {
      if (err) {
        console.error("Query error:", err);
      } else {
        console.log("Column updated!", results);
      }
      connection.end();
    }
  );
});

