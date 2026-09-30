import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Heart, User as UserIcon, Menu, X, ChevronDown, ShieldAlert, LogOut, Home as HomeIcon } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useAuth } from "../../contexts/AuthContext";
import { productService } from "../../services";
import "./Header.css";

interface HeaderProps {
  onSearchOpen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchOpen }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlist } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      navigate(`/shop?search=${encodeURIComponent(mobileSearch.trim())}`);
      setMobileMenuOpen(false);
      setMobileSearch("");
    }
  };

  const [categories, setCategories] = useState<{ label: string; href: string; desc: string }[]>([
    { label: "All Products", href: "/shop", desc: "View complete skincare collection" },
    { label: "Face Cream", href: "/category/face-cream", desc: "Targeted radiance & moisture care" },
    { label: "Face Wash", href: "/category/face-wash", desc: "Gentle daily cleansers" },
    { label: "Sunscreen", href: "/category/sunscreen", desc: "Daily broad-spectrum defense" },
    { label: "Hand Wash", href: "/category/hand-wash", desc: "Nourishing botanical cleansers" },
    { label: "Lip Care", href: "/category/lip-care", desc: "Conditioning lip balms" },
    { label: "Body Care", href: "/category/body-care", desc: "Gentle cleansing soap bars" }
  ]);

  useEffect(() => {
    productService.getCategories()
      .then(cats => {
        if (cats && cats.length > 0) {
          const dynamicList = [
            { label: "All Products", href: "/shop", desc: "View complete skincare collection" },
            ...cats.filter(c => c.active !== false).map(c => ({
              label: c.name,
              href: `/category/${c.slug}`,
              desc: c.description || `Explore ${c.name.toLowerCase()} essentials`
            }))
          ];
          setCategories(dynamicList);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="gf-header">
      <div className="gf-header-container">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="gf-header-left">
          <button
            type="button"
            className="gf-hamburger"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="gf-logo" aria-label="Glow Face Skincare">
            <span className="gf-logo-main">GLOW FACE</span>
            <span className="gf-logo-sub">SKINCARE ESSENTIALS</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="gf-desktop-nav" aria-label="Main Navigation">
          <div
            className="gf-nav-item gf-dropdown-trigger"
            ref={dropdownRef}
            onMouseEnter={() => setShopDropdownOpen(true)}
            onMouseLeave={() => setShopDropdownOpen(false)}
          >
            <Link
              to="/shop"
              className={`gf-nav-link ${shopDropdownOpen ? "active" : ""}`}
              onClick={() => setShopDropdownOpen(false)}
            >
              <span>SHOP</span>
              <ChevronDown size={14} className="gf-nav-arrow" />
            </Link>

            {shopDropdownOpen && (
              <div className="gf-shop-dropdown" role="menu">
                <div className="gf-dropdown-grid">
                  {categories.map(cat => (
                    <Link
                      key={cat.href}
                      to={cat.href}
                      className="gf-dropdown-item"
                      role="menuitem"
                      onClick={() => setShopDropdownOpen(false)}
                    >
                      <strong className="gf-dropdown-title">{cat.label}</strong>
                      <span className="gf-dropdown-desc">{cat.desc}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/about" className="gf-nav-link">
            <span>ABOUT</span>
          </Link>

          <Link to="/orders" className="gf-nav-link">
            <span>TRACK ORDER</span>
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="gf-header-actions">
          {/* Search Trigger */}
          <button
            type="button"
            className="gf-icon-btn gf-search-btn"
            onClick={onSearchOpen || (() => navigate("/shop"))}
            aria-label="Search products"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="gf-icon-btn gf-wishlist-btn"
            aria-label={`Wishlist (${wishlist.length} items)`}
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="gf-badge-count">{wishlist.length}</span>
            )}
          </Link>

          {/* Cart Bag Trigger */}
          <button
            type="button"
            className="gf-icon-btn gf-cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label={`Shopping bag (${cartCount} items)`}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="gf-badge-count">{cartCount}</span>
            )}
          </button>

          {/* Account / User Menu */}
          <div className="gf-user-menu-wrapper" ref={userRef}>
            <button
              type="button"
              className={`gf-icon-btn ${isAdmin ? "gf-admin-badge-btn" : ""}`}
              onClick={() => setUserDropdownOpen(prev => !prev)}
              aria-label="Account menu"
            >
              {isAdmin ? (
                <ShieldAlert size={20} color="var(--gold-dark)" />
              ) : (
                <UserIcon size={20} />
              )}
            </button>

            {userDropdownOpen && (
              <div className="gf-user-dropdown" role="menu">
                {user ? (
                  <>
                    <div className="gf-user-header">
                      <strong>{user.name || "Customer"}</strong>
                      <span>{user.email}</span>
                      {isAdmin && <span className="gf-admin-tag">Admin</span>}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="gf-dropdown-link gf-admin-link"
                        role="menuitem"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="gf-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      My Profile
                    </Link>

                    <Link
                      to="/orders"
                      className="gf-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      My Orders
                    </Link>

                    <button
                      type="button"
                      className="gf-dropdown-link gf-logout-btn"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate("/");
                      }}
                    >
                      <LogOut size={15} />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="gf-dropdown-link gf-primary-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="gf-dropdown-link"
                      role="menuitem"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="gf-mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="gf-mobile-drawer"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Mobile Navigation"
          >
            <div className="gf-mobile-drawer__header">
              <span className="gf-logo-main">GLOW FACE</span>
              <button
                type="button"
                className="gf-mobile-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="gf-mobile-drawer__body">
              {/* Quick Search */}
              <form className="gf-mobile-search-form" onSubmit={handleMobileSearch}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={mobileSearch}
                  onChange={e => setMobileSearch(e.target.value)}
                  className="gf-mobile-search-input"
                  aria-label="Search products"
                />
                <button type="submit" className="gf-mobile-search-submit" aria-label="Search">
                  <Search size={18} />
                </button>
              </form>

              {/* Quick Navigation Badges */}
              <div className="gf-mobile-quick-nav">
                <Link to="/" className="gf-mobile-quick-btn" onClick={() => setMobileMenuOpen(false)}>
                  <HomeIcon size={16} />
                  <span>Home</span>
                </Link>
                <Link to="/shop" className="gf-mobile-quick-btn" onClick={() => setMobileMenuOpen(false)}>
                  <ShoppingBag size={16} />
                  <span>Shop</span>
                </Link>
                <Link to="/wishlist" className="gf-mobile-quick-btn" onClick={() => setMobileMenuOpen(false)}>
                  <Heart size={16} />
                  <span>Wishlist {wishlist.length > 0 ? `(${wishlist.length})` : ""}</span>
                </Link>
                <button
                  type="button"
                  className="gf-mobile-quick-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartOpen(true);
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>Cart {cartCount > 0 ? `(${cartCount})` : ""}</span>
                </button>
              </div>

              <div className="gf-mobile-section-label">CATEGORIES</div>
              <ul className="gf-mobile-links">
                {categories.map(cat => (
                  <li key={cat.href}>
                    <Link
                      to={cat.href}
                      className="gf-mobile-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="gf-mobile-section-label">BRAND & SUPPORT</div>
              <ul className="gf-mobile-links">
                <li>
                  <Link
                    to="/about"
                    className="gf-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Glow Face
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="gf-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className="gf-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Track Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/wishlist"
                    className="gf-mobile-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist ({wishlist.length})
                  </Link>
                </li>
              </ul>

              <div className="gf-mobile-section-label">ACCOUNT</div>
              <ul className="gf-mobile-links">
                {user ? (
                  <>
                    <li>
                      <Link
                        to="/profile"
                        className="gf-mobile-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Account ({user.name || user.email})
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link
                          to="/admin"
                          className="gf-mobile-link gf-mobile-admin-link"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Portal
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        className="gf-mobile-link gf-mobile-logout"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                          navigate("/");
                        }}
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="gf-mobile-link gf-mobile-link--highlight"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        className="gf-mobile-link"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};