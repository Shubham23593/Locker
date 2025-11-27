import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import { setSearchTerm } from "../redux/productSlice";
import Modal from "./Modal";
import AuthForm from "./AuthForm";
import { logoutAndClearStore } from "../redux/store";

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { products: cartProducts } = useSelector((state) => state.cart);
  const cartItemCount = cartProducts?.length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(search));
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    
    if (confirmLogout) {
      logoutAndClearStore();
      logout();
      navigate('/', { replace: true });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-40">
        {/* Top Bar */}
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-3 md:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="text-lg md:text-xl font-bold flex-shrink-0">
              <Link to="/" onClick={closeMobileMenu}>ShopWise</Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex relative flex-1 mx-4 lg:mx-8 max-w-md lg:max-w-lg">
              <form onSubmit={handleSearch} className="w-full">
                <input
                  className="w-full border py-2 px-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2F2F]"
                  type="text"
                  placeholder="Search Product"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  <FaSearch className="text-[#3B2F2F]" />
                </button>
              </form>
            </div>

            {/* Desktop Icons & Auth */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link to="/cart" className="relative hover:text-[#3B2F2F] transition">
                <FaShoppingCart className="text-lg lg:text-xl" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 text-xs w-5 h-5 flex items-center justify-center bg-red-600 rounded-full text-white font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-sm hover:text-[#3B2F2F] transition">
                    <FaUser className="text-lg" />
                    <span className="hidden lg:block max-w-[100px] truncate">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-t-lg"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={openModal} className="text-sm hover:text-[#3B2F2F] transition whitespace-nowrap">
                  Login | Register
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-2xl focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                className="w-full border py-2 px-4 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3B2F2F]"
                type="text"
                placeholder="Search Product"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="absolute top-1/2 right-3 transform -translate-y-1/2">
                <FaSearch className="text-[#3B2F2F]" />
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center justify-center space-x-6 lg:space-x-10 py-3 text-sm font-bold border-t">
          <Link to="/" className="hover:text-[#3B2F2F] hover:underline transition">
            Home
          </Link>
          <Link to="/shop" className="hover:text-[#3B2F2F] hover:underline transition">
            Shop
          </Link>
          <Link to="/contact" className="hover:text-[#3B2F2F] hover:underline transition">
            Contact
          </Link>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-3 space-y-3 bg-gray-50 border-t">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="block py-2 hover:text-[#3B2F2F] transition font-medium"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={closeMobileMenu}
              className="block py-2 hover:text-[#3B2F2F] transition font-medium"
            >
              Shop
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileMenu}
              className="block py-2 hover:text-[#3B2F2F] transition font-medium"
            >
              Contact
            </Link>
            <Link
              to="/cart"
              onClick={closeMobileMenu}
              className="flex items-center justify-between py-2 hover:text-[#3B2F2F] transition font-medium"
            >
              <span>Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="block py-2 hover:text-[#3B2F2F] transition font-medium"
                >
                  Profile ({user.name})
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleLogout();
                  }}
                  className="block w-full text-left py-2 hover:text-[#3B2F2F] transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={openModal}
                className="block w-full text-left py-2 hover:text-[#3B2F2F] transition font-medium"
              >
                Login | Register
              </button>
            )}
          </div>
        </div>
      </nav>

      <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
        <AuthForm closeModal={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default Navbar;