import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from 'react-icons/fa';
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
      toast.error("Please login to add items to cart", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      await dispatch(addToCartAsync(product)).unwrap();
      toast.success("Product added to cart successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      toast.error(error || "Failed to add product to cart");
    }
  };

  const handleProductClick = () => {
    navigate(`/product/${product.id}`);
  };

  if (!product) {
    return null;
  }

  return (
    <div 
      onClick={handleProductClick}
      className="bg-white p-3 shadow-sm rounded-lg relative border border-transparent transform duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-contain mb-2"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
        }}
      />

      <h3 className="text-base font-semibold truncate">{product.name}</h3>

      <p className="text-green-600 text-sm font-medium">
        ₹{product.price?.toLocaleString('en-IN')}
      </p>

      <div className="flex items-center mt-1 gap-0.5">
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
        <FaStar className="text-yellow-500 text-xs" />
      </div>

      <div
        className="absolute bottom-3 right-2 flex items-center justify-center w-7 h-7 bg-[#3B2F2F]
          group text-white text-xs rounded-full hover:w-28 hover:bg-red-700 transition-all overflow-hidden cursor-pointer"
        onClick={(event) => handleAddToCart(event, product)}
      >
        <span className="group-hover:hidden">+</span>
        <span className="hidden group-hover:block">Add to Cart</span>
      </div>
    </div>
  );
};

export default ProductCard;