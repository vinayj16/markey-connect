import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorBoundary } from './useErrorBoundary';

/**
 * Custom hook for using localStorage with React state
 * 
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if no value exists in localStorage
 * @param {Object} options - Additional options
 * @param {boolean} options.serialize - Whether to serialize the value (default: true)
 * @param {Function} options.serializer - Custom serializer function
 * @param {Function} options.deserializer - Custom deserializer function
 * @param {boolean} options.sync - Whether to sync across tabs (default: true)
 * @param {Function} options.onError - Error callback function
 * @param {Function} options.onChange - Change callback function
 * @param {number} options.debounceTime - Time in ms to debounce updates (default: 0)
 * @returns {Array} - [storedValue, setValue, removeValue, clearAll]
 */
const useLocalStorage = (key, initialValue, {
  serialize = true,
  serializer = JSON.stringify,
  deserializer = JSON.parse,
  sync = true,
  onError = () => {},
  onChange = () => {},
  debounceTime = 0,
  ...restOptions
} = {}) => {
  const updateTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Initialize error boundary
  const { handleError } = useErrorBoundary({
    componentName: 'useLocalStorage',
    onError: (err) => {
      onError(err);
    }
  });

  // Get from localStorage then parse stored json or return initialValue
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return initialValue;

      return serialize ? deserializer(item) : item;
    } catch (error) {
      handleError(error);
      return initialValue;
    }
  }, [initialValue, key, serialize, deserializer, handleError]);

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      if (!isMountedRef.current) return;

      if (typeof window === 'undefined') {
        handleError(new Error(`Tried setting localStorage key "${key}" even though environment is not a browser`));
        return;
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Debounce the localStorage update if needed
        if (debounceTime > 0) {
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            // Save to localStorage
            const valueToSave = serialize ? serializer(valueToStore) : valueToStore;
            window.localStorage.setItem(key, valueToSave);
            
            // Dispatch a custom event so other instances can update
            if (sync) {
              window.dispatchEvent(new StorageEvent('local-storage', {
                key,
                newValue: valueToSave,
                oldValue: window.localStorage.getItem(key)
              }));
            }
            
            // Call onChange callback
            onChange(valueToStore, storedValue);
          }, debounceTime);
        } else {
          // Save to localStorage immediately
          const valueToSave = serialize ? serializer(valueToStore) : valueToStore;
          window.localStorage.setItem(key, valueToSave);
          
          // Dispatch a custom event so other instances can update
          if (sync) {
            window.dispatchEvent(new StorageEvent('local-storage', {
              key,
              newValue: valueToSave,
              oldValue: window.localStorage.getItem(key)
            }));
          }
          
          // Call onChange callback
          onChange(valueToStore, storedValue);
        }
      } catch (error) {
        handleError(error);
      }
    },
    [key, storedValue, serialize, serializer, sync, onChange, debounceTime, handleError]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    if (!isMountedRef.current) return;

    if (typeof window === 'undefined') {
      handleError(new Error(`Tried removing localStorage key "${key}" even though environment is not a browser`));
      return;
    }

    try {
      // Remove from localStorage
      window.localStorage.removeItem(key);
      
      // Reset state
      setStoredValue(initialValue);
      
      // Dispatch a custom event so other instances can update
      if (sync) {
        window.dispatchEvent(new StorageEvent('local-storage', {
          key,
          newValue: null,
          oldValue: window.localStorage.getItem(key)
        }));
      }
      
      // Call onChange callback
      onChange(initialValue, storedValue);
    } catch (error) {
      handleError(error);
    }
  }, [initialValue, key, sync, onChange, storedValue, handleError]);

  // Clear all localStorage items
  const clearAll = useCallback(() => {
    if (!isMountedRef.current) return;

    if (typeof window === 'undefined') {
      handleError(new Error('Tried clearing localStorage even though environment is not a browser'));
      return;
    }

    try {
      // Clear localStorage
      window.localStorage.clear();
      
      // Reset state
      setStoredValue(initialValue);
      
      // Dispatch a custom event so other instances can update
      if (sync) {
        window.dispatchEvent(new StorageEvent('local-storage', {
          key: null,
          newValue: null,
          oldValue: null
        }));
      }
      
      // Call onChange callback
      onChange(initialValue, storedValue);
    } catch (error) {
      handleError(error);
    }
  }, [initialValue, sync, onChange, storedValue, handleError]);

  // Listen for changes to this localStorage key in other documents
  useEffect(() => {
    if (!sync) return;

    const handleStorageChange = (event) => {
      if (event.key === key || event.key === null) {
        setStoredValue(readValue());
      }
    };
    
    // Listen for changes in other tabs
    window.addEventListener('storage', handleStorageChange);
    // Listen for changes in the current tab
    window.addEventListener('local-storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, readValue, sync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return [storedValue, setValue, removeValue, clearAll];
};

export default useLocalStorage;