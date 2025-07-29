/**
 * Validation utilities for contact form
 * Provides email and Indian phone number validation
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface EmailValidationOptions {
  allowedDomains?: string[];
  requireDomain?: boolean;
}

export interface PhoneValidationOptions {
  countryCode?: string;
  allowSpaces?: boolean;
  allowHyphens?: boolean;
}

// Email validation rules
const EMAIL_VALIDATION_RULES = {
  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  commonDomains: ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'rediffmail.com'],
  maxLength: 254,
  minLength: 5
};

// Indian phone validation rules
const INDIAN_PHONE_VALIDATION_RULES = {
  patterns: {
    withCountryCode: /^(\+91|91)?[\s-]?[6-9]\d{9}$/,
    tenDigit: /^[6-9]\d{9}$/,
    formatted: /^(\+91|91)?[\s-]?[6-9]\d{4}[\s-]?\d{5}$/
  },
  validPrefixes: ['6', '7', '8', '9'],
  exactLength: 10,
  withCountryCodeLength: 12,
  countryCode: '+91'
};

/**
 * Validates email address format
 * @param email - Email address to validate
 * @param options - Optional validation options
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateEmail(email: string, options?: EmailValidationOptions): ValidationResult {
  // Check if email is empty
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email address is required'
    };
  }

  const trimmedEmail = email.trim();

  // Check length constraints
  if (trimmedEmail.length < EMAIL_VALIDATION_RULES.minLength) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  if (trimmedEmail.length > EMAIL_VALIDATION_RULES.maxLength) {
    return {
      isValid: false,
      error: 'Email address is too long'
    };
  }

  // Check basic email format
  if (!EMAIL_VALIDATION_RULES.pattern.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Check for allowed domains if specified
  if (options?.allowedDomains && options.allowedDomains.length > 0) {
    const domain = trimmedEmail.split('@')[1];
    if (!options.allowedDomains.includes(domain)) {
      return {
        isValid: false,
        error: `Please use an email from: ${options.allowedDomains.join(', ')}`
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates Indian phone number format
 * @param phone - Phone number to validate
 * @param options - Optional validation options
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateIndianPhone(phone: string, options?: PhoneValidationOptions): ValidationResult {
  // Check if phone is empty
  if (!phone || phone.trim() === '') {
    return {
      isValid: false,
      error: 'Phone number is required'
    };
  }

  const trimmedPhone = phone.trim();

  // Remove spaces and hyphens for validation
  const cleanPhone = trimmedPhone.replace(/[\s-]/g, '');

  // Check for valid Indian phone number patterns
  const patterns = INDIAN_PHONE_VALIDATION_RULES.patterns;

  // Test against different valid patterns
  if (patterns.tenDigit.test(cleanPhone)) {
    // 10-digit number starting with 6-9
    return { isValid: true };
  }

  if (patterns.withCountryCode.test(cleanPhone)) {
    // Number with country code (+91 or 91)
    return { isValid: true };
  }

  // Check if it's a 10-digit number but doesn't start with valid prefix
  if (/^\d{10}$/.test(cleanPhone)) {
    const firstDigit = cleanPhone[0];
    if (!INDIAN_PHONE_VALIDATION_RULES.validPrefixes.includes(firstDigit)) {
      return {
        isValid: false,
        error: 'Indian mobile numbers must start with 6, 7, 8, or 9'
      };
    }
  }

  // Check if it has country code but wrong length
  if (/^(\+91|91)/.test(cleanPhone)) {
    const numberPart = cleanPhone.replace(/^(\+91|91)/, '');
    if (numberPart.length !== 10) {
      return {
        isValid: false,
        error: 'Please enter a valid 10-digit Indian mobile number'
      };
    }
  }

  // General invalid format
  return {
    isValid: false,
    error: 'Please enter a valid 10-digit Indian mobile number'
  };
}

/**
 * Formats phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  const cleanPhone = phone.replace(/[\s-]/g, '');

  // If it's a 10-digit number, add +91
  if (/^[6-9]\d{9}$/.test(cleanPhone)) {
    return `+91 ${cleanPhone}`;
  }

  // If it already has country code, format it nicely
  if (/^(\+91|91)[6-9]\d{9}$/.test(cleanPhone)) {
    const numberPart = cleanPhone.replace(/^(\+91|91)/, '');
    return `+91 ${numberPart}`;
  }

  // Return as-is if format is unclear
  return phone;
}

/**
 * Validates required field
 * @param value - Field value to validate
 * @param fieldName - Name of the field for error message
 * @returns ValidationResult with isValid flag and optional error message
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`
    };
  }
  return { isValid: true };
}