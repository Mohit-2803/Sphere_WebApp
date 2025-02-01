/* eslint-disable react/prop-types */
import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  // SocketContext.jsx

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    // Add error listeners
    newSocket.on("connect_error", (err) => {
      console.log("Socket connection error:", err.message);
    });

    newSocket.on("error", (err) => {
      console.log("Socket error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketContext };
