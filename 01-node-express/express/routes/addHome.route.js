const express = require("express");

const addHomeRouter = express.Router();

addHomeRouter.get("/add-home", (req, res) => {
  res.send(`
    <h1>Add home</h1>
    <form action="/add-home" method="POST">
    <input name="home" type="text" placeholder="Add home to airbbb" />
    <button>Add</button>
    </form>
    `);
});
addHomeRouter.post("/add-home", (req, res) => {
  console.log(req.body);
  res.send(`
    <h1>Home added successfully!!</h1>
    <a href="/">Go to home page</a>
    `);
});

module.exports = addHomeRouter;
