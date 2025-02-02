import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../context/useSocket";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";

const MessageChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [recipient, setRecipient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useParams();
  const socket = useSocket();
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Fetch current user and recipient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch current user details
        const currentUserRes = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/users/getUser/${currentUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCurrentUser(currentUserRes.data.user);

        // Fetch recipient details
        const recipientRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/getUser/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecipient(recipientRes.data.user);

        // Fetch message history
        const messagesRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/messages/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(messagesRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUserId]);

  // Socket.IO setup
  useEffect(() => {
    if (!socket) return;

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    socket.emit("join-user", currentUserId);

    // Listen for new messages
    socket.on("receive-message", (message) => {
      if (message.receiver === currentUserId || message.sender === userId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for message read updates
    socket.on("message-read", (data) => {
      if (data.sender === userId && data.receiver === currentUserId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender === userId ? { ...msg, read: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-read");
      socket.disconnect();
    };
  }, [socket, currentUserId, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Mark messages as read
  useEffect(() => {
    const markAsRead = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/messages/mark-as-read/${userId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Emit to both participants
        socket.emit("mark-messages-read", {
          sender: userId,
          receiver: currentUserId,
        });

        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender === userId ? { ...msg, read: true } : msg
          )
        );

        // Force sidebar refresh
        window.dispatchEvent(new Event("messagesRead"));
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    };

    if (userId) markAsRead();
  }, [userId, socket, currentUserId]);

  // Send message
  const handleSend = () => {
    if (!newMessage.trim()) return;

    // Create optimistic message (temporary)
    const tempMessage = {
      _id: Date.now(), // Temporary unique ID
      sender: currentUserId,
      receiver: userId,
      content: newMessage.trim(),
      timestamp: new Date(),
      read: false, // Initially unread
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    // Send via Socket.IO
    socket.emit(
      "send-message",
      { receiver: userId, content: newMessage.trim() },
      (response) => {
        if (response.status === "error") {
          // Remove optimistic update on error
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== tempMessage._id)
          );
          alert("Failed to send message: " + response.error);
        }
      }
    );
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#161f32] text-white p-4 pt-0">
      <div className="max-w-3xl min-w-4xl mx-auto h-[95vh] flex flex-col bg-[#161f39]">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white mr-4"
          >
            <span className="font-bold cursor-pointer"> &larr; Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${recipient._id}`}>
              {recipient?.profilePhoto ? (
                <img
                  src={`${recipient.profilePhoto}`}
                  alt={recipient.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-full">
                  {recipient?.name[0].toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <p className="font-semibold">{recipient?.name}</p>
              <p className="text-gray-400 text-sm">@{recipient?.username}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No messages yet</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.sender === currentUserId;
              const profilePhoto = isCurrentUser
                ? currentUser?.profilePhoto
                : recipient?.profilePhoto;
              const displayName = isCurrentUser
                ? currentUser?.name
                : recipient?.name;

              return (
                <div
                  key={index}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } mb-4`}
                >
                  <div className="flex items-end space-x-2">
                    {/* Sender's profile image */}
                    {!isCurrentUser && (
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded-full">
                        {profilePhoto ? (
                          <img
                            src={`${profilePhoto}`}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span>{displayName[0].toUpperCase()}</span>
                        )}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isCurrentUser
                          ? "bg-blue-500 ml-auto"
                          : "bg-gray-700 mr-auto"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="flex items-center justify-end space-x-4">
                        <p className="text-xs text-gray-300 whitespace-nowrap">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isCurrentUser && (
                          <span
                            className={`text-xs font-bold ${
                              message.read ? "text-blue-900" : "text-gray-400"
                            }`}
                          >
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Current user's profile image */}
                    {isCurrentUser && (
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded-full">
                        {profilePhoto ? (
                          <img
                            src={`${profilePhoto}`}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span>{displayName[0].toUpperCase()}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageChat;
