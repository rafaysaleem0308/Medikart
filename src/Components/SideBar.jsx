// import React from "react";
// import "../styles/Chatbox.css";

// const Sidebar = ({
//   users,
//   selectedUser,
//   onUserClick,
//   searchTerm,
//   onSearchChange,
//   formatLastSeen,
// }) => {
//   return (
//     <div className="sidebar-container">
//       {/* Search input */}
//       <div className="sidebar-header">
//         <input
//           type="text"
//           className="sidebar-search-input"
//           placeholder="Search by name or role..."
//           value={searchTerm}
//           onChange={(e) => onSearchChange(e.target.value)}
//         />
//       </div>

//       {/* Users list */}
//       <div className="sidebar-users-list">
//         {users.length === 0 ? (
//           <p className="no-users">No users found.</p>
//         ) : (
//           users.map((user) => (
//             <div
//               key={user.id}
//               className={`sidebar-user ${
//                 selectedUser?.id === user.id ? "active" : ""
//               }`}
//               onClick={() => onUserClick(user)}
//             >
//               {/* Avatar with online indicator */}
//               <div className="avatar-container">
//                 <img
//                   src={user.avatar || "/placeholder.svg"}
//                   alt={user.name}
//                   className="sidebar-avatar"
//                 />
//                 {user.online && <span className="online-badge"></span>}
//               </div>

//               {/* User info */}
//               <div className="sidebar-user-info">
//                 <div className="user-main-info">
//                   <h4>{user.name}</h4>
//                   {user.unreadCount > 0 && (
//                     <span className="unread-count">{user.unreadCount}</span>
//                   )}
//                 </div>

//                 <div className="user-meta-info">
//                   <p className="user-specialization">
//                     {user.role === "doctor" && user.specialization && (
//                       <span className="specialization-badge">
//                         {user.specialization.toLowerCase()}
//                       </span>
//                     )}
//                   </p>

//                   <p
//                     className={`user-status ${
//                       user.online ? "online" : "offline"
//                     }`}
//                   >
//                     {user.online ? (
//                       <span className="status-indicator online">Online</span>
//                     ) : (
//                       <span className="status-indicator offline">
//                         Last seen {formatLastSeen(user.lastSeen)}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState, useEffect } from "react";
import "../styles/Chatbox.css";

const Sidebar = ({
  users,
  selectedUser,
  onUserClick,
  searchTerm,
  onSearchChange,
  formatLastSeen,
}) => {
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState("online"); // 'online', 'name', 'recent'
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.specialization &&
          user.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (showOnlineOnly) {
      filtered = filtered.filter((user) => user.online);
    }

    // Sort users
    filtered.sort((a, b) => {
      if (sortBy === "online") {
        if (a.online && !b.online) return -1;
        if (!a.online && b.online) return 1;
        return a.name.localeCompare(b.name);
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        return new Date(b.lastSeen) - new Date(a.lastSeen);
      }
      return 0;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy, showOnlineOnly]);

  const getTotalUnreadCount = () => {
    return users.reduce((total, user) => total + (user.unreadCount || 0), 0);
  };

  const getOnlineCount = () => {
    return users.filter((user) => user.online).length;
  };

  const handleUserClick = (user) => {
    // Add click animation
    const userElement = document.querySelector(`[data-user-id="${user.id}"]`);
    if (userElement) {
      userElement.classList.add("user-clicked");
      setTimeout(() => {
        userElement.classList.remove("user-clicked");
      }, 200);
    }
    onUserClick(user);
  };

  const clearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="sidebar-container">
      {/* Enhanced Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">
          <h2>Messages</h2>
          <div className="sidebar-stats">
            <span className="online-count">
              <div className="online-indicator"></div>
              {getOnlineCount()} online
            </span>
            {getTotalUnreadCount() > 0 && (
              <span className="total-unread">
                {getTotalUnreadCount()} unread
              </span>
            )}
          </div>
        </div>

        {/* Enhanced Search */}
        <div className={`sidebar-search ${isSearchFocused ? "focused" : ""}`}>
          <div className="search-icon">🔍</div>
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search by name or role..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="sidebar-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${sortBy === "online" ? "active" : ""}`}
              onClick={() => setSortBy("online")}
              title="Sort by online status"
            >
              🟢
            </button>
            <button
              className={`filter-btn ${sortBy === "name" ? "active" : ""}`}
              onClick={() => setSortBy("name")}
              title="Sort by name"
            >
              📝
            </button>
            <button
              className={`filter-btn ${sortBy === "recent" ? "active" : ""}`}
              onClick={() => setSortBy("recent")}
              title="Sort by recent activity"
            >
              🕒
            </button>
            <button
              className={`filter-btn ${showOnlineOnly ? "active" : ""}`}
              onClick={() => setShowOnlineOnly(!showOnlineOnly)}
              title="Show online only"
            >
              👁️
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Users List */}
      <div className="sidebar-users-list">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <p>No users found</p>
            {searchTerm && (
              <button className="clear-search-btn" onClick={clearSearch}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="users-count">
              {filteredUsers.length} participant
              {filteredUsers.length !== 1 ? "s" : ""}
            </div>
            {filteredUsers.map((user, index) => (
              <div
                key={user.id}
                data-user-id={user.id}
                className={`sidebar-user ${
                  selectedUser?.id === user.id ? "active" : ""
                } ${user.online ? "online" : "offline"}`}
                onClick={() => handleUserClick(user)}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                {/* Enhanced Avatar */}
                <div className="sidebar-avatar-container">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="sidebar-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.name
                      )}&background=6366f1&color=fff&size=48`;
                    }}
                  />
                  <div
                    className={`status-indicator ${
                      user.online ? "online" : "offline"
                    }`}
                  >
                    {user.online && <div className="pulse-ring"></div>}
                  </div>
                  {user.typing && (
                    <div className="typing-indicator">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced User Info */}
                <div className="sidebar-user-info">
                  <div className="user-header">
                    <h4 className="user-name">{user.name}</h4>
                    {user.isVerified && (
                      <span className="verified-badge" title="Verified">
                        ✓
                      </span>
                    )}
                  </div>

                  <div className="user-role-specialization">
                    <p className="sidebar-role">
                      <span className="role-icon">
                        {user.role === "doctor" ? "👨‍⚕️" : "👤"}
                      </span>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      {user.specialization && ` • ${user.specialization}`}
                    </p>
                  </div>

                  <div className="user-status-container">
                    <p
                      className={`sidebar-status ${
                        user.online ? "online" : "offline"
                      }`}
                    >
                      {user.online ? (
                        <span>
                          <span className="status-dot online"></span>
                          Online
                        </span>
                      ) : (
                        <span>
                          <span className="status-dot offline"></span>
                          Last seen {formatLastSeen(user.lastSeen)}
                        </span>
                      )}
                    </p>

                    {user.lastMessage && (
                      <p className="last-message">
                        {user.lastMessage.length > 30
                          ? `${user.lastMessage.substring(0, 30)}...`
                          : user.lastMessage}
                      </p>
                    )}
                  </div>
                </div>

                {/* Enhanced Unread Count */}
                {user.unreadCount > 0 && (
                  <div className="unread-container">
                    <span className="unread-count">
                      {user.unreadCount > 99 ? "99+" : user.unreadCount}
                    </span>
                  </div>
                )}

                {/* User Actions */}
                <div className="user-actions">
                  {user.online && (
                    <button
                      className="quick-action"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Quick call action
                      }}
                      title="Quick call"
                    >
                      📞
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" title="Settings">
          ⚙️
        </button>
        <button className="sidebar-footer-btn" title="New Chat">
          ✏️
        </button>
        <button className="sidebar-footer-btn" title="Archive">
          📁
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
