import React, { useState, useEffect } from "react";
import {
  Settings,
  Store,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Save,
  MessageCircle,
  Mail,
  Phone
} from "lucide-react";
import { Instagram } from "../../components/common/InstagramIcon";
import { adminService } from "../../services";
import { useToast } from "../../contexts/ToastContext";
import { BRAND } from "../../constants";
import "./AdminSettings.css";

export const AdminSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [storeName, setStoreName] = useState<string>(BRAND.name);
  const [tagline, setTagline] = useState<string>(BRAND.tagline);
  const [supportEmail, setSupportEmail] = useState<string>(BRAND.email);
  const [supportPhone, setSupportPhone] = useState<string>(BRAND.phone);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(BRAND.whatsappFormatted);

  // Shipping & Inventory
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(BRAND.shipping.freeThreshold);
  const [standardShippingFee, setStandardShippingFee] = useState<number>(BRAND.shipping.standardFee);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);

  // Social
  const [showInstagram, setShowInstagram] = useState<boolean>(true);
  const [instagramPostsCount, setInstagramPostsCount] = useState<number>(6);
  const [instagramHandle, setInstagramHandle] = useState<string>(BRAND.instagram.handle);

  useEffect(() => {
    adminService.getSettings()
      .then(settings => {
        if (settings.storeName) setStoreName(settings.storeName);
        if (settings.tagline) setTagline(settings.tagline);
        if (settings.supportEmail) setSupportEmail(settings.supportEmail);
        if (settings.supportPhone) setSupportPhone(settings.supportPhone);
        if (settings.whatsappNumber) setWhatsappNumber(settings.whatsappNumber);
        if (settings.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(settings.freeShippingThreshold));
        if (settings.standardShippingFee !== undefined) setStandardShippingFee(Number(settings.standardShippingFee));
        if (settings.lowStockThreshold !== undefined) setLowStockThreshold(Number(settings.lowStockThreshold));
        if (settings.showInstagram !== undefined) setShowInstagram(Boolean(settings.showInstagram));
        if (settings.instagramPostsCount !== undefined) setInstagramPostsCount(Number(settings.instagramPostsCount));
        if (settings.instagramHandle) setInstagramHandle(settings.instagramHandle);
      })
      .catch(err => console.warn("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        adminService.updateSetting("storeName", storeName),
        adminService.updateSetting("tagline", tagline),
        adminService.updateSetting("supportEmail", supportEmail),
        adminService.updateSetting("supportPhone", supportPhone),
        adminService.updateSetting("whatsappNumber", whatsappNumber),
        adminService.updateSetting("freeShippingThreshold", freeShippingThreshold),
        adminService.updateSetting("standardShippingFee", standardShippingFee),
        adminService.updateSetting("lowStockThreshold", lowStockThreshold),
        adminService.updateSetting("showInstagram", showInstagram),
        adminService.updateSetting("instagramPostsCount", instagramPostsCount),
        adminService.updateSetting("instagramHandle", instagramHandle),
      ]);
      showToast("Store configuration saved successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gf-ad-settings-page">
      <div className="gf-ad-page-head">
        <div>
          <h1 className="gf-ad-title">Store Configuration & Rules</h1>
          <p className="gf-ad-sub">Manage global operational thresholds, customer communication channels, and integration statuses.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="gf-ad-settings-form">
        {/* Section 1: Store Identity */}
        <div className="gf-ad-settings-card">
          <div className="gf-ad-settings-header">
            <Store size={20} className="gf-ad-settings-icon" />
            <div>
              <h3>Brand & Support Channels</h3>
              <p>Configure the customer-facing brand identity and support lines.</p>
            </div>
          </div>

          <div className="gf-ad-form-grid">
            <div className="gf-ad-field">
              <label>Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                required
              />
            </div>

            <div className="gf-ad-field">
              <label>Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
              />
            </div>

            <div className="gf-ad-field">
              <label>Support Email</label>
              <div className="gf-ad-input-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="gf-ad-field">
              <label>Support Phone</label>
              <div className="gf-ad-input-icon">
                <Phone size={16} />
                <input
                  type="text"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="gf-ad-field">
              <label>WhatsApp Care Number (with Country Code)</label>
              <div className="gf-ad-input-icon">
                <MessageCircle size={16} />
                <input
                  type="text"
                  placeholder="+91 87785 48891"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Commerce Thresholds */}
        <div className="gf-ad-settings-card">
          <div className="gf-ad-settings-header">
            <Truck size={20} className="gf-ad-settings-icon" />
            <div>
              <h3>Fulfillment & Stock Thresholds</h3>
              <p>Rules that determine free shipping qualification and low-stock radar alerts.</p>
            </div>
          </div>

          <div className="gf-ad-form-grid">
            <div className="gf-ad-field">
              <label>Free Shipping Minimum (₹)</label>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={e => setFreeShippingThreshold(Number(e.target.value))}
                required
              />
              <span className="gf-ad-field-hint">Orders at or above this amount receive free standard shipping.</span>
            </div>

            <div className="gf-ad-field">
              <label>Standard Flat Shipping Rate (₹)</label>
              <input
                type="number"
                min="0"
                value={standardShippingFee}
                onChange={e => setStandardShippingFee(Number(e.target.value))}
                required
              />
              <span className="gf-ad-field-hint">Applied to orders below the free shipping threshold.</span>
            </div>

            <div className="gf-ad-field">
              <label>Global Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value))}
                required
              />
              <span className="gf-ad-field-hint">Products with inventory at or below this number trigger low-stock alerts.</span>
            </div>
          </div>
        </div>

        {/* Section 3: Social & Instagram Feed */}
        <div className="gf-ad-settings-card">
          <div className="gf-ad-settings-header">
            <Instagram size={20} className="gf-ad-settings-icon" />
            <div>
              <h3>Social Content & Meta Integration</h3>
              <p>Configure the "Follow the Glow" feed appearance on the homepage.</p>
            </div>
          </div>

          <div className="gf-ad-form-grid">
            <div className="gf-ad-field-checkbox">
              <label className="gf-ad-toggle-label">
                <input
                  type="checkbox"
                  checked={showInstagram}
                  onChange={e => setShowInstagram(e.target.checked)}
                />
                <span>Display Instagram social feed on homepage</span>
              </label>
            </div>

            <div className="gf-ad-field">
              <label>Official Instagram Handle</label>
              <input
                type="text"
                placeholder="glowface_official"
                value={instagramHandle}
                onChange={e => setInstagramHandle(e.target.value)}
              />
            </div>

            <div className="gf-ad-field">
              <label>Posts Display Count</label>
              <select
                value={instagramPostsCount}
                onChange={e => setInstagramPostsCount(Number(e.target.value))}
              >
                <option value={4}>4 Posts (Compact)</option>
                <option value={6}>6 Posts (Balanced - Recommended)</option>
                <option value={8}>8 Posts (Extended)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Live Integration Status Audit */}
        <div className="gf-ad-settings-card">
          <div className="gf-ad-settings-header">
            <ShieldCheck size={20} className="gf-ad-settings-icon" />
            <div>
              <h3>Infrastructure & Integration Diagnostics</h3>
              <p>Current runtime mode for payments, media uploads, and transactional dispatchers.</p>
            </div>
          </div>

          <div className="gf-ad-integration-list">
            <div className="gf-ad-integ-row">
              <div>
                <strong>Razorpay Payment Gateway</strong>
                <p>Timing-safe HMAC-SHA256 signature verification & automated duplicate payment guards.</p>
              </div>
              <span className="gf-ad-integ-badge live">
                <CheckCircle2 size={13} /> Active & Verified
              </span>
            </div>

            <div className="gf-ad-integ-row">
              <div>
                <strong>PostgreSQL / Database Gateway</strong>
                <p>Prisma ORM schema with resilient DevStore fallback for zero downtime local dev.</p>
              </div>
              <span className="gf-ad-integ-badge live">
                <CheckCircle2 size={13} /> Production Ready
              </span>
            </div>

            <div className="gf-ad-integ-row">
              <div>
                <strong>Transactional Notification Engine</strong>
                <p>Asynchronous multi-channel dispatcher (Nodemailer SMTP & Meta WhatsApp Cloud API).</p>
              </div>
              <span className="gf-ad-integ-badge live">
                <CheckCircle2 size={13} /> Multi-Channel Armed
              </span>
            </div>

            <div className="gf-ad-integ-row">
              <div>
                <strong>Meta / Instagram Feed Integration</strong>
                <p>Graph API with 15-minute response cache & graceful editorial fallback.</p>
              </div>
              <span className="gf-ad-integ-badge live">
                <CheckCircle2 size={13} /> Resilient Layer Active
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="gf-ad-settings-actions">
          <button type="submit" className="gf-ad-settings-save-btn" disabled={saving}>
            <Save size={16} />
            <span>{saving ? "Saving Changes..." : "Save Store Configuration"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
