import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { Product, Category as ICategory } from "../../types";
import { ProductGrid } from "../../components/product/ProductGrid/ProductGrid";
import { EmptyState } from "../../components/common/EmptyState/EmptyState";
import "./Category.css";

export const Category: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<ICategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      productService.getCategoryBySlug(slug),
      productService.getProducts({
        category: slug,
        sortBy,
        inStockOnly
      })
    ])
      .then(([catRes, prodRes]) => {
        setCategory(catRes);
        setProducts(prodRes.products);
      })
      .catch(err => console.warn("Failed to load category products", err))
      .finally(() => setLoading(false));
  }, [slug, sortBy, inStockOnly]);

  return (
    <div className="gf-category-page">
      {/* Category Hero Header */}
      <header className="gf-category-hero">
        <div className="gf-container">
          <nav className="gf-cat-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <span aria-current="page">{category?.name || slug}</span>
          </nav>

          <div className="gf-cat-header-content">
            <span className="gf-cat-header-icon">{category?.icon || "🌿"}</span>
            <h1 className="gf-cat-header-title">{category?.name || slug?.replace(/-/g, " ")}</h1>
            <p className="gf-cat-header-desc">
              {category?.description || "Targeted botanical skincare formulations crafted for your daily ritual."}
            </p>
          </div>
        </div>
      </header>

      <div className="gf-container gf-cat-body">
        {/* Controls Bar */}
        <div className="gf-cat-controls">
          <span className="gf-cat-product-count">
            Showing <strong>{products.length}</strong> {products.length === 1 ? "formulation" : "formulations"}
          </span>

          <div className="gf-cat-filters">
            <label className="gf-cat-stock-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
              />
              <span>In Stock Only</span>
            </label>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="gf-cat-sort-select"
              aria-label="Sort category products"
            >
              <option value="featured">Featured Priority</option>
              <option value="bestSeller">Bestsellers First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="gf-product-grid gf-product-grid--cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="gf-card-skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No Products in This Category"
            description="We are currently restocking this collection. Explore our complete skincare catalog in the meantime."
            actionText="Explore All Products"
            actionLink="/shop"
          />
        ) : (
          <ProductGrid products={products} columns={4} />
        )}
      </div>
    </div>
  );
};