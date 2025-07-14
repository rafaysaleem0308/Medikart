"use client";

import { useState, useEffect } from "react";
import "../styles/Product.css";
import { useParams } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import Alert from "react-bootstrap/Alert";

const AddToCartModal = ({ show, onClose, product, quantity, totalPrice }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Added to Cart!</h3>
        <p>
          {quantity} x {product.name}
        </p>
        <p>Total: Rs {totalPrice}</p>
        <div className="modal-actions">
          <button className="continue-shopping" onClick={onClose}>
            Continue Shopping
          </button>
          <button
            className="view-cart"
            onClick={() => {
              window.location.href = "/cart";
            }}
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const Products = ({ onAddToCart }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["All Categories"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalTotal, setModalTotal] = useState(0);
  const { category } = useParams();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("name");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  // eslint-disable-next-line
  const [productQuantities, setProductQuantities] = useState({});

  // Calculate pagination data
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    showInStockOnly,
    showOnSaleOnly,
    priceRange,
  ]);

  // Sync selectedCategory with URL param
  useEffect(() => {
    setSelectedCategory(
      category === "prescription"
        ? "Prescription Drugs"
        : category === "wellness"
        ? "Wellness Products"
        : "All Categories"
    );
  }, [category]);

  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = "";

        if (window.location.pathname === "/prescription") {
          query = "?requiresPrescription=true";
        } else if (window.location.pathname === "/wellness") {
          query = "?category=Wellness%20Products";
        }

        const productsRes = await fetch(`/api/products${query}`);

        if (!productsRes.ok) throw new Error("Failed to fetch products");
        const productsData = await productsRes.json();
        setProducts(productsData.data || []);

        const categoriesRes = await fetch("/api/products/categories/all");
        if (!categoriesRes.ok) throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesRes.json();

        const categoriesArray = Array.isArray(categoriesData.data)
          ? categoriesData.data
          : Array.isArray(categoriesData)
          ? categoriesData
          : [];

        setCategories(["All Categories", ...categoriesArray]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  // Apply filters
  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories"
          ? true
          : product.category === selectedCategory ||
            (selectedCategory === "Prescription Drugs" &&
              product.requiresPrescription) ||
            (selectedCategory === "Wellness Products" &&
              product.category === "Wellness Products");

      const matchesStock = !showInStockOnly || product.inStock;
      const matchesSale = !showOnSaleOnly || product.onSale;

      let matchesPrice = true;
      if (priceRange === "under-20") matchesPrice = product.price < 20;
      else if (priceRange === "20-50")
        matchesPrice = product.price >= 20 && product.price <= 500;
      else if (priceRange === "over-50") matchesPrice = product.price > 500;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesSale &&
        matchesPrice
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(sorted);
  }, [
    products,
    searchTerm,
    selectedCategory,
    sortBy,
    showInStockOnly,
    showOnSaleOnly,
    priceRange,
  ]);

  const handleAddToCart = async (product) => {
    const quantity = productQuantities[product._id] || 1;

    // Check stock before adding to cart
    try {
      const response = await fetch(`/api/products/${product._id}/check-stock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        alert(`Only ${data.available} items available in stock`);
        return;
      }

      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

      // Check if product already exists in cart
      const existingItemIndex = existingCart.findIndex(
        (item) => item.id === product._id
      );

      if (existingItemIndex !== -1) {
        // Update quantity if product exists
        existingCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        existingCart.push({
          id: product._id,
          title: product.name,
          price: product.price,
          image: product.image || "/default-product-image.jpg",
          category: product.category,
          quantity: quantity,
        });
      }

      // Save back to localStorage
      localStorage.setItem("cart", JSON.stringify(existingCart));

      // Trigger storage event to update Navbar
      window.dispatchEvent(new Event("storage"));

      // Show confirmation modal
      setModalProduct(product);
      setModalQuantity(quantity);
      setModalTotal((product.price * quantity).toFixed(2));
      setShowModal(true);
    } catch (error) {
      console.error("Error checking stock:", error);
      alert("Error checking stock availability");
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setShowInStockOnly(false);
    setShowOnSaleOnly(false);
    setPriceRange("all");
    setSortBy("name");
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`star ${i < Math.floor(rating) ? "filled" : ""}`}
      >
        ★
      </span>
    ));
  };

  const getStockStatusText = (product) => {
    if (!product.inStock) return "Out of Stock";
    if (product.stockQuantity <= 5) return `Only ${product.stockQuantity} left`;
    return "In Stock";
  };

  const getStockStatusClass = (product) => {
    if (!product.inStock) return "out-of-stock";
    if (product.stockQuantity <= 5) return "low-stock";
    return "in-stock";
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          «
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          ‹
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className={`pagination-button ${
                1 === currentPage ? "active" : ""
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`pagination-button ${
              number === currentPage ? "active" : ""
            }`}
            disabled={number === currentPage}
          >
            {number}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className="pagination-ellipsis">...</span>
            )}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`pagination-button ${
                totalPages === currentPage ? "active" : ""
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          ›
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          »
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading product details...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Pharmacy Products</h1>
        <p>
          Find the medications and health products you need with our
          comprehensive selection
        </p>
      </div>

      <div className="search-filters">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="button" className="bi bi-search"></button>
          </div>
        </div>

        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label>Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range:</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="under-20">Under Rs 20</option>
                <option value="20-50">Rs20 - Rs 500</option>
                <option value="over-50">Over Rs 500</option>
              </select>
            </div>
          </div>

          <div className="checkbox-filters">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
              />
              In Stock Only
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showOnSaleOnly}
                onChange={(e) => setShowOnSaleOnly(e.target.checked)}
              />
              On Sale Only
            </label>
          </div>
        </div>
      </div>

      <div className="results-header">
        <p className="results-count">
          Showing {currentProducts.length} of {filteredProducts.length} products
          {filteredProducts.length > productsPerPage &&
            ` (Page ${currentPage} of ${totalPages})`}
        </p>
        {(searchTerm ||
          selectedCategory !== "All Categories" ||
          showInStockOnly ||
          showOnSaleOnly ||
          priceRange !== "all") && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        )}
      </div>

      {currentProducts.length > 0 ? (
        <>
          <div className="product-list">
            {currentProducts.map((product) => {
              const quantity = productQuantities[product._id] || 1;
              const totalPrice = (product.price * quantity).toFixed(2);

              return (
                <div key={product._id} className="product-card">
                  <div className="product-header">
                    <h3>{product.name}</h3>
                    <div className="badges">
                      {product.requiresPrescription && (
                        <span className="prescription-badge">
                          Prescription Required
                        </span>
                      )}
                      {product.onSale && (
                        <span className="sale-badge">On Sale</span>
                      )}
                    </div>
                  </div>

                  <div className="product-category">{product.category}</div>

                  <div className="product-rating">
                    <div className="stars">{renderStars(product.rating)}</div>
                    <span className="rating-text">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="product-description">
                    {product.description}
                  </div>

                  <div className="product-footer">
                    <div className="price-section">
                      <div className="price-info">
                        <span className="product-price">
                          Rs {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="original-price">
                            Rs{product.originalPrice}
                          </span>
                        )}
                        <div className="unit-price">per unit</div>
                      </div>
                      {quantity > 1 && (
                        <div className="total-price">
                          <span className="total-label">Total:</span>
                          <span className="total-amount">Rs {totalPrice}</span>
                        </div>
                      )}
                    </div>
                    <div className="stock-section">
                      <span
                        className={`stock-status ${getStockStatusClass(
                          product
                        )}`}
                      >
                        {getStockStatusText(product)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="add-to-cart"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                  >
                    {product.inStock
                      ? `Add ${quantity > 1 ? `${quantity} ` : ""}to Cart`
                      : "Out of Stock"}
                  </button>
                </div>
              );
            })}
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="no-results">
          <div className="no-results-content">
            <h3>No products found</h3>
            <p>
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
            <button className="clear-filters-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <AddToCartModal
        show={showModal}
        onClose={() => setShowModal(false)}
        product={modalProduct}
        quantity={modalQuantity}
        totalPrice={modalTotal}
      />
    </div>
  );
};

export default Products;
