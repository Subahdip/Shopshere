import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  MoveRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Headphones,
  Zap,
} from "lucide-react";

import api from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products?featured=true")
      .then(({ data }) => setProducts(data))
      .catch(() =>
        setError(
          "Could not load products. Check that the API and MongoDB are running.",
        ),
      );
  }, []);

  return (
    <main className="tech-home">
      {/* HERO SECTION */}
      <section className="tech-hero container">
        <div className="tech-hero-copy">
          <div className="tech-eyebrow">
            <span className="tech-live-dot" />
            THE FUTURE OF SHOPPING
            <span className="tech-edition">EST. 2026</span>
          </div>

          <h1 className="tech-hero-title">
            Technology
            <br />
            that moves
            <br />
            <em>you forward.</em>
          </h1>

          <p className="tech-hero-description">
            Discover powerful devices, smarter gadgets and everyday technology.
            Everything you need to stay connected, productive and ahead of the
            curve.
          </p>

          <div className="tech-hero-actions">
            <Link to="/shop" className="tech-primary-button">
              Shop electronics
              <ArrowUpRight size={19} />
            </Link>

            <a href="#featured" className="tech-secondary-link">
              Explore products
              <ArrowDown size={16} />
            </a>
          </div>

          <div className="tech-hero-meta">
            <span>01 — DISCOVER WHAT'S NEXT</span>
            <span>SMARTER TECHNOLOGY. BETTER LIVING.</span>
          </div>
        </div>

        <div className="tech-hero-visual">
          <div className="tech-hero-image">
            <img
              src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=90"
              alt="Modern electronics and technology products"
            />

            <div className="tech-image-gradient" />

            <div className="tech-image-top">
              <span>SHOPSPHERE / TECH</span>
              <Sparkles size={18} />
            </div>

            <div className="tech-image-content">
              <span>THE NEXT GENERATION</span>
              <h2>Upgrade your world.</h2>
              <p>Innovation starts here.</p>
            </div>

            <div className="tech-image-counter">
              <span>01</span>
              <span className="tech-counter-line" />
              <span>03</span>
            </div>
          </div>

          <div className="tech-floating-card">
            <div className="tech-floating-icon">
              <Zap size={21} />
            </div>
            <div>
              <strong>Power your everyday</strong>
              <span>Technology made simple</span>
            </div>
          </div>

          <div className="tech-vertical-text">
            EXPLORE THE POSSIBILITIES — 2026
          </div>
        </div>
      </section>

      {/* BENEFITS STRIP */}
      <section className="tech-benefits">
        <div className="container tech-benefits-grid">
          <div className="tech-benefit">
            <Truck size={23} />
            <div>
              <strong>Reliable Delivery</strong>
              <span>Delivered to your doorstep</span>
            </div>
          </div>

          <div className="tech-benefit">
            <ShieldCheck size={23} />
            <div>
              <strong>Secure Shopping</strong>
              <span>A safer shopping experience</span>
            </div>
          </div>

          <div className="tech-benefit">
            <Headphones size={23} />
            <div>
              <strong>Customer Support</strong>
              <span>We're here to help</span>
            </div>
          </div>

          <div className="tech-benefit">
            <Zap size={23} />
            <div>
              <strong>Latest Technology</strong>
              <span>Explore modern innovations</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section id="featured" className="tech-featured container">
        <div className="tech-section-heading">
          <div>
            <p className="tech-section-eyebrow">HANDPICKED FOR YOU</p>
            <h2>
              Technology worth
              <br />
              <em>exploring.</em>
            </h2>
            <p className="tech-section-description">
              Discover some of our featured electronics and find the right
              technology for your everyday needs.
            </p>
          </div>

          <Link to="/shop" className="tech-view-all">
            Browse all products
            <span>
              <ArrowUpRight size={19} />
            </span>
          </Link>
        </div>

        {error && <p className="notice error">{error}</p>}

        <div className="product-grid tech-product-grid">
          {products.slice(0, 4).map((product, index) => (
            <div className="tech-product-item" key={product._id}>
              <div className="tech-product-label">
                <span>0{index + 1}</span>
                <span>FEATURED TECH</span>
              </div>

              <ProductCard product={product} />
            </div>
          ))}

          {!products.length && !error && (
            <div className="tech-loading">
              <div className="tech-loading-line" />
              <p>Finding the latest technology for you...</p>
            </div>
          )}
        </div>

        {!error && products.length > 0 && (
          <div className="tech-featured-footer">
            <span>DISCOVER. COMPARE. UPGRADE.</span>
            <Link to="/shop">
              Explore the complete collection
              <MoveRight size={17} />
            </Link>
          </div>
        )}
      </section>

      {/* CATEGORY PROMO */}
      <section className="tech-category-section">
        <div className="container">
          <div className="tech-category-heading">
            <div>
              <p className="tech-section-eyebrow">FIND YOUR NEXT UPGRADE</p>
              <h2>
                Made for the
                <br />
                <em>way you live.</em>
              </h2>
            </div>

            <p>
              From work and entertainment to staying connected, find the devices
              that fit your world.
            </p>
          </div>

          <div className="tech-category-grid">
            <Link to="/shop" className="tech-category-card tech-category-large">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85"
                alt="Laptop and workspace"
                loading="lazy"
              />
              <div className="tech-category-overlay" />
              <div className="tech-category-info">
                <span>01 / PRODUCTIVITY</span>
                <h3>Laptops & Computing</h3>
                <p>Power through every task</p>
                <ArrowUpRight size={23} />
              </div>
            </Link>

            <Link to="/shop" className="tech-category-card">
              <img
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85"
                alt="Modern smartphone"
                loading="lazy"
              />
              <div className="tech-category-overlay" />
              <div className="tech-category-info">
                <span>02 / CONNECTIVITY</span>
                <h3>Smartphones</h3>
                <p>Stay connected everywhere</p>
                <ArrowUpRight size={23} />
              </div>
            </Link>

            <Link to="/shop" className="tech-category-card">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"
                alt="Wireless headphones"
                loading="lazy"
              />
              <div className="tech-category-overlay" />
              <div className="tech-category-info">
                <span>03 / ENTERTAINMENT</span>
                <h3>Audio & Accessories</h3>
                <p>Experience every detail</p>
                <ArrowUpRight size={23} />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section className="tech-story">
        <div className="container tech-story-layout">
          <div className="tech-story-visual">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1100&q=85"
              alt="Modern technology and collaborative workspace"
              loading="lazy"
            />

            <div className="tech-story-image-label">
              <span>SHOPSPHERE</span>
              <span>TECH FOR EVERYDAY LIFE.</span>
            </div>
          </div>

          <div className="tech-story-content">
            <p className="tech-section-eyebrow">THE SHOPSPHERE EXPERIENCE</p>

            <span className="tech-story-mark">S.</span>

            <h2>
              Technology
              <br />
              should make
              <br />
              life <em>better.</em>
            </h2>

            <p className="tech-story-description">
              At ShopSphere, we believe the right technology can transform the
              way you work, communicate and experience the world. Our goal is to
              make discovering your next favourite device simple and convenient.
            </p>

            <Link to="/shop" className="tech-story-button">
              Discover ShopSphere
              <span>
                <ArrowRight size={18} />
              </span>
            </Link>
          </div>
        </div>

        <div className="tech-story-bottom">
          TECHNOLOGY FOR EVERYDAY LIFE. — SHOPSPHERE
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="tech-final-cta container">
        <div>
          <p className="tech-section-eyebrow">YOUR NEXT UPGRADE STARTS HERE</p>
          <h2>
            Ready for what's
            <br />
            <em>next?</em>
          </h2>
        </div>

        <Link to="/shop" className="tech-final-button">
          Explore the store
          <ArrowUpRight size={20} />
        </Link>
      </section>
    </main>
  );
}
