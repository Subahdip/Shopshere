import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
export default function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [error, setError] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "All") params.set("category", category);
      if (sort !== "newest") params.set("sort", sort);
      api
        .get(`/products?${params}`)
        .then(({ data }) => {
          setProducts(data);
          setError("");
        })
        .catch(() =>
          setError("Unable to load products. Is the backend running?"),
        );
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, sort]);
  return (
    <main className="container page-section">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">THE SHOP</p>
          <h1>
            Considered essentials<span>.</span>
          </h1>
          <p className="muted">Pieces made to be worn on repeat.</p>
        </div>
        <span className="result-count">{products.length} pieces</span>
      </div>
      <div className="shop-controls">
        <label className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the collection"
            aria-label="Search products"
          />
        </label>
        <div className="filter-row">
          <div className="category-filters">
            {["All", "Women", "Men", "Accessories"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`filter-chip ${category === c ? "active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="newest">Latest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>
      {error && <p className="notice error">{error}</p>}
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      {!products.length && !error && (
        <div className="empty-state">
          <h3>No pieces found.</h3>
          <p>Try another search or category.</p>
        </div>
      )}
    </main>
  );
}
