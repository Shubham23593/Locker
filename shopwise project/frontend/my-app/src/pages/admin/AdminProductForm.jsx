import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { adminAPIService } from '../../services/adminAPI';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave, FaImage } from 'react-icons/fa';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, hasPermission } = useAdmin();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    image: '',
    stock: '',
  });

  const BRAND_CATEGORIES = ['Samsung', 'Apple', 'Xiaomi', 'OnePlus', 'Vivo', 'Oppo'];

  useEffect(() => {
    if (!isAdmin || !hasPermission('products')) {
      navigate('/admin/login');
      return;
    }

    if (isEdit) {
      fetchProduct();
    }
  }, [id, isAdmin, navigate, hasPermission]);

  const fetchProduct = async () => {
    try {
      const response = await adminAPIService.getAllProducts({ search: id });
      const product = response.data.data.find((p) => p._id === id);
      if (product) {
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          category: product.category || '',
          brand: product.brand || '',
          image: product.image || '',
          stock: product.stock || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      navigate('/admin/products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'brand') {
      setFormData({
        ...formData,
        brand: value,
        category: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        category: formData.brand,
      };

      if (isEdit) {
        await adminAPIService.updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        await adminAPIService.createProduct(productData);
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f7f6', paddingTop: '32px', paddingBottom: '32px' }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 font-medium transition-all duration-200"
            style={{ color: '#3B2F2F' }}
          >
            <FaArrowLeft />
            Back to Products
          </button>
        </div>

        {/* Form */}
        <div
          className="rounded-xl shadow-sm p-8"
          style={{ backgroundColor: '#fff' }}
        >
          <h1
            className="text-3xl font-bold mb-6"
            style={{ color: '#3B2F2F' }}
          >
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#3B2F2F' }}>
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., iPhone 13, Samsung Galaxy S23"
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: '#f8f7f6',
                  border: 'none',
                  color: '#3B2F2F',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#3B2F2F' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="4"
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: '#f8f7f6',
                  border: 'none',
                  color: '#3B2F2F',
                }}
              />
            </div>

            {/* Price and Stock */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2" style={{ color: '#3B2F2F' }}>
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg focus:outline-none"
                  style={{
                    backgroundColor: '#f8f7f6',
                    border: 'none',
                    color: '#3B2F2F',
                  }}
                />
              </div>

              <div>
                <label className="block font-semibold mb-2" style={{ color: '#3B2F2F' }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-lg focus:outline-none"
                  style={{
                    backgroundColor: '#f8f7f6',
                    border: 'none',
                    color: '#3B2F2F',
                  }}
                />
              </div>
            </div>

            {/* Brand Category */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#3B2F2F' }}>
                Brand Category *
                <span className="text-sm ml-2" style={{ color: '#777' }}>
                  (This will determine where product appears in shop)
                </span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: '#f8f7f6',
                  border: 'none',
                  color: '#3B2F2F',
                  fontWeight: 500,
                }}
              >
                <option value="">Select Brand</option>
                {BRAND_CATEGORIES.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {formData.brand && (
                <p className="text-sm mt-2" style={{ color: '#16A34A' }}>
                  ✅ This product will appear in <strong>{formData.brand}</strong> category on shop page
                </p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: '#3B2F2F' }}>
                <FaImage className="inline mr-2" />
                Product Image URL
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 rounded-lg focus:outline-none"
                style={{
                  backgroundColor: '#f8f7f6',
                  border: 'none',
                  color: '#3B2F2F',
                }}
              />
              {formData.image && (
                <div className="mt-4">
                  <p className="text-sm mb-2" style={{ color: '#777' }}>
                    Image Preview:
                  </p>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-48 h-48 object-contain rounded-lg"
                    style={{ backgroundColor: '#f8f7f6' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200?text=Invalid+URL';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6" style={{ borderTop: '1px solid #f0eeec' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                style={{ backgroundColor: '#f8f7f6', color: '#3B2F2F' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  backgroundColor: loading ? '#9CA3AF' : '#3B2F2F',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.8 : 1,
                }}
              >
                <FaSave />
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
