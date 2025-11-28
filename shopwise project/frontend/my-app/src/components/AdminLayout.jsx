import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronRight,
} from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, adminLogout, hasPermission, isAdmin } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  // ✅ Redirect to /auth if not admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/auth');
    }
  }, [isAdmin, navigate]);

  const handleLogout = () => {
    adminLogout();
    navigate('/auth');
  };

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
      permission: null,
    },
    {
      path: '/admin/orders',
      icon: FaShoppingCart,
      label: 'Orders',
      permission: 'orders',
    },
    {
      path: '/admin/products',
      icon: FaBox,
      label: 'Products',
      permission: 'products',
    },
    {
      path: '/admin/users',
      icon: FaUsers,
      label: 'Users',
      permission: 'users',
    },
    {
      path: '/admin/analytics',
      icon: FaChartLine,
      label: 'Analytics',
      permission: 'analytics',
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f7f6' }}>
      {/* Top Navbar */}
      <div
        className="text-white shadow-lg sticky top-0 z-30"
        style={{ backgroundColor: '#3B2F2F' }}
      >
        <div className="max-w-full px-6">
          <div className="flex justify-between items-center py-5">
            {/* Logo & Menu Toggle */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-white hover:opacity-80 p-2 rounded-lg transition-opacity duration-200"
              >
                {sidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
              </button>
              <h1 className="text-2xl font-bold tracking-tight">ShopWise Admin</h1>
            </div>

            {/* Admin Info */}
            <div className="flex items-center gap-5">
              <div className="hidden md:block text-right">
                <p className="font-semibold text-sm">{admin?.name}</p>
                <p className="text-xs opacity-75">{admin?.role}</p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                {admin?.name?.charAt(0)?.toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 hover:opacity-80"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <FaSignOutAlt className="text-sm" />
                <span className="hidden md:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-20 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            top: '76px',
            backgroundColor: '#fff',
          }}
        >
          <nav className="p-6 space-y-2 h-[calc(100vh-76px)] overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin/dashboard' &&
                  location.pathname.startsWith(item.path));
              const isHovered = hoveredItem === item.path;

              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-300 ease-out group relative overflow-hidden"
                  style={{
                    backgroundColor: isActive ? '#3B2F2F' : (isHovered ? '#f0eeec' : 'transparent'),
                    color: isActive ? '#fff' : '#3B2F2F',
                    transform: isHovered && !isActive ? 'translateX(4px)' : 'translateX(0)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <Icon className="text-lg transition-transform duration-300" style={{
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {isActive && (
                    <FaChevronRight className="text-xs opacity-70 transition-all duration-300" style={{
                      transform: 'rotate(0deg)',
                      opacity: isActive ? 0.8 : 0.5,
                    }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div
            className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white to-transparent"
            style={{ borderTop: 'none' }}
          >
            <button
              onClick={() => {
                navigate('/');
                setSidebarOpen(false);
              }}
              className="w-full px-4 py-3 rounded-lg transition-all duration-300 text-center font-medium text-sm transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: '#f0eeec',
                color: '#3B2F2F',
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = '#e8e6e3')
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = '#f0eeec')
              }
            >
              ← Back to Store
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ top: '76px' }}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;