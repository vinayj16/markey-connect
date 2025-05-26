/**
 * Validation middleware
 * Validates request data against schemas
 */

const validator = require('validator');
const { ApiError } = require('./errorMiddleware');

// Validate request body against a schema
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = validateData(req.body, schema);
    
    if (error) {
      return next(new ApiError(400, error));
    }
    
    // Replace req.body with validated value
    req.body = value;
    next();
  };
};

// Validate request query parameters against a schema
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = validateData(req.query, schema);
    
    if (error) {
      return next(new ApiError(400, error));
    }
    
    // Replace req.query with validated value
    req.query = value;
    next();
  };
};

// Validate request parameters against a schema
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = validateData(req.params, schema);
    
    if (error) {
      return next(new ApiError(400, error));
    }
    
    // Replace req.params with validated value
    req.params = value;
    next();
  };
};

// Helper function to validate data against a schema
const validateData = (data, schema) => {
  const errors = [];
  const validatedData = {};
  
  // Check each field in the schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip validation for optional fields that are not provided
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Validate field based on type
    if (rules.type) {
      const typeError = validateType(value, rules.type, field);
      if (typeError) {
        errors.push(typeError);
        continue;
      }
    }
    
    // Validate string fields
    if (rules.type === 'string') {
      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters long`);
      }
      
      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters long`);
      }
      
      // Check pattern
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        errors.push(`${field} has an invalid format`);
      }
      
      // Check email format
      if (rules.isEmail && !validator.isEmail(value)) {
        errors.push(`${field} must be a valid email address`);
      }
    }
    
    // Validate number fields
    if (rules.type === 'number') {
      // Check min value
      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      
      // Check max value
      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }
    
    // Validate array fields
    if (rules.type === 'array') {
      // Check min items
      if (rules.minItems && value.length < rules.minItems) {
        errors.push(`${field} must contain at least ${rules.minItems} items`);
      }
      
      // Check max items
      if (rules.maxItems && value.length > rules.maxItems) {
        errors.push(`${field} must contain at most ${rules.maxItems} items`);
      }
      
      // Validate array items
      if (rules.items && value.length > 0) {
        for (let i = 0; i < value.length; i++) {
          const itemErrors = validateData(value[i], rules.items).error;
          if (itemErrors) {
            errors.push(`${field}[${i}]: ${itemErrors}`);
          }
        }
      }
    }
    
    // Add custom validation if provided
    if (rules.validate) {
      const customError = rules.validate(value, data);
      if (customError) {
        errors.push(customError);
      }
    }
    
    // Add validated field to result
    validatedData[field] = value;
  }
  
  // Return validation result
  return {
    error: errors.length > 0 ? errors.join('. ') : null,
    value: errors.length > 0 ? data : validatedData
  };
};

// Helper function to validate value type
const validateType = (value, type, field) => {
  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${field} must be a string`;
      }
      break;
    case 'number':
      if (typeof value !== 'number' && isNaN(Number(value))) {
        return `${field} must be a number`;
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
        return `${field} must be a boolean`;
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        return `${field} must be an array`;
      }
      break;
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        return `${field} must be an object`;
      }
      break;
    default:
      return `Unknown type: ${type}`;
  }
  
  return null;
};

// Common validation schemas
const schemas = {
  // Vendor schemas
  vendorLogin: {
    username: { type: 'string', required: true },
    password: { type: 'string', required: true }
  },
  
  vendorRegister: {
    business_name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
    business_type: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    business_address: { type: 'string', required: true },
    registration_number: { type: 'string', required: true, minLength: 2, maxLength: 100 },
    contact_person_name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
    email: { type: 'string', required: true, isEmail: true },
    phone: { type: 'string', required: true, minLength: 10, maxLength: 20 },
    username: { type: 'string', required: true, minLength: 4, maxLength: 100 },
    password: { type: 'string', required: true, minLength: 6 }
  },
  
  // Customer schemas
  customerLogin: {
    email: { type: 'string', required: true, isEmail: true },
    password: { type: 'string', required: true }
  },
  
  customerRegister: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
    email: { type: 'string', required: true, isEmail: true },
    password: { type: 'string', required: true, minLength: 6 },
    phone: { type: 'string', required: false, minLength: 10, maxLength: 20 },
    address: { type: 'string', required: false }
  },
  
  // Product schemas
  productCreate: {
    name: { type: 'string', required: true, minLength: 2, maxLength: 255 },
    description: { type: 'string', required: false },
    price: { type: 'number', required: true, min: 0 },
    stock_quantity: { type: 'number', required: true, min: 0 },
    category: { type: 'string', required: true },
    image_url: { type: 'string', required: false },
    available_online: { type: 'boolean', required: false },
    available_in_store: { type: 'boolean', required: false }
  },
  
  // Order schemas
  orderCreate: {
    shipping_address: { type: 'string', required: true },
    payment_method: { type: 'string', required: true },
    order_type: { type: 'string', required: false }
  }
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams,
  schemas
};