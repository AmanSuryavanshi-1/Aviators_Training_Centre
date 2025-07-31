import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/components/ui/utils';

export interface ValidationErrorProps {
  error?: string;
  fieldId: string;
  className?: string;
}

/**
 * ValidationError component for displaying field-specific validation errors
 * Provides accessible error messaging with proper ARIA attributes
 */
const ValidationError: React.FC<ValidationErrorProps> = ({ 
  error, 
  fieldId, 
  className 
}) => {
  if (!error) return null;

  return (
    <div
      id={`${fieldId}-error`}
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-center gap-1.5 mt-1.5 text-sm text-red-600 dark:text-red-400",
        className
      )}
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
};

export default ValidationError;

/**
 * FormValidationSummary component for displaying form-level validation errors
 * Shows a summary of all validation errors at the top of the form
 */
export interface FormValidationSummaryProps {
  errors: Record<string, string>;
  show: boolean;
  className?: string;
}

export const FormValidationSummary: React.FC<FormValidationSummaryProps> = ({
  errors,
  show,
  className
}) => {
  const errorCount = Object.keys(errors).length;

  if (!show || errorCount === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "p-4 mb-6 bg-red-50 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800",
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
            Please correct the following errors:
          </h3>
          <div className="mt-2">
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full flex-shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * FieldWrapper component for wrapping form fields with validation styling
 * Provides consistent styling for valid/invalid field states
 */
export interface FieldWrapperProps {
  children: React.ReactNode;
  error?: string;
  className?: string;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  error,
  className
}) => {
  return (
    <div className={cn("space-y-1.5", className)}>
      {children}
    </div>
  );
};
