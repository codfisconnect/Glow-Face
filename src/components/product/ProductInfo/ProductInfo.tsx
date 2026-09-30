import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingBag, Heart, Truck, RotateCcw, ShieldCheck, Minus, Plus } from "lucide-react";
import { Product } from "../../../types";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useToast } from "../../../context/ToastContext";
import "./ProductInfo.css";

export interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [quantity, setQuantity] = useState(1);

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock <= (product.lowStockThreshold || 10);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    showToast(`Added ${quantity} × ${product.shortName || product.name} to bag`);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
    showToast(isFavorited ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div className="gf-prod-info">
      {/* Category & Status Pills */}
      <div className="gf-prod-info__badges">
        <Link
          to={`/category/${product.categorySlug}`}
          className="gf-prod-info__cat-tag"
        >
          {product.category?.name || product.categorySlug.replace(/-/g, " ")}
        </Link>
        {product.bestSeller && (
          <span className="gf-prod-info__bestseller-pill">Bestseller</span>
        )}
        {product.skinConcerns && (
          <span className="gf-prod-info__concern-pill">{product.skinConcerns}</span>
        )}
      </div>

      {/* Main Title */}
      <h1 className="gf-prod-info__title">{product.name}</h1>

      {/* Real Rating if present */}
      {product.rating ? (
        <div className="gf-prod-info__meta">
          <div className="gf-stars" aria-label={`Rated ${product.rating} stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.floor(product.rating || 5) ? "var(--gold)" : "none"}
                color="var(--gold)"
              />
            ))}
          </div>
          <span className="gf-prod-info__rating-num">{product.rating}</span>
          {product.reviewsCount ? (
            <span className="gf-prod-info__reviews-count">({product.reviewsCount} reviews)</span>
          ) : null}
          {product.sku && (
            <span className="gf-prod-info__sku">• SKU: {product.sku}</span>
          )}
        </div>
      ) : null}

      {/* Price Block */}
      <div className="gf-prod-info__pricing">
        <span className="gf-prod-info__price">₹{product.price}</span>
        {product.originalPrice && product.originalPrice > product.price ? (
          <span className="gf-prod-info__mrp">₹{product.originalPrice}</span>
        ) : null}
        {product.discount && product.discount > 0 ? (
          <span className="gf-prod-info__discount-save">Save {product.discount}%</span>
        ) : null}
        <span className="gf-prod-info__tax-note">Inclusive of all taxes</span>
      </div>

      {/* Short Description */}
      <p className="gf-prod-info__desc">
        {product.shortDescription || product.description}
      </p>

      {/* Stock Radar */}
      <div className="gf-prod-info__stock">
        {isOutOfStock ? (
          <span className="gf-stock-badge gf-stock-out">Out of Stock</span>
        ) : isLowStock ? (
          <span className="gf-stock-badge gf-stock-low">
            ⚠️ Only {product.stock} units left in stock!
          </span>
        ) : (
          <span className="gf-stock-badge gf-stock-in">
            ✓ In Stock & Ready to Ship
          </span>
        )}
      </div>

      {/* Quantity & CTAs */}
      <div className="gf-prod-info__actions">
        <div className="gf-prod-info__qty-wrapper">
          <label htmlFor="gf-qty-input">Quantity:</label>
          <div className="gf-qty-control" id="gf-qty-input">
            <button
              type="button"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>
            <span aria-live="polite">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(q => Math.min(product.stock || 99, q + 1))}
              disabled={quantity >= product.stock || isOutOfStock}
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div className="gf-prod-info__btn-row">
          <button
            type="button"
            className="gf-btn-cta gf-btn-cta--cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingBag size={18} />
            <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
          </button>

          <button
            type="button"
            className="gf-btn-cta gf-btn-cta--buynow"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
          >
            Buy Now
          </button>

          <button
            type="button"
            className={`gf-btn-cta--wish ${isFavorited ? "active" : ""}`}
            onClick={handleWishlistToggle}
            aria-label={isFavorited ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart
              size={20}
              fill={isFavorited ? "#C92A2A" : "none"}
              color={isFavorited ? "#C92A2A" : "var(--green-dark)"}
            />
          </button>
        </div>
      </div>

      {/* Assurance Perks */}
      <div className="gf-prod-info__perks">
        <div className="gf-perk-row">
          <Truck size={20} color="var(--green)" />
          <div>
            <strong>FREE Shipping on all prepaid orders</strong>
            <p>Fast dispatch with express delivery across India.</p>
          </div>
        </div>
        <div className="gf-perk-row">
          <RotateCcw size={20} color="var(--green)" />
          <div>
            <strong>7-Day Easy Replacement</strong>
            <p>Defective or damaged transit items replaced hassle-free.</p>
          </div>
        </div>
        <div className="gf-perk-row">
          <ShieldCheck size={20} color="var(--green)" />
          <div>
            <strong>Authentic Skincare Formulation</strong>
            <p>Directly crafted with gentle, proven personal care ingredients.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
