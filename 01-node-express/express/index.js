const express = require("express");

const app = express();
const PORT = 3002;
app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:3002/`);
});
