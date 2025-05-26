// Form validation utility functions

export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  const re = /^\+?[1-9]\d{9,14}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

/**
 * Validates form data against a set of rules
 * @param {Object} formData - The form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - Validation errors
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    // Required validation
    if (fieldRules.required && (!value || value.trim() === '')) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
    }

    // Min length validation
    if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${fieldRules.minLength} characters`;
    }

    // Max length validation
    if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${fieldRules.maxLength} characters`;
    }

    // Email validation
    if (value && fieldRules.isEmail && !/\S+@\S+\.\S+/.test(value)) {
      errors[field] = 'Please enter a valid email address';
    }

    // Number validation
    if (value && fieldRules.isNumber && isNaN(Number(value))) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be a number`;
    }

    // Min value validation
    if (value && fieldRules.min !== undefined && Number(value) < fieldRules.min) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${fieldRules.min}`;
    }

    // Max value validation
    if (value && fieldRules.max !== undefined && Number(value) > fieldRules.max) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be less than ${fieldRules.max}`;
    }

    // Pattern validation
    if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
      errors[field] = fieldRules.message || `${field.charAt(0).toUpperCase() + field.slice(1)} is invalid`;
    }

    // Custom validation
    if (value && fieldRules.validate) {
      const customError = fieldRules.validate(value, formData);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
};

/**
 * Formats a price value to a currency string
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} - Formatted price
 */
export const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(price);
};
