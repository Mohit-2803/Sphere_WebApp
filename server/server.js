import dotenv from "dotenv";
import express from "express";
import cors from "cors"; // Import the CORS package
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import jwt from "jsonwebtoken"; // If using JWT for authentication
import path from "path";
import { fileURLToPath } from "url";
import http from "http"; // Import http module for server
import { Server } from "socket.io"; // Import socket.io
import Message from "./models/messageSchema.js";
import mongoose from "mongoose";

dotenv.config();

// Create the Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: "https://sphere-rho-one.vercel.app", // Replace with your frontend URL
    credentials: true,
  })
);

// Handle OPTIONS requests manually if needed
app.options("*", (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://sphere-rho-one.vercel.app"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

app.use(express.json()); // To parse JSON data

connectDB();

// Auth route
app.use("/api/auth", authRoutes);

// User route
app.use("/api/users", userRoutes);

// Post route
app.use("/api/posts", postRoutes);

//message route
app.use("/api/messages", messageRoutes);

// notification route
app.use("/api/notifications", notificationRoutes);

// Route to verify the token
app.get("/api/verify-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(200).json({ message: "Token is valid" });
  });
});

// Serve static files from 'uploads' directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create the HTTP server and pass it to socket.io
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: "https://sphere-rho-one.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
    extraHeaders: {
      "ngrok-skip-browser-warning": "true",
    },
  },
  allowEIO3: true, // Add this for Socket.IO v2/v3 compatibility
});

// Add proper error handling for socket authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId.toString(); // Ensure string format
    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

// Socket.io connection handler
io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  const token = socket.handshake.auth.token;
  if (!token) {
    console.log("No token provided, disconnecting...");
    return socket.disconnect(true);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("Invalid token, disconnecting...");
      return socket.disconnect(true);
    }

    console.log("Decoded Token:", decoded);

    if (!decoded.userId) {
      console.log("Decoded token does not contain user ID!");
      return socket.disconnect(true);
    }

    socket.userId = decoded.userId;
    socket.join(socket.userId);

    console.log(`User ${socket.userId} joined room ${socket.userId}`);

    // Handle sending messages
    socket.on("send-message", async (messageData, callback) => {
      try {
        const newMessage = new Message({
          sender: new mongoose.Types.ObjectId(socket.userId),
          receiver: new mongoose.Types.ObjectId(messageData.receiver),
          content: messageData.content,
        });

        const savedMessage = await newMessage.save();
        io.to(messageData.receiver)
          .to(socket.userId)
          .emit("receive-message", savedMessage);

        callback({ status: "success", message: savedMessage });
      } catch (error) {
        callback({ status: "error", error: error.message });
      }
    });

    // In the server's socket.io "mark-messages-read" handler
    socket.on("mark-messages-read", async (data) => {
      try {
        await Message.updateMany(
          {
            sender: data.sender,
            receiver: data.receiver,
            read: false,
          },
          { $set: { read: true } }
        );

        // Notify both sender and receiver clients
        io.to(data.sender).to(data.receiver).emit("message-read", {
          sender: data.sender,
          receiver: data.receiver,
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
