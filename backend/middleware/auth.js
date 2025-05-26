const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'marketconnect_jwt_secret';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Middleware to verify vendor role
const isVendor = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Vendor permission required.' });
  }
};

// Middleware to verify customer role
const isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    next();
  } else {
    return res.status(403).json({ error: 'Access denied. Customer permission required.' });
  }
};

module.exports = {
  authenticateToken,
  isVendor,
  isCustomer
};
