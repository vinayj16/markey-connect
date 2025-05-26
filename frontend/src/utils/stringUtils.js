/**
 * Utility functions for string manipulation
 */

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 * 
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} ellipsis - Ellipsis string (default: '...')
 * @returns {string} - Truncated string
 */
export const truncate = (str, maxLength, ellipsis = '...') => {
  if (!str) return '';
  
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Capitalize the first letter of a string
 * 
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Capitalize the first letter of each word in a string
 * 
 * @param {string} str - The string to capitalize
 * @returns {string} - String with each word capitalized
 */
export const titleCase = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert a string to camelCase
 * 
 * @param {string} str - The string to convert
 * @returns {string} - camelCase string
 */
export const camelCase = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

/**
 * Convert a string to snake_case
 * 
 * @param {string} str - The string to convert
 * @returns {string} - snake_case string
 */
export const snakeCase = (str) => {
  if (!str) return '';
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
};

/**
 * Convert a string to kebab-case
 * 
 * @param {string} str - The string to convert
 * @returns {string} - kebab-case string
 */
export const kebabCase = (str) => {
  if (!str) return '';
  
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Strip HTML tags from a string
 * 
 * @param {string} html - HTML string
 * @returns {string} - String without HTML tags
 */
export const stripHtml = (html) => {
  if (!html) return '';
  
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Generate a random string
 * 
 * @param {number} length - Length of the random string
 * @param {string} chars - Characters to use (default: alphanumeric)
 * @returns {string} - Random string
 */
export const randomString = (length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
  let result = '';
  const charsLength = chars.length;
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  }
  
  return result;
};

/**
 * Check if a string is a valid email
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(email);
};

/**
 * Check if a string is a valid URL
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether the URL is valid
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Format a string with placeholders
 * 
 * @param {string} template - Template string with {placeholders}
 * @param {Object} values - Values to replace placeholders with
 * @returns {string} - Formatted string
 * 
 * @example
 * formatString('Hello, {name}!', { name: 'World' }) // 'Hello, World!'
 */
export const formatString = (template, values) => {
  if (!template) return '';
  
  return template.replace(/{([^{}]*)}/g, (match, key) => {
    const value = values[key];
    return value !== undefined ? value : match;
  });
};

/**
 * Slugify a string (convert to URL-friendly format)
 * 
 * @param {string} str - String to slugify
 * @returns {string} - Slugified string
 */
export const slugify = (str) => {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export default {
  truncate,
  capitalize,
  titleCase,
  camelCase,
  snakeCase,
  kebabCase,
  stripHtml,
  randomString,
  isValidEmail,
  isValidUrl,
  formatString,
  slugify
};