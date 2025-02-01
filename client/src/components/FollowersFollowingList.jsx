/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";
import toast from "react-hot-toast";

const FollowersFollowingList = ({ userId, listType, onClose, onFollow }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentUserId = localStorage.getItem("userId");

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}/${listType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response);
        setUsers(response.data[listType] || []);
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to load data");
        onClose();
      }
    };
    fetchUsers();
  }, [userId, listType, onClose]);

  const handleFollow = async (targetId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/users/toggleFollow/${currentUserId}`,
        { targetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === targetId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      toast.success(
        `Successfully ${
          users.find((u) => u._id === targetId).isFollowing
            ? "unfollowed"
            : "followed"
        }!`
      );
      onFollow();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="fixed inset-0 bg-black/85 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a2335] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold capitalize">{listType}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center">No {listType} found.</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg"
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
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-700 text-white text-sm font-bold rounded-full">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                  </div>
                </div>
                {user._id !== currentUserId && (
                  <button
                    onClick={() => handleFollow(user._id)}
                    className={`flex items-center px-3 py-1 rounded-lg ${
                      user.isFollowing
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <FaUserCheck className="mr-1" /> Following
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="mr-1" /> Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersFollowingList;
