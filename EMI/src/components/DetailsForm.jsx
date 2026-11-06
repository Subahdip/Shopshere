import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CreditCard,
  Building2,
  MapPin,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

// Credit scores below this are not eligible for an EMI.
export const MIN_CREDIT_SCORE = 650;

export default function DetailsForm({
  initialData,
  onSave,
  onCancel,
  isSubmitting = false,
  title = "EMI Verification & KYC Details",
  subtitle = "Please complete your identity and banking verification to continue with your EMI plan.",
  submitLabel = "Save & Proceed to Confirmation",
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    pan: "",
    aadhar: "",
    bankAccountNo: "",
    bankIfsc: "",
    bankName: "",
    creditScore: 750,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        creditScore: initialData.creditScore || 750,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "pan") {
      formattedValue = value.toUpperCase().slice(0, 10);
    } else if (name === "aadhar") {
      // Numbers only, max 12 digits
      formattedValue = value.replace(/\D/g, "").slice(0, 12);
    } else if (name === "bankIfsc") {
      formattedValue = value.toUpperCase().slice(0, 11);
    } else if (name === "bankAccountNo") {
      formattedValue = value.replace(/\D/g, "").slice(0, 18);
    } else if (name === "creditScore") {
      formattedValue = Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, val) => {
    let err = "";
    const strVal = String(val || "").trim();

    switch (field) {
      case "fullName":
        if (!strVal) err = "Full name is required";
        break;
      case "email":
        if (!strVal) {
          err = "Email address is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) {
          err = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!strVal) {
          err = "Phone number is required";
        } else if (!/^\+?[0-9]{10,12}$/.test(strVal.replace(/[-\s]/g, ""))) {
          err = "Enter a valid 10-digit mobile number";
        }
        break;
      case "address":
        if (!strVal) err = "Street address is required";
        break;
      case "city":
        if (!strVal) err = "City is required";
        break;
      case "postalCode":
        if (!strVal) {
          err = "Postal code is required";
        } else if (!/^\d{5,6}$/.test(strVal)) {
          err = "Enter a valid 6-digit PIN code";
        }
        break;
      case "pan":
        if (!strVal) {
          err = "PAN card number is required";
        } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(strVal)) {
          err = "Format: 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F)";
        }
        break;
      case "aadhar":
        if (!strVal) {
          err = "Aadhaar number is required";
        } else if (strVal.length !== 12) {
          err = "Aadhaar must be exactly 12 digits";
        }
        break;
      case "bankAccountNo":
        if (!strVal) {
          err = "Bank account number is required";
        } else if (strVal.length < 9) {
          err = "Account number must be at least 9 digits";
        }
        break;
      case "bankIfsc":
        if (!strVal) {
          err = "Bank IFSC code is required";
        } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(strVal)) {
          err = "Format: 4 letters, 0, 6 digits/letters (e.g. HDFC0001234)";
        }
        break;
      case "bankName":
        if (!strVal) {
          err = "Bank name is required";
        } else if (strVal.length < 2) {
          err = "Enter a valid bank name";
        }
        break;
      case "creditScore":
        if (!val || Number(val) < 300 || Number(val) > 900) {
          err = "Credit score must be between 300 and 900";
        } else if (Number(val) < MIN_CREDIT_SCORE) {
          err = `Credit score must be ${MIN_CREDIT_SCORE} or higher to be eligible for an EMI`;
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const validateAll = () => {
    const fieldsToValidate = [
      "fullName",
      "email",
      "phone",
      "address",
      "city",
      "postalCode",
      "pan",
      "aadhar",
      "bankAccountNo",
      "bankIfsc",
      "bankName",
      "creditScore",
    ];

    const newErrors = {};
    let isValid = true;

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) {
        newErrors[f] = err;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {})
    );
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAll()) {
      onSave(formData);
    }
  };

  const getScoreRating = (score) => {
    if (score < MIN_CREDIT_SCORE) {
      return { label: `Not eligible for EMI (below ${MIN_CREDIT_SCORE})`, color: "#dc2626" };
    }
    if (score >= 750) return { label: "Excellent (Eligible for 0% down)", color: "#059669" };
    if (score >= 680) return { label: "Very Good (Pre-Approved)", color: "#10b981" };
    return { label: "Good (Standard Rates)", color: "#f59e0b" };
  };

  const scoreRating = getScoreRating(formData.creditScore);
  const isIneligible = Number(formData.creditScore) < MIN_CREDIT_SCORE;

  return (
    <div className="details-form-container">
      <div className="details-form-header">
        <div className="step-pill">
          <span>Verification Step</span>
        </div>
        <h2>{title}</h2>
        <p className="muted form-subtitle">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="details-form" noValidate>
        {/* Section 1: Personal Details */}
        <div className="form-card-section">
          <div className="form-section-title">
            <User size={18} />
            <div>
              <h3>1. Personal Identity</h3>
              <p className="muted">Name, contact & primary communication channel</p>
            </div>
          </div>

          <div className="form-row-grid">
            <div className={`form-field ${errors.fullName && touched.fullName ? "field-error" : ""}`}>
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="e.g. Rajesh Kumar Sharma"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={() => handleBlur("fullName")}
                required
              />
              {errors.fullName && touched.fullName && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.fullName}
                </span>
              )}
            </div>

            <div className={`form-field ${errors.email && touched.email ? "field-error" : ""}`}>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="rajesh@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur("email")}
                required
              />
              {errors.email && touched.email && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.email}
                </span>
              )}
            </div>

            <div className={`form-field ${errors.phone && touched.phone ? "field-error" : ""}`}>
              <label htmlFor="phone">Mobile Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur("phone")}
                required
              />
              {errors.phone && touched.phone && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Address */}
        <div className="form-card-section">
          <div className="form-section-title">
            <MapPin size={18} />
            <div>
              <h3>2. Permanent / Delivery Address</h3>
              <p className="muted">Used for financing verification and product shipment</p>
            </div>
          </div>

          <div className="form-row-grid">
            <div className={`form-field full-span ${errors.address && touched.address ? "field-error" : ""}`}>
              <label htmlFor="address">Street Address / House / Flat No. *</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Flat 302, Palm Heights, 12th Main Road, Indiranagar"
                value={formData.address}
                onChange={handleChange}
                onBlur={() => handleBlur("address")}
                required
              />
              {errors.address && touched.address && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.address}
                </span>
              )}
            </div>

            <div className={`form-field ${errors.city && touched.city ? "field-error" : ""}`}>
              <label htmlFor="city">City *</label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="Bengaluru"
                value={formData.city}
                onChange={handleChange}
                onBlur={() => handleBlur("city")}
                required
              />
              {errors.city && touched.city && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.city}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="state">State / Province</label>
              <input
                id="state"
                name="state"
                type="text"
                placeholder="Karnataka"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            <div className={`form-field ${errors.postalCode && touched.postalCode ? "field-error" : ""}`}>
              <label htmlFor="postalCode">PIN / Postal Code *</label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="560038"
                maxLength={6}
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={() => handleBlur("postalCode")}
                required
              />
              {errors.postalCode && touched.postalCode && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.postalCode}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Government KYC */}
        <div className="form-card-section">
          <div className="form-section-title">
            <ShieldCheck size={18} />
            <div>
              <h3>3. Government KYC Verification</h3>
              <p className="muted">PAN and Aadhaar numbers for instant lender credit authorization</p>
            </div>
          </div>

          <div className="form-row-grid">
            <div className={`form-field ${errors.pan && touched.pan ? "field-error" : ""}`}>
              <label htmlFor="pan">Permanent Account Number (PAN) *</label>
              <input
                id="pan"
                name="pan"
                type="text"
                placeholder="ABCDE1234F"
                maxLength={10}
                value={formData.pan}
                onChange={handleChange}
                onBlur={() => handleBlur("pan")}
                className="monospace-input"
                required
              />
              <span className="field-hint">10 characters uppercase alphanumeric</span>
              {errors.pan && touched.pan && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.pan}
                </span>
              )}
            </div>

            <div className={`form-field ${errors.aadhar && touched.aadhar ? "field-error" : ""}`}>
              <label htmlFor="aadhar">Aadhaar Card Number *</label>
              <input
                id="aadhar"
                name="aadhar"
                type="text"
                placeholder="12-digit Aadhaar number"
                maxLength={12}
                value={formData.aadhar}
                onChange={handleChange}
                onBlur={() => handleBlur("aadhar")}
                className="monospace-input"
                required
              />
              <span className="field-hint">12 digits without spaces or dashes</span>
              {errors.aadhar && touched.aadhar && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.aadhar}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Bank Account & Credit Score */}
        <div className="form-card-section">
          <div className="form-section-title">
            <Building2 size={18} />
            <div>
              <h3>4. Bank Account & Credit Evaluation</h3>
              <p className="muted">For automated monthly EMI auto-debit (NACH/e-Mandate)</p>
            </div>
          </div>

          <div className="form-row-grid">
            <div className={`form-field ${errors.bankAccountNo && touched.bankAccountNo ? "field-error" : ""}`}>
              <label htmlFor="bankAccountNo">Bank Account Number *</label>
              <input
                id="bankAccountNo"
                name="bankAccountNo"
                type="text"
                placeholder="Account number"
                value={formData.bankAccountNo}
                onChange={handleChange}
                onBlur={() => handleBlur("bankAccountNo")}
                className="monospace-input"
                required
              />
              {errors.bankAccountNo && touched.bankAccountNo && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.bankAccountNo}
                </span>
              )}
            </div>

            <div className={`form-field ${errors.bankIfsc && touched.bankIfsc ? "field-error" : ""}`}>
              <label htmlFor="bankIfsc">Bank IFSC Code *</label>
              <input
                id="bankIfsc"
                name="bankIfsc"
                type="text"
                placeholder="HDFC0001234"
                maxLength={11}
                value={formData.bankIfsc}
                onChange={handleChange}
                onBlur={() => handleBlur("bankIfsc")}
                className="monospace-input"
                required
              />
              <span className="field-hint">11-character Indian Financial System Code</span>
              {errors.bankIfsc && touched.bankIfsc && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.bankIfsc}
                </span>
              )}
            </div>

            <div className={`form-field ${errors.bankName && touched.bankName ? "field-error" : ""}`}>
              <label htmlFor="bankName">Bank Name *</label>
              <input
                id="bankName"
                name="bankName"
                type="text"
                placeholder="e.g. HDFC Bank / ICICI / SBI"
                value={formData.bankName}
                onChange={handleChange}
                onBlur={() => handleBlur("bankName")}
                required
              />
              {errors.bankName && touched.bankName && (
                <span className="field-error-message">
                  <AlertCircle size={13} /> {errors.bankName}
                </span>
              )}
            </div>
          </div>

          {/* Credit Score Input & Visual Preview */}
          <div className="credit-score-input-box">
            <div className="field-label-between">
              <label htmlFor="creditScore">
                <strong>Self-Declared / Bureau Credit Score</strong>
              </label>
              <div className="score-live-badge" style={{ color: scoreRating.color }}>
                <CheckCircle size={14} />
                <span>
                  <strong>{formData.creditScore}</strong> — {scoreRating.label}
                </span>
              </div>
            </div>

            <div className="score-slider-row">
              <input
                id="creditScore"
                name="creditScore"
                type="range"
                min="300"
                max="900"
                step="5"
                value={formData.creditScore}
                onChange={handleChange}
                className="credit-slider"
              />
              <input
                type="number"
                name="creditScore"
                min="300"
                max="900"
                value={formData.creditScore}
                onChange={handleChange}
                className="score-number-box"
              />
            </div>

            {/* Quick score presets */}
            <div className="score-presets">
              <span className="preset-label">Quick select:</span>
              {[650, 720, 750, 790, 830].map((score) => (
                <button
                  key={score}
                  type="button"
                  className={`preset-btn ${formData.creditScore === score ? "active" : ""}`}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, creditScore: score }))
                  }
                >
                  {score}
                </button>
              ))}
            </div>

            {isIneligible && (
              <div className="not-eligible-banner" role="alert">
                <AlertCircle size={16} />
                <span>
                  Your credit score is below {MIN_CREDIT_SCORE}, so you are not eligible for an EMI
                  and cannot continue with this plan.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions-footer">
          {onCancel && (
            <button
              type="button"
              className="secondary-btn btn-lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <ArrowLeft size={16} />
              Cancel & Return
            </button>
          )}

          <button
            type="submit"
            className="primary-btn btn-lg submit-btn"
            disabled={isSubmitting || isIneligible}
          >
            {isSubmitting ? (
              <span>Saving details to database...</span>
            ) : (
              <>
                <span>{submitLabel}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}