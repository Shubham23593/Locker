import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req, res) => {
  try {
    console.log('📥 Admin login request received');
    console.log('Request body:', req. body);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res. status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    console.log('🔍 Searching for admin with email:', email);

    // Check if admin exists
    let admin = await Admin.findOne({ email });
    console.log('Admin found:', admin ?  'Yes' : 'No');

    // Create default admin if doesn't exist
    if (!admin) {
      console.log('Admin not found, checking default credentials');
      if (email === 'shop7883@gmail.com' && password === '1234') {
        console.log('🆕 Creating default admin account.. .');
        try {
          admin = await Admin. create({
            email: 'shop7883@gmail.com',
            password: '1234',
            name: 'ShopWise Admin',
            role: 'super_admin',
            permissions: ['products', 'orders', 'users', 'analytics', 'settings'],
            isActive: true,
          });
          console.log('✅ Default admin created successfully');
        } catch (createError) {
          console.error('❌ Error creating admin:', createError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create admin account',
            error: createError.message,
          });
        }
      } else {
        console.log('❌ Invalid credentials for new admin');
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials',
        });
      }
    }

    // Check if admin is active
    if (! admin.isActive) {
      console.log('❌ Admin account is deactivated');
      return res. status(403).json({
        success: false,
        message: 'Admin account is deactivated',
      });
    }

    // Check password
    console.log('🔐 Verifying password.. .');
    let isMatch;
    try {
      isMatch = await admin.comparePassword(password);
      console.log('Password match result:', isMatch);
    } catch (passwordError) {
      console.error('❌ Password comparison error:', passwordError);
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
        error: passwordError.message,
      });
    }

    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials',
      });
    }

    console.log('✅ Password verified successfully');

    // Update last login
    try {
      admin.lastLogin = new Date();
      await admin. save();
      console.log('✅ Last login updated');
    } catch (saveError) {
      console.error('⚠️ Warning: Could not update last login:', saveError);
      // Don't fail login if this fails
    }

    // Generate token
    console.log('🔑 Generating token...');
    const token = generateToken(admin._id, admin.role);
    console. log('✅ Token generated');

    console.log('✅ Admin login successful');
    res.json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        token,
      },
      message: 'Admin logged in successfully',
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin. findById(req.admin._id).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console. error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats...');

    // Get counts
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order. countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    console.log('Counts fetched:', { totalUsers, totalOrders, totalProducts });

    // Calculate revenue
    const orders = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    console.log('Total revenue:', totalRevenue);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      . limit(10)
      .populate('userId', 'name email');

    // Low stock products
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .limit(10)
      .sort({ stock: 1 });

    // Best selling products
    const bestSellingProducts = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    console.log('✅ Dashboard stats compiled successfully');

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalOrders,
          totalProducts,
          totalRevenue,
        },
        orders: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        monthlyRevenue: monthlyOrders,
        recentOrders,
        lowStockProducts,
        bestSellingProducts,
      },
    });
  } catch (error) {
    console. error('❌ Get stats error:', error);
    res. status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

// @desc    Get all orders with filters
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query._id = { $regex: search, $options: 'i' };
    }

    const sortOrder = order === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNote } = req.body;
    const orderId = req.params. id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    
    if (trackingNote) {
      order.trackingNote = trackingNote;
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res. json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;

    const users = await User.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      . skip((parseInt(page) - 1) * parseInt(limit));

    const count = await User.countDocuments(query);

    // Get order count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ userId: user._id });
        const orders = await Order.find({ userId: user._id, status: { $ne: 'cancelled' } });
        const totalSpent = orders.reduce((sum, order) => sum + (order. totalAmount || 0), 0);
        
        return {
          ...user. toObject(),
          orderCount,
          totalSpent,
        };
      })
    );

    res.json({
      success: true,
      data: usersWithStats,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500). json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user details with orders
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const orders = await Order.find({ userId: user._id }). sort({ createdAt: -1 });
    const totalSpent = orders. reduce((sum, order) => {
      if (order.status !== 'cancelled') {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);

    res.json({
      success: true,
      data: {
        user,
        orders,
        stats: {
          totalOrders: orders.length,
          totalSpent,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          completedOrders: orders.filter(o => o.status === 'delivered').length,
        },
      },
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res. status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products with inventory info
// @route   GET /api/admin/products
// @access  Private/Admin
// @desc    Get all products with inventory info
// @route   GET /api/admin/products
// @access  Private/Admin
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    // ✅ Filter by brand (category)
    if (category && category !== 'all') {
      query.brand = category; // Use brand field for filtering
    }

    const sortOrder = order === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    console.log('📥 Create product request:', req.body);

    // Validate required fields
    const { name, price, brand } = req.body;

    if (!name || !price || !brand) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and brand',
      });
    }

    // Create product data with defaults
    const productData = {
      name: req.body.name,
      description: req.body.description || '',
      price: parseFloat(req.body.price),
      category: req.body. brand, // Set category same as brand
      brand: req. body.brand,
      image: req.body.image || 'https://via.placeholder.com/200?text=No+Image',
      stock: parseInt(req. body.stock) || 0,
      rating: 0,
      reviews: [],
    };

    console.log('📦 Product data to create:', productData);

    const product = await Product.create(productData);
    
    console.log('✅ Product created successfully:', product._id);

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update product error:', error);
    res. status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req. query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Sales over time
    const salesData = await Order.aggregate([
      { $match: { ... dateFilter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: period === 'day' ? { $dayOfMonth: '$createdAt' } : null,
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    // Category performance
    const categoryPerformance = await Order.aggregate([
      { $match: { ... dateFilter, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$product. category',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          itemsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        topProducts,
        categoryPerformance,
      },
    });
  } catch (error) {
    console. error('Get analytics error:', error);
    res.status(500). json({
      success: false,
      message: error.message,
    });
  }
};