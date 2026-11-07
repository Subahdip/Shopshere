
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="auth-loading">Checking authentication...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to={admin ? "/admin/login" : "/login"}
        state={{ from: location }}
        replace
      />
    );
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
