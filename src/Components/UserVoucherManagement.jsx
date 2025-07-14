import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTicketAlt,
  faCheckCircle,
  faTimesCircle,
  faSearch,
  faPlus,
  faUser,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import "../styles/UserVoucherManagement.css";

const UserVoucherManagement = () => {
  const [users, setUsers] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, vouchersRes] = await Promise.all([
        axios.get("/api/auth"),
        axios.get("/api/vouchers/active"),
      ]);

      console.log("Users data:", usersRes.data);

      const usersWithVouchers = usersRes.data.map((user) => ({
        ...user,
        voucher_assigned: user.voucher_assigned || [],
      }));

      setUsers(usersWithVouchers);
      setVouchers(vouchersRes.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const assignVoucher = async () => {
    if (!selectedUser || !selectedVoucher) {
      alert("Please select both user and voucher");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`/api/auth/${selectedUser}/assign-voucher`, {
        voucherCode: selectedVoucher,
      });
      console.log("Voucher assigned:", selectedVoucher);
      alert(`Voucher ${selectedVoucher} assigned to user successfully!`);

      await fetchData();
      alert("Voucher assigned successfully!");
      setSelectedVoucher("");
    } catch (err) {
      console.error("Error assigning voucher:", err);
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };
  // eslint-disable-next-line
  const markAsUsed = async (userId, voucherId) => {
    if (
      !window.confirm("Are you sure you want to mark this voucher as used?")
    ) {
      return;
    }
    try {
      setLoading(true);
      await axios.put(`/api/auth/${userId}/use-voucher/${voucherId}`);
      await fetchData();
      alert("Voucher marked as used!");
    } catch (err) {
      console.error("Error marking voucher as used:", err);
      alert(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <FontAwesomeIcon icon={faArrowUp} className="sort-icon" />
    ) : (
      <FontAwesomeIcon icon={faArrowDown} className="sort-icon" />
    );
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.voucher_assigned &&
        user.voucher_assigned.some((v) =>
          v.voucherName.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="voucher-management">
      <div className="header">
        <h1>
          <FontAwesomeIcon icon={faTicketAlt} /> User Voucher Management
        </h1>
        <p>Assign and manage user vouchers</p>
      </div>

      <div className="controls">
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="assignment-section">
          <div className="user-selection">
            <label>Select User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div className="voucher-selection">
            <label>Select Voucher:</label>
            <select
              value={selectedVoucher}
              onChange={(e) => setSelectedVoucher(e.target.value)}
              disabled={!selectedUser || loading}
            >
              <option value="">Select a voucher</option>
              {vouchers.map((voucher) => (
                <option key={voucher._id} value={voucher.code}>
                  {voucher.code} - {voucher.description}
                </option>
              ))}
            </select>

            <button
              onClick={assignVoucher}
              disabled={!selectedVoucher || loading}
              className="assign-btn"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlus} /> Assign Voucher
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="users-container">
        <h2>
          <FontAwesomeIcon icon={faUser} /> Users List
        </h2>
        {filteredUsers.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("name")}>
                  Name {getSortIcon("name")}
                </th>
                <th onClick={() => requestSort("email")}>
                  Email {getSortIcon("email")}
                </th>
                <th>Role</th>
                <th>Assigned Vouchers</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="role-cell">{user.role}</td>
                  <td>
                    {user.voucher_assigned &&
                    user.voucher_assigned.length > 0 ? (
                      <div className="vouchers-list">
                        {user.voucher_assigned.map((voucher) => (
                          <div key={voucher.voucherId} className="voucher-item">
                            <div className="voucher-info">
                              <span className="voucher-code">
                                {voucher.voucherName}
                              </span>
                              {voucher.description && (
                                <span className="voucher-desc">
                                  {voucher.description}
                                </span>
                              )}
                            </div>
                            <span className="voucher-status">
                              {voucher.used ? (
                                <span className="status used">
                                  <FontAwesomeIcon icon={faTimesCircle} /> Used
                                </span>
                              ) : (
                                <span className="status active">
                                  <FontAwesomeIcon icon={faCheckCircle} />{" "}
                                  Active
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="no-vouchers">No vouchers assigned</span>
                    )}
                  </td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-users">
            <FontAwesomeIcon icon={faUser} size="3x" />
            <p>No users found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVoucherManagement;
