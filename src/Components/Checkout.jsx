// This file is part of a React application for an e-commerce checkout process.
// It handles the checkout flow, including shipping and payment information, order placement, and notifications.
// It uses React hooks for state management and side effects, and integrates with EmailJS for sending order confirmation emails.
// It also includes stock availability checks and handles different payment methods like credit card, PayPal, and cash on delivery (COD).
//Operations:
// 1. Manage form steps for shipping and payment information
// 2. Validate form inputs for shipping and payment
// 3. Check stock availability before placing an order
// 4. Place order and send confirmation email using EmailJS
// 5. Show success modal after order placement
// 6. Clear cart and navigate to home page after order placement
// 7. Handle notifications for success and error messages
// 8. Format card number and expiration date inputs
// 9. Load cart data from localStorage and calculate totals
// 10. Handle step navigation and form input changes
// 11. Render order items and handle empty cart state
// 12. Use React Router for navigation and state management
// 13. Use FontAwesome icons for visual representation
// 14. Use UUID for generating unique session IDs
// 15. Use CSS for styling the checkout page
// 16. Use useCallback for performance optimization in loading cart data
// 17. Use useEffect for side effects like loading cart and initializing session ID
// 18. Use useState for managing component state/
// 19. Use useLocation and useNavigate from React Router for navigation and location handling
// 20. Use try-catch for error handling in async operations

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from "uuid";
import emailjs from "@emailjs/browser";
import {
  faCheckCircle,
  faQuestionCircle,
  faLock,
  faCreditCard,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCcVisa,
  faCcMastercard,
  faCcAmex,
  faCcDiscover,
  faCcPaypal,
  faPaypal,
} from "@fortawesome/free-brands-svg-icons";
import "../styles/Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Form steps state
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionId] = useState(localStorage.getItem("sessionId") || uuidv4());

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    shipping: {},
    payment: {},
  });

  // Form data state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "PK",
    cardName: "",
    cardNumber: "",
    expDate: "",
    cvv: "",
  });

  // Cart state
  const [cartState, setCartState] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    discount: location.state?.discount || 0,
    discountCode: location.state?.discountCode || "",
    promoApplied: location.state?.promoApplied || false,
  });

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Load cart from localStorage
  const loadCart = useCallback(() => {
    const savedCart = localStorage.getItem("cart");
    const savedSummary = JSON.parse(localStorage.getItem("cartSummary")) || {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      discountCode: "",
      promoApplied: false,
      total: 0,
    };

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const items = parsedCart.map((item) => ({
          id: item.id,
          title: item.title,
          price:
            typeof item.price === "string"
              ? parseFloat(item.price.replace("$", ""))
              : item.price,
          image: item.image,
          category: item.category || "game",
          quantity: item.quantity || 1,
        }));

        // Use saved summary or calculate new one
        const subtotal =
          savedSummary.subtotal ||
          items.reduce((total, item) => total + item.price * item.quantity, 0);
        const shipping = savedSummary.shipping || (subtotal > 100 ? 0 : 10);
        const tax = savedSummary.tax || subtotal * 0.1;
        const discount = savedSummary.discount || cartState.discount;
        const total = subtotal + shipping + tax - discount;

        setCartState((prev) => ({
          ...prev,
          items,
          subtotal,
          shipping,
          tax,
          discount,
          total,
          discountCode: savedSummary.discountCode || prev.discountCode,
          promoApplied: savedSummary.promoApplied || prev.promoApplied,
        }));
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCartState((prev) => ({ ...prev, items: [] }));
      }
    } else {
      setCartState((prev) => ({ ...prev, items: [] }));
    }
  }, [cartState.discount]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Initialize session ID in useEffect
  useEffect(() => {
    if (!localStorage.getItem("sessionId")) {
      localStorage.setItem("sessionId", sessionId);
    }
  }, [sessionId]);

  // Check stock availability before placing order
  const checkStock = async () => {
    try {
      const response = await fetch("/api/products/check-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartState.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // Show error message with out of stock items
        const outOfStockMessage = data.unavailableItems
          .map((item) => `${item.name}: ${item.message}`)
          .join("\n");

        showNotification(
          `Some items are out of stock:\n${outOfStockMessage}`,
          "error"
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking stock:", error);
      showNotification("Error checking stock availability", "error");
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors.shipping[name]) {
      setFormErrors((prev) => ({
        ...prev,
        shipping: { ...prev.shipping, [name]: "" },
      }));
    }

    if (formErrors.payment[name]) {
      setFormErrors((prev) => ({
        ...prev,
        payment: { ...prev.payment, [name]: "" },
      }));
    }
  };

  // Format card number with spaces
  const formatCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    let formattedValue = "";

    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += " ";
      formattedValue += value[i];
    }

    setFormData((prev) => ({ ...prev, cardNumber: formattedValue }));
    if (formErrors.payment.cardNumber) {
      setFormErrors((prev) => ({
        ...prev,
        payment: { ...prev.payment, cardNumber: "" },
      }));
    }
  };

  // Format expiration date (MM/YY)
  const formatExpDate = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2, 4);
    setFormData((prev) => ({ ...prev, expDate: value }));
    if (formErrors.payment.expDate) {
      setFormErrors((prev) => ({
        ...prev,
        payment: { ...prev.payment, expDate: "" },
      }));
    }
  };

  // Validation functions
  const validateShipping = () => {
    const errors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";

    if (!formData.zip.trim()) {
      errors.zip = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      errors.zip = "Please enter a valid ZIP code";
    }

    if (!formData.country) errors.country = "Country is required";

    setFormErrors((prev) => ({ ...prev, shipping: errors }));
    return isValid && Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    if (paymentMethod === "paypal" || paymentMethod === "cod") return true;

    const errors = {};
    let isValid = true;

    if (!formData.cardName.trim()) errors.cardName = "Name on card is required";

    if (!formData.cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(formData.cardNumber)) {
      errors.cardNumber = "Please enter a valid card number";
    }

    if (!formData.expDate.trim()) {
      errors.expDate = "Expiration date is required";
    } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expDate)) {
      errors.expDate = "Please enter a valid expiration date (MM/YY)";
    }

    if (!formData.cvv.trim()) {
      errors.cvv = "CVV is required";
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = "Please enter a valid CVV";
    }

    setFormErrors((prev) => ({ ...prev, payment: errors }));
    return isValid && Object.keys(errors).length === 0;
  };

  // Handle step navigation
  const goToStep = (stepNumber) => {
    if (stepNumber > currentStep) {
      if (currentStep === 1 && !validateShipping()) {
        showNotification("Please fix shipping information errors", "error");
        return;
      }
      if (currentStep === 2 && !validatePayment()) {
        showNotification("Please fix payment information errors", "error");
        return;
      }
    }
    setCurrentStep(stepNumber);
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type }), 3000);
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("cartSummary");
    setCartState({
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      discount: 0,
      discountCode: "",
      promoApplied: false,
    });
  };

  const placeOrder = async () => {
    try {
      // First check stock availability
      const transactionId = `TXN-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;
      console.log("Transaction ID:", transactionId);
      const isStockAvailable = await checkStock();
      if (!isStockAvailable) return;

      // Decrement stock quantities
      const stockUpdateResponse = await fetch("/api/products/update-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cartState.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const stockUpdateData = await stockUpdateResponse.json();
      if (!stockUpdateData.success) {
        throw new Error("Failed to update stock");
      }

      const orderData = {
        items: cartState.items.map((item) => ({
          productId: item.id, // Add this line to include productId
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          category: item.category || "game",
          transactionId: transactionId,
        })),
        shippingInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        paymentInfo: {
          method: paymentMethod,
          ...(paymentMethod === "creditCard" && {
            cardName: formData.cardName,
            cardLastFour: formData.cardNumber.slice(-4),
          }),
        },
        subtotal: cartState.subtotal,
        shipping: cartState.shipping,
        tax: cartState.tax,
        discount: cartState.discount,
        discountCode: cartState.discountCode,
        total:
          paymentMethod === "cod" ? cartState.total * 1.02 : cartState.total,
        sessionId: sessionId,
      };
      // Send order to backend
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      // Store order ID for reference
      localStorage.setItem("lastOrderId", data.orderId);
      // Prepare shipping info HTML
      const shippingInfo = `
      <div style="background-color: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; font-family: Arial, sans-serif; line-height: 1.6;">
        <h3 style="margin-top: 0; color: #343a40;">Shipping Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 100px; padding: 5px 0; vertical-align: top; font-weight: bold; color: #495057;">Name:</td>
            <td style="padding: 5px 0;">${formData.fullName}</td>
          </tr>
          <tr>
            <td style="width: 100px; padding: 5px 0; vertical-align: top; font-weight: bold; color: #495057;">Address:</td>
            <td style="padding: 5px 0;">
              ${formData.address}<br/>
              ${formData.city}, ${formData.state} - ${formData.zip}<br/>
              ${formData.country}
            </td>
          </tr>
          <tr>
            <td style="width: 100px; padding: 5px 0; vertical-align: top; font-weight: bold; color: #495057;">Email:</td>
            <td style="padding: 5px 0;">${formData.email}</td>
          </tr>
          <tr>
            <td style="width: 100px; padding: 5px 0; vertical-align: top; font-weight: bold; color: #495057;">Phone:</td>
            <td style="padding: 5px 0;">${formData.phone || "Not provided"}</td>
          </tr>
        </table>
      </div>
      `;

      // Prepare order items HTML table
      const orderItemsHTML = `
        <table class="order-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartState.items
              .map(
                (item) => `
              <tr>
                <td>${item.title}</td>
                <td>${item.quantity}</td>
                <td>Rs ${item.price.toFixed(2)}</td>
                <td>Rs ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `;

      // Calculate totals
      const total =
        paymentMethod === "cod"
          ? (cartState.total * 1.02).toFixed(2)
          : cartState.total.toFixed(2);

      // EmailJS parameters
      const emailParams = {
        user_name: formData.fullName,
        to_email: formData.email,
        shipping_info: shippingInfo,
        order_summary: orderItemsHTML,
        order_total: total,
        from_name: "Medikart",
        reply_to: "rafey.khiljiladoo@gmail.com",
        subject: `Order Confirmation - ${formData.fullName}`,
        transaction_id: transactionId, // ✅ Must match the template variable
        order_id: data.orderId, // ✅ Add this line
        order_date: new Date().toLocaleDateString(), // Optional: for {{order_date}}
        payment_method: paymentMethod,
        payment_status:
          paymentMethod === "cod" ? "Pending (Cash on Delivery)" : "Paid",
      };

      // Send email via EmailJS
      await emailjs.send(
        "service_u6a0sor",
        "template_j1x7u1j",
        emailParams,
        "ZFyckz8R4l4Kt72eR"
      );

      clearCart();

      // Handle success
      if (paymentMethod === "cod") {
        setShowSuccessModal(true);
      } else {
        setOrderPlaced(true);
        showNotification("Order placed successfully!", "success");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      showNotification("Failed to place order. Please try again.", "error");
    }
  };

  // Close success modal
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    clearCart();
    navigate("/");
  };

  // Render functions
  const renderOrderItems = () => {
    if (cartState.items.length === 0) {
      return (
        <div className="emptyCartMessage">
          <p>Your cart is empty</p>
          <Link to="/" className="btn btnPrimary">
            Continue Shopping
          </Link>
        </div>
      );
    }

    return cartState.items.map((item, index) => (
      <div className="orderItem" key={index}>
        <div className="itemDetails">
          <div className="itemTitle">{item.title}</div>
          <div className="itemPrice">Rs {item.price.toFixed(2)}</div>
          <div className="itemQuantity">Qty: {item.quantity}</div>
        </div>
      </div>
    ));
  };

  const renderShippingReview = () => (
    <>
      <p>
        <strong>{formData.fullName}</strong>
      </p>
      <p>{formData.address}</p>
      <p>
        {formData.city}, {formData.state} {formData.zip}
      </p>
      <p>{formData.country}</p>
      <p>Email: {formData.email}</p>
      {formData.phone && <p>Phone: {formData.phone}</p>}
    </>
  );

  const renderPaymentReview = () => {
    if (paymentMethod === "creditCard") {
      return (
        <>
          <p>
            <strong>Credit Card</strong>
          </p>
          <p>{formData.cardName}</p>
          <p>Card ending in {formData.cardNumber.slice(-4)}</p>
        </>
      );
    } else if (paymentMethod === "paypal") {
      return (
        <>
          <p>
            <strong>PayPal</strong>
          </p>
          <p>You will be redirected to PayPal to complete your purchase.</p>
        </>
      );
    } else if (paymentMethod === "cod") {
      return (
        <>
          <p>
            <strong>Cash on Delivery</strong>
          </p>
          <p>Pay with cash when your order is delivered.</p>
        </>
      );
    }
    return null;
  };

  if (orderPlaced) {
    return (
      <main className="checkoutMainContainer">
        <div className="checkoutContentContainer">
          <div className="orderSuccessMessage">
            <FontAwesomeIcon icon={faCheckCircle} size="2x" />
            <h2>Thank you! Your order has been placed.</h2>
            <Link to="/" className="primaryButton">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkoutMainContainer">
      <div className="checkoutContentContainer">
        <div className="checkoutheader">
          <h1>Checkout</h1>
          <p>
            <Link to="/">Home</Link> / <Link to="/Cart">Cart</Link> /{" "}
            <span>Checkout</span>
          </p>
        </div>

        <div className="checkoutGrid">
          <div className="checkoutFormContainer">
            <div className="checkoutSteps">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`step ${currentStep >= step ? "activeStep" : ""}`}
                >
                  <div className="stepNumber">{step}</div>
                  <div className="stepTitle">
                    {step === 1
                      ? "Shipping"
                      : step === 2
                      ? "Payment"
                      : "Review"}
                  </div>
                </div>
              ))}
            </div>

            <form className="checkoutForm" onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: Shipping Information */}
              <div
                className={`formStep ${
                  currentStep === 1 ? "activeFormStep" : ""
                }`}
              >
                <h2>Shipping Information</h2>
                {[
                  {
                    id: "fullName",
                    label: "Full Name",
                    type: "text",
                    placeholder: "John Doe",
                  },
                  {
                    id: "email",
                    label: "Email Address",
                    type: "email",
                    placeholder: "john@example.com",
                  },
                  {
                    id: "phone",
                    label: "Phone Number",
                    type: "tel",
                    placeholder: "0333-XXX-XXX",
                  },
                  {
                    id: "address",
                    label: "Street Address",
                    type: "text",
                    placeholder: "123 Main St",
                  },
                  {
                    id: "city",
                    label: "City",
                    type: "text",
                    placeholder: "Lahore",
                  },
                  { id: "state", label: "State", type: "text" },
                  {
                    id: "zip",
                    label: "ZIP Code",
                    type: "text",
                    placeholder: "65100",
                  },
                ].map((field) => (
                  <div key={field.id} className="formGroup">
                    <label htmlFor={field.id}>{field.label}</label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      placeholder={field.placeholder}
                      value={formData[field.id]}
                      onChange={handleInputChange}
                      className={
                        formErrors.shipping[field.id] ? "errorInput" : ""
                      }
                    />
                    {formErrors.shipping[field.id] && (
                      <span className="errorMessage">
                        {formErrors.shipping[field.id]}
                      </span>
                    )}
                  </div>
                ))}

                <div className="formGroup">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={formErrors.shipping.country ? "errorInput" : ""}
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="IN">India</option>
                    <option value="PK">Pakistan</option>
                  </select>
                  {formErrors.shipping.country && (
                    <span className="errorMessage">
                      {formErrors.shipping.country}
                    </span>
                  )}
                </div>

                <div className="formActions">
                  <button
                    type="button"
                    className="btn btnPrimary"
                    onClick={() => goToStep(2)}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>

              {/* Step 2: Payment Information */}
              <div
                className={`formStep ${
                  currentStep === 2 ? "activeFormStep" : ""
                }`}
              >
                <h2>Payment Information</h2>
                <div className="paymentOptions">
                  <div className="paymentOption">
                    <input
                      type="radio"
                      id="creditCard"
                      name="paymentMethod"
                      value="creditCard"
                      checked={paymentMethod === "creditCard"}
                      onChange={() => setPaymentMethod("creditCard")}
                    />
                    <label htmlFor="creditCard">Credit Card</label>
                  </div>
                  <div className="paymentOption">
                    <input
                      type="radio"
                      id="paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={paymentMethod === "paypal"}
                      onChange={() => setPaymentMethod("paypal")}
                    />
                    <label htmlFor="paypal">PayPal</label>
                  </div>
                  <div className="paymentOption">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <label htmlFor="cod">Cash on Delivery</label>
                  </div>
                </div>

                {paymentMethod === "creditCard" && (
                  <div id="creditCardForm">
                    <div className="formGroup">
                      <label htmlFor="cardName">Name on Card</label>
                      <input
                        type="text"
                        id="cardName"
                        name="cardName"
                        placeholder="John Doe"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className={
                          formErrors.payment.cardName ? "errorInput" : ""
                        }
                      />
                      {formErrors.payment.cardName && (
                        <span className="errorMessage">
                          {formErrors.payment.cardName}
                        </span>
                      )}
                    </div>

                    <div className="formGroup">
                      <label htmlFor="cardNumber">Card Number</label>
                      <div className="cardInputWrapper">
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={formatCardNumber}
                          className={
                            formErrors.payment.cardNumber ? "errorInput" : ""
                          }
                        />
                        <div className="cardIcons">
                          <FontAwesomeIcon icon={faCcVisa} />
                          <FontAwesomeIcon icon={faCcMastercard} />
                          <FontAwesomeIcon icon={faCcAmex} />
                          <FontAwesomeIcon icon={faCcDiscover} />
                        </div>
                      </div>
                      {formErrors.payment.cardNumber && (
                        <span className="errorMessage">
                          {formErrors.payment.cardNumber}
                        </span>
                      )}
                    </div>

                    <div className="formRow">
                      <div className="formGroup">
                        <label htmlFor="expDate">Expiration Date</label>
                        <input
                          type="text"
                          id="expDate"
                          name="expDate"
                          placeholder="MM/YY"
                          value={formData.expDate}
                          onChange={formatExpDate}
                          className={
                            formErrors.payment.expDate ? "errorInput" : ""
                          }
                        />
                        {formErrors.payment.expDate && (
                          <span className="errorMessage">
                            {formErrors.payment.expDate}
                          </span>
                        )}
                      </div>

                      <div className="formGroup">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className={formErrors.payment.cvv ? "errorInput" : ""}
                        />
                        <div className="cvvInfo">
                          <FontAwesomeIcon icon={faQuestionCircle} />
                          <span className="tooltip">
                            3-digit code on back of card
                          </span>
                        </div>
                        {formErrors.payment.cvv && (
                          <span className="errorMessage">
                            {formErrors.payment.cvv}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "paypal" && (
                  <div id="paypalForm">
                    <p className="paypalInfo">
                      <FontAwesomeIcon icon={faPaypal} /> You will be redirected
                      to PayPal to complete your purchase securely.
                    </p>
                  </div>
                )}

                {paymentMethod === "cod" && (
                  <div id="codForm">
                    <p className="codInfo">
                      <FontAwesomeIcon icon={faMoneyBillWave} /> Pay with cash
                      when your order is delivered. An additional 2% charge may
                      apply for COD orders.
                    </p>
                  </div>
                )}

                <div className="formActions">
                  <button
                    type="button"
                    className="btn btnOutline"
                    onClick={() => goToStep(1)}
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="button"
                    className="btn btnPrimary"
                    onClick={() => goToStep(3)}
                  >
                    Review Order
                  </button>
                </div>
              </div>

              {/* Step 3: Order Review */}
              <div
                className={`formStep ${
                  currentStep === 3 ? "activeFormStep" : ""
                }`}
              >
                <h2>Review Your Order</h2>

                <div className="reviewSection">
                  <h3>Shipping Information</h3>
                  <div className="reviewDetails">{renderShippingReview()}</div>
                </div>

                <div className="reviewSection">
                  <h3>Payment Method</h3>
                  <div className="reviewDetails">{renderPaymentReview()}</div>
                </div>

                <div className="reviewSection">
                  <h3>Order Items</h3>
                  <div className="reviewDetails">
                    <div className="reviewItems">
                      {cartState.items.map((item, index) => (
                        <div className="orderItem" key={index}>
                          <div className="itemDetails">
                            <div className="itemTitle">{item.title}</div>
                            <div className="itemPrice">
                              Rs {item.price.toFixed(2)}
                            </div>
                            <div className="itemQuantity">
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="formActions">
                  <button
                    type="button"
                    className="btn btnOutline"
                    onClick={() => goToStep(2)}
                  >
                    Back to Payment
                  </button>
                  <button
                    type="button"
                    className="btn btnPrimary"
                    onClick={placeOrder}
                  >
                    {paymentMethod === "cod" ? (
                      <>
                        <FontAwesomeIcon icon={faMoneyBillWave} /> Confirm Order
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCreditCard} /> Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="orderSummary">
            <h2>Order Summary</h2>
            <div className="orderItems">{renderOrderItems()}</div>
            <div className="summaryDivider"></div>
            <div className="summaryRow">
              <span>Subtotal</span>
              <span>Rs {cartState.subtotal.toFixed(2)}</span>
            </div>
            <div className="summaryRow">
              <span>Shipping</span>
              <span>
                {cartState.shipping === 0
                  ? "FREE"
                  : `Rs ${cartState.shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="summaryRow">
              <span>Tax (10%)</span>
              <span>Rs {cartState.tax.toFixed(2)}</span>
            </div>
            {cartState.promoApplied && (
              <div className="discountRow">
                <span>Discount ({cartState.discountCode})</span>
                <span>-Rs {cartState.discount.toFixed(2)}</span>
              </div>
            )}
            {paymentMethod === "cod" && (
              <div className="summaryRow">
                <span>COD Fee (2%)</span>
                <span>Rs {(cartState.total * 0.02).toFixed(2)}</span>
              </div>
            )}
            <div className="summaryRow totalRow">
              <span>Total</span>
              <span>
                Rs{" "}
                {paymentMethod === "cod"
                  ? (cartState.total * 1.02).toFixed(2)
                  : cartState.total.toFixed(2)}
              </span>
            </div>
            <div className="promoCode">
              <input
                type="text"
                id="promoCode"
                placeholder={
                  cartState.promoApplied ? "Discount applied" : "Promo Code"
                }
                disabled={cartState.promoApplied}
              />
              <button
                className="btn btnSm"
                disabled={true}
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              >
                {cartState.promoApplied ? "Applied" : "Apply"}
              </button>
            </div>
            <div className="secureCheckout">
              <FontAwesomeIcon icon={faLock} /> Secure Checkout
            </div>
            <div className="paymentMethods">
              <FontAwesomeIcon icon={faCcVisa} />
              <FontAwesomeIcon icon={faCcMastercard} />
              <FontAwesomeIcon icon={faCcAmex} />
              <FontAwesomeIcon icon={faCcPaypal} />
            </div>
          </div>
        </div>
      </div>

      {notification.show && (
        <div
          className={`notification ${
            notification.type === "error"
              ? "errorNotification"
              : "successNotification"
          }`}
        >
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Success Modal for COD */}
      {showSuccessModal && (
        <div className="modalOverlay">
          <div className="successModal">
            <div className="modalContent">
              <FontAwesomeIcon icon={faCheckCircle} size="3x" />
              <h2>Thank You For Your Order!</h2>
              <p>
                Your order has been placed successfully. Order ID:{" "}
                {localStorage.getItem("lastOrderId")}
              </p>
              <p>We've sent a confirmation to {formData.email}</p>
              <p>
                <strong>Payment Method:</strong> Cash on Delivery
              </p>
              <button className="btn btnPrimary" onClick={closeSuccessModal}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Checkout;
