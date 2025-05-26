/**
 * Utility functions for currency formatting and calculations
 */

/**
 * Format a number as currency
 * 
 * @param {number} amount - The amount to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (default: 'USD')
 * @param {string} options.locale - Locale for formatting (default: browser locale)
 * @param {boolean} options.showSymbol - Whether to show the currency symbol (default: true)
 * @param {number} options.decimalPlaces - Number of decimal places (default: 2)
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const {
    currency = 'USD',
    locale = navigator.language,
    showSymbol = true,
    decimalPlaces = 2
  } = options;
  
  if (amount === null || amount === undefined) {
    return '';
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency: showSymbol ? currency : undefined,
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(amount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${amount.toFixed(decimalPlaces)}`;
  }
};

/**
 * Calculate discount amount
 * 
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} - Discount amount
 */
export const calculateDiscountAmount = (originalPrice, discountPercent) => {
  if (!originalPrice || !discountPercent) return 0;
  return (originalPrice * discountPercent) / 100;
};

/**
 * Calculate discounted price
 * 
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} - Discounted price
 */
export const calculateDiscountedPrice = (originalPrice, discountPercent) => {
  if (!originalPrice) return 0;
  if (!discountPercent) return originalPrice;
  
  const discountAmount = calculateDiscountAmount(originalPrice, discountPercent);
  return originalPrice - discountAmount;
};

/**
 * Calculate discount percentage
 * 
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {number} - Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || !discountedPrice || originalPrice <= 0) return 0;
  
  const discountAmount = originalPrice - discountedPrice;
  return Math.round((discountAmount / originalPrice) * 100);
};

/**
 * Calculate tax amount
 * 
 * @param {number} amount - Amount before tax
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} - Tax amount
 */
export const calculateTaxAmount = (amount, taxRate) => {
  if (!amount || !taxRate) return 0;
  return (amount * taxRate) / 100;
};

/**
 * Calculate total with tax
 * 
 * @param {number} amount - Amount before tax
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} - Total amount with tax
 */
export const calculateTotalWithTax = (amount, taxRate) => {
  if (!amount) return 0;
  if (!taxRate) return amount;
  
  const taxAmount = calculateTaxAmount(amount, taxRate);
  return amount + taxAmount;
};

/**
 * Format a price range
 * 
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice, options = {}) => {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice, options);
  }
  
  return `${formatCurrency(minPrice, options)} - ${formatCurrency(maxPrice, options)}`;
};

/**
 * Parse a currency string to a number
 * 
 * @param {string} currencyString - Currency string to parse
 * @returns {number} - Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols, commas, and other non-numeric characters except decimal point
  const numericString = currencyString.replace(/[^0-9.-]/g, '');
  return parseFloat(numericString);
};

export default {
  formatCurrency,
  calculateDiscountAmount,
  calculateDiscountedPrice,
  calculateDiscountPercentage,
  calculateTaxAmount,
  calculateTotalWithTax,
  formatPriceRange,
  parseCurrency
};