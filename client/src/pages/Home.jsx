import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  MoveRight,
  Sparkles,
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
    <main className="home-page">
      {/* Hero */}
      <section className="home-hero container">
        <div className="home-hero-copy">
          <div className="home-edition-label">
            <span className="home-edition-dot" />
            THE EVERYDAY EDIT
            <span className="home-edition-number">NO. 01 / 2026</span>
          </div>

          <h1 className="home-hero-title">
            Less,
            <br />
            but <em>better.</em>
          </h1>

          <p className="home-hero-description">
            Thoughtful pieces. Easy silhouettes. A wardrobe that feels like you
            — every single day.
          </p>

          <div className="home-hero-actions">
            <Link to="/shop" className="button button-dark home-primary-cta">
              Explore the collection
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="home-hero-bottom">
            <div className="home-hero-index">
              <span className="home-index-line" />
              <span>01 — A MORE CONSIDERED WARDROBE</span>
            </div>

            <a href="#featured" className="home-scroll-link">
              Discover more
              <ArrowDown size={15} />
            </a>
          </div>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-image">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1300&q=90"
              alt="Contemporary everyday fashion in a neutral palette"
            />

            <div className="home-image-overlay" />

            <div className="home-image-topline">
              <span>SHOPSPHERE STUDIO</span>
              <Sparkles size={15} strokeWidth={1.4} />
            </div>

            <div className="home-image-caption">
              <span className="home-image-caption-number">01 / 03</span>
              <div>
                <p>THE NEW UNIFORM</p>
                <h2>Everyday, elevated.</h2>
              </div>
            </div>
          </div>

          <div className="home-vertical-label">STYLE WITH INTENTION — 2026</div>

          <div className="home-image-stamp">
            <span>LESS</span>
            <span>NOISE.</span>
            <span>MORE</span>
            <span>YOU.</span>
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="home-brand-strip">
        <div className="container home-brand-strip-inner">
          <span>MADE FOR EVERYDAY</span>
          <span className="home-strip-divider" />
          <span>EFFORTLESS SILHOUETTES</span>
          <span className="home-strip-divider" />
          <span>YOUR STYLE, YOUR RULES</span>
        </div>
      </section>

      {/* Featured products */}
      <section id="featured" className="section container home-featured">
        <div className="section-heading home-featured-heading">
          <div>
            <p className="eyebrow">A FEW GOOD THINGS</p>
            <h2>
              The everyday
              <br className="home-mobile-break" /> edit<span>.</span>
            </h2>
            <p className="home-section-description">
              Pieces that work harder, pair easier, and stay in rotation.
            </p>
          </div>

          <Link className="home-view-all" to="/shop">
            <span>View all pieces</span>
            <span className="home-view-all-icon">
              <ArrowUpRight size={17} />
            </span>
          </Link>
        </div>

        {error && <p className="notice error">{error}</p>}

        <div className="product-grid home-product-grid">
          {products.slice(0, 4).map((p, index) => (
            <div className="home-product-reveal" key={p._id}>
              <div className="home-product-index">
                <span>0{index + 1}</span>
                <span>THE EDIT</span>
              </div>
              <ProductCard product={p} />
            </div>
          ))}

          {!products.length && !error && (
            <div className="home-loading">
              <div className="home-loading-line" />
              <p>Curating your collection...</p>
            </div>
          )}
        </div>

        {!error && products.length > 0 && (
          <div className="home-featured-footer">
            <span>GOOD STYLE. NO COMPLICATIONS.</span>
            <Link to="/shop">
              Discover your next favourite
              <MoveRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* Brand story */}
      <section id="story" className="home-story">
        <div className="container home-story-layout">
          <div className="home-story-heading">
            <p className="eyebrow">THE SHOPSPHERE POINT OF VIEW</p>
            <span className="home-story-mark">S.</span>
            <h2>
              Buy less.
              <br />
              <em>Choose well.</em>
            </h2>
            <span className="home-story-caption">
              A wardrobe that makes sense.
            </span>
          </div>

          <div className="home-story-content">
            <div className="home-story-image">
              <img
                src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1000&q=85"
                alt="Minimal contemporary clothing and considered styling"
                loading="lazy"
              />
              <span>THE ART OF EVERYDAY DRESSING</span>
            </div>

            <div className="home-story-copy">
              <p>
                We believe getting dressed should feel simple. ShopSphere brings
                together versatile essentials with considered shapes, easy
                textures, and the kind of style you reach for again and again.
              </p>

              <Link className="home-story-link" to="/shop">
                <span>Find your everyday</span>
                <span className="home-story-link-icon">
                  <ArrowRight size={17} />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="home-story-bottom-label">
          GOOD THINGS, WORN OFTEN. — SHOPSPHERE
        </div>
      </section>
    </main>
  );
}
