import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';
import { useErrorBoundary } from './useErrorBoundary';

/**
 * Custom hook for data fetching with loading and error states
 * 
 * @param {string} url - The API endpoint to fetch from
 * @param {Object} options - Additional options for the fetch
 * @param {Object} options.params - URL parameters for the request
 * @param {boolean} options.immediate - Whether to fetch immediately on mount
 * @param {Array} options.dependencies - Dependencies array for refetching
 * @param {Function} options.onSuccess - Callback function on successful fetch
 * @param {Function} options.onError - Callback function on fetch error
 * @param {number} options.cacheTime - Time in ms to cache the results (0 = no cache)
 * @param {boolean} options.retryOnError - Whether to retry on error
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.retryDelay - Delay between retries in ms
 * @param {boolean} options.abortOnUnmount - Whether to abort request on unmount
 * @param {Object} options.headers - Additional headers for the request
 * @param {string} options.method - HTTP method (default: 'GET')
 * @param {Object} options.body - Request body for non-GET requests
 * @returns {Object} - { data, loading, error, refetch, setData, abort }
 */
const useFetch = (url, {
  params = {},
  immediate = true,
  dependencies = [],
  onSuccess = () => {},
  onError = () => {},
  cacheTime = 0,
  retryOnError = false,
  maxRetries = 3,
  retryDelay = 1000,
  abortOnUnmount = true,
  headers = {},
  method = 'GET',
  body = null,
  ...restOptions
} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);
  const cacheKeyRef = useRef(null);

  // Initialize error boundary
  const { handleError, resetError } = useErrorBoundary({
    componentName: 'useFetch',
    onError: (err) => {
      setError(err);
      onError(err);
    },
    onReset: () => {
      setError(null);
      setRetryCount(0);
    }
  });

  // Create a cache key from the URL and params
  const getCacheKey = useCallback(() => {
    return `${url}:${method}:${JSON.stringify(params)}:${JSON.stringify(body)}`;
  }, [url, method, params, body]);

  // Check if we have a valid cached response
  const getCache = useCallback(() => {
    if (!cacheTime) return null;
    
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(`fetch_cache:${cacheKey}`);
      
      if (!cached) return null;
      
      const { data: cachedData, timestamp: cachedTime } = JSON.parse(cached);
      const isExpired = Date.now() - cachedTime > cacheTime;
      
      if (isExpired) {
        localStorage.removeItem(`fetch_cache:${cacheKey}`);
        return null;
      }
      
      return cachedData;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [cacheTime, getCacheKey, handleError]);

  // Set cache
  const setCache = useCallback((data) => {
    if (!cacheTime) return;
    
    try {
      const cacheKey = getCacheKey();
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      
      localStorage.setItem(`fetch_cache:${cacheKey}`, JSON.stringify(cacheData));
    } catch (err) {
      handleError(err);
    }
  }, [cacheTime, getCacheKey, handleError]);

  // Fetch data function
  const fetchData = useCallback(async (skipCache = false) => {
    // Reset error state
    resetError();
    setLoading(true);
    setError(null);
    
    // Create new AbortController
    if (abortOnUnmount) {
      abortControllerRef.current = new AbortController();
    }
    
    try {
      // Check cache first if not skipping
      if (!skipCache && cacheTime > 0) {
        const cachedData = getCache();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          onSuccess(cachedData);
          return;
        }
      }
      
      // Make the API request
      const response = await api.request({
        url,
        method,
        params,
        data: body,
        headers,
        signal: abortControllerRef.current?.signal,
        ...restOptions
      });
      
      // Update state with the response
      setData(response);
      setTimestamp(Date.now());
      setRetryCount(0);
      
      // Cache the response if needed
      if (cacheTime > 0) {
        setCache(response);
      }
      
      // Call the success callback
      onSuccess(response);
    } catch (err) {
      // Handle abort error
      if (err.name === 'AbortError') {
        return;
      }

      // Handle retry logic
      if (retryOnError && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchData(skipCache);
        }, retryDelay * (retryCount + 1));
        return;
      }

      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [
    url,
    method,
    params,
    body,
    headers,
    cacheTime,
    getCache,
    setCache,
    onSuccess,
    handleError,
    resetError,
    retryOnError,
    maxRetries,
    retryCount,
    retryDelay,
    abortOnUnmount,
    ...dependencies
  ]);

  // Abort function
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Initial fetch on mount and when dependencies change
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (abortOnUnmount) {
        abort();
      }
    };
  }, [immediate, fetchData, abort, abortOnUnmount, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: (skipCache = false) => fetchData(skipCache),
    setData,
    timestamp,
    abort,
    retryCount,
    isRetrying: retryCount > 0
  };
};

export default useFetch;