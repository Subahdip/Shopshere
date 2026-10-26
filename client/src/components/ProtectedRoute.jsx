import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { useState, useEffect } from "react";
export default function ProtectedRoute({ children, admin = false }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
