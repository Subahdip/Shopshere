import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { addItem } = useCart();
  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        setSize(data.sizes?.[0] || "One Size");
      })
      .catch(() => setError("This product could not be found."));
  }, [id]);
  if (error)
    return (
      <main className="container page-section">
        <p className="notice error">{error}</p>
        <Link to="/shop" className="text-link">
          Back to shop
        </Link>
      </main>
    );
  if (!product)
    return <main className="container page-section">Loading product…</main>;
  return (
    <main className="container detail-page">
      <Link to="/shop" className="back-link">
        <ArrowLeft size={16} /> Back to collection
      </Link>
      <div className="detail-grid">
        <div className="detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="detail-info">
          <p className="eyebrow">{product.category} / SHOPSPHERE EDIT</p>
          <h1>{product.name}</h1>
          <p className="detail-price">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-rule" />
          <p className="field-label">Select size</p>
          <div className="size-options">
            {(product.sizes?.length ? product.sizes : ["One Size"]).map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={size === s ? "selected" : ""}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="stock-note">
            {product.stock > 0
              ? `${product.stock} available`
              : "Currently out of stock"}
          </p>
          <button
            className="button button-dark add-to-cart"
            disabled={product.stock === 0}
            onClick={() => {
              addItem(product, size);
              setMessage("Added to your bag.");
            }}
          >
            <ShoppingBag size={17} /> Add to bag — ₹
            {product.price.toLocaleString("en-IN")}
          </button>
          {message && (
            <p className="notice success">
              {message} <Link to="/cart">View bag</Link>
            </p>
          )}
          <div className="detail-perks">
            <p>
              01 <span>Thoughtful, everyday design</span>
            </p>
            <p>
              02{" "}
              <span>
                Secure checkout flow, payment integration coming later
              </span>
            </p>
            <p>
              03 <span>Free shipping on orders over ₹2,500</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
