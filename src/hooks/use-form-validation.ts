import { useState, useCallback, useMemo } from 'react';
import { validateEmail, validateIndianPhone, validateRequired, ValidationResult } from '@/lib/validation';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface FormValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  validateField: (fieldName: string, value: string, options?: { isDemoBooking?: boolean }) => ValidationResult;
  validateForm: (formData: FormData, options?: { isDemoBooking?: boolean }) => boolean;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setError: (fieldName: string, error: string) => void;
}

/**
 * Custom hook for managing form validation state
 * Provides field-level and form-level validation with error management
 */
export function useFormValidation(): FormValidationState {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validates a single field based on field name and value
   */
  const validateField = useCallback((fieldName: string, value: string, options?: { isDemoBooking?: boolean }): ValidationResult => {
    let result: ValidationResult;

    switch (fieldName) {
      case 'name':
        result = validateRequired(value, 'Full Name');
        break;
      
      case 'email':
        result = validateEmail(value);
        break;
      
      case 'phone':
        // Phone is optional, so only validate if value is provided
        if (!value || value.trim() === '') {
          result = { isValid: true };
        } else {
          result = validateIndianPhone(value);
        }
        break;
      
      case 'subject':
        result = validateRequired(value, 'Subject');
        break;
      
      case 'message':
        // Message is optional for demo booking, required for regular contact
        if (options?.isDemoBooking) {
          result = { isValid: true }; // Message is optional for demo booking
        } else {
          result = validateRequired(value, 'Message');
        }
        break;
      
      default:
        result = { isValid: true };
    }

    // Update errors state
    setErrors(prev => {
      const newErrors = { ...prev };
      if (result.isValid) {
        delete newErrors[fieldName];
      } else if (result.error) {
        newErrors[fieldName] = result.error;
      }
      return newErrors;
    });

    return result;
  }, []);

  /**
   * Validates the entire form
   */
  const validateForm = useCallback((formData: FormData, options?: { isDemoBooking?: boolean }): boolean => {
    const fieldValidations = [
      validateField('name', formData.name, options),
      validateField('email', formData.email, options),
      validateField('phone', formData.phone, options),
      validateField('subject', formData.subject, options),
      validateField('message', formData.message, options)
    ];

    // Return true if all validations pass
    return fieldValidations.every(result => result.isValid);
  }, [validateField]);

  /**
   * Clears error for a specific field
   */
  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Clears all validation errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Sets an error for a specific field
   */
  const setError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  /**
   * Computed property to check if form is valid (no errors)
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    setError
  };
}
