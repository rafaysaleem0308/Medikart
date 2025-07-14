"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import p9video from "../images/p9.mp4";
import "../styles/log_module.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store all user data consistently
      // In your login function
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("user", JSON.stringify(data.user)); // Complete user object
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userId", data.user._id);
      localStorage.setItem(
        "userName",
        data.user.name || data.user.email.split("@")[0]
      );

      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        switch (data.user?.role) {
          case "admin":
            navigate("/admin");
            break;
          case "doctor":
            navigate("/ChatWindow");
            break;
          default:
            navigate("/Home");
        }
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      {/*video}*/}
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src={p9video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div>
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your Medikart account</p>
          </div>

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? "error" : ""}
                  disabled={isLoading}
                />
                <i className="bi bi-envelope-fill input-icon"></i>
              </div>
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? "error" : ""}
                  disabled={isLoading}
                />
                <i className="bi bi-lock-fill input-icon"></i>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="bi bi-arrow-clockwise spinning"></i>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  Sign In
                </>
              )}
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </form>

          <div className="social-login">
            <p className="divider_text">
              <span>Or sign in with</span>
            </p>
            <div className="social-icons">
              <button
                type="button"
                className="social-button google"
                disabled={isLoading}
              >
                <i className="bi bi-google"></i>
              </button>
              <button
                type="button"
                className="social-button facebook"
                disabled={isLoading}
              >
                <i className="bi bi-facebook"></i>
              </button>
              <button
                type="button"
                className="social-button apple"
                disabled={isLoading}
              >
                <i className="bi bi-apple"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal-content">
            <div className="success-modal-icon">
              <i className="bi bi-check-circle"></i>
            </div>
            <h3 className="success-modal-title">Login Successful!</h3>
            <p className="success-modal-message">
              You will be redirected shortly...
            </p>
            <div className="success-modal-progress">
              <div className="success-modal-progress-bar"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
