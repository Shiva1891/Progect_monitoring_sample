import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("select * from projects", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
