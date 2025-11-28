import React, { useState, useEffect } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { clearCartAsync } from "../redux/cartSlice";
import { orderAPI } from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [billingToggle, setBillingToggle] = useState(true);
  const [shippingToggle, setShippingToggle] = useState(false);
  const [paymentToggle, setPaymentToggle] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const cart = useSelector((state) => state.cart) || {
    products: [],
    totalPrice: 0,
  };

  useEffect(() => {
    if (!user) {
      toast.error("Please login to checkout");
      navigate("/");
    }
  }, [user, navigate]);

  const [billingInfo, setBillingInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    zip: "",
  });

  // --------------------
  // Dummy Razorpay Payment
  // --------------------
  const handleRazorpayPayment = async () => {
    if (cart.totalPrice <= 0) {
      toast.error("Cart total must be greater than 0");
      return;
    }

    setIsPlacingOrder(true);

    setTimeout(async () => {
      toast.success("Dummy Razorpay payment successful!");
      await finalizeOrder("card");
    }, 1200);
  };

  // --------------------
  // Finalize Order
  // --------------------
  const finalizeOrder = async (method) => {
    try {
      const response = await orderAPI.createOrder({
        shippingAddress: shippingInfo,
        paymentMethod: method,
        paymentStatus: method === "card" ? "paid" : "pending",
      });

      const order = response.data?.data || response.data;

      if (!order || !order._id) {
        throw new Error("Invalid order response");
      }

      toast.success("Order placed successfully! 🎉");

      await dispatch(clearCartAsync()).unwrap();

      navigate("/order-confirmation", {
        state: {
          orderId: order._id,
          products: order.items,
          totalPrice: order.totalAmount,
          totalItems: order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
        },
      });
    } catch (error) {
      console.error("Order placement error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to place order";
      toast.error(errorMessage);
      setIsPlacingOrder(false);
    }
  };

  // --------------------
  // Handle Place Order
  // --------------------
  const handlePlaceOrder = async () => {
    if (!billingInfo.name || !billingInfo.email || !billingInfo.phone) {
      toast.error("Please fill all Billing Information fields");
      return;
    }
    if (
      !shippingInfo.address ||
      !shippingInfo.city ||
      !shippingInfo.zip
    ) {
      toast.error("Please fill all Shipping Information fields");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a Payment Method");
      return;
    }

    if (isPlacingOrder) return;

    if (paymentMethod === "card") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "cod") {
      setIsPlacingOrder(true);
      await finalizeOrder("cod");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#3B2F2F" }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FORM LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center cursor-pointer"
                onClick={() => setBillingToggle(!billingToggle)}>
                <h4 className="text-xl font-bold" style={{ color: "#3B2F2F" }}>
                  Billing Information
                </h4>
                {billingToggle ? <FaAngleDown /> : <FaAngleUp />}
              </div>

              {billingToggle && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3B2F2F" }}>
                      Full Name
                    </label>
                    <input type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#E5E0E0", "--tw-ring-color": "#3B2F2F" }}
                      placeholder="Enter your full name"
                      value={billingInfo.name}
                      onChange={(e) => setBillingInfo({ ...billingInfo, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3B2F2F" }}>
                      Email
                    </label>
                    <input type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#E5E0E0", "--tw-ring-color": "#3B2F2F" }}
                      placeholder="Enter your email"
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3B2F2F" }}>
                      Phone
                    </label>
                    <input type="tel"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#E5E0E0", "--tw-ring-color": "#3B2F2F" }}
                      placeholder="Enter your phone number"
                      value={billingInfo.phone}
                      onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SHIPPING */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center cursor-pointer"
                onClick={() => setShippingToggle(!shippingToggle)}>
                <h4 className="text-xl font-bold" style={{ color: "#3B2F2F" }}>
                  Shipping Address
                </h4>
                {shippingToggle ? <FaAngleDown /> : <FaAngleUp />}
              </div>

              {shippingToggle && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3B2F2F" }}>
                      Address
                    </label>
                    <input type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#E5E0E0", "--tw-ring-color": "#3B2F2F" }}
                      placeholder="Enter your address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3B2F2F" }}>
                      City
                    </label>
                    <input type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#E5E0E0", "--tw-ring-color": "#3B2F2F" }}
                      placeholder="Enter your city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "#3B2F2F" }}>
                      Zip Code
                    </label>
                    <input type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2"
                      style={{ borderColor: "#E5E0E0", "--tw-ring-color": "#3B2F2F" }}
                      placeholder="Enter zip code"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center cursor-pointer"
                onClick={() => setPaymentToggle(!paymentToggle)}>
                <h4 className="text-xl font-bold" style={{ color: "#3B2F2F" }}>
                  Payment Method
                </h4>
                {paymentToggle ? <FaAngleDown /> : <FaAngleUp />}
              </div>

              {paymentToggle && (
                <div className="mt-4 space-y-3">

                  {/* COD */}
                  <label
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                    style={{
                      borderColor:
                        paymentMethod === "cod" ? "#3B2F2F" : "#E5E0E0",
                      backgroundColor:
                        paymentMethod === "cod" ? "#F3F0F0" : "transparent",
                    }}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold" style={{ color: "#3B2F2F" }}>
                        💵 Cash On Delivery
                      </p>
                    </div>
                  </label>

                  {/* CARD */}
                  <label
                    className="flex items-center p-4 border-2 rounded-lg cursor-pointer"
                    style={{
                      borderColor:
                        paymentMethod === "card" ? "#3B2F2F" : "#E5E0E0",
                      backgroundColor:
                        paymentMethod === "card" ? "#F3F0F0" : "transparent",
                    }}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold" style={{ color: "#3B2F2F" }}>
                        💳 Debit / Credit Card (Dummy)
                      </p>
                    </div>
                  </label>

                  {/* DUMMY CARD FORM */}
                  {paymentMethod === "card" && (
                    <div className="mt-4 p-4 border rounded-lg bg-gray-50 space-y-4">

                      <div>
                        <label className="text-sm text-gray-700 mb-1 block">
                          Card Holder Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="Card Holder Name"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-700 mb-1 block">
                          Card Number
                        </label>
                        <input
                          type="text"
                          maxLength="16"
                          className="w-full px-4 py-2 border rounded-lg"
                          placeholder="0000 0000 0000 0000"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-700 mb-1 block">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            maxLength="5"
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="MM/YY"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-gray-700 mb-1 block">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength="3"
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="***"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-2xl font-bold mb-6" style={{ color: "#3B2F2F" }}>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between" style={{ color: "#666666" }}>
                  <span>Total Items:</span>
                  <span className="font-semibold">{cart.products?.length || 0}</span>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: "#E5E0E0" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold" style={{ color: "#3B2F2F" }}>
                      Total Amount:
                    </span>
                    <span className="text-2xl font-bold" style={{ color: "#10B981" }}>
                      ₹{cart.totalPrice?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || cart.products?.length === 0}
                className="w-full py-3 rounded-lg text-white font-bold"
                style={{
                  backgroundColor: isPlacingOrder ? "#999999" : "#3B2F2F",
                  cursor:
                    isPlacingOrder || cart.products?.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                {isPlacingOrder ? "Processing..." : "Place Order"}
              </button>

              <p className="text-xs text-center mt-4" style={{ color: "#888888" }}>
               
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
