// postsRoutes.js
import express from "express";
import multer from "multer";
import {
  createPost,
  getPosts,
  addComment,
  toggleLike,
  getFeedPosts,
} from "../controllers/postController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import User from "../models/userSchema.js"; // Path to your User model

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/create", authMiddleware, upload.single("image"), createPost);

// Example backend route
router.get("/getPosts/:userId", authMiddleware, getPosts);

router.post("/:postId/comments", addComment);

router.put("/:postId/likes", toggleLike);

router.get("/getFeedPosts/:userId", authMiddleware, getFeedPosts);

router.get("/:userId/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("following");
    res.status(200).json(user.following);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
