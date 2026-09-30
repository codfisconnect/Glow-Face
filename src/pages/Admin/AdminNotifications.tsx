import React, { useState, useEffect } from "react";
import { Mail, MessageSquare, CheckCircle, AlertTriangle, RefreshCw, ShieldCheck, Search } from "lucide-react";
import { adminService } from "../../services";
import { NotificationLogRecord } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import "./AdminNotifications.css";

export const AdminNotifications: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<NotificationLogRecord[]>([]);
  const [diagnostics, setDiagnostics] = useState<{ configured: boolean; verified: boolean; host?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, diagData] = await Promise.all([
        adminService.getNotificationLogs(),
        adminService.getEmailDiagnostics().catch(() => null)
      ]);
      setLogs(logsData);
      setDiagnostics(diagData);
    } catch (err: any) {
      showToast(err.message || "Failed to load notification logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filterChannel !== "ALL" && log.channel !== filterChannel) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchRecipient = log.recipient?.toLowerCase().includes(q);
      const matchOrder = log.orderId?.toLowerCase().includes(q);
      const matchKey = log.idempotencyKey?.toLowerCase().includes(q);
      const matchEvent = log.eventType?.toLowerCase().includes(q);
      return matchRecipient || matchOrder || matchKey || matchEvent;
    }
    return true;
  });

  return (
    <div className="gf-admin-notifs-page">
      <div className="gf-admin-cat-header">
        <div>
          <h1>Customer Notifications & Dispatch Audit</h1>
          <p>Real-time audit log of Email & WhatsApp delivery events with idempotency tracking</p>
        </div>
        <div>
          <button className="gf-admin-add-btn" onClick={loadData}>
            <RefreshCw size={16} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Gateway & Diagnostics Status Bar */}
      <div className="gf-notif-diag-card">
        <div className="gf-diag-item">
          <div className="gf-diag-icon" style={{ background: "#eff6ff", color: "#1d4ed8" }}>
            <Mail size={20} />
          </div>
          <div className="gf-diag-info">
            <strong>SMTP Email Dispatcher</strong>
            <span>
              {diagnostics?.configured
                ? diagnostics.verified ? "✅ Connected & Verified" : `⚠️ Configured (${diagnostics.error || "Verification pending"})`
                : "ℹ️ Dev Simulation Mode (Provide SMTP in .env for live mail)"}
            </span>
          </div>
        </div>

        <div className="gf-diag-item">
          <div className="gf-diag-icon" style={{ background: "#f0fdf4", color: "#15803d" }}>
            <MessageSquare size={20} />
          </div>
          <div className="gf-diag-info">
            <strong>Meta WhatsApp Cloud API</strong>
            <span>Active & Idempotent (Meta Graph v18.0)</span>
          </div>
        </div>

        <div className="gf-diag-item">
          <div className="gf-diag-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <ShieldCheck size={20} />
          </div>
          <div className="gf-diag-info">
            <strong>Replay & Duplicate Protection</strong>
            <span>Unique Idempotency Key Enforced</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px 12px", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="#94a3b8" style={{ marginRight: "8px" }} />
          <input
            type="text"
            placeholder="Search recipient email/phone, order ID, or event..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ border: "none", outline: "none", width: "100%", fontSize: "0.875rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {["ALL", "EMAIL", "WHATSAPP"].map(ch => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: filterChannel === ch ? "#0f172a" : "#cbd5e1",
                background: filterChannel === ch ? "#0f172a" : "#fff",
                color: filterChannel === ch ? "#fff" : "#475569",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {ch === "ALL" ? "All Channels" : ch}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="gf-admin-cat-card">
        <div className="gf-admin-cat-table-wrap">
          <table className="gf-admin-cat-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Channel</th>
                <th>Event Type</th>
                <th>Recipient</th>
                <th>Idempotency Key</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                    Loading notification dispatches...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No notification logs found. Dispatches will appear here automatically when orders are processed.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className={`gf-notif-channel-badge ${log.channel.toLowerCase()}`}>
                        {log.channel === "EMAIL" ? <Mail size={12} /> : <MessageSquare size={12} />}
                        {log.channel}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontSize: "0.825rem", color: "#0f172a" }}>
                        {log.eventType}
                      </strong>
                      {log.orderId && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Order: {log.orderId}
                        </div>
                      )}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.825rem" }}>
                      {log.recipient}
                    </td>
                    <td>
                      <span className="gf-idempotency-key-pill" title={log.idempotencyKey || ""}>
                        {log.idempotencyKey || "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`gf-admin-status-badge ${log.status === "SENT" || log.status === "SIMULATED" ? "active" : "inactive"}`}>
                        {log.status === "SENT" || log.status === "SIMULATED" ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
