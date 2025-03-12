import { useState, useCallback } from 'react';

export type ValidationRule<T> = {
  test: (value: T) => boolean;
  message: string;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Custom hook for form validation
 * @param initialValues Initial form values
 * @param validationSchema Schema with validation rules for each field
 * @returns Form state, errors, validation functions, and helper methods
 */
export default function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(() => {
    const initial: Partial<Record<keyof T, boolean>> = {};
    for (const key in initialValues) {
      initial[key] = false;
    }
    return initial as Record<keyof T, boolean>;
  });

  // Validate a single field
  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const fieldRules = validationSchema[name];
      if (!fieldRules) return undefined;

      for (const rule of fieldRules) {
        if (!rule.test(value)) {
          return rule.message;
        }
      }

      return undefined;
    },
    [validationSchema]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    for (const key in validationSchema) {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validateField, validationSchema, values]);

  // Handle input change
  const handleChange = useCallback(
    (
      name: keyof T,
      value: T[keyof T],
      validateOnChange: boolean = true
    ): void => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnChange) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [validateField]
  );

  // Handle blur event
  const handleBlur = useCallback(
    (name: keyof T): void => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField, values]
  );

  // Reset the form
  const resetForm = useCallback(
    (newValues?: T): void => {
      setValues(newValues || initialValues);
      setErrors({});
      
      const newTouched: Partial<Record<keyof T, boolean>> = {};
      for (const key in initialValues) {
        newTouched[key] = false;
      }
      setTouched(newTouched as Record<keyof T, boolean>);
    },
    [initialValues]
  );

  // Set field value
  const setFieldValue = useCallback(
    (name: keyof T, value: T[keyof T], validateOnChange: boolean = true): void => {
      handleChange(name, value, validateOnChange);
    },
    [handleChange]
  );

  // Set field error
  const setFieldError = useCallback(
    (name: keyof T, error: string | undefined): void => {
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    []
  );

  // Set multiple field values
  const setFieldValues = useCallback(
    (newValues: Partial<T>, validateOnChange: boolean = true): void => {
      setValues((prev) => ({ ...prev, ...newValues }));
      
      if (validateOnChange) {
        const newErrors: ValidationErrors<T> = { ...errors };
        
        for (const key in newValues) {
          const fieldName = key as keyof T;
          const error = validateField(fieldName, newValues[fieldName] as T[keyof T]);
          newErrors[fieldName] = error;
        }
        
        setErrors(newErrors);
      }
    },
    [errors, validateField]
  );

  // Check if the field has an error and has been touched
  const hasError = useCallback(
    (name: keyof T): boolean => {
      return !!errors[name] && touched[name];
    },
    [errors, touched]
  );

  // Check if the form is valid
  const isValid = useCallback((): boolean => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    validateField,
    resetForm,
    setFieldValue,
    setFieldError,
    setFieldValues,
    hasError,
    isValid,
  };
}

/**
 * Common validation rules that can be reused across the application
 */
export const validationRules = {
  // Generic validation rule for required fields
  required: (message: string = 'This field is required'): ValidationRule<unknown> => ({
    test: (value: unknown) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),
  
  // String validation rules
  email: (message: string = 'Please enter a valid email address'): ValidationRule<string> => ({
    test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  
  minLength: (length: number, message?: string): ValidationRule<string> => ({
    test: (value: string) => value.length >= length,
    message: message || `Must be at least ${length} characters`,
  }),
  
  maxLength: (length: number, message?: string): ValidationRule<string> => ({
    test: (value: string) => value.length <= length,
    message: message || `Must be no more than ${length} characters`,
  }),
  
  matches: (pattern: RegExp, message: string): ValidationRule<string> => ({
    test: (value: string) => pattern.test(value),
    message,
  }),
  
  // Number validation rules
  min: (min: number, message?: string): ValidationRule<number> => ({
    test: (value: number) => value >= min,
    message: message || `Must be at least ${min}`,
  }),
  
  max: (max: number, message?: string): ValidationRule<number> => ({
    test: (value: number) => value <= max,
    message: message || `Must be no more than ${max}`,
  }),
};
