const express = require("express");
const router = express.Router();
const Review = require("./models/reviewModel");
const User = require("./models/userModel");
const jwt = require("jsonwebtoken");

// Authentication middleware
// Authentication middleware - add some debug logs
const authenticate = async (req, res, next) => {
  try {
    console.log("Checking authentication...");
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No auth header or wrong format");
      return res.status(401).json({ error: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.userId);
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Get all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 }).lean();
    const formattedReviews = reviews.map((review) => ({
      ...review,
      id: review._id.toString(),
      date:
        review.date instanceof Date
          ? review.date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
    }));
    res.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Submit a new review
router.post("/", authenticate, async (req, res) => {
  try {
    const { text, rating, category } = req.body;

    if (!text || !rating || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (text.length < 10) {
      return res
        .status(400)
        .json({ error: "Review must be at least 10 characters long" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const review = new Review({
      userName: req.user.name, // ✅ Comes from authenticated user
      text,
      rating,
      category,
      userId: req.user._id,
    });

    const savedReview = await review.save();

    res.status(201).json({
      id: savedReview._id.toString(),
      userName: savedReview.userName,
      text: savedReview.text,
      rating: savedReview.rating,
      category: savedReview.category,
      date: savedReview.date.toISOString().split("T")[0],
    });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Failed to save review" });
  }
});

module.exports = router;
