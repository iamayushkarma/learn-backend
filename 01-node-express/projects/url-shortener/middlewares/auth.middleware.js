const { getuser } = require("../service/auth.service.js");

function checkForAuthentication(req, res, next) {
  const token = req.cookies?.token;
  req.user = null;
  if (!token) return next();
  const user = getuser(token);
  if (user) req.user = user;
  return next();
}
function restrictTo(roles = []) {
  return function (req, res, next) {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) return res.end("UnAuthorizad");
    return next();
  };
}
module.exports = { checkForAuthentication, restrictTo };
