import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Shield, Sparkles } from "lucide-react";
import { Button } from "../../components/common/Button/Button";
import "./About.css";

export const About: React.FC = () => {
  return (
    <article className="gf-about-page" aria-label="About Glow Face">
      {/* 1. Hero */}
      <header className="gf-about-hero">
        <div className="gf-container gf-about-hero__container">
          <span className="gf-about-eyebrow">OUR STORY</span>
          <h1 className="gf-about-title">MINDFUL BOTANICAL SKINCARE</h1>
          <p className="gf-about-subtitle">
            Pure, targeted skincare formulations crafted to honor your natural skin barrier and reveal healthy radiance.
          </p>
        </div>
      </header>

      {/* 2. Visual Story Grid */}
      <section className="gf-about-story gf-container">
        <div className="gf-about-story__grid">
          <div className="gf-about-story__image-wrap">
            <img
              src="/assets/cream-hero.jpg"
              alt="Glow Face Formulation"
              className="gf-about-story__img"
            />
          </div>

          <div className="gf-about-story__content">
            <span className="gf-about-section-tag">ROOTED IN NATURE</span>
            <h2>THE GLOW FACE VISION</h2>
            <p>
              Glow Face was founded on a simple conviction: skincare should be honest, gentle, and profoundly effective. We combine cold-pressed botanical extracts with targeted brightening actives like Kojic Acid and Alpha Arbutin.
            </p>
            <p>
              Instead of aggressive bleaching agents that thin the epidermal layer, we craft balanced formulations that nourish the lipid barrier while addressing pigmentation, sun spots, and dryness.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Philosophy Pillars */}
      <section className="gf-about-pillars">
        <div className="gf-container">
          <div className="gf-about-pillars__header">
            <span className="gf-about-eyebrow">FOUNDATIONAL PRINCIPLES</span>
            <h2>OUR CORE PILLARS</h2>
          </div>

          <div className="gf-about-pillars__grid">
            <div className="gf-pillar-card">
              <div className="gf-pillar-icon">
                <Leaf size={24} color="var(--green)" />
              </div>
              <h3>Botanical Integrity</h3>
              <p>
                Each ingredient is carefully chosen for skin biocompatibility, from virgin coconut distillates to soothing papaya enzymes.
              </p>
            </div>

            <div className="gf-pillar-card">
              <div className="gf-pillar-icon">
                <Shield size={24} color="var(--green)" />
              </div>
              <h3>Barrier-First Philosophy</h3>
              <p>
                Healthy skin begins with an intact moisture barrier. Our formulations work with your skin’s natural rhythm, not against it.
              </p>
            </div>

            <div className="gf-pillar-card">
              <div className="gf-pillar-icon">
                <Sparkles size={24} color="var(--green)" />
              </div>
              <h3>Targeted Actives</h3>
              <p>
                Precise, stable active concentrations that target dullness and uneven tone while maintaining soothing moisture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Strong Visual Showcase */}
      <section className="gf-about-visual-banner gf-container">
        <div className="gf-about-banner-card">
          <div className="gf-about-banner-image">
            <img
              src="/assets/cream-open.jpg"
              alt="Glow Face Skincare Texture"
              loading="lazy"
            />
          </div>
          <div className="gf-about-banner-text">
            <h3>CRAFTED FOR YOUR DAILY RITUAL</h3>
            <p>
              Discover individual face and body essentials crafted with care and delivered fresh to your doorstep.
            </p>
            <Link to="/shop">
              <Button variant="gold" size="lg" icon={<ArrowRight size={18} />} iconPosition="right">
                EXPLORE ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Contact & Social CTA */}
      <section className="gf-about-social-cta gf-container">
        <div className="gf-about-social-box">
          <span className="gf-about-section-tag">STAY CONNECTED</span>
          <h3>TALK WITH GLOW FACE</h3>
          <p>
            Have inquiries about our botanical formulations or need direct assistance? Our customer care is always glad to help.
          </p>
          <div className="gf-about-social-actions">
            <Link to="/contact">
              <Button variant="primary" size="md">
                CONTACT CUSTOMER CARE
              </Button>
            </Link>
            <a href="https://www.instagram.com/glowface.kl/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="md">
                FOLLOW @GLOWFACE.KL
              </Button>
            </a>
          </div>
        </div>
      </section>
    </article>
  );
};
