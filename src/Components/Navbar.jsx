import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar({ title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInitial, setUserInitial] = useState("");
  const [cartCount, setCartCount] = useState(0);

  // Check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const authStatus =
      !!token && localStorage.getItem("isAuthenticated") === "true";
    const storedUserEmail = localStorage.getItem("userEmail");

    // Debugging logs
    console.log("Auth check - Token:", token);
    console.log("Auth check - Status:", authStatus);

    setIsLoggedIn(authStatus);

    if (authStatus && storedUserEmail) {
      setUserInitial(storedUserEmail.charAt(0).toUpperCase());
    } else {
      setUserInitial("");
    }
  };

  // Update cart count from localStorage
  const updateCartCount = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const count = parsedCart.reduce(
          (total, item) => total + (item.quantity || 1),
          0
        );
        setCartCount(count);
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Initial check
    checkAuthStatus();
    updateCartCount();

    // Storage event handler
    const handleStorageChange = (e) => {
      console.log("Storage change detected:", e.key);

      if (e.key === "cart" || e.key === null) {
        updateCartCount();
      }

      // Check auth status if any auth-related keys change
      if (
        ["token", "isAuthenticated", "userEmail", "userName"].includes(e.key) ||
        e.key === null
      ) {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [location.pathname]); // React to route changes

  const handleLogout = async () => {
    try {
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      // Manually clear auth-related keys
      localStorage.removeItem("token");
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");

      // Immediately update auth state
      setIsLoggedIn(false);
      setUserInitial("");

      // Navigate to home and refresh component
      navigate("/", {
        replace: true,
        state: { forceRefresh: Date.now() },
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Brand with pill icon */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-capsule-pill me-2"></i>
          <span className="brand-text">{title}</span>
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Main navigation content */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Left side navigation links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {location.pathname !== "/" && (
              <li className="nav-item">
                <Link to="/" className="nav-link" aria-current="page">
                  <i className="bi bi-house-door me-1"></i> Home
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link to="/Products" className="nav-link">
                <i className="bi bi-shop me-1"></i> Products
              </Link>
            </li>

            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-grid me-1"></i> Support & Info
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/ChatWindow">
                    <i className="bi bi-chat-fill me-1"></i> ChatBox
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/Review">
                    <i className="bi bi-yelp me-1"></i> Review & Feedback
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item" to="/contact">
                    <i className="bi bi-telephone me-1"></i> Contact
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item">
              <Link to="/about" className="nav-link">
                <i className="bi bi-info-circle me-1"></i> About
              </Link>
            </li>

            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-grid me-1"></i> Categories
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/category/prescription">
                    <i className="bi bi-prescription me-2"></i> Prescription
                    Drugs
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/category/otc">
                    <i className="bi bi-capsule me-2"></i> OTC Medicines
                  </Link>
                </li>
              </ul>
            </li>
          </ul>

          {/* Right side icons */}
          <ul className="navbar-nav">
            {/* Cart icon with counter */}
            <li className="nav-item">
              <Link to="/Cart" className="nav-link position-relative">
                <i className="bi bi-cart3 fs-5"></i>
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {cartCount}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </Link>
            </li>

            {/* User profile dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {isLoggedIn ? (
                  <span className="user-initial-circle me-1">
                    {userInitial}
                  </span>
                ) : (
                  <i className="bi bi-person-circle fs-5"></i>
                )}
              </Link>
              <ul className="dropdown-menu dropdown-menu-end">
                {isLoggedIn ? (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i> My Profile
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/"
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link className="dropdown-item" to="/Log">
                        <i className="bi bi-door-open me-2"></i> Login
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/Signup">
                        <i className="bi bi-person-plus me-2"></i> Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
};

Navbar.defaultProps = {
  title: "Pharmacy App",
};
