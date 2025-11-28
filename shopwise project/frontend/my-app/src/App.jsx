import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Regular Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import FilterData from './pages/FilterData';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import OrderDetail from './pages/OrderDetail';
import Contact from './pages/Contact';
import Chatbot from './components/Chatbot';

// Admin Components
import AdminLayout from './components/AdminLayout';
// ❌ REMOVE THIS LINE: import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AdminProvider>
          <Router>
            <Routes>
              {/* ❌ REMOVE THIS ROUTE */}
              {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
              
              {/* Admin Routes - Separate Layout */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/create" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:id" element={<AdminUserDetail />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>

              {/* Regular Customer Routes */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />
                      <Route path="/filter-data" element={<FilterData />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      {/* <Route path="/auth" element={<Auth />} /> */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders/:id" element={<OrderDetail />} />
                      <Route path="/contact" element={<Contact />} />
                    </Routes>
                    <Footer />
                    <Chatbot />
                  </>
                }
              />
            </Routes>

            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </AdminProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;