import { ShoppingBag, ArrowLeft, UserCheck, User, ShieldCheck } from "lucide-react";

export default function Navbar({
  userProfile = null,
  onOpenDetails,
  onNavigateHome,
}) {
  const handleGoBack = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "http://localhost:5173/cart";
    }
  };

  const hasDetails = Boolean(
    userProfile &&
      userProfile.fullName &&
      userProfile.email &&
      userProfile.pan &&
      userProfile.aadhar &&
      userProfile.bankAccountNo
  );

  return (
    <>
      {/* Top announcement bar */}
      <div className="announcement">
        CONSIDERED ESSENTIALS · FLEXIBLE PAYMENTS · ZERO COLLATERAL FINANCING
      </div>

      {/* Main navigation */}
      <header className="navbar">
        {/* Brand */}
        <a
          className="brand"
          href="/"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              onNavigateHome();
            }
          }}
          aria-label="ShopSphere home"
        >
          shopsphere<span>.</span>
        </a>

        {/* Navigation links */}
        <nav className="nav-center" aria-label="Main navigation">
          <a
            href="#emi-calculator"
            onClick={(e) => {
              if (onNavigateHome) {
                e.preventDefault();
                onNavigateHome();
              }
            }}
          >
            EMI Calculator
          </a>
          <a href="#how-it-works">How it works</a>
        </nav>

        {/* Right side */}
        <div className="nav-right">
          {/* MY DETAILS SECTION IN NAVBAR */}
          <button
            type="button"
            className={`my-details-nav-btn ${hasDetails ? "verified" : ""}`}
            onClick={onOpenDetails}
            aria-label="View My Details"
            title={
              hasDetails
                ? `My Details: ${userProfile.fullName} (KYC Verified)`
                : "View or Complete My Details"
            }
          >
            {hasDetails ? (
              <>
                <div className="nav-user-icon verified">
                  <UserCheck size={16} strokeWidth={2} />
                  <span className="online-dot" />
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-label">My Details</span>
                  <span className="nav-user-status">Verified</span>
                </div>
              </>
            ) : (
              <>
                <div className="nav-user-icon">
                  <User size={16} strokeWidth={1.8} />
                </div>
                <div className="nav-user-info">
                  <span className="nav-user-label">My Details</span>
                  <span className="nav-user-status not-filled">Add Details</span>
                </div>
              </>
            )}
          </button>

          <button
            type="button"
            className="back-button"
            onClick={handleGoBack}
            aria-label="Return to ShopSphere Cart"
            title="Return to ShopSphere Cart"
          >
            <ArrowLeft size={17} strokeWidth={1.7} />
          </button>

          <div className="emi-bag" title="ShopSphere EMI">
            <ShoppingBag size={18} strokeWidth={1.6} />
            <span>EMI</span>
          </div>
        </div>
      </header>
    </>
  );
}
