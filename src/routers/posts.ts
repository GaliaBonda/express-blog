import express from "express";
import { Post } from "../models/post.js";
import { Category } from "../models/category.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  const categories = req.query.categories && typeof req.query.categories === 'string' ? req.query.categories?.split(","): undefined;
  const postsList = await Post.find(categories ? { category: categories } : {}).populate(
    "category",
  );
  res.send(postsList);
});

router.post("/", async (req, res): Promise<void> => {
  const category = await Category.findById(req.body.category);
  if (!category) { res.status(404).send("Category not found"); return;}

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
  });
  try {
    const createdPost = await post.save();
    if (!createdPost) res.status(500).json("The post cannot be created");

    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ error, success: false });
  }
});

router.put("/:id", async (req, res): Promise<void> => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid post ID");
  }
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      content: req.body.content,
      attachments: req.body.attachments,
      category: req.body.category,
    },
    { new: true },
  );
  if (!post) {
    res.status(400).send("Post cannot be updated");
    return;
  }
  res.send(post);
});

router.get("/count", async (req, res) => {
  const postsCount = await Post.countDocuments();
  if (postsCount === undefined) {
    res.status(500).json({ success: false });
  }
  res.status(200).send({ postsCount });
});

router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("category");
  if (!post) {
    res.status(404).json({ success: false });
  }
  res.status(200).send(post);
});

router.delete("/:id", (req, res) => {
  Post.findByIdAndDelete(req.params.id)
    .then((deletedPost) => {
      if (deletedPost) {
        return res.status(200).json({ success: true, message: "Post is deleted" });
      } else {
        res.status(404).json({ success: false, message: "Post not found" });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(400).json({ success: false, error });
    });
});

export default router;
