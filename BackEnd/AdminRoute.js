import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "admin") {
      return <Navigate to="/home" replace />;
    }

    // Check token expiration
    if (Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem("authToken");
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem("authToken");
    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;
