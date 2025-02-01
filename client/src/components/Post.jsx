/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import { useEffect, useState, useRef } from "react";
import { FaRegComment, FaRegHeart, FaHeart, FaTimes } from "react-icons/fa";
import TimeAgo from "timeago-react";
import axios from "axios";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const currentUserId = localStorage.getItem("userId");
  const savedScrollY = useRef(0);

  useEffect(() => {
    if (showCommentsModal) {
      // Save current scroll position
      savedScrollY.current = window.scrollY;
      // Apply styles to lock scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = "100%";
    } else {
      // Remove scroll lock styles
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      // Restore scroll position after styles reset
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollY.current);
      });
    }

    return () => {
      // Cleanup: reset styles when component unmounts or before re-running the effect
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [showCommentsModal]);

  useEffect(() => {
    if (post) {
      setLikesCount(post.likes?.length || 0);
      const userHasLiked = post.likes?.some((like) =>
        typeof like === "string"
          ? like === currentUserId
          : like._id === currentUserId
      );
      setIsLiked(userHasLiked || false);
      setComments(post.comments || []);
    }
  }, [post, currentUserId]);

  const handleLike = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/likes`,
        { userId: currentUserId }
      );

      const updatedPost = response.data;
      const userHasLiked = updatedPost.likes.some((like) =>
        typeof like === "string"
          ? like === currentUserId
          : like._id === currentUserId
      );
      setIsLiked(userHasLiked);
      setLikesCount(updatedPost.likes.length);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prev) => [...prev, newComment]);
  };

  const {
    content = "",
    image = "",
    createdAt = new Date().toISOString(),
    user = {},
  } = post || {};

  const { username = "Unknown", profilePhoto = "" } = user || {};

  const postDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-700">
          <Link
            to={`/profile/${post.user._id}`}
            className="font-semibold hover:underline"
          >
            {profilePhoto ? (
              <img
                src={`http://localhost:5000${profilePhoto}`}
                alt={username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                {username[0]?.toUpperCase() || "U"}
              </div>
            )}
          </Link>
        </div>
        <div>
          <Link
            to={`/profile/${post.user._id}`}
            className="font-semibold hover:underline"
          >
            <h3 className="font-semibold">{username}</h3>
          </Link>
          <p className="text-gray-400 text-sm">{postDate}</p>
        </div>
      </div>

      {/* Post Content */}
      {content && <p className="mb-4">{content}</p>}

      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={`http://localhost:5000${image}`}
            alt="Post content"
            className="w-full h-auto max-h-96 object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-4 text-gray-400">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 ${
            isLiked ? "text-red-500" : ""
          } cursor-pointer`}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowCommentsModal(true)}
          className="flex items-center gap-1 cursor-pointer"
        >
          <FaRegComment />
          <span>{comments.length}</span>
        </button>
      </div>

      {showCommentsModal && (
        <CommentsModal
          post={post}
          comments={comments}
          currentUserId={currentUserId}
          onClose={() => setShowCommentsModal(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
};

const CommentsModal = ({
  post,
  comments,
  currentUserId,
  onClose,
  onCommentAdded,
}) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comments`,
        { content: newComment, userId: currentUserId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const addedComment = response.data;
      onCommentAdded(addedComment);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] min-h-[60vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
              <Link to={`/profile/${post.user._id}`}>
                {post.user.profilePhoto ? (
                  <img
                    src={`http://localhost:5000${post.user.profilePhoto}`}
                    alt={post.user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    {post.user.username[0]?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
            </div>
            <div>
              <h3 className="font-semibold">{post.user.username}</h3>
              <p className="text-gray-400 text-sm">{post.content}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 max-h-72">
          {comments.length === 0 ? (
            <p className="text-gray-400 text-center">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
                  <Link to={`/profile/${comment.user._id}`}>
                    {comment.user.profilePhoto ? (
                      <img
                        src={`http://localhost:5000${comment.user.profilePhoto}`}
                        alt={comment.user.username}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        {comment.user.username[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                  </Link>
                </div>
                <div>
                  <span className="font-semibold text-sm">
                    {comment.user.username}
                  </span>
                  <p className="text-gray-300 text-sm">{comment.content}</p>
                  <TimeAgo
                    datetime={comment.createdAt}
                    className="text-gray-400 text-xs"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form
          onSubmit={handleSubmitComment}
          className="p-4 border-t border-gray-700"
        >
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-gray-900 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm cursor-pointer"
          >
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};

// Prop validation
Post.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string,
    image: PropTypes.string,
    createdAt: PropTypes.string,
    likes: PropTypes.arrayOf(PropTypes.string),
    comments: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        user: PropTypes.shape({
          _id: PropTypes.string.isRequired,
          username: PropTypes.string.isRequired,
          profilePhoto: PropTypes.string,
        }),
      })
    ),
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      profilePhoto: PropTypes.string,
    }),
  }).isRequired,
};

export default Post;
