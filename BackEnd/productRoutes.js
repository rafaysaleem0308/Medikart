const express = require("express");
const router = express.Router();
const Product = require("./models/productModel");
const multer = require("multer");
const path = require("path");

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// GET all products with filtering
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      onSale,
      requiresPrescription,
      sort = "name",
      dosage,
      status,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All Categories") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (requiresPrescription === "true") {
      query.requiresPrescription = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      query.stockQuantity = { $gt: 0 };
    } else if (inStock === "false") {
      query.stockQuantity = 0;
    }

    if (status) {
      query.status = status;
    }

    if (onSale === "true") {
      query.onSale = true;
    }

    let sortOption = {};
    switch (sort) {
      case "price-low":
        sortOption = { price: 1 };
        break;
      case "price-high":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "stock":
        sortOption = { stockQuantity: -1 };
        break;
      case "name":
      default:
        sortOption = { name: 1 };
        break;
    }

    const products = await Product.find(query).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// GET all categories
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch categories" });
  }
});

// GET all prescription products
router.get("/prescription", async (req, res) => {
  try {
    const products = await Product.find({ requiresPrescription: true });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error("Error fetching prescription products:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch prescription products" });
  }
});

// GET all wellness products
router.get("/wellness", async (req, res) => {
  try {
    const products = await Product.find({
      category: { $regex: /^Wellness$/i },
    });

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching wellness products:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch wellness products" });
  }
});

// Check stock for multiple products
router.post("/check-stock", async (req, res) => {
  try {
    const { items } = req.body;

    // Check stock for all items
    const stockCheckPromises = items.map(async (item) => {
      const product = await Product.findById(item.id);
      if (!product) {
        return { id: item.id, available: false, message: "Product not found" };
      }
      if (product.stockQuantity < item.quantity) {
        return {
          id: item.id,
          available: false,
          message: `Only ${product.stockQuantity} available`,
          name: product.name,
        };
      }
      return { id: item.id, available: true };
    });

    const stockResults = await Promise.all(stockCheckPromises);
    const allAvailable = stockResults.every((item) => item.available);

    if (!allAvailable) {
      const unavailableItems = stockResults.filter((item) => !item.available);
      return res.status(400).json({
        success: false,
        message: "Some items are out of stock",
        unavailableItems,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error checking stock:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Update stock quantities (decrement)
router.post("/update-stock", async (req, res) => {
  try {
    const { items } = req.body;

    // Decrement stock for all items
    const updatePromises = items.map(async (item) => {
      const product = await Product.findById(item.id);
      if (product) {
        product.stockQuantity -= item.quantity;
        // Update status if stock reaches 0
        if (product.stockQuantity <= 0) {
          product.status = "inactive";
        }
        await product.save();
      }
    });

    await Promise.all(updatePromises);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Check stock for a single product
router.post("/:id/check-stock", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const requestedQuantity = req.body.quantity || 1;

    if (product.stockQuantity < requestedQuantity) {
      return res.json({
        success: false,
        available: product.stockQuantity,
        message: `Only ${product.stockQuantity} available`,
      });
    }

    res.json({ success: true, available: product.stockQuantity });
  } catch (error) {
    console.error("Error checking stock:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// CREATE a new product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      stockQuantity,
      requiresPrescription,
      manufacturer,
      expiryDate,
      lowStockAlert,
      status = "active",
    } = req.body;

    const newProduct = new Product({
      name,
      description,
      category,
      price,
      stockQuantity,
      requiresPrescription: requiresPrescription === "true",
      manufacturer,
      expiryDate,
      lowStockAlert,
      status,
      image: req.file ? `/images/products/${req.file.filename}` : null,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// UPDATE a product
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      stockQuantity,
      requiresPrescription,
      manufacturer,
      expiryDate,
      lowStockAlert,
      status,
    } = req.body;

    const updateData = {
      name,
      description,
      category,
      price,
      stockQuantity,
      requiresPrescription: requiresPrescription === "true",
      manufacturer,
      expiryDate,
      lowStockAlert,
      status,
    };

    // Update status based on stock quantity
    if (stockQuantity <= 0) {
      updateData.status = "inactive";
    } else if (status === "inactive" && stockQuantity > 0) {
      updateData.status = "active";
    }

    if (req.file) {
      updateData.image = `/images/products/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// DELETE a product
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;
