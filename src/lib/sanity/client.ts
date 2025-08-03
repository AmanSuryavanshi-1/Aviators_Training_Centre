import { createClient } from "next-sanity";
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables if not in browser
if (typeof window === 'undefined') {
  config({ path: resolve(process.cwd(), '.env.local') });
}

// Connection validation interface
interface ConnectionValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    projectId: string;
    dataset: string;
    apiVersion: string;
    hasToken: boolean;
    tokenPermissions?: string[];
  };
  latency?: number;
}

// Enhanced Sanity client configuration with optimized settings
// Debug environment variables
console.log('🔍 Sanity client configuration:', {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  hasToken: !!process.env.SANITY_API_TOKEN,
  nodeEnv: process.env.NODE_ENV
});

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", 
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: false, // Disable CDN for immediate updates
  token: process.env.SANITY_API_TOKEN, // Add token for write operations
  // Enhanced configuration for better performance and reliability
  perspective: 'published',
  stega: {
    enabled: false,
    studioUrl: process.env.NODE_ENV === 'development' ? '/studio' : undefined,
  },
  // Request timeout for better error handling
  requestTagPrefix: 'blog-',
  ignoreBrowserTokenWarning: true,
});

// Enhanced image URL builder with error handling
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  try {
    if (!source) {
      console.warn('urlFor called with null/undefined source');
      return builder.image({} as SanityImageSource);
    }
    return builder.image(source);
  } catch (error) {
    console.error('Error building image URL:', error);
    // Return a fallback builder that won't crash
    return builder.image({} as SanityImageSource);
  }
}

// Enhanced client with retry logic and error handling
export class EnhancedSanityClient {
  private static instance: EnhancedSanityClient;
  public client = client; // Make client public for asset uploads
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private connectionValidated = false;
  private lastValidationTime = 0;
  private validationCacheDuration = 300000; // 5 minutes

  static getInstance(): EnhancedSanityClient {
    if (!EnhancedSanityClient.instance) {
      EnhancedSanityClient.instance = new EnhancedSanityClient();
    }
    return EnhancedSanityClient.instance;
  }

  /**
   * Validates the Sanity connection and configuration
   */
  async validateConnection(forceRevalidation = false): Promise<ConnectionValidationResult> {
    const now = Date.now();
    
    // Use cached validation if recent and not forcing revalidation
    if (!forceRevalidation && 
        this.connectionValidated && 
        (now - this.lastValidationTime) < this.validationCacheDuration) {
      return {
        isValid: true,
        details: {
          projectId: this.client.config().projectId || 'unknown',
          dataset: this.client.config().dataset || 'unknown',
          apiVersion: this.client.config().apiVersion || 'unknown',
          hasToken: !!process.env.SANITY_API_TOKEN,
        }
      };
    }

    const startTime = Date.now();
    const config = this.client.config();
    
    try {
      // Basic configuration validation
      if (!config.projectId) {
        return {
          isValid: false,
          error: 'SANITY_PROJECT_ID is missing. Please check your environment variables.',
          details: {
            projectId: 'missing',
            dataset: config.dataset || 'unknown',
            apiVersion: config.apiVersion || 'unknown',
            hasToken: !!process.env.SANITY_API_TOKEN,
          }
        };
      }

      if (!config.dataset) {
        return {
          isValid: false,
          error: 'SANITY_DATASET is missing. Please check your environment variables.',
          details: {
            projectId: config.projectId,
            dataset: 'missing',
            apiVersion: config.apiVersion || 'unknown',
            hasToken: !!process.env.SANITY_API_TOKEN,
          }
        };
      }

      // Test basic read access
      const testQuery = '*[_type == "post"][0]._id';
      await this.client.fetch(testQuery, {}, { cache: 'no-store' });

      // Test write access if token is available
      let tokenPermissions: string[] = ['read'];
      if (process.env.SANITY_API_TOKEN) {
        try {
          // Test create permission by attempting to create a test document
          // Use a simple document type that should be allowed
          const testDoc = {
            _type: 'post',
            title: 'Connection Test - Will be deleted immediately',
            slug: { current: `connection-test-${Date.now()}` },
            publishedAt: new Date().toISOString(),
            excerpt: 'This is a test document for connection validation',
            body: [
              {
                _type: 'block',
                children: [{ _type: 'span', text: 'Test content for connection validation' }]
              }
            ],
            featured: false,
            readingTime: 1,
            isDiagnosticTest: true
          };
          
          // Try to create and immediately delete
          const created = await this.client.create(testDoc);
          await this.client.delete(created._id);
          
          tokenPermissions.push('create', 'delete');
        } catch (writeError) {
          const errorMessage = (writeError as Error).message.toLowerCase();
          if (errorMessage.includes('insufficient permissions') || 
              errorMessage.includes('permission') ||
              errorMessage.includes('unauthorized')) {
            // Token exists but lacks permissions
            console.warn('Sanity token has limited permissions:', (writeError as Error).message);
          } else {
            // Other write error, but connection is still valid for reads
            console.warn('Write test failed but connection is valid for reads:', (writeError as Error).message);
          }
        }
      }

      const latency = Date.now() - startTime;
      this.connectionValidated = true;
      this.lastValidationTime = now;

      return {
        isValid: true,
        details: {
          projectId: config.projectId,
          dataset: config.dataset,
          apiVersion: config.apiVersion || 'unknown',
          hasToken: !!process.env.SANITY_API_TOKEN,
          tokenPermissions,
        },
        latency,
      };

    } catch (error) {
      const errorMessage = (error as Error).message;
      let friendlyError = this.getFriendlyErrorMessage(error as Error);

      return {
        isValid: false,
        error: friendlyError,
        details: {
          projectId: config.projectId || 'unknown',
          dataset: config.dataset || 'unknown',
          apiVersion: config.apiVersion || 'unknown',
          hasToken: !!process.env.SANITY_API_TOKEN,
        },
        latency: Date.now() - startTime,
      };
    }
  }

  /**
   * Converts technical Sanity errors into user-friendly messages
   */
  private getFriendlyErrorMessage(error: Error): string {
    const message = error.message.toLowerCase();

    // Network and connection errors
    if (message.includes('fetch failed') || message.includes('network error')) {
      return 'Unable to connect to Sanity. Please check your internet connection and try again.';
    }

    if (message.includes('enotfound') || message.includes('dns')) {
      return 'Cannot resolve Sanity API endpoint. Please check your network connection.';
    }

    if (message.includes('timeout') || message.includes('etimedout')) {
      return 'Connection to Sanity timed out. The service may be temporarily unavailable.';
    }

    // Authentication and authorization errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Sanity API token is invalid or expired. Please check your SANITY_API_TOKEN environment variable.';
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return 'Insufficient permissions. Please ensure your Sanity API token has the required permissions for this operation.';
    }

    if (message.includes('insufficient permissions')) {
      return 'Your Sanity API token does not have sufficient permissions. Please update the token permissions in the Sanity management console.';
    }

    // Configuration errors
    if (message.includes('project not found') || message.includes('404')) {
      return 'Sanity project not found. Please verify your SANITY_PROJECT_ID is correct.';
    }

    if (message.includes('dataset not found')) {
      return 'Sanity dataset not found. Please verify your SANITY_DATASET is correct.';
    }

    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return 'Too many requests to Sanity. Please wait a moment before trying again.';
    }

    // Server errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return 'Sanity service is temporarily unavailable. Please try again in a few minutes.';
    }

    // Generic fallback
    return `Sanity connection error: ${error.message}`;
  }

  /**
   * Checks if the current configuration supports write operations
   */
  async canPerformWrites(): Promise<{ canWrite: boolean; reason?: string }> {
    if (!process.env.SANITY_API_TOKEN) {
      return {
        canWrite: false,
        reason: 'No SANITY_API_TOKEN configured. Write operations require an API token.'
      };
    }

    try {
      const validation = await this.validateConnection(true); // Force revalidation
      if (!validation.isValid) {
        return {
          canWrite: false,
          reason: validation.error || 'Connection validation failed'
        };
      }

      const permissions = validation.details?.tokenPermissions || [];
      if (permissions.includes('create')) {
        return { canWrite: true };
      } else {
        return {
          canWrite: false,
          reason: 'API token does not have create permissions. Please update token permissions in Sanity management console.'
        };
      }
    } catch (error) {
      return {
        canWrite: false,
        reason: `Write capability check failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Gets detailed connection status for debugging
   */
  async getConnectionStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      connection: ConnectionValidationResult;
      writeCapability: { canWrite: boolean; reason?: string };
      circuitBreakerState?: string;
      lastError?: string;
    };
  }> {
    try {
      const connection = await this.validateConnection();
      const writeCapability = await this.canPerformWrites();
      
      // Get circuit breaker state if available
      let circuitBreakerState: string | undefined;
      try {
        const { blogCircuitBreakers } = await import('../blog/error-handling');
        circuitBreakerState = blogCircuitBreakers.sanityConnection.getState();
      } catch {
        // Circuit breaker not available
      }

      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (connection.isValid && writeCapability.canWrite) {
        status = 'healthy';
      } else if (connection.isValid && !writeCapability.canWrite) {
        status = 'degraded'; // Can read but not write
      } else {
        status = 'unhealthy';
      }

      return {
        status,
        details: {
          connection,
          writeCapability,
          circuitBreakerState,
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          connection: {
            isValid: false,
            error: (error as Error).message,
          },
          writeCapability: {
            canWrite: false,
            reason: 'Status check failed'
          },
          lastError: (error as Error).message,
        }
      };
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetch<T>(query: string, params: Record<string, any> = {}, options?: { 
    retries?: number;
    cache?: 'force-cache' | 'no-store' | 'default';
    next?: { revalidate?: number | false; tags?: string[] };
    useCircuitBreaker?: boolean;
    validateConnection?: boolean;
  }): Promise<T> {
    const retries = options?.retries ?? this.maxRetries;
    const useCircuitBreaker = options?.useCircuitBreaker ?? true;
    const validateConnection = options?.validateConnection ?? false;
    let lastError: Error | null = null;

    // Validate connection if requested
    if (validateConnection) {
      const validation = await this.validateConnection();
      if (!validation.isValid) {
        throw new Error(`Sanity connection invalid: ${validation.error}`);
      }
    }

    // Import circuit breaker if needed
    let circuitBreaker: unknown = null;
    if (useCircuitBreaker) {
      try {
        const { blogCircuitBreakers } = await import('../blog/error-handling');
        circuitBreaker = blogCircuitBreakers.sanityConnection;
      } catch (importError) {
        console.warn('Could not import circuit breaker, proceeding without it');
      }
    }

    const executeQuery = async (): Promise<T> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const startTime = Date.now();
          const result = await this.client.fetch<T>(query, params, {
            cache: options?.cache || 'default',
            next: options?.next,
          });
          
          const latency = Date.now() - startTime;
          
          // Log successful fetch for debugging (only in development)
          if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Sanity fetch successful (attempt ${attempt + 1}, ${latency}ms)`);
          }
          
          return result;
        } catch (error) {
          lastError = error as Error;
          
          // Enhanced error logging with more context
          const errorContext = {
            error: error instanceof Error ? error.message : 'Unknown error',
            friendlyError: this.getFriendlyErrorMessage(error as Error),
            query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
            params: Object.keys(params).length > 0 ? params : undefined,
            attempt: attempt + 1,
            maxAttempts: retries + 1,
            timestamp: new Date().toISOString(),
            circuitBreakerState: circuitBreaker?.getState() || 'N/A',
            isRetryable: this.isRetryableError(error as Error),
          };
          
          console.error(`❌ Sanity fetch failed (attempt ${attempt + 1}/${retries + 1}):`, errorContext);

          // Check if error is retryable
          const isRetryable = this.isRetryableError(error as Error);
          
          // Don't retry on the last attempt or if error is not retryable
          if (attempt === retries || !isRetryable) {
            if (!isRetryable) {
              console.error('❌ Error is not retryable, stopping attempts');
            }
            break;
          }

          // Exponential backoff with jitter
          const baseDelay = this.retryDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const delayMs = Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
          
          console.log(`⏳ Retrying in ${Math.round(delayMs)}ms...`);
          await this.delay(delayMs);
        }
      }

      // If all retries failed, throw a more descriptive error with friendly message
      const friendlyMessage = this.getFriendlyErrorMessage(lastError!);
      const technicalMessage = lastError?.message || 'Unknown error';
      
      throw new Error(`${friendlyMessage} (Technical: ${technicalMessage})`);
    };

    // Execute with or without circuit breaker
    if (circuitBreaker) {
      return await circuitBreaker.execute(executeQuery, () => {
        // Fallback: return appropriate empty result based on query type
        console.warn('Circuit breaker fallback triggered for Sanity query');
        
        // Analyze query to determine appropriate fallback
        const queryLower = query.toLowerCase();
        if (queryLower.includes('*[') && queryLower.includes(']')) {
          // Array query, return empty array
          return [] as unknown as T;
        } else if (queryLower.includes('count(')) {
          // Count query, return 0
          return 0 as unknown as T;
        } else {
          // Single item query, return null
          return null as unknown as T;
        }
      });
    } else {
      return await executeQuery();
    }
  }

  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    
    // Network-related errors that are retryable
    const retryableErrors = [
      'network error',
      'timeout',
      'econnreset',
      'enotfound',
      'econnrefused',
      'etimedout',
      'socket hang up',
      'request timeout',
      'fetch failed',
    ];
    
    // HTTP status codes that are retryable
    const retryableStatusCodes = ['500', '502', '503', '504', '429'];
    
    // Check for retryable error messages
    if (retryableErrors.some(retryableError => errorMessage.includes(retryableError))) {
      return true;
    }
    
    // Check for retryable status codes
    if (retryableStatusCodes.some(code => errorMessage.includes(code))) {
      return true;
    }
    
    // Don't retry client errors (4xx except 429)
    if (errorMessage.includes('400') || errorMessage.includes('401') || 
        errorMessage.includes('403') || errorMessage.includes('404')) {
      return false;
    }
    
    return false;
  }

  async create(document: unknown, options?: { validateConnection?: boolean; useCircuitBreaker?: boolean }): Promise<any> {
    const { validateConnection = true, useCircuitBreaker = true } = options || {};

    // Pre-flight checks
    if (!process.env.SANITY_API_TOKEN) {
      throw new Error('SANITY_API_TOKEN is required for write operations. Please check your environment configuration.');
    }

    if (validateConnection) {
      const writeCapability = await this.canPerformWrites();
      if (!writeCapability.canWrite) {
        throw new Error(writeCapability.reason || 'Cannot perform write operations');
      }
    }

    const executeCreate = async (): Promise<any> => {
      try {
        console.log(`Creating Sanity document of type: ${document._type}`);
        const startTime = Date.now();
        
        const result = await this.client.create(document);
        const latency = Date.now() - startTime;
        
        console.log(`✅ Successfully created ${document._type} document with ID: ${result._id} (${latency}ms)`);
        return result;
      } catch (error) {
        const friendlyError = this.getWriteErrorMessage(error as Error, 'create', document._type);
        console.error('Error creating document in Sanity:', {
          originalError: (error as Error).message,
          friendlyError,
          documentType: document._type,
          timestamp: new Date().toISOString(),
        });
        
        throw new Error(friendlyError);
      }
    };

    // Execute with circuit breaker if enabled
    if (useCircuitBreaker) {
      try {
        const { blogCircuitBreakers } = await import('../blog/error-handling');
        return await blogCircuitBreakers.adminOperations.execute(executeCreate);
      } catch (importError) {
        console.warn('Could not import circuit breaker for create operation, proceeding without it');
        return await executeCreate();
      }
    } else {
      return await executeCreate();
    }
  }

  patch(documentId: string, options?: { validateConnection?: boolean }): unknown {
    const { validateConnection = false } = options || {};

    try {
      // Basic validation
      if (!process.env.SANITY_API_TOKEN) {
        throw new Error('SANITY_API_TOKEN is required for patch operations. Please check your environment configuration.');
      }

      if (validateConnection) {
        // Note: We can't await here since patch returns a PatchBuilder
        // Validation should be done before calling patch if needed
        console.log('Note: Connection validation for patch operations should be done before calling patch()');
      }

      console.log(`Creating patch builder for document: ${documentId}`);
      return this.client.patch(documentId);
    } catch (error) {
      const friendlyError = this.getWriteErrorMessage(error as Error, 'patch', 'document');
      console.error('Error creating patch builder:', {
        originalError: (error as Error).message,
        friendlyError,
        documentId,
        timestamp: new Date().toISOString(),
      });
      
      throw new Error(friendlyError);
    }
  }

  async delete(documentId: string, options?: { validateConnection?: boolean; useCircuitBreaker?: boolean }): Promise<any> {
    const { validateConnection = true, useCircuitBreaker = true } = options || {};

    // Pre-flight checks
    if (!process.env.SANITY_API_TOKEN) {
      throw new Error('SANITY_API_TOKEN is required for delete operations. Please check your environment configuration.');
    }

    if (validateConnection) {
      const writeCapability = await this.canPerformWrites();
      if (!writeCapability.canWrite) {
        throw new Error(writeCapability.reason || 'Cannot perform delete operations');
      }
    }

    const executeDelete = async (): Promise<any> => {
      try {
        console.log(`Attempting to delete Sanity document: ${documentId}`);
        const startTime = Date.now();
        
        const result = await this.client.delete(documentId);
        const latency = Date.now() - startTime;
        
        console.log(`✅ Successfully deleted document: ${documentId} (${latency}ms)`);
        return result;
      } catch (error) {
        const friendlyError = this.getWriteErrorMessage(error as Error, 'delete', 'document');
        console.error('Error deleting document from Sanity:', {
          originalError: (error as Error).message,
          friendlyError,
          documentId,
          timestamp: new Date().toISOString(),
        });
        
        throw new Error(friendlyError);
      }
    };

    // Execute with circuit breaker if enabled
    if (useCircuitBreaker) {
      try {
        const { blogCircuitBreakers } = await import('../blog/error-handling');
        return await blogCircuitBreakers.adminOperations.execute(executeDelete);
      } catch (importError) {
        console.warn('Could not import circuit breaker for delete operation, proceeding without it');
        return await executeDelete();
      }
    } else {
      return await executeDelete();
    }
  }

  /**
   * Performs a comprehensive health check of the Sanity connection
   */
  async performHealthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    connection: ConnectionValidationResult;
    writeCapability: { canWrite: boolean; reason?: string };
    performance: {
      readLatency?: number;
      writeLatency?: number;
    };
    recommendations: string[];
  }> {
    const recommendations: string[] = [];
    const performance: { readLatency?: number; writeLatency?: number } = {};

    // Test connection
    const connection = await this.validateConnection(true);
    performance.readLatency = connection.latency;

    // Test write capability
    const writeCapability = await this.canPerformWrites();

    // Test write performance if possible
    if (writeCapability.canWrite) {
      try {
        const startTime = Date.now();
        const testDoc = {
          _type: 'healthCheck',
          _id: `health-check-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        
        const created = await this.client.create(testDoc);
        await this.client.delete(created._id);
        
        performance.writeLatency = Date.now() - startTime;
      } catch (error) {
        console.warn('Write performance test failed:', (error as Error).message);
      }
    }

    // Generate recommendations
    if (!connection.isValid) {
      recommendations.push('Fix Sanity connection configuration');
    }
    
    if (!writeCapability.canWrite) {
      recommendations.push('Configure API token with write permissions for full functionality');
    }

    if (performance.readLatency && performance.readLatency > 2000) {
      recommendations.push('Consider optimizing queries or checking network connectivity - read latency is high');
    }

    if (performance.writeLatency && performance.writeLatency > 5000) {
      recommendations.push('Write operations are slow - consider checking network or Sanity service status');
    }

    if (!connection.details?.hasToken) {
      recommendations.push('Add SANITY_API_TOKEN for write operations and better error handling');
    }

    // Determine overall status
    let overall: 'healthy' | 'degraded' | 'unhealthy';
    if (connection.isValid && writeCapability.canWrite) {
      overall = 'healthy';
    } else if (connection.isValid && !writeCapability.canWrite) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      overall,
      connection,
      writeCapability,
      performance,
      recommendations,
    };
  }

  /**
   * Resets connection validation cache
   */
  resetValidationCache(): void {
    this.connectionValidated = false;
    this.lastValidationTime = 0;
    console.log('Sanity connection validation cache reset');
  }

  /**
   * Gets current configuration details (safe for logging)
   */
  getConfigurationSummary(): {
    projectId: string;
    dataset: string;
    apiVersion: string;
    hasToken: boolean;
    useCdn: boolean;
    environment: string;
  } {
    const config = this.client.config();
    return {
      projectId: config.projectId || 'not-configured',
      dataset: config.dataset || 'not-configured',
      apiVersion: config.apiVersion || 'not-configured',
      hasToken: !!process.env.SANITY_API_TOKEN,
      useCdn: config.useCdn || false,
      environment: process.env.NODE_ENV || 'unknown',
    };
  }

  /**
   * Gets user-friendly error messages for write operations
   */
  private getWriteErrorMessage(error: Error, operation: 'create' | 'patch' | 'delete', documentType: string): string {
    const message = error.message.toLowerCase();

    // Permission errors
    if (message.includes('insufficient permissions')) {
      return `Insufficient permissions to ${operation} ${documentType}. Please check your Sanity API token has the correct permissions for the "${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}" dataset.`;
    }

    if (message.includes(`permission "${operation}" required`)) {
      return `The Sanity API token does not have "${operation}" permissions. Please update your token permissions in the Sanity management console.`;
    }

    if (message.includes('permission "update" required') && operation === 'delete') {
      return `The Sanity API token does not have "update" permissions required for deletion. Please update your token permissions in the Sanity management console.`;
    }

    // Authentication errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Sanity API token is invalid or expired. Please check your SANITY_API_TOKEN environment variable.';
    }

    // Document-specific errors
    if (message.includes('document not found') && operation === 'delete') {
      return `Document was not found. It may have already been deleted.`;
    }

    if (message.includes('validation error') || message.includes('invalid document')) {
      return `Document validation failed. Please check that all required fields are provided and valid.`;
    }

    // Network errors
    if (message.includes('network error') || message.includes('fetch failed')) {
      return `Network error during ${operation} operation. Please check your connection and try again.`;
    }

    // Rate limiting
    if (message.includes('429') || message.includes('rate limit')) {
      return `Too many requests. Please wait a moment before trying to ${operation} again.`;
    }

    // Server errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
      return `Sanity service is temporarily unavailable. Please try the ${operation} operation again in a few minutes.`;
    }

    // Generic fallback
    return `Failed to ${operation} ${documentType}: ${error.message}`;
  }
}

// Export enhanced client instance
export const enhancedClient = EnhancedSanityClient.getInstance();

// Export legacy client for backward compatibility
export const sanityClient = client;
