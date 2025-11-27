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

  const cart = useSelector((state) => state.cart) || { products: [], totalPrice: 0 };

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

  const handlePlaceOrder = async () => {
    // Validation
    if (!billingInfo.name || !billingInfo.email || !billingInfo.phone) {
      toast.error("Please fill all Billing Information fields");
      return;
    }
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zip) {
      toast.error("Please fill all Shipping Information fields");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a Payment Method");
      return;
    }

    // Prevent double submission
    if (isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);

    try {
      console.log('📤 Placing order with shipping:', shippingInfo);

      // Backend returns { success: true, data: order, message: '...' }
      const response = await orderAPI.createOrder({ 
        shippingAddress: shippingInfo 
      });
      
      console.log('✅ Order response:', response);

      // Extract the actual order from response.data.data
      const order = response.data?.data || response.data;
      
      if (!order || !order._id) {
        throw new Error('Invalid order response');
      }

      console.log('✅ Order created:', order);
      
      toast.success("Order placed successfully! 🎉");
      
      // Clear cart
      await dispatch(clearCartAsync()).unwrap();
      
      // Navigate to order confirmation
      navigate("/order-confirmation", {
        state: {
          orderId: order._id,
          products: order.items,
          totalPrice: order.totalAmount,
          totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      });
    } catch (error) {
      console.error('❌ Order placement error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.message || "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-10 lg:px-20 min-h-screen bg-gradient-to-r from-slate-100 to-slate-200">
      <h3 className="text-3xl font-bold mb-8 text-gray-800 drop-shadow">
        Checkout
      </h3>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          {/* Billing Info */}
          <div className="rounded-xl shadow-2xl p-4 bg-white hover:shadow-3xl transition-all duration-300">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setBillingToggle(!billingToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Billing Information
              </h4>
              {billingToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>

            {billingToggle && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your full name"
                    value={billingInfo.name}
                    onChange={(e) =>
                      setBillingInfo({ ...billingInfo, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your email"
                    value={billingInfo.email}
                    onChange={(e) =>
                      setBillingInfo({ ...billingInfo, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your phone number"
                    value={billingInfo.phone}
                    onChange={(e) =>
                      setBillingInfo({ ...billingInfo, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div className="rounded-xl shadow-2xl p-4 bg-white hover:shadow-3xl transition-all duration-300">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShippingToggle(!shippingToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Shipping Information
              </h4>
              {shippingToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>

            {shippingToggle && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your address"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">City</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your city"
                    value={shippingInfo.city}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Zip Code</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter zip code"
                    value={shippingInfo.zip}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, zip: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="rounded-xl shadow-2xl p-4 bg-white hover:shadow-3xl transition-all duration-300">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setPaymentToggle(!paymentToggle)}
            >
              <h4 className="text-xl font-semibold text-gray-700">
                Payment Method
              </h4>
              {paymentToggle ? <FaAngleDown /> : <FaAngleUp />}
            </div>

            {paymentToggle && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mr-2"
                  />
                  <label>Cash on Delivery</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="mr-2"
                  />
                  <label>Debit/Credit Card</label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:w-1/3">
          <div className="rounded-xl shadow-2xl p-6 bg-white sticky top-20">
            <h4 className="text-2xl font-bold mb-4 text-gray-800">
              Order Summary
            </h4>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Products:</span>
                <span className="font-semibold">
                  {cart.products?.length || 0}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 text-lg">
                <span>Total:</span>
                <span className="font-bold text-blue-600">
                  ₹{cart.totalPrice?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                isPlacingOrder
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;