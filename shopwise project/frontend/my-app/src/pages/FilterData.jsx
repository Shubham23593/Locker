import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard';

const FilterData = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products } = useSelector((state) => state.product);
  const searchParams = new URLSearchParams(location. search);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');

  // Filter products based on query params
  const filteredProducts = products.filter((product) => {
    if (category && product.category !== category) return false;
    if (brand && product.brand !== brand) return false;
    return true;
  });

  return (
    <div className="container mx-auto py-12 px-4 md:px-16 lg:px-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {category && `${category} Products`}
          {brand && `${brand} Products`}
          {!category && !brand && 'Filtered Products'}
        </h2>
        <button
          onClick={() => navigate('/shop')}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          View All Products →
        </button>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">No products found</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-[#3B2F2F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Browse All Products
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterData;