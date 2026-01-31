import dotenv from "dotenv";
import express from "express";
import path from "path";
import userRouter from "./routes/user.router.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import { checkForAuthentacationCookie } from "./middlewares/auth.middleware.js";
// env config
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();

// db connect
mongoose
  .connect("mongodb://localhost:27017/blog_db")
  .then(() => console.log("Mongo db connected"));

// ejs setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthentacationCookie("token"));

// home route res
app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

//- routes
app.use("/user", userRouter);
// server running check
app.listen(PORT, () => {
  console.log(`server is listening on http://localhost:${PORT}`);
});
