//this file contains the Analytics component for a dashboard
// that displays various metrics and insights for a pharmacy management system.
// It includes sections for total revenue, orders, average order value, customer retention, top products, sales by category, and recent transactions.
// The component uses FontAwesome icons for visual representation and is styled with an external CSS file.
// The data is hardcoded for demonstration purposes but can be replaced with dynamic data from an API
// or database in a real application.
// The component is structured to be responsive and user-friendly, providing a comprehensive overview of the pharmacy
// operations. It uses React hooks for state management and rendering.
// This component is part of a larger pharmacy management system and is intended for use by administrators to
// manage the pharmacy's operations effectively.
// The component is designed to be modular and reusable, making it easy to integrate into different parts
//operations
//It performs various calculations and displays the data in a user-friendly format.
// The component is designed to be modular and reusable, making it easy to integrate into different parts
// of the application.

"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faDollarSign,
  faShoppingCart,
  faEye,
  faDownload,
  faCalendarAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Analytics.css";

const Analytics = () => {
  // Sample analytics data
  const analyticsData = {
    overview: {
      totalRevenue: { value: 485920, change: 28, trend: "up" },
      totalOrders: { value: 1854, change: 12, trend: "up" },
      avgOrderValue: { value: 262.15, change: 8, trend: "up" },
      customerRetention: { value: 78.5, change: -2, trend: "down" },
    },
    topProducts: [
      { name: "Panadol 500mg", sales: 245, revenue: 11025, growth: 15 },
      { name: "Vitamin D3 1000IU", sales: 189, revenue: 22680, growth: 22 },
      { name: "Augmentin 625mg", sales: 156, revenue: 43680, growth: 8 },
      { name: "Insulin Glargine", sales: 89, revenue: 111250, growth: 35 },
      { name: "Aspirin 75mg", sales: 167, revenue: 5845, growth: -5 },
    ],
    salesByCategory: [
      { category: "Pain Relief", percentage: 28, value: 136057 },
      { category: "Antibiotics", percentage: 22, value: 106902 },
      { category: "Vitamins", percentage: 18, value: 87466 },
      { category: "Diabetes", percentage: 16, value: 77747 },
      { category: "Cardiovascular", percentage: 16, value: 77748 },
    ],
    recentTransactions: [
      {
        id: "TXN001",
        customer: "Dr. Sarah Ahmed",
        amount: 2450,
        products: 3,
        date: "2024-01-20",
        status: "completed",
      },
      {
        id: "TXN002",
        customer: "Ahmad Ali",
        amount: 890,
        products: 2,
        date: "2024-01-20",
        status: "completed",
      },
      {
        id: "TXN003",
        customer: "Hassan Sheikh",
        amount: 1250,
        products: 1,
        date: "2024-01-19",
        status: "pending",
      },
      {
        id: "TXN004",
        customer: "Dr. Fatima Khan",
        amount: 3200,
        products: 5,
        date: "2024-01-19",
        status: "completed",
      },
    ],
  };

  const formatCurrency = (amount) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header-container">
        <h1 className="analytics-main-title">Analytics Dashboard</h1>
        <p className="analytics-subtitle-text">
          Track sales performance and business insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="analytics-stats-container">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon-revenue">
            <FontAwesomeIcon icon={faDollarSign} />
          </div>
          <div className="analytics-stat-content">
            <h3 className="analytics-stat-label">Total Revenue</h3>
            <p className="analytics-stat-value">
              {formatCurrency(analyticsData.overview.totalRevenue.value)}
            </p>
          </div>
          <div
            className={`analytics-stat-trend ${
              analyticsData.overview.totalRevenue.trend === "up"
                ? "analytics-stat-trend-up"
                : "analytics-stat-trend-down"
            }`}
          >
            <FontAwesomeIcon
              icon={
                analyticsData.overview.totalRevenue.trend === "up"
                  ? faArrowUp
                  : faArrowDown
              }
            />
            <span>{analyticsData.overview.totalRevenue.change}%</span>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon-orders">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="analytics-stat-content">
            <h3 className="analytics-stat-label">Total Orders</h3>
            <p className="analytics-stat-value">
              {analyticsData.overview.totalOrders.value.toLocaleString()}
            </p>
          </div>
          <div
            className={`analytics-stat-trend ${
              analyticsData.overview.totalOrders.trend === "up"
                ? "analytics-stat-trend-up"
                : "analytics-stat-trend-down"
            }`}
          >
            <FontAwesomeIcon
              icon={
                analyticsData.overview.totalOrders.trend === "up"
                  ? faArrowUp
                  : faArrowDown
              }
            />
            <span>{analyticsData.overview.totalOrders.change}%</span>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon-avg">
            <FontAwesomeIcon icon={faEye} />
          </div>
          <div className="analytics-stat-content">
            <h3 className="analytics-stat-label">Avg Order Value</h3>
            <p className="analytics-stat-value">
              {formatCurrency(analyticsData.overview.avgOrderValue.value)}
            </p>
          </div>
          <div
            className={`analytics-stat-trend ${
              analyticsData.overview.avgOrderValue.trend === "up"
                ? "analytics-stat-trend-up"
                : "analytics-stat-trend-down"
            }`}
          >
            <FontAwesomeIcon
              icon={
                analyticsData.overview.avgOrderValue.trend === "up"
                  ? faArrowUp
                  : faArrowDown
              }
            />
            <span>{analyticsData.overview.avgOrderValue.change}%</span>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon-retention">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="analytics-stat-content">
            <h3 className="analytics-stat-label">Customer Retention</h3>
            <p className="analytics-stat-value">
              {analyticsData.overview.customerRetention.value}%
            </p>
          </div>
          <div
            className={`analytics-stat-trend ${
              analyticsData.overview.customerRetention.trend === "up"
                ? "analytics-stat-trend-up"
                : "analytics-stat-trend-down"
            }`}
          >
            <FontAwesomeIcon
              icon={
                analyticsData.overview.customerRetention.trend === "up"
                  ? faArrowUp
                  : faArrowDown
              }
            />
            <span>
              {Math.abs(analyticsData.overview.customerRetention.change)}%
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Sections */}
      <div className="analytics-content-grid">
        {/* Top Products */}
        <div className="analytics-data-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Top Selling Products</h3>
            <button className="analytics-export-btn">
              <FontAwesomeIcon icon={faDownload} />
              Export
            </button>
          </div>
          <div className="analytics-products-list">
            {analyticsData.topProducts.map((product, index) => (
              <div key={index} className="analytics-product-item">
                <div className="analytics-product-rank">#{index + 1}</div>
                <div className="analytics-product-details">
                  <div className="analytics-product-name">{product.name}</div>
                  <div className="analytics-product-stats">
                    <span>{product.sales} sales</span>
                    <span>{formatCurrency(product.revenue)}</span>
                  </div>
                </div>
                <div
                  className={`analytics-growth-indicator ${
                    product.growth >= 0
                      ? "analytics-growth-up"
                      : "analytics-growth-down"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={product.growth >= 0 ? faArrowUp : faArrowDown}
                  />
                  {Math.abs(product.growth)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Category */}
        <div className="analytics-data-card">
          <div className="analytics-card-header">
            <h3 className="analytics-card-title">Sales by Category</h3>
          </div>
          <div className="analytics-category-list">
            {analyticsData.salesByCategory.map((category, index) => (
              <div key={index} className="analytics-category-item">
                <div className="analytics-category-info">
                  <span className="analytics-category-name">
                    {category.category}
                  </span>
                  <span className="analytics-category-value">
                    {formatCurrency(category.value)}
                  </span>
                </div>
                <div className="analytics-category-bar">
                  <div
                    className="analytics-category-fill"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="analytics-category-percent">
                  {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="analytics-table-section">
        <div className="analytics-section-header">
          <h2 className="analytics-section-title">Recent Transactions</h2>
          <button className="analytics-view-all-btn">View All</button>
        </div>
        <div className="analytics-table-wrapper">
          <table className="analytics-data-table">
            <thead className="analytics-table-head">
              <tr className="analytics-table-row">
                <th className="analytics-table-header">Transaction ID</th>
                <th className="analytics-table-header">Customer</th>
                <th className="analytics-table-header">Amount</th>
                <th className="analytics-table-header">Products</th>
                <th className="analytics-table-header">Date</th>
                <th className="analytics-table-header">Status</th>
              </tr>
            </thead>
            <tbody className="analytics-table-body">
              {analyticsData.recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="analytics-table-row">
                  <td className="analytics-table-cell">
                    <span className="analytics-txn-id">{transaction.id}</span>
                  </td>
                  <td className="analytics-table-cell">
                    {transaction.customer}
                  </td>
                  <td className="analytics-table-cell">
                    <span className="analytics-txn-amount">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="analytics-table-cell">
                    {transaction.products} items
                  </td>
                  <td className="analytics-table-cell">
                    <span className="analytics-txn-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {transaction.date}
                    </span>
                  </td>
                  <td className="analytics-table-cell">
                    <span
                      className={`analytics-status-badge ${
                        transaction.status === "completed"
                          ? "analytics-status-completed"
                          : "analytics-status-pending"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
