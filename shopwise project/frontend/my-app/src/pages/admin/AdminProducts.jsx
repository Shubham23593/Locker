import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
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
  const [deleteModal, setDeleteModal] = useState({ show: false, productId: null });

  useEffect(() => {
    if (!isAdmin || !hasPermission('products')) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [isAdmin, navigate, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPIService.getAllProducts(filters);
      console.log('📦 Products fetched:', response.data);
      setProducts(response.data.data || []);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total,
      });
    } catch (error) {
      console.error('❌ Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await adminAPIService.deleteProduct(productId);
      toast.success('Product deleted successfully');
      setDeleteModal({ show: false, productId: null });
      fetchProducts();
    } catch (error) {
      console.error('❌ Failed to delete product:', error);
      toast.error('Failed to delete product');
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
              Product Management
            </h1>
            <p className="mt-2 text-base" style={{ color: '#666' }}>
              Manage your product inventory
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/products/create')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#3B2F2F', color: '#fff' }}
          >
            <FaPlus className="text-sm" />
            Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-xl shadow-sm p-6 mb-6" style={{ backgroundColor: '#fff' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none"
              style={{
                backgroundColor: '#f8f7f6',
                color: '#3B2F2F',
                border: 'none',
                fontWeight: '500',
              }}
            >
              <option value="all">All Brands</option>
              <option value="Samsung">Samsung</option>
              <option value="Apple">Apple</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Vivo">Vivo</option>
              <option value="Oppo">Oppo</option>
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
              <option value="createdAt">Date Added</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
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
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            {/* Search */}
            <div className="relative">
              <FaSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#999' }}
              />
              <input
                type="text"
                placeholder="Search products..."
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

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-4 mx-auto"
              style={{ borderColor: '#3B2F2F' }}
            ></div>
            <p className="mt-4" style={{ color: '#666' }}>
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl shadow-sm p-12 text-center" style={{ backgroundColor: '#fff' }}>
            <p style={{ color: '#999', fontSize: '18px', marginBottom: '24px' }}>
              No products found
            </p>
            <button
              onClick={() => navigate('/admin/products/create')}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#3B2F2F', color: '#fff' }}
            >
              Add Your First Product
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: '#fff' }}
                >
                  <div
                    className="w-full h-48 flex items-center justify-center"
                    style={{ backgroundColor: '#f8f7f6' }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-2 truncate" style={{ color: '#3B2F2F' }}>
                      {product.name}
                    </h3>
                    <p className="text-sm mb-1" style={{ color: '#666' }}>
                      {product.category}
                    </p>
                    <p className="text-sm mb-4" style={{ color: '#666' }}>
                      Brand: {product.brand}
                    </p>
                    <div className="flex justify-between items-center mb-5">
                      <p className="text-lg font-bold" style={{ color: '#3B2F2F' }}>
                        ₹{product.price?.toLocaleString('en-IN')}
                      </p>
                      <span
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                        style={{
                          backgroundColor:
                            (product.stock || 0) < 10 ? '#FEE2E2' : '#DCFCE7',
                          color: (product.stock || 0) < 10 ? '#EF4444' : '#16A34A',
                        }}
                      >
                        {product.stock || 0}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        className="flex-1 px-3 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        style={{ backgroundColor: '#3B2F2F', color: '#fff' }}
                      >
                        <FaEdit className="text-sm" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteModal({ show: true, productId: product._id })}
                        className="flex-1 px-3 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        style={{ backgroundColor: '#fff', color: '#000000' }}
                      >
                        <FaTrash className="text-sm" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div
              className="flex justify-between items-center p-6 rounded-xl shadow-sm"
              style={{ backgroundColor: '#fff' }}
            >
              <p style={{ color: '#666' }}>
                Showing {products.length} of {pagination.total} products
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
                <span style={{ color: '#666', padding: '0 12px' }}>
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

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-xl p-8 max-w-md w-full mx-4" style={{ backgroundColor: '#fff' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#3B2F2F' }}>
                Confirm Delete
              </h3>
              <p className="mb-6" style={{ color: '#666' }}>
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteModal({ show: false, productId: null })}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#E5E7EB', color: '#3B2F2F' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteModal.productId)}
                  className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 text-white hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;