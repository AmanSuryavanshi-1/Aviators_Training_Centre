# Form Validation

> **Client and server-side validation for contact forms**

Last Updated: December 20, 2025

---

## Overview

Form validation ensures data quality through:
- Real-time client-side validation
- Server-side re-validation
- Indian phone number support
- UTM tracking integration

---

## Current Implementation

### Architecture

```
Form Validation System
├── Client-Side
│   ├── useFormValidation hook
│   ├── Real-time error display
│   └── Field-level validation
│
├── Server-Side
│   ├── API route validation
│   ├── Timeout protection
│   └── Error responses
│
└── Validation Rules
    ├── Email format
    ├── Indian phone (+91)
    ├── Required fields
    └── Length limits
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/validation.ts` | Core validation utilities |
| `src/hooks/use-form-validation.ts` | React hook for forms |
| `src/app/api/contact/route.ts` | Server-side validation |
| `src/components/features/contact/ContactFormCard.tsx` | Form UI |

---

## Core Logic

### Validation Utilities

```typescript
// src/lib/validation.ts
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationOptions {
  allowedDomains?: string[];
  blockDisposable?: boolean;
}

// Email validation
export function validateEmail(
  email: string, 
  options: ValidationOptions = {}
): ValidationResult {
  // Check if empty
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check domain (if restricted)
  if (options.allowedDomains?.length) {
    const domain = email.split('@')[1];
    if (!options.allowedDomains.includes(domain)) {
      return { isValid: false, error: 'Please use a valid email domain' };
    }
  }

  // Block disposable emails
  if (options.blockDisposable) {
    const disposableDomains = ['tempmail.com', 'throwaway.com'];
    const domain = email.split('@')[1];
    if (disposableDomains.includes(domain)) {
      return { isValid: false, error: 'Please use a non-disposable email' };
    }
  }

  return { isValid: true };
}

// Indian phone number validation
export function validateIndianPhone(phone: string): ValidationResult {
  // Phone is optional
  if (!phone || phone.trim() === '') {
    return { isValid: true };
  }

  // Remove spaces and format
  const cleaned = phone.replace(/[\s-]/g, '');

  // Valid formats:
  // +919876543210 (with country code)
  // 9876543210 (10 digits starting with 6-9)
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

  if (!phoneRegex.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'Enter a valid 10-digit Indian mobile number' 
    };
  }

  return { isValid: true };
}

// Required field validation
export function validateRequired(
  value: string, 
  fieldName: string
): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}
```

### Form Validation Hook

```typescript
// src/hooks/use-form-validation.ts
import { useState, useCallback, useMemo } from 'react';
import { validateEmail, validateIndianPhone, validateRequired } from '@/lib/validation';

export interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface FormValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  validateField: (fieldName: string, value: string) => ValidationResult;
  validateForm: (formData: FormData) => boolean;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setError: (fieldName: string, error: string) => void;
}

export function useFormValidation(): FormValidationState {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((
    fieldName: string, 
    value: string,
    options?: { isDemoBooking?: boolean }
  ): ValidationResult => {
    let result: ValidationResult;

    switch (fieldName) {
      case 'name':
        result = validateRequired(value, 'Full Name');
        break;
      
      case 'email':
        result = validateEmail(value);
        break;
      
      case 'phone':
        // Phone is optional
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
        // Optional for demo booking
        if (options?.isDemoBooking) {
          result = { isValid: true };
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

  const validateForm = useCallback((formData: FormData): boolean => {
    const results = [
      validateField('name', formData.name),
      validateField('email', formData.email),
      validateField('phone', formData.phone),
      validateField('subject', formData.subject),
      validateField('message', formData.message),
    ];
    return results.every(r => r.isValid);
  }, [validateField]);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const { [fieldName]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

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
    setError,
  };
}
```

### Server-Side Validation

```typescript
// src/app/api/contact/route.ts
export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { name, email, phone, subject, message } = formData;

    // Server-side validation (never trust client)
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      return NextResponse.json(
        { error: emailResult.error },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone) {
      const phoneResult = validateIndianPhone(phone);
      if (!phoneResult.isValid) {
        return NextResponse.json(
          { error: phoneResult.error },
          { status: 400 }
        );
      }
    }

    // Continue with validated data...
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
```

---

## Form Component Usage

### Contact Form with Validation

```typescript
// src/components/features/contact/ContactFormCard.tsx
'use client';

import { useState } from 'react';
import { useFormValidation, FormData } from '@/hooks/use-form-validation';

export function ContactFormCard() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { errors, validateField, validateForm, clearError } = useFormValidation();

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate on blur or after error shown
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field: keyof FormData) => {
    validateField(field, formData[field]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate entire form
    if (!validateForm(formData)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      // Success
      alert('Form submitted successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="Full Name"
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name}</span>
        )}
      </div>

      <div>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Email"
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email}</span>
        )}
      </div>

      <div>
        <Input
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          placeholder="Phone (Optional)"
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <span className="text-red-500 text-sm">{errors.phone}</span>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

---

## Extension Guide

### Adding New Validation Rule

```typescript
// src/lib/validation.ts
export function validateMessage(message: string): ValidationResult {
  if (!message || message.trim() === '') {
    return { isValid: false, error: 'Message is required' };
  }
  
  if (message.length < 10) {
    return { isValid: false, error: 'Message must be at least 10 characters' };
  }
  
  if (message.length > 2000) {
    return { isValid: false, error: 'Message must be less than 2000 characters' };
  }
  
  return { isValid: true };
}
```

### Adding New Field to Hook

```typescript
// In useFormValidation hook, add to switch statement:
case 'website':
  if (value && !isValidUrl(value)) {
    result = { isValid: false, error: 'Enter a valid URL' };
  } else {
    result = { isValid: true };
  }
  break;
```

---

## Performance Considerations

- **Validate on blur**: Avoid validating on every keystroke
- **Debounce**: For complex validations, debounce input
- **Memoize**: Use `useMemo` for computed validation state
- **Server validation**: Always re-validate on server

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Errors not showing | Check `errors` object mapping |
| Phone validation failing | Ensure +91 format handling |
| Form submitting with errors | Check `validateForm` before submit |
| Server accepts invalid data | Add server-side validation |

---

## Related Documentation

- [Email Service](email-service.md)
- [API Integration](../API_INTEGRATION.md)
- [N8N Data Flow](../n8n/CONTACT_FORM_DATA_FLOW.md)
