import { validateUserToken } from "../services/auth.service.js";

function checkForAuthentacationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateUserToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {}
    return next();
  };
}
export { checkForAuthentacationCookie };
