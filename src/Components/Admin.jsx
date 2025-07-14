"use client";

//This file defines the Admin component for the Pharmacy Admin Dashboard.
// It includes statistics, user management, product management, and recent activity sections.
//User management allows admins to create, edit, and manage user accounts.
////Product management allows admins to add, edit, and organize medicines in the inventory.
//Recent activity shows the latest actions taken by users and admins.
// The component uses FontAwesome icons for visual representation and includes styles from an external CSS file.
// The dashboard data is hardcoded for demonstration purposes but can be replaced with dynamic data from an API or database in a real application.
// The component is structured to be responsive and user-friendly, providing a comprehensive overview of the pharmacy's operations.
// It uses React hooks for state management and rendering.
// This component is part of a larger pharmacy management system and is intended for use by administrators to manage the pharmacy's operations effectively.

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faPills,
  faUserPlus,
  faShoppingCart,
  faComment,
  faCheck,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faUsersCog,
  faDollarSign,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Admin.css"; // Adjust the path as necessary
const Admin = () => {
  // Dashboard data
  const dashboardData = {
    stats: {
      customers: { count: 2847, change: 15, trend: "up" },
      products: { count: 1256, change: 8, trend: "up" },
      orders: { count: 1854, change: 12, trend: "up" },
      revenue: { count: "PKR 485,920", change: 28, trend: "up" },
    },
    recentActivity: [
      {
        type: "user-plus",
        title: "New Customer Registration",
        description: "Dr. Fatima registered a new account",
        time: "5 minutes ago",
      },
      {
        type: "shopping-cart",
        title: "New Prescription Order",
        description: "Order #PH12345 was placed for PKR 2,450",
        time: "15 minutes ago",
      },
      {
        type: "pills",
        title: "Product Added",
        description: '"Augmentin 625mg" was added to the inventory',
        time: "1 hour ago",
      },
      {
        type: "comment",
        title: "New Review",
        description: 'Ahmad left a 5-star review for "Centrum Multivitamin"',
        time: "2 hours ago",
      },
    ],
  };

  return (
    <div className="pharma-admin-container">
      <div className="pharma-admin-header">
        <h1 className="pharma-admin-title">Pharmacy Admin Dashboard</h1>
        <p className="pharma-admin-subtitle">
          Welcome to the PharmaCare admin panel
        </p>
      </div>

      <div className="pharma-stats-grid">
        {Object.entries(dashboardData.stats).map(([key, stat]) => (
          <div className="pharma-stat-card" key={key}>
            <div className="pharma-stat-icon">
              <FontAwesomeIcon
                icon={
                  key === "customers"
                    ? faUsers
                    : key === "products"
                    ? faPills
                    : key === "orders"
                    ? faShoppingCart
                    : faDollarSign
                }
              />
            </div>
            <div className="pharma-stat-content">
              <h3 className="pharma-stat-label">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </h3>
              <p className="pharma-stat-value">{stat.count}</p>
              <div
                className={`pharma-stat-change ${
                  stat.trend === "up" ? "pharma-stat-up" : "pharma-stat-down"
                }`}
              >
                <FontAwesomeIcon
                  icon={stat.trend === "up" ? faArrowUp : faArrowDown}
                />
                <span>{stat.change}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pharma-management-grid">
        <div className="pharma-management-card">
          <div className="pharma-management-icon">
            <FontAwesomeIcon icon={faUsersCog} />
          </div>
          <div className="pharma-management-content">
            <h2 className="pharma-management-title">User Management</h2>
            <p className="pharma-management-description">
              Manage customer accounts, pharmacists, and permissions
            </p>
            <ul className="pharma-feature-list">
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Create and edit user accounts
              </li>
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Manage user roles and permissions
              </li>
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                View customer activity logs
              </li>
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Handle customer support requests
              </li>
            </ul>
            <a
              href="/admin/UserManagement"
              className="pharma-management-button"
            >
              Manage Users
              <FontAwesomeIcon icon={faArrowRight} />
            </a>
          </div>
        </div>

        <div className="pharma-management-card">
          <div className="pharma-management-icon">
            <FontAwesomeIcon icon={faBoxes} />
          </div>
          <div className="pharma-management-content">
            <h2 className="pharma-management-title">Products Management</h2>
            <p className="pharma-management-description">
              Add, edit, and organize medicines in the inventory
            </p>
            <ul className="pharma-feature-list">
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Add new medicines to inventory
              </li>
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Update product information and pricing
              </li>
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Manage categories and prescriptions
              </li>
              <li className="pharma-feature-item">
                <FontAwesomeIcon
                  icon={faCheck}
                  className="pharma-feature-icon"
                />
                Handle stock alerts and expiry dates
              </li>
            </ul>
            <a
              href="/admin/ProductManagement"
              className="pharma-management-button"
            >
              Manage Products
              <FontAwesomeIcon icon={faArrowRight} />
            </a>
          </div>
        </div>
      </div>

      <div className="pharma-activity-card">
        <div className="pharma-section-header">
          <h2 className="pharma-section-title">Recent Activity</h2>
          <a href="/activity" className="pharma-section-link">
            View All
            <FontAwesomeIcon icon={faArrowRight} />
          </a>
        </div>
        <div className="pharma-activity-list">
          {dashboardData.recentActivity.map((activity, index) => (
            <div className="pharma-activity-item" key={index}>
              <div className="pharma-activity-icon">
                <FontAwesomeIcon
                  icon={
                    activity.type === "user-plus"
                      ? faUserPlus
                      : activity.type === "shopping-cart"
                      ? faShoppingCart
                      : activity.type === "pills"
                      ? faPills
                      : faComment
                  }
                />
              </div>
              <div className="pharma-activity-details">
                <h4 className="pharma-activity-name">{activity.title}</h4>
                <p className="pharma-activity-text">{activity.description}</p>
                <span className="pharma-activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
