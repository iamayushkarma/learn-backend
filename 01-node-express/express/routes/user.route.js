const express = require("express");
const users = require("../data/MOCK_DATA.json");
const fs = require("fs");

const router = express.Router();

router
  .route("/")
  .get((req, res) => {
    return res.json(users);
  })
  .post((req, res) => {
    const body = req.body;
    users.push({ ...body, id: users.length + 1 });
    fs.writeFile(
      "./data/MOCK_DATA.json",
      JSON.stringify(users),
      (error, data) => {
        res.json({ status: "success", id: users.length });
      },
    );
    return;
  });

// :id special route parameter from express
router
  .route("/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const user = users.find((user) => user.id == id);
    return res.json(user);
  })
  .patch((req, res) => {
    //Todo update user
    return res.json({ status: "pending" });
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((user) => user.id == id);
    if (index === -1) {
      return res.status(404).json({ status: "user not found" });
    }
    users.splice(index, 1);
    fs.writeFile(
      "./data/MOCK_DATA.json",
      JSON.stringify(users, null, 2),
      (err) => {
        if (err) {
          return res.status(500).json({ status: "error saving file" });
        }

        res.json({ status: "deleted successfully", id });
      },
    );
  });

module.exports = router;
