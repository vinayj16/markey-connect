import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorBoundary } from './useErrorBoundary';

/**
 * Custom hook for form handling with validation
 * 
 * @param {Object} options - Hook options
 * @param {Object} options.initialValues - Initial form values
 * @param {Function} options.validate - Validation function
 * @param {Function} options.onSubmit - Form submission handler
 * @param {boolean} options.validateOnChange - Whether to validate on change
 * @param {boolean} options.validateOnBlur - Whether to validate on blur
 * @param {boolean} options.validateOnMount - Whether to validate on mount
 * @param {number} options.debounceTime - Time in ms to debounce validation
 * @param {boolean} options.trackDirtyFields - Whether to track dirty fields
 * @param {Function} options.onValuesChange - Callback when values change
 * @param {Function} options.onErrorsChange - Callback when errors change
 * @param {Function} options.onTouchedChange - Callback when touched state changes
 * @returns {Object} - Form handling methods and state
 */
const useForm = ({
  initialValues = {},
  validate = () => ({}),
  onSubmit = () => {},
  validateOnChange = false,
  validateOnBlur = true,
  validateOnMount = false,
  debounceTime = 300,
  trackDirtyFields = true,
  onValuesChange = () => {},
  onErrorsChange = () => {},
  onTouchedChange = () => {},
  ...restOptions
} = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [dirtyFields, setDirtyFields] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef(null);

  // Initialize error boundary
  const { handleError, resetError } = useErrorBoundary({
    componentName: 'useForm',
    onError: (err) => {
      setErrors(prev => ({ ...prev, _form: err.message }));
    }
  });

  // Validate form values with debounce
  const validateForm = useCallback((valuesToValidate = values) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    return new Promise((resolve) => {
      validationTimeoutRef.current = setTimeout(async () => {
        try {
          setIsValidating(true);
          const validationErrors = await validate(valuesToValidate);
          setErrors(validationErrors);
          onErrorsChange(validationErrors);
          resolve(Object.keys(validationErrors).length === 0);
        } catch (err) {
          handleError(err);
          resolve(false);
        } finally {
          setIsValidating(false);
        }
      }, debounceTime);
    });
  }, [values, validate, debounceTime, onErrorsChange, handleError]);

  // Check form validity when errors change
  useEffect(() => {
    setIsValid(Object.keys(errors).length === 0);
  }, [errors]);

  // Initial validation on mount
  useEffect(() => {
    if (validateOnMount) {
      validateForm();
    }
  }, [validateOnMount, validateForm]);

  // Handle field change
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prevValues => {
      const newValues = {
        ...prevValues,
        [name]: fieldValue
      };
      onValuesChange(newValues);
      return newValues;
    });
    
    if (trackDirtyFields) {
      setDirtyFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateForm({ ...values, [name]: fieldValue });
    }
  }, [values, validateOnChange, validateForm, trackDirtyFields, onValuesChange]);

  // Handle field blur
  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    
    setTouched(prevTouched => {
      const newTouched = {
        ...prevTouched,
        [name]: true
      };
      onTouchedChange(newTouched);
      return newTouched;
    });
    
    if (validateOnBlur) {
      validateForm();
    }
  }, [validateOnBlur, validateForm, onTouchedChange]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }
    
    resetError();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((touched, field) => {
      touched[field] = true;
      return touched;
    }, {});
    setTouched(allTouched);
    onTouchedChange(allTouched);
    
    const isFormValid = await validateForm();
    
    if (isFormValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        handleError(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validateForm, onSubmit, handleError, resetError, onTouchedChange]);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirtyFields({});
    setIsSubmitting(false);
    setIsDirty(false);
    setIsValidating(false);
    resetError();
    onValuesChange(initialValues);
    onErrorsChange({});
    onTouchedChange({});
  }, [initialValues, resetError, onValuesChange, onErrorsChange, onTouchedChange]);

  // Set a specific field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prevValues => {
      const newValues = {
        ...prevValues,
        [name]: value
      };
      onValuesChange(newValues);
      return newValues;
    });
    
    if (trackDirtyFields) {
      setDirtyFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateForm({ ...values, [name]: value });
    }
  }, [values, validateOnChange, validateForm, trackDirtyFields, onValuesChange]);

  // Set multiple field values at once
  const setMultipleValues = useCallback((newValues) => {
    setValues(prevValues => {
      const updatedValues = {
        ...prevValues,
        ...newValues
      };
      onValuesChange(updatedValues);
      return updatedValues;
    });
    
    if (trackDirtyFields) {
      setDirtyFields(prev => ({
        ...prev,
        ...Object.keys(newValues).reduce((dirty, field) => {
          dirty[field] = true;
          return dirty;
        }, {})
      }));
    }
    
    setIsDirty(true);
    
    if (validateOnChange) {
      validateForm({ ...values, ...newValues });
    }
  }, [values, validateOnChange, validateForm, trackDirtyFields, onValuesChange]);

  // Set a specific field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prevErrors => {
      const newErrors = {
        ...prevErrors,
        [name]: error
      };
      onErrorsChange(newErrors);
      return newErrors;
    });
  }, [onErrorsChange]);

  // Check if a field has an error and has been touched
  const hasError = useCallback((name) => {
    return Boolean(touched[name] && errors[name]);
  }, [touched, errors]);

  // Get the error message for a field
  const getError = useCallback((name) => {
    return hasError(name) ? errors[name] : '';
  }, [hasError, errors]);

  // Check if a field is dirty
  const isFieldDirty = useCallback((name) => {
    return trackDirtyFields ? Boolean(dirtyFields[name]) : isDirty;
  }, [trackDirtyFields, dirtyFields, isDirty]);

  return {
    values,
    errors,
    touched,
    dirtyFields,
    isSubmitting,
    isValid,
    isDirty,
    isValidating,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setMultipleValues,
    setFieldError,
    hasError,
    getError,
    isFieldDirty,
    validateForm,
    ...restOptions
  };
};

export default useForm;