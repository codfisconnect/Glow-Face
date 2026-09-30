import React, { useState, useEffect } from "react";
import { Clock, Filter, Search, ShieldCheck, ShoppingBag, Layers, AlertCircle, RefreshCw } from "lucide-react";
import { adminService } from "../../services/adminService";
import "./AdminActivity.css";

interface Activity {
  id: string;
  adminId?: string;
  adminName?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export const AdminActivity: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [search, setSearch] = useState("");

  const loadActivities = () => {
    setLoading(true);
    adminService.getActivities()
      .then(res => setActivities(res))
      .catch(err => console.warn("Failed to load admin activities", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filtered = activities.filter(act => {
    if (filterAction && !act.action.includes(filterAction)) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchAct = act.action.toLowerCase().includes(q);
      const matchDet = act.details && act.details.toLowerCase().includes(q);
      const matchAdmin = act.adminName && act.adminName.toLowerCase().includes(q);
      if (!matchAct && !matchDet && !matchAdmin) return false;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("ORDER")) {
      return (
        <span className="gf-ad-act-badge badge-order">
          <ShoppingBag size={12} /> {action}
        </span>
      );
    }
    if (action.includes("STOCK") || action.includes("INVENTORY")) {
      return (
        <span className="gf-ad-act-badge badge-inventory">
          <Layers size={12} /> {action}
        </span>
      );
    }
    if (action.includes("LOGIN") || action.includes("AUTH")) {
      return (
        <span className="gf-ad-act-badge badge-auth">
          <ShieldCheck size={12} /> {action}
        </span>
      );
    }
    return (
      <span className="gf-ad-act-badge badge-general">
        <Clock size={12} /> {action}
      </span>
    );
  };

  return (
    <div className="gf-ad-act-page">
      <div className="gf-ad-page-head">
        <div>
          <h1 className="gf-ad-title">Activity & Audit Log</h1>
          <p className="gf-ad-sub">Immutable operational trail of store fulfillments, stock overrides, and admin events.</p>
        </div>
        <button className="gf-ad-act-refresh-btn" onClick={loadActivities} title="Refresh logs">
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="gf-ad-act-toolbar">
        <div className="gf-ad-act-search">
          <Search size={16} className="gf-ad-act-search-icon" />
          <input
            type="text"
            className="gf-ad-act-search-input"
            placeholder="Search action or details..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="gf-ad-act-filter-select">
          <Filter size={15} />
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)}>
            <option value="">All Action Types</option>
            <option value="ORDER">Order Actions</option>
            <option value="STOCK">Inventory & Stock</option>
            <option value="PRODUCT">Product Catalog</option>
            <option value="LOGIN">Auth & Sessions</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="gf-ad-act-card">
        {loading ? (
          <div className="gf-ad-act-loading">
            <div className="gf-spinner" />
            <p>Loading operational audit trail...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gf-ad-act-empty">
            <AlertCircle size={36} />
            <h3>No audit records found</h3>
            <p>Actions taken by admins will automatically appear here.</p>
          </div>
        ) : (
          <div className="gf-ad-act-list">
            {filtered.map(act => (
              <div key={act.id} className="gf-ad-act-item">
                <div className="gf-ad-act-item-left">
                  <div className="gf-ad-act-timeline-dot" />
                  <div>
                    <div className="gf-ad-act-item-header">
                      {getActionBadge(act.action)}
                      <span className="gf-ad-act-time">
                        {new Date(act.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </span>
                    </div>
                    <p className="gf-ad-act-details">{act.details || "System event executed."}</p>
                  </div>
                </div>

                <div className="gf-ad-act-item-meta">
                  <span className="gf-ad-act-actor">
                    {act.adminName || "System Operator"}
                  </span>
                  {act.ipAddress && (
                    <span className="gf-ad-act-ip">{act.ipAddress}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
