import React, { useEffect, useState } from "react";
import {
  Package,
  ShoppingBag,
  IndianRupee,
  Boxes,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  ArrowUpRight,
  ClipboardList,
  Image as ImageIcon,
  Star,
  TrendingUp,
} from "lucide-react";
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

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [p, o] = await Promise.all([
        api.get("/products"),
        api.get("/orders"),
      ]);
      setProducts(p.data);
      setOrders(o.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load admin data.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  function cancelEdit() {
    setEditing(null);
    setForm(blank);
    setError("");
    setMessage("");
  }

  async function save(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

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
      if (editing) {
        await api.put(`/products/${editing}`, payload);
      } else {
        await api.post("/products", payload);
      }

      setMessage(editing ? "Product updated." : "Product created.");
      setForm(blank);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;

    setError("");
    setMessage("");

    try {
      await api.delete(`/products/${id}`);
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  }

  async function status(id, value) {
    setError("");
    setMessage("");

    try {
      await api.patch(`/orders/${id}/status`, { status: value });
      setOrders((old) =>
        old.map((o) => (o._id === id ? { ...o, status: value } : o)),
      );
      setMessage("Order status updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update order status.");
    }
  }

  const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const stockCount = products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  const lowStock = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) <= 5,
  ).length;
  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;

  return (
    <main className="container page-section admin-page admin-premium">
      {/* Dashboard header */}
      <header className="admin-hero">
        <div>
          <div className="admin-breadcrumb">
            <span>SHOPSPHERE</span>
            <span className="admin-breadcrumb-divider">/</span>
            <span>BACK OFFICE</span>
          </div>

          <h1 className="page-heading">
            Admin dashboard<span>.</span>
          </h1>

          <p className="admin-hero-description">
            Manage your collection, keep track of orders, and stay on top of
            your store.
          </p>
        </div>

        <button type="button" className="admin-refresh-button" onClick={load}>
          <RefreshCw size={15} />
          Refresh data
        </button>
      </header>

      {/* Notifications */}
      {message && (
        <div className="admin-alert admin-alert-success">
          <span className="admin-alert-dot" />
          {message}
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && (
        <div className="admin-alert admin-alert-error">
          <span className="admin-alert-dot" />
          {error}
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="admin-stats-grid">
        <article className="admin-stat-card">
          <div className="admin-stat-top">
            <span>PRODUCTS</span>
            <div className="admin-stat-icon">
              <Package size={19} />
            </div>
          </div>
          <strong className="admin-stat-value">{products.length}</strong>
          <div className="admin-stat-foot">
            <span>Products in catalogue</span>
            <ArrowUpRight size={15} />
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-top">
            <span>ORDERS</span>
            <div className="admin-stat-icon">
              <ShoppingBag size={19} />
            </div>
          </div>
          <strong className="admin-stat-value">{orders.length}</strong>
          <div className="admin-stat-foot">
            <span>Orders recorded</span>
            <ArrowUpRight size={15} />
          </div>
        </article>

        <article className="admin-stat-card admin-stat-highlight">
          <div className="admin-stat-top">
            <span>ORDER VALUE*</span>
            <div className="admin-stat-icon">
              <IndianRupee size={19} />
            </div>
          </div>
          <strong className="admin-stat-value admin-stat-money">
            {money(revenue)}
          </strong>
          <div className="admin-stat-foot">
            <span>Combined order totals</span>
            <TrendingUp size={15} />
          </div>
        </article>

        <article className="admin-stat-card">
          <div className="admin-stat-top">
            <span>ITEMS IN STOCK</span>
            <div className="admin-stat-icon">
              <Boxes size={19} />
            </div>
          </div>
          <strong className="admin-stat-value">{stockCount}</strong>
          <div className="admin-stat-foot">
            <span>
              {outOfStock > 0
                ? `${outOfStock} products out of stock`
                : lowStock > 0
                  ? `${lowStock} products running low`
                  : "Inventory overview"}
            </span>
            <ArrowUpRight size={15} />
          </div>
        </article>
      </section>

      {/* Product form */}
      <section className="admin-section admin-panel" id="product-form">
        <div className="admin-panel-heading">
          <div className="admin-panel-title">
            <div className="admin-panel-icon">
              {editing ? <Pencil size={19} /> : <Plus size={20} />}
            </div>
            <div>
              <p className="admin-section-kicker">CATALOGUE MANAGEMENT</p>
              <h2>{editing ? "Edit product" : "Add a product"}</h2>
              <p className="admin-section-description">
                {editing
                  ? "Update the details of your selected product."
                  : "Introduce a new piece to your collection."}
              </p>
            </div>
          </div>

          {editing && <span className="admin-edit-badge">EDITING MODE</span>}
        </div>

        <form className="admin-form admin-form-premium" onSubmit={save}>
          <div className="admin-form-subheading">
            <span>01</span>
            <h3>Product information</h3>
          </div>

          <div className="admin-form-grid">
            <label>
              <span>Product name</span>
              <input
                name="name"
                required
                value={form.name}
                onChange={change}
                placeholder="e.g. Everyday linen shirt"
              />
            </label>

            <label>
              <span>Slug (unique)</span>
              <input
                name="slug"
                value={form.slug}
                onChange={change}
                placeholder="generated-from-name"
              />
            </label>

            <label>
              <span>Category</span>
              <select name="category" value={form.category} onChange={change}>
                <option>Women</option>
                <option>Men</option>
                <option>Accessories</option>
              </select>
            </label>

            <label>
              <span>Price (₹)</span>
              <input
                name="price"
                required
                type="number"
                min="0"
                value={form.price}
                onChange={change}
                placeholder="0"
              />
            </label>

            <label>
              <span>Available stock</span>
              <input
                name="stock"
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={change}
                placeholder="0"
              />
            </label>

            <label>
              <span>Available sizes</span>
              <input
                name="sizes"
                value={form.sizes}
                onChange={change}
                placeholder="XS,S,M,L,XL"
              />
              <small>Separate each size with a comma.</small>
            </label>

            <label className="admin-field-full">
              <span>Image URL</span>
              <div className="admin-input-with-icon">
                <ImageIcon size={17} />
                <input
                  name="image"
                  required
                  type="url"
                  value={form.image}
                  onChange={change}
                  placeholder="https://example.com/product-image.jpg"
                />
              </div>
            </label>

            <label className="admin-field-full">
              <span>Description</span>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={change}
                rows="4"
                placeholder="Describe the product, its fit, feel, and details..."
              />
            </label>
          </div>

          <label className="admin-featured-option">
            <input
              name="featured"
              type="checkbox"
              checked={!!form.featured}
              onChange={change}
            />
            <span className="admin-featured-check">
              <Star size={16} />
            </span>
            <span className="admin-featured-copy">
              <strong>Feature on homepage</strong>
              <small>Include this product in the featured collection.</small>
            </span>
          </label>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="button button-dark admin-save-button"
              disabled={saving}
            >
              {saving ? (
                <RefreshCw size={16} className="admin-spin" />
              ) : editing ? (
                <Save size={16} />
              ) : (
                <Plus size={17} />
              )}
              {saving
                ? "Saving..."
                : editing
                  ? "Save changes"
                  : "Create product"}
            </button>

            {editing && (
              <button
                type="button"
                className="button button-light admin-cancel-button"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Product inventory */}
      <section className="admin-section admin-panel">
        <div className="admin-panel-heading">
          <div className="admin-panel-title">
            <div className="admin-panel-icon">
              <Package size={19} />
            </div>
            <div>
              <p className="admin-section-kicker">YOUR COLLECTION</p>
              <h2>Product inventory</h2>
              <p className="admin-section-description">
                Review stock, prices, and catalogue details.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="admin-small-action"
            onClick={() =>
              document
                .getElementById("product-form")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <Plus size={15} />
            Add product
          </button>
        </div>

        <div className="admin-table-wrap admin-table-wrap-premium">
          <table className="admin-table admin-table-premium">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>CATEGORY</th>
                <th>PRICE</th>
                <th>STOCK</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-product admin-table-product">
                      <img src={p.image} alt="" />
                      <div>
                        <strong>{p.name}</strong>
                        <span>
                          {p.featured ? (
                            <>
                              <Star size={11} /> Featured
                            </>
                          ) : (
                            "Standard listing"
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="admin-category-tag">{p.category}</span>
                  </td>

                  <td className="admin-table-price">{money(p.price)}</td>

                  <td>
                    <span
                      className={`admin-stock-tag ${
                        Number(p.stock) === 0
                          ? "admin-stock-out"
                          : Number(p.stock) <= 5
                            ? "admin-stock-low"
                            : "admin-stock-good"
                      }`}
                    >
                      {p.stock === 0 ? "Out of stock" : `${p.stock} units`}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions admin-table-actions">
                      <button
                        type="button"
                        className="admin-edit-action"
                        onClick={() => edit(p)}
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-delete-action"
                        onClick={() => remove(p._id)}
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!products.length && (
                <tr>
                  <td colSpan="5" className="admin-table-empty">
                    <Package size={24} />
                    <span>No products found in your catalogue.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>
            Showing <strong>{products.length}</strong> products
          </span>
          <span>SHOPSPHERE / INVENTORY</span>
        </div>
      </section>

      {/* Orders */}
      <section className="admin-section admin-panel">
        <div className="admin-panel-heading">
          <div className="admin-panel-title">
            <div className="admin-panel-icon">
              <ClipboardList size={19} />
            </div>
            <div>
              <p className="admin-section-kicker">ORDER MANAGEMENT</p>
              <h2>Recent orders</h2>
              <p className="admin-section-description">
                Track customer purchases and update fulfilment status.
              </p>
            </div>
          </div>

          <span className="admin-order-count">{orders.length} total</span>
        </div>

        <div className="admin-table-wrap admin-table-wrap-premium">
          <table className="admin-table admin-table-premium admin-orders-table">
            <thead>
              <tr>
                <th>ORDER / CUSTOMER</th>
                <th>TOTAL</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <div className="admin-order-customer">
                      <div className="admin-order-avatar">
                        {(o.user?.name || "C").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>#{o._id.slice(-7)}</strong>
                        <span>{o.user?.name || "Customer"}</span>
                        {o.user?.email && <small>{o.user.email}</small>}
                      </div>
                    </div>
                  </td>

                  <td className="admin-table-price">{money(o.total)}</td>

                  <td>
                    <span className="admin-payment-method">
                      {o.paymentMethod === "COD"
                        ? "Cash on delivery"
                        : "Unpaid"}
                    </span>
                  </td>

                  <td>
                    <select
                      className={`admin-status-select admin-status-${String(
                        o.status,
                      )
                        .toLowerCase()
                        .replace(/[^a-z]+/g, "-")}`}
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

              {!orders.length && (
                <tr>
                  <td colSpan="4" className="admin-table-empty">
                    <ShoppingBag size={24} />
                    <span>No orders have been recorded yet.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-footer">
          <span>
            Showing <strong>{orders.length}</strong> orders
          </span>
          <span>STATUS CHANGES ARE SAVED TO THE SERVER</span>
        </div>

        <p className="admin-revenue-note">
          *Order value represents the sum of recorded order totals. It is not a
          verified payment-revenue figure.
        </p>
      </section>

      <footer className="admin-page-footer">
        <span>SHOPSPHERE ADMINISTRATION</span>
        <span>Manage thoughtfully. Keep things moving.</span>
      </footer>
    </main>
  );
}
