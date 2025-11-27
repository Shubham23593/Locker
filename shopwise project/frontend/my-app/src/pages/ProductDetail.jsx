import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  FaStar, 
  FaHeart, 
  FaRegHeart, 
  FaShoppingCart, 
  FaCheck, 
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaShareAlt,
} from "react-icons/fa";
import { addToCartAsync } from "../redux/cartSlice";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import ProductCard from "../components/ProductCard";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { products } = useSelector((state) => state.product);

  const product = products.find((p) => p.id === parseInt(id));

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // ✅ Generate variants based on current product
  const variants = product ? [
    { id: 1, name: "64GB", price: product.price, stock: 50 },
    { id: 2, name: "128GB", price: product.price + 2000, stock: 30 },
    { id: 3, name: "256GB", price: product.price + 5000, stock: 20 },
  ] : [];

  const reviews = [
    {
      id: 1,
      user: "John Doe",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent product! Highly recommended. The quality is amazing and delivery was fast.",
      verified: true,
    },
    {
      id: 2,
      user: "Jane Smith",
      rating: 4,
      date: "2024-01-10",
      comment: "Good quality product. Value for money. Minor issues with packaging but product is great.",
      verified: true,
    },
    {
      id: 3,
      user: "Mike Johnson",
      rating: 5,
      date: "2024-01-05",
      comment: "Best purchase ever! Exceeded my expectations. Will definitely buy again.",
      verified: false,
    },
  ];

  const relatedProducts = product ? products
    .filter((p) => p.brand === product.brand && p.id !== product.id)
    .slice(0, 4) : [];

  // ✅ CRITICAL: Reset all state when product ID changes
  useEffect(() => {
    console.log('🔄 Product ID changed:', id);
    
    // Reset all state
    setQuantity(1);
    setSelectedVariant(null);
    setIsWishlisted(false);
    setActiveTab("description");
    
    // Scroll to top
    window.scrollTo(0, 0);

    // Set default variant after reset
    if (variants.length > 0) {
      console.log('✅ Setting default variant:', variants[0]);
      setSelectedVariant(variants[0]);
    }

    // Check if product exists
    if (!product) {
      toast.error("Product not found");
      navigate("/shop");
    }
  }, [id, product]); // ✅ Trigger when ID or product changes

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    try {
      const productWithVariant = {
        ...product,
        id: product.id,
        name: `${product.name} (${selectedVariant.name})`,
        price: selectedVariant.price,
        variant: selectedVariant.name,
        variantId: selectedVariant.id,
        quantity: quantity,
      };

      console.log('🛒 Adding to cart:', productWithVariant);

      await dispatch(addToCartAsync(productWithVariant)).unwrap();
      toast.success(`${selectedVariant.name} added to cart successfully!`);
    } catch (error) {
      toast.error(error || "Failed to add product to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please login to continue");
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    try {
      const productWithVariant = {
        ...product,
        id: product.id,
        name: `${product.name} (${selectedVariant.name})`,
        price: selectedVariant.price,
        variant: selectedVariant.name,
        variantId: selectedVariant.id,
        quantity: quantity,
      };

      await dispatch(addToCartAsync(productWithVariant)).unwrap();
      navigate("/checkout");
    } catch (error) {
      toast.error(error || "Failed to proceed");
    }
  };

  const handleWishlist = () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on ShopWise`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // ✅ Show loading while product changes
  if (!product) {
    return (
      <div className="container mx-auto py-12 flex justify-center min-h-[60vh] items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2F2F]"></div>
      </div>
    );
  }

  // ✅ Show loading while variant is being set
  if (!selectedVariant) {
    return (
      <div className="container mx-auto py-12 flex justify-center min-h-[60vh] items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2F2F]"></div>
      </div>
    );
  }

  const currentPrice = selectedVariant.price;
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  console.log('📊 Current product:', product.name, 'Price:', currentPrice);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 sm:py-8 px-4 md:px-8 lg:px-16 xl:px-24">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
          <button onClick={() => navigate("/")} className="hover:text-[#3B2F2F]">
            Home
          </button>
          <span>/</span>
          <button onClick={() => navigate("/shop")} className="hover:text-[#3B2F2F]">
            Shop
          </button>
          <span>/</span>
          <span className="text-[#3B2F2F] font-medium truncate">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg">
          
          {/* Left: Product Image */}
          <div className="flex items-center justify-center">
            <div className="relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden w-full max-w-md">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 sm:h-80 md:h-96 object-contain p-6"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                }}
              />

              {/* Stock Badge */}
              <div className="absolute top-4 left-4">
                {selectedVariant.stock > 0 ? (
                  <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <FaCheck className="text-xs" /> {selectedVariant.stock} In Stock
                  </span>
                ) : (
                  <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Wishlist & Share Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleWishlist}
                  className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition"
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  {isWishlisted ? (
                    <FaHeart className="text-red-500 text-lg" />
                  ) : (
                    <FaRegHeart className="text-gray-600 text-lg" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition"
                  title="Share product"
                >
                  <FaShareAlt className="text-gray-600 text-lg" />
                </button>
              </div>

              {/* Discount Badge */}
              <div className="absolute bottom-4 left-4">
                <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                  16% OFF
                </span>
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="text-[#3B2F2F] font-semibold text-sm uppercase tracking-wide">
              {product.brand}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      i < Math.round(averageRating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            {/* Price - Shows current product price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-[#3B2F2F]">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ₹{(currentPrice * 1.2).toLocaleString("en-IN")}
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                Save 16%
              </span>
            </div>

            {/* Variants */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Select Storage: 
                <span className="ml-2 text-[#3B2F2F]">
                  ({selectedVariant.name} - ₹{selectedVariant.price.toLocaleString("en-IN")})
                </span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      console.log('🔄 Variant changed:', variant.name, variant.price);
                      setSelectedVariant(variant);
                    }}
                    disabled={variant.stock === 0}
                    className={`px-5 py-3 border-2 rounded-xl font-semibold transition relative ${
                      selectedVariant.id === variant.id
                        ? "border-[#3B2F2F] bg-[#3B2F2F] text-white shadow-md scale-105"
                        : variant.stock === 0
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:border-[#3B2F2F] hover:shadow-md"
                    }`}
                  >
                    {variant.name}
                    {variant.stock === 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        Out
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">Quantity:</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-5 py-3 hover:bg-gray-100 transition font-semibold"
                  >
                    -
                  </button>
                  <span className="px-8 py-3 font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-5 py-3 hover:bg-gray-100 transition font-semibold"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-600 text-sm">
                  (Max 10 items per order)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant.stock === 0}
                className="flex-1 bg-white border-2 border-[#3B2F2F] text-[#3B2F2F] py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <FaShoppingCart className="text-xl" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={selectedVariant.stock === 0}
                className="flex-1 bg-[#3B2F2F] text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaTruck className="text-2xl text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-600">On orders above ₹500</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaUndo className="text-2xl text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">7 Days Return</p>
                  <p className="text-xs text-gray-600">Easy returns</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaShieldAlt className="text-2xl text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Warranty</p>
                  <p className="text-xs text-gray-600">1 Year Brand Warranty</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {["description", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-semibold capitalize whitespace-nowrap transition ${
                  activeTab === tab
                    ? "border-b-4 border-[#3B2F2F] text-[#3B2F2F] bg-gray-50"
                    : "text-gray-600 hover:text-[#3B2F2F] hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  Experience the next generation of smartphones with the {product.name}. 
                  This device combines cutting-edge technology with elegant design to deliver 
                  an unparalleled user experience.
                </p>
                <h4 className="text-lg font-semibold mt-6 mb-3">Key Features:</h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>High-performance processor for seamless multitasking</li>
                  <li>Stunning display with vibrant colors and deep blacks</li>
                  <li>Advanced camera system for professional-quality photos</li>
                  <li>Long-lasting battery with fast charging support</li>
                  <li>Premium build quality with durable materials</li>
                  <li>Latest software with regular updates</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#3B2F2F]">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={
                              i < Math.round(averageRating)
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {reviews.length} reviews
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{review.user}</span>
                            {review.verified && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={
                                  i < review.rating
                                    ? "text-yellow-500 text-sm"
                                    : "text-gray-300 text-sm"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;