import React, { useState, useEffect } from "react";
import { Plus, Edit2, Check, X, Tag, Percent } from "lucide-react";
import { adminService } from "../../services";
import { Coupon, DiscountType } from "../../types";
import { useToast } from "../../contexts/ToastContext";
import { Modal } from "../../components/common/Modal/Modal";
import "./AdminCoupons.css";

export const AdminCoupons: React.FC = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as DiscountType,
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 500,
    usageLimit: 100,
    active: true
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenModal = (coup?: Coupon) => {
    if (coup) {
      setEditingCoupon(coup);
      setFormData({
        code: coup.code,
        description: coup.description || "",
        discountType: coup.discountType,
        discountValue: coup.discountValue,
        minOrderAmount: coup.minOrderAmount,
        maxDiscount: coup.maxDiscount || 500,
        usageLimit: coup.usageLimit || 100,
        active: coup.active
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 500,
        usageLimit: 100,
        active: true
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast("Coupon code is required", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: formData.discountType === "PERCENTAGE" ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
      };

      if (editingCoupon) {
        await adminService.updateCoupon(editingCoupon.id, payload);
        showToast("Coupon updated successfully!", "success");
      } else {
        await adminService.createCoupon(payload);
        showToast("Coupon created successfully!", "success");
      }
      setModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || "Failed to save coupon", "error");
    }
  };

  const handleToggleActive = async (coup: Coupon) => {
    try {
      await adminService.updateCoupon(coup.id, { active: !coup.active });
      showToast(`Coupon ${coup.code} marked ${!coup.active ? "active" : "inactive"}`);
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || "Failed to toggle status", "error");
    }
  };

  return (
    <div className="gf-admin-coupons-page">
      <div className="gf-admin-coup-header">
        <div>
          <h1>Coupons & Promotions</h1>
          <p>Create and manage discount codes, redemption caps, and promotional offers</p>
        </div>
        <div>
          <button className="gf-admin-add-btn" onClick={() => handleOpenModal()}>
            <Plus size={18} />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      <div className="gf-admin-coup-card">
        <div className="gf-admin-coup-table-wrap">
          <table className="gf-admin-coup-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Redemptions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                    Loading promotional coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No coupons configured yet. Click above to create one!
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id || c.code}>
                    <td>
                      <span className="gf-coup-code-badge">{c.code}</span>
                      {c.description && (
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "4px" }}>
                          {c.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                        {c.discountType === "PERCENTAGE" ? "Percentage Off" : "Fixed Amount"}
                      </span>
                    </td>
                    <td>
                      <span className="gf-coup-discount-val">
                        {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                      </span>
                      {c.maxDiscount && c.discountType === "PERCENTAGE" && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          Max cap: ₹{c.maxDiscount}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : "None (₹0)"}
                    </td>
                    <td>
                      <span>{c.usedCount || 0}</span>
                      {c.usageLimit && <span style={{ color: "#94a3b8" }}> / {c.usageLimit}</span>}
                    </td>
                    <td>
                      <span className={`gf-admin-status-badge ${c.active ? "active" : "inactive"}`}>
                        {c.active ? <Check size={12} /> : <X size={12} />}
                        {c.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="gf-admin-icon-btn"
                          onClick={() => handleOpenModal(c)}
                          title="Edit Coupon"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="gf-admin-icon-btn"
                          onClick={() => handleToggleActive(c)}
                          title={c.active ? "Deactivate" : "Activate"}
                        >
                          {c.active ? <X size={15} /> : <Check size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create Promotional Coupon"}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="gf-form-group">
            <label>Coupon Code * (e.g. GLOW10)</label>
            <input
              type="text"
              required
              className="gf-form-input"
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. GLOW15"
            />
          </div>

          <div className="gf-form-group">
            <label>Description</label>
            <input
              type="text"
              className="gf-form-input"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. 15% off botanical daily skincare"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="gf-form-group">
              <label>Discount Type</label>
              <select
                className="gf-form-input"
                value={formData.discountType}
                onChange={e => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>

            <div className="gf-form-group">
              <label>Value * {formData.discountType === "PERCENTAGE" ? "(%)" : "(₹)"}</label>
              <input
                type="number"
                required
                min={1}
                className="gf-form-input"
                value={formData.discountValue}
                onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="gf-form-group">
              <label>Min. Order Amount (₹)</label>
              <input
                type="number"
                min={0}
                className="gf-form-input"
                value={formData.minOrderAmount}
                onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
              />
            </div>

            {formData.discountType === "PERCENTAGE" && (
              <div className="gf-form-group">
                <label>Max Discount Cap (₹)</label>
                <input
                  type="number"
                  min={0}
                  className="gf-form-input"
                  value={formData.maxDiscount}
                  onChange={e => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                />
              </div>
            )}
          </div>

          <div className="gf-form-group">
            <label>Total Usage Limit (leave empty for unlimited)</label>
            <input
              type="number"
              min={1}
              className="gf-form-input"
              value={formData.usageLimit}
              onChange={e => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
            />
          </div>

          <label className="gf-checkbox-label">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={e => setFormData({ ...formData, active: e.target.checked })}
            />
            <span>Active & Redeemable</span>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button type="button" className="gf-btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="gf-btn-primary">
              {editingCoupon ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
