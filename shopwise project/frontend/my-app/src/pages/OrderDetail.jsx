import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaTruck, FaCheckCircle } from "react-icons/fa";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      console.log('📦 Fetching order:', id);
      const response = await orderAPI.getOrderById(id);
      
      const orderData = response.data?.data || response.data;
      
      console.log('✅ Order fetched:', orderData);
      setOrder(orderData);
    } catch (error) {
      console.error("❌ Failed to fetch order:", error);
      toast.error(error.response?.data?.message || "Order not found");
      navigate("/profile");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered': return '✓';
      case 'shipped': return '🚚';
      case 'processing': return '📦';
      default: return '⏳';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', text: '#92400E', border: '#FBBF24' },
      processing: { bg: '#DBEAFE', text: '#0C4A6E', border: '#3B82F6' },
      shipped: { bg: '#E9D5FF', text: '#5B21B6', border: '#A855F7' },
      delivered: { bg: '#D1FAE5', text: '#065F46', border: '#10B981' },
      cancelled: { bg: '#FEE2E2', text: '#7F1D1D', border: '#EF4444' },
    };
    return colors[status] || { bg: '#F3F0F0', text: '#1F2937', border: '#D1D5DB' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300" style={{ borderTopColor: '#3B2F2F' }}></div>
          <p className="mt-4 font-medium" style={{ color: '#3B2F2F' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <p className="text-2xl mb-4 font-semibold" style={{ color: '#3B2F2F' }}>Order not found</p>
          <button
            onClick={() => navigate("/profile")}
            className="px-8 py-3 rounded-lg text-white font-medium transition-all"
            style={{ backgroundColor: '#3B2F2F' }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const statusColor = getStatusColor(order.status);

  return (
    <div style={{ backgroundColor: '#F5F5F5' }} className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/profile")}
          className="mb-8 flex items-center gap-2 font-medium transition-all hover:opacity-80"
          style={{ color: '#3B2F2F' }}
        >
          <FaArrowLeft size={18} /> Back to Orders
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#3B2F2F' }}>Order Details</h1>
              <p className="mb-1" style={{ color: '#666666' }}>
                Order ID: <span className="font-mono font-bold">#{order._id.slice(-8).toUpperCase()}</span>
              </p>
              <p className="text-sm" style={{ color: '#888888' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="px-6 py-3 rounded-lg font-bold text-lg flex items-center gap-2" 
              style={{ backgroundColor: statusColor.bg, color: statusColor.text, border: `2px solid ${statusColor.border}` }}>
              <span>{getStatusIcon(order.status)}</span>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order Items - Main Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#3B2F2F' }}>📦 Order Items</h2>
              
              <div className="space-y-4">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-all" style={{ borderColor: '#E5E0E0' }}>
                      <div className="flex gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1" style={{ color: '#3B2F2F' }}>{item.name}</h3>
                          {item.brand && (
                            <p className="text-sm mb-2" style={{ color: '#888888' }}>Brand: {item.brand}</p>
                          )}
                          <div className="flex gap-4 text-sm flex-wrap">
                            <div>
                              <span style={{ color: '#888888' }}>Quantity:</span>
                              <span className="font-bold ml-2">{item.quantity}</span>
                            </div>
                            <div>
                              <span style={{ color: '#888888' }}>Unit Price:</span>
                              <span className="font-bold ml-2">₹{item.price?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs" style={{ color: '#888888' }}>Subtotal</p>
                          <p className="text-xl font-bold" style={{ color: '#3B2F2F' }}>
                            ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8" style={{ color: '#888888' }}>No items in this order</p>
                )}
              </div>

              {/* Order Total */}
              <div className="mt-8 pt-8 border-t-2" style={{ borderColor: '#E5E0E0' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold" style={{ color: '#3B2F2F' }}>Order Total:</span>
                  <span className="text-3xl font-bold" style={{ color: '#3B2F2F' }}>
                    ₹{order.totalAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Order Info */}
          <div className="space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-4" style={{ color: '#3B2F2F' }}>📍 Shipping Address</h2>
              {order.shippingAddress ? (
                <div className="space-y-2 text-sm">
                  <p className="font-bold" style={{ color: '#3B2F2F' }}>{order.shippingAddress.address}</p>
                  <p style={{ color: '#666666' }}>{order.shippingAddress.city}</p>
                  <p className="font-mono font-bold" style={{ color: '#3B2F2F' }}>{order.shippingAddress.zip}</p>
                </div>
              ) : (
                <p style={{ color: '#888888' }}>No shipping address available</p>
              )}
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold mb-6" style={{ color: '#3B2F2F' }}>Order Timeline</h2>
              <div className="space-y-4">
                
                {/* Pending */}
                <div className={`flex gap-3 ${order.status === 'pending' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1.5 flex-shrink-0`} 
                    style={{ backgroundColor: order.status === 'pending' ? '#FCD34D' : '#D1D5DB' }}></div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#3B2F2F' }}>Order Placed</p>
                    <p className="text-xs" style={{ color: '#888888' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Processing */}
                <div className={`flex gap-3 ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1.5 flex-shrink-0`} 
                    style={{ backgroundColor: ['processing', 'shipped', 'delivered'].includes(order.status) ? '#3B82F6' : '#D1D5DB' }}></div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#3B2F2F' }}>Processing</p>
                    <p className="text-xs" style={{ color: '#888888' }}>Order is being prepared</p>
                  </div>
                </div>

                {/* Shipped */}
                <div className={`flex gap-3 ${['shipped', 'delivered'].includes(order.status) ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1.5 flex-shrink-0`} 
                    style={{ backgroundColor: ['shipped', 'delivered'].includes(order.status) ? '#A855F7' : '#D1D5DB' }}></div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#3B2F2F' }}>Shipped</p>
                    <p className="text-xs" style={{ color: '#888888' }}>Order is on the way</p>
                  </div>
                </div>

                {/* Delivered */}
                <div className={`flex gap-3 ${order.status === 'delivered' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`w-4 h-4 rounded-full mt-1.5 flex-shrink-0`} 
                    style={{ backgroundColor: order.status === 'delivered' ? '#10B981' : '#D1D5DB' }}></div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#3B2F2F' }}>Delivered</p>
                    <p className="text-xs" style={{ color: '#888888' }}>Order delivered successfully</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6 space-y-3">
              <button
                onClick={() => navigate("/products")}
                className="w-full py-3 px-4 rounded-lg text-white font-bold transition-all"
                style={{ backgroundColor: '#3B2F2F' }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="w-full py-3 px-4 rounded-lg font-bold transition-all"
                style={{ backgroundColor: '#F3F0F0', color: '#3B2F2F' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#E5E0E0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F3F0F0'}
              >
                View All Orders
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderDetail;