const express = require("express");
const router = express();
const {
  generateNewShortUrl,
  getAnalytics,
} = require("../controllers/url.controller.js");

router.post("/", generateNewShortUrl);
router.get("/analytics/:shortId", getAnalytics);

module.exports = router;
