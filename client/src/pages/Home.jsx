import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React, { useEffect, useState } from "react";
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
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">THE EVERYDAY EDIT · NO. 01</p>
          <h1>
            Less, but
            <br />
            <em>better.</em>
          </h1>
          <p className="hero-description">
            Thoughtful pieces. Easy silhouettes. A wardrobe that feels like you
            — every single day.
          </p>
          <Link to="/shop" className="button button-dark">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
          <div className="hero-foot">
            <span>Designed for repeat wear.</span>
            <ArrowDownRight size={19} />
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1300&q=90"
            alt="Neutral-toned contemporary fashion"
          />
          <div className="image-caption">
            <span>01 / THE NEW UNIFORM</span>
            <span>Everyday, elevated.</span>
          </div>
        </div>
        <span className="hero-side-label">STYLE WITH INTENTION — 2026</span>
      </section>
      <section className="section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>
              The everyday edit<span>.</span>
            </h2>
          </div>
          <Link className="text-link" to="/shop">
            View all pieces <ArrowUpRight size={16} />
          </Link>
        </div>
        {error && <p className="notice error">{error}</p>}
        <div className="product-grid">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {!products.length && !error && (
            <p className="muted">Loading the collection…</p>
          )}
        </div>
      </section>
      <section id="story" className="story-section">
        <div className="container story-grid">
          <div>
            <p className="eyebrow">OUR APPROACH</p>
            <h2>
              Buy less.
              <br />
              <em>Choose well.</em>
            </h2>
          </div>
          <div className="story-copy">
            <p>
              We believe getting dressed should feel simple. ShopSphere brings
              together versatile essentials with considered shapes, easy
              textures, and the kind of quality you reach for again and again.
            </p>
            <Link className="text-link" to="/shop">
              Find your everyday <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
