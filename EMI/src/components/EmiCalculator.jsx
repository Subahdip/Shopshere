
import { useEffect, useState } from "react";
import {
  Calculator,
  Check,
  ChevronRight,
  IndianRupee,
} from "lucide-react";

const TENURES = [3, 6, 9, 12, 18, 24];

export default function EmiCalculator({
  product,
  onContinue,
}) {
  const [tenure, setTenure] = useState(6);
  const [annualRate, setAnnualRate] = useState(12);

  const [emiDetails, setEmiDetails] = useState(null);

  const principal = Number(product?.price);

  useEffect(() => {
    if (!Number.isFinite(principal) || principal <= 0) {
      setEmiDetails(null);
      return;
    }

    const months = tenure;
    const monthlyRate = annualRate / 12 / 100;

    // EMI formula for a reducing-balance interest rate.
    const monthlyEMI =
      monthlyRate === 0
        ? principal / months
        : (principal *
            monthlyRate *
            Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayable = monthlyEMI * months;
    const totalInterest = totalPayable - principal;

    setEmiDetails({
      principal,
      tenure: months,
      annualRate,
      monthlyEMI,
      totalInterest,
      totalPayable,
    });
  }, [principal, tenure, annualRate]);

  const formatCurrency = (amount) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <section className="calculator-card" id="emi-calculator">
      <div className="section-heading">
        <div className="heading-icon">
          <Calculator size={20} strokeWidth={1.6} />
        </div>

        <div>
          <p className="eyebrow">PLAN YOUR PAYMENTS</p>
          <h2>Make it yours, monthly.</h2>
        </div>
      </div>

      <p className="muted">
        Select a tenure that works for your budget.
      </p>

      {/* Tenure selection */}
      <div className="field-label">
        <span>Choose your tenure</span>
        <span className="muted">Monthly installments</span>
      </div>

      <div className="tenure-grid">
        {TENURES.map((months) => (
          <button
            key={months}
            type="button"
            className={`tenure-option ${
              tenure === months ? "selected" : ""
            }`}
            onClick={() => setTenure(months)}
            aria-pressed={tenure === months}
          >
            {tenure === months && (
              <Check size={14} className="tenure-check" />
            )}

            <strong>{months}</strong>
            <span>months</span>
          </button>
        ))}
      </div>

      {/* Interest rate slider */}
      <div className="interest-section">
        <div className="field-label">
          <label htmlFor="annual-rate">
            Annual interest rate
          </label>
          <strong>{annualRate}%</strong>
        </div>

        <input
          id="annual-rate"
          type="range"
          min="0"
          max="24"
          step="1"
          value={annualRate}
          onChange={(event) =>
            setAnnualRate(Number(event.target.value))
          }
        />

        <div className="range-labels">
          <span>0%</span>
          <span>12%</span>
          <span>24%</span>
        </div>
      </div>

      {/* EMI result */}
      <div className="emi-result" aria-live="polite">
        <p className="eyebrow">YOUR ESTIMATED MONTHLY EMI</p>

        {emiDetails ? (
          <>
            <h2>{formatCurrency(emiDetails.monthlyEMI)}</h2>

            <p className="muted">
              For {tenure} months at {annualRate}% annual interest
            </p>

            <div className="result-divider" />

            <div className="result-row">
              <span>Product amount</span>
              <strong>{formatCurrency(emiDetails.principal)}</strong>
            </div>

            <div className="result-row">
              <span>Total interest</span>
              <strong>{formatCurrency(emiDetails.totalInterest)}</strong>
            </div>

            <div className="result-row total-row">
              <span>Total payable</span>
              <strong>{formatCurrency(emiDetails.totalPayable)}</strong>
            </div>
          </>
        ) : (
          <p className="error-message">
            A valid product price is required to calculate EMI.
          </p>
        )}
      </div>

      {/* Continue button */}
      <button
        type="button"
        className="primary-button"
        disabled={!emiDetails}
        onClick={() => {
          if (emiDetails && onContinue) {
            onContinue(emiDetails);
          }
        }}
      >
        Continue with this plan
        <ChevronRight size={18} />
      </button>

      <p className="disclaimer">
        This is an illustrative calculation, not a lender offer or
        credit approval. Actual interest, fees, and payment terms
        may vary.
      </p>
    </section>
  );
}
