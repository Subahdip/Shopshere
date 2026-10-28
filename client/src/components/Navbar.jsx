import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, UserRound, LogOut, LayoutDashboard } from "lucide-react";
import { useCart } from "../components/context/CartContext";
import { useAuth } from "../components/context/AuthContext";
export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <div className="announcement">
        CONSIDERED ESSENTIALS · FREE SHIPPING OVER ₹2,500
      </div>
      <nav className="nav container">
        <Link to="/" className="brand">
          shop<span>sphere</span>
          <i>.</i>
        </Link>
        <div className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          <a href="/#story">Our approach</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="welcome">Hi, {user.name.split(" ")[0]}</span>
              {user.role === "admin" && (
                <Link aria-label="Admin dashboard" to="/admin">
                  <LayoutDashboard size={19} />
                </Link>
              )}
              <button
                className="icon-button"
                aria-label="Sign out"
                onClick={logout}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link aria-label="Sign in" to="/login">
              <UserRound size={19} />
            </Link>
          )}
          <Link className="bag-link" aria-label="Shopping bag" to="/cart">
            <ShoppingBag size={20} />
            <span>{count}</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
import React, { useState, useEffect } from "react";
