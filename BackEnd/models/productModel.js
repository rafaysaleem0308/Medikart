const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Pain Management",
        "Antibiotics",
        "Vitamins & Supplements",
        "Baby Care",
        "Wellness",
        "Diabetes Care",
        "Allergy & Sinus",
        "Cold & Flu",
        "Digestive Health",
        "Skin Care",
        "Heart Care",
        "Men's Health",
        "Respiratory Care",
        "First Aid",
        "Urology",
        "Neurology",
        "Hormonal",
        "Immunosuppressants",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    brand: String,
    dosage: String,
    activeIngredients: [String],

    // New fields from frontend
    manufacturer: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    lowStockAlert: {
      type: Number,
      default: 10,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    manufacturer: {
      type: String,
      required: false, // Change to false
    },
    expiryDate: {
      type: Date,
      required: false, // Change to false
    },
  },
  {
    collection: "product_datas",
    timestamps: true,
  }
  // In your Product schema
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
