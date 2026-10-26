import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-image-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        <span className="image-arrow">
          <ArrowUpRight size={18} />
        </span>
        {product.stock === 0 && <span className="sold-out">Sold out</span>}
      </Link>
      <div className="product-meta">
        <div>
          <p className="eyebrow">{product.category}</p>
          <Link className="product-name" to={`/product/${product._id}`}>
            {product.name}
          </Link>
        </div>
        <span className="price">₹{product.price.toLocaleString("en-IN")}</span>
      </div>
    </article>
  );
}
