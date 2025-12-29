import mysql from "mysql2";

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.query("ALTER TABLE users MODIFY COLUMN age BIGINT;", (err, results) => {
  if (err) throw err;
  console.log("Column updated!", results);
  connection.end();
});
