const { nanoid } = require("nanoid");
const URL = require("../model/url.model");

async function generateNewShortUrl(req, res) {
  const body = req.body;
  if (!body.url) return res.status(400).json({ error: "url is required" });
  const shortId = nanoid(8);
  await URL.create({
    shortId: shortId,
    redirectURL: body.url,
    visitedHistory: [],
    createdBy: req.user._id,
  });
  const allUrls = await URL.find({ createdBy: req.user._id });
  return res.render("home", {
    id: shortId,
    urls: allUrls,
  });
}
async function getAnalytics(req, res) {
  const shortId = req.params.shortId;
  if (!shortId) return res.status(400).json({ error: "short id is required" });
  const result = await URL.findOne({ shortId, createdBy: req.user._id });
  if (!result) return res.status(404).json({ error: "URL not found" });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = { generateNewShortUrl, getAnalytics };
