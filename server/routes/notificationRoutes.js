import express from "express";
import Notification from "../models/notificationSchema.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all notifications for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .populate("sender", "name username profilePhoto")
      .populate("post", "content image")
      .sort("-createdAt");

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

// Create welcome notification
router.post("/welcome", authMiddleware, async (req, res) => {
  try {
    const notification = new Notification({
      recipient: req.user.userId,
      type: "welcome",
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error creating notification" });
  }
});

// Mark notification as read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
});

export default router;
