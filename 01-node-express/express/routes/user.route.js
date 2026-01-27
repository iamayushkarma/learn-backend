const express = require("express");
const users = require("../data/MOCK_DATA.json");
const fs = require("fs");
const path = require("path");
const User = require("../db/userSchema");

const router = express.Router();
const filePath = path.join(__dirname, "../data/MOCK_DATA.json");

router
  .route("/")
  .get(async (req, res) => {
    const users = await User.find({});
    return res.json(users);
  })
  .post(async (req, res) => {
    const body = req.body;
    if (!body || !body.name || !body.age || !body.email) {
      return res.status(400).json({ message: "All feilds are required" });
    }
    users.push({ ...body, id: users.length + 1 });
    // fs.writeFile(filePath, JSON.stringify(users), (error, data) => {
    //   res.status(201).json({ status: "success", id: users.length });
    // });
    const createdUser = await User.create({
      name: body.name,
      age: body.age,
      email: body.email,
    });
    console.log(createdUser);
    return res.status(201).json({ message: "user created successfully!" });
  });

// :id special route parameter from express
router
  .route("/:id")
  .get(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "user not found" });
    return res.json(user);
  })
  .patch(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { email: "apple@.com" });
    return res.status(301).json({ message: "details updates" });
  })
  .delete(async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.status(200).json({ status: "deleted successfully", id });
  });

module.exports = router;
