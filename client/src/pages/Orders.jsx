import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Package,
  ShoppingBag,
  ShieldCheck,
  Truck,
  CalendarDays,
  CreditCard,
  ReceiptText,
} from "lucide-react";
import api from "../services/api";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => {
        const found = data.find((o) => o._id === id);
        if (found) setOrder(found);
        else setError("Order not found in your account.");
      })
      .catch(() => setError("Could not load your order."));
  }, [id]);

  return (
    <main className="container page-section orders-page">
      {error ? (
        <section className="orders-error">
          <div className="orders-error-icon">
            <Package size={27} />
          </div>
          <p className="eyebrow">ORDER DETAILS</p>
          <h2>We couldn't find your order.</h2>
          <p>{error}</p>
          <Link to="/orders" className="button button-dark">
            View my orders <ArrowRight size={16} />
          </Link>
        </section>
      ) : !order ? (
        <section className="orders-loading">
          <div className="orders-loading-mark">
            <Package size={25} />
          </div>
          <p className="eyebrow">JUST A MOMENT</p>
          <h2>Getting your order details...</h2>
          <p>Please wait while we retrieve your information.</p>
        </section>
      ) : (
        <div className="order-confirmation-page">
          <Link to="/shop" className="orders-back-link">
            <ArrowLeft size={15} />
            Continue shopping
          </Link>

          <section className="confirmation-card confirmation-premium">
            <div className="confirmation-success-icon">
              <Check size={29} strokeWidth={1.6} />
            </div>

            <p className="eyebrow">IT'S OFFICIAL</p>

            <h1>
              Thank <em>you.</em>
            </h1>

            <p className="confirmation-description">
              Your order has been placed successfully. We're glad you found
              something you love.
            </p>

            <div className="confirmation-status-banner">
              <div className="confirmation-status-icon">
                <Package size={21} />
              </div>
              <div>
                <strong>Order received</strong>
                <p>Your order is now in our system.</p>
              </div>
              <CheckCircle2 size={20} className="confirmation-status-check" />
            </div>

            <div className="order-reference order-reference-premium">
              <span>ORDER REFERENCE</span>
              <strong>{order._id}</strong>
            </div>

            <div className="confirmation-details">
              <div className="confirmation-detail-row">
                <span>
                  <ReceiptText size={16} />
                  Order status
                </span>
                <strong className="status-pill orders-status-pill">
                  {order.status}
                </strong>
              </div>

              <div className="confirmation-detail-row">
                <span>
                  <CreditCard size={16} />
                  Payment method
                </span>
                <strong>
                  {order.paymentMethod === "COD"
                    ? "Cash on delivery"
                    : "Pending"}
                </strong>
              </div>

              {order.createdAt && (
                <div className="confirmation-detail-row">
                  <span>
                    <CalendarDays size={16} />
                    Order date
                  </span>
                  <strong>
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              )}
            </div>

            <div className="confirmation-total">
              <div>
                <span>Total order value</span>
                <p>Payment is not collected online.</p>
              </div>
              <strong>{money(order.total)}</strong>
            </div>

            <div className="confirmation-actions">
              <Link className="button button-dark full-button" to="/orders">
                View my orders <ArrowRight size={16} />
              </Link>

              <Link
                className="button confirmation-secondary-button full-button"
                to="/shop"
              >
                Explore more pieces
              </Link>
            </div>

            <div className="confirmation-footnote">
              <ShieldCheck size={16} />
              <span>Keep your order reference for future enquiries.</span>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/orders/my")
      .then(({ data }) => setOrders(data))
      .catch(() => setError("Unable to load orders."));
  }, []);

  return (
    <main className="container page-section orders-page">
      <div className="my-orders-heading">
        <div>
          <p className="eyebrow">YOUR ACCOUNT / ORDER HISTORY</p>
          <h1 className="page-heading">
            Your orders<span>.</span>
          </h1>
          <p className="my-orders-subtitle">
            Everything you've chosen, all in one place.
          </p>
        </div>

        <div className="my-orders-heading-icon">
          <ShoppingBag size={23} strokeWidth={1.4} />
        </div>
      </div>

      {error && <p className="notice error">{error}</p>}

      {!error && orders.length > 0 && (
        <div className="my-orders-overview">
          <div>
            <span className="my-orders-overview-label">TOTAL ORDERS</span>
            <strong>{orders.length.toString().padStart(2, "0")}</strong>
          </div>
          <div>
            <span className="my-orders-overview-label">MOST RECENT</span>
            <strong>
              {new Date(orders[0].createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <section className="my-orders-list">
          <div className="my-orders-list-heading">
            <h2>Order history</h2>
            <span>{orders.length} records</span>
          </div>

          {orders.map((o) => (
            <article className="order-card order-card-premium" key={o._id}>
              <div className="order-card-top">
                <div className="order-card-date">
                  <div className="order-card-icon">
                    <Package size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="eyebrow">ORDER PLACED</p>
                    <strong>
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                </div>

                <span className="status-pill orders-status-pill">
                  {o.status}
                </span>
              </div>

              <div className="order-card-reference">
                <span>ORDER REFERENCE</span>
                <strong>#{o._id}</strong>
              </div>

              <div className="order-products order-products-premium">
                {o.items.map((i, index) => (
                  <div className="order-product-row" key={i._id || index}>
                    <div className="order-product-details">
                      <span className="order-product-bullet" />
                      <span>{i.name}</span>
                    </div>
                    <span className="order-product-quantity">
                      Qty {i.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="order-card-bottom">
                <div className="order-card-total">
                  <span>ORDER TOTAL</span>
                  <strong>{money(o.total)}</strong>
                </div>

                <Link to={`/orders/${o._id}`} className="order-view-details">
                  View details <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {!orders.length && !error && (
        <section className="my-orders-empty">
          <div className="my-orders-empty-icon">
            <ShoppingBag size={30} strokeWidth={1.4} />
          </div>
          <p className="eyebrow">A FRESH START</p>
          <h2>No orders just yet.</h2>
          <p>Your next favourite piece might be waiting in the collection.</p>
          <Link to="/shop" className="button button-dark">
            Explore the collection <ArrowRight size={16} />
          </Link>
        </section>
      )}

      <div className="my-orders-help">
        <Truck size={18} strokeWidth={1.5} />
        <p>
          <strong>Need a hand?</strong>
          <span>Your order reference can help you with future enquiries.</span>
        </p>
      </div>
    </main>
  );
}
