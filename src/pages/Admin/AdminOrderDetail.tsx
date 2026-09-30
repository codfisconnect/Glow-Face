import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Truck, CheckCircle, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { orderService } from "../../services";
import { Order, OrderStatus } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import "./AdminOrderDetail.css";

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states
  const [status, setStatus] = useState<OrderStatus>("PAID");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");

  const loadOrder = () => {
    if (!id) return;
    setLoading(true);
    orderService.getAdminOrderDetail(id)
      .then(res => {
        setOrder(res);
        setStatus(res.orderStatus);
        setCarrier(res.carrier || "Delhivery");
        setTrackingNumber(res.trackingNumber || "");
        setNotes(res.notes || "");
      })
      .catch(err => console.warn("Failed to load order", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(id, {
        orderStatus: status,
        carrier,
        trackingNumber,
        notes
      });
      setOrder(updated);
      showToast(`Order status updated to ${status}. Customer notifications triggered.`);
    } catch (err: any) {
      showToast(err.message || "Failed to update order status", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="gf-ad-page">
        <p>Loading order details...</p>
      </div>
    );
  }

  const shippingAddr = typeof order.shippingAddress === "string"
    ? JSON.parse(order.shippingAddress || "{}")
    : (order.shippingAddress || {});

  return (
    <div className="gf-ad-detail-page">
      <Link to="/admin/orders" className="gf-ad-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Orders List</span>
      </Link>

      <div className="gf-ad-detail-header">
        <div>
          <span className="gf-ad-detail-tag">Order Management</span>
          <h1 className="gf-ad-detail-title">#{order.orderNumber || order.id}</h1>
          <p className="gf-ad-detail-time">
            Created on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="gf-ad-detail-badges">
          <span className={`gf-ad-status-pill ${order.paymentStatus.toLowerCase()}`}>
            Payment: {order.paymentStatus}
          </span>
          <span className={`gf-ad-status-pill ${order.orderStatus.toLowerCase()}`}>
            Fulfillment: {order.orderStatus}
          </span>
        </div>
      </div>

      <div className="gf-ad-detail-grid">
        {/* Left Column: Update Order Form & Order Items */}
        <div className="gf-ad-detail-left">
          {/* Status & Fulfillment Controller */}
          <div className="gf-ad-card">
            <h3 className="gf-ad-card-title">Fulfillment & Notification Dispatch</h3>
            <form onSubmit={handleUpdateStatus} className="gf-ad-status-form">
              <div className="gf-form-row gf-form-row-2">
                <div className="gf-field">
                  <label>Order Status (Triggers Email & WhatsApp)</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as OrderStatus)}
                  >
                    <option value="PAID">PAID (Order Confirmed)</option>
                    <option value="PROCESSING">PROCESSING (Processing Order)</option>
                    <option value="PACKED">PACKED (Ready for Pickup)</option>
                    <option value="SHIPPED">SHIPPED (In Transit with Tracking)</option>
                    <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="PAYMENT_FAILED">PAYMENT FAILED</option>
                  </select>
                </div>

                <div className="gf-field">
                  <label>Courier Carrier</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    placeholder="Delhivery / BlueDart / ExpressBees"
                  />
                </div>
              </div>

              <div className="gf-form-row gf-form-row-2">
                <div className="gf-field">
                  <label>Waybill / Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. DEL-982194819"
                  />
                </div>

                <div className="gf-field">
                  <label>Internal Operational Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Special packaging or customer instructions"
                  />
                </div>
              </div>

              <button type="submit" className="gf-ad-update-save-btn" disabled={updating}>
                <Save size={16} />
                <span>{updating ? "Updating & Dispatching..." : "Update Status & Send Notifications"}</span>
              </button>
            </form>
          </div>

          {/* Ordered Products Table */}
          <div className="gf-ad-card">
            <h3 className="gf-ad-card-title">Order Line Items ({(order.items || []).length})</h3>
            <div className="gf-ad-items-table">
              {(order.items || []).map(it => (
                <div key={it.id} className="gf-ad-item-row">
                  <img src={it.productImage || "/assets/cream-hero.jpg"} alt={it.productName} />
                  <div className="gf-ad-item-details">
                    <strong>{it.productName}</strong>
                    <span>Product ID: {it.productId}</span>
                  </div>
                  <div className="gf-ad-item-math">
                    <span>Qty: {it.quantity}</span>
                    <span>× ₹{it.unitPrice}</span>
                    <strong>= ₹{it.subtotal}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="gf-ad-totals-summary">
              <div className="gf-ad-total-line"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
              <div className="gf-ad-total-line"><span>Shipping</span><span>₹{order.shippingAmount}</span></div>
              {order.discountAmount > 0 && (
                <div className="gf-ad-total-line" style={{ color: "#2B8A3E" }}>
                  <span>Discount ({order.couponCode || "COUPON"})</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div className="gf-ad-total-line gf-ad-total-grand">
                <span>Grand Total</span>
                <strong>₹{order.totalAmount}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer & Payment Details */}
        <div className="gf-ad-detail-right">
          {/* Customer Card */}
          <div className="gf-ad-card">
            <h3 className="gf-ad-card-title">Customer Contact</h3>
            <div className="gf-ad-cust-info-lines">
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Phone:</strong> {order.customerPhone}</p>
              <p><strong>Account ID:</strong> {order.userId || "Guest Checkout"}</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="gf-ad-card">
            <h3 className="gf-ad-card-title">Delivery Address</h3>
            <div className="gf-ad-cust-info-lines">
              <p><strong>Address:</strong> {shippingAddr.address}</p>
              {shippingAddr.apt && <p><strong>Apartment:</strong> {shippingAddr.apt}</p>}
              <p><strong>City / State:</strong> {shippingAddr.city}, {shippingAddr.state}</p>
              <p><strong>PIN Code:</strong> {shippingAddr.pin}</p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="gf-ad-card">
            <h3 className="gf-ad-card-title">Gateway Verification</h3>
            <div className="gf-ad-cust-info-lines">
              <p><strong>Gateway:</strong> Razorpay Prepaid Online</p>
              <p><strong>Razorpay Order ID:</strong> {order.razorpayOrderId || "N/A"}</p>
              <p><strong>Payment ID:</strong> {order.razorpayPaymentId || "N/A"}</p>
              <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
              <p><strong>Paid At:</strong> {order.paidAt ? new Date(order.paidAt).toLocaleString() : "Pending"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};