import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaDownload,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    order: 'desc',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    if (!isAdmin || !hasPermission('orders')) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [isAdmin, navigate, filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getAllOrders(filters);
      console.log('📦 Orders fetched:', response.data);
      setOrders(response.data.data || []);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPIService.updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'],
      ...orders.map((order) => [
        order._id,
        order.userId?.name || 'N/A',
        order.items.length,
        order.totalAmount,
        order.status,
        new Date(order.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Orders exported successfully');
  };

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
    <div style={{ backgroundColor: '#f8f7f6', minHeight: '100vh', paddingBottom: '48px' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#3B2F2F' }}>
              Order Management
            </h1>
            <p className="mt-2 text-base" style={{ color: '#666' }}>
              Manage and track all customer orders
            </p>
          </div>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#3B2F2F', color: '#fff' }}
          >
            <FaDownload className="text-sm" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-xl shadow-sm p-6 mb-6" style={{ backgroundColor: '#fff' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: '#f8f7f6',
                color: '#3B2F2F',
                border: 'none',
                fontWeight: '500',
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: '#f8f7f6',
                color: '#3B2F2F',
                border: 'none',
                fontWeight: '500',
              }}
            >
              <option value="createdAt">Date</option>
              <option value="totalAmount">Amount</option>
              <option value="status">Status</option>
            </select>

            {/* Sort Order */}
            <select
              value={filters.order}
              onChange={(e) => setFilters({ ...filters, order: e.target.value })}
              className="px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: '#f8f7f6',
                color: '#3B2F2F',
                border: 'none',
                fontWeight: '500',
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>

            {/* Search */}
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#999' }}
              />
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-300 focus:outline-none"
                style={{
                  backgroundColor: '#f8f7f6',
                  color: '#3B2F2F',
                  border: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: '#fff' }}>
          {loading ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto"
                style={{ borderColor: '#3B2F2F' }}
              ></div>
              <p className="mt-4" style={{ color: '#666' }}>
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: '#999', fontSize: '18px' }}>No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#f8f7f6' }}>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Order ID
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Customer
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Items
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Total
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Date
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:shadow-sm transition-all duration-200"
                        style={{
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #f0eeec',
                        }}
                      >
                        <td className="py-4 px-6 font-mono text-sm" style={{ color: '#3B2F2F' }}>
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-semibold" style={{ color: '#3B2F2F' }}>
                              {order.userId?.name || 'N/A'}
                            </p>
                            <p className="text-sm" style={{ color: '#999' }}>
                              {order.userId?.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6" style={{ color: '#3B2F2F' }}>
                          {order.items.length}
                        </td>
                        <td className="py-4 px-6 font-bold" style={{ color: '#3B2F2F' }}>
                          ₹{order.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none transition-all duration-300"
                            style={{
                              backgroundColor: getStatusColor(order.status).bg,
                              color: getStatusColor(order.status).text,
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-sm" style={{ color: '#666' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => navigate(`/admin/orders/${order._id}`)}
                            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                            style={{ backgroundColor: '#f8f7f6', color: '#3B2F2F' }}
                            title="View Details"
                          >
                            <FaEye className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className="flex justify-between items-center p-6"
                style={{ borderTop: '1px solid #f0eeec' }}
              >
                <p style={{ color: '#666' }}>
                  Showing {orders.length} of {pagination.total} orders
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#f8f7f6', color: '#3B2F2F' }}
                  >
                    <FaChevronLeft />
                  </button>
                  <span style={{ color: '#666', padding: '0 8px' }}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#f8f7f6', color: '#3B2F2F' }}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;