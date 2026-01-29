const express = require("express");
require("dotenv").config();
const path = require("path");
const urlRouter = require("./router/url.router");
const { connectToMongoDb } = require("./connection");
const URL = require("./model/url.model");
const staticRouter = require("./router/static.router");
const userRouter = require("./router/user.route");
const cookieParser = require("cookie-parser");
const {
  checkForAuthentication,
  restrictTo,
} = require("./middlewares/auth.middleware");

const MONGO_URI = process.env.MONGO_URI;
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(checkForAuthentication);
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// routing
app.use("/url", restrictTo(["NORMAL", "ADMIN"]), urlRouter);
app.use("/user", userRouter);
app.use("/", staticRouter);
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true },
    );
    if (!entry) {
      return res.status(404).send("Short URL not found");
    }
    return res.redirect(entry.redirectURL);
  } catch (err) {
    console.error("Error while redirecting:", err);
    return res.status(500).send("Internal Server Error");
  }
});
(async function () {
  try {
    await connectToMongoDb(MONGO_URI);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, (req, res) => {
      console.log(`server listening on http://localhost:${process.env.PORT}/`);
    });
  } catch (error) {
    console.log("error connecting server: ", error);
  }
})();
