/**
 * Utility functions for array and object manipulation
 */

/**
 * Group an array of objects by a key
 * 
 * @param {Array} array - Array to group
 * @param {string|Function} key - Key to group by or function that returns the key
 * @returns {Object} - Grouped object
 * 
 * @example
 * groupBy([{type: 'A', value: 1}, {type: 'B', value: 2}, {type: 'A', value: 3}], 'type')
 * // {A: [{type: 'A', value: 1}, {type: 'A', value: 3}], B: [{type: 'B', value: 2}]}
 */
export const groupBy = (array, key) => {
  if (!array || !array.length) return {};
  
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    
    // Create the group if it doesn't exist
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    // Add the item to the group
    result[groupKey].push(item);
    
    return result;
  }, {});
};

/**
 * Sort an array of objects by a key
 * 
 * @param {Array} array - Array to sort
 * @param {string|Function} key - Key to sort by or function that returns the value to sort by
 * @param {string} direction - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns {Array} - Sorted array
 */
export const sortBy = (array, key, direction = 'asc') => {
  if (!array || !array.length) return [];
  
  const sortedArray = [...array];
  const directionMultiplier = direction.toLowerCase() === 'desc' ? -1 : 1;
  
  return sortedArray.sort((a, b) => {
    const valueA = typeof key === 'function' ? key(a) : a[key];
    const valueB = typeof key === 'function' ? key(b) : b[key];
    
    if (valueA === valueB) return 0;
    
    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return directionMultiplier * valueA.localeCompare(valueB);
    }
    
    // Handle number comparison
    return directionMultiplier * (valueA < valueB ? -1 : 1);
  });
};

/**
 * Filter an array of objects by a predicate
 * 
 * @param {Array} array - Array to filter
 * @param {Object|Function} predicate - Filter predicate object or function
 * @returns {Array} - Filtered array
 * 
 * @example
 * // Filter by object (exact match)
 * filterBy([{a: 1, b: 2}, {a: 2, b: 2}], {b: 2})
 * // [{a: 1, b: 2}, {a: 2, b: 2}]
 * 
 * // Filter by function
 * filterBy([{a: 1, b: 2}, {a: 2, b: 2}], item => item.a > 1)
 * // [{a: 2, b: 2}]
 */
export const filterBy = (array, predicate) => {
  if (!array || !array.length) return [];
  
  if (typeof predicate === 'function') {
    return array.filter(predicate);
  }
  
  if (typeof predicate === 'object' && predicate !== null) {
    return array.filter(item => {
      return Object.entries(predicate).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  return array;
};

/**
 * Find an object in an array by a predicate
 * 
 * @param {Array} array - Array to search
 * @param {Object|Function} predicate - Search predicate object or function
 * @returns {Object|undefined} - Found object or undefined
 */
export const findBy = (array, predicate) => {
  if (!array || !array.length) return undefined;
  
  if (typeof predicate === 'function') {
    return array.find(predicate);
  }
  
  if (typeof predicate === 'object' && predicate !== null) {
    return array.find(item => {
      return Object.entries(predicate).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
  
  return undefined;
};

/**
 * Map an array of objects to a new array with selected properties
 * 
 * @param {Array} array - Array to map
 * @param {Array|string} props - Properties to select
 * @returns {Array} - Mapped array
 * 
 * @example
 * pluck([{a: 1, b: 2}, {a: 3, b: 4}], 'a')
 * // [1, 3]
 * 
 * pluck([{a: 1, b: 2}, {a: 3, b: 4}], ['a', 'b'])
 * // [{a: 1, b: 2}, {a: 3, b: 4}]
 */
export const pluck = (array, props) => {
  if (!array || !array.length) return [];
  
  if (typeof props === 'string') {
    return array.map(item => item[props]);
  }
  
  if (Array.isArray(props)) {
    return array.map(item => {
      return props.reduce((result, prop) => {
        result[prop] = item[prop];
        return result;
      }, {});
    });
  }
  
  return array;
};

/**
 * Remove duplicate items from an array
 * 
 * @param {Array} array - Array to deduplicate
 * @param {string|Function} [key] - Key to deduplicate by or function that returns the key
 * @returns {Array} - Deduplicated array
 */
export const uniqBy = (array, key) => {
  if (!array || !array.length) return [];
  
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  
  return array.filter(item => {
    const value = typeof key === 'function' ? key(item) : item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

/**
 * Chunk an array into smaller arrays of a specified size
 * 
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} - Array of chunks
 */
export const chunk = (array, size) => {
  if (!array || !array.length || size <= 0) return [];
  
  const chunks = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
};

/**
 * Flatten a nested array
 * 
 * @param {Array} array - Array to flatten
 * @param {number} depth - Maximum recursion depth (default: Infinity)
 * @returns {Array} - Flattened array
 */
export const flatten = (array, depth = Infinity) => {
  if (!array || !array.length) return [];
  
  return array.flat(depth);
};

/**
 * Create an object from an array using a key and value mapper
 * 
 * @param {Array} array - Array to convert
 * @param {string|Function} keyMapper - Key mapper
 * @param {string|Function} [valueMapper] - Value mapper (default: identity)
 * @returns {Object} - Resulting object
 * 
 * @example
 * keyBy([{id: 1, name: 'A'}, {id: 2, name: 'B'}], 'id')
 * // {1: {id: 1, name: 'A'}, 2: {id: 2, name: 'B'}}
 * 
 * keyBy([{id: 1, name: 'A'}, {id: 2, name: 'B'}], 'id', 'name')
 * // {1: 'A', 2: 'B'}
 */
export const keyBy = (array, keyMapper, valueMapper) => {
  if (!array || !array.length) return {};
  
  return array.reduce((result, item) => {
    const key = typeof keyMapper === 'function' ? keyMapper(item) : item[keyMapper];
    
    if (valueMapper) {
      result[key] = typeof valueMapper === 'function' ? valueMapper(item) : item[valueMapper];
    } else {
      result[key] = item;
    }
    
    return result;
  }, {});
};

/**
 * Deep merge multiple objects
 * 
 * @param {...Object} objects - Objects to merge
 * @returns {Object} - Merged object
 */
export const deepMerge = (...objects) => {
  return objects.reduce((result, obj) => {
    if (!obj) return result;
    
    Object.keys(obj).forEach(key => {
      const resultValue = result[key];
      const objValue = obj[key];
      
      if (Array.isArray(resultValue) && Array.isArray(objValue)) {
        result[key] = [...resultValue, ...objValue];
      } else if (
        typeof resultValue === 'object' && 
        resultValue !== null && 
        typeof objValue === 'object' && 
        objValue !== null
      ) {
        result[key] = deepMerge(resultValue, objValue);
      } else {
        result[key] = objValue;
      }
    });
    
    return result;
  }, {});
};

export default {
  groupBy,
  sortBy,
  filterBy,
  findBy,
  pluck,
  uniqBy,
  chunk,
  flatten,
  keyBy,
  deepMerge
};