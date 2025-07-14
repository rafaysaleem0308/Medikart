import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    specialization: "",
    voucher_assigned: [],
  });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`http://localhost:5000/api/auth/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate("/login");
          return;
        }
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
      setFormData({
        name: data.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (editMode) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      // Only validate password fields if any password field has value
      if (
        formData.currentPassword ||
        formData.newPassword ||
        formData.confirmPassword
      ) {
        if (!formData.currentPassword) {
          newErrors.currentPassword = "Current password is required";
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
          newErrors.newPassword = "Password must be at least 6 characters";
        }

        if (formData.newPassword !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const updateData = {
        name: formData.name,
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(`http://localhost:5000/api/auth/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Update failed");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setSuccessMessage("Profile updated successfully!");
      setEditMode(false);

      // Update local storage if name changed
      if (formData.name !== userData.name) {
        localStorage.setItem("userName", formData.name);
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          user.name = formData.name;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Update error:", error);
      setErrors({ general: error.message });
    }
  };

  const handleUseVoucher = async (voucherId) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `http://localhost:5000/api/auth/${userId}/use-voucher/${voucherId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark voucher as used");
      }

      const updatedUser = await response.json();
      setUserData(updatedUser);
      setSuccessMessage("Voucher marked as used!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error using voucher:", error);
      setErrors({ general: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        {!editMode && (
          <button
            className="profile-edit-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {successMessage && (
        <div className="profile-success-message">{successMessage}</div>
      )}

      {errors.general && (
        <div className="profile-error-message">{errors.general}</div>
      )}

      <div className="profile-content">
        {editMode ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-form-group">
              <label htmlFor="name" className="profile-form-label">
                Name:
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`profile-form-input ${errors.name ? "error" : ""}`}
              />
              {errors.name && (
                <span className="profile-form-error">{errors.name}</span>
              )}
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Email:</label>
              <div className="profile-email-display">{userData.email}</div>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Role:</label>
              <div className="profile-role-display">{userData.role}</div>
            </div>

            {userData.role === "doctor" && (
              <div className="profile-form-group">
                <label className="profile-form-label">Specialization:</label>
                <div className="profile-specialization-display">
                  {userData.specialization}
                </div>
              </div>
            )}

            <h3 className="profile-password-title">Change Password</h3>

            <div className="profile-form-group">
              <label htmlFor="currentPassword" className="profile-form-label">
                Current Password:
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`profile-form-input ${
                  errors.currentPassword ? "error" : ""
                }`}
              />
              {errors.currentPassword && (
                <span className="profile-form-error">
                  {errors.currentPassword}
                </span>
              )}
            </div>

            <div className="profile-form-group">
              <label htmlFor="newPassword" className="profile-form-label">
                New Password:
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`profile-form-input ${
                  errors.newPassword ? "error" : ""
                }`}
              />
              {errors.newPassword && (
                <span className="profile-form-error">{errors.newPassword}</span>
              )}
            </div>

            <div className="profile-form-group">
              <label htmlFor="confirmPassword" className="profile-form-label">
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`profile-form-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
              />
              {errors.confirmPassword && (
                <span className="profile-form-error">
                  {errors.confirmPassword}
                </span>
              )}
            </div>

            <div className="profile-form-buttons">
              <button type="submit" className="profile-save-btn">
                Save Changes
              </button>
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={() => {
                  setEditMode(false);
                  setErrors({});
                  // Reset form data to original user data
                  setFormData({
                    name: userData.name,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-info">
            <div className="profile-info-group">
              <span className="profile-info-label">Name:</span>
              <span className="profile-info-value">{userData.name}</span>
            </div>

            <div className="profile-info-group">
              <span className="profile-info-label">Email:</span>
              <span className="profile-info-value">{userData.email}</span>
            </div>

            <div className="profile-info-group">
              <span className="profile-info-label">Role:</span>
              <span className="profile-info-value">{userData.role}</span>
            </div>

            {userData.role === "doctor" && (
              <div className="profile-info-group">
                <span className="profile-info-label">Specialization:</span>
                <span className="profile-info-value">
                  {userData.specialization || "Not specified"}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="profile-vouchers-section">
          <h2 className="profile-vouchers-title">My Vouchers</h2>

          {userData.voucher_assigned?.length === 0 ? (
            <p className="profile-no-vouchers">No vouchers assigned</p>
          ) : (
            <div className="profile-vouchers-list">
              {userData.voucher_assigned?.map((voucher) => (
                <div
                  key={voucher.voucherId}
                  className={`profile-voucher-card ${
                    voucher.used ? "used" : ""
                  }`}
                >
                  <div className="profile-voucher-header">
                    <h3 className="profile-voucher-name">
                      {voucher.voucherName}
                    </h3>
                    <span className="profile-voucher-status">
                      {voucher.used ? "Used" : "Active"}
                    </span>
                  </div>
                  <p className="profile-voucher-description">
                    {voucher.description}
                  </p>
                  <p className="profile-voucher-assigned">
                    Assigned on:{" "}
                    {new Date(voucher.assignedAt).toLocaleDateString()}
                  </p>

                  {!voucher.used && (
                    <button
                      className="profile-voucher-use-btn"
                      onClick={() => handleUseVoucher(voucher.voucherId)}
                    >
                      Use Voucher
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
