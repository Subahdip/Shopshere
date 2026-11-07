
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../../services/firebase";
import api from "../../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const recaptchaRef = useRef(null);
  const recaptchaContainerRef = useRef(null);

  // ==========================================
  // 1. SYNC FIREBASE USER WITH MONGODB
  // ==========================================

  async function syncUser(firebaseUser, name = "") {
    const token = await firebaseUser.getIdToken();

    const response = await api.post(
      "/auth/session",
      {
        name: name || firebaseUser.displayName || "",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setUser(response.data.user);

    return response.data.user;
  }

  // ==========================================
  // 2. LISTEN FOR FIREBASE AUTH CHANGES
  // ==========================================

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);

        try {
          if (firebaseUser) {
            const token = await firebaseUser.getIdToken();

            const response = await api.post(
              "/auth/session",
              {
                name: firebaseUser.displayName || "",
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (active) {
              setUser(response.data.user);
            }
          } else if (active) {
            setUser(null);
          }
        } catch (error) {
          console.error("Authentication sync failed:", error);

          if (active) {
            setUser(null);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // ==========================================
  // 3. ADMIN EMAIL/PASSWORD LOGIN
  // ==========================================

  async function login({ email, password }) {
    const result = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    return await syncUser(result.user);
  }

  // ==========================================
  // 4. EXISTING EMAIL REGISTRATION
  // ==========================================

  async function register({ name, email, password }) {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password
    );

    await updateProfile(result.user, {
      displayName: name.trim(),
    });

    return await syncUser(result.user, name.trim());
  }

  // ==========================================
  // 5. INITIALIZE reCAPTCHA
  // ==========================================

  async function initializeRecaptcha() {
    const container = document.getElementById(
      "recaptcha-container"
    );

    if (!container) {
      throw new Error(
        "reCAPTCHA container was not found. Please reload the login page."
      );
    }

    // Reuse the verifier if the same container is still mounted.
    if (
      recaptchaRef.current &&
      recaptchaContainerRef.current === container
    ) {
      return recaptchaRef.current;
    }

    // Remove a verifier associated with an old container.
    if (recaptchaRef.current) {
      try {
        recaptchaRef.current.clear();
      } catch (error) {
        console.warn("reCAPTCHA cleanup:", error);
      }

      recaptchaRef.current = null;
      recaptchaContainerRef.current = null;
    }

    const verifier = new RecaptchaVerifier(
      auth,
      container,
      {
        size: "invisible",

        callback: () => {
          console.log("reCAPTCHA verified successfully.");
        },

        "expired-callback": () => {
          console.warn("reCAPTCHA verification expired.");
        },
      }
    );

    recaptchaRef.current = verifier;
    recaptchaContainerRef.current = container;

    try {
      await verifier.render();
      return verifier;
    } catch (error) {
      recaptchaRef.current = null;
      recaptchaContainerRef.current = null;

      try {
        verifier.clear();
      } catch {
        // Ignore cleanup errors.
      }

      throw error;
    }
  }

  // ==========================================
  // 6. CUSTOMER PHONE OTP - SEND
  // ==========================================

  async function sendPhoneOtp(phoneNumber) {
    const formattedPhone = String(phoneNumber || "").trim();

    if (!/^\+[1-9]\d{7,14}$/.test(formattedPhone)) {
      throw new Error(
        "Enter a valid phone number with country code, e.g. +919876543210."
      );
    }

    try {
      const verifier = await initializeRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );

      setConfirmationResult(result);

      console.log("OTP request submitted successfully.");

      return result;
    } catch (error) {
      console.error("Phone OTP error:", error.code, error.message);

      // A failed verification may leave the reCAPTCHA response
      // unusable. Reset it without creating another verifier.
      if (recaptchaRef.current) {
        try {
          const widgetId = await recaptchaRef.current.render();

          if (window.grecaptcha) {
            window.grecaptcha.reset(widgetId);
          }
        } catch (resetError) {
          console.warn("reCAPTCHA reset failed:", resetError);
        }
      }

      throw error;
    }
  }

  // ==========================================
  // 7. CUSTOMER PHONE OTP - VERIFY
  // ==========================================

  async function verifyPhoneOtp(otp, name = "") {
    if (!confirmationResult) {
      throw new Error(
        "Please request an OTP before verifying."
      );
    }

    const code = String(otp || "").trim();

    if (!/^\d{6}$/.test(code)) {
      throw new Error("Please enter a valid 6-digit OTP.");
    }

    const result = await confirmationResult.confirm(code);

    setConfirmationResult(null);

    const displayName = String(name || "").trim();

    if (displayName && !result.user.displayName) {
      await updateProfile(result.user, {
        displayName,
      });
    }

    return await syncUser(
      result.user,
      displayName || result.user.displayName || ""
    );
  }

  // ==========================================
  // 8. CUSTOMER GOOGLE SIGN-IN
  // ==========================================

  async function signInGoogle() {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);

    return await syncUser(result.user);
  }

  // ==========================================
  // 9. LOGOUT
  // ==========================================

  async function logout() {
    await signOut(auth);

    setUser(null);
    setConfirmationResult(null);
  }

  // ==========================================
  // 10. PROVIDE AUTHENTICATION CONTEXT
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        sendPhoneOtp,
        verifyPhoneOtp,
        signInGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
