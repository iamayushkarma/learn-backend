const express = require("express");
const router = express.Router();
const { upload } = require("../services/multer.services");

router.get("/", (req, res) => {
  return res.render("upload");
});
router.post("/upload", upload.single("profileImage"), (req, res) => {
  console.log(req.body);
  console.log(req.file);

  return res.redirect("/");
});

module.exports = router;
