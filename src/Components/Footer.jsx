// Components/Footer.js
// This file is part of the Medikart project, which is a pharmacy management system.
// The Footer component provides a footer section for the application, including links and contact information.
// It is designed to be reusable and customizable with a title prop.
// The component uses Bootstrap for styling and layout, and it includes social media icons.
// The component is structured to be responsive and user-friendly, providing essential information and links for users.
// The component is part of a larger pharmacy management system and is intended for use by all users of the application.

import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // Using shared CSS file
import PropTypes from "prop-types";

export default function Footer({ title }) {
  return (
    <div>
      <footer className="footer-container">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-3">
              <h5 className="text-uppercase">
                <i className="bi bi-capsule-pill me-2"></i> {title}
              </h5>
              <p>
                Your trusted online pharmacy for quality medicines and
                healthcare products.
              </p>
              <div className="social-icons">
                <a href="/" className="text-dark me-2">
                  <i className="bi bi-facebook fs-5"></i>
                </a>
                <a href="/" className="text-dark me-2">
                  <i className="bi bi-twitter fs-5"></i>
                </a>
                <a href="/" className="text-dark me-2">
                  <i className="bi bi-instagram fs-5"></i>
                </a>
                <a href="/" className="text-dark">
                  <i className="bi bi-linkedin fs-5"></i>
                </a>
              </div>
            </div>

            <div className="col-md-2 mb-3">
              <h5>Quick Links</h5>
              <ul className="list-unstyled">
                <li>
                  <Link to="/" className="text-dark">
                    <i className="bi bi-chevron-right me-1"></i> Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-dark">
                    <i className="bi bi-chevron-right me-1"></i> About Us
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-dark">
                    <i className="bi bi-chevron-right me-1"></i> Products
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-dark">
                    <i className="bi bi-chevron-right me-1"></i> Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-md-3 mb-3">
              <h5>Customer Service</h5>
              <ul className="list-unstyled">
                <li>
                  <Link to="/faq" className="text-dark">
                    <i className="bi bi-question-circle me-1"></i> FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-dark">
                    <i className="bi bi-truck me-1"></i> Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-dark">
                    <i className="bi bi-arrow-left-right me-1"></i> Return
                    Policy
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-dark">
                    <i className="bi bi-shield-lock me-1"></i> Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-md-3 mb-3">
              <h5>Contact Us</h5>
              <ul className="list-unstyled">
                <li>
                  <i className="bi bi-geo-alt me-2"></i> 123 Medical St, Health
                  City
                </li>
                <li>
                  <i className="bi bi-telephone me-2"></i> +1 (123) 456-7890
                </li>
                <li>
                  <i className="bi bi-envelope me-2"></i> info@medikart.com
                </li>
                <li>
                  <i className="bi bi-clock me-2"></i> Mon-Sun: 8AM-10PM
                </li>
              </ul>
            </div>
          </div>

          <hr className="my-3" />
          <div className="text-center">
            <p className="mb-1">
              © {new Date().getFullYear()} {title}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

Footer.propTypes = {
  title: PropTypes.string,
};

Footer.defaultProps = {
  title: "MediKart",
};
