import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Instagram } from "../common/InstagramIcon";
import { BRAND } from "../../constants";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="gf-footer">
      <div className="gf-footer-top">
        <div className="gf-footer-container">
          {/* Column 1: Brand & Philosophy */}
          <div className="gf-footer-col gf-footer-brand">
            <h3 className="gf-footer-logo">{BRAND.name.toUpperCase()}</h3>
            <p className="gf-footer-desc">
              Glow Face crafts mindful botanical skincare formulations designed to support your natural skin barrier and reveal lasting radiance.
            </p>
            <div className="gf-footer-social">
              <a
                href={BRAND.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-social-pill"
                aria-label={`Follow Glow Face on Instagram ${BRAND.instagram.handle}`}
              >
                <Instagram size={18} />
                <span>{BRAND.instagram.handle}</span>
              </a>
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-social-pill gf-wa-pill"
                aria-label={`Chat with Glow Face on WhatsApp ${BRAND.whatsappFormatted}`}
              >
                <MessageCircle size={18} />
                <span>WhatsApp Care</span>
              </a>
            </div>
          </div>

          {/* Column 2: Skincare Collections */}
          <div className="gf-footer-col">
            <h4 className="gf-footer-heading">Collections</h4>
            <ul className="gf-footer-links">
              <li><Link to="/category/face-cream">Face Cream</Link></li>
              <li><Link to="/category/face-wash">Face Wash</Link></li>
              <li><Link to="/category/sunscreen">Sunscreen</Link></li>
              <li><Link to="/category/hand-wash">Hand Wash</Link></li>
              <li><Link to="/category/lip-care">Lip Care</Link></li>
              <li><Link to="/category/body-care">Body Care</Link></li>
              <li><Link to="/shop">Shop All Products</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Order Tracking */}
          <div className="gf-footer-col">
            <h4 className="gf-footer-heading">Customer Care</h4>
            <ul className="gf-footer-links">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">7-Day Returns & Replacements</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/about">About Glow Face</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div className="gf-footer-col">
            <h4 className="gf-footer-heading">Direct Contact</h4>
            <div className="gf-contact-info">
              <div className="gf-contact-item">
                <Mail size={16} aria-hidden="true" />
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </div>
              <div className="gf-contact-item">
                <Phone size={16} aria-hidden="true" />
                <a href={`tel:${BRAND.phone.replace(/\s+/g, "")}`}>
                  {BRAND.phone}
                </a>
              </div>
            </div>

            <div className="gf-trust-box">
              <ShieldCheck size={20} color="var(--gold-dark)" aria-hidden="true" />
              <div>
                <strong>Secure Prepaid Transactions</strong>
                <p>Protected by 256-bit SSL encryption. All major UPI, Debit, Credit cards & Net Banking accepted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gf-footer-bottom">
        <div className="gf-footer-container gf-footer-bottom-inner">
          <p>© {new Date().getFullYear()} {BRAND.name} Skincare. All rights reserved.</p>
          <div className="gf-payment-methods">
            <span className="gf-pay-pill">UPI</span>
            <span className="gf-pay-pill">GPay</span>
            <span className="gf-pay-pill">PhonePe</span>
            <span className="gf-pay-pill">Paytm</span>
            <span className="gf-pay-pill">Cards</span>
            <span className="gf-pay-pill">Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};