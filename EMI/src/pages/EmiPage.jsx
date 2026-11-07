
import { useEffect, useMemo, useState } from "react";

import Navbar from "../components/Navbar.jsx";
import ProductSummary from "../components/ProductSummary.jsx";
import EmiCalculator from "../components/EmiCalculator.jsx";
import DetailsForm from "../components/DetailsForm.jsx";
import ConfirmationPage from "../components/ConfirmationPage.jsx";
import EmiSuccessView from "../components/EmiSuccessView.jsx";
import MyDetailsModal from "../components/MyDetailsModal.jsx";

import {
  getEmiProfile,
  saveEmiProfile,
  createEmiOrder,
} from "../services/api.js";

export default function EmiPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState("");

  const [currentView, setCurrentView] = useState("calculator");
  const [pendingScroll, setPendingScroll] = useState("");

  const [userProfile, setUserProfile] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Load the user's saved EMI profile.
  useEffect(() => {
    async function loadInitialProfile() {
      try {
        const profile = await getEmiProfile();

        if (profile) {
          setUserProfile(profile);
        }
      } catch (err) {
        console.warn("Could not load initial EMI profile:", err);
      }
    }

    loadInitialProfile();
  }, []);

  // Read the cart sent by ShopSphere through the URL.
  const cartData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const cartParam = params.get("cart");

    if (!cartParam) {
      return { items: [], error: "" };
    }

    try {
      const parsedCart = JSON.parse(cartParam);

      if (!Array.isArray(parsedCart) || parsedCart.length === 0) {
        return {
          items: [],
          error: "Your cart is empty. Please return to ShopSphere.",
        };
      }

      const invalidItem = parsedCart.some(
        (item) =>
          !item ||
          !item.productId ||
          typeof item.name !== "string" ||
          !item.name.trim() ||
          !Number.isFinite(Number(item.price)) ||
          Number(item.price) < 0 ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1
      );

      if (invalidItem) {
        return {
          items: [],
          error:
            "Some cart details are invalid. Please return to ShopSphere and try again.",
        };
      }

      return {
        items: parsedCart.map((item) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image || "",
          size: item.size || "",
        })),
        error: "",
      };
    } catch {
      return {
        items: [],
        error: "Unable to read your cart. Please return to ShopSphere.",
      };
    }
  }, []);

  const items = cartData.items;

  // ShopSphere shipping rule: free shipping for orders >= ₹2,500.
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 2500 ? 0 : 99;
  const total = subtotal + shipping;

  // Prepare the product/cart information for the EMI calculator.
  const calculatorProduct = useMemo(() => {
    if (items.length === 0) {
      return null;
    }

    if (items.length === 1) {
      const item = items[0];

      return {
        ...item,
        price: item.price * item.quantity + shipping,
        quantity: item.quantity,
        description: `Quantity: ${item.quantity}${
          item.size ? ` | Size: ${item.size}` : ""
        }`,
      };
    }

    return {
      productId: "cart",
      name: `${items.length} products in your bag`,
      price: total,
      image: items[0]?.image || "",
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      category: "Shopping cart",
      description: `${items.length} different products`,
    };
  }, [items, shipping, total]);

  // Check whether all required customer details are present.
  const hasFilledRequiredDetails = (profile) => {
    if (!profile) return false;

    const required = [
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
    ];

    const allPresent = required.every(
      (key) => String(profile[key] || "").trim().length > 0
    );

    const validScore =
      profile.creditScore !== undefined &&
      profile.creditScore !== null &&
      Number(profile.creditScore) >= 300;

    return allPresent && validScore;
  };

  // Continue after selecting an EMI plan.
  function handleContinue(plan) {
    setSelectedPlan(plan);
    setError("");

    if (hasFilledRequiredDetails(userProfile)) {
      setCurrentView("confirm");
    } else {
      setCurrentView("details");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Save customer KYC and bank details.
  async function handleSaveDetails(formData) {
    setIsSavingDetails(true);
    setError("");

    try {
      const saved = await saveEmiProfile(formData);

      setUserProfile(saved);
      setIsSavingDetails(false);

      if (selectedPlan) {
        setCurrentView("confirm");
      } else {
        setCurrentView("calculator");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setIsSavingDetails(false);
      setError(
        err.message || "Failed to save verification details to database."
      );
    }
  }

  // Confirm the EMI order.
  async function handleConfirmOrder() {
    if (!selectedPlan || !userProfile) {
      setError(
        "Please ensure an EMI plan and your required details are completed."
      );
      return;
    }

    setIsConfirmingOrder(true);
    setError("");

    try {
      const orderPayload = {
        profile: userProfile,
        items: items.length > 0 ? items : [calculatorProduct],
        subtotal,
        shipping,
        total,
        plan: selectedPlan,
      };

      const order = await createEmiOrder(orderPayload);

      setConfirmedOrder(order);
      setIsConfirmingOrder(false);
      setCurrentView("success");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setIsConfirmingOrder(false);
      setError(err.message || "Could not confirm order with the server.");
    }
  }

  // Cancel confirmation and return to the calculator.
  function handleCancelConfirmation() {
    setCurrentView("calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Open My Details from the navbar.
  function handleOpenDetailsModal() {
    if (hasFilledRequiredDetails(userProfile)) {
      setIsDetailsModalOpen(true);
    } else {
      setCurrentView("details");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Navigate to the calculator section.
  function handleNavigateCalculator() {
    setError("");
    setCurrentView("calculator");
    setPendingScroll("emi-calculator");
  }

  // Navigate to the How It Works section.
  function handleNavigateHowItWorks() {
    if (currentView !== "calculator") {
      setCurrentView("calculator");
      setPendingScroll("how-it-works");
    } else {
      document
        .getElementById("how-it-works")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Scroll after the calculator view has rendered.
  useEffect(() => {
    if (!pendingScroll || currentView !== "calculator") {
      return;
    }

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(pendingScroll)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });

      setPendingScroll("");
    });

    return () => cancelAnimationFrame(frame);
  }, [currentView, pendingScroll]);

  return (
    <div className="app-shell">
      {/* Navbar */}
      <Navbar
        userProfile={userProfile}
        onOpenDetails={handleOpenDetailsModal}
        onNavigateHome={handleNavigateCalculator}
        onNavigateCalculator={handleNavigateCalculator}
        onNavigateHowItWorks={handleNavigateHowItWorks}
      />

      {/* My Details Modal */}
      <MyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        profile={userProfile}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          setCurrentView("details");
        }}
      />

      <main className="main-content">
        {/* Error notification */}
        {error && (
          <div className="status-card error-message" role="alert">
            {error}
          </div>
        )}

        {/* VIEW 1: DETAILS FORM */}
        {currentView === "details" && (
          <DetailsForm
            initialData={userProfile}
            onSave={handleSaveDetails}
            onCancel={() => setCurrentView("calculator")}
            isSubmitting={isSavingDetails}
            title="Complete Verification & KYC"
            subtitle="Please enter your PAN, Aadhaar, bank details and credit score to proceed with your EMI plan."
            submitLabel="Save Details & Continue to Confirmation"
          />
        )}

        {/* VIEW 2: CONFIRMATION PAGE */}
        {currentView === "confirm" && selectedPlan && (
          <ConfirmationPage
            plan={selectedPlan}
            product={calculatorProduct}
            items={items}
            profile={userProfile}
            onConfirm={handleConfirmOrder}
            onCancel={handleCancelConfirmation}
            onEditDetails={() => setCurrentView("details")}
            isConfirming={isConfirmingOrder}
          />
        )}

        {/* VIEW 3: SUCCESS PAGE */}
        {currentView === "success" && (
          <EmiSuccessView
            order={confirmedOrder}
            plan={selectedPlan}
            profile={userProfile}
            onReset={() => {
              setSelectedPlan(null);
              setConfirmedOrder(null);
              setCurrentView("calculator");
            }}
          />
        )}

        {/* VIEW 4: EMI CALCULATOR */}
        {currentView === "calculator" && (
          <div id="emi-calculator">
            <div className="page-intro">
              <p className="eyebrow">A MORE FLEXIBLE WAY TO SHOP</p>

              <h1>
                Good things,
                <br />
                <em>made affordable.</em>
              </h1>

              <p className="muted intro-description">
                Explore installment options and choose a payment plan that fits
                your budget.
              </p>
            </div>

            {/* Cart validation */}
            {cartData.error ? (
              <div className="status-card error-message">
                <h3>Unable to load your cart</h3>
                <p>{cartData.error}</p>
                <a href="http://localhost:5173/cart">
                  Return to ShopSphere
                </a>
              </div>
            ) : calculatorProduct ? (
              <>
                {/* Cart items summary */}
                <section className="cart-summary-card">
                  <div className="cart-summary-heading">
                    <div>
                      <p className="eyebrow">YOUR SELECTION</p>
                      <h2>Order summary</h2>
                    </div>

                    <span>{items.length} products</span>
                  </div>

                  <div className="emi-cart-items">
                    {items.map((item, index) => (
                      <div
                        className="emi-cart-item"
                        key={`${item.productId}-${item.size}-${index}`}
                      >
                        <div className="emi-cart-image">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <div className="emi-image-placeholder">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="emi-cart-item-details">
                          <h3>{item.name}</h3>

                          {item.size && (
                            <p className="muted">Size: {item.size}</p>
                          )}

                          <p className="muted">
                            Quantity: {item.quantity}
                          </p>

                          <p>
                            ₹{item.price.toLocaleString("en-IN")} each
                          </p>
                        </div>

                        <strong>
                          ₹
                          {(item.price * item.quantity).toLocaleString(
                            "en-IN"
                          )}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="emi-cart-totals">
                    <div>
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>

                    <div>
                      <span>Shipping</span>
                      <span>
                        {shipping === 0
                          ? "FREE"
                          : `₹${shipping.toLocaleString("en-IN")}`}
                      </span>
                    </div>

                    <div className="emi-cart-grand-total">
                      <strong>Order total</strong>
                      <strong>₹{total.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </section>

                {/* EMI Calculator */}
                <div className="checkout-layout">
                  <ProductSummary product={calculatorProduct} />

                  <EmiCalculator
                    product={calculatorProduct}
                    onContinue={handleContinue}
                  />
                </div>
              </>
            ) : (
              <div className="status-card error-message">
                <h3>No products selected</h3>
                <p>
                  Please return to ShopSphere and select Buy with EMI.
                </p>
                <a href="http://localhost:5173/cart">
                  Return to ShopSphere
                </a>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="page-footer" id="how-it-works">
          <span>SHOPSPHERE.</span>
          <span>Thoughtful shopping. Flexible planning.</span>
        </footer>
      </main>
    </div>
  );
}
