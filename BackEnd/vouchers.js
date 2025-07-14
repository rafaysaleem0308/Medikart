const express = require("express");
const router = express.Router();
const Voucher = require("./models/voucherModel");

// Get all vouchers
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new voucher
router.post("/", async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update voucher
router.put("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete voucher
router.delete("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }
    res.json({ message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle voucher status
router.patch("/:id/toggle", async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    voucher.isActive = !voucher.isActive;
    await voucher.save();
    res.json(voucher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply voucher code
router.post("/apply", async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await Voucher.validateVoucher(code, subtotal);
    res.json({
      success: true,
      voucher: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// Get active vouchers
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
