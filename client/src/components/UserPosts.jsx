/* eslint-disable react/prop-types */
import { useState } from "react";
import { FaHeart, FaComment, FaTimes, FaRegHeart } from "react-icons/fa";
import TimeAgo from "timeago-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const UserPosts = ({ posts, onCommentAdded, onLikeUpdated }) => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const userId = localStorage.getItem("userId");

  // Sort posts by createdAt in descending order
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setNewComment("");
  };

  const closeModal = () => {
    setSelectedPost(null);
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${postId}/likes`,
        { userId: userId }
      );

      // Preserve existing comments with their user data
      setSelectedPost((prev) => {
        if (prev?._id === postId) {
          return {
            ...response.data,
            comments: prev.comments, // Keep existing comments data
          };
        }
        return prev;
      });

      if (onLikeUpdated) {
        onLikeUpdated(postId, response.data.likes);
      }
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  const handleAddComment = async (e) => {
    const userId = localStorage.getItem("userId");
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/posts/${
          selectedPost._id
        }/comments`,
        {
          content: newComment,
          userId: userId, // Use current user's ID
        }
      );

      // Update local modal state
      setSelectedPost((prev) => ({
        ...prev,
        comments: [...prev.comments, response.data],
      }));

      // Update parent component state
      if (onCommentAdded) {
        onCommentAdded(selectedPost._id, response.data);
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="bg-[#161f32] text-white p-4">
      {sortedPosts.length === 0 && (
        <div className="text-center text-gray-400 text-lg mt-6">
          No posts yet.
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedPosts.map((post) => (
          <div
            key={post._id}
            className="relative cursor-pointer group"
            onClick={() => handlePostClick(post)}
          >
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${post.image}`}
              alt="Post"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="flex space-x-6 text-white">
                <div className="flex items-center">
                  <FaHeart className="mr-1" />
                  {post.likes.some((like) => like._id === userId) ? (
                    <span className="text-red-500">{post.likes.length}</span>
                  ) : (
                    <span>{post.likes.length}</span>
                  )}
                </div>
                <div className="flex items-center">
                  <FaComment className="mr-1" /> {post.comments.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Main container with equal height sections */}
          <div className="bg-black max-w-4xl w-full flex flex-col md:flex-row rounded-lg overflow-hidden h-[75vh]">
            {/* Image Section - Force equal height */}
            <div className="md:w-3/5 h-full bg-black flex min-h-0">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${selectedPost.image}`}
                alt="Post"
                className="w-full h-full object-cover" // Changed to object-cover
              />
            </div>

            {/* Details Section - Equal height with proper constraints */}
            <div className="md:w-2/5 flex flex-col bg-[#262626] h-full min-h-0">
              {/* Header (unchanged) */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {selectedPost.user.profilePhoto ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${
                        selectedPost.user.profilePhoto
                      }`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 flex items-center justify-center bg-gray-700 text-white text-sm rounded-full border-1 border-blue-500">
                      {selectedPost.user.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold">
                    {selectedPost.user.username}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white  cursor-pointer"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Content Area with height constraints */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Caption */}
                <div className="p-4 border-b border-gray-800 flex-shrink-0 ml-7">
                  <p className="text-gray-100">{selectedPost.content}</p>
                  <TimeAgo
                    datetime={selectedPost.createdAt}
                    className="text-gray-400"
                  />
                </div>

                <hr className="mx-2 border-gray-500" />

                {/* Scrollable Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                  {selectedPost.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex items-start flex-col"
                    >
                      <div className="flex flex-row items-center gap-2">
                        <Link to={`/profile/${comment.user._id}`}>
                          {comment.user.profilePhoto ? (
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}${
                                comment.user.profilePhoto
                              }`}
                              alt="Profile"
                              className="w-5 h-5 rounded-full"
                            />
                          ) : (
                            <div className="w-5 h-5 flex items-center justify-center bg-gray-700 text-white text-xs rounded-full border-1 border-blue-500">
                              {comment.user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                          )}
                        </Link>

                        <span className="font-normal">
                          {comment.user.username}
                        </span>
                      </div>
                      <div className="ml-7">
                        <p className="text-gray-300 text-sm">
                          {comment.content}
                        </p>
                        <TimeAgo
                          datetime={comment.createdAt}
                          className="text-gray-400 text-xs mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-4 text-xl">
                  <button
                    onClick={() => handleLike(selectedPost._id)}
                    className="hover:text-gray-400 transition-colors cursor-pointer"
                  >
                    {selectedPost.likes.some((like) => like._id === userId) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <p className="font-normal text-lg">
                    {selectedPost.likes.length} likes
                  </p>
                </div>

                {/* Add Comment */}
                <form
                  onSubmit={handleAddComment}
                  className="flex space-x-2 mt-2"
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="text-blue-500 font-semibold text-sm hover:text-blue-400 cursor-pointer"
                    disabled={!newComment.trim()}
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPosts;
