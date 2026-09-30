import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import "./Wishlist.css";

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    showToast(`Moved ${product.shortName || product.name} to bag`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="gf-container gf-wishlist-empty">
        <Heart size={56} color="var(--green-sage)" />
        <h2>Your Wishlist is Empty</h2>
        <p>Save your favorite botanical skincare products here to track or purchase later.</p>
        <Link to="/shop" className="gf-hero-btn-primary">Explore Formulations</Link>
      </div>
    );
  }

  return (
    <div className="gf-wishlist-page">
      <div className="gf-container">
        <div className="gf-wishlist-header">
          <span className="gf-wishlist-sub">Saved Items</span>
          <h1 className="gf-wishlist-title">MY SKINCARE WISHLIST ({wishlist.length})</h1>
        </div>

        <div className="gf-wishlist-grid">
          {wishlist.map(product => (
            <div key={product.id} className="gf-wishlist-card">
              <div className="gf-wishlist-img-wrap">
                <img src={product.image} alt={product.name} />
                <button
                  className="gf-wishlist-remove"
                  onClick={() => removeFromWishlist(product.id)}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="gf-wishlist-content">
                <Link to={`/product/${product.slug}`} className="gf-wishlist-name">
                  {product.name}
                </Link>

                <div className="gf-wishlist-price-row">
                  <span className="gf-wishlist-price">₹{product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="gf-wishlist-mrp">₹{product.originalPrice}</span>
                  )}
                </div>

                <button
                  className="gf-wishlist-move-btn"
                  onClick={() => handleMoveToCart(product)}
                  disabled={product.stock <= 0}
                >
                  <ShoppingBag size={16} />
                  <span>{product.stock <= 0 ? "Out of Stock" : "Move to Bag"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};