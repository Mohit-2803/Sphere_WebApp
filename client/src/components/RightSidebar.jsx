/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RightSidebar = ({ suggestedUsers }) => {
  const [users, setUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState(new Set()); // To track followed users
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    // Filter out current user and set initial users
    setUsers(suggestedUsers.filter((user) => user._id !== currentUserId));
  }, [suggestedUsers, currentUserId]);

  const handleFollow = async (userId) => {
    try {
      const isFollowing = followedUsers.has(userId);

      // Optimistically update the UI
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (user._id === userId) {
            const updatedUser = { ...user };

            // Ensure followers is an array
            updatedUser.followers = Array.isArray(updatedUser.followers)
              ? updatedUser.followers
              : []; // Initialize as an empty array if it's not an array

            if (isFollowing) {
              updatedUser.followers = updatedUser.followers.filter(
                (follower) => follower !== currentUserId
              );
            } else {
              updatedUser.followers = [...updatedUser.followers, currentUserId];
            }
            return updatedUser;
          }
          return user;
        })
      );

      // Toggle Follow/Unfollow
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/toggleFollow/${currentUserId}`,
        { targetId: userId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the followed users set
      setFollowedUsers((prev) => {
        const updatedFollowedUsers = new Set(prev);
        if (isFollowing) {
          updatedFollowedUsers.delete(userId); // Unfollow
        } else {
          updatedFollowedUsers.add(userId); // Follow
        }
        return updatedFollowedUsers;
      });
    } catch (error) {
      console.error("Follow action failed:", error);
    }
  };

  // Helper function to get name initials
  const getInitials = (name) => {
    const nameParts = name.split(" ");
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");
    return initials;
  };

  return (
    <div className="w-80 bg-gray-900 p-4 shadow-lg h-screen">
      <h2 className="text-lg font-semibold text-gray-200 mb-7 mt-5">
        Follow suggestions
      </h2>

      {users.length === 0 ? (
        <p className="text-gray-400 text-sm">No suggestions available.</p>
      ) : (
        users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between mb-3"
          >
            <div className="flex items-center">
              {/* Profile Image or Initials */}
              <Link to={`/profile/${user._id}`}>
                {user.profilePhoto ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${
                      user.profilePhoto
                    }`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => (e.target.src = "/default-avatar.png")}
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold">
                      {getInitials(user.name)}
                    </span>
                  </div>
                )}
              </Link>
              <div className="ml-3">
                <p className="text-gray-300 font-semibold">{user.username}</p>
                <p className="text-gray-500 text-sm">
                  {user.followersCount} followers
                </p>
              </div>
            </div>

            {/* Toggle Follow/Unfollow Button */}
            <button
              onClick={() => handleFollow(user._id)}
              className={`${
                followedUsers.has(user._id)
                  ? "bg-gray-400 text-gray-900"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              } text-sm px-3 py-1 rounded-md cursor-pointer`}
            >
              {followedUsers.has(user._id) ? "Following" : "Follow"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default RightSidebar;
