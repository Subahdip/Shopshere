import { useState } from "react";
import {
  ShieldCheck,
  Check,
  ArrowLeft,
  Calendar,
  Building,
  User,
  MapPin,
  CreditCard,
  Edit3,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ConfirmationPage({
  plan,
  product,
  items = [],
  profile,
  onConfirm,
  onCancel,
  onEditDetails,
  isConfirming = false,
}) {
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);

  if (!plan || !profile) {
    return (
      <div className="status-card error-message">
        <h3>Missing confirmation details</h3>
        <p>Your EMI plan or profile information is incomplete.</p>
        <button type="button" className="primary-button" onClick={onCancel}>
          Return to EMI Calculator
        </button>
      </div>
    );
  }

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const maskPan = (pan = "") => {
    if (!pan || pan.length < 5) return pan;
    return `${pan.slice(0, 3)}•••••${pan.slice(-2)}`;
  };

  const maskAadhar = (aadhar = "") => {
    const clean = aadhar.replace(/\s+/g, "");
    if (clean.length < 8) return aadhar;
    return `•••• •••• ${clean.slice(-4)}`;
  };

  const maskBank = (bank = "") => {
    if (bank.length < 4) return bank;
    return `••••••••${bank.slice(-4)}`;
  };

  // Generate repayment schedule dates (starting next month on the 5th)
  const scheduleRows = Array.from({ length: plan.tenure }).map((_, index) => {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + index + 1);
    dueDate.setDate(5);
    const dateFormatted = dueDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      installmentNumber: index + 1,
      dueDate: dateFormatted,
      amount: plan.monthlyEMI,
      status: "Scheduled (Auto-debit)",
    };
  });

  return (
    <div className="confirmation-page-wrapper">
      {/* Breadcrumb Steps */}
      <div className="checkout-step-indicator">
        <div className="step-item step-completed">
          <span className="step-circle">✓</span>
          <span className="step-name">1. Calculate EMI</span>
        </div>
        <div className="step-line active-line" />
        <div className="step-item step-completed">
          <span className="step-circle">✓</span>
          <span className="step-name">2. Details Verified</span>
        </div>
        <div className="step-line active-line" />
        <div className="step-item step-current">
          <span className="step-circle">3</span>
          <span className="step-name">3. Final Confirmation</span>
        </div>
      </div>

      <div className="confirmation-header">
        <div className="badge-pill">
          <Sparkles size={14} /> Ready for Approval
        </div>
        <h1>Review & Confirm Your EMI Plan</h1>
        <p className="confirmation-intro muted">
          Please inspect your installment schedule, item selection, and verified KYC
          before finalizing your order.
        </p>
      </div>

      <div className="confirmation-grid">
        {/* Left Column: Financing Summary & Repayment Schedule */}
        <div className="confirmation-main-col">
          {/* Plan Highlight Card */}
          <div className="confirm-card highlight-card">
            <div className="confirm-card-header">
              <div className="card-header-icon">
                <CreditCard size={19} />
              </div>
              <div>
                <h3>EMI Financing Structure</h3>
                <p className="muted">Transparent breakdown with zero hidden charges</p>
              </div>
            </div>

            <div className="plan-stats-banner">
              <div className="stat-box">
                <span className="stat-label">Monthly EMI</span>
                <strong className="stat-value emi-accent">
                  {formatCurrency(plan.monthlyEMI)}
                </strong>
                <span className="stat-sub">For {plan.tenure} months</span>
              </div>

              <div className="stat-box">
                <span className="stat-label">Down Payment ({plan.downPercent}%)</span>
                <strong className="stat-value">
                  {formatCurrency(plan.downPayment)}
                </strong>
                <span className="stat-sub">Due upon checkout</span>
              </div>

              <div className="stat-box">
                <span className="stat-label">Total Payable</span>
                <strong className="stat-value">
                  {formatCurrency(plan.totalPayable)}
                </strong>
                <span className="stat-sub">Principal + Interest</span>
              </div>
            </div>

            <div className="line-item-breakdown">
              <div className="confirm-row">
                <span>Principal Financed Amount</span>
                <strong>{formatCurrency(plan.principal)}</strong>
              </div>
              <div className="confirm-row">
                <span>Selected Tenure</span>
                <strong>{plan.tenure} Months</strong>
              </div>
              <div className="confirm-row">
                <span>Annual Interest Rate (p.a.)</span>
                <strong>{plan.annualRate}%</strong>
              </div>
              <div className="confirm-row">
                <span>Total Interest Charged</span>
                <strong>{formatCurrency(plan.totalInterest)}</strong>
              </div>
              <div className="confirm-row grand-row">
                <span>Total Amount (Down Payment + EMIs)</span>
                <strong>{formatCurrency(plan.totalPayable)}</strong>
              </div>
            </div>

            {/* Repayment Schedule Accordion */}
            <div className="schedule-toggle-section">
              <button
                type="button"
                className="schedule-toggle-btn"
                onClick={() => setShowSchedule(!showSchedule)}
                aria-expanded={showSchedule}
              >
                <div className="schedule-btn-title">
                  <Calendar size={16} />
                  <span>
                    {showSchedule
                      ? "Hide Monthly Schedule"
                      : `View ${plan.tenure}-Month Repayment Schedule`}
                  </span>
                </div>
                <span className="schedule-badge">
                  {showSchedule ? "▲ Close" : "▼ Expand"}
                </span>
              </button>

              {showSchedule && (
                <div className="repayment-schedule-table-wrap">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Due Date</th>
                        <th>EMI Amount</th>
                        <th>Debit Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleRows.map((row) => (
                        <tr key={row.installmentNumber}>
                          <td>
                            <strong>Month {row.installmentNumber}</strong>
                          </td>
                          <td>{row.dueDate}</td>
                          <td>
                            <strong>{formatCurrency(row.amount)}</strong>
                          </td>
                          <td>
                            <span className="status-badge-inline">
                              <Building size={12} /> NACH e-Mandate
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Cart Products in this plan */}
          <div className="confirm-card">
            <div className="confirm-card-header">
              <div className="card-header-icon">
                <FileText size={18} />
              </div>
              <div>
                <h3>Items Covered by this Financing</h3>
                <p className="muted">
                  {items.length > 0 ? items.length : 1} product(s) included in this installment plan
                </p>
              </div>
            </div>

            <div className="confirm-items-list">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div key={`${item.productId}-${i}`} className="confirm-item-row">
                    <div className="confirm-item-img">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="no-img">Item</div>
                      )}
                    </div>
                    <div className="confirm-item-info">
                      <h4>{item.name}</h4>
                      <p className="muted">
                        Quantity: {item.quantity}
                        {item.size ? ` · Size: ${item.size}` : ""}
                      </p>
                    </div>
                    <div className="confirm-item-price">
                      <strong>
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="confirm-item-row">
                  <div className="confirm-item-info">
                    <h4>{product?.name || "Selected Product"}</h4>
                    <p className="muted">Single item purchase</p>
                  </div>
                  <div className="confirm-item-price">
                    <strong>{formatCurrency(plan.productPrice)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Verified Profile & Mandate Consent */}
        <div className="confirmation-side-col">
          {/* User Details Verification Card */}
          <div className="confirm-card user-verify-card">
            <div className="verify-card-header">
              <div className="verify-badge">
                <ShieldCheck size={16} />
                <span>Verified Borrower</span>
              </div>
              <button
                type="button"
                className="edit-details-link"
                onClick={onEditDetails}
                title="Edit your details"
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>

            <div className="verify-user-section">
              <div className="verify-field">
                <span className="verify-label">Full Name</span>
                <strong className="verify-val">{profile.fullName}</strong>
              </div>

              <div className="verify-field">
                <span className="verify-label">Email & Phone</span>
                <span className="verify-val">{profile.email}</span>
                <span className="verify-val sub-val">{profile.phone}</span>
              </div>

              <div className="verify-field">
                <span className="verify-label">Delivery Address</span>
                <span className="verify-val">
                  {profile.address}, {profile.city}
                  {profile.state ? `, ${profile.state}` : ""} - {profile.postalCode}
                </span>
              </div>

              <div className="verify-divider" />

              <div className="verify-grid-compact">
                <div className="verify-field">
                  <span className="verify-label">PAN Card</span>
                  <strong className="verify-val monospace-val">
                    {maskPan(profile.pan)}
                  </strong>
                </div>

                <div className="verify-field">
                  <span className="verify-label">Aadhaar Card</span>
                  <strong className="verify-val monospace-val">
                    {maskAadhar(profile.aadhar)}
                  </strong>
                </div>

                <div className="verify-field">
                  <span className="verify-label">Bank Account</span>
                  <strong className="verify-val monospace-val">
                    {maskBank(profile.bankAccountNo)}
                  </strong>
                </div>

                <div className="verify-field">
                  <span className="verify-label">IFSC Code</span>
                  <strong className="verify-val monospace-val">
                    {profile.bankIfsc}
                  </strong>
                </div>
              </div>

              <div className="verify-score-badge">
                <div className="score-badge-left">
                  <span className="eyebrow">CREDIT SCORE</span>
                  <strong>{profile.creditScore || 750}</strong>
                </div>
                <div className="score-badge-right">
                  <span className="approved-pill">
                    <Check size={12} /> Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Acceptance & NACH Mandate Note */}
          <div className="confirm-card mandate-card">
            <label className="checkbox-consent">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="consent-text">
                I hereby authorize automatic monthly debit of{" "}
                <strong>{formatCurrency(plan.monthlyEMI)}</strong> from my registered
                bank account ({maskBank(profile.bankAccountNo)}) under NACH /
                e-Mandate regulations for {plan.tenure} months.
              </span>
            </label>

            <div className="security-badges-row">
              <div className="sec-item">
                <ShieldCheck size={14} /> 256-Bit Encrypted
              </div>
              <div className="sec-item">
                <Clock size={14} /> Instant Confirmation
              </div>
            </div>
          </div>

          {/* Action Buttons: Confirm or Cancel */}
          <div className="confirmation-action-buttons">
            <button
              type="button"
              className="confirm-order-btn"
              disabled={isConfirming || !agreedToTerms}
              onClick={() => onConfirm && onConfirm()}
            >
              {isConfirming ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <Check size={18} />
                  <span>Confirm EMI Plan & Place Order</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="cancel-plan-btn"
              disabled={isConfirming}
              onClick={onCancel}
            >
              <ArrowLeft size={16} />
              <span>Cancel & Return to Calculator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
