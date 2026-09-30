import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Clock,
  Settings,
  Bell,
  ExternalLink,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { adminService } from "../../services";
import { AdminNotification } from "../../types";
import "./AdminLayout.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
      return;
    }
    adminService.getNotifications()
      .then(res => setNotifications(res))
      .catch(err => console.warn("Failed to load admin notifications", err));
  }, [isAdmin, navigate]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminService.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.warn("Could not mark as read", err);
    }
  };

  const navItems = [
    { label: "Dashboard & Analytics", icon: LayoutDashboard, path: "/admin" },
    { label: "Orders Management", icon: ShoppingBag, path: "/admin/orders" },
    { label: "Product Catalog", icon: Package, path: "/admin/products" },
    { label: "Inventory Radar", icon: Layers, path: "/admin/inventory" },
    { label: "Customer Directory", icon: Users, path: "/admin/customers" },
    { label: "Activity & Audit Log", icon: Clock, path: "/admin/activity" },
    { label: "Store Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="gf-admin-shell">
      {/* Top Navbar */}
      <header className="gf-admin-topbar">
        <div className="gf-admin-topbar-left">
          <button
            className="gf-admin-burger"
            onClick={() => setSidebarOpen(p => !p)}
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/admin" className="gf-admin-brand">
            <span className="gf-admin-brand-name">GLOW FACE</span>
            <span className="gf-admin-badge">ADMIN OPS</span>
          </Link>
        </div>

        <div className="gf-admin-topbar-right">
          {/* View storefront link */}
          <Link to="/" target="_blank" className="gf-admin-view-store">
            <span>Storefront</span>
            <ExternalLink size={14} />
          </Link>

          {/* Notification Bell */}
          <div className="gf-admin-notif-wrap">
            <button
              className="gf-admin-notif-btn"
              onClick={() => setNotifDropdownOpen(p => !p)}
              aria-label="Admin notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="gf-admin-notif-badge">{unreadCount}</span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="gf-admin-notif-dropdown">
                <div className="gf-admin-notif-header">
                  <strong>Operational Alerts</strong>
                  <span className="gf-admin-notif-sub">{unreadCount} unread</span>
                </div>
                <div className="gf-admin-notif-list">
                  {notifications.length === 0 ? (
                    <p className="gf-admin-notif-empty">No alerts right now</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`gf-admin-notif-item ${!n.read ? "unread" : ""}`}
                        onClick={() => {
                          if (!n.read) handleMarkAsRead(n.id);
                          if (n.link) navigate(n.link);
                          setNotifDropdownOpen(false);
                        }}
                      >
                        <div className="gf-admin-notif-item-top">
                          <span className="gf-admin-notif-title">{n.title}</span>
                          <span className="gf-admin-notif-time">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="gf-admin-notif-msg">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin User info & logout */}
          <div className="gf-admin-user-info">
            <span className="gf-admin-user-name">{user?.name || "Administrator"}</span>
            <button className="gf-admin-logout-btn" onClick={logout} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="gf-admin-body">
        {/* Sidebar */}
        <aside className={`gf-admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="gf-admin-sidebar-nav">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`gf-admin-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="gf-admin-sidebar-footer">
            <p className="gf-admin-version">Glow Face v2.0 • Production Engine</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="gf-admin-main">
          {children}
        </main>
      </div>
    </div>
  );
};