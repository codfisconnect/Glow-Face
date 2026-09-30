import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { paymentService } from "../../services";
import { useToast } from "../../contexts/ToastContext";
import "./Cart.css";

export const Cart: React.FC = () => {
  const {
    cartItems,
    cartTotal,
    shipping,
    freeShippingThreshold,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; description?: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const neededForFreeShipping = Math.max(0, freeShippingThreshold - cartTotal);

  const discountAmount = couponApplied ? couponApplied.discount : 0;
  const grandTotal = Math.max(1, cartTotal + shipping - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const res = await paymentService.validateCoupon(couponInput.trim(), cartTotal);
      if (res.valid) {
        setCouponApplied({
          code: res.code,
          discount: res.discount,
          description: res.description
        });
        showToast(`Coupon ${res.code} applied! Saved ₹${res.discount}`);
      } else {
        setCouponError(res.message || "Invalid coupon code");
      }
    } catch (err: any) {
      setCouponError(err.message || "Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponInput("");
    setCouponError("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="gf-container gf-cart-empty-page">
        <ShoppingBag size={56} color="var(--green-sage)" />
        <h2>Your Shopping Bag is Empty</h2>
        <p>Explore our targeted individual botanical formulations and discover visible clarity.</p>
        <Link to="/shop" className="gf-hero-btn-primary">
          Explore All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="gf-cart-page">
      <div className="gf-container">
        <div className="gf-cart-header">
          <h1 className="gf-cart-title">Your Skincare Bag</h1>
          <button className="gf-cart-clear-all" onClick={clearCart}>
            Clear Bag
          </button>
        </div>

        {/* Free Shipping Alert */}
        <div className="gf-cart-free-shipping-card">
          {neededForFreeShipping > 0 ? (
            <p>Add <strong>₹{neededForFreeShipping}</strong> more to qualify for <strong>FREE Shipping!</strong></p>
          ) : (
            <p className="gf-shipping-unlocked">🎉 You have unlocked <strong>FREE Shipping</strong> across India!</p>
          )}
        </div>

        <div className="gf-cart-layout">
          {/* Left: Items Table */}
          <div className="gf-cart-items-col">
            <div className="gf-cart-table-head">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            <div className="gf-cart-item-list">
              {cartItems.map(item => (
                <div key={item.id} className="gf-cart-row">
                  <div className="gf-cart-product-cell">
                    <img src={item.image} alt={item.name} className="gf-cart-row-img" />
                    <div>
                      <Link to={`/product/${item.slug}`} className="gf-cart-row-name">
                        {item.name}
                      </Link>
                      <button
                        className="gf-cart-row-delete"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  <div className="gf-cart-price-cell">
                    ₹{item.price}
                  </div>

                  <div className="gf-cart-qty-cell">
                    <div className="gf-qty-selector">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                        aria-label="Increase"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="gf-cart-total-cell">
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="gf-cart-summary-col">
            <div className="gf-cart-summary-card">
              <h3 className="gf-summary-title">Order Summary</h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="gf-coupon-form">
                <div className="gf-coupon-input-wrap">
                  <Tag size={16} className="gf-coupon-icon" />
                  <input
                    type="text"
                    placeholder="Discount code (e.g. GLOW10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    disabled={Boolean(couponApplied)}
                  />
                  {couponApplied ? (
                    <button
                      type="button"
                      className="gf-coupon-remove-btn"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="gf-coupon-apply-btn"
                      disabled={validatingCoupon || !couponInput.trim()}
                    >
                      {validatingCoupon ? "..." : "Apply"}
                    </button>
                  )}
                </div>
                {couponError && <p className="gf-coupon-err">{couponError}</p>}
                {couponApplied && (
                  <p className="gf-coupon-success">
                    ✓ Code <strong>{couponApplied.code}</strong> applied ({couponApplied.description || `₹${couponApplied.discount} off`})
                  </p>
                )}
              </form>

              {/* Price Calculation Rows */}
              <div className="gf-summary-lines">
                <div className="gf-summary-line">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>

                <div className="gf-summary-line">
                  <span>Delivery Fee</span>
                  <span>{shipping === 0 ? <strong style={{ color: "#2B8A3E" }}>FREE</strong> : `₹${shipping}`}</span>
                </div>

                {couponApplied && (
                  <div className="gf-summary-line gf-discount-line">
                    <span>Discount ({couponApplied.code})</span>
                    <span>-₹{couponApplied.discount}</span>
                  </div>
                )}

                <div className="gf-summary-line gf-summary-grand-total">
                  <span>Total Amount</span>
                  <strong>₹{grandTotal}</strong>
                </div>
              </div>

              <button
                className="gf-cart-checkout-cta"
                onClick={() => navigate("/checkout")}
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight size={18} />
              </button>

              <div className="gf-summary-trust-badge">
                <ShieldCheck size={18} color="var(--green)" />
                <span>Prepaid orders protected with Razorpay SSL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};