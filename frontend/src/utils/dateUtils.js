/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to a readable string
 * 
 * @param {Date|string|number} date - The date to format
 * @param {Object} options - Formatting options
 * @param {string} options.format - Format type: 'full', 'long', 'medium', 'short', 'relative'
 * @param {string} options.locale - Locale for formatting (default: browser locale)
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const { format = 'medium', locale = navigator.language } = options;
  
  if (!date) return '';
  
  // Convert to Date object if it's not already
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return '';
  }
  
  // Format as relative time if requested
  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }
  
  // Format options based on requested format
  const formatOptions = getFormatOptions(format);
  
  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toLocaleString();
  }
};

/**
 * Get Intl.DateTimeFormat options based on format type
 * 
 * @param {string} format - Format type
 * @returns {Object} - DateTimeFormat options
 */
const getFormatOptions = (format) => {
  switch (format) {
    case 'full':
      return {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZoneName: 'short'
      };
    case 'long':
      return {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      };
    case 'medium':
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      };
    case 'short':
      return {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      };
    case 'time':
      return {
        hour: 'numeric',
        minute: 'numeric'
      };
    default:
      return {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
  }
};

/**
 * Format a date as a relative time string (e.g., "2 hours ago")
 * 
 * @param {Date} date - The date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);
  
  if (diffSec < 5) {
    return 'just now';
  } else if (diffSec < 60) {
    return `${diffSec} seconds ago`;
  } else if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  } else if (diffHour < 24) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  } else if (diffDay < 30) {
    return diffDay === 1 ? 'yesterday' : `${diffDay} days ago`;
  } else if (diffMonth < 12) {
    return diffMonth === 1 ? '1 month ago' : `${diffMonth} months ago`;
  } else {
    return diffYear === 1 ? '1 year ago' : `${diffYear} years ago`;
  }
};

/**
 * Check if a date is today
 * 
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} - Whether the date is today
 */
export const isToday = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is yesterday
 * 
 * @param {Date|string|number} date - The date to check
 * @returns {boolean} - Whether the date is yesterday
 */
export const isYesterday = (date) => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  );
};

/**
 * Add time to a date
 * 
 * @param {Date|string|number} date - The date to add to
 * @param {number} amount - The amount to add
 * @param {string} unit - The unit to add ('years', 'months', 'days', 'hours', 'minutes', 'seconds')
 * @returns {Date} - The new date
 */
export const addTime = (date, amount, unit) => {
  const dateObj = date instanceof Date ? new Date(date) : new Date(date);
  
  switch (unit) {
    case 'years':
      dateObj.setFullYear(dateObj.getFullYear() + amount);
      break;
    case 'months':
      dateObj.setMonth(dateObj.getMonth() + amount);
      break;
    case 'days':
      dateObj.setDate(dateObj.getDate() + amount);
      break;
    case 'hours':
      dateObj.setHours(dateObj.getHours() + amount);
      break;
    case 'minutes':
      dateObj.setMinutes(dateObj.getMinutes() + amount);
      break;
    case 'seconds':
      dateObj.setSeconds(dateObj.getSeconds() + amount);
      break;
    default:
      console.warn(`Unknown time unit: ${unit}`);
  }
  
  return dateObj;
};

/**
 * Format a date range
 * 
 * @param {Date|string|number} startDate - The start date
 * @param {Date|string|number} endDate - The end date
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date range
 */
export const formatDateRange = (startDate, endDate, options = {}) => {
  const { format = 'medium', locale = navigator.language } = options;
  
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.warn('Invalid date(s) provided to formatDateRange:', { startDate, endDate });
    return '';
  }
  
  // If same day, format differently
  const sameDay = 
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  
  if (sameDay) {
    const dateStr = formatDate(start, { format, locale });
    
    // If format includes time, add the end time
    if (['full', 'long', 'medium'].includes(format)) {
      const startTime = formatDate(start, { format: 'time', locale });
      const endTime = formatDate(end, { format: 'time', locale });
      return `${dateStr}, ${startTime} - ${endTime}`;
    }
    
    return dateStr;
  }
  
  // Different days
  return `${formatDate(start, { format, locale })} - ${formatDate(end, { format, locale })}`;
};

export default {
  formatDate,
  formatRelativeTime,
  isToday,
  isYesterday,
  addTime,
  formatDateRange
};