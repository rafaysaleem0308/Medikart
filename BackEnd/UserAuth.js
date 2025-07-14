const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Voucher = require("./models/voucherModel");

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Get User Profile
router.get("/:userId", authenticate, async (req, res) => {
  try {
    // Admin can access any profile, users can only access their own
    if (
      req.user._id.toString() !== req.params.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const user = await User.findById(req.params.userId).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update User Profile
router.put(
  "/:userId",
  authenticate,
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("newPassword")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, currentPassword, newPassword } = req.body;
      const userId = req.params.userId;

      // Verify ownership
      if (req.user._id.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const updateData = { name };
      const user = await User.findById(userId);

      // Handle password change
      if (newPassword) {
        if (!currentPassword) {
          return res
            .status(400)
            .json({ error: "Current password is required" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ error: "Current password is incorrect" });
        }

        updateData.password = await bcrypt.hash(newPassword, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password -__v");

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// User Registration
router.post(
  "/signup",
  [
    check("name").notEmpty().withMessage("Name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    check("role")
      .isIn(["customer", "doctor", "admin"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, role, specialization } = req.body;

      // Additional doctor validation
      if (role === "doctor" && !specialization) {
        return res
          .status(400)
          .json({ error: "Specialization is required for doctors" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userData = {
        name,
        email,
        password: hashedPassword,
        role,
        voucher_assigned: [],
      };

      if (role === "doctor") userData.specialization = specialization;

      const newUser = await User.create(userData);

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          specialization: newUser.specialization,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

// User Login
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          specialization: user.specialization,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// Voucher Assignment
router.post("/:userId/assign-voucher", async (req, res) => {
  try {
    const { voucherCode } = req.body;
    const userId = req.params.userId;

    // Remove the authentication check
    // if (req.user._id.toString() !== userId && req.user.role !== "admin") {
    //   return res.status(403).json({ error: "Unauthorized access" });
    // }

    const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    // Check if voucher is already assigned and not used
    const existingAssignment = await User.findOne({
      _id: userId,
      "voucher_assigned.voucherId": voucher._id,
      "voucher_assigned.used": false,
    });

    if (existingAssignment) {
      return res
        .status(400)
        .json({ error: "Voucher already assigned to this user" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          voucher_assigned: {
            voucherId: voucher._id,
            voucherName: voucher.code,
            description: voucher.description,
            used: false,
            assignedAt: new Date(),
          },
        },
      },
      { new: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Voucher assigned successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Voucher assignment error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark Voucher as Used
router.put(
  "/:userId/use-voucher/:voucherId",
  authenticate,
  async (req, res) => {
    try {
      const { userId, voucherId } = req.params;

      // Verify ownership or admin access
      if (req.user._id.toString() !== userId && req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const updatedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          "voucher_assigned.voucherId": voucherId,
          "voucher_assigned.used": false,
        },
        {
          $set: {
            "voucher_assigned.$.used": true,
            "voucher_assigned.$.usedAt": new Date(),
          },
        },
        { new: true }
      ).select("-password -__v");

      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: "Voucher not found or already used" });
      }

      res.json({
        message: "Voucher marked as used",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Voucher use error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
// Get All Users (Public access - remove authenticate middleware)
// Get All Users (Public access - remove authenticate middleware)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}).select("-password -__v").lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
