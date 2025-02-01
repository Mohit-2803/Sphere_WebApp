import User from "../models/userSchema.js"; // Path to your User model
import Post from "../models/postSchema.js";

// Function to get user data
export const getUserName = async (req, res) => {
  try {
    // The user data is available through req.userId, set by the authMiddleware
    const userId = req.params.userId;

    // Find the user based on the userId and select only 'name' and 'username'
    const user = await User.findById(userId).select(
      "name username profilePhoto"
    ); // Only select 'name' and 'username'

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct full URL for profile photo
    const profilePhotoUrl = user.profilePhoto
      ? `${req.protocol}://${req.get("host")}${user.profilePhoto}`
      : null;

    // Send the user data in the response, including only 'name' and 'username'
    return res.status(200).json({
      message: "User data retrieved successfully",
      user: {
        name: user.name,
        username: user.username,
        profilePhoto: profilePhotoUrl,
      },
    });
  } catch (error) {
    console.error("Error during getUser:", error);

    // Detailed error message for debugging in development (be careful in production)
    return res.status(500).json({
      message: "Server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : error.message,
    });
  }
};

// Update the getUser function
export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select(
      "name username email bio gender profilePhoto followers following posts createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct full URL for profile photo
    const profilePhotoUrl = user.profilePhoto
      ? `${req.protocol}://${req.get("host")}${user.profilePhoto}`
      : null;

    // Extract only the date part from createdAt
    const formattedCreatedAt = new Date(user.createdAt)
      .toISOString()
      .split("T")[0];

    res.status(200).json({
      message: "User profile retrieved successfully",
      user: {
        ...user._doc,
        profilePhoto: profilePhotoUrl,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        posts: user.posts.length,
        createdAt: formattedCreatedAt, // Sending only the date part
      },
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update the updateUserProfile function
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, username, bio, gender } = req.body;
    const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if the username is being updated and if it's available
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePhoto) user.profilePhoto = profilePhoto;

    await user.save();

    // Construct full URL for the updated profile photo
    const profilePhotoUrl = user.profilePhoto
      ? `${req.protocol}://${req.get("host")}${user.profilePhoto}`
      : null;

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        username: user.username,
        bio: user.bio,
        gender: user.gender,
        profilePhoto: profilePhotoUrl,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// userController.js
export const getHomeData = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("following");

    if (user.following.length >= 5) {
      const posts = await Post.find({
        user: { $in: user.following },
      })
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user")
        .populate("likes");

      return res.json({ feedPosts: posts });
    }

    // Get suggested users (not following, ordered by follower count)
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
          followers: { $nin: [userId] },
        },
      },
      { $addFields: { followersCount: { $size: "$followers" } } },
      { $sort: { followersCount: -1 } },
      { $limit: 15 },
      {
        $project: {
          name: 1,
          username: 1,
          profilePhoto: 1,
          bio: 1,
          followersCount: 1,
        },
      },
    ]);

    console.log("suggestedUsers", suggestedUsers);

    res.json({ suggestedUsers });
  } catch (error) {
    res.status(500).json({ message: "Error fetching home data", error });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    })
      .select("name username profilePhoto followersCount bio")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error });
  }
};

export const followUser = async (req, res) => {
  try {
    const { targetId } = req.body;

    // Add to current user's following
    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { following: targetId },
    });

    // Add to target user's followers
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: req.params.userId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Follow action failed", error });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetId } = req.body;

    // Convert targetId to ObjectId if necessary (though Mongoose handles this)
    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.following.some((followId) =>
      followId.equals(targetId)
    );

    if (isFollowing) {
      user.following.pull(targetId);
      targetUser.followers.pull(userId);
    } else {
      user.following.addToSet(targetId);
      targetUser.followers.addToSet(userId);
    }

    await user.save();
    await targetUser.save();

    res.status(200).json({
      success: true,
      action: isFollowing ? "unfollow" : "follow",
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error toggling follow", error: error.message });
  }
};

export const suggestedUsers = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get the current user to check who they are following
    const currentUser = await User.findById(userId).select("following");

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Get suggested users (not following, ordered by follower count)
    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // Exclude the current user
          _id: { $nin: currentUser.following }, // Ensure user is not followed by the current user
        },
      },
      {
        $addFields: { followersCount: { $size: "$followers" } }, // Add followers count to each user
      },
      { $sort: { followersCount: -1 } }, // Sort users by followers count in descending order
      { $limit: 15 }, // Limit to 15 users
      {
        $project: {
          name: 1,
          username: 1,
          profilePhoto: 1,
          bio: 1,
          followersCount: 1, // Only return these fields
        },
      },
    ]);

    // Check if suggested users are found
    if (!suggestedUsers || suggestedUsers.length === 0) {
      return res.status(404).json({ message: "No suggested users found." });
    }

    // Return suggested users
    res.status(200).json({ suggestedUsers });
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({
      message: "Error fetching suggested users",
      error:
        process.env.NODE_ENV === "production"
          ? "Something went wrong"
          : error.message,
    });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Fetch the profile user
    const profileUser = await User.findById(req.params.userId).populate({
      path: "followers",
      select: "name username profilePhoto",
    });

    if (!profileUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Process followers list
    const followersWithStatus = profileUser.followers.map((follower) => ({
      ...follower.toObject(),
      isFollowing: currentUser.following.some(
        (id) => id.toString() === follower._id.toString()
      ),
    }));

    res.status(200).json({ followers: followersWithStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Fetch the profile user and populate following details
    const profileUser = await User.findById(req.params.userId).populate({
      path: "following",
      select: "name username profilePhoto",
    });

    if (!profileUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the current user
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // Process following list to include full user details
    const followingWithStatus = profileUser.following.map((user) => ({
      ...user.toObject(),
      isFollowing: currentUser.following.some(
        (id) => id.toString() === user._id.toString()
      ),
    }));

    res.status(200).json({ following: followingWithStatus });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
