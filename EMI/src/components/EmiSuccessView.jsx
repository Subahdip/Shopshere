import { CheckCircle2, ShoppingBag, ArrowRight, Calendar, Building, MapPin, Printer } from "lucide-react";

export default function EmiSuccessView({
  order,
  plan,
  profile,
  onReset,
}) {
  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const orderId = order?.orderId || `EMI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div className="success-view-container">
      <div className="success-card-main">
        <div className="success-icon-badge">
          <CheckCircle2 size={42} strokeWidth={2.2} />
        </div>

        <p className="eyebrow">ORDER & FINANCING CONFIRMED</p>
        <h1>Your EMI Plan is Approved!</h1>
        <p className="muted success-lead">
          Congratulations! Your installment plan has been securely confirmed and
          registered in our database.
        </p>

        <div className="order-reference-box">
          <span className="ref-label">Application & Order Reference</span>
          <strong className="ref-number">{orderId}</strong>
          <span className="ref-badge">Pre-Approved & Active</span>
        </div>

        {/* Summary Grid */}
        <div className="success-summary-grid">
          <div className="summary-col">
            <span className="sum-title">Down Payment Amount</span>
            <strong className="sum-big-val">
              {formatCurrency(plan?.downPayment)}
            </strong>
            <span className="sum-sub">({plan?.downPercent}% down payment)</span>
          </div>

          <div className="summary-col">
            <span className="sum-title">Monthly Installment</span>
            <strong className="sum-big-val emi-highlight">
              {formatCurrency(plan?.monthlyEMI)}
            </strong>
            <span className="sum-sub">{plan?.tenure} monthly payments</span>
          </div>

          <div className="summary-col">
            <span className="sum-title">Total Financed Value</span>
            <strong className="sum-big-val">
              {formatCurrency(plan?.totalPayable)}
            </strong>
            <span className="sum-sub">Zero hidden charges</span>
          </div>
        </div>

        {/* Next Steps Roadmap */}
        <div className="next-steps-card">
          <h3>What happens next?</h3>
          <div className="steps-flow">
            <div className="flow-step">
              <span className="step-num">1</span>
              <div>
                <strong>Down payment processing</strong>
                <p className="muted">
                  Your down payment invoice of {formatCurrency(plan?.downPayment)} is initiated.
                </p>
              </div>
            </div>

            <div className="flow-step">
              <span className="step-num">2</span>
              <div>
                <strong>Shipment & Delivery</strong>
                <p className="muted">
                  ShopSphere will pack and dispatch your items to {profile?.city}.
                </p>
              </div>
            </div>

            <div className="flow-step">
              <span className="step-num">3</span>
              <div>
                <strong>Automated EMI Schedule</strong>
                <p className="muted">
                  First monthly installment of {formatCurrency(plan?.monthlyEMI)} will be auto-debited on the 5th of next month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="success-action-buttons">
          <a
            href="http://localhost:5173/"
            className="primary-btn btn-lg return-shop-btn"
          >
            <ShoppingBag size={18} />
            <span>Return to ShopSphere Store</span>
          </a>

          <button
            type="button"
            className="secondary-btn btn-lg"
            onClick={onReset}
          >
            <span>Plan Another Purchase</span>
          </button>
        </div>
      </div>
    </div>
  );
}
