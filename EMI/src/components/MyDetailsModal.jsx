import { useState } from "react";
import {
  X,
  UserCheck,
  CreditCard,
  Building,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit3,
  MapPin,
  Mail,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react";

export default function MyDetailsModal({
  isOpen,
  onClose,
  profile,
  onEdit,
}) {
  const [showPan, setShowPan] = useState(false);
  const [showAadhar, setShowAadhar] = useState(false);
  const [showBank, setShowBank] = useState(false);

  if (!isOpen) return null;

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

  const getScoreRating = (score) => {
    if (!score) return { label: "Standard", color: "#6b7280" };
    if (score >= 750) return { label: "Excellent", color: "#059669" };
    if (score >= 680) return { label: "Very Good", color: "#10b981" };
    if (score >= 620) return { label: "Good", color: "#f59e0b" };
    return { label: "Fair", color: "#ef4444" };
  };

  const scoreRating = getScoreRating(profile?.creditScore);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container details-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-details-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 id="my-details-title">My EMI Details</h2>
              <p className="modal-subtitle">
                Verified financial & identity information stored securely
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {profile ? (
          <div className="modal-body">
            {/* Verification Status Banner */}
            <div className="verification-banner">
              <div className="verification-status-pill">
                <CheckCircle2 size={16} />
                <span>KYC Verified & Pre-Approved</span>
              </div>
              <span className="database-tag">Stored in Database</span>
            </div>

            {/* Credit Score Gauge Card */}
            <div className="credit-score-card">
              <div className="credit-score-header">
                <div className="score-label-group">
                  <span className="eyebrow">BUREAU CREDIT SCORE</span>
                  <div className="score-value-row">
                    <strong className="score-number">
                      {profile.creditScore || 750}
                    </strong>
                    <span
                      className="score-pill"
                      style={{
                        backgroundColor: `${scoreRating.color}18`,
                        color: scoreRating.color,
                        borderColor: scoreRating.color,
                      }}
                    >
                      {scoreRating.label}
                    </span>
                  </div>
                </div>
                <div className="score-meter-visual">
                  <div className="score-bar-bg">
                    <div
                      className="score-bar-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            10,
                            (((profile.creditScore || 750) - 300) / 600) * 100
                          )
                        )}%`,
                        backgroundColor: scoreRating.color,
                      }}
                    />
                  </div>
                  <div className="score-range-labels">
                    <span>300 (Poor)</span>
                    <span>900 (Exceptional)</span>
                  </div>
                </div>
              </div>
              <p className="credit-score-note">
                Eligible for lowest interest rates and flexible tenures up to 24 months.
              </p>
            </div>

            {/* Information Grid */}
            <div className="details-grid">
              {/* Personal Info */}
              <div className="detail-group">
                <h4 className="detail-group-title">
                  <User size={15} /> Personal Profile
                </h4>
                <div className="detail-row">
                  <span className="detail-label">Full Name</span>
                  <strong className="detail-value">{profile.fullName}</strong>
                </div>
                <div className="detail-row">
                  <span className="detail-label">
                    <Mail size={13} /> Email
                  </span>
                  <span className="detail-value">{profile.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">
                    <Phone size={13} /> Phone
                  </span>
                  <span className="detail-value">{profile.phone}</span>
                </div>
              </div>

              {/* Address */}
              <div className="detail-group">
                <h4 className="detail-group-title">
                  <MapPin size={15} /> Registered Address
                </h4>
                <div className="detail-row full-width">
                  <span className="detail-label">Street Address</span>
                  <span className="detail-value">{profile.address}</span>
                </div>
                <div className="detail-subgrid">
                  <div className="detail-row">
                    <span className="detail-label">City</span>
                    <span className="detail-value">{profile.city}</span>
                  </div>
                  {profile.state && (
                    <div className="detail-row">
                      <span className="detail-label">State</span>
                      <span className="detail-value">{profile.state}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Postal Code</span>
                    <span className="detail-value">{profile.postalCode}</span>
                  </div>
                </div>
              </div>

              {/* KYC & Identity */}
              <div className="detail-group">
                <h4 className="detail-group-title">
                  <ShieldCheck size={15} /> Government KYC
                </h4>
                <div className="detail-row secure-row">
                  <div>
                    <span className="detail-label">PAN Card Number</span>
                    <strong className="detail-value secure-font">
                      {showPan ? profile.pan : maskPan(profile.pan)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowPan(!showPan)}
                    title={showPan ? "Hide PAN" : "Show PAN"}
                  >
                    {showPan ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="detail-row secure-row">
                  <div>
                    <span className="detail-label">Aadhaar Number</span>
                    <strong className="detail-value secure-font">
                      {showAadhar ? profile.aadhar : maskAadhar(profile.aadhar)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowAadhar(!showAadhar)}
                    title={showAadhar ? "Hide Aadhaar" : "Show Aadhaar"}
                  >
                    {showAadhar ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Bank Account */}
              <div className="detail-group">
                <h4 className="detail-group-title">
                  <Building size={15} /> Linked Bank Account
                </h4>
                <div className="detail-row secure-row">
                  <div>
                    <span className="detail-label">Account Number</span>
                    <strong className="detail-value secure-font">
                      {showBank ? profile.bankAccountNo : maskBank(profile.bankAccountNo)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowBank(!showBank)}
                    title={showBank ? "Hide Account" : "Show Account"}
                  >
                    {showBank ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className="detail-row">
                  <span className="detail-label">IFSC Code</span>
                  <strong className="detail-value secure-font">
                    {profile.bankIfsc}
                  </strong>
                </div>

                {profile.bankName && (
                  <div className="detail-row">
                    <span className="detail-label">Bank Name</span>
                    <span className="detail-value">{profile.bankName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-empty-state">
            <CreditCard size={36} strokeWidth={1.5} />
            <h3>No details filled yet</h3>
            <p>
              Complete your KYC and bank verification to enable instant EMI loans
              and checkout approvals.
            </p>
          </div>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="secondary-btn"
            onClick={onClose}
          >
            Close
          </button>
          <button
            type="button"
            className="primary-btn modal-action-btn"
            onClick={() => {
              onClose();
              if (onEdit) onEdit();
            }}
          >
            <Edit3 size={15} />
            {profile ? "Edit Details" : "Fill Details Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
