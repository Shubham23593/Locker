import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAdmin } from "../context/AdminContext";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaShoppingBag, FaTimes, FaUserShield } from "react-icons/fa";
import { toast } from "react-toastify";
import { adminAPIService } from "../services/adminAPI";

const AuthForm = ({ closeModal }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { adminLogin } = useAdmin();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Admin Login
      if (isAdminMode) {
        if (!formData.email || !formData.password) {
          toast.error('Please fill all fields');
          setLoading(false);
          return;
        }

        const response = await adminAPIService.login({
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success) {
          const { token, ...adminData } = response.data.data;
          adminLogin(adminData, token);
          closeModal?.();
          navigate('/admin/dashboard');
          toast.success('Admin logged in successfully!');
        }
      }
      // User Login
      else if (isLogin) {
        if (!formData.email || !formData.password) {
          toast.error('Please fill all fields');
          setLoading(false);
          return;
        }

        await login(formData.email, formData.password);
        closeModal?.();
        navigate('/', { replace: true });

      } 
      // User Register
      else {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          toast.error('Please fill all fields');
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        await register(formData.name, formData.email, formData.password);
        closeModal?.();
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        toast.error('Cannot connect to server. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please try again.');
      } else if (error.response) {
        toast.error(error.response.data.message || 'Authentication failed');
      } else {
        toast.error(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    setIsLogin(true);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPassword(false);
    setRememberMe(false);
  };

  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-5xl flex flex-col md:flex-row relative">
        
        {/* Mobile Close Button */}
        {closeModal && (
          <button
            onClick={closeModal}
            className="absolute top-3 right-3 z-20 md:hidden text-gray-600 hover:text-gray-800 bg-white rounded-full p-2 shadow-md"
          >
            <FaTimes className="text-lg" />
          </button>
        )}

        {/* Left Side */}
        <div className={`hidden sm:flex bg-gradient-to-br 
          from-[#3B2F2F] to-[#6B4F4F]
          p-6 sm:p-8 md:w-2/5 flex-col justify-center text-white`}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            {isAdminMode ? (
              <FaUserShield className="text-3xl" />
            ) : (
              <FaShoppingBag className="text-3xl" />
            )}
            <h1 className="text-2xl font-bold">
              {isAdminMode ? 'Admin Portal' : 'ShopWise'}
            </h1>
          </div>

          <h2 className="text-xl font-bold mb-3">
            {isAdminMode ? 'Admin Access' : isLogin ? 'Welcome Back!' : 'Join Us Today!'}
          </h2>

          <p className="text-gray-200 text-sm mb-6">
            {isAdminMode
              ? 'Secure admin login to manage your store.'
              : isLogin
                ? 'Login to access your account and continue shopping.'
                : 'Create an account to start your shopping journey.'}
          </p>
        </div>

        {/* Right Side */}
        <div className="p-6 md:p-8 md:w-3/5 max-h-[90vh] overflow-y-auto">

          {/* Mobile Logo */}
          <div className="flex sm:hidden items-center justify-center gap-2 mb-4">
            {isAdminMode ? (
              <>
                <FaUserShield className="text-[#3B2F2F] text-2xl" />
                <h1 className="text-xl font-bold text-[#3B2F2F]">Admin Portal</h1>
              </>
            ) : (
              <>
                <FaShoppingBag className="text-[#3B2F2F] text-2xl" />
                <h1 className="text-xl font-bold text-[#3B2F2F]">ShopWise</h1>
              </>
            )}
          </div>

          {/* Admin Toggle */}
          <div className="mb-4 flex justify-center">
            <button
              onClick={toggleAdminMode}
              type="button"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isAdminMode
                  ? 'bg-[#F3F0F0] text-[#3B2F2F] border border-[#3B2F2F]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUserShield />
              {isAdminMode ? 'Switch to User Login' : 'Login as Admin'}
            </button>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isAdminMode ? 'Admin Login' : isLogin ? 'Login' : 'Create Account'}
            </h2>
          </div>

          {/* Default Admin Credentials */}
          {isAdminMode && (
            <div className="mb-4 p-3 bg-[#F3F0F0] border border-[#3B2F2F]/30 rounded-lg">
              <p className="text-xs font-semibold text-[#3B2F2F] mb-1">Default Credentials:</p>
              <p className="text-xs text-[#3B2F2F]">Email: shop7883@gmail.com</p>
              <p className="text-xs text-[#3B2F2F]">Password: 1234</p>
            </div>
          )}

          {/* FORM START */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* User Full Name */}
            {!isLogin && !isAdminMode && (
              <div>
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    disabled={loading}
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="w-full pl-9 pr-3 py-2 border-2 rounded-lg text-sm border-gray-300 focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700">
                {isAdminMode ? "Admin Email" : "Email Address"}
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  disabled={loading}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email"
                  className="w-full pl-9 pr-3 py-2 border-2 rounded-lg text-sm border-gray-300 focus:border-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  disabled={loading}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-10 py-2 border-2 rounded-lg text-sm border-gray-300 focus:border-gray-500 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Only User */}
            {!isLogin && !isAdminMode && (
              <div>
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    disabled={loading}
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full pl-9 pr-10 py-2 border-2 rounded-lg text-sm border-gray-300 focus:border-gray-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me */}
            {isLogin && (
              <div className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-[#3B2F2F]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 rounded-lg text-white font-bold text-sm
                bg-gradient-to-r from-[#3B2F2F] to-[#6B4F4F]
                hover:opacity-90 transition-all
              "
            >
              {loading ? "Processing..." : (isAdminMode ? "Login as Admin" : isLogin ? "Login" : "Create Account")}
            </button>

          </form>

          {/* Switch Mode */}
          {!isAdminMode && (
            <div className="mt-6 text-center text-sm text-gray-700">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button className="ml-1 text-[#3B2F2F] font-semibold" onClick={switchMode}>
                {isLogin ? "Register" : "Login"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AuthForm;
