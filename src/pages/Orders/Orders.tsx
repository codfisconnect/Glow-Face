import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, Search, ChevronRight, Clock, AlertCircle } from "lucide-react";
import { orderService } from "../../services/orderService";
import { useAuth } from "../../context/AuthContext";
import { Order } from "../../types";
import "./Orders.css";

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [lookupEmail, setLookupEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchOrders = (email: string) => {
    if (!email) return;
    setLoading(true);
    setHasSearched(true);
    orderService.getCustomerOrders(email)
      .then(res => setOrders(res))
      .catch(err => console.warn("Failed to load orders", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.email) {
      fetchOrders(user.email);
    }
  }, [user]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(lookupEmail.trim());
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "DELIVERED") return <span className="gf-status-badge delivered">Delivered</span>;
    if (s === "SHIPPED") return <span className="gf-status-badge shipped">In Transit</span>;
    if (s === "PAID" || s === "PROCESSING" || s === "PACKED") return <span className="gf-status-badge processing">Preparing</span>;
    if (s === "CANCELLED" || s === "PAYMENT_FAILED") return <span className="gf-status-badge failed">Cancelled</span>;
    return <span className="gf-status-badge pending">Pending</span>;
  };

  return (
    <div className="gf-orders-page">
      <div className="gf-container">
        <div className="gf-orders-header">
          <span className="gf-orders-sub">Order Central</span>
          <h1 className="gf-orders-title">MY ORDERS & LIVE TRACKING</h1>
          <p className="gf-orders-desc">
            Monitor the dispatch progress, carrier tracking, and history of all your Glow Face botanical skincare orders.
          </p>
        </div>

        {/* Lookup Bar (if guest or wanting to search another email) */}
        <form onSubmit={handleLookup} className="gf-orders-lookup-bar">
          <input
            type="email"
            placeholder="Enter order email address to search..."
            value={lookupEmail}
            onChange={e => setLookupEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            <Search size={16} />
            <span>{loading ? "Searching..." : "Track Orders"}</span>
          </button>
        </form>

        {/* Orders List */}
        <div className="gf-orders-list-wrap">
          {loading ? (
            <div className="gf-orders-skeleton">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="gf-order-card-skel" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            hasSearched ? (
              <div className="gf-orders-empty">
                <Package size={48} color="var(--green-sage)" />
                <h3>No Orders Found</h3>
                <p>We could not find any orders associated with <strong>{lookupEmail}</strong>.</p>
                <Link to="/shop" className="gf-hero-btn-primary">Shop Now</Link>
              </div>
            ) : null
          ) : (
            <div className="gf-orders-cards">
              {orders.map(order => (
                <div key={order.id} className="gf-order-card">
                  <div className="gf-order-card-top">
                    <div className="gf-order-info-left">
                      <span className="gf-order-number">Order #{order.orderNumber || order.id}</span>
                      <span className="gf-order-date">
                        Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </div>

                    <div className="gf-order-info-right">
                      {getStatusBadge(order.orderStatus)}
                      <strong className="gf-order-amount">₹{order.totalAmount}</strong>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="gf-order-items-preview">
                    {(order.items || []).map(item => (
                      <div key={item.id} className="gf-order-item-thumb-row">
                        <img
                          src={item.productImage || "/assets/cream-hero.jpg"}
                          alt={item.productName}
                          className="gf-order-thumb"
                        />
                        <div className="gf-order-item-title-meta">
                          <strong>{item.productName}</strong>
                          <span>Qty: {item.quantity} • ₹{item.subtotal}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Action */}
                  <div className="gf-order-card-bottom">
                    {order.trackingNumber && (
                      <span className="gf-order-tracking-pill">
                        Carrier: <strong>{order.carrier || "Courier"}</strong> • Track No: <strong>{order.trackingNumber}</strong>
                      </span>
                    )}
                    <Link to={`/order/${order.id}`} className="gf-track-detail-btn">
                      <span>View Detailed Timeline</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};