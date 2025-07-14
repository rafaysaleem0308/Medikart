const express = require("express");
const router = express.Router();
const User = require("./models/userModel");
const Order = require("./models/orderModel");

// Get all users with their order counts
router.get("/users-with-orders", async (req, res) => {
  try {
    // Fetch all users (excluding admins)
    const users = await User.find({ role: { $ne: "admin" } }).lean();

    // Fetch all orders and group by email
    const orders = await Order.aggregate([
      {
        $group: {
          _id: "$shippingInfo.email",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert orders array to a map for easy lookup
    const orderCountMap = orders.reduce((map, item) => {
      map[item._id] = item.count;
      return map;
    }, {});

    // Combine user data with order counts
    const usersWithOrders = users.map((user) => ({
      ...user,
      orderCount: orderCountMap[user.email] || 0,
    }));

    res.json(usersWithOrders);
  } catch (error) {
    console.error("Error fetching users with orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
