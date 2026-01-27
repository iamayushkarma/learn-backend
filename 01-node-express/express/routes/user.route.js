const express = require("express");
const users = require("../data/MOCK_DATA.json");
const fs = require("fs");
const path = require("path");
const User = require("../db/userSchema");
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../controllers/user.controller");

const router = express.Router();
router.route("/").get(getAllUsers).post(createUser);

// :id special route parameter from express
router
  .route("/:id")
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);

module.exports = router;
