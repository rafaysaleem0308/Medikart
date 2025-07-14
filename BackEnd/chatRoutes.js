const express = require("express");
const router = express.Router();
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

// Authentication middleware (same as in reviewRoutes)
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

// Fetch chat participants with authentication
router.get("/participants", authenticate, async (req, res) => {
  try {
    const currentUser = req.user; // Now available from authentication

    let participants = [];
    if (currentUser.role === "customer") {
      participants = await User.find({ role: "doctor" })
        .select("name role specialization isOnline lastSeen")
        .lean();
    } else if (currentUser.role === "doctor") {
      participants = await User.find({ role: "customer" })
        .select("name role isOnline lastSeen")
        .lean();
    } else if (currentUser.role === "admin") {
      participants = await User.find({})
        .select("name role specialization isOnline lastSeen")
        .lean();
    }

    // Shape data
    participants = participants.map((p) => ({
      id: p._id,
      name: p.name,
      role: p.role,
      specialization: p.specialization || null,
      online: p.isOnline || false,
      lastSeen: p.lastSeen || null,
    }));

    res.status(200).json(participants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get message history with pagination
// router.get("/messages/:otherUserId", authenticate, async (req, res) => {
//   try {
//     const { otherUserId } = req.params;
//     const { limit = 50, before } = req.query;

//     const query = {
//       $or: [
//         { sender: req.user._id, receiver: otherUserId },
//         { sender: otherUserId, receiver: req.user._id },
//       ],
//     };

//     if (before) {
//       query.createdAt = { $lt: new Date(before) };
//     }

//     const messages = await Message.find(query)
//       .sort({ createdAt: -1 })
//       .limit(parseInt(limit))
//       .populate("senderDetails receiverDetails")
//       .lean();

//     // Mark messages as read
//     await Message.updateMany(
//       {
//         sender: otherUserId,
//         receiver: req.user._id,
//         read: false,
//       },
//       { $set: { read: true } }
//     );

//     // Clear unread count
//     await User.findByIdAndUpdate(req.user._id, {
//       $unset: { [`unreadMessages.${otherUserId}`]: 1 },
//     });

//     res.status(200).json(messages.reverse());
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// In your server.js or chatRoutes.js
router.get("/messages/:otherUserId", authenticate, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { limit = 50, before } = req.query;
    const currentUserId = req.user._id;

    const query = {
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate("senderDetails receiverDetails")
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: currentUserId,
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
