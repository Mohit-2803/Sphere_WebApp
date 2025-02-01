// postController.js
import Post from "../models/postSchema.js";
import User from "../models/userSchema.js";

export const createPost = async (req, res) => {
  try {
    const { content, userId } = req.body;
    const image = req.file ? `/uploads/posts/${req.file.filename}` : null;

    const newPost = new Post({
      user: userId,
      content,
      image,
    });

    let savedPost = await newPost.save();

    // Populate user details before sending response
    savedPost = await savedPost.populate("user", "username profilePhoto");

    // Update user's posts array
    await User.findByIdAndUpdate(
      userId,
      { $push: { posts: savedPost._id } },
      { new: true }
    );

    res.status(201).json(savedPost); // ✅ Return populated post
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

// Example backend route
export const getPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const posts = await Post.find({ user: userId })
      .populate("user", "name username profilePhoto")
      .populate("comments.user", "name username profilePhoto")
      .populate({
        path: "likes",
        select: "_id username profilePhoto", // Add this population
      });
    res.status(200).json({ posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

// add comment
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: userId,
      content,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Get updated post with populated comments
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profilePhoto")
      .populate("comments.user", "username profilePhoto");

    const addedComment = updatedPost.comments[updatedPost.comments.length - 1];

    res.status(201).json(addedComment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

// add Like
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user already liked the post
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    // Get updated post with populated data
    const updatedPost = await Post.findById(postId)
      .populate("user", "username profilePhoto")
      .populate("likes", "_id username profilePhoto");

    res.status(200).json(updatedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating likes", error: error.message });
  }
};

export const getFeedPosts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("following");

    const followingIds = user.following.map((u) => u._id);
    const posts = await Post.find({ user: { $in: followingIds } })
      .populate("user", "username profilePhoto")
      .populate("comments.user", "username profilePhoto")
      .sort("-createdAt");

    // Always return array in consistent format
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    // Return empty array on error
    res.status(500).json([]);
  }
};
