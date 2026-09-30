import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight, Eye } from "lucide-react";
import { orderService } from "../../services/orderService";
import { Order } from "../../types";
import "./AdminOrders.css";

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAdminOrders({
      search: search || undefined,
      status: status || undefined,
      paymentStatus: paymentStatus || undefined,
      page,
      limit: 15
    })
      .then(res => {
        setOrders(res.orders);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch(err => console.warn("Failed to load admin orders", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, paymentStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  return (
    <div className="gf-ad-orders-page">
      <div className="gf-ad-page-head">
        <div>
          <h1 className="gf-ad-title">Order Management</h1>
          <p className="gf-ad-sub">Inspect, filter, verify payments, and process customer fulfillment.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="gf-ad-filters-bar">
        <form onSubmit={handleSearchSubmit} className="gf-ad-search-box">
          <Search size={16} className="gf-ad-search-icon" />
          <input
            type="text"
            placeholder="Search order #, customer, email, phone, tracking..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="gf-ad-filter-selects">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Order Statuses</option>
            <option value="PAID">Paid / Ready</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
          </select>

          <select value={paymentStatus} onChange={e => { setPaymentStatus(e.target.value); setPage(1); }}>
            <option value="">All Payments</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="FAILED">Failed Only</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="gf-ad-table-card">
        <div className="gf-ad-table-head">
          <span>Order #</span>
          <span>Date</span>
          <span>Customer</span>
          <span>Payment</span>
          <span>Fulfillment Status</span>
          <span>Total</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          <div className="gf-ad-table-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="gf-ad-table-empty">No orders found matching the filter criteria.</div>
        ) : (
          <div className="gf-ad-table-body">
            {orders.map(order => (
              <div key={order.id} className="gf-ad-table-row">
                <div className="gf-ad-cell-id">
                  <strong>#{order.orderNumber || order.id}</strong>
                  {order.trackingNumber && <small>Track: {order.trackingNumber}</small>}
                </div>

                <div className="gf-ad-cell-date">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <small>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>

                <div className="gf-ad-cell-cust">
                  <strong>{order.customerName}</strong>
                  <small>{order.customerPhone} • {order.customerEmail}</small>
                </div>

                <div>
                  <span className={`gf-ad-status-pill ${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div>
                  <span className={`gf-ad-status-pill ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div>
                  <strong className="gf-ad-order-total-price">₹{order.totalAmount}</strong>
                </div>

                <div style={{ textAlign: "right" }}>
                  <Link to={`/admin/orders/${order.id}`} className="gf-ad-row-btn">
                    <Eye size={15} />
                    <span>Manage</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="gf-ad-pagination">
            <span>Showing page {page} of {totalPages} ({total} orders)</span>
            <div className="gf-ad-pagination-btns">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};