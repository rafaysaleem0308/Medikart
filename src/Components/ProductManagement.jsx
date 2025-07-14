"use client";

import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faCapsules,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faCalendarAlt,
  faBoxes,
  faSearch,
  faSpinner,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/ProductManagement.css";

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [isPaginating, setIsPaginating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stockQuantity: "",
    requiresPrescription: false,
    manufacturer: "",
    expiryDate: "",
    lowStockAlert: "",
    status: "active",
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showModal) {
        setShowModal(false);
      }
    };

    const handleOutsideClick = (e) => {
      if (showModal && e.target.classList.contains("pmModalOverlay")) {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showModal]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/products/categories/all");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const paginate = useCallback(
    (pageNumber) => {
      if (isPaginating) return;

      setIsPaginating(true);
      setCurrentPage(pageNumber);

      setTimeout(() => {
        setIsPaginating(false);
      }, 300);
    },
    [isPaginating]
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (currentProduct) {
        response = await fetch(`/api/products/${currentProduct._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save product");
      }
      fetchProducts();
      setShowModal(false);
      resetForm();
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: "",
      stockQuantity: "",
      requiresPrescription: false,
      manufacturer: "",
      expiryDate: "",
      lowStockAlert: "",
      status: "active",
    });
    setCurrentProduct(null);
  };

  const openEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      requiresPrescription: product.requiresPrescription || false,
      manufacturer: product.manufacturer || "",
      expiryDate: product.expiryDate || "",
      lowStockAlert: product.lowStockAlert?.toString() || "10",
      status: product.status || "active",
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getStockStatus = (product) => {
    if (product.stockQuantity === 0) return "out-of-stock";
    if (product.stockQuantity <= (product.lowStockAlert || 10))
      return "low-stock";
    return "in-stock";
  };

  const getStockBadgeClass = (status) => {
    switch (status) {
      case "out-of-stock":
        return "pmBadgeDanger";
      case "low-stock":
        return "pmBadgeWarning";
      default:
        return "pmBadgeSuccess";
    }
  };

  const getCategoryBadgeClass = (category) => {
    const categoryClasses = {
      "Pain Relief": "pmBadgePrimary",
      Antibiotics: "pmBadgeDanger",
      Vitamins: "pmBadgeSuccess",
      Diabetes: "pmBadgeWarning",
      Cardiovascular: "pmBadgeInfo",
    };
    return categoryClasses[category] || "pmBadgeSecondary";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.manufacturer &&
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "out-of-stock"
        ? product.stockQuantity === 0
        : filterStatus === "low-stock"
        ? product.stockQuantity > 0 &&
          product.stockQuantity <= (product.lowStockAlert || 10)
        : product.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= (p.lowStockAlert || 10) && p.stockQuantity > 0
  );
  const outOfStockProducts = products.filter((p) => p.stockQuantity === 0);

  if (loading) {
    return (
      <div className="pmLoading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <span>Loading products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pmError">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="pmContainer">
      <div className="pmHeader">
        <h1 className="pmHeaderTitle">Products Management</h1>
        <p className="pmHeaderSubtitle">
          Manage medicines, supplements, and medical supplies
        </p>
      </div>

      <div className="pmStatsGrid">
        <div className="pmStatCard">
          <div className="pmStatCardIcon">
            <FontAwesomeIcon icon={faBoxes} />
          </div>
          <div className="pmStatCardInfo">
            <h3 className="pmStatCardLabel">Total Products</h3>
            <p className="pmStatCardValue">{products.length}</p>
          </div>
        </div>
        <div className="pmStatCard">
          <div className="pmStatCardIcon">
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className="pmStatCardInfo">
            <h3 className="pmStatCardLabel">Active Products</h3>
            <p className="pmStatCardValue">
              {products.filter((p) => p.status === "active").length}
            </p>
          </div>
        </div>
        <div className="pmStatCard">
          <div className="pmStatCardIcon">
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className="pmStatCardInfo">
            <h3 className="pmStatCardLabel">Low Stock</h3>
            <p className="pmStatCardValue">{lowStockProducts.length}</p>
          </div>
        </div>
        <div className="pmStatCard">
          <div className="pmStatCardIcon">
            <FontAwesomeIcon icon={faTimesCircle} />
          </div>
          <div className="pmStatCardInfo">
            <h3 className="pmStatCardLabel">Out of Stock</h3>
            <p className="pmStatCardValue">{outOfStockProducts.length}</p>
          </div>
        </div>
      </div>

      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="pmAlertSection">
          {outOfStockProducts.length > 0 && (
            <div className="pmAlert pmAlertDanger">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>
                {outOfStockProducts.length} product(s) are out of stock and need
                immediate restocking.
              </span>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="pmAlert pmAlertWarning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <span>
                {lowStockProducts.length} product(s) are running low on stock.
              </span>
            </div>
          )}
        </div>
      )}

      <div className="pmDataSection">
        <div className="pmSectionHeader">
          <h2 className="pmSectionTitle">All Products</h2>
          <div className="pmSectionActions">
            <div className="pmSearchBox">
              <FontAwesomeIcon icon={faSearch} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="pmFilters">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="pmFilterSelect"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="pmFilterSelect"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <button className="pmPrimaryButton" onClick={openAddModal}>
              <FontAwesomeIcon icon={faPlus} />
              Add Product
            </button>
          </div>
        </div>

        <div className="pmTableContainer">
          <table className="pmDataTable">
            <thead className="pmDataTableHead">
              <tr className="pmDataTableRow">
                <th className="pmDataTableHeader">Product</th>
                <th className="pmDataTableHeader">Category</th>
                <th className="pmDataTableHeader">Price</th>
                <th className="pmDataTableHeader">Stock</th>
                <th className="pmDataTableHeader">Status</th>
                <th className="pmDataTableHeader">Expiry Date</th>
                <th className="pmDataTableHeader">Actions</th>
              </tr>
            </thead>
            <tbody className="pmDataTableBody">
              {currentProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr
                    key={product._id}
                    className={`pmDataTableRow ${
                      stockStatus === "out-of-stock"
                        ? "pmRowOutOfStock"
                        : stockStatus === "low-stock"
                        ? "pmRowLowStock"
                        : ""
                    }`}
                  >
                    <td className="pmDataTableCell">
                      <div className="pmProductInfo">
                        <div className="pmProductIcon">
                          <FontAwesomeIcon icon={faCapsules} />
                        </div>
                        <div className="pmProductDetails">
                          <div className="pmProductName">{product.name}</div>
                          <div className="pmProductManufacturer">
                            {product.manufacturer}
                          </div>
                          {product.requiresPrescription && (
                            <span className="pmPrescriptionBadge">
                              Rx Required
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="pmDataTableCell">
                      <span
                        className={`pmBadge ${getCategoryBadgeClass(
                          product.category
                        )}`}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td className="pmDataTableCell">
                      <span className="pmPrice">
                        PKR {product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="pmDataTableCell">
                      <span
                        className={`pmBadge ${getStockBadgeClass(stockStatus)}`}
                      >
                        {product.stockQuantity} units
                        {stockStatus === "low-stock" &&
                          ` (Low stock alert: ${product.lowStockAlert || 10})`}
                      </span>
                    </td>
                    <td className="pmDataTableCell">
                      <span
                        className={`pmBadge ${
                          product.status === "active"
                            ? "pmBadgeSuccess"
                            : "pmBadgeSecondary"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            product.status === "active"
                              ? faCheckCircle
                              : faTimesCircle
                          }
                        />
                        {product.status}
                      </span>
                    </td>
                    <td className="pmDataTableCell">
                      <span className="pmExpiryDate">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        {new Date(product.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="pmDataTableCell">
                      <div className="pmActionButtons">
                        <button
                          className="pmActionButton pmActionButtonEdit"
                          title="Edit"
                          onClick={() => openEditModal(product)}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          className="pmActionButton pmActionButtonDelete"
                          title="Delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredProducts.length > productsPerPage && (
            <div
              className={`pmPagination ${
                isPaginating ? "pmPaginationLoading" : ""
              }`}
            >
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1 || isPaginating}
                className="pmPaginationButton pmPaginationButtonFirst"
                aria-label="First page"
              >
                <FontAwesomeIcon icon={faAngleDoubleLeft} />
              </button>

              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1 || isPaginating}
                className="pmPaginationButton pmPaginationButtonPrev"
                aria-label="Previous page"
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>

              {currentPage > 3 && totalPages > 5 && (
                <span className="pmPaginationEllipsis">...</span>
              )}

              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  disabled={isPaginating}
                  className={`pmPaginationButton ${
                    currentPage === page ? "pmPaginationButtonActive" : ""
                  }`}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              ))}

              {currentPage < totalPages - 2 && totalPages > 5 && (
                <span className="pmPaginationEllipsis">...</span>
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || isPaginating}
                className="pmPaginationButton pmPaginationButtonNext"
                aria-label="Next page"
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>

              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages || isPaginating}
                className="pmPaginationButton pmPaginationButtonLast"
                aria-label="Last page"
              >
                <FontAwesomeIcon icon={faAngleDoubleRight} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="pmModalOverlay">
          <div className="pmModal">
            <div className="pmModalHeader">
              <h3>{currentProduct ? "Edit Product" : "Add New Product"}</h3>
              <button
                className="pmModalClose"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="pmModalBody">
              <form onSubmit={handleSubmit}>
                <div className="pmFormGroup">
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="pmFormGroup">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pmFormRow">
                  <div className="pmFormGroup">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pmFormGroup">
                    <label>Price (PKR)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="pmFormRow">
                  <div className="pmFormGroup">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>

                  <div className="pmFormGroup">
                    <label>Low Stock Alert</label>
                    <input
                      type="number"
                      name="lowStockAlert"
                      value={formData.lowStockAlert}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="pmFormRow">
                  <div className="pmFormGroup">
                    <label>Manufacturer</label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="pmFormGroup">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="pmFormRow">
                  <div className="pmFormGroup">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="pmCheckboxGroup">
                    <input
                      type="checkbox"
                      id="requiresPrescription"
                      name="requiresPrescription"
                      checked={formData.requiresPrescription}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="requiresPrescription">
                      Requires Prescription
                    </label>
                  </div>
                </div>

                <div className="pmModalFooter">
                  <button
                    type="button"
                    className="pmSecondaryButton"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="pmPrimaryButton">
                    {currentProduct ? "Update Product" : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
