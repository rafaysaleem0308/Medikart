const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Message = require("./models/messageModel"); // Add this line

// Load environment variables
dotenv.config();

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// MongoDB Native Driver Setup
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pharmacy";
const mongoClient = new MongoClient(mongoUri);
let db;

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Connect to MongoDB
async function initializeDatabases() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pharmacy",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

initializeDatabases();

// Track connected users
const connectedUsers = new Map();

// Socket.IO Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = user._id;
    socket.userRole = user.role;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`⚡: User ${socket.userId} connected`);

  // Add user to connected users map
  connectedUsers.set(socket.userId.toString(), {
    socketId: socket.id,
    userId: socket.userId,
    role: socket.userRole,
  });

  // Update user status in database and notify all clients
  User.findByIdAndUpdate(socket.userId, {
    isOnline: true,
    lastSeen: null,
  }).then(() => {
    io.emit("userOnline", socket.userId.toString());
  });

  // Join user's personal room
  socket.join(socket.userId.toString());

  // Notify user about currently online users
  const onlineUsersList = Array.from(connectedUsers.keys());
  socket.emit("onlineUsers", onlineUsersList);

  // Handle private messages
  socket.on("privateMessage", async (data) => {
    try {
      const { to, text } = data;
      if (!to || !text) {
        return socket.emit("error", "Invalid message data");
      }

      const recipient = await User.findById(to);
      if (!recipient) {
        return socket.emit("error", "Recipient not found");
      }

      const message = new Message({
        sender: socket.userId,
        receiver: to,
        text: text,
      });
      await message.save();

      const populatedMessage = await Message.populate(message, [
        { path: "sender", select: "name" },
        { path: "receiver", select: "name" },
      ]);

      // Emit to recipient if online
      if (connectedUsers.has(to.toString())) {
        io.to(to.toString()).emit("newMessage", populatedMessage);
      } else {
        await User.findByIdAndUpdate(to, {
          $inc: { [`unreadMessages.${socket.userId}`]: 1 },
        });
      }

      socket.emit("newMessage", populatedMessage);
    } catch (err) {
      console.error("Message error:", err);
      socket.emit("error", "Failed to send message");
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { to } = data;
    if (connectedUsers.has(to.toString())) {
      io.to(to.toString()).emit("userTyping", { from: socket.userId });
    }
  });

  socket.on("stopTyping", (data) => {
    const { to } = data;
    if (connectedUsers.has(to.toString())) {
      io.to(to.toString()).emit("userStoppedTyping", { from: socket.userId });
    }
  });

  // Handle chat history request
  socket.on("getChatHistory", async (data) => {
    try {
      const { otherUserId, limit = 50, before } = data;
      if (!otherUserId) {
        return socket.emit("error", "Other user ID is required");
      }

      const query = {
        $or: [
          { sender: socket.userId, receiver: otherUserId },
          { sender: otherUserId, receiver: socket.userId },
        ],
      };

      if (before) {
        query.createdAt = { $lt: new Date(before) };
      }

      const messages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("sender receiver", "name")
        .lean();

      // Mark messages as read
      await Message.updateMany(
        {
          sender: otherUserId,
          receiver: socket.userId,
          read: false,
        },
        { $set: { read: true } }
      );

      // Clear unread count
      await User.findByIdAndUpdate(socket.userId, {
        $unset: { [`unreadMessages.${otherUserId}`]: 1 },
      });

      socket.emit("chatHistory", messages.reverse());
    } catch (err) {
      console.error("Error fetching chat history:", err);
      socket.emit("error", "Failed to load chat history");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔥: User ${socket.userId} disconnected`);
    connectedUsers.delete(socket.userId.toString());

    User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date(),
    }).then(() => {
      io.emit("userOffline", socket.userId.toString());
    });
  });
});

// Routes
const authRoutes = require("./UserAuth");
const aboutDataRoutes = require("./about_data");
const chatRoutes = require("./chatRoutes");
const reviewRoutes = require("./reviewRoutes");
const contactRoutes = require("./contactRoutes");
const orderRoutes = require("./orderRoutes");
const productRoutes = require("./productRoutes");
const vouchersRouter = require("./vouchers");
const userManagementRoutes = require("./userManagementRoutes");

// Other middleware and routes
app.use("/api/vouchers", vouchersRouter);

app.use("/api/products", productRoutes);
app.use("/api", userManagementRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/about", aboutDataRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes);
// Message history endpoint
app.get("/api/messages/:otherUserId", async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUserId = decoded.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate("sender receiver", "name");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});
