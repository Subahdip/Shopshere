
import { ShieldCheck, Package } from "lucide-react";

export default function ProductSummary({ product }) {
  if (!product) {
    return (
      <section className="product-card">
        <p>Loading product details...</p>
      </section>
    );
  }

  const price = Number(product.price);

  return (
    <section className="product-card">
      <div className="product-image-wrap">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            <Package size={48} strokeWidth={1.2} />
            <span>Product image unavailable</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <p className="eyebrow">
          {product.category || "SHOPSPHERE EDIT"}
        </p>

        <h2>{product.name || "Selected product"}</h2>

        <p className="product-description">
          {product.description ||
            "Thoughtful design. Everyday essentials."}
        </p>

        <div className="product-price">
          {Number.isFinite(price)
            ? `₹${price.toLocaleString("en-IN")}`
            : "Price unavailable"}
        </div>

        <div className="verified">
          <ShieldCheck size={16} strokeWidth={1.6} />
          <span>Product details from ShopSphere</span>
        </div>
      </div>
    </section>
  );
}
