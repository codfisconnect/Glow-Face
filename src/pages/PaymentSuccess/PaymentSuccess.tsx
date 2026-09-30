import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, Package, MapPin, ArrowRight, Printer, MessageCircle } from "lucide-react";
import { orderService } from "../../services/orderService";
import { Order } from "../../types";
import "./PaymentSuccess.css";

export const PaymentSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    orderService.getOrder(orderId)
      .then(res => setOrder(res))
      .catch(err => console.warn("Failed to load order confirmation", err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="gf-container gf-success-loading">
        <p>Loading order confirmation details...</p>
      </div>
    );
  }

  const shippingAddr = typeof order?.shippingAddress === "string"
    ? JSON.parse(order.shippingAddress || "{}")
    : (order?.shippingAddress || {});

  return (
    <div className="gf-success-page">
      <div className="gf-container gf-success-container">
        {/* Animated Confirmation Badge */}
        <div className="gf-success-hero">
          <div className="gf-success-icon-wrap">
            <CheckCircle2 size={64} color="var(--green)" />
          </div>
          <span className="gf-success-tag">Payment Verified & Order Confirmed</span>
          <h1 className="gf-success-title">Thank You, {order?.customerName}!</h1>
          <p className="gf-success-sub">
            Your payment of <strong>₹{order?.totalAmount}</strong> was successfully received. We have sent your confirmation invoice to <strong>{order?.customerEmail}</strong> and WhatsApp dispatch alerts will be delivered to <strong>{order?.customerPhone}</strong>.
          </p>

          <div className="gf-order-id-badge">
            <span>Order Number:</span>
            <strong>{order?.orderNumber || order?.id}</strong>
          </div>
        </div>

        <div className="gf-success-grid">
          {/* Order Details Column */}
          <div className="gf-success-card">
            <h3 className="gf-card-title">Delivery Information</h3>
            <div className="gf-success-info-block">
              <MapPin size={20} color="var(--green)" />
              <div>
                <strong>{shippingAddr.name || order?.customerName}</strong>
                <p>{shippingAddr.address}</p>
                {shippingAddr.apt && <p>{shippingAddr.apt}</p>}
                <p>{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pin}</p>
                <p>Phone: {shippingAddr.phone || order?.customerPhone}</p>
              </div>
            </div>

            <div className="gf-success-status-preview">
              <Package size={20} color="var(--green)" />
              <div>
                <strong>Estimated Delivery:</strong>
                <p>3 - 5 business days via Express Priority Courier.</p>
              </div>
            </div>
          </div>

          {/* Items Summary Column */}
          <div className="gf-success-card">
            <h3 className="gf-card-title">Items Ordered ({(order?.items || []).length})</h3>
            <div className="gf-success-items-list">
              {(order?.items || []).map(item => (
                <div key={item.id} className="gf-success-item-row">
                  <img src={item.productImage || "/assets/cream-hero.jpg"} alt={item.productName} />
                  <div className="gf-success-item-info">
                    <span className="gf-success-item-name">{item.productName}</span>
                    <span className="gf-success-item-meta">Qty: {item.quantity} × ₹{item.unitPrice}</span>
                  </div>
                  <strong className="gf-success-item-total">₹{item.subtotal}</strong>
                </div>
              ))}
            </div>

            <div className="gf-success-total-breakdown">
              <div className="gf-breakdown-row">
                <span>Subtotal</span>
                <span>₹{order?.subtotal}</span>
              </div>
              <div className="gf-breakdown-row">
                <span>Shipping</span>
                <span>{order?.shippingAmount === 0 ? "FREE" : `₹${order?.shippingAmount}`}</span>
              </div>
              {order?.discountAmount && order.discountAmount > 0 ? (
                <div className="gf-breakdown-row" style={{ color: "#2B8A3E" }}>
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              ) : null}
              <div className="gf-breakdown-row gf-breakdown-grand">
                <span>Paid via Razorpay</span>
                <strong>₹{order?.totalAmount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="gf-success-actions">
          <Link to={`/order/${order?.id}`} className="gf-hero-btn-primary">
            <span>Track Order Status</span>
            <ArrowRight size={18} />
          </Link>
          <button className="gf-print-btn" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
          <Link to="/shop" className="gf-continue-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};