/**
 * Helper utility functions
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT token
const generateToken = (id, userType) => {
  return jwt.sign(
    { id, userType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password with hashed password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Format error response
const formatError = (message, statusCode = 400) => {
  return {
    status: 'error',
    statusCode,
    message
  };
};

// Format success response
const formatSuccess = (data, message = 'Success', statusCode = 200) => {
  return {
    status: 'success',
    statusCode,
    message,
    data
  };
};

// Pagination helper
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? (page - 1) * limit : 0;
  
  return { limit, offset };
};

// Format pagination response
const getPaginationData = (data, page, limit, total) => {
  const currentPage = page ? +page : 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    total,
    totalPages,
    currentPage,
    itemsPerPage: limit,
    data
  };
};

// Filter object properties
const filterObject = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

// Generate random string
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Format date to ISO string
const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Calculate order total
const calculateOrderTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  formatError,
  formatSuccess,
  getPagination,
  getPaginationData,
  filterObject,
  generateRandomString,
  formatDate,
  calculateOrderTotal
};