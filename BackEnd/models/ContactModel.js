const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
  },
  phone: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    default: "general",
    enum: [
      "general",
      "prescription",
      "delivery",
      "products",
      "billing",
      "other",
    ],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    minlength: [10, "Message must be at least 10 characters long"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["new", "in-progress", "resolved"],
    default: "new",
  },
});

// Indexes
contactSchema.index({ createdAt: -1 });
contactSchema.index({ status: 1 });

module.exports = mongoose.model("Contact", contactSchema, "Contact_data");
