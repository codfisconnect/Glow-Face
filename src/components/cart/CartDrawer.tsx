import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "./CartDrawer.css";

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    cartCount,
    cartTotal,
    shipping,
    freeShippingThreshold,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const neededForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);
  const progressPercent = Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100));

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  return (
    <div className="gf-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="gf-drawer-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="gf-drawer-header">
          <div className="gf-drawer-title-group">
            <ShoppingBag size={20} color="var(--green-dark)" />
            <h3 className="gf-drawer-title">Your Skincare Bag</h3>
            <span className="gf-drawer-count">({cartCount})</span>
          </div>
          <button
            className="gf-drawer-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        <div className="gf-drawer-meter-box">
          {neededForFreeShipping > 0 ? (
            <p className="gf-meter-text">
              Add <strong>₹{neededForFreeShipping}</strong> more to unlock <strong>FREE Shipping!</strong>
            </p>
          ) : (
            <p className="gf-meter-text gf-meter-success">
              🎉 Congratulations! You have unlocked <strong>FREE Shipping!</strong>
            </p>
          )}
          <div className="gf-meter-bar">
            <div className="gf-meter-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Item List */}
        <div className="gf-drawer-items">
          {cartItems.length === 0 ? (
            <div className="gf-drawer-empty">
              <ShoppingBag size={48} color="var(--green-sage)" />
              <p className="gf-empty-title">Your bag is currently empty</p>
              <p className="gf-empty-sub">Explore our curated botanical formulations for radiant skin.</p>
              <Link
                to="/shop"
                className="gf-empty-btn"
                onClick={() => setIsCartOpen(false)}
              >
                Explore Products
              </Link>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="gf-drawer-item">
                <img src={item.image} alt={item.name} className="gf-drawer-item-img" />
                <div className="gf-drawer-item-info">
                  <Link
                    to={`/product/${item.slug}`}
                    className="gf-drawer-item-title"
                    onClick={() => setIsCartOpen(false)}
                  >
                    {item.name}
                  </Link>
                  <span className="gf-drawer-item-price">₹{item.price}</span>

                  <div className="gf-drawer-qty-row">
                    <div className="gf-qty-selector">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      className="gf-item-remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="gf-drawer-footer">
            <div className="gf-drawer-subtotal-row">
              <span>Subtotal</span>
              <strong className="gf-drawer-subtotal-amount">₹{cartTotal}</strong>
            </div>

            <div className="gf-drawer-subtotal-row" style={{ fontSize: "0.85rem", color: "var(--text-light)" }}>
              <span>Delivery</span>
              <span>{shipping === 0 ? <strong style={{ color: "#2b8a3e" }}>FREE</strong> : `₹${shipping}`}</span>
            </div>

            <button
              className="gf-drawer-checkout-btn"
              onClick={handleCheckoutClick}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <Link
              to="/cart"
              className="gf-drawer-viewcart-link"
              onClick={() => setIsCartOpen(false)}
            >
              View Full Bag & Apply Coupons
            </Link>

            <div className="gf-drawer-trust">
              <ShieldCheck size={16} color="var(--green)" />
              <span>Prepaid orders protected by Razorpay SSL</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};