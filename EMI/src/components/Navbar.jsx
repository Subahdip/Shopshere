
import {
  ShoppingBag,
  ArrowLeft,
  UserCheck,
  User,
} from "lucide-react";

export default function Navbar({
  userProfile = null,
  onOpenDetails,
  onNavigateHome,
  onNavigateCalculator,
  onNavigateHowItWorks,
}) {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleCalculator = () => {
    if (onNavigateCalculator) {
      onNavigateCalculator();
    } else {
      scrollToSection("emi-calculator");
    }
  };

  const handleHowItWorks = () => {
    if (onNavigateHowItWorks) {
      onNavigateHowItWorks();
    } else {
      scrollToSection("how-it-works");
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
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
      <div className="announcement">
        CONSIDERED ESSENTIALS · FLEXIBLE PAYMENTS · ZERO COLLATERAL FINANCING
      </div>

      <header className="navbar">

        {/* Brand */}
        <button
          type="button"
          className="brand"
          onClick={onNavigateHome}
          aria-label="ShopSphere home"
        >
          shopsphere<span>.</span>
        </button>

        {/* Navigation */}
        <nav className="nav-center" aria-label="Main navigation">

          <button
            type="button"
            onClick={handleCalculator}
          >
            EMI Calculator
          </button>

          <button
            type="button"
            onClick={handleHowItWorks}
          >
            How it works
          </button>

        </nav>

        {/* Right navigation */}
        <div className="nav-right">

          {/* My Details */}
          <button
            type="button"
            className={`my-details-nav-btn ${
              hasDetails ? "verified" : ""
            }`}
            onClick={onOpenDetails}
            aria-label="View My Details"
            title="View or Complete My Details"
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
                  <span className="nav-user-status not-filled">
                    Add Details
                  </span>
                </div>
              </>
            )}
          </button>

          {/* Back */}
          <button
            type="button"
            className="back-button"
            onClick={handleGoBack}
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft size={17} strokeWidth={1.7} />
          </button>

          {/* EMI button */}
          <button
            type="button"
            className="emi-bag"
            onClick={handleCalculator}
            title="Open EMI Calculator"
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            <span>EMI</span>
          </button>

        </div>
      </header>
    </>
  );
}
