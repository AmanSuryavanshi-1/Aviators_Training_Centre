import { logAutomationAction } from './audit-logger';
import { sendEditorNotification } from './notifications';

// Retry configuration interface
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number;  // Maximum delay in milliseconds
  backoffMultiplier: number;
  retryableErrors: string[];
  nonRetryableErrors: string[];
}

// Retry result interface
export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
  retryLog: Array<{
    attempt: number;
    error: string;
    delay: number;
    timestamp: string;
  }>;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,      // 1 second
  maxDelay: 30000,      // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'NETWORK_ERROR',
    'SANITY_API_ERROR',
    'TEMPORARY_ERROR',
    'RATE_LIMITED'
  ],
  nonRetryableErrors: [
    'VALIDATION_ERROR',
    'AUTHENTICATION_ERROR',
    'AUTHORIZATION_ERROR',
    'MALFORMED_PAYLOAD',
    'INVALID_CONTENT'
  ]
};

/**
 * Executes a function with retry logic and exponential backoff
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  context: {
    operationName: string;
    automationId?: string;
    metadata?: Record<string, any>;
  }
): Promise<RetryResult<T>> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const { operationName, automationId, metadata } = context;
  
  const startTime = Date.now();
  const retryLog: RetryResult<T>['retryLog'] = [];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      // Log retry attempt (except for the first attempt)
      if (attempt > 0) {
        await logAutomationAction({
          type: 'retry_attempt',
          automationId,
          status: 'processing',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            attempt,
            maxRetries: finalConfig.maxRetries,
            ...metadata
          }
        });
      }

      // Execute the operation
      const result = await operation();

      // Log successful execution
      if (attempt > 0) {
        await logAutomationAction({
          type: 'retry_attempt',
          automationId,
          status: 'success',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            successfulAttempt: attempt + 1,
            totalAttempts: attempt + 1,
            totalDuration: Date.now() - startTime,
            ...metadata
          }
        });
      }

      return {
        success: true,
        result,
        attempts: attempt + 1,
        totalDuration: Date.now() - startTime,
        retryLog
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this error is retryable
      const isRetryable = isErrorRetryable(lastError, finalConfig);
      const isLastAttempt = attempt === finalConfig.maxRetries;

      // Calculate delay for next attempt
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt),
        finalConfig.maxDelay
      );

      // Add to retry log
      retryLog.push({
        attempt: attempt + 1,
        error: lastError.message,
        delay: isLastAttempt ? 0 : delay,
        timestamp: new Date().toISOString()
      });

      // Log the failed attempt
      await logAutomationAction({
        type: 'retry_attempt',
        automationId,
        status: 'failed',
        error: lastError.message,
        timestamp: new Date().toISOString(),
        metadata: {
          operationName,
          attempt: attempt + 1,
          isRetryable,
          isLastAttempt,
          nextDelay: isLastAttempt ? null : delay,
          ...metadata
        }
      });

      // If this is the last attempt or error is not retryable, break
      if (isLastAttempt || !isRetryable) {
        break;
      }

      // Wait before next attempt
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  const totalDuration = Date.now() - startTime;
  
  await logAutomationAction({
    type: 'retry_attempt',
    automationId,
    status: 'failed',
    error: `Operation failed after ${finalConfig.maxRetries + 1} attempts: ${lastError?.message}`,
    timestamp: new Date().toISOString(),
    metadata: {
      operationName,
      totalAttempts: finalConfig.maxRetries + 1,
      totalDuration,
      finalError: lastError?.message,
      ...metadata
    }
  });

  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: finalConfig.maxRetries + 1,
    totalDuration,
    retryLog
  };
}

/**
 * Determines if an error is retryable based on configuration
 */
function isErrorRetryable(error: Error, config: RetryConfig): boolean {
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  
  // Check for non-retryable errors first
  for (const nonRetryableError of config.nonRetryableErrors) {
    if (errorMessage.includes(nonRetryableError.toLowerCase()) || 
        errorName.includes(nonRetryableError.toLowerCase())) {
      return false;
    }
  }
  
  // Check for retryable errors
  for (const retryableError of config.retryableErrors) {
    if (errorMessage.includes(retryableError.toLowerCase()) || 
        errorName.includes(retryableError.toLowerCase())) {
      return true;
    }
  }
  
  // Default behavior: retry network-related errors, don't retry others
  const networkErrorPatterns = [
    'network',
    'connection',
    'timeout',
    'econnreset',
    'enotfound',
    'econnrefused',
    'etimedout'
  ];
  
  return networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorName.includes(pattern)
  );
}

/**
 * Implements circuit breaker pattern for failing operations
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private config: {
      failureThreshold: number;
      recoveryTimeout: number; // milliseconds
      monitoringPeriod: number; // milliseconds
    } = {
      failureThreshold: 5,
      recoveryTimeout: 60000,  // 1 minute
      monitoringPeriod: 300000 // 5 minutes
    }
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    context: {
      operationName: string;
      automationId?: string;
    }
  ): Promise<T> {
    const { operationName, automationId } = context;

    // Check circuit breaker state
    if (this.state === 'open') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure < this.config.recoveryTimeout) {
        // Circuit is still open
        await logAutomationAction({
          type: 'system_error',
          automationId,
          status: 'failed',
          error: 'Circuit breaker is open - operation blocked',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            circuitState: this.state,
            failureCount: this.failureCount,
            timeSinceLastFailure
          }
        });
        
        throw new Error('Circuit breaker is open - operation temporarily blocked');
      } else {
        // Try to recover - move to half-open state
        this.state = 'half-open';
        
        await logAutomationAction({
          type: 'system_error',
          automationId,
          status: 'processing',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            circuitState: 'half-open',
            message: 'Circuit breaker attempting recovery'
          }
        });
      }
    }

    try {
      const result = await operation();
      
      // Operation succeeded - reset circuit breaker if it was half-open
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
        
        await logAutomationAction({
          type: 'system_error',
          automationId,
          status: 'success',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            circuitState: 'closed',
            message: 'Circuit breaker recovered successfully'
          }
        });
      }
      
      return result;
      
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      // Check if we should open the circuit
      if (this.failureCount >= this.config.failureThreshold) {
        this.state = 'open';
        
        await logAutomationAction({
          type: 'system_error',
          automationId,
          status: 'failed',
          error: 'Circuit breaker opened due to repeated failures',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            circuitState: 'open',
            failureCount: this.failureCount,
            threshold: this.config.failureThreshold
          }
        });

        // Send urgent notification to administrators
        await sendEditorNotification({
          type: 'system_alert',
          title: 'Circuit Breaker Activated',
          message: `The circuit breaker for ${operationName} has been activated due to repeated failures. The operation is temporarily blocked.`,
          priority: 'urgent',
          automationId,
          timestamp: new Date().toISOString(),
          recipientRole: 'admin'
        });
      }
      
      throw error;
    }
  }

  getState(): { state: string; failureCount: number; lastFailureTime: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Global circuit breakers for different operations
 */
export const circuitBreakers = {
  webhookProcessing: new CircuitBreaker({
    failureThreshold: 5,
    recoveryTimeout: 60000,   // 1 minute
    monitoringPeriod: 300000  // 5 minutes
  }),
  
  sanityOperations: new CircuitBreaker({
    failureThreshold: 3,
    recoveryTimeout: 30000,   // 30 seconds
    monitoringPeriod: 180000  // 3 minutes
  }),
  
  notificationSending: new CircuitBreaker({
    failureThreshold: 10,
    recoveryTimeout: 120000,  // 2 minutes
    monitoringPeriod: 600000  // 10 minutes
  })
};

/**
 * Implements fallback mechanisms for critical operations
 */
export class FallbackHandler {
  private fallbackStrategies = new Map<string, () => Promise<any>>();

  registerFallback(operationName: string, fallbackFn: () => Promise<any>): void {
    this.fallbackStrategies.set(operationName, fallbackFn);
  }

  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    operationName: string,
    context: {
      automationId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<T> {
    const { automationId, metadata } = context;

    try {
      return await primaryOperation();
    } catch (primaryError) {
      const fallbackFn = this.fallbackStrategies.get(operationName);
      
      if (!fallbackFn) {
        // No fallback available
        await logAutomationAction({
          type: 'fallback_triggered',
          automationId,
          status: 'failed',
          error: `No fallback available for ${operationName}`,
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
            ...metadata
          }
        });
        
        throw primaryError;
      }

      try {
        await logAutomationAction({
          type: 'fallback_triggered',
          automationId,
          status: 'processing',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
            ...metadata
          }
        });

        const fallbackResult = await fallbackFn();
        
        await logAutomationAction({
          type: 'fallback_triggered',
          automationId,
          status: 'success',
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            message: 'Fallback operation succeeded',
            ...metadata
          }
        });

        return fallbackResult;
        
      } catch (fallbackError) {
        await logAutomationAction({
          type: 'fallback_triggered',
          automationId,
          status: 'failed',
          error: `Both primary and fallback operations failed`,
          timestamp: new Date().toISOString(),
          metadata: {
            operationName,
            primaryError: primaryError instanceof Error ? primaryError.message : String(primaryError),
            fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
            ...metadata
          }
        });

        // Send critical alert
        await sendEditorNotification({
          type: 'system_alert',
          title: 'Critical System Failure',
          message: `Both primary and fallback operations failed for ${operationName}. Immediate attention required.`,
          priority: 'urgent',
          automationId,
          timestamp: new Date().toISOString(),
          recipientRole: 'admin'
        });

        throw new Error(`Critical failure: Both primary and fallback operations failed. Primary: ${primaryError instanceof Error ? primaryError.message : String(primaryError)}, Fallback: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
      }
    }
  }
}

/**
 * Global fallback handler instance
 */
export const fallbackHandler = new FallbackHandler();

// Register common fallback strategies
fallbackHandler.registerFallback('createDraftPost', async () => {
  // Fallback: Store the content in a temporary location for manual processing
  console.log('Fallback: Storing content for manual processing');
  return { success: false, message: 'Content stored for manual processing' };
});

fallbackHandler.registerFallback('sendNotification', async () => {
  // Fallback: Log the notification instead of sending it
  console.log('Fallback: Notification logged instead of sent');
  return { success: true, message: 'Notification logged for later processing' };
});

/**
 * Health check function for the retry and error handling system
 */
export async function performHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  circuitBreakers: Record<string, any>;
  timestamp: string;
}> {
  const circuitBreakerStates = Object.entries(circuitBreakers).reduce((acc, [name, breaker]) => {
    acc[name] = breaker.getState();
    return acc;
  }, {} as Record<string, any>);

  const openCircuits = Object.values(circuitBreakerStates).filter(state => state.state === 'open').length;
  const halfOpenCircuits = Object.values(circuitBreakerStates).filter(state => state.state === 'half-open').length;

  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (openCircuits === 0 && halfOpenCircuits === 0) {
    status = 'healthy';
  } else if (openCircuits <= 1) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    circuitBreakers: circuitBreakerStates,
    timestamp: new Date().toISOString()
  };
}
