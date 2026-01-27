const express = require("express");
const homeRouter = require("./routes/addHome.route");
const userRouter = require("./routes/user.route");
const connectDB = require("./db/dbconnection");
require("dotenv").config();

const app = express();
const PORT = 3002;

app.use("/", (req, res, next) => {
  console.log(req.url, req.method);
  next();
});
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.send(`
    <h1>welcome to airbbb</h1>
    <a href="/add-home">Add home</a>
    `);
});
app.use(homeRouter); // add home route
app.use("/api/users", userRouter);

// for handeling 404 page, must be at end
app.use((req, res, next) => {
  res.status(404).send("<h1>404 Page not found</h1>");
});
connectDB();
app.listen(PORT, () => {
  console.log(`server listening on http://localhost:3002/`);
});
