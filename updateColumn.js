import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("ALTER TABLE projects ADD purchase_jobno VARCHAR(255) after jobno;", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
