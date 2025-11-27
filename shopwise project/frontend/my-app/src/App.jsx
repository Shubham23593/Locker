import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot"; // ✅ Import Chatbot
import Profile from "./pages/Profile";
import Contact from "./components/Contact";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetail from './pages/OrderDetail';
import ProductDetail from "./pages/ProductDetail";
import FilterData from "./components/FilterData";
import OrderSuccess from "./components/OrderSuccess";
import AuthForm from "./components/AuthForm";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { fetchCart } from "./redux/cartSlice";

function AppRoutes() {
  const [order, setOrder] = useState(null);
  const { user, loading } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/checkout"
          element={
            user ? (
              <Checkout setOrder={setOrder} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/order-confirmation"
          element={
            user ? <OrderSuccess /> : <Navigate to="/" replace />
          }
        />
        <Route path="/filter-data" element={<FilterData />} />
        <Route
          path="/auth"
          element={!user ? <AuthForm /> : <Navigate to="/" />}
        />
      </Routes>

      <Footer />

      {/* ✅ Chatbot Widget - Shows only for logged-in users */}
      <Chatbot />

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 99999 }}
      />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}