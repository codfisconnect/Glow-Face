import React from "react";
import { Link } from "react-router-dom";



export const Shipping: React.FC = () => (
  <div className="gf-container" style={{ padding: "60px 24px 90px", maxWidth: "800px" }}>
    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--green-dark)", marginBottom: "20px" }}>
      Shipping & Delivery Policy
    </h1>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)", marginBottom: "16px" }}>
      We ship across all 28 states and 8 union territories of India through premier logistics partners including Delhivery, BlueDart, and ExpressBees.
    </p>
    <h3 style={{ color: "var(--green-dark)", marginTop: "24px", marginBottom: "8px" }}>Dispatch & Timelines</h3>
    <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "var(--text-medium)" }}>
      <li><strong>Dispatch Time:</strong> Orders are dispatched from our Kerala fulfillment center within 24 - 48 business hours.</li>
      <li><strong>Delivery Time:</strong> Metro cities typically receive deliveries within 2 - 4 business days. Non-metro locations take 4 - 6 business days.</li>
      <li><strong>Shipping Charges:</strong> We provide <strong>100% FREE Shipping</strong> on all prepaid orders of ₹499 and above. A flat nominal fee of ₹49 applies for orders below ₹499.</li>
    </ul>
    <h3 style={{ color: "var(--green-dark)", marginTop: "24px", marginBottom: "8px" }}>Order Tracking</h3>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)" }}>
      As soon as your package is dispatched, you will receive an automated tracking link via WhatsApp and email. You can also track your order anytime on our <Link to="/orders" style={{ color: "var(--green)", textDecoration: "underline" }}>Order Tracking Page</Link>.
    </p>
  </div>
);

export const Returns: React.FC = () => (
  <div className="gf-container" style={{ padding: "60px 24px 90px", maxWidth: "800px" }}>
    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--green-dark)", marginBottom: "20px" }}>
      Returns & Refunds Policy
    </h1>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)", marginBottom: "16px" }}>
      At Glow Face, your skin satisfaction and product safety are paramount. We offer a <strong>7-Day Easy Return Policy</strong> from the date of package delivery.
    </p>
    <h3 style={{ color: "var(--green-dark)", marginTop: "24px", marginBottom: "8px" }}>Eligible Situations</h3>
    <ul style={{ paddingLeft: "20px", lineHeight: "1.8", color: "var(--text-medium)" }}>
      <li>Received a damaged, cracked, or leaking product in transit.</li>
      <li>Received an incorrect item differing from your order confirmation.</li>
      <li>Item expired or sealed cap missing upon unboxing.</li>
    </ul>
    <h3 style={{ color: "var(--green-dark)", marginTop: "24px", marginBottom: "8px" }}>How to Request a Replacement or Refund</h3>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)" }}>
      Please notify our customer care team via WhatsApp (+91 98450 12345) or email at <strong>care@glowface.com</strong> within 7 days of delivery, attaching your Order ID and clear photos/videos of the package. Once verified, we will dispatch an immediate free replacement or process a full refund to your original payment method within 3-5 business days.
    </p>
  </div>
);

export const Privacy: React.FC = () => (
  <div className="gf-container" style={{ padding: "60px 24px 90px", maxWidth: "800px" }}>
    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--green-dark)", marginBottom: "20px" }}>
      Privacy Policy
    </h1>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)", marginBottom: "16px" }}>
      Glow Face is committed to safeguarding the privacy and security of all customers and visitors. We never sell, rent, or trade your personal information to third-party marketing brokers.
    </p>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)", marginBottom: "16px" }}>
      Information collected (such as name, delivery address, email, and phone number) is used solely to process your orders, send automated shipping notifications via WhatsApp and email, and provide customer support.
    </p>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)" }}>
      All payment transactions are encrypted end-to-end via Razorpay PCI-DSS certified gateways. Glow Face does not store debit/credit card numbers or UPI MPINs on its servers.
    </p>
  </div>
);

export const Terms: React.FC = () => (
  <div className="gf-container" style={{ padding: "60px 24px 90px", maxWidth: "800px" }}>
    <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.4rem", color: "var(--green-dark)", marginBottom: "20px" }}>
      Terms & Conditions
    </h1>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)", marginBottom: "16px" }}>
      Welcome to Glow Face. By browsing our website or placing an order, you agree to comply with and be bound by the following terms of service.
    </p>
    <h3 style={{ color: "var(--green-dark)", marginTop: "24px", marginBottom: "8px" }}>1. Product Usage & Patch Test</h3>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)" }}>
      While our formulations use botanical and skin-safe active ingredients, individual skin sensitivity may vary. We strongly recommend performing a 24-hour patch test behind the ear or on the inner wrist before regular daily facial application.
    </p>
    <h3 style={{ color: "var(--green-dark)", marginTop: "24px", marginBottom: "8px" }}>2. Pricing & Orders</h3>
    <p style={{ lineHeight: "1.8", color: "var(--text-medium)" }}>
      All prices are stated in Indian Rupees (INR) and are inclusive of applicable goods and services taxes (GST). Glow Face reserves the right to modify pricing or withdraw promotional coupon codes at its discretion.
    </p>
  </div>
);