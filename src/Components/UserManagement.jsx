import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faUserMd,
  faUser,
  faCheckCircle,
  faTimesCircle,
  faUsers,
  faSearch,
  faEllipsisVertical,
  faArrowUp,
  faArrowDown,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/UserManagement.css";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const usersPerPage = 10;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUsersWithOrderCounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/users-with-orders"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const usersData = await response.json();
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error(`Error fetching data: ${err.message}`);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithOrderCounts();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/users/${userId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setUsers(users.filter((user) => user._id !== userId));
          toast.success("User deleted successfully");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete user");
        }
      } catch (error) {
        toast.error(error.message);
        console.error("Delete error:", error);
      }
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? (
      <FontAwesomeIcon icon={faArrowUp} className="sortIcon" />
    ) : (
      <FontAwesomeIcon icon={faArrowDown} className="sortIcon" />
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

  const filteredUsers = sortedUsers.filter((user) => {
    if (user.role === "admin") return false;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || (user.status || "active") === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading)
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading users...</p>
      </div>
    );

  if (error)
    return (
      <div className="errorContainer">
        <p>Error: {error}</p>
        <button onClick={fetchUsersWithOrderCounts} className="retryBtn">
          Retry
        </button>
      </div>
    );

  return (
    <div className="userManagement">
      <div className="pageHeader">
        <h1>User Management</h1>
        <p>Manage customers and doctors</p>
      </div>

      <div className="statsContainer">
        <div className="statCard">
          <div className="statIcon">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="statInfo">
            <h3>Total Users</h3>
            <p>{users.length}</p>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">
            <FontAwesomeIcon icon={faUserMd} />
          </div>
          <div className="statInfo">
            <h3>Doctors</h3>
            <p>{users.filter((u) => u.role === "doctor").length}</p>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="statInfo">
            <h3>Customers</h3>
            <p>{users.filter((u) => u.role === "customer").length}</p>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div className="statInfo">
            <h3>Total Orders</h3>
            <p>
              {users.reduce((sum, user) => sum + (user.orderCount || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="dataSection">
        <div className="sectionHeader">
          <h2>All Users</h2>
          <div className="sectionActions">
            <div className="searchContainer">
              <FontAwesomeIcon icon={faSearch} className="searchIcon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filterSelect"
              >
                <option value="all">All Roles</option>
                <option value="doctor">Doctors</option>
                <option value="customer">Customers</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filterSelect"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button className="primaryBtn">
              <FontAwesomeIcon icon={faPlus} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        <div className="tableWrapper">
          <table className="dataTable">
            <thead className="tableHeader">
              <tr>
                <th
                  className={`tableHead sortable`}
                  onClick={() => requestSort("name")}
                >
                  <div className="headerContent">
                    Name
                    {getSortIcon("name")}
                  </div>
                </th>
                <th
                  className={`tableHead sortable`}
                  onClick={() => requestSort("email")}
                >
                  <div className="headerContent">
                    Email
                    {getSortIcon("email")}
                  </div>
                </th>
                {!isMobile && (
                  <th
                    className={`tableHead sortable`}
                    onClick={() => requestSort("role")}
                  >
                    <div className="headerContent">
                      Role
                      {getSortIcon("role")}
                    </div>
                  </th>
                )}
                <th
                  className={`tableHead sortable`}
                  onClick={() => requestSort("status")}
                >
                  <div className="headerContent">
                    Status
                    {getSortIcon("status")}
                  </div>
                </th>
                <th
                  className={`tableHead sortable`}
                  onClick={() => requestSort("orderCount")}
                >
                  <div className="headerContent">
                    Orders
                    {getSortIcon("orderCount")}
                  </div>
                </th>
                <th className="tableHead">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr key={user._id} className="tableRow">
                    <td className="tableCell">
                      <div className="userInfo">
                        <div className="userAvatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="userDetails">
                          <div className="userName">{user.name}</div>
                          {isMobile && (
                            <div className="userEmail">{user.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    {!isMobile && (
                      <td className="tableCell">
                        <div className="userEmail">{user.email}</div>
                      </td>
                    )}
                    {!isMobile && (
                      <td className="tableCell">
                        <span
                          className={`badge ${
                            user.role === "doctor"
                              ? "badgeDoctor"
                              : "badgeCustomer"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={user.role === "doctor" ? faUserMd : faUser}
                            className="roleIcon"
                          />
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                    )}
                    <td className="tableCell">
                      <span
                        className={`statusBadge ${
                          (user.status || "active") === "active"
                            ? "statusActive"
                            : "statusInactive"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={
                            (user.status || "active") === "active"
                              ? faCheckCircle
                              : faTimesCircle
                          }
                          className="statusIcon"
                        />
                        {(user.status || "active").charAt(0).toUpperCase() +
                          (user.status || "active").slice(1)}
                      </span>
                    </td>
                    <td className="tableCell">
                      <div className="orderCountCell">
                        <FontAwesomeIcon
                          icon={faShoppingCart}
                          className="orderIcon"
                        />
                        <span>{user.orderCount || 0}</span>
                      </div>
                    </td>
                    <td className="tableCell">
                      <div className="actionsContainer">
                        <div className="dropdown">
                          <button className="dropdownToggle">
                            <FontAwesomeIcon icon={faEllipsisVertical} />
                          </button>
                          <div className="dropdownMenu">
                            <button className="dropdownItem">
                              <FontAwesomeIcon icon={faEye} />
                              View Details
                            </button>
                            <button className="dropdownItem">
                              <FontAwesomeIcon icon={faEdit} />
                              Edit User
                            </button>
                            <button
                              className={`dropdownItem dropdownDanger`}
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="tableRow">
                  <td colSpan={isMobile ? 5 : 6} className="emptyState">
                    <div className="emptyContent">
                      <FontAwesomeIcon icon={faUsers} className="emptyIcon" />
                      <h3>No users found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredUsers.length > usersPerPage && (
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="pageBtn"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`pageBtn ${
                      currentPage === number ? "pageActive" : ""
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pageBtn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
