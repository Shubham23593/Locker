import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome, FaClock, FaTruck, FaBox } from 'react-icons/fa';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state;

  // If no order data, show fallback
  if (!orderData) {
    return (
      <div style={{ backgroundColor: '#F5F5F5' }} className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
          <p className="text-lg font-semibold mb-4" style={{ color: '#3B2F2F' }}>
            No order information found
          </p>
          <button
            onClick={() => navigate('/')}
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

  const { orderId, products, totalPrice, totalItems } = orderData;

  return (
    <div style={{ backgroundColor: '#F5F5F5' }} className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Success Header */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-8">
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center animate-bounce"
              style={{ backgroundColor: '#D1FAE5' }}
            >
              <FaCheckCircle size={48} style={{ color: '#065F46' }} />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#3B2F2F' }}>
            🎉 Order Confirmed!
          </h1>
          <p className="text-lg mb-1" style={{ color: '#666666' }}>
            Thank you for your purchase with ArtPoint
          </p>
          <p className="text-sm" style={{ color: '#888888' }}>
            A confirmation email has been sent to your inbox
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b" style={{ borderColor: '#E5E0E0' }}>
            <FaShoppingBag size={24} style={{ color: '#3B2F2F' }} />
            <h2 className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
              Order Summary
            </h2>
          </div>

          {/* Order ID and Date */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#888888' }}>Order Number</p>
              <p className="text-lg font-bold font-mono" style={{ color: '#3B2F2F' }}>
                #{orderId?.slice(-8).toUpperCase() || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#888888' }}>Order Date</p>
              <p className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                {new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#3B2F2F' }}>
              Items ({totalItems || products?.length || 0})
            </h3>
            <div className="space-y-3">
              {products && products.length > 0 ? (
                products.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 rounded-lg border-l-4"
                    style={{ 
                      borderLeftColor: '#3B2F2F',
                      borderColor: '#E5E0E0',
                      backgroundColor: '#FAFAF9'
                    }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0 shadow-sm"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base mb-1 line-clamp-2" style={{ color: '#3B2F2F' }}>
                        {item.name}
                      </h4>
                      {item.brand && (
                        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#888888' }}>
                          {item.brand}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span style={{ color: '#666666' }}>
                          Qty: <span className="font-bold" style={{ color: '#3B2F2F' }}>{item.quantity}</span>
                        </span>
                        <span style={{ color: '#666666' }}>
                          Price: <span className="font-bold" style={{ color: '#3B2F2F' }}>₹{item.price?.toFixed(2)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-4 border-l" style={{ borderColor: '#E5E0E0' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#888888' }}>Total</p>
                      <p className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#FAFAF9' }}>
                  <p className="text-lg font-semibold mb-2" style={{ color: '#3B2F2F' }}>📦</p>
                  <p style={{ color: '#888888' }}>No items in this order</p>
                </div>
              )}
            </div>
          </div>

          {/* Total Amount */}
          <div className="pt-8 border-t-2" style={{ borderColor: '#E5E0E0' }}>
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                Grand Total:
              </span>
              <div className="text-right">
                <span className="text-4xl font-bold" style={{ color: '#3B2F2F' }}>
                  ₹{totalPrice?.toFixed(2) || '0.00'}
                </span>
                <p className="text-xs mt-2" style={{ color: '#888888' }}>Tax included if applicable</p>
              </div>
            </div>
          </div>
        </div>

        {/* What Happens Next Timeline */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h3 className="text-xl font-bold mb-6" style={{ color: '#3B2F2F' }}>
            What Happens Next?
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F0F0' }}>
                  <FaClock size={16} style={{ color: '#3B2F2F' }} />
                </div>
              </div>
              <div>
                <p className="font-bold" style={{ color: '#3B2F2F' }}>Confirmation Email</p>
                <p className="text-sm" style={{ color: '#666666' }}>You'll receive order details immediately at your email</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F0F0' }}>
                  <FaBox size={16} style={{ color: '#3B2F2F' }} />
                </div>
              </div>
              <div>
                <p className="font-bold" style={{ color: '#3B2F2F' }}>Order Processing</p>
                <p className="text-sm" style={{ color: '#666666' }}>Your items are being prepared for shipment</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F0F0' }}>
                  <FaTruck size={16} style={{ color: '#3B2F2F' }} />
                </div>
              </div>
              <div>
                <p className="font-bold" style={{ color: '#3B2F2F' }}>Shipment & Tracking</p>
                <p className="text-sm" style={{ color: '#666666' }}>We'll send tracking details within 2-3 business days</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F3F0F0' }}>
                  <FaCheckCircle size={16} style={{ color: '#065F46' }} />
                </div>
              </div>
              <div>
                <p className="font-bold" style={{ color: '#3B2F2F' }}>Delivery</p>
                <p className="text-sm" style={{ color: '#666666' }}>Expected delivery within 5-7 business days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="py-4 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#3B2F2F', color: 'white' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            <FaShoppingBag size={18} />
            Track My Order
          </button>
          <button
            onClick={() => navigate('/products')}
            className="py-4 px-6 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border-2"
            style={{ borderColor: '#3B2F2F', color: '#3B2F2F', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F0F0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            🛍️ Continue Shopping
          </button>
        </div>

        {/* Back to Home */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: '#FAFAF9', color: '#3B2F2F' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F0F0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#FAFAF9'}
          >
            <FaHome size={16} />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;