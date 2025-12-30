import 'dotenv/config';   // load environment variables
import mysql from 'mysql2';

const connection = mysql.createConnection({
  host: process.env.DB_HOST,      // e.g., "yourproject.mysql.railway.app"
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL!");
  
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

