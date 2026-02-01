import { Blog } from "../models/blog.model.js";

const addNewBlog = function (req, res) {
  return res.render("addBlog", {
    user: req.user,
  });
};
const createBlog = async function (req, res) {
  const { title, body } = req.body;
  const blog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  res.redirect(`/blog/${blog._id}`);
};

const showDynamicBlog = async function (req, res) {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  console.log(blog);

  return res.render("blog", {
    user: req.user,
    blog,
  });
};
export { addNewBlog, createBlog, showDynamicBlog };
