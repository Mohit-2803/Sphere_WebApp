import { useEffect, useState } from "react";
import axios from "axios";
import { GiPartyPopper } from "react-icons/gi";
import { FaHeart, FaUserPlus, FaRegBell } from "react-icons/fa";
import TimeAgo from "timeago-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useSocket } from "../context/useSocket";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case "welcome":
        return {
          icon: <GiPartyPopper className="text-2xl text-yellow-400" />,
          text: "Welcome to our platform! 🎉",
        };
      case "like":
        return {
          icon: <FaHeart className="text-xl text-red-400" />,
          text: `${notification.sender.username} liked your post`,
        };
      case "follow":
        return {
          icon: <FaUserPlus className="text-xl text-blue-400" />,
          text: `${notification.sender.username} started following you`,
        };
      default:
        return { icon: null, text: "New notification" };
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#161f32] text-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8 mt-5">
          <FaRegBell className="text-2xl mr-3 text-blue-500" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 rounded-lg ${
                !notification.read ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getNotificationContent(notification).icon}
                </div>
                <div>
                  <p className="font-medium">
                    {getNotificationContent(notification).text}
                  </p>
                  <TimeAgo
                    datetime={notification.createdAt}
                    className="text-gray-400 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <p className="text-gray-400 text-center">No notifications yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
