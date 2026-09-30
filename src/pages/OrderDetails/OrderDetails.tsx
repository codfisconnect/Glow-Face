import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Truck, Package, Clock, ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { orderService } from "../../services/orderService";
import { Order } from "../../types";
import "./OrderDetails.css";

const TIMELINE_STEPS = [
  { key: "PENDING_PAYMENT", label: "Payment Initiated" },
  { key: "PAID", label: "Payment Verified" },
  { key: "PROCESSING", label: "Preparing Order" },
  { key: "PACKED", label: "Packed in Kerala Grove" },
  { key: "SHIPPED", label: "Dispatched / In Transit" },
  { key: "DELIVERED", label: "Delivered to Doorstep" }
];

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderService.getOrder(id)
      .then(res => setOrder(res))
      .catch(err => console.warn("Failed to load order details", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="gf-container gf-tracking-loading">
        <p>Loading live tracking timeline...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="gf-container gf-tracking-notfound">
        <h2>Order Not Found</h2>
        <p>We could not find an order matching that identifier.</p>
        <Link to="/orders" className="gf-hero-btn-primary">View All Orders</Link>
      </div>
    );
  }

  // Calculate timeline index
  const statusRank: Record<string, number> = {
    PENDING_PAYMENT: 0,
    PAID: 1,
    PROCESSING: 2,
    PACKED: 3,
    SHIPPED: 4,
    OUT_FOR_DELIVERY: 4,
    DELIVERED: 5
  };

  const currentRank = statusRank[order.orderStatus] ?? 1;

  const shippingAddr = typeof order.shippingAddress === "string"
    ? JSON.parse(order.shippingAddress || "{}")
    : (order.shippingAddress || {});

  return (
    <div className="gf-tracking-page">
      <div className="gf-container">
        <Link to="/orders" className="gf-back-link">
          <ArrowLeft size={16} />
          <span>Back to Order History</span>
        </Link>

        {/* Top Info Banner */}
        <div className="gf-tracking-hero">
          <div className="gf-tracking-hero-left">
            <span className="gf-tracking-tag">Live Order Progress</span>
            <h1 className="gf-tracking-number">Order #{order.orderNumber || order.id}</h1>
            <p className="gf-tracking-date">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short"
              })}
            </p>
          </div>

          <div className="gf-tracking-hero-right">
            <span className="gf-tracking-total-label">Total Paid:</span>
            <strong className="gf-tracking-total-amount">₹{order.totalAmount}</strong>
            <span className="gf-tracking-method">Razorpay Prepaid • {order.paymentStatus}</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="gf-tracking-card gf-timeline-card">
          <h3 className="gf-card-heading">Dispatch & Delivery Timeline</h3>

          <div className="gf-timeline-stepper">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = currentRank >= idx;
              const isCurrent = currentRank === idx;
              return (
                <div key={step.key} className={`gf-timeline-step ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
                  <div className="gf-step-dot-wrap">
                    <div className="gf-step-dot">
                      {isCompleted ? <CheckCircle size={16} /> : <span>{idx + 1}</span>}
                    </div>
                    {idx < TIMELINE_STEPS.length - 1 && <div className="gf-step-line" />}
                  </div>
                  <span className="gf-step-label">{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Courier Details */}
          {order.trackingNumber && (
            <div className="gf-carrier-info-bar">
              <Truck size={20} color="var(--green)" />
              <div>
                <strong>Courier Partner: {order.carrier || "Standard Express"}</strong>
                <p>Tracking Number: <strong>{order.trackingNumber}</strong></p>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Overview */}
        <div className="gf-tracking-grid">
          {/* Items */}
          <div className="gf-tracking-card">
            <h3 className="gf-card-heading">Products ({(order.items || []).length})</h3>
            <div className="gf-tracking-items">
              {(order.items || []).map(it => (
                <div key={it.id} className="gf-tracking-item-row">
                  <img src={it.productImage || "/assets/cream-hero.jpg"} alt={it.productName} />
                  <div className="gf-tracking-item-meta">
                    <strong>{it.productName}</strong>
                    <span>Qty: {it.quantity} × ₹{it.unitPrice}</span>
                  </div>
                  <strong>₹{it.subtotal}</strong>
                </div>
              ))}
            </div>

            <div className="gf-tracking-price-lines">
              <div className="gf-line"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="gf-line"><span>Shipping</span><span>{order.shippingAmount === 0 ? "FREE" : `₹${order.shippingAmount}`}</span></div>
              {order.discountAmount > 0 && (
                <div className="gf-line" style={{ color: "#2B8A3E" }}>
                  <span>Discount</span><span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="gf-line gf-grand"><span>Total Paid</span><strong>₹{order.totalAmount}</strong></div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="gf-tracking-card">
            <h3 className="gf-card-heading">Delivery Address</h3>
            <div className="gf-addr-content">
              <MapPin size={20} color="var(--green)" />
              <div>
                <strong>{shippingAddr.name || order.customerName}</strong>
                <p>{shippingAddr.address}</p>
                {shippingAddr.apt && <p>{shippingAddr.apt}</p>}
                <p>{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pin}</p>
                <p>Phone: {shippingAddr.phone || order.customerPhone}</p>
                <p>Email: {shippingAddr.email || order.customerEmail}</p>
              </div>
            </div>

            <div className="gf-tracking-support-box">
              <h4>Need help with this order?</h4>
              <p>Our customer care team is available via WhatsApp or email.</p>
              <a
                href={`https://wa.me/919845012345?text=Hi%20Glow%20Face%2C%20I%20have%20an%20inquiry%20regarding%20order%20%23${order.orderNumber || order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-support-btn"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};