import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Instagram } from "../common/InstagramIcon";
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="gf-footer">
      <div className="gf-footer-top">
        <div className="gf-footer-container">
          {/* Column 1: Brand & Kerala Roots */}
          <div className="gf-footer-col gf-footer-brand">
            <h3 className="gf-footer-logo">GLOW FACE</h3>
            <p className="gf-footer-desc">
              Rooted in authentic Kerala Ayurvedic wisdom and modern dermatological science. Crafted with cold-pressed oils, potent botanical extracts, and bioactive fermentations for pure, natural radiance.
            </p>
            <div className="gf-footer-social">
              <a
                href="https://instagram.com/glowfacecare"
                target="_blank"
                rel="noopener noreferrer"
                className="gf-social-pill"
              >
                <Instagram size={18} />
                <span>@glowfacecare</span>
              </a>
              <a
                href="https://wa.me/919845012345?text=Hi%20Glow%20Face%2C%20I%20have%20a%20question%20about%20your%20skincare%20products"
                target="_blank"
                rel="noopener noreferrer"
                className="gf-social-pill gf-wa-pill"
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
              <li><Link to="/category/sunscreen">Sunscreen SPF 50</Link></li>
              <li><Link to="/category/hand-wash">Herbal Hand Wash</Link></li>
              <li><Link to="/category/lip-care">Lip Balms & Care</Link></li>
              <li><Link to="/category/body-care">Body Bars & Tan Care</Link></li>
              <li><Link to="/shop">Shop All Products</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Order Tracking */}
          <div className="gf-footer-col">
            <h4 className="gf-footer-heading">Customer Care</h4>
            <ul className="gf-footer-links">
              <li><Link to="/orders">Track Your Order</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">7-Day Returns & Refunds</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/about">Our Story & Ingredients</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div className="gf-footer-col">
            <h4 className="gf-footer-heading">Direct Contact</h4>
            <div className="gf-contact-info">
              <div className="gf-contact-item">
                <Mail size={16} />
                <span>care@glowface.com</span>
              </div>
              <div className="gf-contact-item">
                <Phone size={16} />
                <span>+91 98450 12345 (Mon-Sat, 9am - 7pm)</span>
              </div>
              <div className="gf-contact-item">
                <MapPin size={16} />
                <span>Kerala Botanical Herbals & Skincare, India</span>
              </div>
            </div>

            <div className="gf-trust-box">
              <ShieldCheck size={20} color="var(--gold-dark)" />
              <div>
                <strong>100% Prepaid & Verified</strong>
                <p>Protected by Razorpay 256-bit SSL encryption. All major UPI, Debit & Credit cards accepted.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gf-footer-bottom">
        <div className="gf-footer-container gf-footer-bottom-inner">
          <p>© {new Date().getFullYear()} Glow Face Skincare. All rights reserved.</p>
          <div className="gf-payment-methods">
            <span className="gf-pay-pill">UPI</span>
            <span className="gf-pay-pill">Google Pay</span>
            <span className="gf-pay-pill">PhonePe</span>
            <span className="gf-pay-pill">Paytm</span>
            <span className="gf-pay-pill">Visa / Mastercard / RuPay</span>
            <span className="gf-pay-pill">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};