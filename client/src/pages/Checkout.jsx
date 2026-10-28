
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
} from "lucide-react";

import api from "../services/api";
import { useCart } from "../components/context/CartContext";

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

  const update = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Existing Cash on Delivery checkout
  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/orders", {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          size: item.size,
        })),
        shippingAddress: form,
        paymentMethod: "COD",
      });

      clearCart();
      navigate(`/orders/${data._id}`, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Navigate to the separate EMI calculator website
  function handleBuyWithEMI() {
    setError("");

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    // Prepare complete details for every item in the cart
    const cartData = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      image: item.image || "",
      quantity: Number(item.quantity),
      size: item.size || "",
    }));

    // Validate the data before navigating
    const invalidItem = cartData.some(
      (item) =>
        !item.productId ||
        !item.name ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    );

    if (invalidItem) {
      setError(
        "Some products have missing or invalid details. Please check your cart."
      );
      return;
    }

    try {
      const emiUrl = new URL("http://localhost:5174/");

      // Send the complete cart to the EMI frontend
      emiUrl.searchParams.set("cart", JSON.stringify(cartData));

      // Open the EMI calculator
      window.location.href = emiUrl.toString();
    } catch (err) {
      setError("Unable to open the EMI calculator. Please try again.");
    }
  }

  // Empty cart screen
  if (!items.length) {
    return (
      <main className="container page-section checkout-empty">
        <div className="checkout-empty-icon">
          <Truck size={30} strokeWidth={1.4} />
        </div>

        <p className="eyebrow">YOUR SHOPPING BAG</p>
        <h2>Your bag is waiting for you.</h2>
        <p className="muted">
          Discover something you'll love.
        </p>

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
        <form
          className="checkout-form checkout-form-premium"
          onSubmit={submit}
        >
          {/* Delivery details */}
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

          {/* Payment method */}
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

          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}

          {/* Checkout actions */}
          <div className="checkout-actions">
            <button
              type="submit"
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
              onClick={handleBuyWithEMI}
              disabled={loading}
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

        {/* Order summary */}
        <aside className="summary-card checkout-summary-premium">
          <div className="checkout-summary-heading">
            <div>
              <p className="eyebrow">YOUR SELECTION</p>
              <h2>Order summary</h2>
            </div>

            <span className="checkout-item-count">
              {items.reduce(
                (sum, item) => sum + Number(item.quantity),
                0
              )}{" "}
              items
            </span>
          </div>

          <div className="checkout-items-list">
            {items.map((item) => (
              <div className="checkout-item" key={item.key}>
                <div className="checkout-item-image">
                  <img src={item.image} alt={item.name} />
                  <span>{item.quantity}</span>
                </div>

                <div className="checkout-item-details">
                  <strong>{item.name}</strong>
                  <p className="muted">Size: {item.size}</p>

                  <p className="checkout-item-unit">
                    ₹{Number(item.price).toLocaleString("en-IN")} each
                  </p>
                </div>

                <strong className="checkout-item-price">
                  ₹
                  {(
                    Number(item.price) * Number(item.quantity)
                  ).toLocaleString("en-IN")}
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
                Add ₹{(2500 - subtotal).toLocaleString("en-IN")} more
                for free shipping.
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
