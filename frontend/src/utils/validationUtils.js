/**
 * Utility functions for form validation
 */

/**
 * Validate that a value is not empty
 * 
 * @param {any} value - The value to validate
 * @param {string} message - Custom error message
 * @returns {string|undefined} - Error message if invalid, undefined if valid
 */
export const required = (value, message = 'This field is required') => {
  if (value === undefined || value === null || value === '') {
    return message;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return message;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return message;
  }
  
  return undefined;
};

/**
 * Validate that a value is a valid email address
 * 
 * @param {string} value - The value to validate
 * @param {string} message - Custom error message
 * @returns {string|undefined} - Error message if invalid, undefined if valid
 */
export const email = (value, message = 'Please enter a valid email address') => {
  if (!value) return undefined;
  
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  
  if (!emailRegex.test(value)) {
    return message;
  }
  
  return undefined;
};

/**
 * Validate that a value has a minimum length
 * 
 * @param {number} min - Minimum length
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const minLength = (min, message) => (value) => {
  if (!value) return undefined;
  
  if (value.length < min) {
    return message || `Must be at least ${min} characters`;
  }
  
  return undefined;
};

/**
 * Validate that a value has a maximum length
 * 
 * @param {number} max - Maximum length
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const maxLength = (max, message) => (value) => {
  if (!value) return undefined;
  
  if (value.length > max) {
    return message || `Must be no more than ${max} characters`;
  }
  
  return undefined;
};

/**
 * Validate that a value matches a pattern
 * 
 * @param {RegExp} pattern - Regular expression pattern
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const pattern = (pattern, message) => (value) => {
  if (!value) return undefined;
  
  if (!pattern.test(value)) {
    return message || 'Invalid format';
  }
  
  return undefined;
};

/**
 * Validate that a value is a number
 * 
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const number = (message = 'Please enter a valid number') => (value) => {
  if (!value) return undefined;
  
  if (isNaN(Number(value))) {
    return message;
  }
  
  return undefined;
};

/**
 * Validate that a value is a minimum number
 * 
 * @param {number} min - Minimum value
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const min = (min, message) => (value) => {
  if (!value) return undefined;
  
  const numberValue = Number(value);
  
  if (isNaN(numberValue) || numberValue < min) {
    return message || `Must be at least ${min}`;
  }
  
  return undefined;
};

/**
 * Validate that a value is a maximum number
 * 
 * @param {number} max - Maximum value
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const max = (max, message) => (value) => {
  if (!value) return undefined;
  
  const numberValue = Number(value);
  
  if (isNaN(numberValue) || numberValue > max) {
    return message || `Must be no more than ${max}`;
  }
  
  return undefined;
};

/**
 * Validate that a value matches another field
 * 
 * @param {string} field - Field to match
 * @param {Object} values - Form values
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const matches = (field, values, message) => (value) => {
  if (!value) return undefined;
  
  if (value !== values[field]) {
    return message || `Must match ${field}`;
  }
  
  return undefined;
};

/**
 * Validate a password strength
 * 
 * @param {Object} options - Validation options
 * @param {boolean} options.requireLowercase - Require lowercase letter
 * @param {boolean} options.requireUppercase - Require uppercase letter
 * @param {boolean} options.requireNumber - Require number
 * @param {boolean} options.requireSpecial - Require special character
 * @param {number} options.minLength - Minimum length
 * @returns {Function} - Validation function
 */
export const passwordStrength = (options = {}) => (value) => {
  if (!value) return undefined;
  
  const {
    requireLowercase = true,
    requireUppercase = true,
    requireNumber = true,
    requireSpecial = true,
    minLength = 8
  } = options;
  
  const errors = [];
  
  if (minLength && value.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireLowercase && !/[a-z]/.test(value)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireUppercase && !/[A-Z]/.test(value)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireNumber && !/\d/.test(value)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors.length > 0 ? errors.join('. ') : undefined;
};

/**
 * Validate a phone number
 * 
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const phone = (message = 'Please enter a valid phone number') => (value) => {
  if (!value) return undefined;
  
  // Basic phone validation - can be adjusted for different formats
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  
  if (!phoneRegex.test(value.replace(/[\s()-]/g, ''))) {
    return message;
  }
  
  return undefined;
};

/**
 * Validate a URL
 * 
 * @param {string} message - Custom error message
 * @returns {Function} - Validation function
 */
export const url = (message = 'Please enter a valid URL') => (value) => {
  if (!value) return undefined;
  
  try {
    new URL(value);
    return undefined;
  } catch (e) {
    return message;
  }
};

/**
 * Combine multiple validators
 * 
 * @param {...Function} validators - Validators to combine
 * @returns {Function} - Combined validation function
 */
export const composeValidators = (...validators) => (value, values) => {
  for (const validator of validators) {
    const error = validator(value, values);
    if (error) {
      return error;
    }
  }
  
  return undefined;
};

/**
 * Create a validation schema for a form
 * 
 * @param {Object} schema - Validation schema
 * @returns {Function} - Validation function for the entire form
 * 
 * @example
 * const validateForm = createValidationSchema({
 *   name: composeValidators(required(), minLength(2)),
 *   email: composeValidators(required(), email()),
 *   password: composeValidators(required(), passwordStrength())
 * });
 */
export const createValidationSchema = (schema) => (values) => {
  const errors = {};
  
  Object.entries(schema).forEach(([field, validator]) => {
    const error = validator(values[field], values);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export default {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  number,
  min,
  max,
  matches,
  passwordStrength,
  phone,
  url,
  composeValidators,
  createValidationSchema
};