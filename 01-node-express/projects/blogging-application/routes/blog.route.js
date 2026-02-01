import { Router } from "express";
import { addNewBlog, createBlog } from "../controllers/blog.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.get("/addBlog", addNewBlog);
router.post("/", upload.single("coverImage"), createBlog);

export default router;
