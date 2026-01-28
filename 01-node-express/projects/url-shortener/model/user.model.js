const mongoose = require("mongoose");

const userSchame = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchame);
module.exports = User;
