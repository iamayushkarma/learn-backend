const express = require("express");
require("dotenv").config();
const path = require("path");
const router = require("./router/url.router");
const { connectToMongoDb } = require("./connection");
const URL = require("./model/url.model");

const MONGO_URI = process.env.MONGO_URI;
const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.get("/", (req, res) => {
  res.send("its Live");
});
app.get("/test", async (req, res) => {
  const allUrls = await URL.find({});
  return res.render("home", {
    urls: allUrls,
  });
});

app.use("/url", router);
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const extry = await URL.findOneAndUpdate(
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
  res.redirect(extry.redirectURL);
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
