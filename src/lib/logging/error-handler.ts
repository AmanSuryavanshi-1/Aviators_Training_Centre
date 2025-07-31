/**
 * Production error handling with comprehensive logging
 * Handles errors gracefully without exposing sensitive information
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, securityLogger } from './production-logger';

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE_ERROR',
  DATABASE = 'DATABASE_ERROR',
  CACHE = 'CACHE_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

// Custom error class
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response interface
interface ErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    timestamp: string;
    requestId?: string;
  };
  details?: any;
}

// Production error handler
export class ProductionErrorHandler {
  // Handle API errors
  static handleApiError(
    error: Error | AppError,
    req?: NextRequest,
    requestId?: string
  ): NextResponse<ErrorResponse> {
    const timestamp = new Date().toISOString();
    
    // Determine if it's an operational error
    const isAppError = error instanceof AppError;
    const isOperational = isAppError ? error.isOperational : false;
    
    // Get error details
    const statusCode = isAppError ? error.statusCode : 500;
    const errorType = isAppError ? error.type : ErrorType.INTERNAL;
    const context = isAppError ? error.context : undefined;
    
    // Log the error
    if (isOperational) {
      logger.warn('Operational error occurred', {
        type: errorType,
        message: error.message,
        statusCode,
        context,
        requestId,
        url: req?.url,
        method: req?.method,
      });
    } else {
      logger.error('System error occurred', {
        type: errorType,
        message: error.message,
        statusCode,
        context,
        requestId,
        url: req?.url,
        method: req?.method,
      }, error);
    }
    
    // Log security events for certain error types
    if ([ErrorType.AUTHENTICATION, ErrorType.AUTHORIZATION, ErrorType.RATE_LIMIT].includes(errorType)) {
      securityLogger.logSecurityEvent(errorType, 'medium', {
        message: error.message,
        url: req?.url,
        method: req?.method,
        userAgent: req?.headers.get('user-agent'),
        ip: req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip'),
        requestId,
      });
    }
    
    // Create error response
    const errorResponse: ErrorResponse = {
      error: {
        message: this.getSafeErrorMessage(error, isOperational),
        type: errorType,
        code: statusCode,
        timestamp,
        requestId,
      },
    };
    
    // Add details only in development
    if (process.env.NODE_ENV === 'development' && !isOperational) {
      errorResponse.details = {
        stack: error.stack,
        context,
      };
    }
    
    return NextResponse.json(errorResponse, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Type': errorType,
      },
    });
  }
  
  // Get safe error message for production
  private static getSafeErrorMessage(error: Error | AppError, isOperational: boolean): string {
    // For operational errors, return the actual message
    if (isOperational && error instanceof AppError) {
      return error.message;
    }
    
    // For system errors in production, return generic message
    if (process.env.NODE_ENV === 'production' && !isOperational) {
      return 'An internal server error occurred. Please try again later.';
    }
    
    // In development, return actual message
    return error.message;
  }
  
  // Handle unhandled promise rejections
  static handleUnhandledRejection(reason: any, promise: Promise<any>): void {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.toString(),
      stack: reason?.stack,
    });
    
    // In production, you might want to restart the process
    if (process.env.NODE_ENV === 'production') {
      console.error('Unhandled Promise Rejection - considering process restart');
      // process.exit(1); // Uncomment if you want to restart on unhandled rejections
    }
  }
  
  // Handle uncaught exceptions
  static handleUncaughtException(error: Error): void {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
    });
    
    // Graceful shutdown
    console.error('Uncaught Exception - shutting down gracefully');
    process.exit(1);
  }
}

// Common error creators
export const createValidationError = (message: string, context?: Record<string, any>) =>
  new AppError(message, ErrorType.VALIDATION, 400, true, context);

export const createAuthenticationError = (message: string = 'Authentication required') =>
  new AppError(message, ErrorType.AUTHENTICATION, 401, true);

export const createAuthorizationError = (message: string = 'Insufficient permissions') =>
  new AppError(message, ErrorType.AUTHORIZATION, 403, true);

export const createNotFoundError = (resource: string = 'Resource') =>
  new AppError(`${resource} not found`, ErrorType.NOT_FOUND, 404, true);

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new AppError(message, ErrorType.RATE_LIMIT, 429, true);

export const createExternalServiceError = (service: string, message?: string) =>
  new AppError(
    message || `External service ${service} is unavailable`,
    ErrorType.EXTERNAL_SERVICE,
    503,
    true,
    { service }
  );

export const createDatabaseError = (operation: string, message?: string) =>
  new AppError(
    message || `Database operation failed: ${operation}`,
    ErrorType.DATABASE,
    500,
    false,
    { operation }
  );

export const createCacheError = (operation: string, message?: string) =>
  new AppError(
    message || `Cache operation failed: ${operation}`,
    ErrorType.CACHE,
    500,
    true,
    { operation }
  );

// Error handling middleware for API routes
export const withErrorHandling = (
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) => {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    
    try {
      return await handler(req, ...args);
    } catch (error) {
      return ProductionErrorHandler.handleApiError(
        error as Error,
        req,
        requestId
      );
    }
  };
};

// Setup global error handlers
export const setupGlobalErrorHandlers = (): void => {
  process.on('unhandledRejection', ProductionErrorHandler.handleUnhandledRejection);
  process.on('uncaughtException', ProductionErrorHandler.handleUncaughtException);
  
  // Handle SIGTERM gracefully
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });
  
  // Handle SIGINT gracefully
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};

export default ProductionErrorHandler;
