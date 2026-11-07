
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";

// ==========================================
// 1. FIREBASE ERROR HANDLING
// ==========================================

function getErrorMessage(err) {
  const messages = {
    "auth/invalid-phone-number":
      "Please enter a valid phone number with country code.",

    "auth/missing-phone-number":
      "Please enter your phone number.",

    "auth/invalid-verification-code":
      "Incorrect OTP. Please try again.",

    "auth/code-expired":
      "Your OTP has expired. Please request a new one.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/quota-exceeded":
      "Firebase SMS quota exceeded. Please try again later.",

    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Please refresh and try again.",

    "auth/invalid-app-credential":
      "Firebase could not verify this application. Please refresh and try again.",

    "auth/popup-closed-by-user":
      "Google sign-in was cancelled.",

    "auth/popup-blocked":
      "Your browser blocked the Google sign-in popup.",

    "auth/operation-not-allowed":
      "This sign-in method is not enabled in Firebase Console.",

    "auth/unauthorized-domain":
      "This domain is not authorized in Firebase Console.",

    "auth/invalid-credential":
      "Incorrect email or password.",

    "auth/user-not-found":
      "No account found with these credentials.",

    "auth/wrong-password":
      "Incorrect email or password.",

    "auth/network-request-failed":
      "Network error. Please check your internet connection.",

    "auth/account-exists-with-different-credential":
      "An account already exists with a different sign-in method.",
  };

  return (
    messages[err.code] ||
    err.response?.data?.message ||
    err.message ||
    "Something went wrong. Please try again."
  );
}

// ==========================================
// 2. CUSTOMER AUTHENTICATION
// ==========================================

function CustomerAuth({ mode }) {
  const isRegister = mode === "register";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    sendPhoneOtp,
    verifyPhoneOtp,
    signInGoogle,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect after successful authentication
  function navigateAfterLogin(user) {
    const destination =
      location.state?.from?.pathname ||
      (user.role === "admin" ? "/admin" : "/");

    navigate(destination, { replace: true });
  }

  // ========================================
  // SEND OTP
  // ========================================

  async function handleSendOtp(e) {
    e.preventDefault();

    setError("");

    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    const formattedPhone = phone.trim();

    if (!/^\+[1-9]\d{7,14}$/.test(formattedPhone)) {
      setError(
        "Enter a valid phone number with country code, e.g. +919876543210."
      );
      return;
    }

    setLoading(true);

    try {
      await sendPhoneOtp(formattedPhone);

      setOtpSent(true);
      setOtp("");
    } catch (err) {
      console.error("OTP request failed:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // VERIFY OTP
  // ========================================

  async function handleVerifyOtp(e) {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const authenticatedUser = await verifyPhoneOtp(
        otp,
        isRegister ? name.trim() : ""
      );

      navigateAfterLogin(authenticatedUser);
    } catch (err) {
      console.error("OTP verification failed:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // GOOGLE SIGN-IN
  // ========================================

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const authenticatedUser = await signInGoogle();

      navigateAfterLogin(authenticatedUser);
    } catch (err) {
      console.error("Google sign-in failed:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // CHANGE PHONE NUMBER
  // ========================================

  function handleChangePhone() {
    setOtpSent(false);
    setOtp("");
    setError("");
  }

  // ========================================
  // CUSTOMER AUTH UI
  // ========================================

  return (
    <main className="auth-page">
      <div className="auth-card">

        <p className="eyebrow">
          WELCOME TO SHOPSPHERE
        </p>

        <h1>
          {isRegister
            ? "Make room for better."
            : "Good to have you back."}
        </h1>

        <p className="muted">
          Sign in securely using your phone number or Google account.
        </p>

        {/* PHONE NUMBER FORM */}

        {!otpSent ? (
          <form
            onSubmit={handleSendOtp}
            className="form-stack"
          >

            {isRegister && (
              <label>
                Full name

                <input
                  required
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  disabled={loading}
                />
              </label>
            )}

            <label>
              Phone number

              <input
                required
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                disabled={loading}
              />
            </label>

            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="button button-dark full-button"
            >
              {loading ? "Sending OTP..." : "Request OTP"}
            </button>

          </form>
        ) : (

          /* OTP VERIFICATION FORM */

          <form
            onSubmit={handleVerifyOtp}
            className="form-stack"
          >

            <p className="muted">
              Enter the verification code sent to {phone}.
            </p>

            <label>
              Enter OTP

              <input
                required
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                placeholder="6-digit OTP"
                disabled={loading}
              />
            </label>

            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="button button-dark full-button"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="button full-button"
              disabled={loading}
              onClick={handleChangePhone}
            >
              Change phone number
            </button>

          </form>
        )}

        {/* IMPORTANT: Keep exactly one reCAPTCHA container */}

        <div id="recaptcha-container"></div>

        {/* DIVIDER */}

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* GOOGLE SIGN-IN */}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="button full-button"
        >
          {loading
            ? "Please wait..."
            : "Continue with Google"}
        </button>

        {/* CUSTOMER NAVIGATION */}

        <p className="auth-switch">
          {isRegister
            ? "Already have an account?"
            : "New to ShopSphere?"}{" "}

          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>

        {/* ADMIN NAVIGATION */}

        <p className="auth-switch">
          Are you an administrator?{" "}

          <Link to="/admin/login">
            Admin Login
          </Link>
        </p>

      </div>
    </main>
  );
}

// ==========================================
// 3. ADMIN EMAIL/PASSWORD LOGIN
// ==========================================

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const authenticatedUser = await login({
        email: email.trim(),
        password,
      });

      // Only backend-confirmed admins can continue
      if (authenticatedUser.role !== "admin") {
        await logout();

        throw new Error(
          "Access denied. This account is not an administrator."
        );
      }

      navigate(
        location.state?.from?.pathname || "/admin",
        { replace: true }
      );

    } catch (err) {
      console.error("Admin login failed:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">

        <p className="eyebrow">
          SHOPSPHERE ADMINISTRATION
        </p>

        <h1>Admin Login</h1>

        <p className="muted">
          Sign in with your authorized administrator credentials.
        </p>

        <form
          onSubmit={handleSubmit}
          className="form-stack"
        >

          <label>
            Email address

            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={loading}
            />
          </label>

          <label>
            Password

            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your admin password"
              disabled={loading}
            />
          </label>

          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-dark full-button"
          >
            {loading ? "Signing in..." : "Admin Sign In"}
          </button>

        </form>

        <p className="auth-switch">
          Customer?{" "}

          <Link to="/login">
            Go to customer login
          </Link>
        </p>

      </div>
    </main>
  );
}

// ==========================================
// 4. CUSTOMER LOGIN PAGE
// ==========================================

export function Login() {
  return <CustomerAuth mode="login" />;
}

// ==========================================
// 5. CUSTOMER REGISTRATION PAGE
// ==========================================

export function Register() {
  return <CustomerAuth mode="register" />;
}
