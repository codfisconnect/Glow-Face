import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Layout components
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AnnouncementBar } from "../components/layout/AnnouncementBar";
import { CartDrawer } from "../components/cart/CartDrawer";
import { AdminLayout } from "../components/layout/AdminLayout";

// Customer Pages
import { Home } from "../pages/Home/Home";
import { Shop } from "../pages/Shop/Shop";
import { Category } from "../pages/Category/Category";
import { ProductDetails } from "../pages/ProductDetails/ProductDetails";
import { Cart } from "../pages/Cart/Cart";
import { Checkout } from "../pages/Checkout/Checkout";
import { PaymentSuccess } from "../pages/PaymentSuccess/PaymentSuccess";
import { Orders } from "../pages/Orders/Orders";
import { OrderDetails } from "../pages/OrderDetails/OrderDetails";
import { Wishlist } from "../pages/Wishlist/Wishlist";
import { Login } from "../pages/Auth/Login";
import { Register } from "../pages/Auth/Register";
import { Profile } from "../pages/Profile/Profile";
import { About } from "../pages/About/About";
import { Contact } from "../pages/Contact/Contact";
import { Shipping, Returns, Privacy, Terms } from "../pages/Policies/Policies";

// Admin Pages
import { AdminDashboard } from "../pages/Admin/AdminDashboard";
import { AdminOrders } from "../pages/Admin/AdminOrders";
import { AdminOrderDetail } from "../pages/Admin/AdminOrderDetail";
import { AdminProducts } from "../pages/Admin/AdminProducts";
import { AdminInventory } from "../pages/Admin/AdminInventory";
import { AdminCustomers } from "../pages/Admin/AdminCustomers";
import { AdminActivity } from "../pages/Admin/AdminActivity";
import { AdminSettings } from "../pages/Admin/AdminSettings";

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Customer Shell Layout
const CustomerLayout: React.FC = () => {
  return (
    <div className="gf-storefront-shell">
      <AnnouncementBar />
      <Header />
      <main className="gf-storefront-content">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

// Protected Admin Route wrapper
const ProtectedAdminRoute: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0f172a",
        color: "#f8fafc"
      }}>
        <div className="gf-spinner" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

// Protected Customer Route wrapper
const ProtectedCustomerRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <div className="gf-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
};

export const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Customer Experience Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:orderId" element={<PaymentSuccess />} />
          <Route path="/payment/success/:orderId" element={<PaymentSuccess />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedCustomerRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Protected Operations Admin Routes */}
        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};
