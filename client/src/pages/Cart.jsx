import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import React from "react";
export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 99;
  return (
    <main className="container page-section">
      <p className="eyebrow">YOUR SELECTION</p>
      <h1 className="page-heading">
        Your bag<span>.</span>
      </h1>
      {!items.length ? (
        <div className="empty-state">
          <ShoppingBag size={32} />
          <h2>Your bag is taking a breather.</h2>
          <p>Find something you'll love wearing on repeat.</p>
          <Link to="/shop" className="button button-dark">
            Explore the shop <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.key}>
                <Link to={`/product/${item.productId}`}>
                  <img src={item.image} alt={item.name} />
                </Link>
                <div className="cart-item-info">
                  <Link
                    to={`/product/${item.productId}`}
                    className="product-name"
                  >
                    {item.name}
                  </Link>
                  <p className="muted">Size: {item.size}</p>
                  <p className="price">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                  <div className="quantity-control">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() =>
                        item.quantity === 1
                          ? removeItem(item.key)
                          : updateQuantity(item.key, item.quantity - 1)
                      }
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stock}
                      onClick={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      className="remove-button"
                      aria-label="Remove item"
                      onClick={() => removeItem(item.key)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="summary-card">
            <h2>Order summary</h2>
            <div className="summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-line">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>
            {subtotal < 2500 && (
              <p className="shipping-hint">
                Spend ₹{(2500 - subtotal).toLocaleString("en-IN")} more for free
                shipping.
              </p>
            )}
            <div className="summary-line total-line">
              <span>Total</span>
              <strong>₹{(subtotal + shipping).toLocaleString("en-IN")}</strong>
            </div>
            <button
              className="button button-dark full-button"
              onClick={() => navigate("/checkout")}
            >
              Continue to checkout <ArrowRight size={16} />
            </button>
            <p className="summary-note">
              Taxes included where applicable. Payment is not collected online
              yet.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
