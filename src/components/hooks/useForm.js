import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for form state management and validation
 * Designed for Banana Trading Business Management System
 */
const useForm = (initialValues = {}, validationRules = {}, options = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Options with defaults
  const {
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false,
    enableReinitialize = false
  } = options;

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  // Reinitialize form when initialValues change (if enabled)
  useEffect(() => {
    if (enableReinitialize) {
      setValues(initialValues);
      setIsDirty(false);
    }
  }, [initialValues, enableReinitialize]);

  // Validation functions for different field types
  const validators = {
    required: (value, message = 'This field is required') => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return message;
      }
      return null;
    },

    minLength: (min, message) => (value) => {
      if (value && value.length < min) {
        return message || `Minimum ${min} characters required`;
      }
      return null;
    },

    maxLength: (max, message) => (value) => {
      if (value && value.length > max) {
        return message || `Maximum ${max} characters allowed`;
      }
      return null;
    },

    email: (value, message = 'Invalid email format') => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        return message;
      }
      return null;
    },

    phone: (value, message = 'Invalid phone number') => {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (value && !phoneRegex.test(value)) {
        return message;
      }
      return null;
    },

    number: (value, message = 'Must be a valid number') => {
      if (value && isNaN(Number(value))) {
        return message;
      }
      return null;
    },

    positiveNumber: (value, message = 'Must be a positive number') => {
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        return message;
      }
      return null;
    },

    nonZero: (value, message = 'Value cannot be zero') => {
      if (value && Number(value) === 0) {
        return message;
      }
      return null;
    },

    // Custom validator for banana business specific fields
    weight: (value, message = 'Invalid weight format') => {
      if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
        return message;
      }
      return null;
    },

    rate: (value, message = 'Invalid rate') => {
      if (value && (isNaN(Number(value)) || Number(value) < 0)) {
        return message;
      }
      return null;
    }
  };

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Handle array of validation rules
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        let error = null;
        
        if (typeof rule === 'function') {
          error = rule(value);
        } else if (typeof rule === 'object') {
          const { type, params = [], message } = rule;
          if (validators[type]) {
            if (params.length > 0) {
              error = validators[type](...params, message)(value);
            } else {
              error = validators[type](value, message);
            }
          }
        } else if (typeof rule === 'string' && validators[rule]) {
          error = validators[rule](value);
        }

        if (error) return error;
      }
    } else if (typeof rules === 'function') {
      return rules(value);
    }

    return null;
  }, [validationRules]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validateField, validationRules]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setValues(prev => {
      const updated = { ...prev, [name]: newValue };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialValues));
      return updated;
    });

    // Validate on change if enabled
    if (validateOnChange && touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField, validateOnChange, touched, initialValues]);

  // Handle input blur
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur if enabled
    if (validateOnBlur) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField, validateOnBlur]);

  // Set field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => {
      const updated = { ...prev, [name]: value };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialValues));
      return updated;
    });

    // Validate the field if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validateField, touched, initialValues]);

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Set multiple field values
  const setMultipleValues = useCallback((newValues) => {
    setValues(prev => {
      const updated = { ...prev, ...newValues };
      setIsDirty(JSON.stringify(updated) !== JSON.stringify(initialValues));
      return updated;
    });
  }, [initialValues]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit) => {
    return async (e) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      
      // Mark all fields as touched
      const allTouched = {};
      Object.keys(validationRules).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate form
      const isValid = validateForm();

      if (isValid) {
        try {
          await onSubmit(values);
          if (resetOnSubmit) {
            reset();
          }
        } catch (error) {
          console.error('Form submission error:', error);
          // Handle submission errors if needed
        }
      }

      setIsSubmitting(false);
    };
  }, [values, validateForm, resetOnSubmit, reset, validationRules]);

  // Get field props for easy integration with inputs
  const getFieldProps = useCallback((name) => {
    return {
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] && errors[name],
      hasError: touched[name] && !!errors[name]
    };
  }, [values, handleChange, handleBlur, touched, errors]);

  // Calculate form statistics
  const formStats = {
    isValid: Object.keys(errors).length === 0,
    touchedFields: Object.keys(touched).length,
    totalFields: Object.keys(validationRules).length,
    hasErrors: Object.keys(errors).length > 0,
    canSubmit: !isSubmitting && Object.keys(errors).length === 0
  };

  return {
    // Values and state
    values,
    errors,
    touched,
    isDirty,
    isSubmitting,
    
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setMultipleValues,
    reset,
    validateForm,
    validateField,
    
    // Utilities
    getFieldProps,
    formStats
  };
};

// Helper function to create common validation rules for the banana trading system
export const createValidationRules = {
  // Common field validations
  name: (required = true) => {
    const rules = [
      { type: 'minLength', params: [2], message: 'Name must be at least 2 characters' },
      { type: 'maxLength', params: [100], message: 'Name cannot exceed 100 characters' }
    ];
    if (required) {
      rules.unshift({ type: 'required', message: 'Name is required' });
    }
    return rules;
  },

  phone: (required = false) => {
    const rules = [{ type: 'phone' }];
    if (required) {
      rules.unshift({ type: 'required', message: 'Phone number is required' });
    }
    return rules;
  },

  amount: (required = true) => {
    const rules = [
      { type: 'number' },
      { type: 'positiveNumber' }
    ];
    if (required) {
      rules.unshift({ type: 'required', message: 'Amount is required' });
    }
    return rules;
  },

  quantity: (required = true) => {
    const rules = [
      { type: 'weight' },
      { type: 'nonZero', message: 'Quantity must be greater than zero' }
    ];
    if (required) {
      rules.unshift({ type: 'required', message: 'Quantity is required' });
    }
    return rules;
  },

  rate: (required = true) => {
    const rules = [{ type: 'rate' }];
    if (required) {
      rules.unshift({ type: 'required', message: 'Rate is required' });
    }
    return rules;
  },

  // Supplier/Customer validations
  supplier: () => [
    { type: 'required', message: 'Please select a supplier' }
  ],

  customer: () => [
    { type: 'required', message: 'Please select a customer' }
  ],

  // Item validations
  item: () => [
    { type: 'required', message: 'Please select an item' }
  ]
};

export default useForm;