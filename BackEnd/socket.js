// Socket.IO Connection Handling
io.on("connection", (socket) => {
  console.log(`⚡: User ${socket.userId} connected`);

  // Update user's online status
  User.findByIdAndUpdate(socket.userId, { isOnline: true }).exec();

  // Join a room based on user ID
  socket.join(socket.userId.toString());

  // In your socket.io 'privateMessage' handler
  socket.on("privateMessage", async (data) => {
    try {
      console.log("Received message:", data); // Debug log

      const message = new Message({
        sender: socket.userId,
        receiver: data.to,
        text: data.text,
      });

      const savedMessage = await message.save();
      console.log("Saved message:", savedMessage); // Verify save

      // Populate sender details
      const fullMessage = await Message.populate(savedMessage, [
        { path: "sender", select: "name" },
        { path: "receiver", select: "name" },
      ]);

      // Convert to plain object
      const messageObj = fullMessage.toObject();
      if (data.tempId) messageObj.tempId = data.tempId;

      // Debug: Check receiver's socket connection
      const receiverSocket = Array.from(connectedUsers.values()).find(
        (user) => user.userId.toString() === data.to
      );
      console.log(
        "Receiver socket status:",
        receiverSocket ? "Connected" : "Offline"
      );

      // Emit to receiver if online
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit("newMessage", messageObj);
        console.log("Message emitted to receiver");
      }

      // Always emit back to sender
      socket.emit("messageSent", messageObj);
    } catch (err) {
      console.error("Message save error:", err);
      socket.emit("messageError", {
        tempId: data.tempId,
        error: "Failed to send message",
      });
    }
  });
  // Handle chat history request
  // socket.on("getChatHistory", async (data) => {
  //   try {
  //     const { otherUserId, limit = 50, before } = data;

  //     // Validate input
  //     if (!otherUserId) {
  //       return socket.emit("error", "Other user ID is required");
  //     }

  //     const query = {
  //       $or: [
  //         { sender: socket.userId, receiver: otherUserId },
  //         { sender: otherUserId, receiver: socket.userId },
  //       ],
  //     };

  //     if (before) {
  //       query.createdAt = { $lt: new Date(before) };
  //     }

  //     const messages = await Message.find(query)
  //       .sort({ createdAt: -1 })
  //       .limit(limit)
  //       .populate("senderDetails receiverDetails")
  //       .lean();

  //     // Mark messages as read if viewing chat
  //     await Message.updateMany(
  //       {
  //         sender: otherUserId,
  //         receiver: socket.userId,
  //         read: false,
  //       },
  //       { $set: { read: true } }
  //     );

  //     // Clear unread count for this conversation
  //     await User.findByIdAndUpdate(socket.userId, {
  //       $unset: { [`unreadMessages.${otherUserId}`]: 1 },
  //     });

  //     socket.emit("chatHistory", messages.reverse());
  //   } catch (err) {
  //     console.error("Error fetching chat history:", err);
  //     socket.emit("error", "Failed to load chat history");
  //   }
  // });
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
        .populate("sender receiver", "name role") // ✅ fixed here
        .lean();

      await Message.updateMany(
        {
          sender: otherUserId,
          receiver: socket.userId,
          read: false,
        },
        { $set: { read: true } }
      );

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
    User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      lastSeen: new Date(),
    }).exec();
  });
});
