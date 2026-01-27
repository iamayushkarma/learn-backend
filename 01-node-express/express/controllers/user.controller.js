const User = require("../db/userSchema");

async function getAllUsers(req, res) {
  const users = await User.find({});
  return res.json(users);
}

const createUser = async (req, res) => {
  const body = req.body;
  if (!body || !body.name || !body.age || !body.email) {
    return res.status(400).json({ message: "All feilds are required" });
  }
  const createdUser = await User.create({
    name: body.name,
    age: body.age,
    email: body.email,
  });
  console.log(createdUser);
  return res.status(201).json({ message: "user created successfully!" });
};

const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "user not found" });
  return res.json(user);
};
const updateUserById = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { email: "example@.com" });
  return res.status(301).json({ message: "details updates" });
};
const deleteUserById = async (req, res) => {
  const id = req.params.id;
  await User.findByIdAndDelete(id);
  res.status(200).json({ status: "deleted successfully", id });
};
module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
