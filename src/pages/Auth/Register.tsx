import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Auth.css";

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, phone, password });
      showToast("Account created successfully!");
      navigate("/profile");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gf-auth-page">
      <div className="gf-auth-card">
        <div className="gf-auth-top">
          <Link to="/" className="gf-auth-brand">GLOW FACE</Link>
          <h1 className="gf-auth-title">Create Account</h1>
          <p className="gf-auth-sub">Join Glow Face to easily reorder, track shipments, and receive botanical skincare insights.</p>
        </div>

        {error && (
          <div className="gf-auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="gf-auth-form">
          <div className="gf-auth-field">
            <label>Full Name *</label>
            <div className="gf-auth-input-wrap">
              <User size={16} className="gf-auth-input-icon" />
              <input
                type="text"
                required
                placeholder="Priya Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="gf-auth-field">
            <label>Email Address *</label>
            <div className="gf-auth-input-wrap">
              <Mail size={16} className="gf-auth-input-icon" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="gf-auth-field">
            <label>Mobile Number (For WhatsApp Updates)</label>
            <div className="gf-auth-input-wrap">
              <Phone size={16} className="gf-auth-input-icon" />
              <input
                type="tel"
                placeholder="9845012345"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="gf-auth-field">
            <label>Password (Min 6 Characters) *</label>
            <div className="gf-auth-input-wrap">
              <Lock size={16} className="gf-auth-input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="gf-auth-submit" disabled={loading}>
            <span>{loading ? "Creating Account..." : "Register Now"}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="gf-auth-footer">
          <span>Already have an account?</span>
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};