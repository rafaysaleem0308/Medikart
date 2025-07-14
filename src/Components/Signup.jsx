"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import p9video from "../images/p9.mp4";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    specialization: "", // NEW
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const specializationsList = [
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "Neurology",
  ]; // <- List of 5 specializations

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "password") {
      calculatePasswordStrength(newValue);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    return "Strong";
  };
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "#dc3545";
    if (passwordStrength <= 4) return "#ffc107";
    return "#28a745";
  };

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Role
    if (!formData.role) {
      newErrors.role = "Please select a role";
    } else if (!["customer", "doctor", "admin"].includes(formData.role)) {
      newErrors.role = "Invalid role selected";
    }

    // Specialization required if doctor
    if (formData.role === "doctor" && !formData.specialization) {
      newErrors.specialization = "Please choose your specialization";
    }

    // Password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordErrors = [];
      if (formData.password.length < 8)
        passwordErrors.push("at least 8 characters");
      if (!/[A-Z]/.test(formData.password))
        passwordErrors.push("one uppercase letter");
      if (!/[a-z]/.test(formData.password))
        passwordErrors.push("one lowercase letter");
      if (!/[0-9]/.test(formData.password)) passwordErrors.push("one number");
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password))
        passwordErrors.push("one special character");

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must include ${passwordErrors.join(
          ", "
        )}`;
      }
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    // Terms
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   setIsLoading(true);

  //   try {
  //     const response = await fetch("/api/auth/signup", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         name: formData.name.trim(),
  //         email: formData.email,
  //         password: formData.password,
  //         role: formData.role,
  //         specialization:
  //           formData.role === "doctor" ? formData.specialization : undefined,
  //       }),
  //     });

  //     const contentType = response.headers.get("content-type");
  //     if (!contentType || !contentType.includes("application/json")) {
  //       const text = await response.text();
  //       throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
  //     }

  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error || "Registration failed");

  //     alert("Registration successful!");
  //     navigate("/Log");
  //   } catch (error) {
  //     setErrors({ general: error.message });
  //     console.error("Registration error:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare the user data object
      const userData = {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      // Only add specialization if role is doctor
      if (formData.role === "doctor") {
        userData.specialization = formData.specialization;
      }

      const response = await fetch("http://Localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Registration failed");
      }

      const data = await response.json();

      // Handle specific error cases
      if (!response.ok) {
        if (response.status === 400 && data.error.includes("Specialization")) {
          throw new Error("Please select your medical specialization");
        }
        throw new Error(data.error || "Registration failed");
      }

      // Success case
      alert("Registration successful! Please log in.");
      navigate("/Log");
    } catch (error) {
      // Handle different error types
      if (error.message.includes("Specialization")) {
        setErrors({ specialization: error.message });
      } else if (error.message.includes("Email already exists")) {
        setErrors({ email: error.message });
      } else {
        setErrors({
          general: error.message || "Registration failed. Please try again.",
        });
      }

      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    else setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <>
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src={p9video} type="video/mp4" />
        </video>
        <div className="video-overlay"></div>
      </div>

      <div className="signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h2>Create Your Account</h2>
            <p>Join Medikart today</p>
          </div>

          {errors.general && (
            <div className="error-message general-error">{errors.general}</div>
          )}

          <form className="signup-form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? "error" : ""}
                  disabled={isLoading}
                />
                <i className="bi bi-person-fill input-icon"></i>
              </div>
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <input
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

            {/* Role */}
            <div className="form-group">
              <label htmlFor="role">Account Type</label>
              <div className="input-with-icon">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={errors.role ? "error" : ""}
                  disabled={isLoading}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                </select>
                <i className="bi bi-person-badge-fill input-icon"></i>
              </div>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>

            {/* Specialization shown only if Doctor */}
            {formData.role === "doctor" && (
              <div className="form-group">
                <label htmlFor="specialization">Specialization</label>
                <div className="input-with-icon">
                  <select
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={errors.specialization ? "error" : ""}
                    disabled={isLoading}
                  >
                    <option value="">-- Select Specialization --</option>
                    {specializationsList.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                  <i className="bi bi-award-fill input-icon"></i>
                </div>
                {errors.specialization && (
                  <span className="error-text">{errors.specialization}</span>
                )}
              </div>
            )}

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className={errors.password ? "error" : ""}
                  disabled={isLoading}
                />
                <i className="bi bi-lock-fill input-icon"></i>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("password")}
                  disabled={isLoading}
                >
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                  ></i>
                </button>
              </div>

              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength / 6) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      }}
                    ></div>
                  </div>
                  <span
                    className="strength-text"
                    style={{ color: getPasswordStrengthColor() }}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? "error" : ""}
                  disabled={isLoading}
                />
                <i className="bi bi-lock-fill input-icon"></i>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirm")}
                  disabled={isLoading}
                >
                  <i
                    className={`bi ${
                      showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                    }`}
                  ></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Terms */}
            <div className="form-options">
              <label className="terms-agreement">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="terms-checkbox"
                  disabled={isLoading}
                />
                <span>
                  I agree to the <Link to="/Terms">Terms of Service</Link> and{" "}
                  <Link to="/Privacy">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <span className="error-text">{errors.agreeToTerms}</span>
              )}
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="bi bi-arrow-clockwise spinning"></i>Creating
                  Account...
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill"></i>Create Account
                </>
              )}
            </button>

            <div className="login-link">
              Already have an account? <Link to="/Log">Log in</Link>
            </div>
          </form>

          {/* Social signup */}
          <div className="social-signup">
            <p className="divider_text">
              <span>Or sign up with</span>
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
    </>
  );
}
