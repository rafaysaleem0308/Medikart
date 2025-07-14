const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  category: {
    type: String,
    required: true,
    enum: ["general", "products", "doctors", "pharmacy", "service"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// Check if the model has already been compiled
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

module.exports = Review;
