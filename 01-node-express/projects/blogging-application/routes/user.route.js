import { Router } from "express";
import { signin, signup, logout } from "../controllers/user.controller.js";

const router = Router();

router
  .route("/signin")
  .get((req, res) => {
    return res.render("signin");
  })
  .post(signin);
router
  .route("/signup")
  .get((req, res) => {
    return res.render("signup");
  })
  .post(signup);

router.get("/logout", logout);

export default router;
