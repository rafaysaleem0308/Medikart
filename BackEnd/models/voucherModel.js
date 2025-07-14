const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed", "shipping"],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: "voucher_data" } // Explicitly set collection name
);

// Validate end date is after start date
voucherSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    throw new Error("End date must be after start date");
  }
  next();
});

// Static method to validate and apply voucher
voucherSchema.statics.validateVoucher = async function (code, subtotal) {
  const now = new Date();
  const voucher = await this.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!voucher) {
    throw new Error("Invalid or expired voucher code");
  }

  if (subtotal < voucher.minOrderAmount) {
    throw new Error(
      `Minimum order amount of Rs ${voucher.minOrderAmount.toFixed(
        2
      )} required for this voucher`
    );
  }

  let discountAmount = 0;

  switch (voucher.discountType) {
    case "percentage":
      discountAmount = subtotal * (voucher.discountValue / 100);
      break;
    case "fixed":
      discountAmount = Math.min(voucher.discountValue, subtotal);
      break;
    case "shipping":
      discountAmount = voucher.discountValue;
      break;
  }

  return {
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType,
    discountAmount,
    appliesTo: voucher.discountType === "shipping" ? "shipping" : "total",
    minOrderAmount: voucher.minOrderAmount,
  };
};

const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
