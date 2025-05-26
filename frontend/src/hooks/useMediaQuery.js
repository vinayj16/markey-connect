import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorBoundary } from './useErrorBoundary';

/**
 * Custom hook for responsive design with media queries
 * 
 * @param {string|string[]} query - CSS media query string or array of queries
 * @param {Object} options - Additional options
 * @param {boolean} options.defaultValue - Default value if window is undefined
 * @param {boolean} options.initializeWithValue - Whether to initialize with current value
 * @param {Function} options.onChange - Callback when media query changes
 * @param {Function} options.onError - Callback when error occurs
 * @returns {boolean|boolean[]} - Whether the media query matches
 * 
 * @example
 * // Check if screen is at least medium size
 * const isMediumScreen = useMediaQuery('(min-width: 768px)');
 * 
 * // Check multiple queries
 * const [isDark, isReducedMotion] = useMediaQuery([
 *   '(prefers-color-scheme: dark)',
 *   '(prefers-reduced-motion: reduce)'
 * ]);
 */
const useMediaQuery = (query, {
  defaultValue = false,
  initializeWithValue = true,
  onChange = () => {},
  onError = () => {},
  ...restOptions
} = {}) => {
  const mediaQueryListRef = useRef([]);
  const isMountedRef = useRef(true);

  // Initialize error boundary
  const { handleError } = useErrorBoundary({
    componentName: 'useMediaQuery',
    onError: (err) => {
      onError(err);
    }
  });

  // Get initial matches state
  const getMatches = useCallback((queries) => {
    if (typeof window === 'undefined') {
      return Array.isArray(queries) 
        ? queries.map(() => defaultValue)
        : defaultValue;
    }

    try {
      if (Array.isArray(queries)) {
        return queries.map(q => window.matchMedia(q).matches);
      }
      return window.matchMedia(queries).matches;
    } catch (error) {
      handleError(error);
      return Array.isArray(queries) 
        ? queries.map(() => defaultValue)
        : defaultValue;
    }
  }, [defaultValue, handleError]);

  // Initialize state
  const [matches, setMatches] = useState(() => 
    initializeWithValue ? getMatches(query) : defaultValue
  );

  // Update matches state when media queries change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const queries = Array.isArray(query) ? query : [query];
      const mediaQueryLists = queries.map(q => window.matchMedia(q));
      mediaQueryListRef.current = mediaQueryLists;

      // Handle change event
      const handleChange = () => {
        if (!isMountedRef.current) return;

        const newMatches = mediaQueryLists.map(mql => mql.matches);
        setMatches(Array.isArray(query) ? newMatches : newMatches[0]);
        onChange(Array.isArray(query) ? newMatches : newMatches[0]);
      };

      // Set up event listeners
      mediaQueryLists.forEach(mql => {
        if (mql.addEventListener) {
          mql.addEventListener('change', handleChange);
        } else {
          // Fallback for older browsers
          mql.addListener(handleChange);
        }
      });

      // Call once initially to set the initial state
      if (initializeWithValue) {
        handleChange();
      }

      // Clean up
      return () => {
        mediaQueryLists.forEach(mql => {
          if (mql.removeEventListener) {
            mql.removeEventListener('change', handleChange);
          } else {
            // Fallback for older browsers
            mql.removeListener(handleChange);
          }
        });
      };
    } catch (error) {
      handleError(error);
    }
  }, [query, initializeWithValue, onChange, handleError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return matches;
};

/**
 * Predefined breakpoints for common screen sizes
 */
export const breakpoints = {
  // Mobile first
  xs: '(max-width: 575.98px)',
  sm: '(min-width: 576px) and (max-width: 767.98px)',
  md: '(min-width: 768px) and (max-width: 991.98px)',
  lg: '(min-width: 992px) and (max-width: 1199.98px)',
  xl: '(min-width: 1200px)',
  xxl: '(min-width: 1400px)',

  // Up breakpoints
  smAndUp: '(min-width: 576px)',
  mdAndUp: '(min-width: 768px)',
  lgAndUp: '(min-width: 992px)',
  xlAndUp: '(min-width: 1200px)',
  xxlAndUp: '(min-width: 1400px)',

  // Down breakpoints
  xsAndDown: '(max-width: 575.98px)',
  smAndDown: '(max-width: 767.98px)',
  mdAndDown: '(max-width: 991.98px)',
  lgAndDown: '(max-width: 1199.98px)',
  xlAndDown: '(max-width: 1399.98px)',

  // Orientation
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  // Color scheme
  darkMode: '(prefers-color-scheme: dark)',
  lightMode: '(prefers-color-scheme: light)',

  // Motion
  reducedMotion: '(prefers-reduced-motion: reduce)',
  noPreferenceMotion: '(prefers-reduced-motion: no-preference)',

  // Display
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  hover: '(hover: hover)',
  noHover: '(hover: none)',
  pointer: '(pointer: fine)',
  coarsePointer: '(pointer: coarse)',

  // Print
  print: 'print',
  screen: 'screen',

  // Contrast
  highContrast: '(prefers-contrast: high)',
  lowContrast: '(prefers-contrast: low)',
  noPreferenceContrast: '(prefers-contrast: no-preference)',

  // Forced colors
  forcedColors: '(forced-colors: active)',
  noForcedColors: '(forced-colors: none)',

  // Inverted colors
  invertedColors: '(inverted-colors: inverted)',
  noInvertedColors: '(inverted-colors: none)',

  // Scripting
  noScript: '(scripting: none)',
  initialOnly: '(scripting: initial-only)',
  enabled: '(scripting: enabled)'
};

/**
 * Hook for using predefined breakpoints
 * 
 * @param {string|string[]} breakpointKey - Key or array of keys from the breakpoints object
 * @param {Object} options - Additional options for useMediaQuery
 * @returns {boolean|boolean[]} - Whether the breakpoint matches
 * 
 * @example
 * // Check if screen is at least medium size
 * const isMediumUp = useBreakpoint('mdAndUp');
 * 
 * // Check multiple breakpoints
 * const [isDark, isReducedMotion] = useBreakpoint(['darkMode', 'reducedMotion']);
 */
export const useBreakpoint = (breakpointKey, options = {}) => {
  const { onError = () => {} } = options;

  const getQueries = useCallback((keys) => {
    const queries = Array.isArray(keys) ? keys : [keys];
    const invalidKeys = queries.filter(key => !breakpoints[key]);

    if (invalidKeys.length > 0) {
      const error = new Error(
        `Invalid breakpoint keys: ${invalidKeys.join(', ')}. Available keys: ${Object.keys(breakpoints).join(', ')}`
      );
      onError(error);
      return [];
    }

    return queries.map(key => breakpoints[key]);
  }, [onError]);

  const queries = getQueries(breakpointKey);
  return useMediaQuery(queries, options);
};

export default useMediaQuery;