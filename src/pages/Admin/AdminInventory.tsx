import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, PackageX, Save, RefreshCw } from "lucide-react";
import { adminService } from "../../services";
import { useToast } from "../../contexts/ToastContext";
import "./AdminInventory.css";

export const AdminInventory: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadInventory = () => {
    setLoading(true);
    adminService.getInventory()
      .then(res => {
        setItems(res.items || []);
        setSummary(res.summary || null);
      })
      .catch(err => console.warn("Failed to load inventory", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockChange = (productId: string, field: "stock" | "lowStockThreshold", val: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleSaveItem = async (item: any) => {
    setSavingId(item.id);
    try {
      await adminService.updateStock(item.id, Number(item.stock), Number(item.lowStockThreshold));
      showToast(`Updated stock for ${item.name}`);
      loadInventory();
    } catch (err: any) {
      showToast(err.message || "Failed to update stock", "error");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="gf-ad-inventory-page">
      <div className="gf-ad-page-head">
        <div>
          <h1 className="gf-ad-title">Inventory Radar & Thresholds</h1>
          <p className="gf-ad-sub">Monitor physical batch quantities, set low-stock automated triggers, and update supplies.</p>
        </div>

        <button className="gf-ad-refresh-btn" onClick={loadInventory}>
          <RefreshCw size={15} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {summary && (
        <div className="gf-ad-inv-summary-grid">
          <div className="gf-ad-inv-stat green">
            <CheckCircle size={22} />
            <div>
              <strong>{summary.inStockCount} Formulations</strong>
              <span>Optimal In-Stock Level</span>
            </div>
          </div>

          <div className="gf-ad-inv-stat amber">
            <AlertTriangle size={22} />
            <div>
              <strong>{summary.lowStockCount} Formulations</strong>
              <span>At or Below Threshold (Reorder)</span>
            </div>
          </div>

          <div className="gf-ad-inv-stat red">
            <PackageX size={22} />
            <div>
              <strong>{summary.outOfStockCount} Formulations</strong>
              <span>Sold Out on Storefront</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="gf-ad-table-card">
        <div className="gf-ad-inv-table-head">
          <span>Product Details</span>
          <span>Category</span>
          <span>SKU</span>
          <span>Current Stock</span>
          <span>Alert Threshold</span>
          <span>Status Radar</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          <div className="gf-ad-table-loading">Loading inventory levels...</div>
        ) : (
          <div className="gf-ad-table-body">
            {items.map(item => (
              <div key={item.id} className="gf-ad-inv-table-row">
                <div className="gf-ad-inv-cell">
                  <img src={item.image || "/assets/cream-hero.jpg"} alt={item.name} />
                  <strong>{item.name}</strong>
                </div>

                <div>
                  <span className="gf-category-pill-tag">{item.categorySlug}</span>
                </div>

                <div>
                  <span className="gf-sku-tag">{item.sku || "—"}</span>
                </div>

                <div>
                  <input
                    type="number"
                    className="gf-inv-input"
                    value={item.stock}
                    onChange={e => handleStockChange(item.id, "stock", Number(e.target.value))}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    className="gf-inv-input"
                    value={item.lowStockThreshold}
                    onChange={e => handleStockChange(item.id, "lowStockThreshold", Number(e.target.value))}
                  />
                </div>

                <div>
                  <span className={`gf-stock-badge-tag ${item.status === 'OUT_OF_STOCK' ? 'out' : (item.status === 'LOW_STOCK' ? 'low' : 'in')}`}>
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <button
                    className="gf-ad-inv-save-btn"
                    onClick={() => handleSaveItem(item)}
                    disabled={savingId === item.id}
                  >
                    <Save size={14} />
                    <span>{savingId === item.id ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};