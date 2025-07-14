import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Voucher.css";

const Voucher = () => {
  const [vouchers, setVouchers] = useState([]);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderAmount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/vouchers");
      setVouchers(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch vouchers");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        throw new Error("End date must be after start date");
      }

      if (editingId) {
        await axios.put(`/api/vouchers/${editingId}`, formData);
        setSuccessMessage("Voucher updated successfully!");
      } else {
        await axios.post("/api/vouchers", formData);
        setSuccessMessage("Voucher created successfully!");
      }

      resetForm();
      fetchVouchers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const editVoucher = (voucher) => {
    setFormData({
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderAmount: voucher.minOrderAmount,
      startDate: new Date(voucher.startDate).toISOString().split("T")[0],
      endDate: new Date(voucher.endDate).toISOString().split("T")[0],
      isActive: voucher.isActive,
    });
    setEditingId(voucher._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteVoucher = async (id) => {
    if (window.confirm("Are you sure you want to delete this voucher?")) {
      try {
        await axios.delete(`/api/vouchers/${id}`);
        setSuccessMessage("Voucher deleted successfully!");
        fetchVouchers();
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  const toggleVoucherStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/api/vouchers/${id}/toggle`);
      setSuccessMessage(
        `Voucher ${currentStatus ? "deactivated" : "activated"} successfully!`
      );
      fetchVouchers();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderAmount: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      isActive: true,
    });
    setEditingId(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="voucher-management">
      <h1 className="voucher-management__title">Voucher Update</h1>

      {error && (
        <div className="voucher-management__alert voucher-management__alert--error">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="voucher-management__alert voucher-management__alert--success">
          {successMessage}
        </div>
      )}

      <div className="voucher-management__form-container">
        <h2 className="voucher-management__form-title">
          {editingId ? "Edit Voucher" : "Create New Voucher"}
        </h2>
        <form onSubmit={handleSubmit} className="voucher-management__form">
          <div className="voucher-management__form-group">
            <label className="voucher-management__label">Voucher Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              required
              placeholder="e.g., SUMMER20"
              className="voucher-management__input"
            />
          </div>

          <div className="voucher-management__form-group">
            <label className="voucher-management__label">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="e.g., Summer Sale Discount"
              className="voucher-management__input"
            />
          </div>

          <div className="voucher-management__form-group">
            <label className="voucher-management__label">Discount Type</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleInputChange}
              required
              className="voucher-management__select"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="shipping">Free Shipping</option>
            </select>
          </div>

          <div className="voucher-management__form-group">
            <label className="voucher-management__label">
              {formData.discountType === "percentage"
                ? "Discount Percentage"
                : formData.discountType === "fixed"
                ? "Discount Amount"
                : "Shipping Discount Value"}
            </label>
            <input
              type="number"
              name="discountValue"
              value={formData.discountValue}
              onChange={handleInputChange}
              required
              min="0"
              step={formData.discountType === "percentage" ? "1" : "0.01"}
              className="voucher-management__input"
            />
          </div>

          <div className="voucher-management__form-group">
            <label className="voucher-management__label">
              Minimum Order Amount
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="voucher-management__input"
            />
          </div>

          <div className="voucher-management__form-group">
            <label className="voucher-management__label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="voucher-management__input"
            />
          </div>

          <div className="voucher-management__form-group">
            <label className="voucher-management__label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className="voucher-management__input"
            />
          </div>

          <div className="voucher-management__checkbox-group">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="voucher-management__checkbox"
            />
            <label
              htmlFor="isActive"
              className="voucher-management__checkbox-label"
            >
              Active
            </label>
          </div>

          <div className="voucher-management__form-actions">
            <button
              type="submit"
              className="voucher-management__button voucher-management__button--primary"
            >
              {editingId ? "Update Voucher" : "Create Voucher"}
            </button>
            {editingId && (
              <button
                type="button"
                className="voucher-management__button voucher-management__button--secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="voucher-management__list-container">
        <h2 className="voucher-management__list-title">Vouchers</h2>
        {isLoading ? (
          <div className="voucher-management__loading">Loading vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="voucher-management__empty">No vouchers found</div>
        ) : (
          <table className="voucher-management__table">
            <thead className="voucher-management__table-header">
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="voucher-management__table-body">
              {vouchers.map((voucher) => (
                <tr key={voucher._id} className="voucher-management__table-row">
                  <td>{voucher.code}</td>
                  <td>{voucher.description}</td>
                  <td>
                    {voucher.discountType === "percentage"
                      ? `${voucher.discountValue}%`
                      : voucher.discountType === "fixed"
                      ? `Rs ${voucher.discountValue.toFixed(2)}`
                      : "Free Shipping"}
                  </td>
                  <td>Rs {voucher.minOrderAmount.toFixed(2)}</td>
                  <td>{formatDate(voucher.startDate)}</td>
                  <td>{formatDate(voucher.endDate)}</td>
                  <td>
                    <span
                      className={`voucher-management__status ${
                        voucher.isActive
                          ? "voucher-management__status--active"
                          : "voucher-management__status--inactive"
                      }`}
                    >
                      {voucher.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="voucher-management__actions">
                    <button
                      className="voucher-management__action-button voucher-management__action-button--edit"
                      onClick={() => editVoucher(voucher)}
                    >
                      Edit
                    </button>
                    <button
                      className={`voucher-management__action-button ${
                        voucher.isActive
                          ? "voucher-management__action-button--deactivate"
                          : "voucher-management__action-button--activate"
                      }`}
                      onClick={() =>
                        toggleVoucherStatus(voucher._id, voucher.isActive)
                      }
                    >
                      {voucher.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="voucher-management__action-button voucher-management__action-button--delete"
                      onClick={() => deleteVoucher(voucher._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Voucher;
