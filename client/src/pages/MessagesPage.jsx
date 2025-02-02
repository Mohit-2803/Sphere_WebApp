import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaComment } from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const MessagePage = () => {
  const [conversationPartners, setConversationPartners] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all conversation partners
  useEffect(() => {
    const fetchConversationPartners = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/messages/conversations/partners`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setConversationPartners(response.data);
        fetchUnreadCounts(response.data); // Fetch unread counts for these users
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching conversation partners:", error);
        setIsLoading(false);
      }
    };

    fetchConversationPartners();
  }, []);

  // Fetch unread message counts for each partner
  const fetchUnreadCounts = async (partners) => {
    try {
      const token = localStorage.getItem("token");
      const counts = {};

      for (const partner of partners) {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/unread-count/${
            partner._id
          }`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        counts[partner._id] = response.data.count;
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
          {conversationPartners.length === 0 ? (
            <p className="text-gray-400 text-center">No conversations found</p>
          ) : (
            conversationPartners.map((partner) => (
              <div
                key={partner._id}
                className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg cursor-pointer"
                onClick={() => navigate(`/messages/${partner._id}`)}
              >
                <div className="flex items-center space-x-3">
                  {partner.profilePhoto ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${
                        partner.profilePhoto
                      }`}
                      alt={partner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-full">
                      {partner.name[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{partner.name}</p>
                    <p className="text-gray-400 text-sm">@{partner.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {unreadCounts[partner._id] > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCounts[partner._id]}
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
