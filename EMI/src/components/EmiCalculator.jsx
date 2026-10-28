import { useMemo, useState } from "react";
import {
  Calculator,
  Check,
  ChevronRight,
} from "lucide-react";

const TENURES = [3, 6, 9, 12, 18, 24];

// Annual interest rate (%) for each tenure. Edit these to change the rates.
const RATE_BY_TENURE = {
  3: 11,
  6: 12,
  9: 13,
  12: 14,
  18: 15,
  24: 16,
};

const MIN_DOWN_PERCENT = 5;
const MAX_DOWN_PERCENT = 30;

export default function EmiCalculator({
  product,
  onContinue,
}) {
  const [tenure, setTenure] = useState(6);
  const [downPercent, setDownPercent] = useState(MIN_DOWN_PERCENT);

  const price = Number(product?.price);
  const annualRate = RATE_BY_TENURE[tenure];

  const emiDetails = useMemo(() => {
    if (!Number.isFinite(price) || price <= 0) {
      return null;
    }

    const downPayment = Math.round((price * downPercent) / 100);
    const principal = price - downPayment;
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

    const totalEmi = monthlyEMI * months;
    const totalInterest = totalEmi - principal;

    return {
      productPrice: price,
      downPercent,
      downPayment,
      principal,
      tenure: months,
      annualRate,
      monthlyEMI,
      totalInterest,
      // Down payment is paid now, EMIs are paid later.
      totalPayable: downPayment + totalEmi,
    };
  }, [price, tenure, downPercent, annualRate]);

  const formatCurrency = (amount) =>
    `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const sliderFill =
    ((downPercent - MIN_DOWN_PERCENT) /
      (MAX_DOWN_PERCENT - MIN_DOWN_PERCENT)) *
    100;

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
        Choose your down payment and a tenure that works for your
        budget.
      </p>

      {/* Down payment slider */}
      <div className="interest-section down-section">
        <div className="field-label">
          <label htmlFor="down-payment">Down payment</label>
          <strong>
            {downPercent}%
            {emiDetails && ` · ${formatCurrency(emiDetails.downPayment)}`}
          </strong>
        </div>

        <input
          id="down-payment"
          type="range"
          min={MIN_DOWN_PERCENT}
          max={MAX_DOWN_PERCENT}
          step="1"
          value={downPercent}
          style={{ "--fill": `${sliderFill}%` }}
          onChange={(event) =>
            setDownPercent(Number(event.target.value))
          }
        />

        <div className="range-labels">
          <span>{MIN_DOWN_PERCENT}%</span>
          <span>{MAX_DOWN_PERCENT}%</span>
        </div>
      </div>

      {/* Tenure selection */}
      <div className="field-label">
        <span>Choose your tenure</span>
        <span className="muted">Interest rate changes with tenure</span>
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
            <small className="tenure-rate">
              {RATE_BY_TENURE[months]}% p.a.
            </small>
          </button>
        ))}
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
              <strong>{formatCurrency(emiDetails.productPrice)}</strong>
            </div>

            <div className="result-row">
              <span>
                Down payment ({emiDetails.downPercent}%)
              </span>
              <strong>− {formatCurrency(emiDetails.downPayment)}</strong>
            </div>

            <div className="result-row">
              <span>Amount financed</span>
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