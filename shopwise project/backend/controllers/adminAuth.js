import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401). json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if it's an admin token
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin' && decoded.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin',
      });
    }

    req. admin = await Admin.findById(decoded.id). select('-password');

    if (!req.admin || ! req.admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found or inactive',
      });
    }

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// Check specific permissions
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (req.admin.role === 'super_admin' || req.admin.permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `You don't have permission to access ${permission}`,
      });
    }
  };
};