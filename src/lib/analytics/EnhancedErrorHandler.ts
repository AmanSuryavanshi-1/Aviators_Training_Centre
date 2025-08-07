/**
 * Enhanced Error Handling System
 * 
 * Provides comprehensive error classification, user-friendly message generation,
 * and specific troubleshooting guidance for analytics authentication errors.
 */
import { ErrorType } from './ErrorHandler';

export interface ClassifiedError {
  type: ErrorType;
  category: 'authentication' | 'permission' | 'configuration' | 'network' | 'quota' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  service: string;
  operation: string;
  originalError: any;
  userMessage: string;
  technicalDetails: string;
  solutions: Solution[];
  timestamp: Date;
}

export interface Solution {
  title: string;
  description: string;
  steps: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requiresAdmin: boolean;
}

export class EnhancedErrorHandler {
  /**
   * Classify an error by analyzing its properties and context
   */
  classifyError(
    error: any,
    service: string,
    operation: string,
    context?: any
  ): ClassifiedError {
    const errorCode = error?.code || error?.status || 'UNKNOWN';
    const errorMessage = error?.message || 'Unknown error occurred';

    // Determine error category and type
    const { category, type, severity } = this.categorizeError(error, errorCode, errorMessage);

    // Generate user-friendly message
    const userMessage = this.generateUserMessage(category, type, service, errorMessage);

    // Generate technical details
    const technicalDetails = this.generateTechnicalDetails(error, context);

    // Generate solutions
    const solutions = this.generateSolutions(category, type, service, errorCode);

    return {
      type,
      category,
      severity,
      service,
      operation,
      originalError: error,
      userMessage,
      technicalDetails,
      solutions,
      timestamp: new Date()
    };
  }

  /**
   * Generate user-friendly error message
   */
  generateUserMessage(
    category: string,
    type: ErrorType,
    service: string,
    originalMessage: string
  ): string {
    const serviceDisplayName = this.getServiceDisplayName(service);

    switch (category) {
      case 'authentication':
        return `Unable to authenticate with ${serviceDisplayName}. Please check your credentials and try again.`;
      
      case 'permission':
        return `You don't have the necessary permissions to access ${serviceDisplayName}. Please verify your account has the required access.`;
      
      case 'configuration':
        return `${serviceDisplayName} is not properly configured. Please check your environment variables and service setup.`;
      
      case 'network':
        return `Unable to connect to ${serviceDisplayName}. Please check your internet connection and try again.`;
      
      case 'quota':
        return `You've reached the usage limit for ${serviceDisplayName}. Please wait before making more requests or upgrade your plan.`;
      
      default:
        return `An unexpected error occurred with ${serviceDisplayName}. Our team has been notified and is working on a fix.`;
    }
  }

  /**
   * Suggest specific solutions based on error type and service
   */
  suggestSolution(classifiedError: ClassifiedError): Solution[] {
    return classifiedError.solutions;
  }

  /**
   * Get all error classifications for a service
   */
  getServiceErrorPatterns(service: string): {
    common: ClassifiedError[];
    recent: ClassifiedError[];
    critical: ClassifiedError[];
  } {
    // This would typically fetch from a database or cache
    // For now, return empty arrays
    return {
      common: [],
      recent: [],
      critical: []
    };
  }

  /**
   * Generate error report for debugging
   */
  generateErrorReport(classifiedError: ClassifiedError): string {
    const report = [
      `=== ERROR REPORT ===`,
      `Timestamp: ${classifiedError.timestamp.toISOString()}`,
      `Service: ${classifiedError.service}`,
      `Operation: ${classifiedError.operation}`,
      `Category: ${classifiedError.category}`,
      `Type: ${classifiedError.type}`,
      `Severity: ${classifiedError.severity}`,
      ``,
      `User Message:`,
      classifiedError.userMessage,
      ``,
      `Technical Details:`,
      classifiedError.technicalDetails,
      ``,
      `Suggested Solutions:`,
      ...classifiedError.solutions.map((solution, index) => 
        `${index + 1}. ${solution.title} (${solution.priority} priority, ${solution.estimatedTime})`
      ),
      ``,
      `Original Error:`,
      JSON.stringify(classifiedError.originalError, null, 2),
      `===================`
    ];

    return report.join('\n');
  }

  // Private methods

  private categorizeError(error: any, errorCode: string, errorMessage: string): {
    category: ClassifiedError['category'];
    type: ErrorType;
    severity: ClassifiedError['severity'];
  } {
    // Authentication errors
    if (this.isAuthenticationError(errorCode, errorMessage)) {
      return {
        category: 'authentication',
        type: 'AUTHENTICATION_FAILED',
        severity: 'high'
      };
    }

    // Permission errors
    if (this.isPermissionError(errorCode, errorMessage)) {
      return {
        category: 'permission',
        type: 'INSUFFICIENT_PERMISSIONS',
        severity: 'high'
      };
    }

    // Configuration errors
    if (this.isConfigurationError(errorCode, errorMessage)) {
      return {
        category: 'configuration',
        type: 'INVALID_CONFIGURATION',
        severity: 'critical'
      };
    }

    // Network errors
    if (this.isNetworkError(errorCode, errorMessage)) {
      return {
        category: 'network',
        type: 'NETWORK_ERROR',
        severity: 'medium'
      };
    }

    // Quota errors
    if (this.isQuotaError(errorCode, errorMessage)) {
      return {
        category: 'quota',
        type: 'QUOTA_EXCEEDED',
        severity: 'medium'
      };
    }

    // Default to unknown
    return {
      category: 'unknown',
      type: 'UNKNOWN_ERROR',
      severity: 'medium'
    };
  }

  private isAuthenticationError(errorCode: string, errorMessage: string): boolean {
    const authCodes = ['UNAUTHENTICATED', '401', 'UNAUTHORIZED', 'INVALID_CREDENTIALS'];
    const authMessages = ['authentication', 'unauthorized', 'invalid credentials', 'token'];
    
    return authCodes.includes(errorCode) || 
           authMessages.some(msg => errorMessage.toLowerCase().includes(msg));
  }

  private isPermissionError(errorCode: string, errorMessage: string): boolean {
    const permissionCodes = ['PERMISSION_DENIED', '403', 'FORBIDDEN', 'INSUFFICIENT_PERMISSIONS'];
    const permissionMessages = ['permission', 'forbidden', 'access denied', 'insufficient'];
    
    return permissionCodes.includes(errorCode) || 
           permissionMessages.some(msg => errorMessage.toLowerCase().includes(msg));
  }

  private isConfigurationError(errorCode: string, errorMessage: string): boolean {
    const configCodes = ['INVALID_ARGUMENT', 'BAD_REQUEST', '400'];
    const configMessages = ['configuration', 'invalid argument', 'bad request', 'missing'];
    
    return configCodes.includes(errorCode) || 
           configMessages.some(msg => errorMessage.toLowerCase().includes(msg));
  }

  private isNetworkError(errorCode: string, errorMessage: string): boolean {
    const networkCodes = ['UNAVAILABLE', 'TIMEOUT', 'NETWORK_ERROR', '503', '504'];
    const networkMessages = ['network', 'timeout', 'unavailable', 'connection'];
    
    return networkCodes.includes(errorCode) || 
           networkMessages.some(msg => errorMessage.toLowerCase().includes(msg));
  }

  private isQuotaError(errorCode: string, errorMessage: string): boolean {
    const quotaCodes = ['QUOTA_EXCEEDED', 'RATE_LIMIT_EXCEEDED', '429'];
    const quotaMessages = ['quota', 'rate limit', 'too many requests'];
    
    return quotaCodes.includes(errorCode) || 
           quotaMessages.some(msg => errorMessage.toLowerCase().includes(msg));
  }

  private generateTechnicalDetails(error: any, context?: any): string {
    const details = [];
    
    if (error?.code) details.push(`Error Code: ${error.code}`);
    if (error?.status) details.push(`HTTP Status: ${error.status}`);
    if (error?.message) details.push(`Message: ${error.message}`);
    if (context?.endpoint) details.push(`Endpoint: ${context.endpoint}`);
    if (context?.timestamp) details.push(`Timestamp: ${context.timestamp}`);
    
    return details.join('\n');
  }

  private generateSolutions(
    category: ClassifiedError['category'],
    type: ErrorType,
    service: string,
    errorCode: string
  ): Solution[] {
    const solutions: Solution[] = [];

    switch (category) {
      case 'authentication':
        solutions.push(...this.getAuthenticationSolutions(service));
        break;
      
      case 'permission':
        solutions.push(...this.getPermissionSolutions(service));
        break;
      
      case 'configuration':
        solutions.push(...this.getConfigurationSolutions(service));
        break;
      
      case 'network':
        solutions.push(...this.getNetworkSolutions());
        break;
      
      case 'quota':
        solutions.push(...this.getQuotaSolutions(service));
        break;
      
      default:
        solutions.push(...this.getGenericSolutions());
    }

    return solutions;
  }

  private getAuthenticationSolutions(service: string): Solution[] {
    const solutions: Solution[] = [
      {
        title: 'Verify Service Account Credentials',
        description: 'Check that your service account key is valid and properly formatted',
        steps: [
          'Verify the service account key in your environment variables',
          'Ensure the key is properly formatted JSON',
          'Check that the service account exists in your Google Cloud project',
          'Verify the service account has not been deleted or disabled'
        ],
        priority: 'high',
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        requiresAdmin: false
      }
    ];

    if (service === 'ga4') {
      solutions.push({
        title: 'Enable Google Analytics Reporting API',
        description: 'Ensure the Analytics Reporting API is enabled in your Google Cloud project',
        steps: [
          'Go to Google Cloud Console',
          'Navigate to APIs & Services > Library',
          'Search for "Google Analytics Reporting API"',
          'Click "Enable" if not already enabled'
        ],
        priority: 'high',
        estimatedTime: '2-5 minutes',
        difficulty: 'easy',
        requiresAdmin: true
      });
    }

    return solutions;
  }

  private getPermissionSolutions(service: string): Solution[] {
    return [
      {
        title: 'Grant Required Permissions',
        description: 'Ensure your service account has the necessary permissions',
        steps: [
          'Go to your service configuration',
          'Add the required roles to your service account',
          'Wait a few minutes for permissions to propagate',
          'Test the connection again'
        ],
        priority: 'high',
        estimatedTime: '10-15 minutes',
        difficulty: 'medium',
        requiresAdmin: true
      }
    ];
  }

  private getConfigurationSolutions(service: string): Solution[] {
    return [
      {
        title: 'Check Environment Variables',
        description: 'Verify all required environment variables are set correctly',
        steps: [
          'Check your .env.local file',
          'Ensure all required variables are present',
          'Verify variable names match exactly',
          'Restart your application after changes'
        ],
        priority: 'high',
        estimatedTime: '5-10 minutes',
        difficulty: 'easy',
        requiresAdmin: false
      }
    ];
  }

  private getNetworkSolutions(): Solution[] {
    return [
      {
        title: 'Check Network Connection',
        description: 'Verify your internet connection and firewall settings',
        steps: [
          'Test your internet connection',
          'Check if your firewall is blocking the request',
          'Try again in a few minutes',
          'Contact your network administrator if issues persist'
        ],
        priority: 'medium',
        estimatedTime: '5-15 minutes',
        difficulty: 'easy',
        requiresAdmin: false
      }
    ];
  }

  private getQuotaSolutions(service: string): Solution[] {
    return [
      {
        title: 'Wait for Quota Reset',
        description: 'Wait for your API quota to reset or upgrade your plan',
        steps: [
          'Wait for the quota period to reset (usually daily)',
          'Check your API usage in the service console',
          'Consider upgrading your plan for higher limits',
          'Implement request caching to reduce API calls'
        ],
        priority: 'medium',
        estimatedTime: '1-24 hours',
        difficulty: 'easy',
        requiresAdmin: false
      }
    ];
  }

  private getGenericSolutions(): Solution[] {
    return [
      {
        title: 'Contact Support',
        description: 'If the issue persists, contact technical support',
        steps: [
          'Document the error details',
          'Note the steps that led to the error',
          'Contact technical support with the information',
          'Provide the error report for faster resolution'
        ],
        priority: 'low',
        estimatedTime: '1-3 days',
        difficulty: 'easy',
        requiresAdmin: false
      }
    ];
  }

  private getServiceDisplayName(service: string): string {
    const displayNames: Record<string, string> = {
      'ga4': 'Google Analytics 4',
      'firebase': 'Firebase Analytics',
      'search-console': 'Google Search Console',
      'unified': 'Analytics System'
    };

    return displayNames[service] || service;
  }
}

// Export singleton instance
export const enhancedErrorHandler = new EnhancedErrorHandler();