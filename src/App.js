// App.jsx
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import p9video from "./images/p9.mp4";

// Components
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Components/Home";
import Log from "./Components/Log";
import About from "./Components/About";
import Signup from "./Components/Signup";
import Terms from "./Components/Terms";
import Privacy from "./Components/Privacy";
import ChatWindow from "./Components/ChatWindow";
import SideBar from "./Components/SideBar";
import Contact from "./Components/Contact";
import Review from "./Components/Review";
import Products from "./Components/Products";
import Carts from "./Components/Cart";
import Checkout from "./Components/Checkout";
import Profile from "./Components/Profile";

// Admin Components
import Admin from "./Components/Admin";
import Analytics from "./Components/Analytics";
import ProductManagement from "./Components/ProductManagement";
import Voucher from "./Components/Voucher";
import UserManagement from "./Components/UserManagement";
import AdminLayout from "./Components/AdminLayout";
import UserVoucherManagement from "./Components/UserVoucherManagement";

// Main App Content
function AppContent() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [showLayout, setShowLayout] = useState(true);

  // Preload video (optional)
  useEffect(() => {
    const video = document.createElement("video");
    video.src = p9video;
    video.load();
  }, []);

  // Show/hide Navbar/Footer based on route
  useEffect(() => {
    setShowLayout(!location.pathname.startsWith("/admin"));
  }, [location]);

  return (
    <>
      {showLayout && <Navbar title="MediKart" cartCount={cartCount} />}

      <div className="container my-3">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/log" element={<Log />} />
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/chatwindow" element={<ChatWindow />} />
          <Route path="/sidebar" element={<SideBar />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Carts />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/review" element={<Review />} />
          <Route
            path="/category/:category"
            element={
              <Products onAddToCart={() => setCartCount((prev) => prev + 1)} />
            }
          />
          <Route
            path="/products"
            element={
              <Products onAddToCart={() => setCartCount((prev) => prev + 1)} />
            }
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="/products/wellness" element={<Products />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Admin />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="productmanagement" element={<ProductManagement />} />
            <Route path="voucher" element={<Voucher />} />
            <Route path="usermanagement" element={<UserManagement />} />
            <Route
              path="uservouchermanagement"
              element={<UserVoucherManagement />}
            />
          </Route>
        </Routes>
      </div>

      {showLayout && <Footer title="MediKart" />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
