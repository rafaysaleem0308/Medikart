//This code is a React component for a contact support page that allows users to select a help topic, fill out a form, and submit it via email using EmailJS. It includes validation, error handling, and a modal for the form submission.
// It also provides options for contacting support via phone, email, or in-person visit.
//Operations:
// 1. Displays a list of help topics with icons and descriptions
// 2. Opens a modal with a form when a help topic is selected
// 3. Validates form inputs (name, email, message)
// 4. Submits the form data to EmailJS/
// 5. Displays success or error messages based on the submission result
// 6. Provides contact options for phone, email, and physical address
// 7. Uses Bootstrap for styling and layout
// 8. Handles loading state and API responses
// 9. Uses React hooks for state management and side effects
// 10. Includes responsive design for mobile and desktop views
// 11. Uses icons from react-bootstrap-icons for visual representation
// 12. Implements a modal for the contact form with a close button
// 13. Provides a user-friendly interface for support requests
// 14. Ensures accessibility with proper labels and error messages
// 15. Cleans up state and form values after successful submission
// 16. Uses client-side routing with React Router for navigation
// 17. Includes a hero banner section with a main title and subtitle

"use client";

import { useState } from "react";
import "../styles/Contact.css";
import emailjs from "@emailjs/browser";

import {
  TelephoneFill,
  EnvelopeFill,
  GeoAltFill,
  QuestionCircleFill,
  Prescription,
  Truck,
  BoxSeam,
  CreditCard,
} from "react-bootstrap-icons";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

const ContactSupportPage = () => {
  const [selectedHelpTopic, setSelectedHelpTopic] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const supportTopics = [
    {
      id: "general",
      title: "Help Center",
      icon: <QuestionCircleFill size={24} />,
      description: "Get answers to common questions",
    },
    {
      id: "prescription",
      title: "Prescription Help",
      icon: <Prescription size={24} />,
      description: "Questions about medications",
    },
    {
      id: "delivery",
      title: "Delivery Support",
      icon: <Truck size={24} />,
      description: "Track or inquire about deliveries",
    },
    {
      id: "products",
      title: "Product Questions",
      icon: <BoxSeam size={24} />,
      description: "Information about our products",
    },
    {
      id: "billing",
      title: "Billing Support",
      icon: <CreditCard size={24} />,
      description: "Payment and invoice questions",
    },
  ];

  const validateForm = () => {
    const errors = {};
    if (!formValues.name.trim()) errors.name = "Name is required";
    if (!formValues.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formValues.email))
      errors.email = "Please enter a valid email";
    if (!formValues.message.trim()) errors.message = "Message is required";
    else if (formValues.message.trim().length < 10)
      errors.message = "Message must be at least 10 characters";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
    if (validationErrors[id])
      setValidationErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await emailjs.send(
        "service_u6a0sor",
        "template_kltucln",
        {
          from_name: formValues.name,
          from_email: formValues.email,
          from_phone: formValues.phone,
          message: formValues.message,
          subject: selectedHelpTopic || "General",
        },
        "ZFyckz8R4l4Kt72eR"
      );

      setApiResponse({
        success: true,
        message:
          "Your message was sent successfully. We'll get back to you soon!",
      });

      setFormValues({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        setSelectedHelpTopic(null);
        setApiResponse(null);
      }, 3000);
    } catch (err) {
      console.error("Email sending error:", err);
      setApiResponse({
        success: false,
        message:
          "Something went wrong while sending your message. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHelpModal = (id) => {
    setSelectedHelpTopic(id);
    setApiResponse(null);
    setValidationErrors({});
  };

  const closeModal = () => {
    setSelectedHelpTopic(null);
    setApiResponse(null);
  };

  return (
    <div className="support-page-container">
      <section className="hero-banner-section">
        <h1 className="hero-main-title">How can we help you today?</h1>
        <p className="hero-subtitle">
          Our team is ready to assist with any questions about our pharmacy
          services
        </p>
      </section>

      <h2 className="support-section-title">Support Center</h2>

      <div className="help-topics-grid">
        {supportTopics.map((topic) => (
          <div
            key={topic.id}
            className="topic-card-item"
            onClick={() => openHelpModal(topic.id)}
          >
            <div className="topic-icon-wrapper">{topic.icon}</div>
            <h3 className="topic-card-title">{topic.title}</h3>
            <p className="topic-card-description">{topic.description}</p>
            <button className="topic-action-button">Get Help</button>
          </div>
        ))}
      </div>

      <div className="contact-options-grid">
        <div className="contact-option-card">
          <TelephoneFill className="contact-option-icon" />
          <h3 className="contact-option-title">Call Us</h3>
          <p className="contact-option-info">24/7 Pharmacy Support</p>
          <a className="contact-option-link" href="tel:+18005551234">
            +1 (800) 555-1234
          </a>
        </div>

        <div className="contact-option-card">
          <EnvelopeFill className="contact-option-icon" />
          <h3 className="contact-option-title">Email Us</h3>
          <p className="contact-option-info">
            Typically responds within 1 business day
          </p>
          <a className="contact-option-link" href="mailto:support@pharmacy.com">
            support@medikart.com
          </a>
        </div>

        <div className="contact-option-card">
          <GeoAltFill className="contact-option-icon" />
          <h3 className="contact-option-title">Visit Us</h3>
          <p className="contact-option-info">
            123 Health St, Medical City, MC 12345
          </p>
          <a
            className="contact-option-link"
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Map
          </a>
        </div>
      </div>

      <Modal
        show={!!selectedHelpTopic}
        onHide={closeModal}
        centered
        size="lg"
        backdrop="static"
        className="support-modal-overlay"
        fullscreen="md-down"
        scrollable
      >
        <div className="support-modal-container">
          <Modal.Header closeButton className="support-modal-header">
            <Modal.Title className="support-modal-title">
              {supportTopics.find((t) => t.id === selectedHelpTopic)?.title ||
                "Help Request"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="support-modal-body">
            {apiResponse ? (
              <div
                className={`form-response-message ${
                  apiResponse.success
                    ? "form-success-message"
                    : "form-error-response"
                }`}
              >
                {apiResponse.message}
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} noValidate>
                <div className="form-input-group">
                  <label htmlFor="name" className="form-input-label">
                    Full Name *
                  </label>
                  <input
                    id="name"
                    className={`form-input-field ${
                      validationErrors.name ? "form-field-error" : ""
                    }`}
                    type="text"
                    value={formValues.name}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.name && (
                    <span className="form-error-message">
                      {validationErrors.name}
                    </span>
                  )}
                </div>

                <div className="form-input-group">
                  <label htmlFor="email" className="form-input-label">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    className={`form-input-field ${
                      validationErrors.email ? "form-field-error" : ""
                    }`}
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    required
                  />
                  {validationErrors.email && (
                    <span className="form-error-message">
                      {validationErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-input-group">
                  <label htmlFor="phone" className="form-input-label">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    className="form-input-field"
                    type="tel"
                    value={formValues.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="message" className="form-input-label">
                    How can we help? *
                  </label>
                  <textarea
                    id="message"
                    className={`form-textarea-field ${
                      validationErrors.message ? "form-field-error" : ""
                    }`}
                    value={formValues.message}
                    onChange={handleInputChange}
                    rows={4}
                    required
                  />
                  {validationErrors.message && (
                    <span className="form-error-message">
                      {validationErrors.message}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="form-submit-button w-100"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Sending...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            )}
          </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

export default ContactSupportPage;
