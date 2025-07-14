//this file perform operations related to the shopping cart, including displaying items, updating quantities, applying promo codes, and calculating totals.
// It uses React hooks for state management and effects, and it interacts with localStorage to persist
// cart data. The component also includes a notification system to inform users about actions taken on the cart.
// It is styled with CSS to provide a user-friendly interface for managing the shopping cart.
// This file is part of a larger e-commerce application and is intended to be used in conjunction with other components such as product listings and checkout processes.
// It is designed to be responsive and accessible, providing a seamless shopping experience for users.
// Operations related to the shopping cart, including displaying items, updating quantities, applying promo codes, and calculating totals.
// It uses React hooks for state management and effects, and it interacts with localStorage to persist
// cart data. The component also includes a notification system to inform users about actions taken on the cart.
// It is styled with CSS to provide a user-friendly interface for managing the shopping cart.
// This file is part of a larger e-commerce application and is intended to be used in conjunction
// with other components such as product listings and checkout processes.
// It is designed to be responsive and accessible, providing a seamless shopping experience for users.

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faCreditCard,
  faCheckCircle,
  faTrash,
  faArrowLeft,
  faTimes,
  faHeadset,
  faTruck,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/Cart.css";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [cartState, setCartState] = useState({
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    discount: 0,
    discountCode: "",
    promoApplied: false,
  });

  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  useEffect(() => {
    localStorage.setItem("cartSummary", JSON.stringify(cartState));
  }, [cartState]);

  // Initialize cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);

        const validatedCart = parsedCart.map((item) => ({
          id: item.id,
          title: item.title || "Unknown Product",
          price: typeof item.price === "number" ? item.price : 0,

          category: item.category || "Uncategorized",
          quantity: typeof item.quantity === "number" ? item.quantity : 1,
        }));

        setCartItems(validatedCart);
      } catch (error) {
        console.error("Error parsing cart data:", error);
        setCartItems([]);
      }
    }
  }, []);

  const updateCartSummary = useCallback(() => {
    const subtotal = cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const shipping =
      subtotal > 100 ||
      (cartState.promoApplied && cartState.discountCode === "FREESHIP")
        ? 0
        : 10;

    const tax = subtotal * 0.1;

    let total;
    if (cartState.promoApplied) {
      if (cartState.discountCode === "FREESHIP") {
        total = subtotal + tax;
      } else {
        total = subtotal + shipping + tax - cartState.discount;
      }
    } else {
      total = subtotal + shipping + tax;
    }

    setCartState((prev) => ({
      ...prev,
      subtotal,
      shipping,
      tax,
      total,
    }));
  }, [
    cartItems,
    cartState.promoApplied,
    cartState.discountCode,
    cartState.discount,
  ]);

  useEffect(() => {
    updateCartSummary();
  }, [cartItems, updateCartSummary]);

  const updateItemQuantity = (id, action, value = null) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          let newQuantity = item.quantity;

          switch (action) {
            case "increase":
              newQuantity += 1;
              break;
            case "decrease":
              newQuantity = Math.max(1, item.quantity - 1);
              break;
            case "set":
              newQuantity = Math.max(1, isNaN(value) ? 1 : value);
              break;
            default:
              console.warn(`Unknown action type: ${action}`);
              break;
          }

          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });

    saveCart();
    showNotification("Cart updated");
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(updatedItems));
      window.dispatchEvent(new Event("storage"));
      return updatedItems;
    });
    showNotification("Item removed from cart");
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;

    if (window.confirm("Are you sure you want to clear your cart?")) {
      setCartItems([]);
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("storage"));
      showNotification("Cart cleared");
      window.location.reload();
    }
  };

  // const applyPromoCode = () => {
  //   const promoCodeInput = document.getElementById("promoCode");
  //   const promoCode = promoCodeInput.value.trim().toUpperCase();

  //   if (!promoCode) {
  //     showNotification("Please enter a promo code");
  //     return;
  //   }

  //   const promoCodes = {
  //     WELCOME10: { discount: 0.1, type: "percentage" },
  //     SUMMER20: { discount: 0.2, type: "percentage" },
  //     FREESHIP: { discount: 15, type: "fixed", appliesTo: "shipping" },
  //     FLAT15: { discount: 15, type: "fixed" },
  //   };

  //   if (promoCodes[promoCode]) {
  //     if (cartState.promoApplied) {
  //       showNotification("A promo code has already been applied");
  //       return;
  //     }

  //     const promo = promoCodes[promoCode];
  //     let discountAmount = 0;

  //     if (promo.type === "percentage") {
  //       discountAmount = cartState.subtotal * promo.discount;
  //     } else if (promo.type === "fixed") {
  //       discountAmount = promo.discount;
  //     }

  //     if (promo.appliesTo === "shipping") {
  //       setCartState((prev) => ({
  //         ...prev,
  //         shipping: Math.max(0, prev.shipping - promo.discount),
  //         discount: discountAmount,
  //         discountCode: promoCode,
  //         promoApplied: true,
  //         total:
  //           prev.subtotal +
  //           Math.max(0, prev.shipping - promo.discount) +
  //           prev.tax,
  //       }));
  //     } else {
  //       setCartState((prev) => ({
  //         ...prev,
  //         discount: discountAmount,
  //         discountCode: promoCode,
  //         promoApplied: true,
  //         total: prev.subtotal + prev.shipping + prev.tax - discountAmount,
  //       }));
  //     }

  //     showNotification(`Promo code ${promoCode} applied successfully!`);
  //     promoCodeInput.value = "";
  //   } else {
  //     showNotification("Invalid promo code");
  //   }
  // };

  const applyPromoCode = async () => {
    const promoCodeInput = document.getElementById("promoCode");
    const promoCode = promoCodeInput.value.trim().toUpperCase();

    if (!promoCode) {
      showNotification("Please enter a promo code");
      return;
    }

    if (cartState.promoApplied) {
      showNotification("A promo code has already been applied");
      return;
    }

    try {
      const response = await fetch("/api/vouchers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: promoCode,
          subtotal: cartState.subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to apply voucher");
      }

      const { discountAmount, appliesTo } = data.voucher;

      if (appliesTo === "shipping") {
        setCartState((prev) => {
          const updatedShipping = Math.max(0, prev.shipping - discountAmount);
          return {
            ...prev,
            shipping: updatedShipping,
            discount: discountAmount,
            discountCode: promoCode,
            promoApplied: true,
            total: prev.subtotal + updatedShipping + prev.tax,
          };
        });
      } else {
        setCartState((prev) => ({
          ...prev,
          discount: discountAmount,
          discountCode: promoCode,
          promoApplied: true,
          total: prev.subtotal + prev.shipping + prev.tax - discountAmount,
        }));
      }

      showNotification(`Promo code ${promoCode} applied successfully!`);
      promoCodeInput.value = "";
    } catch (error) {
      showNotification(error.message || "Invalid promo code");
    }
  };

  const saveCart = () => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
    window.dispatchEvent(new Event("storage"));
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  return (
    <main className="cartMainContainer">
      <div className="cartContentContainer">
        <div className="cartPageHeader">
          <h1 className="cartTitle">Your Shopping Cart</h1>
          <p className="cartBreadcrumbs">
            <Link to="/">Home</Link> / <span>Cart</span>
          </p>
        </div>

        <div className="cartLayout">
          <div className="cartItemsSection">
            <div className="cartItemsHeader">
              <div className="cartHeaderProduct">Product</div>
              <div className="cartHeaderPrice">Price</div>
              <div className="cartHeaderQuantity">Quantity</div>
              <div className="cartHeaderTotal">Total</div>
              <div className="cartHeaderAction"></div>
            </div>

            <div className="cartItemsList">
              {cartItems.length === 0 ? (
                <div className="emptyCart">
                  <FontAwesomeIcon icon={faShoppingCart} size="2x" />
                  <p>Your cart is empty</p>
                  <Link to="/Products" className="primaryButton">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => {
                  const itemTotal = (item.price * item.quantity).toFixed(2);

                  return (
                    <div key={item.id} className="cartItemCard">
                      <div className="cartProductInfo">
                        <div className="cartProductDetails">
                          <h3>{item.title}</h3>
                          <div className="cartProductCategory">
                            {item.category}
                          </div>
                        </div>
                      </div>
                      <div className="cartProductPrice">
                        Rs {item.price.toFixed(2)}
                      </div>
                      <div className="cartQuantityControls">
                        <button
                          className="quantityButton decreaseButton"
                          onClick={() =>
                            updateItemQuantity(item.id, "decrease")
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="quantityInput"
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            updateItemQuantity(
                              item.id,
                              "set",
                              isNaN(value) ? 1 : value
                            );
                          }}
                        />
                        <button
                          className="quantityButton increaseButton"
                          onClick={() =>
                            updateItemQuantity(item.id, "increase")
                          }
                        >
                          +
                        </button>
                      </div>
                      <div className="cartItemTotal">Rs {itemTotal}</div>
                      <button
                        className="removeItemButton"
                        onClick={() => removeItem(item.id)}
                        aria-label="Remove item"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cartActions">
                <button onClick={clearCart} className="outlineButton">
                  <FontAwesomeIcon icon={faTrash} /> Clear Cart
                </button>
                <Link to="/Products" className="outlineButton">
                  <FontAwesomeIcon icon={faArrowLeft} /> Continue Shopping
                </Link>
              </div>
            )}
          </div>

          <div className="cartSummarySection">
            <div className="orderSummary">
              <h2>Order Summary</h2>
              <div className="summaryRow">
                <span>Subtotal</span>
                <span id="subtotal">Rs {cartState.subtotal.toFixed(2)}</span>
              </div>
              <div className="summaryRow">
                <span>Shipping</span>
                <span id="shipping">
                  {cartState.shipping === 0
                    ? "FREE"
                    : `Rs ${cartState.shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="summaryRow">
                <span>Tax (10%)</span>
                <span id="tax">Rs {cartState.tax.toFixed(2)}</span>
              </div>
              {cartState.promoApplied && (
                <div className="summaryRow discountRow">
                  <span>Discount ({cartState.discountCode})</span>
                  <span id="discount">-Rs {cartState.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summaryRow totalRow">
                <span>Total</span>
                <span id="total">Rs {cartState.total.toFixed(2)}</span>
              </div>
              <div className="promoCodeContainer">
                <input
                  type="text"
                  id="promoCode"
                  placeholder="Promo Code"
                  disabled={cartState.promoApplied}
                />
                <button
                  id="applyPromoButton"
                  className="smallButton"
                  onClick={applyPromoCode}
                  disabled={cartState.promoApplied}
                >
                  {cartState.promoApplied ? "Applied" : "Apply"}
                </button>
                {cartState.promoApplied && (
                  <button
                    className="smallButton removePromoButton"
                    onClick={() => {
                      setCartState((prev) => ({
                        ...prev,
                        discount: 0,
                        discountCode: "",
                        promoApplied: false,
                        total: prev.subtotal + prev.shipping + prev.tax,
                      }));
                      showNotification("Promo code removed");
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <Link
                to={{
                  pathname: "/Checkout",
                  state: {
                    promoApplied: cartState.promoApplied,
                    discountCode: cartState.discountCode,
                    discount: cartState.discount,
                  },
                }}
                id="checkoutButton"
                className={`blockButton ${
                  cartItems.length > 0 ? "primaryButton" : "outlineButton"
                }`}
                style={{
                  pointerEvents: cartItems.length > 0 ? "auto" : "none",
                  opacity: cartItems.length > 0 ? 1 : 0.5,
                }}
              >
                <FontAwesomeIcon icon={faCreditCard} /> Proceed to Checkout
              </Link>
            </div>

            <div className="helpSection">
              <h3>Need Help?</h3>
              <p>Our customer service is available 24/7</p>
              <Link to="/Contact" className="helpLink">
                <FontAwesomeIcon icon={faHeadset} /> Contact Support
              </Link>
              <Link to="/" className="helpLink">
                <FontAwesomeIcon icon={faTruck} /> Shipping Information
              </Link>
              <Link to="/" className="helpLink">
                <FontAwesomeIcon icon={faExchangeAlt} /> Returns Policy
              </Link>
            </div>
          </div>
        </div>
      </div>

      {notification.show && (
        <div className="notification show">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span className="notificationMessage">{notification.message}</span>
        </div>
      )}
    </main>
  );
};

export default Cart;
