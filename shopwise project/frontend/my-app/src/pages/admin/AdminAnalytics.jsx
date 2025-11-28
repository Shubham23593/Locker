import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import { Line, Bar } from 'react-chartjs-2';
import { FaChartLine, FaDownload } from 'react-icons/fa';

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = useAdmin();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isAdmin || !hasPermission('analytics')) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [isAdmin, navigate, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getAnalytics(dateRange);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f7f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto"
          style={{ borderColor: '#3B2F2F' }}
        ></div>
        <p className="mt-4 font-medium" style={{ color: '#666', textAlign: 'center' }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  const salesTrendData = {
    labels: analytics?.salesData?.map(d => `${d._id.month}/${d._id.year}`) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: analytics?.salesData?.map(d => d.revenue) || [],
        borderColor: '#3B2F2F',
        backgroundColor: 'rgba(59, 47, 47, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: analytics?.salesData?.map(d => d.orders) || [],
        borderColor: '#16A34A',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: { type: 'linear', display: true, position: 'left' },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
      },
    },
    plugins: {
      legend: { labels: { color: '#3B2F2F' } },
    },
  };

  const topProductsData = {
    labels: analytics?.topProducts?.map(p => p._id).slice(0, 10) || [],
    datasets: [
      {
        label: 'Units Sold',
        data: analytics?.topProducts?.map(p => p.totalSold).slice(0, 10) || [],
        backgroundColor: '#3B2F2F',
      },
    ],
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f7f6', padding: '32px 16px' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: '#3B2F2F' }}>
              <FaChartLine />
              Sales Analytics & Reports
            </h1>
            <p className="mt-2" style={{ color: '#666' }}>
              Comprehensive insights into your business performance
            </p>
          </div>
          <button
            onClick={() => toast.info('Export feature coming soon')}
            className="flex items-center gap-2 px-5 py-2 font-semibold rounded-lg transition-all duration-300"
            style={{ backgroundColor: '#3B2F2F', color: '#fff' }}
          >
            <FaDownload />
            Export Report
          </button>
        </div>

        {/* Date Range Filter */}
        <div className="rounded-xl shadow-sm p-6 mb-8" style={{ backgroundColor: '#fff' }}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold" style={{ color: '#3B2F2F' }}>
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full rounded-lg px-4 py-2 focus:outline-none"
                style={{ backgroundColor: '#f8f7f6', border: 'none', color: '#3B2F2F' }}
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold" style={{ color: '#3B2F2F' }}>
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full rounded-lg px-4 py-2 focus:outline-none"
                style={{ backgroundColor: '#f8f7f6', border: 'none', color: '#3B2F2F' }}
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-8">
          {/* Sales Trend and Top Products side by side */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sales Trend */}
            <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: '#fff' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#3B2F2F' }}>
                Sales Trend
              </h2>
              <Line data={salesTrendData} options={salesOptions} />
            </div>

            {/* Top Products */}
            <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: '#fff' }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#3B2F2F' }}>
                Top 10 Products
              </h2>
              <Bar data={topProductsData} />
            </div>
          </div>

          {/* Best Selling Products Table */}
          <div className="rounded-xl shadow-sm p-6" style={{ backgroundColor: '#fff' }}>
            <h2 className="text-3xl font-bold mb-6" style={{ color: '#3B2F2F' }}>
              Best Selling Products
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#f8f7f6' }}>
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3B2F2F' }}>
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3B2F2F' }}>
                      Product
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3B2F2F' }}>
                      Units Sold
                    </th>
                    <th className="text-left py-3 px-4 font-semibold" style={{ color: '#3B2F2F' }}>
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.topProducts?.map((product, index) => (
                    <tr
                      key={index}
                      className="hover:shadow-sm transition-all duration-200"
                      style={{ borderBottom: '1px solid #f0eeec', backgroundColor: '#fff' }}
                    >
                      <td className="py-3 px-4 font-bold" style={{ color: '#3B2F2F' }}>
                        {index + 1}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#3B2F2F' }}>
                        {product._id}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#3B2F2F' }}>
                        {product.totalSold}
                      </td>
                      <td className="py-3 px-4 font-bold text-green-600">
                        ₹{product.revenue?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
