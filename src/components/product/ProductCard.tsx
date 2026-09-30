import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Product } from "../../types";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useToast } from "../../context/ToastContext";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.lowStockThreshold || 10);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    showToast(`Added ${product.shortName || product.name} to bag`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    showToast(isFavorited ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <article className="gf-prod-card" aria-label={product.name}>
      <Link to={`/product/${product.slug}`} className="gf-prod-media-link" tabIndex={-1}>
        <div className="gf-prod-media">
          <img
            src={product.image}
            alt={product.name}
            className="gf-prod-img"
            loading="lazy"
          />

          {/* Status Badges */}
          <div className="gf-prod-badges">
            {isOutOfStock ? (
              <span className="gf-card-badge gf-badge-out">Sold Out</span>
            ) : (
              <>
                {product.bestSeller && (
                  <span className="gf-card-badge gf-badge-bestseller">Bestseller</span>
                )}
                {product.discount && product.discount > 0 ? (
                  <span className="gf-card-badge gf-badge-discount">{product.discount}% OFF</span>
                ) : null}
                {isLowStock && (
                  <span className="gf-card-badge gf-badge-lowstock">Only {product.stock} left</span>
                )}
              </>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            className={`gf-prod-wish-btn ${isFavorited ? "active" : ""}`}
            onClick={handleWishlistToggle}
            aria-label={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart
              size={18}
              fill={isFavorited ? "#C92A2A" : "none"}
              color={isFavorited ? "#C92A2A" : "var(--green-dark)"}
            />
          </button>
        </div>
      </Link>

      <div className="gf-prod-content">
        {/* Rating (only when legitimate rating data exists) */}
        {product.rating && (
          <div className="gf-prod-rating">
            <div className="gf-stars" aria-label={`Rated ${product.rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(product.rating || 5) ? "var(--gold)" : "none"}
                  color="var(--gold)"
                />
              ))}
            </div>
            {product.reviewsCount ? (
              <span className="gf-reviews-count">({product.reviewsCount})</span>
            ) : null}
          </div>
        )}

        {/* Product Title */}
        <h3 className="gf-prod-heading">
          <Link to={`/product/${product.slug}`} className="gf-prod-title">
            {product.name}
          </Link>
        </h3>

        {/* Short Descriptor */}
        <p className="gf-prod-benefit">
          {product.shortDescription || (product.benefits && product.benefits[0]) || ""}
        </p>

        {/* Pricing & Add to Bag */}
        <div className="gf-prod-footer">
          <div className="gf-prod-prices">
            <span className="gf-prod-price">₹{product.price}</span>
            {product.originalPrice && product.originalPrice > product.price ? (
              <span className="gf-prod-mrp">₹{product.originalPrice}</span>
            ) : null}
          </div>

          <button
            type="button"
            className="gf-add-cart-btn"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label={`Add ${product.shortName || product.name} to bag`}
          >
            <ShoppingBag size={15} />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Bag"}</span>
          </button>
        </div>
      </div>
    </article>
  );
};