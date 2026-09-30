import React, { useState } from "react";
import { Mail, Phone, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import { Instagram } from "../../components/common/InstagramIcon";
import { Button } from "../../components/common/Button/Button";
import { BRAND } from "../../constants";
import { useToast } from "../../hooks";
import "./Contact.css";

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    setIsSubmitting(true);
    // Simulate inquiry submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast("Thank you! Your message has been sent to our care team.");
    }, 600);
  };

  return (
    <article className="gf-contact-page" aria-label="Contact Glow Face">
      <header className="gf-contact-hero">
        <div className="gf-container gf-contact-hero__container">
          <span className="gf-contact-eyebrow">CUSTOMER CARE</span>
          <h1 className="gf-contact-title">GET IN TOUCH</h1>
          <p className="gf-contact-subtitle">
            Have questions about your skincare regimen, product orders, or delivery? Our dedicated care team is here to assist you.
          </p>
        </div>
      </header>

      <section className="gf-container gf-contact-body">
        <div className="gf-contact-grid">
          {/* Left Column: Direct Official Contact Channels */}
          <div className="gf-contact-info-card">
            <h2>DIRECT CHANNELS</h2>
            <p className="gf-contact-info-lead">
              Reach out directly through WhatsApp, email, or Instagram. We respond promptly during operational hours.
            </p>

            <div className="gf-channel-list">
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-channel-item gf-channel-whatsapp"
              >
                <div className="gf-channel-icon">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <strong>WhatsApp Care</strong>
                  <span>{BRAND.whatsappFormatted}</span>
                </div>
              </a>

              <a
                href={`mailto:${BRAND.email}`}
                className="gf-channel-item"
              >
                <div className="gf-channel-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <strong>Email Support</strong>
                  <span>{BRAND.email}</span>
                </div>
              </a>

              <a
                href={`tel:${BRAND.phone.replace(/\s+/g, "")}`}
                className="gf-channel-item"
              >
                <div className="gf-channel-icon">
                  <Phone size={22} />
                </div>
                <div>
                  <strong>Phone Support</strong>
                  <span>{BRAND.phone}</span>
                </div>
              </a>

              <a
                href={BRAND.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="gf-channel-item"
              >
                <div className="gf-channel-icon">
                  <Instagram size={22} />
                </div>
                <div>
                  <strong>Official Instagram</strong>
                  <span>{BRAND.instagram.handle}</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="gf-contact-form-card">
            <h2>SEND A MESSAGE</h2>
            <p className="gf-contact-form-lead">
              Submit your inquiry below and our team will get back to you within 24 business hours.
            </p>

            {submitted ? (
              <div className="gf-contact-success">
                <CheckCircle2 size={48} color="var(--green)" />
                <h3>Message Received</h3>
                <p>
                  Thank you for reaching out to Glow Face. We have logged your request and will reply to <strong>{form.email}</strong> shortly.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", orderId: "", message: "" });
                  }}
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="gf-contact-form">
                <div className="gf-form-group">
                  <label htmlFor="name">Your Name *</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="gf-form-row-2">
                  <div className="gf-form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="gf-form-group">
                    <label htmlFor="phone">Phone / Mobile</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="10-digit number"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="gf-form-group">
                  <label htmlFor="orderId">Order Number (Optional)</label>
                  <input
                    id="orderId"
                    type="text"
                    placeholder="e.g. GF-2026-1234"
                    value={form.orderId}
                    onChange={e => setForm({ ...form, orderId: e.target.value })}
                  />
                </div>

                <div className="gf-form-group">
                  <label htmlFor="message">Message / Inquiry *</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    placeholder="How can we help with your skincare or order?"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  icon={<Send size={16} />}
                  iconPosition="right"
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </article>
  );
};
