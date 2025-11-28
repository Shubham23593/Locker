import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { setProducts } from "../redux/productSlice";
import { productAPI } from "../services/api";
import { enhancedMockData } from "../assets/mockData";
 // ✅ Import mockData

import { 
  FaFilter, 
  FaTimes, 
  FaSlidersH,
  FaThLarge,
  FaThList,
  FaStar,
  FaSync
} from "react-icons/fa";
import { toast } from "react-toastify";

const Shop = () => {
  const dispatch = useDispatch();
  const { products, searchTerm } = useSelector((state) => state.product);
  const navigate = useNavigate();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ NEW: Fetch products function (merges mockData + MongoDB)
 // ✅ UPDATED: Fetch products function (merges mockData + MongoDB with proper IDs)
const fetchProducts = async () => {
  try {
    setLoading(true);
    
    const response = await productAPI.getAllProducts();
    let allProducts = [];
    
    if (response.data.success) {
      const dbProducts = response.data.data || [];
      
      // Filter out mockData products that are already in database (by name)
      const dbProductNames = new Set(dbProducts.map(p => p.name));
      const uniqueMockData = enhancedMockData.filter(mock => !dbProductNames.has(mock.name));
      
      // ✅ Add proper IDs to mockData products
      const mockDataWithIds = uniqueMockData.map((product, index) => ({
        ...product,
        _id: `mock-${product.id || index}`,
        id: product.id || index,
        isMockProduct: true
      }));
      
      // Combine: mockData + database products
      allProducts = [...mockDataWithIds, ...dbProducts];
      
      console.log(`✅ Loaded ${mockDataWithIds.length} mock + ${dbProducts.length} database = ${allProducts.length} total products`);
    } else {
      // If API fails, use mockData only
      const mockDataWithIds = enhancedMockData.map((product, index) => ({
        ...product,
        _id: `mock-${product.id || index}`,
        id: product.id || index,
        isMockProduct: true
      }));
      allProducts = mockDataWithIds;
      console.log('⚠️ Using mockData only (API failed)');
    }
    
    dispatch(setProducts(allProducts));
    
    if (allProducts.length === 0) {
      toast.info('No products found');
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    
    // Fallback to mockData if API fails
    const mockDataWithIds = enhancedMockData.map((product, index) => ({
      ...product,
      _id: `mock-${product.id || index}`,
      id: product.id || index,
      isMockProduct: true
    }));
    dispatch(setProducts(mockDataWithIds));
    toast.warning('Loaded demo products (offline mode)');
  } finally {
    setLoading(false);
  }
};

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
    toast.success('Products refreshed! ');
  };

  // Get unique brands from products
  const brands = [...new Set(products.map((p) => p.brand))]. filter(Boolean);

  // Get price range from products
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price || 0)) : 200000;
  const minPrice = products.length > 0 ?  Math.min(...products.map((p) => p.price || 0)) : 0;

  // Initialize price range
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products, minPrice, maxPrice]);

  // Filter Products
  const getFilteredProducts = () => {
    let filtered = [... products];

    // Search filter
    if (searchTerm) {
      filtered = filtered. filter((product) =>
        product.name?. toLowerCase().includes(searchTerm. toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((product) =>
        selectedBrands.includes(product.brand)
      );
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings);
      filtered = filtered.filter(product => (product.rating || 0) >= minRating);
    }

    // Stock filter
    if (showInStockOnly) {
      filtered = filtered.filter(product => (product.stock || 0) > 0);
    }

    return filtered;
  };

  // Sort Products
  const getSortedProducts = (filtered) => {
    let sorted = [...filtered];

    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        sorted. sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-az":
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case "name-za":
        sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a. createdAt || 0));
        break;
      case "popular":
        sorted.sort((a, b) => (b.numReviews || 0) - (a.numReviews || 0));
        break;
      case "rating":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    return sorted;
  };

  const filteredProducts = getFilteredProducts();
  const sortedProducts = getSortedProducts(filteredProducts);

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setShowInStockOnly(false);
    setSortBy("default");
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      priceRange[0] !== minPrice ||
      priceRange[1] !== maxPrice ||
      selectedBrands.length > 0 ||
      selectedRatings.length > 0 ||
      showInStockOnly ||
      sortBy !== "default"
    );
  };

  // Toggle brand selection
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev. filter((b) => b !== brand)
        : [...prev, brand]
    );
  };

  // Toggle rating selection
  const toggleRating = (rating) => {
    setSelectedRatings((prev) =>
      prev. includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };

  // Navigate to product detail page
  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto py-6 sm:py-8 px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#3B2F2F] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 sm:py-8 px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Shop Products
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>

          {/* Desktop View Toggle & Sort */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-[#3B2F2F] text-white px-3 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              title="Refresh Products"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-white border rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-[#3B2F2F] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="Grid View"
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-[#3B2F2F] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title="List View"
              >
                <FaThList />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none bg-white border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2F2F]"
            >
              <option value="default">Sort By: Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-az">Name: A to Z</option>
              <option value="name-za">Name: Z to A</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden bg-[#3B2F2F] text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <FaFilter /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filters Sidebar - Keep your existing code */}
          <div
            className={`${
              showMobileFilters ? "block" : "hidden"
            } md:block fixed md:relative inset-0 md:inset-auto z-40 md:z-auto`}
          >
            {/* Mobile Overlay */}
            {showMobileFilters && (
              <div
                className="md:hidden fixed inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
              />
            )}

            {/* Filter Panel - Keep all your existing filter code */}
            <div className="md:sticky md:top-20 bg-white rounded-xl shadow-lg p-6 h-fit relative md:relative max-h-screen overflow-y-auto md:max-h-[calc(100vh-100px)] ml-auto md:ml-0 max-w-sm md:max-w-none w-4/5 md:w-full">
              {/* Your existing filter code here */}
              {/* Mobile Close Button */}
              <button
                onClick={() => setShowMobileFilters(false)}
                className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-xl" />
              </button>

              {/* Filter Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaSlidersH className="text-[#3B2F2F]" />
                  Filters
                </h2>
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-[#3B2F2F]"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="bg-gray-100 px-3 py-1 rounded">
                      ₹{priceRange[0]. toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-500">to</span>
                    <span className="bg-gray-100 px-3 py-1 rounded">
                      ₹{priceRange[1].toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.length === 0 ? (
                    <p className="text-sm text-gray-500">No brands available</p>
                  ) : (
                    brands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-4 h-4 rounded border-gray-300 text-[#3B2F2F] focus:ring-[#3B2F2F]"
                        />
                        <span className="text-sm text-gray-700">{brand}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ({products.filter((p) => p.brand === brand).length})
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Customer Rating
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => toggleRating(rating)}
                        className="w-4 h-4 rounded border-gray-300 text-[#3B2F2F] focus:ring-[#3B2F2F]"
                      />
                      <div className="flex items-center gap-1">
                        {[... Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < rating
                                ? "text-yellow-500 text-xs"
                                : "text-gray-300 text-xs"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">& Up</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Availability
                </h3>
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={showInStockOnly}
                    onChange={(e) => setShowInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#3B2F2F] focus:ring-[#3B2F2F]"
                  />
                  <span className="text-sm text-gray-700">
                    Show In Stock Only
                  </span>
                </label>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters() && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    Active Filters:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBrands.map((brand) => (
                      <span
                        key={brand}
                        className="bg-[#3B2F2F] text-white text-xs px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {brand}
                        <button onClick={() => toggleBrand(brand)}>
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                    {selectedRatings.map((rating) => (
                      <span
                        key={rating}
                        className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {rating}★+
                        <button onClick={() => toggleRating(rating)}>
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                    {showInStockOnly && (
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
                        In Stock
                        <button onClick={() => setShowInStockOnly(false)}>
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="md:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#3B2F2F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                    : "space-y-4"
                }
              >
                {sortedProducts.map((product) =>
                  viewMode === "grid" ? (
                    <ProductCard key={product._id || product.id} product={product} />
                  ) : (
                    <div
                      key={product._id || product.id}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition flex gap-4 cursor-pointer"
                      onClick={() => handleViewProduct(product._id || product.id)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-24 h-24 object-contain"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100? text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {product.brand}
                        </p>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < (product.rating || 0) ?  "text-yellow-500 text-xs" : "text-gray-300 text-xs"}
                            />
                          ))}
                        </div>
                        <p className="text-[#3B2F2F] text-xl font-bold">
                          ₹{product.price?. toLocaleString("en-IN")}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e. stopPropagation();
                          handleViewProduct(product._id || product.id);
                        }}
                        className="bg-[#3B2F2F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition h-fit self-center"
                      >
                        View
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;