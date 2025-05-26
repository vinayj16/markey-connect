/**
 * Logs an error to the console and optionally to a remote logging service
 * @param {Error} error - The error to log
 * @param {Object} errorInfo - Additional error information (e.g., component stack)
 * @param {string} [componentName] - Name of the component where the error occurred
 */
export const logError = (error, errorInfo = {}, componentName = 'Unknown') => {
  const errorData = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    component: componentName,
    location: window.location.href,
    timestamp: new Date().toISOString(),
    ...errorInfo,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`Error in ${componentName}`);
    console.error('Error:', error);
    if (errorInfo.componentStack) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();
  }

  // In production, you would send this to your error tracking service
  // Example: sendToErrorTrackingService(errorData);
};

/**
 * Creates a custom error handler function
 * @param {string} componentName - Name of the component for error context
 * @returns {Function} - Error handler function
 */
export const createErrorHandler = (componentName) => {
  return (error, errorInfo) => {
    logError(error, errorInfo, componentName);
  };
};
