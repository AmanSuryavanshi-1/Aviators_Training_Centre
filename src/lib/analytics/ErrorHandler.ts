/**
 * Enhanced Error Handling System
 * 
 * Comprehensive error classification, user message generation, and solution suggestions
 * for all analytics authentication and API errors.
 */

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  QUOTA = 'quota',
  NETWORK = 'network',
  CONFIGURATION = 'configuration',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface AuthError {
  code: string;
  type: ErrorType;
  message: string;
  details?: any;
  userMessage: string;
  solution?: string;
  service?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContext {
  service?: string;
  endpoint?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface ErrorLog {
  error: AuthError;
  context: ErrorContext;
  stackTrace?: string;
  resolved: boolean;
  resolutionTime?: Date;
}

export class ErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private readonly MAX_LOGS = 1000;

  /**
   * Classify error by type and generate appropriate response
   */
  classifyError(error: any, context?: Partial<ErrorContext>): ErrorType {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorCode = error?.code;

    // Authentication errors
    if (errorMessage.includes('headers.foreach is not a function') ||
        errorMessage.includes('metadata plugin failed') ||
        errorMessage.includes('authentication failed') ||
        errorMessage.includes('invalid credentials')) {
      return ErrorType.AUTHENTICATION;
    }

    // Permission errors
    if (errorMessage.includes('missing or insufficient permissions') ||
        errorMessage.includes('permission denied') ||
        errorMessage.includes('user does not have sufficient permission') ||
        errorMessage.includes('access denied') ||
        errorCode === 'permission-denied') {
      return ErrorType.PERMISSION;
    }

    // Quota/Rate limiting errors
    if (errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('too many requests') ||
        errorCode === 429) {
      return ErrorType.QUOTA;
    }

    // Network errors
    if (errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('fetch failed') ||
        errorCode === 'ECONNREFUSED' ||
        errorCode === 'ETIMEDOUT') {
      return ErrorType.NETWORK;
    }

    // Configuration errors
    if (errorMessage.includes('not configured') ||
        errorMessage.includes('missing') ||
        errorMessage.includes('invalid format') ||
        errorMessage.includes('property id') ||
        errorMessage.includes('service account')) {
      return ErrorType.CONFIGURATION;
    }

    // Service unavailable
    if (errorMessage.includes('service unavailable') ||
        errorMessage.includes('temporarily unavailable') ||
        errorCode === 503 ||
        errorCode === 502 ||
        errorCode === 504) {
      return ErrorType.SERVICE_UNAVAILABLE;
    }

    // Validation errors
    if (errorMessage.includes('invalid argument') ||
        errorMessage.includes('validation') ||
        errorMessage.includes('malformed') ||
        errorCode === 3 ||
        errorCode === 'INVALID_ARGUMENT') {
      return ErrorType.VALIDATION;
    }

    return ErrorType.UNKNOWN;
  }

  /**
   * Generate user-friendly error message
   */
  generateUserMessage(error: AuthError): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return this.getAuthenticationMessage(error);
      
      case ErrorType.PERMISSION:
        return this.getPermissionMessage(error);
      
      case ErrorType.QUOTA:
        return this.getQuotaMessage(error);
      
      case ErrorType.NETWORK:
        return this.getNetworkMessage(error);
      
      case ErrorType.CONFIGURATION:
        return this.getConfigurationMessage(error);
      
      case ErrorType.SERVICE_UNAVAILABLE:
        return this.getServiceUnavailableMessage(error);
      
      case ErrorType.VALIDATION:
        return this.getValidationMessage(error);
      
      default:
        return 'An unexpected error occurred with the analytics service. Please try again later.';
    }
  }

  /**
   * Suggest solution for the error
   */
  suggestSolution(error: AuthError): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
        return this.getAuthenticationSolution(error);
      
      case ErrorType.PERMISSION:
        return this.getPermissionSolution(error);
      
      case ErrorType.QUOTA:
        return 'Please wait a few minutes before trying again. If the issue persists, consider upgrading your API quota.';
      
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again. If the problem continues, the service may be temporarily unavailable.';
      
      case ErrorType.CONFIGURATION:
        return 'Please verify your API credentials and configuration settings. Check the setup guide for detailed instructions.';
      
      case ErrorType.SERVICE_UNAVAILABLE:
        return 'The service is temporarily unavailable. Please try again in a few minutes.';
      
      case ErrorType.VALIDATION:
        return 'Please check your request parameters and try again. Ensure all required fields are properly formatted.';
      
      default:
        return 'Please try refreshing the page or contact support if the issue persists.';
    }
  }

  /**
   * Log error with context
   */
  logError(error: AuthError, context?: Partial<ErrorContext>, stackTrace?: string): void {
    const errorLog: ErrorLog = {
      error,
      context: {
        timestamp: new Date(),
        ...context
      },
      stackTrace,
      resolved: false
    };

    this.errorLogs.push(errorLog);

    // Maintain log size limit
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs = this.errorLogs.slice(-this.MAX_LOGS);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Analytics Error:', {
        code: error.code,
        type: error.type,
        service: error.service,
        message: error.message,
        userMessage: error.userMessage,
        solution: error.solution,
        context: errorLog.context
      });
    }
  }

  /**
   * Create standardized error response
   */
  createErrorResponse(
    originalError: any, 
    context?: Partial<ErrorContext>
  ): AuthError {
    const type = this.classifyError(originalError, context);
    const code = this.generateErrorCode(type, originalError);
    const severity = this.determineSeverity(type, originalError);
    
    const authError: AuthError = {
      code,
      type,
      message: originalError?.message || 'Unknown error',
      details: originalError,
      userMessage: '',
      service: context?.service,
      timestamp: new Date(),
      severity
    };

    authError.userMessage = this.generateUserMessage(authError);
    authError.solution = this.suggestSolution(authError);

    // Log the error
    this.logError(authError, context, originalError?.stack);

    return authError;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    byService: Record<string, number>;
    bySeverity: Record<string, number>;
    resolved: number;
    unresolved: number;
  } {
    const stats = {
      total: this.errorLogs.length,
      byType: {} as Record<ErrorType, number>,
      byService: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      resolved: 0,
      unresolved: 0
    };

    for (const log of this.errorLogs) {
      // Count by type
      stats.byType[log.error.type] = (stats.byType[log.error.type] || 0) + 1;
      
      // Count by service
      if (log.error.service) {
        stats.byService[log.error.service] = (stats.byService[log.error.service] || 0) + 1;
      }
      
      // Count by severity
      stats.bySeverity[log.error.severity] = (stats.bySeverity[log.error.severity] || 0) + 1;
      
      // Count resolved/unresolved
      if (log.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    }

    return stats;
  }

  /**
   * Mark error as resolved
   */
  markErrorResolved(errorCode: string): boolean {
    const errorLog = this.errorLogs.find(log => log.error.code === errorCode);
    if (errorLog) {
      errorLog.resolved = true;
      errorLog.resolutionTime = new Date();
      return true;
    }
    return false;
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.errorLogs = [];
  }

  // Private helper methods

  private getAuthenticationMessage(error: AuthError): string {
    if (error.message.includes('headers.forEach')) {
      return 'Google Analytics authentication is experiencing technical issues. The system is working to resolve this automatically.';
    }
    return 'Authentication failed for the analytics service. Please check your credentials.';
  }

  private getPermissionMessage(error: AuthError): string {
    if (error.service === 'firebase') {
      return 'Firebase analytics data access is currently restricted due to insufficient permissions.';
    } else if (error.service === 'search-console') {
      return 'Search Console data is unavailable due to permission restrictions.';
    } else if (error.service === 'ga4') {
      return 'Google Analytics data access is restricted. Please verify your account permissions.';
    }
    return 'Access to analytics data is currently restricted due to permission issues.';
  }

  private getQuotaMessage(error: AuthError): string {
    return 'The analytics service has reached its usage limit. Please wait a few minutes before trying again.';
  }

  private getNetworkMessage(error: AuthError): string {
    return 'Unable to connect to the analytics service. Please check your internet connection.';
  }

  private getConfigurationMessage(error: AuthError): string {
    return 'Analytics service configuration is incomplete or invalid. Please check your setup.';
  }

  private getServiceUnavailableMessage(error: AuthError): string {
    return 'The analytics service is temporarily unavailable. Please try again in a few moments.';
  }

  private getValidationMessage(error: AuthError): string {
    return 'The analytics request contains invalid data. Please try again.';
  }

  private getAuthenticationSolution(error: AuthError): string {
    if (error.message.includes('headers.forEach')) {
      return 'This is a known issue that the system handles automatically. Please refresh the page in a few moments.';
    }
    return 'Please verify your API credentials are correctly configured in your environment variables.';
  }

  private getPermissionSolution(error: AuthError): string {
    if (error.service === 'firebase') {
      return 'Ensure your Firebase service account has the correct permissions for Analytics and Firestore access.';
    } else if (error.service === 'search-console') {
      return 'Add your service account email to Google Search Console with Full permissions for your verified site.';
    } else if (error.service === 'ga4') {
      return 'Add your service account email to your Google Analytics property with Viewer permissions.';
    }
    return 'Please verify that your service account has the necessary permissions for the analytics service.';
  }

  private generateErrorCode(type: ErrorType, originalError: any): string {
    const timestamp = Date.now().toString(36);
    const typePrefix = type.toUpperCase().substring(0, 4);
    const errorHash = this.hashError(originalError);
    return `${typePrefix}_${errorHash}_${timestamp}`;
  }

  private hashError(error: any): string {
    const errorString = JSON.stringify({
      message: error?.message,
      code: error?.code,
      name: error?.name
    });
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < errorString.length; i++) {
      const char = errorString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private determineSeverity(type: ErrorType, originalError: any): 'low' | 'medium' | 'high' | 'critical' {
    switch (type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.PERMISSION:
        return 'high';
      
      case ErrorType.CONFIGURATION:
        return 'critical';
      
      case ErrorType.SERVICE_UNAVAILABLE:
      case ErrorType.NETWORK:
        return 'medium';
      
      case ErrorType.QUOTA:
      case ErrorType.VALIDATION:
        return 'low';
      
      default:
        return 'medium';
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();