/**
 * Comprehensive Error Handler for Blog System
 * Handles all types of errors that can occur in the blog system
 */

import { createLogger } from '@/lib/logging/production-logger';

const logger = createLogger('blog-error-handler');

export enum BlogErrorType {
  SANITY_CONNECTION = 'SANITY_CONNECTION',
  SANITY_CORS = 'SANITY_CORS',
  SANITY_PERMISSION = 'SANITY_PERMISSION',
  SANITY_TIMEOUT = 'SANITY_TIMEOUT',
  SANITY_RATE_LIMIT = 'SANITY_RATE_LIMIT',
  IMAGE_PROCESSING = 'IMAGE_PROCESSING',
  MARKDOWN_PARSING = 'MARKDOWN_PARSING',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface BlogError {
  type: BlogErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  retryable: boolean;
  userMessage: string;
  technicalDetails?: string;
}

export class BlogErrorHandler {
  private static instance: BlogErrorHandler;
  private errorCounts = new Map<BlogErrorType, number>();
  private lastErrors = new Map<BlogErrorType, Date>();

  static getInstance(): BlogErrorHandler {
    if (!BlogErrorHandler.instance) {
      BlogErrorHandler.instance = new BlogErrorHandler();
    }
    return BlogErrorHandler.instance;
  }

  /**
   * Process and categorize errors
   */
  processError(error: Error | unknown, context?: Record<string, any>): BlogError {
    const timestamp = new Date();
    let blogError: BlogError;

    if (error instanceof Error) {
      blogError = this.categorizeError(error, context, timestamp);
    } else {
      blogError = {
        type: BlogErrorType.UNKNOWN_ERROR,
        message: String(error),
        timestamp,
        retryable: false,
        userMessage: 'An unexpected error occurred. Please try again.',
        context,
      };
    }

    // Track error frequency
    this.trackError(blogError.type);

    // Log error with appropriate level
    this.logError(blogError);

    return blogError;
  }

  private categorizeError(error: Error, context?: Record<string, any>, timestamp: Date = new Date()): BlogError {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // CORS Errors
    if (message.includes('cors') || message.includes('origin not allowed')) {
      return {
        type: BlogErrorType.SANITY_CORS,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: false,
        userMessage: 'Content service is temporarily unavailable. Please refresh the page.',
        technicalDetails: 'CORS configuration issue with Sanity CMS. Check allowed origins.',
      };
    }

    // Permission Errors
    if (message.includes('forbidden') || message.includes('unauthorized') || 
        message.includes('permission') || message.includes('insufficient')) {
      return {
        type: BlogErrorType.SANITY_PERMISSION,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: false,
        userMessage: 'Access denied. Please contact support if this persists.',
        technicalDetails: 'Sanity API token lacks required permissions.',
      };
    }

    // Timeout Errors
    if (message.includes('timeout') || message.includes('etimedout') || 
        message.includes('request timeout')) {
      return {
        type: BlogErrorType.SANITY_TIMEOUT,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: true,
        userMessage: 'Request timed out. Please try again.',
        technicalDetails: 'Sanity API request exceeded timeout limit.',
      };
    }

    // Rate Limit Errors
    if (message.includes('rate limit') || message.includes('429') || 
        message.includes('too many requests')) {
      return {
        type: BlogErrorType.SANITY_RATE_LIMIT,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: true,
        userMessage: 'Service is busy. Please wait a moment and try again.',
        technicalDetails: 'Sanity API rate limit exceeded.',
      };
    }

    // Network Errors
    if (message.includes('network') || message.includes('econnreset') || 
        message.includes('enotfound') || message.includes('fetch failed')) {
      return {
        type: BlogErrorType.NETWORK_ERROR,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: true,
        userMessage: 'Network connection issue. Please check your internet and try again.',
        technicalDetails: 'Network connectivity problem.',
      };
    }

    // Sanity Connection Errors
    if (message.includes('sanity') || stack.includes('sanity')) {
      return {
        type: BlogErrorType.SANITY_CONNECTION,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: true,
        userMessage: 'Content service is temporarily unavailable. Please try again.',
        technicalDetails: 'Sanity CMS connection issue.',
      };
    }

    // Image Processing Errors
    if (message.includes('image') || message.includes('asset') || 
        message.includes('malformed asset')) {
      return {
        type: BlogErrorType.IMAGE_PROCESSING,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: false,
        userMessage: 'Image could not be loaded. Using placeholder instead.',
        technicalDetails: 'Image asset processing or URL generation failed.',
      };
    }

    // Markdown Processing Errors
    if (message.includes('markdown') || message.includes('portable text')) {
      return {
        type: BlogErrorType.MARKDOWN_PARSING,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: false,
        userMessage: 'Content formatting issue detected.',
        technicalDetails: 'Markdown or Portable Text parsing failed.',
      };
    }

    // Validation Errors
    if (message.includes('validation') || message.includes('invalid') || 
        message.includes('required')) {
      return {
        type: BlogErrorType.VALIDATION_ERROR,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: false,
        userMessage: 'Invalid data provided. Please check your input.',
        technicalDetails: 'Data validation failed.',
      };
    }

    // Server Errors (5xx)
    if (message.includes('500') || message.includes('502') || 
        message.includes('503') || message.includes('504')) {
      return {
        type: BlogErrorType.SERVER_ERROR,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: true,
        userMessage: 'Server error occurred. Please try again in a few moments.',
        technicalDetails: 'HTTP 5xx server error.',
      };
    }

    // Client Errors (4xx)
    if (message.includes('400') || message.includes('404') || 
        message.includes('not found')) {
      return {
        type: BlogErrorType.CLIENT_ERROR,
        message: error.message,
        originalError: error,
        context,
        timestamp,
        retryable: false,
        userMessage: 'The requested content was not found.',
        technicalDetails: 'HTTP 4xx client error.',
      };
    }

    // Default to unknown error
    return {
      type: BlogErrorType.UNKNOWN_ERROR,
      message: error.message,
      originalError: error,
      context,
      timestamp,
      retryable: false,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalDetails: 'Unrecognized error type.',
    };
  }

  private trackError(errorType: BlogErrorType): void {
    const currentCount = this.errorCounts.get(errorType) || 0;
    this.errorCounts.set(errorType, currentCount + 1);
    this.lastErrors.set(errorType, new Date());
  }

  private logError(blogError: BlogError): void {
    const logData = {
      type: blogError.type,
      message: blogError.message,
      context: blogError.context,
      retryable: blogError.retryable,
      timestamp: blogError.timestamp.toISOString(),
      technicalDetails: blogError.technicalDetails,
    };

    // Log with appropriate level based on error type
    switch (blogError.type) {
      case BlogErrorType.SANITY_CORS:
      case BlogErrorType.SANITY_PERMISSION:
        logger.error('Critical blog error', logData, blogError.originalError);
        break;
      case BlogErrorType.SANITY_TIMEOUT:
      case BlogErrorType.SANITY_RATE_LIMIT:
      case BlogErrorType.NETWORK_ERROR:
        logger.warn('Recoverable blog error', logData);
        break;
      case BlogErrorType.IMAGE_PROCESSING:
      case BlogErrorType.MARKDOWN_PARSING:
        logger.warn('Content processing error', logData);
        break;
      default:
        logger.error('Blog error', logData, blogError.originalError);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, { count: number; lastOccurrence?: Date }> {
    const stats: Record<string, { count: number; lastOccurrence?: Date }> = {};
    
    for (const [errorType, count] of this.errorCounts.entries()) {
      stats[errorType] = {
        count,
        lastOccurrence: this.lastErrors.get(errorType),
      };
    }
    
    return stats;
  }

  /**
   * Clear error statistics
   */
  clearStats(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }

  /**
   * Check if error type is experiencing high frequency
   */
  isHighFrequencyError(errorType: BlogErrorType, threshold: number = 10, timeWindow: number = 300000): boolean {
    const count = this.errorCounts.get(errorType) || 0;
    const lastError = this.lastErrors.get(errorType);
    
    if (!lastError) return false;
    
    const timeSinceLastError = Date.now() - lastError.getTime();
    return count >= threshold && timeSinceLastError <= timeWindow;
  }
}

/**
 * Utility function to handle errors consistently across the blog system
 */
export function handleBlogError(error: Error | unknown, context?: Record<string, any>): BlogError {
  const errorHandler = BlogErrorHandler.getInstance();
  return errorHandler.processError(error, context);
}

/**
 * React error boundary compatible error handler
 */
export function handleReactError(error: Error, errorInfo: { componentStack: string }): BlogError {
  const context = {
    componentStack: errorInfo.componentStack,
    errorBoundary: true,
  };
  
  return handleBlogError(error, context);
}

/**
 * API route error handler
 */
export function handleApiError(error: Error | unknown, req?: any): BlogError {
  const context = {
    url: req?.url,
    method: req?.method,
    userAgent: req?.headers?.['user-agent'],
    apiRoute: true,
  };
  
  return handleBlogError(error, context);
}

export default BlogErrorHandler;
