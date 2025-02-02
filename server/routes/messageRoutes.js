import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import Message from "../models/messageSchema.js";
import mongoose from "mongoose";

const router = express.Router();

// In your POST route:
router.post("/", authMiddleware, async (req, res) => {
  try {
    const message = new Message({
      sender: new mongoose.Types.ObjectId(req.user.id), // Convert to ObjectId
      receiver: new mongoose.Types.ObjectId(req.body.receiver), // Convert to ObjectId
      content: req.body.content,
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// messageRoutes.js
router.put("/mark-as-read/:senderId", authMiddleware, async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.user.userId; // Authenticated user is the receiver

    // Mark all messages from the sender as read
    await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get unread counts per conversation
router.get("/unread-counts-sidebar", authMiddleware, async (req, res) => {
  try {
    const counts = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(req.user.userId),
          read: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(counts);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// messageRoutes.js
router.get("/unread-count/:senderId", authMiddleware, async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const receiverId = req.user.userId; // Authenticated user is the receiver

    const count = await Message.countDocuments({
      sender: senderId,
      receiver: receiverId,
      read: false, // Only count unread messages
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get message history
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.userId, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.userId },
      ],
    }).sort("timestamp");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all conversation partners for the current user
router.get("/conversations/partners", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const partners = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessageTimestamp: { $max: "$timestamp" }, // Get latest message time
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          username: "$user.username",
          profilePhoto: "$user.profilePhoto",
          lastMessageTimestamp: 1,
        },
      },
      { $sort: { lastMessageTimestamp: -1 } }, // Sort by most recent interaction
    ]);

    res.status(200).json(partners);
  } catch (error) {
    console.error("Error fetching conversation partners:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
