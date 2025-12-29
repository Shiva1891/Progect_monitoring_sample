import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("ALTER TABLE projects MODIFY COLUMN designer_name JSON NULL;ALTER TABLE projects MODIFY COLUMN design_start_date JSON NULL;", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
