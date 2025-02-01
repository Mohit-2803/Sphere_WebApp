import express from "express";
import multer from "multer";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getUserName,
  getUser,
  updateUserProfile,
  getHomeData,
  searchUsers,
  followUser,
  toggleFollow,
  suggestedUsers,
  getFollowers,
  getFollowing,
} from "../controllers/userController.js";
import User from "../models/userSchema.js"; // Path to your User model

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save uploaded files in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique file name
  },
});
const upload = multer({ storage });

// User Profile Routes
router.get("/getUserName/:userId", authMiddleware, getUserName);
router.get("/getUser/:userId", authMiddleware, getUser);
router.put(
  "/updateUserProfile/:userId",
  authMiddleware,
  upload.single("profilePhoto"),
  updateUserProfile
);

// Home Page Routes (Feed & Suggestions)
router.get("/getHomeData/:userId", authMiddleware, getHomeData);

// User Search
router.get("/searchUsers", authMiddleware, searchUsers);

// Follow & Unfollow Routes
router.post("/toggleFollow/:userId", authMiddleware, toggleFollow);
router.post("/followUser/:userId", authMiddleware, followUser);
router.post("/unfollowUser/:userId", authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.body;

    // Remove from current user's following
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { following: targetId },
    });

    // Remove from target user's followers
    await User.findByIdAndUpdate(targetId, {
      $pull: { followers: req.params.userId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Unfollow action failed", error });
  }
});

router.get("/suggestedUsers/:userId", authMiddleware, suggestedUsers);

router.get("/:userId/followers", authMiddleware, getFollowers);
router.get("/:userId/following", authMiddleware, getFollowing);

export default router;
