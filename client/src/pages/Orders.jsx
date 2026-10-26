import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
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
    <main className="container page-section">
      {error ? (
        <p className="notice error">{error}</p>
      ) : !order ? (
        <p>Loading order…</p>
      ) : (
        <div className="confirmation-card">
          <span className="confirmation-mark">✓</span>
          <p className="eyebrow">ORDER RECEIVED</p>
          <h1>
            Thank you<span>.</span>
          </h1>
          <p>
            Your order has been placed. This is not an online payment
            confirmation.
          </p>
          <div className="order-reference">
            <span>Order reference</span>
            <strong>{order._id}</strong>
          </div>
          <div className="summary-line">
            <span>Status</span>
            <strong>{order.status}</strong>
          </div>
          <div className="summary-line">
            <span>Payment</span>
            <strong>
              {order.paymentMethod === "COD" ? "Cash on delivery" : "Pending"}
            </strong>
          </div>
          <div className="summary-line total-line">
            <span>Order total</span>
            <strong>{money(order.total)}</strong>
          </div>
          <Link className="button button-dark full-button" to="/orders">
            View my orders
          </Link>
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
    <main className="container page-section">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1 className="page-heading">
        Your orders<span>.</span>
      </h1>
      {error && <p className="notice error">{error}</p>}
      {orders.map((o) => (
        <article className="order-card" key={o._id}>
          <div>
            <p className="eyebrow">ORDER PLACED</p>
            <strong>{new Date(o.createdAt).toLocaleDateString("en-IN")}</strong>
            <p className="muted">#{o._id}</p>
          </div>
          <div>
            <p className="eyebrow">STATUS</p>
            <span className="status-pill">{o.status}</span>
          </div>
          <div>
            <p className="eyebrow">TOTAL</p>
            <strong>{money(o.total)}</strong>
          </div>
          <div className="order-products">
            {o.items.map((i, index) => (
              <span key={index}>
                {i.name} × {i.quantity}
              </span>
            ))}
          </div>
        </article>
      ))}
      {!orders.length && !error && (
        <div className="empty-state">
          <h2>No orders yet.</h2>
          <Link to="/shop" className="text-link">
            Explore the collection
          </Link>
        </div>
      )}
    </main>
  );
}
