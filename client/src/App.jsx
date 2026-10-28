import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./components/context/CartContext";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Login, Register } from "./pages/AuthPages";
import { MyOrders, OrderConfirmation } from "./pages/Orders";
import Admin from "./pages/Admin";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <Link to="/" className="brand">
          shop<span>sphere</span>
          <i>.</i>
        </Link>

        <p>Considered essentials for everyday living.</p>

        <Link to="/shop" className="text-link">
          Explore the collection ↗
        </Link>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ShopSphere</span>
        <span>Made for repeat wear.</span>
        <span>Demo store · Payments not enabled</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderConfirmation />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute admin>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <main className="container page-section empty-state">
                <h1>
                  Page not found<span>.</span>
                </h1>

                <Link className="text-link" to="/">
                  Return home
                </Link>
              </main>
            }
          />
        </Routes>

        <Footer />
      </CartProvider>
    </BrowserRouter>
  );
}
