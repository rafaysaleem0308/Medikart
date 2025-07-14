//This file is part of a larger pharmacy management system and is intended for use by administrators to manage the pharmacy's operations effectively.
//it includes features for managing users, products, orders, and analytics.
//It uses React hooks for state management and rendering.
// It also includes a responsive sidebar, a header with search and notifications, and a toast notification system.
// The layout is designed to be user-friendly and accessible, providing a seamless experience for administrators.
// It is styled using CSS modules for better maintainability and modularity.
// The component is structured to be responsive and user-friendly, providing a comprehensive overview of the pharmacy
// operations.
// It uses React hooks for state management and rendering.
// It is part of a larger pharmacy management system and is intended for use by administrators to manage the pharmacy's operations effectively.
// It includes features for managing users, products, orders, and analytics.
// It uses React hooks for state management and rendering.
// It also includes a responsive sidebar, a header with search and notifications, and a toast notification system.
// It is styled using CSS modules for better maintainability and modularity.
// This component is part of a larger pharmacy management system and is intended for use by administrators to manage the pharmacy's operations effectively.
// It includes features for managing users, products, orders, and analytics.
// It uses React hooks for state management and rendering.
// It also includes a responsive sidebar, a header with search and notifications, and a toast notification system.
// It is styled using CSS modules for better maintainability and modularity.

"use client";

import { useState, useEffect } from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPills,
  faBars,
  faTachometerAlt,
  faUsers,
  faChartBar,
  faSignOutAlt,
  faSearch,
  faBell,
  faMoon,
  faSun,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faBoxes,
  faUserPlus,
  faShoppingCart,
  faComment,
  faTicket,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminName, setAdminName] = useState("Admin User");
  const [searchTerm, setSearchTerm] = useState("");

  // Dashboard data
  const dashboardData = {
    notifications: [
      {
        id: 1,
        type: "user",
        message: "New customer registration: Dr. Sarah Ahmed",
        time: "5 minutes ago",
        read: false,
      },
      {
        id: 2,
        type: "order",
        message: "New prescription order #PH12345 for PKR 2,450",
        time: "15 minutes ago",
        read: false,
      },
      {
        id: 3,
        type: "product",
        message: "Low stock alert: Panadol 500mg (15 units left)",
        time: "1 hour ago",
        read: true,
      },
      {
        id: 4,
        type: "review",
        message: "New 5-star review for Vitamin D3 supplements",
        time: "2 hours ago",
        read: true,
      },
      {
        id: 5,
        type: "user",
        message: "Pharmacist account updated: Dr. Ali Khan",
        time: "3 hours ago",
        read: true,
      },
    ],
  };

  // Initialize component
  useEffect(() => {
    const setAdminNameFromStorage = () => {
      // Try to get user data from localStorage
      const userData = JSON.parse(
        localStorage.getItem("user") || localStorage.getItem("userData") || "{}"
      );

      // Set admin name based on available data
      if (userData.name) {
        setAdminName(userData.name);
      } else if (userData.fullName) {
        setAdminName(userData.fullName);
      } else if (userData.email) {
        // Fallback to email if name not available
        setAdminName(userData.email.split("@")[0]);
      } else {
        // Default if no user data found
        setAdminName("Admin User");
      }
    };

    const handleResize = () => {
      if (window.innerWidth < 992) {
        setSidebarCollapsed(false);
        setMobileMenuOpen(false);
      } else {
        setMobileMenuOpen(false);
        const savedState = localStorage.getItem("sidebarCollapsed") === "true";
        setSidebarCollapsed(savedState);
      }
    };

    setAdminNameFromStorage();
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [navigate]);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", newState);
  };

  // Toggle mobile menu
  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu
  const closeMobileMenu = (e) => {
    if (e) {
      e.stopPropagation();
    }
    setMobileMenuOpen(false);
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    showToast(
      `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`,
      "success"
    );
  };

  // Handle logout
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userData");
      localStorage.removeItem("userType");
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      showToast("Logged out successfully", "success");
      setTimeout(() => {
        navigate("/log");
      }, 1500);
    }
  };

  // Toggle notifications dropdown
  const toggleNotifications = (e) => {
    e.stopPropagation();
    setNotificationsOpen(!notificationsOpen);
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    dashboardData.notifications.forEach((notification) => {
      notification.read = true;
    });
    showToast("All notifications marked as read", "success");
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "user":
        return faUserPlus;
      case "order":
        return faShoppingCart;
      case "product":
        return faPills;
      case "review":
        return faComment;
      default:
        return faBell;
    }
  };

  // Handle search
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const term = searchTerm.trim().toLowerCase();
      if (term) {
        showToast(`Searching for "${term}"...`, "info");
        setTimeout(() => {
          showToast(
            `Search results for "${term}" are not available in this demo`,
            "info"
          );
        }, 1500);
      }
    }
  };

  // Get unread notification count
  const unreadNotificationsCount = dashboardData.notifications.filter(
    (notification) => !notification.read
  ).length;

  // Get toast icon
  const getToastIcon = () => {
    switch (toast.type) {
      case "success":
        return faCheckCircle;
      case "error":
        return faExclamationCircle;
      default:
        return faInfoCircle;
    }
  };

  // Prevent click propagation for sidebar content
  const handleSidebarClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`pharmacy-admin-layout ${theme}`} data-theme={theme}>
      {/* Page background */}
      <div className="pharmacy-page-background"></div>

      {/* Skip to main content link for accessibility */}

      {/* Sidebar */}
      <aside
        className={`pharmacy-sidebar ${
          sidebarCollapsed ? "pharmacy-sidebar--collapsed" : ""
        } ${mobileMenuOpen ? "pharmacy-sidebar--mobile-open" : ""}`}
        onClick={handleSidebarClick}
      >
        <div className="pharmacy-sidebar__header">
          <div className="pharmacy-brand">
            <FontAwesomeIcon icon={faPills} className="pharmacy-brand__icon" />
            <h1 className="pharmacy-brand__title">Medikart</h1>
          </div>
          <button className="pharmacy-sidebar__toggle" onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        <div className="pharmacy-sidebar__content">
          <div className="pharmacy-admin-profile">
            <div className="pharmacy-admin-profile__avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="pharmacy-admin-profile__info">
              <h3 className="pharmacy-admin-profile__name">{adminName}</h3>
              <p className="pharmacy-admin-profile__email">
                {JSON.parse(localStorage.getItem("user"))?.email ||
                  "admin@example.com"}
              </p>
              <p className="pharmacy-admin-profile__role">
                {JSON.parse(localStorage.getItem("user"))?.role ||
                  "Administrator"}
              </p>
            </div>
          </div>

          <nav className="pharmacy-navigation">
            <ul className="pharmacy-navigation__list">
              <li className="pharmacy-navigation__item">
                <Link
                  to="/admin"
                  className="pharmacy-navigation__link"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon
                    icon={faTachometerAlt}
                    className="pharmacy-navigation__icon"
                  />
                  <span className="pharmacy-navigation__text">Dashboard</span>
                </Link>
              </li>
              <li className="pharmacy-navigation__item">
                <Link
                  to="/admin/usermanagement"
                  className="pharmacy-navigation__link"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="pharmacy-navigation__icon"
                  />
                  <span className="pharmacy-navigation__text">
                    User Management
                  </span>
                </Link>
              </li>
              <li className="pharmacy-navigation__item">
                <Link
                  to="/admin/productmanagement"
                  className="pharmacy-navigation__link"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon
                    icon={faBoxes}
                    className="pharmacy-navigation__icon"
                  />
                  <span className="pharmacy-navigation__text">
                    Products Management
                  </span>
                </Link>
              </li>
              <li className="pharmacy-navigation__item">
                <Link
                  to="/admin/analytics"
                  className="pharmacy-navigation__link"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon
                    icon={faChartBar}
                    className="pharmacy-navigation__icon"
                  />
                  <span className="pharmacy-navigation__text">Analytics</span>
                </Link>
              </li>
              <li className="pharmacy-navigation__item">
                <Link
                  to="/admin/uservouchermanagement"
                  className="pharmacy-navigation__link"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon
                    icon={faTicket}
                    className="pharmacy-navigation__icon"
                  />
                  <span className="pharmacy-navigation__text">
                    Assign Vouchers
                  </span>
                </Link>
              </li>
              <li className="pharmacy-navigation__item">
                <Link
                  to="/admin/voucher"
                  className="pharmacy-navigation__link"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon
                    icon={faTicket}
                    className="pharmacy-navigation__icon"
                  />
                  <span className="pharmacy-navigation__text">
                    Voucher Update
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="pharmacy-sidebar__footer">
          <button className="pharmacy-logout-button" onClick={handleLogout}>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              className="pharmacy-logout-button__icon"
            />
            <span className="pharmacy-logout-button__text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="pharmacy-main-content">
        <header className="pharmacy-header">
          <div className="pharmacy-header__left">
            <button
              className="pharmacy-mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle sidebar menu"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <div className="pharmacy-search-bar">
              <FontAwesomeIcon
                icon={faSearch}
                className="pharmacy-search-bar__icon"
              />
              <input
                type="text"
                placeholder="Search medicines, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={handleSearch}
                className="pharmacy-search-bar__input"
              />
            </div>
          </div>

          <div className="pharmacy-header__actions">
            <button
              className="pharmacy-notification-button"
              onClick={toggleNotifications}
            >
              <FontAwesomeIcon icon={faBell} />
              {unreadNotificationsCount > 0 && (
                <span className="pharmacy-notification-badge">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              className="pharmacy-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              <FontAwesomeIcon icon={theme === "dark" ? faSun : faMoon} />
            </button>
          </div>

          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div className="pharmacy-notifications-dropdown pharmacy-notifications-dropdown--show">
              <div className="pharmacy-notifications-dropdown__header">
                <h3 className="pharmacy-notifications-dropdown__title">
                  Notifications
                </h3>
                <span
                  className="pharmacy-notifications-dropdown__mark-read"
                  onClick={markAllNotificationsAsRead}
                >
                  Mark all as read
                </span>
              </div>
              <div className="pharmacy-notifications-dropdown__list">
                {dashboardData.notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`pharmacy-notification-item ${
                      notification.read
                        ? ""
                        : "pharmacy-notification-item--unread"
                    }`}
                  >
                    <div className="pharmacy-notification-item__icon">
                      <FontAwesomeIcon
                        icon={getNotificationIcon(notification.type)}
                      />
                    </div>
                    <div className="pharmacy-notification-item__content">
                      <p className="pharmacy-notification-item__message">
                        {notification.message}
                      </p>
                      <span className="pharmacy-notification-item__time">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pharmacy-notifications-dropdown__footer">
                <Link
                  to="/admin/notifications"
                  className="pharmacy-notifications-dropdown__view-all"
                  onClick={() => setNotificationsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Page-specific content will be rendered here */}
        <Outlet />

        {/* Toast Notification */}
        {toast.show && (
          <div
            className="pharmacy-toast pharmacy-toast--show"
            aria-live="polite"
          >
            <div className="pharmacy-toast__content">
              <FontAwesomeIcon
                icon={getToastIcon()}
                className="pharmacy-toast__icon"
                aria-hidden="true"
              />
              <div className="pharmacy-toast__message">{toast.message}</div>
            </div>
            <div className="pharmacy-toast__progress"></div>
          </div>
        )}
      </main>

      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="pharmacy-sidebar-backdrop pharmacy-sidebar-backdrop--show"
          onClick={closeMobileMenu}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
