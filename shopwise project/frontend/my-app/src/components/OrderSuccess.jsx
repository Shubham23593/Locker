import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaShoppingBag, FaHome } from "react-icons/fa";

const OrderSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <div style={{ backgroundColor: '#F5F5F5' }} className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4" style={{ color: '#3B2F2F' }}>
            No order data found
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: '#3B2F2F' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { products, totalPrice, totalItems } = state;

  return (
    <div style={{ backgroundColor: '#F5F5F5' }} className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center animate-bounce"
              style={{ backgroundColor: '#D1FAE5' }}
            >
              <FaCheckCircle size={40} style={{ color: '#065F46' }} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#3B2F2F' }}>
            🎉 Order Successful!
          </h1>
          <p className="text-lg" style={{ color: '#666666' }}>
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="text-sm mt-2" style={{ color: '#888888' }}>
            A confirmation email has been sent to your inbox
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FaShoppingBag size={24} style={{ color: '#3B2F2F' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
              Order Summary
            </h2>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-8">
            {products && products.length > 0 ? (
              products.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-lg border"
                  style={{ borderColor: '#E5E0E0', backgroundColor: '#FAFAF9' }}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1" style={{ color: '#3B2F2F' }}>
                      {product.name}
                    </h3>
                    {product.brand && (
                      <p className="text-sm mb-2" style={{ color: '#888888' }}>
                        Brand: {product.brand}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm">
                      <span style={{ color: '#888888' }}>
                        Qty: <span className="font-bold">{product.quantity}</span>
                      </span>
                      <span style={{ color: '#888888' }}>
                        Price: <span className="font-bold">₹{product.price?.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs mb-1" style={{ color: '#888888' }}>Subtotal</p>
                    <p className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                      ₹{(product.price * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#888888' }}>No items in this order</p>
            )}
          </div>

          {/* Order Total */}
          <div className="pt-6 border-t-2" style={{ borderColor: '#E5E0E0' }}>
            <div className="flex justify-between items-center mb-2">
              <span style={{ color: '#888888' }}>
                Total Items:
              </span>
              <span className="font-bold" style={{ color: '#3B2F2F' }}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold" style={{ color: '#3B2F2F' }}>
                Order Total:
              </span>
              <span className="text-3xl font-bold" style={{ color: '#3B2F2F' }}>
                ₹{totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Track Order */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-3" style={{ color: '#3B2F2F' }}>
              📦 Track Your Order
            </h3>
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              Check the status of your order and track your shipment in real-time
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="w-full py-2 px-4 rounded-lg text-white font-medium transition-all"
              style={{ backgroundColor: '#3B2F2F' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              View My Orders
            </button>
          </div>

          {/* Continue Shopping */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-3" style={{ color: '#3B2F2F' }}>
              🛍️ Continue Shopping
            </h3>
            <p className="text-sm mb-4" style={{ color: '#666666' }}>
              Explore more amazing products from our collection
            </p>
            <button
              onClick={() => navigate("/products")}
              className="w-full py-2 px-4 rounded-lg text-white font-medium transition-all"
              style={{ backgroundColor: '#3B2F2F' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Browse Products
            </button>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/profile")}
              className="flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#3B2F2F', color: 'white' }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              <FaShoppingBag size={18} />
              View All Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: '#F3F0F0', color: '#3B2F2F' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E0E0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F0F0'}
            >
              <FaHome size={18} />
              Back to Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;