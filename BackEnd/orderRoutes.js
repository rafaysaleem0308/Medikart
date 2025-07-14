const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("./models/orderModel");

// Connect to MongoDB with pharmacy database
const db = mongoose.connection.useDb("pharmacy");

// Create a new order (no authentication required)
router.post("/", async (req, res) => {
  try {
    const {
      items,
      shippingInfo,
      paymentInfo,
      subtotal,
      shipping,
      tax,
      discount,
      discountCode,
      total,
      sessionId,
    } = req.body;

    // Create order in the correct database and collection
    const order = new Order({
      items,
      shippingInfo,
      paymentInfo,
      subtotal,
      shipping,
      tax,
      discount,
      discountCode,
      total,
      sessionId,
    });

    await order.save();

    res.status(201).json({
      success: true,
      orderId: order._id,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
});
// Get all orders with user population
// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await db.collection("Order_data").find({}).toArray();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      error: "Failed to fetch orders",
      details: error.message,
    });
  }
});
// Get order by ID (no authentication required)
router.get("/:id", async (req, res) => {
  try {
    // Explicitly use the pharmacy database and Order_data collection
    const order = await db.collection("Order_data").findOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      error: "Failed to fetch order",
      details: error.message,
    });
  }
});

module.exports = router;
