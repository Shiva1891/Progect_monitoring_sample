import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("ALTER TABLE projects MODIFY COLUMN project_type JSON NULL;ALTER TABLE projects MODIFY COLUMN enquery_date JSON NULL;", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
