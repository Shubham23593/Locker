// ✅ CRITICAL: Load dotenv FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// ✅ Verify env vars are loaded
console.log('🔍 Environment Variables Check:');
console.log('   PORT:', process.env.PORT || 'Not set');
console.log('   NODE_ENV:', process.env. NODE_ENV || 'Not set');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ?  '✅ Loaded' : '❌ Missing');
console.log('   HUGGINGFACE_API_KEY:', process.env.HUGGINGFACE_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('   GEMINI_API_KEY:', process. env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing');

// Now import everything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/order.js';
import productRoutes from './routes/product.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Connect to database
connectDB();

const app = express();

// ============================================
// MIDDLEWARE - ORDER MATTERS!
// ============================================

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

app.options('*', cors());

// Security Middleware
app. use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression middleware
app.use(compression());

// ✅ Body parser middleware MUST come before routes
app.use(express.json({ limit: '10mb' }));
app.use(express. urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// RATE LIMITING (Disabled in Development)
// ============================================

const isDevelopment = process.env.NODE_ENV !== 'production';

const authLimiter = isDevelopment 
  ? (req, res, next) => next() // ✅ No limit in development
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 requests per windowMs
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true,
    });

const generalLimiter = isDevelopment
  ? (req, res, next) => next() // ✅ No limit in development
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });

const chatLimiter = isDevelopment
  ? (req, res, next) => next() // ✅ No limit in development
  : rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 30, // 30 requests per windowMs
      message: 'Too many messages, please slow down.',
    });

// Apply rate limiters
if (process. env.NODE_ENV === 'production') {
  app.use('/api/', generalLimiter);
  console.log('✅ Rate limiting ENABLED (Production mode)');
} else {
  console.log('⚠️  Rate limiting DISABLED (Development mode)');
}

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app. use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// HEALTH & STATUS ENDPOINTS
// ============================================

app. get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    message: 'ShopWise API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected',
      auth: 'active',
      chat: 'active',
      admin: 'active',
      rateLimiting: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled',
      huggingface: process.env.HUGGINGFACE_API_KEY ? 'configured' : 'missing',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'ShopWise E-commerce API',
    version: '1.0.0',
    description: 'E-commerce platform with AI chatbot',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      chat: '/api/chat',
      admin: '/api/admin',
    },
    chatFeatures: [
      'Product recommendations',
      'Order tracking assistance',
      'Customer support',
      'Shipping & return info',
    ],
    adminFeatures: [
      'Dashboard analytics',
      'Order management',
      'Product management',
      'User management',
      'Sales reports',
    ],
    status: 'operational',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🛍️ Welcome to ShopWise API',
    version: '1.0.0',
    features: [
      '🛒 E-commerce',
      '🤖 AI Chatbot (Gemini AI)',
      '👨‍💼 Admin Panel',
      '📦 Order Tracking',
      '💳 Secure Payments',
      '🚚 Shipping Management',
    ],
    documentation: '/api',
  });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res. status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/auth',
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/chat',
      '/api/admin',
    ],
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Mongoose validation error
  if (err. name === 'ValidationError') {
    const errors = Object.values(err. errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res. status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Hugging Face API errors
  if (err.message && err.message.includes('HUGGINGFACE')) {
    return res.status(503).json({
      success: false,
      message: 'AI service temporarily unavailable',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Gemini API errors
  if (err.message && err.message.includes('GEMINI')) {
    return res. status(503).json({
      success: false,
      message: 'AI service temporarily unavailable',
      details: process.env. NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Generic error
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
    })
  });
});

// ============================================
// SERVER INITIALIZATION
// ============================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 ShopWise Server Started`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📚 Docs: http://localhost:${PORT}/api`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Available Routes:');
  console.log(`   🔐 Auth:     /api/auth`);
  console.log(`   📦 Products: /api/products`);
  console.log(`   🛒 Cart:     /api/cart`);
  console. log(`   📋 Orders:   /api/orders`);
  console.log(`   🤖 Chat:     /api/chat (Gemini AI)`);
  console.log(`   👨‍💼 Admin:    /api/admin`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Services Status:');
  console.log(`   Database:      ${process.env. MONGO_URI ?  '✅ Connected' : '❌ Not configured'}`);
  console.log(`   JWT Secret:    ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Gemini AI:     ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Rate Limiting: ${process.env.NODE_ENV === 'production' ? '✅ Enabled' : '⚠️  Disabled (Dev)'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err. message);
  console.log('🔄 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received.  Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console. log('\n👋 SIGINT received. Shutting down gracefully.. .');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

export default app;