import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 99;
  const total = subtotal + shipping;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="container page-section cart-page">
      <Link to="/shop" className="cart-back-link">
        <ArrowLeft size={16} />
        Continue shopping
      </Link>

      <header className="cart-heading">
        <div>
          <p className="eyebrow">YOUR SELECTION</p>
          <h1 className="page-heading">
            Your bag<span>.</span>
          </h1>
          <p className="cart-heading-subtitle">
            Considered pieces. Your own kind of style.
          </p>
        </div>

        {items.length > 0 && (
          <div className="cart-count">
            <ShoppingBag size={17} />
            <span>
              {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
            </span>
          </div>
        )}
      </header>

      {!items.length ? (
        <section className="cart-empty">
          <div className="cart-empty-icon">
            <ShoppingBag size={31} strokeWidth={1.4} />
          </div>
          <p className="eyebrow">A LITTLE SPACE FOR SOMETHING NEW</p>
          <h2>Your bag is taking a breather.</h2>
          <p>Find something you'll love wearing on repeat.</p>
          <Link to="/shop" className="button button-dark cart-empty-cta">
            Explore the shop <ArrowRight size={16} />
          </Link>
        </section>
      ) : (
        <div className="cart-layout cart-layout-premium">
          <section className="cart-items-panel">
            <div className="cart-panel-heading">
              <h2>Your items</h2>
              <span>Review your selection</span>
            </div>

            <div className="cart-items cart-items-premium">
              {items.map((item) => (
                <article className="cart-item cart-item-premium" key={item.key}>
                  <Link
                    to={`/product/${item.productId}`}
                    className="cart-product-image"
                  >
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className="cart-item-info cart-item-info-premium">
                    <div className="cart-product-top">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="product-name cart-product-name"
                        >
                          {item.name}
                        </Link>
                        <p className="cart-item-size">Size: {item.size}</p>
                      </div>

                      <strong className="cart-item-price">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>

                    <p className="cart-unit-price">
                      ₹{item.price.toLocaleString("en-IN")} per item
                    </p>

                    <div className="cart-item-bottom">
                      <div className="quantity-control cart-quantity-premium">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            item.quantity === 1
                              ? removeItem(item.key)
                              : updateQuantity(item.key, item.quantity - 1)
                          }
                        >
                          <Minus size={13} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                          onClick={() =>
                            updateQuantity(item.key, item.quantity + 1)
                          }
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-premium"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>

                    {item.quantity >= item.stock && (
                      <p className="cart-stock-note">
                        You've reached the available stock.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-delivery-note">
              <Truck size={19} strokeWidth={1.5} />
              <div>
                <strong>A little perk for your order</strong>
                <p>Enjoy free shipping on orders of ₹2,500 or more.</p>
              </div>
            </div>
          </section>

          <aside className="summary-card cart-summary-premium">
            <div className="cart-summary-heading">
              <p className="eyebrow">THE FINAL DETAILS</p>
              <h2>Order summary</h2>
            </div>

            <div className="cart-summary-items">
              <div className="summary-line">
                <span>Subtotal ({totalQuantity} items)</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <span className={shipping === 0 ? "cart-free-shipping" : ""}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
            </div>

            {subtotal > 0 && subtotal < 2500 && (
              <div className="cart-shipping-progress">
                <p>
                  You're ₹{(2500 - subtotal).toLocaleString("en-IN")} away from
                  free shipping.
                </p>
                <div className="cart-progress-track">
                  <div
                    className="cart-progress-fill"
                    style={{
                      width: `${Math.min((subtotal / 2500) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {subtotal >= 2500 && (
              <div className="cart-free-message">
                <Truck size={15} />
                You've unlocked free shipping!
              </div>
            )}

            <div className="summary-line total-line cart-total-premium">
              <div>
                <strong>Total</strong>
                <p>Inclusive of applicable charges</p>
              </div>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button
              type="button"
              className="button button-dark full-button cart-checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Continue to checkout <ArrowRight size={17} />
            </button>

            <p className="cart-payment-note">
              Payment is not collected online yet.
            </p>

            <div className="cart-secure-note">
              <ShieldCheck size={16} />
              <span>Your selection is ready when you are.</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
