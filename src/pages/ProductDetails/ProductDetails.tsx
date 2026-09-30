import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { productService } from "../../services";
import { Product } from "../../types";
import { ProductGallery } from "../../components/product/ProductGallery/ProductGallery";
import { ProductInfo } from "../../components/product/ProductInfo/ProductInfo";
import { RelatedProducts } from "../../components/product/RelatedProducts/RelatedProducts";
import { Loader } from "../../components/common/Loader/Loader";
import { EmptyState } from "../../components/common/EmptyState/EmptyState";
import "./ProductDetails.css";

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"benefits" | "ingredients" | "howToUse">("benefits");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    productService
      .getProductBySlug(slug)
      .then(async prod => {
        setProduct(prod);

        // Fetch related products from same category
        try {
          const related = await productService.getProducts({
            category: prod.categorySlug,
            limit: 5
          });
          setRelatedProducts(related.products.filter(p => p.id !== prod.id));
        } catch {
          setRelatedProducts([]);
        }
      })
      .catch(err => console.warn("Failed to load product details", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="gf-container gf-detail-loading">
        <Loader size="lg" text="Loading skincare formulation..." fullPage />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="gf-container">
        <EmptyState
          title="Product Not Found"
          description="The skincare formulation you are looking for does not exist or may have been updated."
          actionText="Explore All Products"
          actionLink="/shop"
        />
      </div>
    );
  }

  // Deduplicate gallery images
  const galleryImages = [
    product.image,
    ...(product.gallery || []),
    ...(product.images?.map(i => i.url) || [])
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  return (
    <div className="gf-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="gf-container gf-detail-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/category/${product.categorySlug}`}>
          {product.category?.name || product.categorySlug.replace(/-/g, " ")}
        </Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="gf-container gf-detail-grid">
        {/* Left Column: Gallery */}
        <div className="gf-detail-gallery-col">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
            discountBadge={product.discount}
          />
        </div>

        {/* Right Column: Information & Actions */}
        <div className="gf-detail-info-col">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Detailed Technical Tabs: Benefits / Ingredients / Usage */}
      <section className="gf-container gf-detail-tabs-section" aria-label="Product Information Details">
        <div className="gf-detail-tabs-nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "benefits"}
            className={`gf-detail-tab-btn ${activeTab === "benefits" ? "active" : ""}`}
            onClick={() => setActiveTab("benefits")}
          >
            Key Benefits
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ingredients"}
            className={`gf-detail-tab-btn ${activeTab === "ingredients" ? "active" : ""}`}
            onClick={() => setActiveTab("ingredients")}
          >
            Ingredients & Botanicals
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "howToUse"}
            className={`gf-detail-tab-btn ${activeTab === "howToUse" ? "active" : ""}`}
            onClick={() => setActiveTab("howToUse")}
          >
            How To Use
          </button>
        </div>

        <div className="gf-detail-tab-pane">
          {activeTab === "benefits" && (
            <div className="gf-tab-content gf-tab-content--benefits">
              <p className="gf-tab-lead">{product.description}</p>
              {product.benefits && product.benefits.length > 0 && (
                <ul className="gf-benefits-list">
                  {product.benefits.map((b, i) => (
                    <li key={i}>
                      <Check size={18} color="var(--green)" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "ingredients" && (
            <div className="gf-tab-content gf-tab-content--ingredients">
              {product.keyIngredients && product.keyIngredients.length > 0 && (
                <div className="gf-key-ingred-grid">
                  {product.keyIngredients.map((ing, i) => (
                    <div key={i} className="gf-ingred-card">
                      <Sparkles size={20} color="var(--gold-dark)" />
                      <h4>{ing.name}</h4>
                      <p>{ing.benefit}</p>
                    </div>
                  ))}
                </div>
              )}
              {product.ingredients && (
                <div className="gf-inci-block">
                  <h4>Full INCI Formulation:</h4>
                  <p>{product.ingredients}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "howToUse" && (
            <div className="gf-tab-content gf-tab-content--usage">
              <h4>Directions for Use:</h4>
              <p>{product.howToUse || "Gently apply onto clean skin. Smooth evenly until absorbed."}</p>
              {product.whoItsFor && (
                <div className="gf-who-for-box">
                  <strong>Recommended Skin Types:</strong>
                  <p>{product.whoItsFor}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related Formulations Carousel / Grid */}
      <div className="gf-container">
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
  );
};