import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import { FaSearch, FaEye, FaShoppingBag, FaUserCircle } from 'react-icons/fa';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
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
    if (!isAdmin || !hasPermission('users')) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate, hasPermission, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getAllUsers(filters);
      console.log('👥 Users fetched:', response.data);
      setUsers(response.data.data || []);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div style={{ backgroundColor: '#f8f7f6', minHeight: '100vh', paddingBottom: '48px' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#3B2F2F' }}>
              User Management
            </h1>
            <p className="mt-2 text-base" style={{ color: '#666' }}>
              View and manage registered users
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl shadow-sm p-6 mb-6" style={{ backgroundColor: '#fff' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sort By */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: '#f8f7f6',
                color: '#3B2F2F',
                border: 'none',
                fontWeight: 500,
              }}
            >
              <option value="createdAt">Registration Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
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
                fontWeight: 500,
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
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value, page: 1 })
                }
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

        {/* Users Table */}
        <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: '#fff' }}>
          {loading ? (
            <div className="text-center py-12">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto"
                style={{ borderColor: '#3B2F2F' }}
              ></div>
              <p className="mt-4" style={{ color: '#666' }}>
                Loading users...
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p style={{ color: '#999', fontSize: '18px' }}>No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#f8f7f6' }}>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        User
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Email
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Orders
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Total Spent
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Joined
                      </th>
                      <th className="text-left py-4 px-6 font-semibold" style={{ color: '#3B2F2F' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:shadow-sm transition-all duration-200"
                        style={{
                          backgroundColor: '#fff',
                          borderBottom: '1px solid #f0eeec',
                        }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: '#E0E7FF' }}
                            >
                              <FaUserCircle
                                className="text-2xl"
                                style={{ color: '#3B2F2F' }}
                              />
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: '#3B2F2F' }}>
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p style={{ color: '#666' }}>{user.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <FaShoppingBag style={{ color: '#3B2F2F' }} />
                            <span className="font-semibold" style={{ color: '#3B2F2F' }}>
                              {user.orderCount || 0}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold" style={{ color: '#16A34A' }}>
                            ₹{user.totalSpent?.toLocaleString('en-IN') || 0}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-sm" style={{ color: '#666' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="flex items-center gap-2 text-sm font-medium transition-all duration-200"
                            style={{ color: '#3B2F2F' }}
                          >
                            <FaEye />
                            View Details
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
                  Showing {users.length} of {pagination.total} users
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#f8f7f6', color: '#3B2F2F' }}
                  >
                    Previous
                  </button>
                  <span style={{ color: '#666', padding: '0 8px' }}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#f8f7f6', color: '#3B2F2F' }}
                  >
                    Next
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

export default AdminUsers;
