const mongoose = require("mongoose");

// User schema for customers and doctors
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "doctor", "admin"],
      default: "customer",
    },
    unreadMessages: {
      type: Map,
      of: Number,
      default: {},
    },
    specialization: {
      type: String,
      enum: [
        "Cardiology",
        "Dermatology",
        "Pediatrics",
        "Orthopedics",
        "Neurology",
      ],
      required: function () {
        return this.role === "doctor";
      },
    },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    voucher_assigned: {
      type: [
        {
          voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
          voucherName: { type: String },
          used: { type: Boolean, default: false },
          assignedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: false }
);

const User = mongoose.model("User", userSchema); // collection = "users"
module.exports = User;
