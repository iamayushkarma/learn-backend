import User from "../models/user.model.js";

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await User.matchPasswordandGenerateToken(email, password);

    console.log("token", token);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect email or password",
    });
  }
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

const logout = async (req, res) => {
  res.clearCookie("token").redirect("/");
};

export { signin, signup, logout };
