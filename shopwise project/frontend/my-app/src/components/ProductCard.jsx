import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { addToCartAsync } from "../redux/cartSlice";
import { useDispatch } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    event.preventDefault();

    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }

    if (!product.stock || product.stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      const productToAdd = {
        ...product,
        _id: product._id || product.id,
        id: product.id || product._id,
        quantity: 1,
      };

      await dispatch(addToCartAsync(productToAdd)).unwrap();
      toast.success("Product added to cart successfully!");
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product._id || product.id}`);
  };

  if (!product) return null;

  const rating = product.rating || 4.1;
  const stock = product.stock || 50;
  const isInStock = stock > 0;
  const isLowStock = stock > 0 && stock <= 10;

  const price = product.price || 0;

  // ⭐ RATING UI
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={"f" + i} className="text-yellow-500 text-xs" />);
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt key="half" className="text-yellow-500 text-xs" />
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={"e" + i} className="text-gray-300 text-xs" />);
    }

    return stars;
  };

  return (
    <div
      onClick={handleProductClick}
      className="bg-white p-3 shadow-sm rounded-lg relative border border-transparent transform duration-200 hover:scale-105 hover:shadow-xl cursor-pointer overflow-hidden"
    >
      {/* STOCK BADGE */}
      <div className="absolute top-2 left-2 z-10">
        {isInStock ? (
          isLowStock ? (
            <span className="bg-[#3B2F2F] text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <FaCheck /> Only {stock} left
            </span>
          ) : (
            <span className="bg-[#3B2F2F] text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
              <FaCheck /> In Stock
            </span>
          )
        ) : (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <FaTimes /> Out of Stock
          </span>
        )}
      </div>


      {/* PRODUCT IMAGE */}
      <div className={`relative ${!isInStock ? "opacity-60" : ""}`}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-contain mb-2"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x400?text=No+Image";
          }}
        />

        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
          </div>
        )}
      </div>

      {/* PRODUCT NAME */}
      <h3
        className="text-base font-semibold truncate mb-1"
        title={product.name}
        style={{ color: "#3B2F2F" }}  
      >
        {product.name}
      </h3>

      {/* RATING */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex items-center gap-0.5">{renderStars()}</div>
        <span className="text-gray-600 text-xs ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>

      {/* PRICE */}
      <div className="flex items-center gap-2 mb-2">
        <p className="text-lg font-bold" style={{ color: "#3B2F2F" }}>
          ₹{price.toLocaleString("en-IN")}
        </p>
      </div>

      {/* STOCK INFO */}
      <div className="text-xs font-semibold mb-2">
        {isInStock ? (
          isLowStock ? (
            <span style={{ color: "#3B2F2F" }}>
              ⚠️ Hurry! Only {stock} left
            </span>
          ) : (
            <span style={{ color: "#3B2F2F" }}>
              ✓ {stock} units available
            </span>
          )
        ) : (
          <span className="text-red-600">✗ Currently unavailable</span>
        )}
      </div>

      {/* ADD TO CART BUTTON */}
      {isInStock ? (
        <div
          className="absolute bottom-3 right-2 flex items-center justify-center w-8 h-8 bg-[#3B2F2F]
          group text-white text-xs rounded-full hover:w-32 hover:bg-red-700 transition-all overflow-hidden cursor-pointer shadow-lg"
          onClick={(event) => handleAddToCart(event, product)}
        >
          <FaShoppingCart className="group-hover:hidden text-sm" />
          <span className="hidden group-hover:flex items-center gap-1">
            <FaShoppingCart /> Add to Cart
          </span>
        </div>
      ) : (
        <div className="absolute bottom-3 right-2 flex items-center justify-center px-3 py-1 bg-gray-400 text-white text-xs rounded-full cursor-not-allowed">
          Out of Stock
        </div>
      )}
    </div>
  );
};

export default ProductCard;
