import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = isRegister
        ? await register({ name, email, password })
        : await login({ email, password });
      navigate(
        location.state?.from?.pathname ||
          (user.role === "admin" ? "/admin" : "/"),
        { replace: true },
      );
    } catch (err) {
      const messages = {
        "auth/operation-not-allowed":
          "Email/Password sign-in is disabled in Firebase Console. Please enable it under Authentication > Sign-in method.",
        "auth/user-not-found":
          "No account found with this email. Please click 'Create an account' below first.",
        "auth/email-already-in-use":
          "This email is already registered. Please sign in.",
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/weak-password": "Choose a password with at least 8 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
      };

      setError(
        messages[err.code] ||
          err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">WELCOME TO SHOPSPHERE</p>
        <h1>
          {isRegister ? "Make room for better." : "Good to have you back."}
        </h1>
        <p className="muted">
          {isRegister
            ? "Create an account to save your details and track orders."
            : "Sign in to continue to your considered essentials."}
        </p>
        <form onSubmit={submit} className="form-stack">
          {isRegister && (
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              minLength={8}
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </label>
          {error && <p className="notice error">{error}</p>}
          <button disabled={loading} className="button button-dark full-button">
            {loading
              ? "Please wait…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "New to ShopSphere?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
export function Login() {
  return <AuthForm mode="login" />;
}
export function Register() {
  return <AuthForm mode="register" />;
}
