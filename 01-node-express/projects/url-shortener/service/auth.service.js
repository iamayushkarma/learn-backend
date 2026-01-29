const jwt = require("jsonwebtoken");
function setUser(user) {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
  );
}
function getuser(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return console.log("error from jwt:", error);
  }
}
module.exports = { setUser, getuser };
