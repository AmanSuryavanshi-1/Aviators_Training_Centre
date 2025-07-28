'use client';

import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ValidationSummaryProps {
  errors: Record<string, string>;
  className?: string;
}

export function ValidationSummary({ errors, className = '' }: ValidationSummaryProps) {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0) {
    return (
      <Alert className={`border-green-200 bg-green-50 dark:bg-green-900/20 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          All validation checks passed. Ready to save!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-red-200 bg-red-50 dark:bg-red-900/20 ${className}`}>
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 dark:text-red-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>Please fix the following validation errors:</span>
            <Badge variant="destructive" className="text-xs">
              {errorCount} error{errorCount > 1 ? 's' : ''}
            </Badge>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span> {error}
              </li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}