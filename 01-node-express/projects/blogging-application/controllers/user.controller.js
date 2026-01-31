import User from "../models/user.model.js";

const signin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.matchPassword(email, password);

  console.log("user", user);
  return res.redirect("/");
};
const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
  });
  return res.redirect("/");
};

export { signin, signup };
