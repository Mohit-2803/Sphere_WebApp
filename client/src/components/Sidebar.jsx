import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { useSocket } from "../context/useSocket";

const Sidebar = () => {
  const location = useLocation(); // Get the current route location
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [unreadCounts, setUnreadCounts] = useState({});
  const socket = useSocket(); // Socket.IO connection

  // Function to check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Fetch unread counts per conversation
  const fetchUnreadCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/messages/unread-counts-sidebar`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Convert array to object { senderId: count }
      const countsObj = response.data.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      setUnreadCounts(countsObj);
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  }, []);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        return; // Exit if no token or userId
      }

      // Fetch user data from backend
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/getUserName/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user); // Set user data
      setLoading(false); // Stop loading
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  }, []);

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Socket.IO listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.receiver === localStorage.getItem("userId")) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
      }
    };

    const handleMessagesRead = (data) => {
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[data.sender];
        return newCounts;
      });
    };

    socket.on("receive-message", handleNewMessage);
    socket.on("message-read", handleMessagesRead);

    return () => {
      socket.off("receive-message", handleNewMessage);
      socket.off("message-read", handleMessagesRead);
    };
  }, [socket]);

  // Update counts when messages are read
  useEffect(() => {
    const handleMessagesReadEvent = () => {
      fetchUnreadCounts();
    };

    window.addEventListener("messagesRead", handleMessagesReadEvent);
    return () =>
      window.removeEventListener("messagesRead", handleMessagesReadEvent);
  }, [fetchUnreadCounts]);

  // Initial fetch
  useEffect(() => {
    fetchUserData();
    fetchUnreadCounts();
  }, [fetchUserData, fetchUnreadCounts]);

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 shadow-lg p-6 flex flex-col">
        <div className="mb-8 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-y-0 left-0 w-72 bg-gray-900 shadow-lg p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <Link
          to="/"
          className="text-2xl font-bold text-indigo-500 hover:text-blue-400 transition-colors"
        >
          🌐 Sphere
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/home"
              className={`flex items-center space-x-3 ${
                isActive("/feed")
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              } p-3 rounded-lg transition-all`}
            >
              <HomeIcon className="h-6 w-6" />
              <span className="text-lg">Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/friends"
              className={`flex items-center space-x-3 ${
                isActive("/friends")
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              } p-3 rounded-lg transition-all`}
            >
              <UserGroupIcon className="h-6 w-6" />
              <span className="text-lg">Friends</span>
            </Link>
          </li>
          <li>
            <Link
              to="/messages"
              className={`flex items-center space-x-3 ${
                isActive("/messages")
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              } p-3 rounded-lg transition-all`}
            >
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <span className="text-lg">Messages</span>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                  {totalUnread}
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className={`flex items-center space-x-3 ${
                isActive("/notifications")
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              } p-3 rounded-lg transition-all`}
            >
              <BellIcon className="h-6 w-6" />
              <span className="text-lg">Notifications</span>
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                1
              </span>
            </Link>
          </li>
          <li>
            <Link
              to="/saved"
              className={`flex items-center space-x-3 ${
                isActive("/saved")
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              } p-3 rounded-lg transition-all`}
            >
              <BookmarkIcon className="h-6 w-6" />
              <span className="text-lg">Saved</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`flex items-center space-x-3 ${
                isActive("/settings")
                  ? "text-white bg-gray-800"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              } p-3 rounded-lg transition-all`}
            >
              <Cog6ToothIcon className="h-6 w-6" />
              <span className="text-lg">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* User Profile Section */}
      <Link to={`/profile`}>
        <div className="mt-auto">
          {user ? (
            <div className="flex items-center gap-6 p-3 rounded-lg hover:bg-gray-800 transition-all px-0">
              <div className="flex flex-row gap-2">
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile picture"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className="font-sm text-gray-200">{user.name}</p>
                  <p className="text-sm text-gray-400">@{user.username}</p>
                </div>
              </div>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
          ) : (
            <div className="text-gray-400">Loading...</div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
