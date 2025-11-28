import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEnvelope, FaCalendar, FaShoppingBag, FaMoneyBillWave } from 'react-icons/fa';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUserDetails();
  }, [id, isAdmin, navigate]);

  const fetchUserDetails = async () => {
    try {
      const response = await adminAPIService.getUserDetails(id);
      console.log('👤 User details:', response.data);
      setUserData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('User not found');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#f8f7f6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto"
          style={{ borderColor: '#3B2F2F' }}
        ></div>
      </div>
    );
  }

  if (!userData) return null;

  const { user, orders, stats } = userData;

  return (
    <div style={{ backgroundColor: '#f8f7f6', minHeight: '100vh', paddingBottom: '48px' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 font-medium transition-all duration-200"
            style={{ color: '#3B2F2F' }}
          >
            <FaArrowLeft />
            Back to Users
          </button>
        </div>

        {/* User Info Card */}
        <div className="rounded-xl shadow-sm p-8 mb-8" style={{ backgroundColor: '#fff' }}>
          <div className="flex items-center gap-6 mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f8f7f6' }}
            >
              <span className="text-3xl font-bold" style={{ color: '#3B2F2F' }}>
                {user.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#3B2F2F' }}>
                {user.name}
              </h1>
              <p className="text-lg flex items-center gap-2 mb-1" style={{ color: '#666' }}>
                <FaEnvelope style={{ color: '#3B2F2F' }} />
                {user.email}
              </p>
              <p className="text-sm flex items-center gap-2" style={{ color: '#999' }}>
                <FaCalendar style={{ color: '#3B2F2F' }} />
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
              <div className="flex items-center gap-3 mb-3">
                <FaShoppingBag className="text-2xl" style={{ color: '#1976D2' }} />
                <p style={{ color: '#666' }}>Total Orders</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#1976D2' }}>
                {stats.totalOrders}
              </p>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: '#E8F5E8' }}>
              <div className="flex items-center gap-3 mb-3">
                <FaMoneyBillWave className="text-2xl" style={{ color: '#2E7D32' }} />
                <p style={{ color: '#666' }}>Total Spent</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#2E7D32' }}>
                ₹{stats.totalSpent?.toLocaleString('en-IN') || 0}
              </p>
            </div>

            <div className="p-6 rounded-lg" style={{ backgroundColor: '#F3E5F5' }}>
              <div className="flex items-center gap-3 mb-3">
                <FaShoppingBag className="text-2xl" style={{ color: '#7B1FA2' }} />
                <p style={{ color: '#666' }}>Completed Orders</p>
              </div>
              <p className="text-3xl font-bold" style={{ color: '#7B1FA2' }}>
                {stats.completedOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Orders History */}
        <div className="rounded-xl shadow-sm p-8" style={{ backgroundColor: '#fff' }}>
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#3B2F2F' }}>
            Order History
          </h2>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: '#999', fontSize: '18px' }}>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const getStatusColor = (status) => {
                  const colors = {
                    delivered: { bg: '#DCFCE7', text: '#16A34A' },
                    shipped: { bg: '#DBEAFE', text: '#3B82F6' },
                    processing: { bg: '#FEF3C7', text: '#F59E0B' },
                    pending: { bg: '#E5E7EB', text: '#374151' },
                    cancelled: { bg: '#FEE2E2', text: '#EF4444' },
                  };
                  return colors[status] || colors.pending;
                };

                return (
                  <div
                    key={order._id}
                    className="p-6 rounded-lg hover:shadow-sm transition-all duration-200 cursor-pointer border"
                    style={{
                      borderColor: '#f0eeec',
                      backgroundColor: '#fff',
                    }}
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg mb-1" style={{ color: '#3B2F2F' }}>
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm mb-1" style={{ color: '#666' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm" style={{ color: '#999' }}>
                          {order.items.length} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl mb-2" style={{ color: '#3B2F2F' }}>
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: getStatusColor(order.status).bg,
                            color: getStatusColor(order.status).text,
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetail;
