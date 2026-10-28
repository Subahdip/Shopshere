import React, { createContext, useContext, useEffect, useState } from "react";

import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../services/firebase";
import api from "../../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function syncUser(firebaseUser, name = "") {
    const token = await firebaseUser.getIdToken();

    const response = await api.post(
      "/auth/session",
      { name: name || firebaseUser.displayName || "" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setUser(response.data.user);
    return response.data.user;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await syncUser(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication sync failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function login({ email, password }) {
    const result = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    return syncUser(result.user);
  }

  async function register({ name, email, password }) {
    const result = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    await updateProfile(result.user, {
      displayName: name.trim(),
    });

    return syncUser(result.user, name.trim());
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
