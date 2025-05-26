/**
 * Authentication middleware
 * Handles JWT verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorMiddleware');
const pool = require('../db');

// Verify JWT token
const verifyToken = (token, secret) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

// Protect routes - general authentication
const protect = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2) Check if token exists
    if (!token) {
      return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
    }

    // 3) Verify token
    const decoded = await verifyToken(token, process.env.JWT_SECRET);

    // 4) Check if user still exists
    const userType = decoded.userType; // 'vendor' or 'customer'
    const userId = decoded.id;
    
    let user;
    if (userType === 'vendor') {
      const result = await pool.query('SELECT * FROM vendors WHERE vendor_id = $1', [userId]);
      user = result.rows[0];
    } else if (userType === 'customer') {
      const result = await pool.query('SELECT * FROM customers WHERE customer_id = $1', [userId]);
      user = result.rows[0];
    }

    if (!user) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // 5) Grant access to protected route
    req.user = {
      id: userId,
      type: userType,
      ...user
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired. Please log in again.'));
    }
    return next(new ApiError(401, 'Authentication failed. Please log in again.'));
  }
};

// Restrict to specific user types
const restrictTo = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.type)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};

// Vendor-specific authentication
const protectVendorRoutes = async (req, res, next) => {
  try {
    await protect(req, res, () => {});
    
    if (req.user && req.user.type === 'vendor') {
      return next();
    }
    
    return next(new ApiError(403, 'Access denied. Vendor authentication required.'));
  } catch (error) {
    return next(error);
  }
};

// Customer-specific authentication
const protectCustomerRoutes = async (req, res, next) => {
  try {
    await protect(req, res, () => {});
    
    if (req.user && req.user.type === 'customer') {
      return next();
    }
    
    return next(new ApiError(403, 'Access denied. Customer authentication required.'));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  protect,
  restrictTo,
  protectVendorRoutes,
  protectCustomerRoutes
};