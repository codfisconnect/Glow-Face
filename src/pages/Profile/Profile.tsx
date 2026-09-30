import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, ShoppingBag, Shield, LogOut, Package, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { orderService } from "../../services";
import { Order } from "../../types";
import "./Profile.css";

export const Profile: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    orderService.getCustomerOrders(user.email)
      .then(res => setRecentOrders(res.slice(0, 3)))
      .catch(err => console.warn("Failed to load profile orders", err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="gf-profile-page">
      <div className="gf-container">
        <div className="gf-profile-header">
          <div className="gf-profile-avatar">
            <User size={36} color="var(--green-dark)" />
          </div>
          <div>
            <h1 className="gf-profile-name">{user.name || "Customer"}</h1>
            <p className="gf-profile-email">{user.email}</p>
          </div>

          <div className="gf-profile-actions-top">
            {isAdmin && (
              <Link to="/admin" className="gf-admin-badge-link">
                <Shield size={16} />
                <span>Admin Operations</span>
              </Link>
            )}
            <button className="gf-profile-logout" onClick={() => { logout(); navigate("/"); }}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="gf-profile-grid">
          {/* Account Details Box */}
          <div className="gf-profile-card">
            <h3 className="gf-profile-card-title">Account Details</h3>
            <div className="gf-profile-info-list">
              <div className="gf-info-item">
                <Mail size={16} color="var(--text-light)" />
                <div>
                  <small>Email</small>
                  <strong>{user.email}</strong>
                </div>
              </div>
              <div className="gf-info-item">
                <Phone size={16} color="var(--text-light)" />
                <div>
                  <small>Phone</small>
                  <strong>{user.phone || "Not added"}</strong>
                </div>
              </div>
              <div className="gf-info-item">
                <Shield size={16} color="var(--text-light)" />
                <div>
                  <small>Account Role</small>
                  <strong>{user.role}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Box */}
          <div className="gf-profile-card">
            <div className="gf-profile-card-top-row">
              <h3 className="gf-profile-card-title">Recent Orders</h3>
              <Link to="/orders" className="gf-view-all-link">View All</Link>
            </div>

            {loading ? (
              <p className="gf-loading-text">Loading recent orders...</p>
            ) : recentOrders.length === 0 ? (
              <div className="gf-profile-no-orders">
                <Package size={32} color="var(--green-sage)" />
                <p>You have not placed any orders yet.</p>
                <Link to="/shop" className="gf-outline-btn">Explore Skincare</Link>
              </div>
            ) : (
              <div className="gf-profile-orders-list">
                {recentOrders.map(ord => (
                  <div key={ord.id} className="gf-profile-order-item">
                    <div>
                      <strong>Order #{ord.orderNumber || ord.id}</strong>
                      <span>{new Date(ord.createdAt).toLocaleDateString()} • ₹{ord.totalAmount}</span>
                    </div>
                    <Link to={`/orders/${ord.id}`} className="gf-order-link-btn">
                      <span>Track</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};