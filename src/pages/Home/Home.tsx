import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { productService } from "../../services/productService";
import { Product, Category } from "../../types";
import { ProductGrid } from "../../components/product/ProductGrid/ProductGrid";
import { InstagramFeed } from "../../components/social/InstagramFeed";
import { Button } from "../../components/common/Button/Button";
import "./Home.css";

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 4, sortBy: "bestSeller" }),
      productService.getCategories()
    ])
      .then(([prodRes, catRes]) => {
        setFeaturedProducts(prodRes.products.slice(0, 4));
        setCategories(catRes.filter(c => c.active));
      })
      .catch(err => console.warn("Failed to load home data", err))
      .finally(() => setLoading(false));
  }, []);

  // Category imagery map using actual assets
  const categoryImages: Record<string, string> = {
    "face-cream": "/assets/cream-hero.jpg",
    "face-wash": "/assets/cream-open.jpg",
    "sunscreen": "/assets/cream-box.jpg",
    "lip-care": "/assets/lip-balm.jpg",
    "body-care": "/assets/soap.jpg",
    "hand-wash": "/assets/cream-ingred.jpg"
  };

  return (
    <div className="gf-home-page">
      {/* ── SECTION 1: HERO ── */}
      <section className="gf-home-hero" aria-label="Hero Introduction">
        <div className="gf-container gf-home-hero__container">
          <div className="gf-home-hero__text">
            <span className="gf-home-hero__eyebrow">BOTANICAL SKINCARE</span>
            <h1 className="gf-home-hero__headline">
              AUTHENTIC BOTANICAL FORMULATIONS FOR RADIANT SKIN
            </h1>
            <p className="gf-home-hero__sub">
              Target hyperpigmentation, uneven skin tone, and dryness with concentrated Kojic Acid, Alpha Arbutin, and pure botanical extracts.
            </p>

            <div className="gf-home-hero__cta-group">
              <Link to="/shop">
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                  SHOP NOW
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" size="lg">
                  EXPLORE PRODUCTS
                </Button>
              </Link>
            </div>
          </div>

          <div className="gf-home-hero__visual">
            <div className="gf-home-hero__image-card">
              <img
                src="/assets/cream-hero.jpg"
                alt="Glow Face Kojic Acid Beauty Cream"
                className="gf-home-hero__img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: FEATURED PRODUCTS ── */}
      <section className="gf-home-section gf-home-featured" aria-label="Featured Essentials">
        <div className="gf-container">
          <div className="gf-home-section__header">
            <span className="gf-home-section__eyebrow">ESSENTIAL FORMULATIONS</span>
            <h2 className="gf-home-section__title">SHOP YOUR ESSENTIALS</h2>
            <p className="gf-home-section__subtitle">
              Pure, targeted skincare designed to protect and renew your skin daily.
            </p>
          </div>

          {loading ? (
            <div className="gf-product-grid gf-product-grid--cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="gf-home-card-skeleton" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} columns={4} />
          )}

          <div className="gf-home-section__footer-cta">
            <Link to="/shop">
              <Button variant="outline" size="md" icon={<ArrowRight size={16} />} iconPosition="right">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: SHOP BY CATEGORY ── */}
      <section className="gf-home-section gf-home-categories" aria-label="Shop By Category">
        <div className="gf-container">
          <div className="gf-home-section__header">
            <span className="gf-home-section__eyebrow">CURATED REGIMENS</span>
            <h2 className="gf-home-section__title">SHOP BY CATEGORY</h2>
            <p className="gf-home-section__subtitle">
              Browse individual skincare categories tailored for every step of your routine.
            </p>
          </div>

          <div className="gf-category-visual-grid">
            {categories.map(cat => {
              const bgImg = categoryImages[cat.slug] || "/assets/cream-hero.jpg";
              return (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="gf-category-visual-card"
                  aria-label={`Shop ${cat.name}`}
                >
                  <div className="gf-category-visual-card__media">
                    <img src={bgImg} alt={cat.name} loading="lazy" />
                    <div className="gf-category-visual-card__overlay" />
                  </div>
                  <div className="gf-category-visual-card__content">
                    <span className="gf-category-visual-card__icon">{cat.icon || "🌿"}</span>
                    <h3 className="gf-category-visual-card__name">{cat.name}</h3>
                    <span className="gf-category-visual-card__link">
                      Explore Collection <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: BRAND STORY ── */}
      <section className="gf-home-section gf-home-story" aria-label="Brand Story">
        <div className="gf-container gf-home-story__container">
          <div className="gf-home-story__media">
            <img
              src="/assets/cream-open.jpg"
              alt="Glow Face Skincare Texture and Formulation"
              className="gf-home-story__img"
              loading="lazy"
            />
          </div>
          <div className="gf-home-story__content">
            <span className="gf-home-section__eyebrow">OUR PHILOSOPHY</span>
            <h2 className="gf-home-story__title">GLOW FACE</h2>
            <p className="gf-home-story__text">
              Rooted in botanical wisdom, Glow Face formulates gentle, effective personal care products designed to restore natural skin radiance without harsh additives.
            </p>
            <div className="gf-home-story__cta">
              <Link to="/about">
                <Button variant="secondary" size="md" icon={<ArrowRight size={16} />} iconPosition="right">
                  ABOUT GLOW FACE
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: INSTAGRAM / SOCIAL ── */}
      <InstagramFeed />

      {/* ── SECTION 6: FINAL SHOPPING CTA ── */}
      <section className="gf-home-final-cta" aria-label="Final Shopping Call to Action">
        <div className="gf-container">
          <div className="gf-home-final-cta__box">
            <h2 className="gf-home-final-cta__title">FIND YOUR EVERYDAY ESSENTIALS</h2>
            <p className="gf-home-final-cta__desc">
              Experience gentle, effective skincare with free express delivery on all prepaid orders across India.
            </p>
            <div className="gf-home-final-cta__actions">
              <Link to="/shop">
                <Button variant="gold" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                  SHOP ALL PRODUCTS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};