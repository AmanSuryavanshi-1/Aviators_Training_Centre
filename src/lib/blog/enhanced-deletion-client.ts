/**
 * Enhanced Sanity Client with Deletion-Specific Error Handling
 * 
 * Extends the base Sanity client with specialized deletion capabilities,
 * comprehensive error categorization, retry logic, and connection monitoring.
 */

import { enhancedClient } from '@/lib/sanity/client';
import { DeletionError } from '@/lib/types/blog';
import { logEnvDiagnostics, validateSanityEnv } from '@/lib/utils/env-diagnostics';

// Force load environment variables if not in browser
if (typeof window === 'undefined') {
  try {
    const { config } = require('dotenv');
    const { resolve } = require('path');
    config({ path: resolve(process.cwd(), '.env.local') });
  } catch (error) {
    console.warn('Could not load dotenv:', error);
  }
}

export interface DeletionClientOptions {
  retryAttempts?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  validateConnection?: boolean;
  enableCircuitBreaker?: boolean;
  timeout?: number;
}

export interface DeletionConnectionHealth {
  isHealthy: boolean;
  latency: number;
  canDelete: boolean;
  lastChecked: string;
  errors: string[];
  warnings: string[];
}

export interface DeletionOperationResult {
  success: boolean;
  documentId: string;
  duration: number;
  retryCount: number;
  error?: DeletionError;
  connectionHealth?: DeletionConnectionHealth;
}

export class EnhancedDeletionClient {
  private static instance: EnhancedDeletionClient;
  private connectionHealthCache: Map<string, DeletionConnectionHealth> = new Map();
  private healthCacheTTL = 60000; // 1 minute
  private activeOperations: Set<string> = new Set();
  private operationTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  static getInstance(): EnhancedDeletionClient {
    if (!EnhancedDeletionClient.instance) {
      EnhancedDeletionClient.instance = new EnhancedDeletionClient();
    }
    return EnhancedDeletionClient.instance;
  }

  /**
   * Enhanced delete operation with comprehensive error handling
   */
  async deleteDocument(
    documentId: string,
    options: DeletionClientOptions = {}
  ): Promise<DeletionOperationResult> {
    const startTime = Date.now();
    const operationId = `delete_${documentId}_${startTime}`;
    
    // Prevent duplicate operations
    if (this.activeOperations.has(documentId)) {
      return {
        success: false,
        documentId,
        duration: 0,
        retryCount: 0,
        error: {
          code: 'OPERATION_IN_PROGRESS',
          message: 'Deletion operation already in progress for this document',
          category: 'validation',
          retryable: false,
          suggestedAction: 'Wait for the current operation to complete'
        }
      };
    }

    this.activeOperations.add(documentId);

    // Set operation timeout
    if (options.timeout) {
      const timeoutId = setTimeout(() => {
        this.activeOperations.delete(documentId);
        this.operationTimeouts.delete(operationId);
      }, options.timeout);
      this.operationTimeouts.set(operationId, timeoutId);
    }

    try {
      const finalOptions: Required<DeletionClientOptions> = {
        retryAttempts: 3,
        retryDelay: 1000,
        exponentialBackoff: true,
        validateConnection: true,
        enableCircuitBreaker: true,
        timeout: 30000,
        ...options
      };

      // Validate connection health before attempting deletion
      if (finalOptions.validateConnection) {
        const connectionHealth = await this.checkConnectionHealth();
        if (!connectionHealth.isHealthy || !connectionHealth.canDelete) {
          return {
            success: false,
            documentId,
            duration: Date.now() - startTime,
            retryCount: 0,
            connectionHealth,
            error: {
              code: 'CONNECTION_UNHEALTHY',
              message: `Connection is not healthy for deletion: ${connectionHealth.errors.join(', ')}`,
              category: 'network',
              retryable: true,
              suggestedAction: 'Check network connection and Sanity service status'
            }
          };
        }
      }

      // Attempt deletion with retry logic
      const result = await this.attemptDeletionWithRetry(
        documentId,
        finalOptions,
        startTime
      );

      return result;

    } catch (error) {
      return {
        success: false,
        documentId,
        duration: Date.now() - startTime,
        retryCount: 0,
        error: this.categorizeDeletionError(error)
      };
    } finally {
      this.activeOperations.delete(documentId);
      const timeoutId = this.operationTimeouts.get(operationId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        this.operationTimeouts.delete(operationId);
      }
    }
  }

  /**
   * Check connection health specifically for deletion operations
   */
  async checkConnectionHealth(): Promise<DeletionConnectionHealth> {
    const cacheKey = 'deletion_health';
    const cached = this.connectionHealthCache.get(cacheKey);
    
    if (cached && Date.now() - new Date(cached.lastChecked).getTime() < this.healthCacheTTL) {
      return cached;
    }

    const startTime = Date.now();
    const health: DeletionConnectionHealth = {
      isHealthy: false,
      latency: 0,
      canDelete: false,
      lastChecked: new Date().toISOString(),
      errors: [],
      warnings: []
    };

    try {
      // Test basic connectivity
      const connectivityTest = await enhancedClient.validateConnection();
      health.latency = Date.now() - startTime;

      if (!connectivityTest.isValid) {
        health.errors.push('Basic connectivity test failed');
        health.errors.push(connectivityTest.error || 'Unknown connection error');
      } else {
        health.isHealthy = true;
      }

      // Test write permissions specifically for deletion
      if (health.isHealthy) {
        try {
          const writeCapability = await enhancedClient.canPerformWrites();
          if (!writeCapability.canWrite) {
            health.canDelete = false;
            health.errors.push('No write permissions for deletion operations');
            health.errors.push(writeCapability.reason || 'Unknown permission error');
          } else {
            health.canDelete = true;
          }
        } catch (permissionError) {
          health.canDelete = false;
          health.errors.push('Failed to verify deletion permissions');
        }
      }

      // Performance warnings
      if (health.latency > 2000) {
        health.warnings.push('High latency detected - deletion operations may be slow');
      }

      // Check for API token
      const hasToken = process.env.SANITY_API_TOKEN || enhancedClient.client.config().token;
      if (!hasToken) {
        health.canDelete = false;
        health.errors.push('SANITY_API_TOKEN not configured');
      }

      // Cache the result
      this.connectionHealthCache.set(cacheKey, health);

      return health;

    } catch (error) {
      health.errors.push(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return health;
    }
  }

  /**
   * Attempt deletion with retry logic and exponential backoff
   */
  private async attemptDeletionWithRetry(
    documentId: string,
    options: Required<DeletionClientOptions>,
    startTime: number
  ): Promise<DeletionOperationResult> {
    let lastError: DeletionError | null = null;
    let retryCount = 0;

    for (let attempt = 0; attempt <= options.retryAttempts; attempt++) {
      try {
        if (attempt > 0) {
          retryCount = attempt;
          // Calculate delay with exponential backoff
          const delay = options.exponentialBackoff
            ? options.retryDelay * Math.pow(2, attempt - 1)
            : options.retryDelay;
          
          console.log(`Retrying deletion of ${documentId} (attempt ${attempt + 1}/${options.retryAttempts + 1}) after ${delay}ms`);
          await this.sleep(delay);
        }

        // Perform the actual deletion
        const deleteResult = await this.performDeletion(documentId, options);
        
        if (deleteResult.success) {
          return {
            success: true,
            documentId,
            duration: Date.now() - startTime,
            retryCount
          };
        }

        lastError = deleteResult.error!;

        // Check if error is retryable
        if (!deleteResult.error?.retryable || attempt >= options.retryAttempts) {
          break;
        }

      } catch (error) {
        lastError = this.categorizeDeletionError(error);
        
        // Don't retry non-retryable errors
        if (!lastError.retryable || attempt >= options.retryAttempts) {
          break;
        }
      }
    }

    return {
      success: false,
      documentId,
      duration: Date.now() - startTime,
      retryCount,
      error: lastError!
    };
  }

  /**
   * Perform the actual deletion operation
   */
  private async performDeletion(
    documentId: string,
    options: Required<DeletionClientOptions>
  ): Promise<{ success: boolean; error?: DeletionError }> {
    try {
      console.log(`🗑️ Attempting to delete document: ${documentId}`);
      
      // Only perform environment diagnostics on server side
      if (typeof window === 'undefined') {
        logEnvDiagnostics('Enhanced Deletion Client');
        const envValidation = validateSanityEnv();
        
        if (!envValidation.isValid) {
          console.error('❌ Environment validation failed:', envValidation.errors);
          throw new Error(`Environment configuration error: ${envValidation.errors.join(', ')}`);
        }
      } else {
        // Client-side: This should not happen, throw appropriate error
        throw new Error('Deletion operations must be performed on the server side. Use API endpoints instead.');
      }
      
      // Check if we have the necessary token
      const envToken = process.env.SANITY_API_TOKEN;
      const clientToken = enhancedClient.client.config().token;
      const hasToken = envToken || clientToken;
      
      console.log('🔍 Token availability check:', {
        envToken: envToken ? 'Present' : 'Missing',
        clientToken: clientToken ? 'Present' : 'Missing',
        hasToken: !!hasToken
      });
      
      if (!hasToken) {
        logEnvDiagnostics('Token Check Failed');
        throw new Error('SANITY_API_TOKEN is required for delete operations. Please check your environment configuration.');
      }
      
      // Use enhanced client with circuit breaker if enabled
      const deleteOptions = {
        validateConnection: false, // We already validated
        useCircuitBreaker: options.enableCircuitBreaker
      };

      const result = await enhancedClient.delete(documentId, deleteOptions);
      
      console.log(`✅ Successfully deleted document: ${documentId}`);
      return { success: true };

    } catch (error) {
      console.error(`❌ Failed to delete document ${documentId}:`, error);
      
      // Log additional diagnostics on error
      logEnvDiagnostics('Deletion Error Context');
      
      return {
        success: false,
        error: this.categorizeDeletionError(error)
      };
    }
  }

  /**
   * Categorize deletion-specific errors with detailed analysis
   */
  private categorizeDeletionError(error: unknown): DeletionError {
    if (!error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred during deletion',
        category: 'unknown',
        retryable: false
      };
    }

    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';
    const statusCode = error.statusCode || error.status || 0;

    // Document not found (common in deletion scenarios)
    if (errorMessage.includes('document not found') || 
        errorMessage.includes('not found') || 
        statusCode === 404) {
      return {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found - it may have already been deleted',
        category: 'validation',
        retryable: false,
        suggestedAction: 'Verify the document ID and refresh the page'
      };
    }

    // Permission errors specific to deletion
    if (errorMessage.includes('insufficient permissions') ||
        errorMessage.includes('permission "delete" required') ||
        errorMessage.includes('permission "update" required') ||
        statusCode === 401 || statusCode === 403) {
      return {
        code: 'DELETION_PERMISSION_ERROR',
        message: 'Insufficient permissions to delete this document',
        category: 'permission',
        retryable: false,
        suggestedAction: 'Ensure your API token has delete permissions for this dataset'
      };
    }

    // Document locked or in use
    if (errorMessage.includes('document is locked') ||
        errorMessage.includes('document in use') ||
        errorMessage.includes('conflict')) {
      return {
        code: 'DOCUMENT_LOCKED',
        message: 'Document is currently locked or being edited by another user',
        category: 'validation',
        retryable: true,
        suggestedAction: 'Wait a moment and try again, or check if someone else is editing this document'
      };
    }

    // Network connectivity issues
    if (errorCode === 'ENOTFOUND' || 
        errorCode === 'ECONNREFUSED' || 
        errorCode === 'ETIMEDOUT' ||
        errorMessage.includes('network error') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed during deletion',
        category: 'network',
        retryable: true,
        suggestedAction: 'Check your internet connection and try again'
      };
    }

    // Rate limiting
    if (statusCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      return {
        code: 'RATE_LIMITED',
        message: 'Too many deletion requests - rate limit exceeded',
        category: 'server',
        retryable: true,
        suggestedAction: 'Wait a few minutes before attempting more deletions'
      };
    }

    // Server errors
    if (statusCode >= 500 || 
        errorMessage.includes('internal server error') ||
        errorMessage.includes('service unavailable') ||
        errorMessage.includes('bad gateway')) {
      return {
        code: 'SERVER_ERROR',
        message: 'Sanity server error during deletion',
        category: 'server',
        retryable: true,
        suggestedAction: 'Try again in a few minutes or check Sanity service status'
      };
    }

    // Validation errors
    if (statusCode === 400 || 
        errorMessage.includes('validation') ||
        errorMessage.includes('invalid document') ||
        errorMessage.includes('bad request')) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Document validation failed during deletion',
        category: 'validation',
        retryable: false,
        suggestedAction: 'Check the document structure and try again'
      };
    }

    // Circuit breaker errors
    if (errorMessage.includes('circuit breaker') || errorMessage.includes('circuit open')) {
      return {
        code: 'CIRCUIT_BREAKER_OPEN',
        message: 'Circuit breaker is open - too many recent failures',
        category: 'server',
        retryable: true,
        suggestedAction: 'Wait for the circuit breaker to reset and try again'
      };
    }

    // Timeout errors
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return {
        code: 'OPERATION_TIMEOUT',
        message: 'Deletion operation timed out',
        category: 'network',
        retryable: true,
        suggestedAction: 'Try again with a longer timeout or check network connectivity'
      };
    }

    // Default unknown error
    return {
      code: 'UNKNOWN_DELETION_ERROR',
      message: error.message || 'An unexpected error occurred during deletion',
      category: 'unknown',
      retryable: false,
      suggestedAction: 'Contact support if this error persists',
      originalError: error
    };
  }

  /**
   * Bulk deletion with individual error handling
   */
  async bulkDeleteDocuments(
    documentIds: string[],
    options: DeletionClientOptions & { maxConcurrent?: number; continueOnError?: boolean } = {}
  ): Promise<{
    success: boolean;
    results: DeletionOperationResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      duration: number;
    };
  }> {
    const startTime = Date.now();
    const maxConcurrent = options.maxConcurrent || 3;
    const continueOnError = options.continueOnError ?? true;
    
    const results: DeletionOperationResult[] = [];
    let successful = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the system
    const batches = this.createBatches(documentIds, maxConcurrent);

    for (const batch of batches) {
      const batchPromises = batch.map(documentId =>
        this.deleteDocument(documentId, options)
      );

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        results.push(result);
        if (result.success) {
          successful++;
        } else {
          failed++;
          if (!continueOnError) {
            // Stop processing if continueOnError is false
            break;
          }
        }
      }

      if (!continueOnError && failed > 0) {
        break;
      }
    }

    return {
      success: failed === 0,
      results,
      summary: {
        total: documentIds.length,
        successful,
        failed,
        duration: Date.now() - startTime
      }
    };
  }

  /**
   * Clear connection health cache
   */
  clearHealthCache(): void {
    this.connectionHealthCache.clear();
    console.log('Deletion client health cache cleared');
  }

  /**
   * Get active operations count
   */
  getActiveOperationsCount(): number {
    return this.activeOperations.size;
  }

  /**
   * Get active operations list
   */
  getActiveOperations(): string[] {
    return Array.from(this.activeOperations);
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}

// Export singleton instance
export const enhancedDeletionClient = EnhancedDeletionClient.getInstance();