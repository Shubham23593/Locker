import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import {
  FaUsers,
  FaShoppingCart,
  FaBox,
  FaMoneyBillWave,
  FaClock,
  FaTruck,
  FaCheckCircle,
  FaChartLine,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, isAdmin } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [isAdmin, navigate]);

  const fetchStats = async () => {
    try {
      const response = await adminAPIService.getStats();
      console.log('📊 Dashboard stats:', response.data);
      setStats(response.data.data);
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#f8f7f6' }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto"
            style={{ borderColor: '#3B2F2F' }}
          ></div>
          <p className="mt-4 font-medium" style={{ color: '#3B2F2F' }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Chart colors - brown theme
  const chartColors = {
    primary: '#3B2F2F',
    success: '#16A34A',
    warning: '#F59E0B',
    info: '#3B82F6',
    danger: '#EF4444',
  };

  // Chart data for monthly revenue
  const monthlyRevenueData = {
    labels: stats?.monthlyRevenue?.map((m) => `Month ${m._id}`) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: stats?.monthlyRevenue?.map((m) => m.revenue) || [],
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 47, 47, 0.08)',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: chartColors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  // Order status distribution
  const orderStatusData = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [
      {
        data: [
          stats?.orders?.pending || 0,
          stats?.orders?.processing || 0,
          stats?.orders?.shipped || 0,
          stats?.orders?.delivered || 0,
          stats?.orders?.cancelled || 0,
        ],
        backgroundColor: [
          '#FCD34D',
          '#60A5FA',
          '#A78BFA',
          '#34D399',
          '#F87171',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#3B2F2F',
          font: { size: 12, weight: '500' },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#3B2F2F',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(59, 47, 47, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        ticks: { color: '#3B2F2F' },
        grid: { color: 'rgba(59, 47, 47, 0.05)' },
      },
      x: {
        ticks: { color: '#3B2F2F' },
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ backgroundColor: '#f8f7f6', minHeight: '100vh', paddingBottom: '48px' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold" style={{ color: '#3B2F2F' }}>
            Dashboard Overview
          </h1>
          <p className="mt-2 text-base" style={{ color: '#666' }}>
            Welcome back, {admin?.name}! 👋
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div
            className="rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff', borderLeft: '4px solid #16A34A' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#666' }}>
                  Total Revenue
                </p>
                <p className="text-3xl font-bold mt-3" style={{ color: '#3B2F2F' }}>
                  ₹{stats?.overview?.totalRevenue?.toLocaleString('en-IN') || 0}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#16A34A' }}>
                  <FaArrowUp className="text-xs" />
                  <span>12% from last month</span>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#F0FDF4' }}
              >
                <FaMoneyBillWave className="text-2xl" style={{ color: '#16A34A' }} />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div
            className="rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff', borderLeft: '4px solid #3B82F6' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#666' }}>
                  Total Orders
                </p>
                <p className="text-3xl font-bold mt-3" style={{ color: '#3B2F2F' }}>
                  {stats?.overview?.totalOrders || 0}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#3B82F6' }}>
                  <FaArrowUp className="text-xs" />
                  <span>8% from last month</span>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#EFF6FF' }}
              >
                <FaShoppingCart className="text-2xl" style={{ color: '#3B82F6' }} />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div
            className="rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff', borderLeft: '4px solid #A855F7' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#666' }}>
                  Total Products
                </p>
                <p className="text-3xl font-bold mt-3" style={{ color: '#3B2F2F' }}>
                  {stats?.overview?.totalProducts || 0}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#A855F7' }}>
                  <FaArrowUp className="text-xs" />
                  <span>5% from last month</span>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FAF5FF' }}
              >
                <FaBox className="text-2xl" style={{ color: '#A855F7' }} />
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div
            className="rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff', borderLeft: '4px solid #EC4899' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: '#666' }}>
                  Total Users
                </p>
                <p className="text-3xl font-bold mt-3" style={{ color: '#3B2F2F' }}>
                  {stats?.overview?.totalUsers || 0}
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: '#EC4899' }}>
                  <FaArrowDown className="text-xs" />
                  <span>3% from last month</span>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FDF2F8' }}
              >
                <FaUsers className="text-2xl" style={{ color: '#EC4899' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div
            className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <FaClock className="text-lg" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>
                  Pending
                </p>
                <p className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
                  {stats?.orders?.pending || 0}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#DBEAFE' }}
              >
                <FaBox className="text-lg" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>
                  Processing
                </p>
                <p className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
                  {stats?.orders?.processing || 0}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#EDE9FE' }}
              >
                <FaTruck className="text-lg" style={{ color: '#A855F7' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>
                  Shipped
                </p>
                <p className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
                  {stats?.orders?.shipped || 0}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#DCFCE7' }}
              >
                <FaCheckCircle className="text-lg" style={{ color: '#16A34A' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>
                  Delivered
                </p>
                <p className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
                  {stats?.orders?.delivered || 0}
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: '#FEE2E2' }}
              >
                <FaExclamationTriangle className="text-lg" style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: '#666' }}>
                  Cancelled
                </p>
                <p className="text-2xl font-bold" style={{ color: '#3B2F2F' }}>
                  {stats?.orders?.cancelled || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <div
            className="lg:col-span-2 rounded-xl shadow-sm p-6"
            style={{ backgroundColor: '#fff' }}
          >
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: '#3B2F2F' }}>
              <FaChartLine />
              Monthly Revenue Trend
            </h3>
            <Line data={monthlyRevenueData} options={chartOptions} />
          </div>

          {/* Order Status Distribution */}
          <div
            className="rounded-xl shadow-sm p-6"
            style={{ backgroundColor: '#fff' }}
          >
            <h3 className="text-lg font-bold mb-6" style={{ color: '#3B2F2F' }}>
              Order Status Distribution
            </h3>
            <Doughnut data={orderStatusData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div
            className="rounded-xl shadow-sm p-6"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                Recent Orders
              </h3>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm font-medium transition-all duration-200 hover:gap-2"
                style={{ color: '#3B2F2F' }}
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm"
                  onClick={() => navigate(`/admin/orders/${order._id}`)}
                  style={{ backgroundColor: '#f8f7f6' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: '#3B2F2F' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm" style={{ color: '#666' }}>
                      {order.userId?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: '#3B2F2F' }}>
                      ₹{order.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className="text-xs px-2 py-1 rounded-full inline-block"
                      style={{
                        backgroundColor:
                          order.status === 'delivered'
                            ? '#DCFCE7'
                            : order.status === 'shipped'
                            ? '#DBEAFE'
                            : '#FEF3C7',
                        color:
                          order.status === 'delivered'
                            ? '#16A34A'
                            : order.status === 'shipped'
                            ? '#3B82F6'
                            : '#F59E0B',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Products */}
          <div
            className="rounded-xl shadow-sm p-6"
            style={{ backgroundColor: '#fff' }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                Low Stock Alert
              </h3>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-sm font-medium transition-all duration-200 hover:gap-2"
                style={{ color: '#3B2F2F' }}
              >
                Manage Stock →
              </button>
            </div>
            <div className="space-y-3">
              {stats?.lowStockProducts?.length > 0 ? (
                stats.lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex justify-between items-center p-4 rounded-lg transition-all duration-200"
                    style={{ backgroundColor: '#FEF2F2' }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: '#3B2F2F' }}>
                        {product.name}
                      </p>
                      <p className="text-sm" style={{ color: '#666' }}>
                        {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: '#EF4444' }}>
                        Stock: {product.stock || 0}
                      </p>
                      <button
                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        className="text-xs font-medium transition-all duration-200"
                        style={{ color: '#3B2F2F' }}
                      >
                        Update Stock
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8" style={{ color: '#999' }}>
                  No low stock products
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;