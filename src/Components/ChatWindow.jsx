// ChatWindow component
// This component handles the chat interface, including user list, chat area, and message handling.
// It uses socket.io for real-time communication and manages state for participants, messages, and user interactions.
// It also includes authentication handling and responsive design for mobile view.
// This component is designed to be used in a React application with client-side routing using react-router-dom.
// It is a functional component that uses hooks for state management and side effects.
// It includes various helper functions for formatting dates, handling user interactions, and managing socket events.
// It is styled using a separate CSS file for better organization and maintainability.
//operations related to the chat functionality, including sending messages, receiving updates, and managing user presence.
// It is designed to be used in a React application with client-side routing using react-router-dom.
// It is a functional component that uses hooks for state management and side effects.
// It includes various helper functions for formatting dates, handling user interactions, and managing socket events.
// It is styled using a separate CSS file for better organization and maintainability.

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Chatbox.css";
import io from "socket.io-client";

export default function ChatWindow() {
  // State declarations
  const [participants, setParticipants] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isMobileView, setIsMobileView] = useState(false);
  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [tempMessages, setTempMessages] = useState({});
  // Helper functions

  // Format Last Seen
  // This function formats the last seen time of a user into a human-readable format.
  // It returns "Never" if the last seen is null, "Just now" if less than a minute ago,
  // "X min ago" if less than an hour ago, "X hours ago"
  // if less than a day ago, and "X days ago" otherwise.

  const formatLastSeen = useCallback((lastSeen) => {
    if (!lastSeen) return "Never";
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  }, []);

  // formatTime
  // This function formats a timestamp into a human-readable time string.
  // It returns an empty string if the timestamp is null or undefined.
  // Otherwise, it converts the timestamp to a Date object and formats it to a 2-digit hour and minute string.
  const formatTime = useCallback((timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  //handleResize
  // This function checks the window width and sets the isMobileView state accordingly.
  // It uses a callback to avoid unnecessary re-renders and is used in the useEffect hook to set the initial state.
  // It also adds an event listener to handle window resize events.
  const handleResize = useCallback(() => {
    setIsMobileView(window.innerWidth <= 768);
  }, []);

  // Event handlers
  // handleUserClick
  // This function handles the click event on a user in the participant list.
  // It sets the selected participant, clears the messages, and emits a socket event to fetch chat history.
  const handleUserClick = useCallback(
    (user) => {
      setMessages([]);
      setSelectedParticipant(user);
      setUnreadCounts((prev) => ({ ...prev, [user.id]: 0 }));

      if (socket) {
        socket.emit("getChatHistory", { otherUserId: user.id });
      }

      if (isMobileView) {
        setShowUserList(false);
      }
    },
    [isMobileView, socket]
  );

  //handle close chat
  // This function handles the closing of the chat window.
  const handleCloseChat = useCallback(() => {
    setSelectedParticipant(null);
    setMessages([]);
    if (isMobileView) {
      setShowUserList(true);
    }
  }, [isMobileView]);

  // handleSendMessage
  // This function handles sending a message.
  // It checks if the new message is not empty, if a participant is selected, and if the socket is connected.
  // It generates a temporary ID for the message, adds it to the messages state, and
  // emits a socket event to send the message.
  // It also clears the new message input and emits a stop typing event.

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !selectedParticipant || !socket) return;

    const tempId = Date.now().toString();
    const messageData = {
      to: selectedParticipant.id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add temporary message
    setTempMessages((prev) => ({
      ...prev,
      [tempId]: {
        ...messageData,
        from: "me",
        status: "sending",
      },
    }));

    setMessages((prev) => [
      ...prev,
      {
        ...messageData,
        from: "me",
        tempId,
        sender: { _id: socket.id },
        receiver: { _id: selectedParticipant.id },
      },
    ]);

    setNewMessage("");

    socket.emit("privateMessage", {
      ...messageData,
      tempId, // Include tempId in socket emit
    });

    socket.emit("stopTyping", { to: selectedParticipant.id });
  }, [newMessage, selectedParticipant, socket]);

  // handleTyping
  // This function handles typing events.
  // It updates the new message state, checks if the socket and selected participant are available,
  // and emits a typing event if the user starts typing.
  // It also sets a timeout to emit a stop typing event after 1 second of inactivity.
  const handleTyping = useCallback(
    (value) => {
      setNewMessage(value);

      if (!socket || !selectedParticipant) return;

      if (value.trim() && !isTyping) {
        setIsTyping(true);
        socket.emit("typing", { to: selectedParticipant.id });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit("stopTyping", { to: selectedParticipant.id });
      }, 1000);
    },
    [socket, selectedParticipant, isTyping]
  );

  // handleKeyPress
  // This function handles key press events in the message input.
  // It checks if the Enter key is pressed without the Shift key,
  // prevents the default behavior, and calls the handleSendMessage function.
  // It uses a callback to avoid unnecessary re-renders and is used in the onKey  Press event of the textarea.
  // It also includes the handleSendMessage function in its dependencies to ensure it has the latest version of the function.
  // This is important to avoid stale closures and ensure the function has access to the latest state
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Filter participants
  // This function filters the participants based on the search term.
  // It checks if the participant's name or specialization includes the search term (case-insensitive).
  // It uses the toLowerCase method to ensure the search is case-insensitive.
  // It returns an array of participants that match the search criteria.
  // It is used in the renderUserList function to display the filtered participants.
  // It also includes the searchTerm state in its dependencies to ensure it has the latest value
  const filteredParticipants = participants.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.specialization &&
        user.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Effects

  // This effect checks for authentication on component mount.
  // If no token is found in localStorage, it sets showAuthModal to true.
  // It also sets up the window resize event listener to handle mobile view changes.
  // The handleResize function is called to set the initial isMobileView state.
  // The effect cleans up the event listener on component unmount.
  // It uses the useEffect hook to run the checkAuth function on component mount.
  useEffect(() => {
    const checkAuth = () => {
      if (!localStorage.getItem("token")) {
        setShowAuthModal(true);
        return false;
      }
      return true;
    };

    checkAuth();
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [navigate, handleResize]);

  // This effect fetches the chat participants from the server when the component mounts.
  // It uses the fetch API to make a GET request to the /api/chat/participants endpoint.
  // It includes the token in the Authorization header for authentication.
  // If the response is successful, it updates the participants state with the fetched data.
  // It also initializes the onlineUsers state with the online participants.
  // If the response is not successful, it checks for a 401 status code to handle session expiration.
  // If the session has expired, it removes the token from localStorage and sets showAuthModal to true.
  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        setIsLoading(true);
        const response = await fetch("/api/chat/participants", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            setShowAuthModal(true);
            throw new Error("Session expired. Please login again.");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setParticipants(data);

        // Initialize online users
        const online = new Set();
        data.forEach((user) => {
          if (user.isOnline) {
            online.add(user.id);
          }
        });
        setOnlineUsers(online);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (localStorage.getItem("token")) {
      fetchParticipants();
    }
  }, []);

  // This effect sets up the socket connection when the component mounts.
  // It checks for a token in localStorage and initializes the socket connection to the server.
  // It sets up various socket event listeners to handle incoming messages, typing events, and user status updates.
  // It also cleans up the socket connection and event listeners on component unmount.
  // The socket connection is established to the server at http://localhost:5000.
  // It uses the io function from the socket.io-client library to create a new socket instance.
  // The socket instance is stored in the socket state variable.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socketInstance = io("http://localhost:5000", {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on("newMessage", (message) => {
      // Check if message is from current participant OR is our own message
      if (
        message.sender._id === selectedParticipant?.id ||
        (message.sender._id === socketInstance.userId &&
          message.receiver._id === selectedParticipant?.id)
      ) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender._id]: (prev[message.sender._id] || 0) + 1,
        }));
      }
    });
    socketInstance.on("messageSent", (message) => {
      if (message.tempId) {
        setTempMessages((prev) => {
          const newTemp = { ...prev };
          delete newTemp[message.tempId];
          return newTemp;
        });
      }

      if (message.receiver._id === selectedParticipant?.id) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.tempId === message.tempId ? { ...message, from: "me" } : msg
          )
        );
      }
    });
    socketInstance.on("chatHistory", (history) => {
      setMessages(history);
    });

    socketInstance.on("userOnline", (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketInstance.on("userOffline", (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socketInstance.on("onlineUsers", (users) => {
      setOnlineUsers(new Set(users));
    });

    socketInstance.on("userTyping", (data) => {
      if (data.from === selectedParticipant?.id) {
        setIsTyping(true);
      }
    });

    socketInstance.on("userStoppedTyping", (data) => {
      if (data.from === selectedParticipant?.id) {
        setIsTyping(false);
      }
    });

    socketInstance.on("error", (error) => {
      console.error("Socket error:", error);
      setError(error.message || "Socket connection error");
    });
    socketInstance.on("messageError", ({ tempId, error }) => {
      if (tempId) {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        setTempMessages((prev) => {
          const newTemp = { ...prev };
          delete newTemp[tempId];
          return newTemp;
        });
        setError(`Failed to send message: ${error}`);
      }
    });
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketInstance.disconnect();
    };
  }, [selectedParticipant]);

  // Render functions
  // This function renders the authentication modal.
  // It displays a message prompting the user to log in to access the chat.
  // It includes a button that navigates to the login page when clicked.

  const renderAuthModal = () => (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <div className="auth-modal-icon">🔐</div>
        <h3>Authentication Required</h3>
        <p>Please login to access the chat</p>
        <button
          onClick={() => {
            setShowAuthModal(false);
            navigate("/Log");
          }}
          className="auth-modal-button"
        >
          Go to Login
        </button>
      </div>
    </div>
  );

  // This function renders the user list.
  // It displays a list of chat participants with their names, roles, and online status.
  // It includes a search input to filter participants by name or specialization.
  // It also displays a badge for unread messages and an online indicator for online users.
  // The user list is conditionally hidden on mobile view if showUserList is false.
  // It uses the filteredParticipants array to display only the participants that match the search term.
  // It also includes a no participants message if there are no participants available or if the search term does not match any participants.

  const renderUserList = () => (
    <div
      className={`chat-user-list ${
        !showUserList && isMobileView ? "hidden-mobile" : ""
      }`}
    >
      <div className="user-list-header">
        <h3>Chat Participants</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
      </div>

      <div className="users-container">
        {filteredParticipants.length === 0 ? (
          <div className="no-users">
            {searchTerm ? "No participants found" : "No participants available"}
          </div>
        ) : (
          filteredParticipants.map((user) => (
            <div
              key={user.id}
              className={`chat-user-item ${
                selectedParticipant?.id === user.id ? "active" : ""
              }`}
              onClick={() => handleUserClick(user)}
            >
              <div className="avatar-container">
                {onlineUsers.has(user.id) && (
                  <div className="online-indicator"></div>
                )}
              </div>

              <div className="user-info">
                <div className="user-main-info">
                  <span className="user-name">{user.name}</span>
                  {unreadCounts[user.id] > 0 && (
                    <span className="unread-badge">
                      {unreadCounts[user.id]}
                    </span>
                  )}
                </div>

                <div className="user-meta">
                  {user.role === "doctor" && user.specialization && (
                    <span className="specialization-tag">
                      {user.specialization}
                    </span>
                  )}
                  <span
                    className={`status-text ${
                      onlineUsers.has(user.id) ? "online" : "offline"
                    }`}
                  >
                    {onlineUsers.has(user.id)
                      ? "Online"
                      : `Last seen ${formatLastSeen(user.lastSeen)}`}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // This function renders the chat area.
  // It displays the chat header with the selected participant's name and online status.
  // It also displays the chat messages, including sent and received messages with timestamps.
  // If no participant is selected, it shows a placeholder message prompting the user to select a participant.
  const renderChatArea = () => {
    if (!selectedParticipant) {
      return (
        <div className="chat-placeholder">
          <div className="placeholder-icon">💬</div>
          <h3>Welcome to Chat</h3>
          <p>Select a participant to start chatting</p>
        </div>
      );
    }

    return (
      <div
        className={`chat-area ${
          !showUserList && isMobileView ? "full-width" : ""
        }`}
      >
        <div className="chat-header">
          <div className="header-info">
            <div className="header-avatar">
              {onlineUsers.has(selectedParticipant.id) && (
                <div className="header-online-indicator"></div>
              )}
            </div>
            <div className="header-details">
              <h4>{selectedParticipant.name}</h4>
              {selectedParticipant.role === "doctor" &&
                selectedParticipant.specialization && (
                  <p className="header-specialization">
                    {selectedParticipant.specialization}
                  </p>
                )}
            </div>
          </div>

          <div className="header-actions">
            {isMobileView && (
              <button
                onClick={() => setShowUserList(true)}
                className="back-btn"
                title="Back to participants"
              >
                ←
              </button>
            )}
            <button
              onClick={handleCloseChat}
              className="close-chat-btn"
              title="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <div className="no-messages-icon">📝</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              // Determine if message is sent by current user
              const isSent =
                msg.from === "me" ||
                (socket && msg.sender && msg.sender._id === socket.id) ||
                (msg.sender &&
                  typeof msg.sender === "object" &&
                  msg.sender._id === socket?.userId);

              return (
                <div
                  key={msg._id || index} // Simplified key - use database ID or index
                  className={`message ${isSent ? "sent" : "received"}`}
                >
                  <div className="message-content">
                    {/* Only show status if it exists */}
                    {msg.status && (
                      <div
                        className={`message-status ${
                          msg.status === "error" ? "error" : ""
                        }`}
                      >
                        {msg.status === "sending"
                          ? "Sending..."
                          : msg.status === "error"
                          ? "Failed to send"
                          : null}
                      </div>
                    )}
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                      {isSent && (
                        <span className="message-status-icon">
                          {msg.status === "error"
                            ? "⚠️"
                            : msg.read
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="chat-input">
            <textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={handleKeyPress}
              rows={1}
              className="message-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="send-button"
              title="Send message"
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  if (showAuthModal) {
    return renderAuthModal();
  }

  if (isLoading) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <div className="error-icon">⚠️</div>
        <h3>Connection Error</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {renderUserList()}
      {renderChatArea()}
    </div>
  );
}
