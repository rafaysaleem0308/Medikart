"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faBuilding,
  faGlobe,
  faShieldAlt,
  faDatabase,
  faSave,
  faCog,
} from "@fortawesome/free-solid-svg-icons";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    profile: {
      fullName: "Admin User",
      email: "admin@pharmacare.com",
      phone: "+92 300 1234567",
      address: "123 Medical Street, Karachi, Pakistan",
      avatar: "",
    },
    company: {
      name: "PharmaCare Medical Store",
      license: "PH-2024-001",
      address: "456 Healthcare Avenue, Lahore, Pakistan",
      phone: "+92 42 1234567",
      email: "info@pharmacare.com",
      website: "www.pharmacare.com",
    },
    system: {
      language: "en",
      timezone: "Asia/Karachi",
      currency: "PKR",
      dateFormat: "DD/MM/YYYY",
      lowStockThreshold: 10,
      autoBackup: true,
      emailNotifications: true,
      smsNotifications: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
    },
  });

  const handleSaveSettings = (section) => {
    // In a real app, you would save to an API here
    console.log(`${section} settings saved`, settings[section]);
  };

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const renderProfileSettings = () => (
    <div className="pharmacy-settings-section">
      <h3 className="pharmacy-settings-section__title">Profile Information</h3>
      <div className="pharmacy-settings-form">
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faUser} />
            Full Name
          </label>
          <input
            type="text"
            value={settings.profile.fullName}
            onChange={(e) =>
              handleInputChange("profile", "fullName", e.target.value)
            }
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faEnvelope} />
            Email Address
          </label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={(e) =>
              handleInputChange("profile", "email", e.target.value)
            }
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faPhone} />
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={(e) =>
              handleInputChange("profile", "phone", e.target.value)
            }
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Address
          </label>
          <textarea
            value={settings.profile.address}
            onChange={(e) =>
              handleInputChange("profile", "address", e.target.value)
            }
            rows="3"
            className="pharmacy-form-textarea"
          />
        </div>
        <button
          className="pharmacy-primary-button"
          onClick={() => handleSaveSettings("profile")}
        >
          <FontAwesomeIcon icon={faSave} />
          Save Profile
        </button>
      </div>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="pharmacy-settings-section">
      <h3 className="pharmacy-settings-section__title">Company Information</h3>
      <div className="pharmacy-settings-form">
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faBuilding} />
            Company Name
          </label>
          <input
            type="text"
            value={settings.company.name}
            onChange={(e) =>
              handleInputChange("company", "name", e.target.value)
            }
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faShieldAlt} />
            License Number
          </label>
          <input
            type="text"
            value={settings.company.license}
            onChange={(e) =>
              handleInputChange("company", "license", e.target.value)
            }
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            Business Address
          </label>
          <textarea
            value={settings.company.address}
            onChange={(e) =>
              handleInputChange("company", "address", e.target.value)
            }
            rows="3"
            className="pharmacy-form-textarea"
          />
        </div>
        <div className="pharmacy-form-row">
          <div className="pharmacy-form-group">
            <label className="pharmacy-form-label">
              <FontAwesomeIcon icon={faPhone} />
              Business Phone
            </label>
            <input
              type="tel"
              value={settings.company.phone}
              onChange={(e) =>
                handleInputChange("company", "phone", e.target.value)
              }
              className="pharmacy-form-input"
            />
          </div>
          <div className="pharmacy-form-group">
            <label className="pharmacy-form-label">
              <FontAwesomeIcon icon={faEnvelope} />
              Business Email
            </label>
            <input
              type="email"
              value={settings.company.email}
              onChange={(e) =>
                handleInputChange("company", "email", e.target.value)
              }
              className="pharmacy-form-input"
            />
          </div>
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            <FontAwesomeIcon icon={faGlobe} />
            Website
          </label>
          <input
            type="url"
            value={settings.company.website}
            onChange={(e) =>
              handleInputChange("company", "website", e.target.value)
            }
            className="pharmacy-form-input"
          />
        </div>
        <button
          className="pharmacy-primary-button"
          onClick={() => handleSaveSettings("company")}
        >
          <FontAwesomeIcon icon={faSave} />
          Save Company Info
        </button>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="pharmacy-settings-section">
      <h3 className="pharmacy-settings-section__title">System Preferences</h3>
      <div className="pharmacy-settings-form">
        <div className="pharmacy-form-row">
          <div className="pharmacy-form-group">
            <label className="pharmacy-form-label">Language</label>
            <select
              value={settings.system.language}
              onChange={(e) =>
                handleInputChange("system", "language", e.target.value)
              }
              className="pharmacy-form-select"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
          <div className="pharmacy-form-group">
            <label className="pharmacy-form-label">Timezone</label>
            <select
              value={settings.system.timezone}
              onChange={(e) =>
                handleInputChange("system", "timezone", e.target.value)
              }
              className="pharmacy-form-select"
            >
              <option value="Asia/Karachi">Asia/Karachi</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
            </select>
          </div>
        </div>
        <div className="pharmacy-form-row">
          <div className="pharmacy-form-group">
            <label className="pharmacy-form-label">Currency</label>
            <select
              value={settings.system.currency}
              onChange={(e) =>
                handleInputChange("system", "currency", e.target.value)
              }
              className="pharmacy-form-select"
            >
              <option value="PKR">Pakistani Rupee (PKR)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>
          <div className="pharmacy-form-group">
            <label className="pharmacy-form-label">Date Format</label>
            <select
              value={settings.system.dateFormat}
              onChange={(e) =>
                handleInputChange("system", "dateFormat", e.target.value)
              }
              className="pharmacy-form-select"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">Low Stock Threshold</label>
          <input
            type="number"
            value={settings.system.lowStockThreshold}
            onChange={(e) =>
              handleInputChange(
                "system",
                "lowStockThreshold",
                Number.parseInt(e.target.value)
              )
            }
            min="1"
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <div className="pharmacy-checkbox-group">
            <label className="pharmacy-checkbox-label">
              <input
                type="checkbox"
                checked={settings.system.autoBackup}
                onChange={(e) =>
                  handleInputChange("system", "autoBackup", e.target.checked)
                }
                className="pharmacy-checkbox-input"
              />
              <span className="pharmacy-checkmark"></span>
              Enable Automatic Backup
            </label>
          </div>
        </div>
        <div className="pharmacy-form-group">
          <div className="pharmacy-checkbox-group">
            <label className="pharmacy-checkbox-label">
              <input
                type="checkbox"
                checked={settings.system.emailNotifications}
                onChange={(e) =>
                  handleInputChange(
                    "system",
                    "emailNotifications",
                    e.target.checked
                  )
                }
                className="pharmacy-checkbox-input"
              />
              <span className="pharmacy-checkmark"></span>
              Email Notifications
            </label>
          </div>
        </div>
        <div className="pharmacy-form-group">
          <div className="pharmacy-checkbox-group">
            <label className="pharmacy-checkbox-label">
              <input
                type="checkbox"
                checked={settings.system.smsNotifications}
                onChange={(e) =>
                  handleInputChange(
                    "system",
                    "smsNotifications",
                    e.target.checked
                  )
                }
                className="pharmacy-checkbox-input"
              />
              <span className="pharmacy-checkmark"></span>
              SMS Notifications
            </label>
          </div>
        </div>
        <button
          className="pharmacy-primary-button"
          onClick={() => handleSaveSettings("system")}
        >
          <FontAwesomeIcon icon={faSave} />
          Save System Settings
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="pharmacy-settings-section">
      <h3 className="pharmacy-settings-section__title">Security Settings</h3>
      <div className="pharmacy-settings-form">
        <div className="pharmacy-form-group">
          <div className="pharmacy-checkbox-group">
            <label className="pharmacy-checkbox-label">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) =>
                  handleInputChange(
                    "security",
                    "twoFactorAuth",
                    e.target.checked
                  )
                }
                className="pharmacy-checkbox-input"
              />
              <span className="pharmacy-checkmark"></span>
              Enable Two-Factor Authentication
            </label>
          </div>
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) =>
              handleInputChange(
                "security",
                "sessionTimeout",
                Number.parseInt(e.target.value)
              )
            }
            min="5"
            max="120"
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">Password Expiry (days)</label>
          <input
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) =>
              handleInputChange(
                "security",
                "passwordExpiry",
                Number.parseInt(e.target.value)
              )
            }
            min="30"
            max="365"
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-form-group">
          <label className="pharmacy-form-label">Maximum Login Attempts</label>
          <input
            type="number"
            value={settings.security.loginAttempts}
            onChange={(e) =>
              handleInputChange(
                "security",
                "loginAttempts",
                Number.parseInt(e.target.value)
              )
            }
            min="3"
            max="10"
            className="pharmacy-form-input"
          />
        </div>
        <div className="pharmacy-security-actions">
          <button className="pharmacy-secondary-button">
            <FontAwesomeIcon icon={faLock} />
            Change Password
          </button>
          <button className="pharmacy-secondary-button">
            <FontAwesomeIcon icon={faDatabase} />
            Backup Data
          </button>
        </div>
        <button
          className="pharmacy-primary-button"
          onClick={() => handleSaveSettings("security")}
        >
          <FontAwesomeIcon icon={faSave} />
          Save Security Settings
        </button>
      </div>
    </div>
  );

  return (
    <div className="pharmacy-dashboard-content">
      <div className="pharmacy-page-header">
        <h1 className="pharmacy-page-header__title">Settings</h1>
        <p className="pharmacy-page-header__subtitle">
          Manage your pharmacy system preferences and configurations
        </p>
      </div>

      <div className="pharmacy-settings-container">
        {/* Settings Navigation */}
        <div className="pharmacy-settings-navigation">
          <button
            className={`pharmacy-settings-tab ${
              activeTab === "profile" ? "pharmacy-settings-tab--active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <FontAwesomeIcon icon={faUser} />
            Profile
          </button>
          <button
            className={`pharmacy-settings-tab ${
              activeTab === "company" ? "pharmacy-settings-tab--active" : ""
            }`}
            onClick={() => setActiveTab("company")}
          >
            <FontAwesomeIcon icon={faBuilding} />
            Company
          </button>
          <button
            className={`pharmacy-settings-tab ${
              activeTab === "system" ? "pharmacy-settings-tab--active" : ""
            }`}
            onClick={() => setActiveTab("system")}
          >
            <FontAwesomeIcon icon={faCog} />
            System
          </button>
          <button
            className={`pharmacy-settings-tab ${
              activeTab === "security" ? "pharmacy-settings-tab--active" : ""
            }`}
            onClick={() => setActiveTab("security")}
          >
            <FontAwesomeIcon icon={faShieldAlt} />
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="pharmacy-settings-content">
          {activeTab === "profile" && renderProfileSettings()}
          {activeTab === "company" && renderCompanySettings()}
          {activeTab === "system" && renderSystemSettings()}
          {activeTab === "security" && renderSecuritySettings()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
