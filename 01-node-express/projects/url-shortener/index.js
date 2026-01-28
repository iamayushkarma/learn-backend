const express = require("express");
require("dotenv").config();
const path = require("path");
const router = require("./router/url.router");
const { connectToMongoDb } = require("./connection");
const URL = require("./model/url.model");
const staticRouter = require("./router/static.router");

const MONGO_URI = process.env.MONGO_URI;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use("/", staticRouter);
app.use("/url", router);
app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    },
  );
  res.redirect(entry.redirectURL);
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
