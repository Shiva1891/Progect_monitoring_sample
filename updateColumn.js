import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("ALTER TABLE projects MODIFY project_type JSON NULL;", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
