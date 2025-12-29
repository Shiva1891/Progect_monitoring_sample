import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("ALTER TABLE projects MODIFY COLUMN design_stages JSON NULL;ALTER TABLE projects MODIFY COLUMN design_end_date JSON NULL;ALTER TABLE projects MODIFY COLUMN drafting JSON NULL;", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
