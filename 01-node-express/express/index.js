const express = require("express");
const homeRouter = require("./routes/addHome.route");

const app = express();
const PORT = 3002;

app.use("/", (req, res, next) => {
  console.log(req.url, req.method);
  next();
});
app.use(express.urlencoded());
app.get("/", (req, res) => {
  res.send(`
    <h1>welcome to airbbb</h1>
    <a href="/add-home">Add home</a>
    `);
});
app.use(homeRouter); // add home route
app.listen(PORT, () => {
  console.log(`server listening on http://localhost:3002/`);
});
