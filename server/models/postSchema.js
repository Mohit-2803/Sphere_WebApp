import mongoose from "mongoose";

// Post Schema
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the user who created the post
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String, // Path or URL to image associated with the post (optional)
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who liked the post
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // User who commented on the post
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create and export the Post model
const Post = mongoose.model("Post", postSchema);

export default Post;
