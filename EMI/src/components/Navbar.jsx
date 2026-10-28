
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function Navbar() {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  return (
    <>
      {/* Top announcement bar */}
      <div className="announcement">
        CONSIDERED ESSENTIALS · FLEXIBLE PAYMENTS
      </div>

      {/* Main navigation */}
      <header className="navbar">
        {/* Brand */}
        <a className="brand" href="/" aria-label="ShopSphere home">
          shopsphere<span>.</span>
        </a>

        {/* Navigation links */}
        <nav className="nav-center" aria-label="Main navigation">
          <a href="#emi-calculator">EMI Calculator</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        {/* Right side */}
        <div className="nav-right">
          <button
            type="button"
            className="back-button"
            onClick={handleGoBack}
            aria-label="Go back"
            title="Go back"
          >
            <ArrowLeft size={17} strokeWidth={1.7} />
          </button>

          <div className="emi-bag" title="ShopSphere EMI">
            <ShoppingBag size={19} strokeWidth={1.6} />
            <span>EMI</span>
          </div>
        </div>
      </header>
    </>
  );
}
