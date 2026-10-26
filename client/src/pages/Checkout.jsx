import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 99;
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
        })),
        shippingAddress: form,
        paymentMethod: "COD",
      });
      clearCart();
      navigate(`/orders/${data._id}`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  if (!items.length)
    return (
      <main className="container page-section empty-state">
        <h2>Your bag is empty.</h2>
        <Link to="/shop" className="text-link">
          Return to shop
        </Link>
      </main>
    );
  return (
    <main className="container page-section">
      <p className="eyebrow">ALMOST YOURS</p>
      <h1 className="page-heading">
        Checkout<span>.</span>
      </h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={submit}>
          <h2>Delivery details</h2>
          {[
            ["fullName", "Full name", "text"],
            ["address", "Street address", "text"],
            ["city", "City", "text"],
            ["postalCode", "PIN code", "text"],
            ["phone", "Phone number", "tel"],
          ].map(([name, label, type]) => (
            <label key={name}>
              {label}
              <input
                name={name}
                type={type}
                required
                value={form[name]}
                onChange={update}
                autoComplete={
                  name === "fullName"
                    ? "name"
                    : name === "address"
                      ? "street-address"
                      : name === "phone"
                        ? "tel"
                        : "off"
                }
              />
            </label>
          ))}
          <div className="payment-note">
            <strong>Payment method</strong>
            <p>
              Cash on delivery (COD) — online payments will be added in a later
              phase.
            </p>
          </div>
          {error && <p className="notice error">{error}</p>}
          <button disabled={loading} className="button button-dark full-button">
            {loading
              ? "Placing order…"
              : `Place order · ₹${(subtotal + shipping).toLocaleString("en-IN")}`}
          </button>
        </form>
        <aside className="summary-card">
          <h2>Your order</h2>
          {items.map((i) => (
            <div className="checkout-item" key={i.key}>
              <img src={i.image} alt="" />
              <div>
                <strong>{i.name}</strong>
                <p className="muted">
                  {i.size} · Qty {i.quantity}
                </p>
              </div>
              <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <div className="summary-line">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-line">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
          </div>
          <div className="summary-line total-line">
            <span>Total</span>
            <strong>₹{(subtotal + shipping).toLocaleString("en-IN")}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
