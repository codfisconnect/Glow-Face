import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { productService } from "../../services";
import { Product, Category } from "../../types";
import { ProductGrid } from "../../components/product/ProductGrid/ProductGrid";
import { EmptyState } from "../../components/common/EmptyState/EmptyState";
import { Button } from "../../components/common/Button/Button";
import "./Shop.css";

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sortBy") || "featured";
  const inStockOnly = searchParams.get("inStock") === "true";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    productService.getProducts({
      category: currentCategory || undefined,
      search: currentSearch || undefined,
      sortBy: currentSort,
      inStockOnly,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit: 50
    })
      .then(res => {
        setProducts(res.products);
        setTotal(res.total);
      })
      .catch(err => console.warn("Failed to fetch products", err))
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, currentSort, inStockOnly, minPrice, maxPrice]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setMobileFilterOpen(false);
  };

  const hasActiveFilters = Boolean(currentCategory || currentSearch || inStockOnly || minPrice || maxPrice);

  return (
    <div className="gf-shop-page">
      {/* Top Banner */}
      <header className="gf-shop-hero">
        <div className="gf-container">
          <span className="gf-shop-sub">Botanical Formulations</span>
          <h1 className="gf-shop-title">SHOP ALL PRODUCTS</h1>
          <p className="gf-shop-desc">
            Explore authentic, individual skincare formulations crafted with clean botanical actives.
          </p>
        </div>
      </header>

      <div className="gf-container gf-shop-body">
        {/* Controls Bar */}
        <div className="gf-shop-controls">
          {/* Search Input */}
          <div className="gf-search-wrap">
            <Search size={18} className="gf-search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name, ingredient, or concern..."
              value={currentSearch}
              onChange={e => updateParam("search", e.target.value)}
              className="gf-search-input"
              aria-label="Search skincare products"
            />
            {currentSearch && (
              <button
                type="button"
                className="gf-search-clear"
                onClick={() => updateParam("search", null)}
                aria-label="Clear search query"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Right Controls: Filter Drawer Toggle & Sort */}
          <div className="gf-controls-right">
            <button
              type="button"
              className="gf-mobile-filter-btn"
              onClick={() => setMobileFilterOpen(p => !p)}
              aria-label="Open filter sidebar"
            >
              <SlidersHorizontal size={16} />
              <span>Filters {hasActiveFilters && "•"}</span>
            </button>

            <div className="gf-sort-wrap">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={currentSort}
                onChange={e => updateParam("sortBy", e.target.value)}
                className="gf-sort-select"
              >
                <option value="featured">Featured Priority</option>
                <option value="bestSeller">Bestsellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="gf-category-pills" role="navigation" aria-label="Category Filters">
          <button
            type="button"
            className={`gf-cat-pill ${!currentCategory ? "active" : ""}`}
            onClick={() => updateParam("category", null)}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.slug}
              type="button"
              className={`gf-cat-pill ${currentCategory === c.slug ? "active" : ""}`}
              onClick={() => updateParam("category", c.slug)}
            >
              <span>{c.icon || "🌿"}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>

        <div className="gf-shop-layout">
          {/* Left Desktop Sidebar / Mobile Drawer */}
          {mobileFilterOpen && (
            <div
              className="gf-filter-backdrop"
              onClick={() => setMobileFilterOpen(false)}
            />
          )}

          <aside className={`gf-shop-sidebar ${mobileFilterOpen ? "open" : ""}`} aria-label="Filters">
            <div className="gf-sidebar-header">
              <h3>Filter Formulations</h3>
              <button
                type="button"
                className="gf-close-filter-btn"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="gf-clear-filters-btn"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            )}

            {/* Availability */}
            <div className="gf-filter-block">
              <h4 className="gf-filter-heading">Availability</h4>
              <label className="gf-checkbox-label">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => updateParam("inStock", e.target.checked ? "true" : null)}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Price Filter */}
            <div className="gf-filter-block">
              <h4 className="gf-filter-heading">Price Range (₹)</h4>
              <div className="gf-price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={e => updateParam("minPrice", e.target.value)}
                  className="gf-price-input"
                  aria-label="Minimum price"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={e => updateParam("maxPrice", e.target.value)}
                  className="gf-price-input"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            {mobileFilterOpen && (
              <div className="gf-sidebar-apply">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            )}
          </aside>

          {/* Right Product Grid Area */}
          <main className="gf-shop-main">
            {/* Results count & active tags */}
            <div className="gf-results-meta">
              <span className="gf-results-count">
                Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
              </span>

              {hasActiveFilters && (
                <div className="gf-active-tags">
                  {currentCategory && (
                    <span className="gf-active-tag">
                      Category: {currentCategory}
                      <button onClick={() => updateParam("category", null)} aria-label="Remove category filter">×</button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="gf-active-tag">
                      In Stock
                      <button onClick={() => updateParam("inStock", null)} aria-label="Remove in stock filter">×</button>
                    </span>
                  )}
                  {(minPrice || maxPrice) && (
                    <span className="gf-active-tag">
                      Price: ₹{minPrice || "0"} - ₹{maxPrice || "Any"}
                      <button
                        onClick={() => {
                          updateParam("minPrice", null);
                          updateParam("maxPrice", null);
                        }}
                        aria-label="Remove price filter"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="gf-product-grid gf-product-grid--cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="gf-card-skeleton" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No Formulations Found"
                description="Try broadening your search or resetting your active filters."
                actionText="Reset All Filters"
                onActionClick={clearAllFilters}
              />
            ) : (
              <ProductGrid products={products} columns={3} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};