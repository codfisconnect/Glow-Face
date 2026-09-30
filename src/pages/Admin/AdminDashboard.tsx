import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Users,
  ArrowRight,
  Package,
  Calendar,
  CreditCard,
  Truck
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { DashboardMetrics } from "../../types";
import "./AdminDashboard.css";

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminService.getDashboardMetrics(range)
      .then(res => setMetrics(res))
      .catch(err => console.warn("Failed to load dashboard metrics", err))
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <div className="gf-ad-page">
      {/* Header */}
      <div className="gf-ad-header">
        <div>
          <h1 className="gf-ad-title">Operational Control Center</h1>
          <p className="gf-ad-sub">Real-time business performance, orders processing radar, and store health.</p>
        </div>

        {/* Date Filter */}
        <div className="gf-ad-date-filter">
          <Calendar size={16} />
          <select value={range} onChange={e => setRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {loading || !metrics ? (
        <div className="gf-ad-skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="gf-ad-stat-skel" />
          ))}
        </div>
      ) : (
        <>
          {/* 4 Stat Cards */}
          <div className="gf-ad-stats-grid">
            {/* 1. Revenue */}
            <div className="gf-ad-stat-card">
              <div className="gf-stat-top">
                <span className="gf-stat-label">Total Revenue</span>
                <div className="gf-stat-icon-wrap" style={{ background: "#EBFBEE", color: "#2B8A3E" }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="gf-stat-value">₹{metrics.revenue.totalRevenue.toLocaleString()}</div>
              <div className="gf-stat-bottom">
                <span>Today: <strong>₹{metrics.revenue.todayRevenue}</strong></span>
                <span>•</span>
                <span>AOV: <strong>₹{metrics.revenue.averageOrderValue}</strong></span>
              </div>
            </div>

            {/* 2. Orders */}
            <div className="gf-ad-stat-card">
              <div className="gf-stat-top">
                <span className="gf-stat-label">Total Orders</span>
                <div className="gf-stat-icon-wrap" style={{ background: "#E7F5FF", color: "#1971C2" }}>
                  <ShoppingBag size={20} />
                </div>
              </div>
              <div className="gf-stat-value">{metrics.orders.totalOrders}</div>
              <div className="gf-stat-bottom">
                <span>Today: <strong>{metrics.orders.todayOrders}</strong> orders</span>
                <span>•</span>
                <span>Processing: <strong>{metrics.orders.statusCounts.PROCESSING || 0}</strong></span>
              </div>
            </div>

            {/* 3. Inventory Radar */}
            <div className="gf-ad-stat-card">
              <div className="gf-stat-top">
                <span className="gf-stat-label">Inventory Health</span>
                <div className="gf-stat-icon-wrap" style={{ background: "#FFF4E6", color: "#D9480F" }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="gf-stat-value">{metrics.inventory.inStockCount} <small style={{ fontSize: "1rem", color: "#868e96" }}>in stock</small></div>
              <div className="gf-stat-bottom">
                <span style={{ color: "#D9480F" }}>Low: <strong>{metrics.inventory.lowStockCount}</strong></span>
                <span>•</span>
                <span style={{ color: "#C92A2A" }}>Out: <strong>{metrics.inventory.outOfStockCount}</strong></span>
              </div>
            </div>

            {/* 4. Customers */}
            <div className="gf-ad-stat-card">
              <div className="gf-stat-top">
                <span className="gf-stat-label">Total Customers</span>
                <div className="gf-stat-icon-wrap" style={{ background: "#F3F0FF", color: "#7950F2" }}>
                  <Users size={20} />
                </div>
              </div>
              <div className="gf-stat-value">{metrics.customers.totalCustomers}</div>
              <div className="gf-stat-bottom">
                <span>Registered customer accounts</span>
              </div>
            </div>
          </div>

          {/* Operational Workflow Status Blocks */}
          <div className="gf-ad-pipeline">
            <h3 className="gf-ad-section-title">Order Fulfillment Pipeline</h3>
            <div className="gf-pipeline-grid">
              <div className="gf-pipeline-box">
                <CreditCard size={18} color="var(--gold-dark)" />
                <div>
                  <strong>{metrics.orders.statusCounts.PAID || 0}</strong>
                  <span>Paid / Needs Packing</span>
                </div>
              </div>

              <div className="gf-pipeline-box">
                <Package size={18} color="#1971C2" />
                <div>
                  <strong>{metrics.orders.statusCounts.PROCESSING || 0}</strong>
                  <span>In Processing</span>
                </div>
              </div>

              <div className="gf-pipeline-box">
                <Truck size={18} color="#2B8A3E" />
                <div>
                  <strong>{metrics.orders.statusCounts.SHIPPED || 0}</strong>
                  <span>Dispatched / In Transit</span>
                </div>
              </div>

              <div className="gf-pipeline-box">
                <ShoppingBag size={18} color="#2B8A3E" />
                <div>
                  <strong>{metrics.orders.statusCounts.DELIVERED || 0}</strong>
                  <span>Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column: Recent Orders & Top Selling Products */}
          <div className="gf-ad-dual-grid">
            {/* Recent Orders Table */}
            <div className="gf-ad-panel">
              <div className="gf-ad-panel-head">
                <h3>Recent Prepaid Orders</h3>
                <Link to="/admin/orders" className="gf-ad-panel-link">Manage All Orders →</Link>
              </div>

              <div className="gf-ad-orders-table">
                {metrics.recentOrders.length === 0 ? (
                  <p className="gf-ad-empty">No orders found in this date range.</p>
                ) : (
                  metrics.recentOrders.map(o => (
                    <div key={o.id} className="gf-ad-order-row">
                      <div className="gf-ad-order-cell-id">
                        <Link to={`/admin/orders/${o.id}`}>#{o.orderNumber || o.id}</Link>
                        <span>{o.customerName}</span>
                      </div>
                      <div className="gf-ad-order-cell-status">
                        <span className={`gf-ad-pill ${o.orderStatus.toLowerCase()}`}>{o.orderStatus}</span>
                      </div>
                      <div className="gf-ad-order-cell-amount">
                        <strong>₹{o.totalAmount}</strong>
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="gf-ad-panel">
              <div className="gf-ad-panel-head">
                <h3>Top Performing Formulations</h3>
                <Link to="/admin/products" className="gf-ad-panel-link">Catalog →</Link>
              </div>

              <div className="gf-ad-top-products">
                {metrics.topProducts.length === 0 ? (
                  <p className="gf-ad-empty">No sales records in this date range.</p>
                ) : (
                  metrics.topProducts.map((p, idx) => (
                    <div key={idx} className="gf-ad-top-prod-row">
                      <span className="gf-ad-prod-rank">0{idx + 1}</span>
                      <div className="gf-ad-prod-info">
                        <strong>{p.name}</strong>
                        <span>{p.quantity} units sold</span>
                      </div>
                      <strong className="gf-ad-prod-rev">₹{p.revenue.toLocaleString()}</strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};