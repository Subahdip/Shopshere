import React, { useEffect, useState } from "react";
import api from "../services/api";
const blank = {
  name: "",
  slug: "",
  description: "",
  category: "Women",
  price: "",
  image: "",
  sizes: "XS,S,M,L,XL",
  stock: "0",
  featured: false,
};
export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function load() {
    try {
      const [p, o] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load admin data.");
    }
  }
  useEffect(() => {
    load();
  }, []);
  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }
  function edit(p) {
    setEditing(p._id);
    setForm({
      ...p,
      sizes: p.sizes.join(","),
      price: String(p.price),
      stock: String(p.stock),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function save(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      slug:
        form.slug.trim() ||
        form.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
    };
    try {
      if (editing) await api.put(`/products/${editing}`, payload);
      else await api.post("/products", payload);
      setMessage(editing ? "Product updated." : "Product created.");
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product.");
    }
  }
  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  }
  async function status(id, value) {
    try {
      await api.patch(`/orders/${id}/status`, { status: value });
      setOrders((old) =>
        old.map((o) => (o._id === id ? { ...o, status: value } : o)),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status.");
    }
  }
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  return (
    <main className="container page-section admin-page">
      <p className="eyebrow">SHOPSPHERE / BACK OFFICE</p>
      <h1 className="page-heading">
        Admin dashboard<span>.</span>
      </h1>
      {message && <p className="notice success">{message}</p>}
      {error && <p className="notice error">{error}</p>}
      <div className="stats-grid">
        <div className="stat-card">
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="stat-card">
          <span>Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="stat-card">
          <span>Order value*</span>
          <strong>₹{revenue.toLocaleString("en-IN")}</strong>
        </div>
        <div className="stat-card">
          <span>Items in stock</span>
          <strong>{products.reduce((sum, p) => sum + p.stock, 0)}</strong>
        </div>
      </div>
      <section className="admin-section">
        <h2>{editing ? "Edit product" : "Add a product"}</h2>
        <form className="admin-form" onSubmit={save}>
          <label>
            Product name
            <input name="name" required value={form.name} onChange={change} />
          </label>
          <label>
            Slug (unique)
            <input
              name="slug"
              value={form.slug}
              onChange={change}
              placeholder="generated-from-name"
            />
          </label>
          <label>
            Category
            <select name="category" value={form.category} onChange={change}>
              <option>Women</option>
              <option>Men</option>
              <option>Accessories</option>
            </select>
          </label>
          <label>
            Price (₹)
            <input
              name="price"
              required
              type="number"
              min="0"
              value={form.price}
              onChange={change}
            />
          </label>
          <label>
            Stock
            <input
              name="stock"
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={change}
            />
          </label>
          <label>
            Sizes, comma separated
            <input name="sizes" value={form.sizes} onChange={change} />
          </label>
          <label className="wide-field">
            Image URL
            <input
              name="image"
              required
              type="url"
              value={form.image}
              onChange={change}
            />
          </label>
          <label className="wide-field">
            Description
            <textarea
              name="description"
              required
              value={form.description}
              onChange={change}
              rows="3"
            />
          </label>
          <label className="checkbox-label">
            <input
              name="featured"
              type="checkbox"
              checked={!!form.featured}
              onChange={change}
            />{" "}
            Feature on homepage
          </label>
          <div className="form-actions">
            <button className="button button-dark">
              {editing ? "Save changes" : "Create product"}
            </button>
            {editing && (
              <button
                type="button"
                className="button button-light"
                onClick={() => {
                  setEditing(null);
                  setForm(blank);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="admin-section">
        <h2>
          Products <span className="muted">({products.length})</span>
        </h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-product">
                      <img src={p.image} alt="" />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>₹{p.price.toLocaleString("en-IN")}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => edit(p)}>Edit</button>
                      <button
                        className="danger-text"
                        onClick={() => remove(p._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-section">
        <h2>
          Recent orders <span className="muted">({orders.length})</span>
        </h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order / customer</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <strong>#{o._id.slice(-7)}</strong>
                    <p className="muted">
                      {o.user?.name || "Customer"} · {o.user?.email || ""}
                    </p>
                  </td>
                  <td>₹{o.total.toLocaleString("en-IN")}</td>
                  <td>
                    {o.paymentMethod === "COD" ? "Cash on delivery" : "Unpaid"}
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => status(o._id, e.target.value)}
                      aria-label={`Status for order ${o._id}`}
                    >
                      <option>Placed</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">
          *Order value is the sum of all orders and is not a verified
          payment-revenue figure.
        </p>
      </section>
    </main>
  );
}
