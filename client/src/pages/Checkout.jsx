import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Truck, CreditCard } from "lucide-react";
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
  const total = subtotal + shipping;

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

  if (!items.length) {
    return (
      <main className="container page-section checkout-empty">
        <div className="checkout-empty-icon">
          <Truck size={30} strokeWidth={1.4} />
        </div>
        <p className="eyebrow">YOUR SHOPPING BAG</p>
        <h2>Your bag is waiting for you.</h2>
        <p className="muted">Discover something you'll love.</p>
        <Link to="/shop" className="button button-dark">
          Explore collection
        </Link>
      </main>
    );
  }

  return (
    <main className="container page-section checkout-page">
      <Link to="/cart" className="checkout-back">
        <ArrowLeft size={16} />
        Back to bag
      </Link>

      <div className="checkout-heading">
        <div>
          <p className="eyebrow">ALMOST YOURS</p>
          <h1 className="page-heading">
            Checkout<span>.</span>
          </h1>
          <p className="checkout-subtitle">
            A few details, and your next favourite is on its way.
          </p>
        </div>

        <div className="checkout-secure">
          <ShieldCheck size={18} />
          <span>Secure checkout</span>
        </div>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form checkout-form-premium" onSubmit={submit}>
          <section className="checkout-section">
            <div className="checkout-section-heading">
              <span className="checkout-step">01</span>
              <div>
                <h2>Delivery details</h2>
                <p>Where should we send your order?</p>
              </div>
            </div>

            <div className="checkout-fields">
              {[
                ["fullName", "Full name", "text"],
                ["phone", "Phone number", "tel"],
                ["address", "Street address", "text"],
                ["city", "City", "text"],
                ["postalCode", "PIN code", "text"],
              ].map(([name, label, type]) => (
                <label
                  key={name}
                  className={`checkout-field ${
                    name === "address" ? "checkout-field-wide" : ""
                  }`}
                >
                  <span>{label}</span>
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
                    placeholder={
                      name === "fullName"
                        ? "Enter your full name"
                        : name === "phone"
                          ? "Enter your phone number"
                          : name === "address"
                            ? "House no., street, area"
                            : name === "city"
                              ? "Your city"
                              : "6-digit PIN code"
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="checkout-section checkout-payment-section">
            <div className="checkout-section-heading">
              <span className="checkout-step">02</span>
              <div>
                <h2>Payment method</h2>
                <p>Choose how you'd like to pay.</p>
              </div>
            </div>

            <div className="checkout-payment-option">
              <div className="checkout-payment-icon">
                <CreditCard size={21} strokeWidth={1.5} />
              </div>
              <div className="checkout-payment-copy">
                <strong>Cash on delivery</strong>
                <span>Pay when your order arrives</span>
              </div>
              <span className="checkout-selected">Selected</span>
            </div>

            <p className="checkout-payment-footnote">
              Online payments will be available in a later phase.
            </p>
          </section>

          {error && <p className="notice error">{error}</p>}

          <div className="checkout-actions">
            <button
              disabled={loading}
              className="button button-dark full-button checkout-place-order"
            >
              {loading
                ? "Placing order..."
                : `Place order · ₹${total.toLocaleString("en-IN")}`}
            </button>

            <button
              type="button"
              className="button button-emi full-button checkout-emi-button"
              onClick={() => navigate("/checkout/emi")}
            >
              <CreditCard size={18} />
              Buy with EMI
            </button>
          </div>

          <p className="checkout-terms">
            <ShieldCheck size={14} />
            Your details are used only to process your order.
          </p>
        </form>

        <aside className="summary-card checkout-summary-premium">
          <div className="checkout-summary-heading">
            <div>
              <p className="eyebrow">YOUR SELECTION</p>
              <h2>Order summary</h2>
            </div>
            <span className="checkout-item-count">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          <div className="checkout-items-list">
            {items.map((i) => (
              <div className="checkout-item" key={i.key}>
                <div className="checkout-item-image">
                  <img src={i.image} alt={i.name} />
                  <span>{i.quantity}</span>
                </div>

                <div className="checkout-item-details">
                  <strong>{i.name}</strong>
                  <p className="muted">Size: {i.size}</p>
                  <p className="checkout-item-unit">
                    ₹{i.price.toLocaleString("en-IN")} each
                  </p>
                </div>

                <strong className="checkout-item-price">
                  ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-summary-calculations">
            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-line">
              <span>Shipping</span>
              <span className={shipping === 0 ? "checkout-free" : ""}>
                {shipping === 0 ? "FREE" : `₹${shipping}`}
              </span>
            </div>

            {subtotal > 0 && subtotal < 2500 && (
              <p className="checkout-shipping-hint">
                Add ₹{(2500 - subtotal).toLocaleString("en-IN")} more for free
                shipping.
              </p>
            )}

            <div className="summary-line total-line checkout-total">
              <div>
                <strong>Total</strong>
                <p>Inclusive of applicable charges</p>
              </div>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div className="checkout-summary-footer">
            <ShieldCheck size={17} />
            <span>Safe, simple and secure shopping.</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
