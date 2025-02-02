// notificationController.js
import Notification from "../models/notificationSchema.js";
import User from "../models/userSchema.js";
import Post from "../models/postSchema.js";

// Create welcome notification
export const createWelcomeNotification = async (userId) => {
  try {
    const notification = new Notification({
      recipient: userId,
      type: "welcome",
    });
    await notification.save();

    // Update user's firstLogin status
    await User.findByIdAndUpdate(userId, { firstLogin: false });

    return notification;
  } catch (error) {
    console.error("Error creating welcome notification:", error);
  }
};

// Create like notification
export const createLikeNotification = async (postId, likerId) => {
  try {
    const post = await Post.findById(postId).populate("user");

    // Don't notify if user liked their own post
    if (post.user._id.toString() === likerId.toString()) return;

    const notification = new Notification({
      recipient: post.user._id,
      sender: likerId,
      post: postId,
      type: "like",
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating like notification:", error);
  }
};

// Create follow notification
export const createFollowNotification = async (followedId, followerId) => {
  try {
    const notification = new Notification({
      recipient: followedId,
      sender: followerId,
      type: "follow",
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating follow notification:", error);
  }
};
