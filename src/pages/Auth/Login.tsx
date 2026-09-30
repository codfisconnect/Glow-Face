import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import "./Auth.css";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email, password });
      showToast(`Welcome back, ${user.name || "Customer"}!`);
      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate(from);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gf-auth-page">
      <div className="gf-auth-card">
        <div className="gf-auth-top">
          <Link to="/" className="gf-auth-brand">GLOW FACE</Link>
          <h1 className="gf-auth-title">Welcome Back</h1>
          <p className="gf-auth-sub">Sign in to track orders, save your address, or access admin operations.</p>
        </div>

        {error && (
          <div className="gf-auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="gf-auth-form">
          <div className="gf-auth-field">
            <label>Email Address</label>
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
            <label>Password</label>
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
            <span>{loading ? "Authenticating..." : "Sign In"}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="gf-auth-footer">
          <span>Don't have an account yet?</span>
          <Link to="/register">Create customer account</Link>
        </div>
      </div>
    </div>
  );
};