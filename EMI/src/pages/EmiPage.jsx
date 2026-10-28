
import { useMemo, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import ProductSummary from "../components/ProductSummary.jsx";
import EmiCalculator from "../components/EmiCalculator.jsx";

export default function EmiPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState("");

  // Read the cart sent by ShopSphere through the URL.
  const cartData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const cartParam = params.get("cart");

    if (!cartParam) {
      return { items: [], error: "" };
    }

    try {
      const parsedCart = JSON.parse(cartParam);

      if (!Array.isArray(parsedCart) || parsedCart.length === 0) {
        return {
          items: [],
          error: "Your cart is empty. Please return to ShopSphere.",
        };
      }

      const invalidItem = parsedCart.some(
        (item) =>
          !item ||
          !item.productId ||
          typeof item.name !== "string" ||
          !item.name.trim() ||
          !Number.isFinite(Number(item.price)) ||
          Number(item.price) < 0 ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1
      );

      if (invalidItem) {
        return {
          items: [],
          error:
            "Some cart details are invalid. Please return to ShopSphere and try again.",
        };
      }

      return {
        items: parsedCart.map((item) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || "",
          size: item.size || "",
        })),
        error: "",
      };
    } catch {
      return {
        items: [],
        error: "Unable to read your cart. Please return to ShopSphere.",
      };
    }
  }, []);

  const items = cartData.items;

  // Match ShopSphere's current shipping rule:
  // Free shipping for orders of ₹2,500 or more.
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 99;
  const total = subtotal + shipping;

  // The calculator expects a single product object.
  // For multiple items, use the full cart total as the principal.
  const calculatorProduct = useMemo(() => {
    if (items.length === 0) {
      return null;
    }

    if (items.length === 1) {
      const item = items[0];

      return {
        ...item,
        price: item.price * item.quantity + shipping,
        quantity: item.quantity,
        description: `Quantity: ${item.quantity}${
          item.size ? ` | Size: ${item.size}` : ""
        }`,
      };
    }

    return {
      productId: "cart",
      name: `${items.length} products in your bag`,
      price: total,
      image: items[0].image,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      category: "Shopping cart",
      description: `${items.length} different products`,
    };
  }, [items, shipping, total]);

  function handleContinue(plan) {
    setSelectedPlan(plan);
    setError("");
  }

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="app-shell">
      <Navbar />

      <main className="main-content">
        <div className="page-intro">
          <p className="eyebrow">A MORE FLEXIBLE WAY TO SHOP</p>

          <h1>
            Good things,
            <br />
            <em>made affordable.</em>
          </h1>

          <p className="muted intro-description">
            Explore installment options and choose a payment plan
            that fits your budget.
          </p>
        </div>

        {cartData.error ? (
          <div className="status-card error-message">
            <h3>Unable to load your cart</h3>
            <p>{cartData.error}</p>
            <a href="http://localhost:5173/cart">
              Return to ShopSphere
            </a>
          </div>
        ) : calculatorProduct ? (
          <>
            {/* Cart items */}
            <section className="cart-summary-card">
              <div className="cart-summary-heading">
                <div>
                  <p className="eyebrow">YOUR SELECTION</p>
                  <h2>Order summary</h2>
                </div>

                <span>{items.length} products</span>
              </div>

              <div className="emi-cart-items">
                {items.map((item, index) => (
                  <div
                    className="emi-cart-item"
                    key={`${item.productId}-${item.size}-${index}`}
                  >
                    <div className="emi-cart-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="emi-image-placeholder">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="emi-cart-item-details">
                      <h3>{item.name}</h3>

                      {item.size && (
                        <p className="muted">Size: {item.size}</p>
                      )}

                      <p className="muted">
                        Quantity: {item.quantity}
                      </p>

                      <p>
                        ₹{item.price.toLocaleString("en-IN")} each
                      </p>
                    </div>

                    <strong>
                      ₹
                      {(item.price * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="emi-cart-totals">
                <div>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div>
                  <span>Shipping</span>
                  <span>
                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping.toLocaleString("en-IN")}`}
                  </span>
                </div>

                <div className="emi-cart-grand-total">
                  <strong>Order total</strong>
                  <strong>₹{total.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </section>

            {/* EMI calculator */}
            <div className="checkout-layout">
              <ProductSummary product={calculatorProduct} />

              <EmiCalculator
                product={calculatorProduct}
                onContinue={handleContinue}
              />
            </div>
          </>
        ) : (
          <div className="status-card error-message">
            <h3>No products selected</h3>
            <p>Please return to ShopSphere and select Buy with EMI.</p>
            <a href="http://localhost:5173/cart">
              Return to ShopSphere
            </a>
          </div>
        )}

        {error && (
          <div className="status-card error-message" role="alert">
            {error}
          </div>
        )}

        {selectedPlan && calculatorProduct && (
          <section className="success-notice" aria-live="polite">
            <h3>EMI plan selected</h3>

            <p>
              Selection: <strong>{calculatorProduct.name}</strong>
            </p>

            <p>
              Tenure:{" "}
              <strong>{selectedPlan.tenure} months</strong>
            </p>

            <p>
              Monthly EMI:{" "}
              <strong>
                ₹{formatCurrency(selectedPlan.monthlyEMI)}
              </strong>
            </p>

            <p>
              Total payable:{" "}
              <strong>
                ₹{formatCurrency(selectedPlan.totalPayable)}
              </strong>
            </p>

            <p className="muted">
              This is an estimate only, not an approved loan or
              confirmed financing agreement. Actual terms may vary.
            </p>
          </section>
        )}

        <footer className="page-footer" id="how-it-works">
          <span>SHOPSPHERE.</span>
          <span>Thoughtful shopping. Flexible planning.</span>
        </footer>
      </main>
    </div>
  );
}
