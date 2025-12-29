const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

// keep process alive
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});

// safety: log if process exits
process.on("exit", () => {
  console.log("Process exiting");
});

