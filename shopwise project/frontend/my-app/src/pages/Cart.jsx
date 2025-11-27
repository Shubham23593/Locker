import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaShoppingBag } from "react-icons/fa";
import { 
  fetchCart, 
  updateCartItemAsync, 
  removeFromCartAsync 
} from "../redux/cartSlice";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, totalQuantity, totalPrice, loading } = useSelector(
    (state) => state.cart
  );
  
  const [updatingItems, setUpdatingItems] = useState({});

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    if (updatingItems[productId]) return;
    
    try {
      setUpdatingItems(prev => ({ ...prev, [productId]: true }));
      await dispatch(
        updateCartItemAsync({ productId, quantity: newQuantity })
      ).unwrap();
    } catch (error) {
      toast.error(error || "Failed to update quantity");
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromCartAsync(productId)).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error || "Failed to remove item");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 sm:py-12 px-4 md:px-8 lg:px-16 xl:px-24 min-h-[60vh]">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Shopping Cart</h2>
        <div className="text-center py-12">
          <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Please login to view your cart</p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#3B2F2F] text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading && !products.length) {
    return (
      <div className="container mx-auto py-12 flex justify-center min-h-[60vh] items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2F2F]"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto py-8 sm:py-12 px-4 md:px-8 lg:px-16 xl:px-24 min-h-[60vh]">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Shopping Cart</h2>
        <div className="text-center py-12">
          <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-base sm:text-lg mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-[#3B2F2F] text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-red-700 transition transform hover:scale-105"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 md:px-8 lg:px-16 xl:px-24 min-h-[60vh]">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">Shopping Cart</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {products.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Product Info */}
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 w-full sm:w-auto mb-3 sm:mb-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                  }}
                />
                <div className="flex-1 min-w-0">
                  {/* ✅ Display product name with variant */}
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 line-clamp-2">
                    {item.name}
                  </h3>
                  {/* ✅ Display variant price */}
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">
                    ₹{item.price?.toLocaleString('en-IN')}
                    {item.variant && (
                      <span className="ml-2 text-xs text-[#3B2F2F] font-semibold">
                        ({item.variant})
                      </span>
                    )}
                  </p>
                  {item.brand && (
                    <p className="text-gray-500 text-xs mt-0.5">{item.brand}</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4 w-full sm:w-auto">
                {/* Quantity Controls */}
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={updatingItems[item.productId] || item.quantity <= 1}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    -
                  </button>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 min-w-[40px] sm:min-w-[50px] text-center text-sm sm:text-base">
                    {updatingItems[item.productId] ? (
                      <div className="animate-spin h-3 w-3 sm:h-4 sm:w-4 border-2 border-[#3B2F2F] border-t-transparent rounded-full mx-auto"></div>
                    ) : (
                      item.quantity
                    )}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={updatingItems[item.productId]}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    +
                  </button>
                </div>

                {/* ✅ Item Total - Uses variant price */}
                <div className="text-right min-w-[70px] sm:min-w-[80px]">
                  <p className="font-semibold text-sm sm:text-base text-gray-800">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition flex-shrink-0"
                  title="Remove item"
                >
                  <FaTrashAlt className="text-sm sm:text-base" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-4">
          <div className="bg-gray-100 p-4 sm:p-6 rounded-lg sticky top-20">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Cart Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm sm:text-base text-gray-700">
                <span>Total Items:</span>
                <span className="font-semibold">{totalQuantity}</span>
              </div>
              
              <div className="border-t pt-3">
                {/* ✅ Total Price - Calculated from variant prices */}
                <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                  <span>Total Price:</span>
                  <span>₹{totalPrice?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-[#3B2F2F] text-white py-2.5 sm:py-3 rounded-lg hover:bg-red-700 transition transform hover:scale-105 font-semibold text-sm sm:text-base"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/shop")}
              className="w-full mt-3 bg-white text-[#3B2F2F] py-2.5 sm:py-3 rounded-lg border-2 border-[#3B2F2F] hover:bg-gray-50 transition font-semibold text-sm sm:text-base"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;