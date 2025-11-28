import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Protect admin routes
export const adminProtect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process. env.JWT_SECRET);

      // Check if it's an admin token
      if (decoded.role !== 'admin' && decoded.role !== 'super_admin' && decoded.role !== 'manager') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        });
      }

      // Get admin from database
      req.admin = await Admin.findById(decoded.id). select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found',
        });
      }

      // Check if admin is active
      if (!req.admin. isActive) {
        return res.status(403).json({
          success: false,
          message: 'Admin account is deactivated',
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

// Check specific permission
export const checkPermission = (permission) => {
  return (req, res, next) => {
    // Super admin has all permissions
    if (req. admin.role === 'super_admin') {
      return next();
    }

    // Check if admin has the required permission
    if (req. admin.permissions && req.admin.permissions.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You don't have permission to access ${permission}`,
    });
  };
};

// Check if user is super admin
export const isSuperAdmin = (req, res, next) => {
  if (req. admin.role === 'super_admin') {
    return next();
  }

  return res. status(403).json({
    success: false,
    message: 'Access denied. Super admin privileges required.',
  });
};

export default { adminProtect, checkPermission, isSuperAdmin };