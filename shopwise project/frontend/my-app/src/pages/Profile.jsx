import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderAPI } from "../services/api";
import { toast } from "react-toastify";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchOrders();
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getOrders();
      
      console.log('📦 Orders response:', response.data);
      
      // ✅ FIX: Extract orders array from response
      const ordersData = response.data?.data || response.data || [];
      
      // Ensure it's an array
      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      } else {
        console.warn('Orders data is not an array:', ordersData);
        setOrders([]);
        toast.warning('No orders found');
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
      setOrders([]); // ✅ Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#3B2F2F' }} className="shadow-lg">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">My Account</h1>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-300"
              style={{ backgroundColor: '#D97706', hover: { backgroundColor: '#B45309' } }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#B45309'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#D97706'}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg"
                  style={{ backgroundColor: '#3B2F2F' }}
                >
                  {initials}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-6 border-b pb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F3F0F0' }}>
                  <p className="text-xs text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: '#F3F0F0' }}>
                  <p className="text-xs text-gray-600 mb-1">Account Status</p>
                  <p className="text-sm font-semibold text-green-700">Active</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'orders'
                      ? 'text-white'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={activeTab === 'orders' ? { backgroundColor: '#3B2F2F' } : {}}
                >
                  My Orders
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="w-full py-2 px-3 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ backgroundColor: '#3B2F2F' }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Order History</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
                </p>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-300" style={{ borderTopColor: '#3B2F2F' }}></div>
                  <p className="text-gray-600 mt-3">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-gray-600 mb-4 text-lg">No orders yet</p>
                  <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 rounded-lg text-white font-medium transition-all"
                    style={{ backgroundColor: '#3B2F2F' }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/orders/${order._id}`)}
                      className="border rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer group"
                      style={{ borderColor: '#E5E0E0' }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg mb-1">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span
                          className="px-4 py-2 rounded-full text-sm font-semibold"
                          style={{
                            backgroundColor:
                              order.status === 'delivered'
                                ? '#D1FAE5'
                                : order.status === 'shipped'
                                ? '#DBEAFE'
                                : order.status === 'processing'
                                ? '#FEF3C7'
                                : order.status === 'cancelled'
                                ? '#FEE2E2'
                                : '#F3F0F0',
                            color:
                              order.status === 'delivered'
                                ? '#065F46'
                                : order.status === 'shipped'
                                ? '#0C4A6E'
                                : order.status === 'processing'
                                ? '#92400E'
                                : order.status === 'cancelled'
                                ? '#7F1D1D'
                                : '#1F2937'
                          }}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>

                      {/* Items Preview */}
                      <div className="mb-4 pb-4 border-b" style={{ borderColor: '#E5E0E0' }}>
                        <p className="text-xs text-gray-600 mb-2 font-medium">Items ({order.items.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#F3F0F0', color: '#3B2F2F' }}>
                              {item.name}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-xs text-gray-600 px-3 py-1">
                              +{order.items.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount & Address */}
                      <div className="flex justify-between items-end gap-4">
                        <div>
                          {order.shippingAddress && (
                            <p className="text-xs text-gray-600 mb-1">
                              📍 {order.shippingAddress.city}, {order.shippingAddress.zip}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">Click to view details</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
                            ₹{order.totalAmount?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;