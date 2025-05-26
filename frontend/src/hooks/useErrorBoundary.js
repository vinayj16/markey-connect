import { useState, useCallback, useEffect } from 'react';
import { logError } from '../utils/errorHandling';

/**
 * A custom hook to handle errors in functional components
 * @param {Object} options - Configuration options
 * @param {string} options.componentName - Name of the component for error context
 * @param {Function} options.onError - Callback function when an error occurs
 * @param {Function} options.onReset - Callback function when error is reset
 * @param {boolean} options.resetOnPropsChange - Whether to reset on props change
 * @param {boolean} options.autoReset - Whether to automatically reset after a delay
 * @param {number} options.autoResetDelay - Delay in ms before auto-reset (default: 5000)
 * @param {boolean} options.logToConsole - Whether to log errors to console
 * @param {boolean} options.logToService - Whether to log errors to error tracking service
 * @returns {Object} - Error state and handler functions
 */
const useErrorBoundary = ({
  componentName = 'Unknown',
  onError = null,
  onReset = null,
  resetOnPropsChange = true,
  autoReset = false,
  autoResetDelay = 5000,
  logToConsole = process.env.NODE_ENV === 'development',
  logToService = process.env.NODE_ENV === 'production',
  ...restOptions
} = {}) => {
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  /**
   * Handle errors from the component
   * @param {Error} error - The error that occurred
   * @param {Object} errorInfo - Additional error information
   */
  const handleError = useCallback((error, errorInfo = {}) => {
    // Prevent duplicate error handling
    if (error === null) return;

    // Log the error with component context
    if (logToConsole) {
      console.error(`Error in ${componentName}:`, error);
      console.error('Error Info:', errorInfo);
    }

    if (logToService) {
      logError(error, errorInfo, componentName);
    }
    
    // Update state
    setError(error);
    setErrorInfo(errorInfo);
    
    // Call the onError callback if provided
    if (typeof onError === 'function') {
      onError(error, errorInfo);
    }

    // Auto reset if enabled
    if (autoReset) {
      setIsResetting(true);
      setTimeout(() => {
        resetError();
        setIsResetting(false);
      }, autoResetDelay);
    }
  }, [componentName, onError, logToConsole, logToService, autoReset, autoResetDelay]);

  /**
   * Reset the error state
   */
  const resetError = useCallback(() => {
    if (error === null) return;

    setError(null);
    setErrorInfo(null);
    
    // Call the onReset callback if provided
    if (typeof onReset === 'function') {
      onReset();
    }
  }, [error, onReset]);

  /**
   * Handle async errors
   * @param {Promise} promise - The promise to handle
   * @returns {Promise} - The handled promise
   */
  const handleAsyncError = useCallback(async (promise) => {
    try {
      return await promise;
    } catch (error) {
      handleError(error);
      throw error; // Re-throw to allow caller to handle
    }
  }, [handleError]);

  /**
   * Handle error boundary errors
   * @param {Error} error - The error that occurred
   * @param {Object} errorInfo - Additional error information
   */
  const handleBoundaryError = useCallback((error, errorInfo) => {
    handleError(error, errorInfo);
  }, [handleError]);

  // Reset error state when component unmounts
  useEffect(() => {
    return () => {
      if (error !== null) {
        resetError();
      }
    };
  }, [error, resetError]);

  return {
    error,
    errorInfo,
    hasError: error !== null,
    isResetting,
    handleError,
    handleAsyncError,
    handleBoundaryError,
    resetError,
    ...restOptions
  };
};

export default useErrorBoundary;
