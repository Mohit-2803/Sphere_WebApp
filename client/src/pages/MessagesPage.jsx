import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaComment } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const MessagePage = () => {
  const [users, setUsers] = useState([]); // Only following users will be stored here
  const [unreadCounts, setUnreadCounts] = useState({}); // Unread counts for each user
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  // Fetch only the users that current user is following
  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/${currentUserId}/following`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Assuming the API response contains a "following" array
        const followingUsers = response.data.following;
        setUsers(followingUsers);
        fetchUnreadCounts(followingUsers); // Fetch unread counts for these users
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching following users:", error);
        setIsLoading(false);
      }
    };

    fetchFollowing();
  }, [currentUserId]);

  // Fetch unread message counts for each following user
  const fetchUnreadCounts = async (users) => {
    try {
      const token = localStorage.getItem("token");
      const counts = {};

      for (const user of users) {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/unread-count/${
            user._id
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        counts[user._id] = response.data.count; // Save the count for this user
      }

      setUnreadCounts(counts);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#161f32] text-white p-8 ml-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>

        <div className="bg-gray-800 rounded-lg p-4">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center">
              No following users found
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
                onClick={() => navigate(`/messages/${user._id}`)}
              >
                <div className="flex items-center space-x-3">
                  {user.profilePhoto ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${
                        user.profilePhoto
                      }`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-full">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {unreadCounts[user._id] > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCounts[user._id]}
                    </span>
                  )}
                  <FaComment className="text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
