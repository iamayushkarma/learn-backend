import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    profileImageUrl: user.profileImageUrl,
    role: user.role,
  };
  const token = jwt.sign(payload, secret);
  return token;
}
function validateUserToken(token) {
  const payload = jwt.verify(token, secret);
  return payload;
}

export { createTokenForUser, validateUserToken };
