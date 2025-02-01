/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useSocket } from "../context/useSocket";
import axios from "axios";

const MessageList = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const socket = useSocket();

  // Fetch conversation history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/${selectedUser}`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (selectedUser) fetchMessages();
  }, [selectedUser]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receive-message", (message) => {
      if (message.sender === selectedUser) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [socket, selectedUser]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const message = {
      sender: localStorage.getItem("userId"),
      receiver: selectedUser,
      content: newMessage,
      timestamp: new Date(),
    };

    // Send via socket
    socket.emit("send-message", message);

    // Optimistically update UI
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="message-container">
      {/* User list */}
      <div className="user-list">
        {/* Fetch and display users you have conversations with */}
      </div>

      {/* Chat window */}
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === localStorage.getItem("userId")
                ? "sent"
                : "received"
            }`}
          >
            <p>{msg.content}</p>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}

        <div className="message-input">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default MessageList;
