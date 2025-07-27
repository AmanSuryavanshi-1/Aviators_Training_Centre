/**
 * Enhanced Fallback System for Blog Management
 * 
 * This system provides intelligent fallback logic when Sanity CMS is unavailable,
 * with automatic recovery detection and seamless switching between data sources.
 */

import { BlogPost, BlogPostPreview, BlogCategory, Course, BlogAPIResponse } from '../types/blog';
import { BlogHealthChecker, BlogErrorBoundary, blogCircuitBreakers } from './error-handling';
import { mockBlogPosts, mockCategories } from './mock-data';
import { handleBlogError, BlogErrorType } from './comprehensive-error-handler';

// Fallback data sources in order of preference
export enum FallbackDataSource {
  SANITY = 'sanity',
  MARKDOWN = 'markdown', 
  CACHE = 'cache',
  MOCK = 'mock'
}

// Service status levels
export enum ServiceStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded', 
  UNAVAILABLE = 'unavailable',
  RECOVERING = 'recovering'
}

// User notification types
export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success'
}

interface ServiceNotification {
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible: boolean;
  duration?: number; // Auto-dismiss after ms
}

interface FallbackState {
  currentSource: FallbackDataSource;
  status: ServiceStatus;
  lastHealthCheck: Date;
  consecutiveFailures: number;
  lastSuccessfulConnection: Date | null;
  recoveryAttempts: number;
  notifications: ServiceNotification[];
}

interface RecoveryMetrics {
  totalAttempts: number;
  successfulRecoveries: number;
  averageRecoveryTime: number;
  lastRecoveryTime: Date | null;
  failureReasons: Record<string, number>;
}

export class EnhancedFallbackSystem {
  private static instance: EnhancedFallbackSystem;
  private state: FallbackState;
  private recoveryMetrics: RecoveryMetrics;
  private recoveryInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private notificationCallbacks: Array<(notifications: ServiceNotification[]) => void> = [];
  
  // Configuration
  private readonly config = {
    healthCheckInterval: 60000, // 1 minute
    recoveryCheckInterval: 300000, // 5 minutes
    maxConsecutiveFailures: 3,
    maxRecoveryAttempts: 3,
    recoveryBackoffMultiplier: 1.5,
    notificationTimeout: 10000, // 10 seconds
    cacheRetentionTime: 3600000, // 1 hour
  };

  private constructor() {
    this.state = {
      currentSource: FallbackDataSource.SANITY,
      status: ServiceStatus.HEALTHY,
      lastHealthCheck: new Date(),
      consecutiveFailures: 0,
      lastSuccessfulConnection: new Date(),
      recoveryAttempts: 0,
      notifications: [],
    };

    this.recoveryMetrics = {
      totalAttempts: 0,
      successfulRecoveries: 0,
      averageRecoveryTime: 0,
      lastRecoveryTime: null,
      failureReasons: {},
    };

    this.initializeMonitoring();
  }

  static getInstance(): EnhancedFallbackSystem {
    if (!EnhancedFallbackSystem.instance) {
      EnhancedFallbackSystem.instance = new EnhancedFallbackSystem();
    }
    return EnhancedFallbackSystem.instance;
  }

  /**
   * Initialize continuous monitoring and recovery systems
   */
  private initializeMonitoring(): void {
    // Start health check monitoring
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.healthCheckInterval
    );

    // Start recovery monitoring (disabled in development)
    if (process.env.NODE_ENV === 'production') {
      this.recoveryInterval = setInterval(
        () => this.attemptRecovery(),
        this.config.recoveryCheckInterval
      );
    }

    // Initial health check
    this.performHealthCheck();
  }

  /**
   * Perform comprehensive health check and update system state
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const healthResult = await BlogHealthChecker.performHealthCheck();
      this.state.lastHealthCheck = new Date();

      if (healthResult.overall) {
        await this.handleHealthyState();
      } else {
        await this.handleUnhealthyState(healthResult);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      await this.handleHealthCheckFailure(error as Error);
    }
  }

  /**
   * Handle healthy system state
   */
  private async handleHealthyState(): Promise<void> {
    const wasUnhealthy = this.state.status !== ServiceStatus.HEALTHY;
    
    this.state.status = ServiceStatus.HEALTHY;
    this.state.currentSource = FallbackDataSource.SANITY;
    this.state.consecutiveFailures = 0;
    this.state.lastSuccessfulConnection = new Date();

    if (wasUnhealthy) {
      // System recovered
      this.recordSuccessfulRecovery();
      this.addNotification({
        type: NotificationType.SUCCESS,
        title: 'Service Restored',
        message: 'Blog system has fully recovered and is operating normally.',
        dismissible: true,
        duration: this.config.notificationTimeout,
      });

      // Clear error-related notifications
      this.clearNotificationsByType(NotificationType.ERROR);
      this.clearNotificationsByType(NotificationType.WARNING);
    }
  }

  /**
   * Handle unhealthy system state
   */
  private async handleUnhealthyState(healthResult: any): Promise<void> {
    this.state.consecutiveFailures++;
    
    // Determine appropriate fallback source and status
    const fallbackInfo = await this.determineFallbackSource();
    this.state.currentSource = fallbackInfo.source;
    this.state.status = fallbackInfo.status;

    // Add appropriate notifications
    if (this.state.consecutiveFailures === 1) {
      // First failure - show degraded service notification
      this.addNotification({
        type: NotificationType.WARNING,
        title: 'Service Degraded',
        message: 'Blog content is temporarily served from backup sources. Full functionality may be limited.',
        dismissible: false,
      });
    } else if (this.state.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      // Multiple failures - show service unavailable notification
      this.addNotification({
        type: NotificationType.ERROR,
        title: 'Service Issues',
        message: 'We are experiencing technical difficulties. Our team has been notified and is working to resolve the issue.',
        action: {
          label: 'Retry',
          handler: () => this.forceRecoveryAttempt(),
        },
        dismissible: false,
      });
    }

    // Record failure reason
    const primaryFailure = this.identifyPrimaryFailure(healthResult);
    this.recordFailureReason(primaryFailure);
  }

  /**
   * Handle health check failure
   */
  private async handleHealthCheckFailure(error: Error): Promise<void> {
    console.error('Health check system failure:', error);
    
    this.state.status = ServiceStatus.UNAVAILABLE;
    this.state.currentSource = FallbackDataSource.MOCK;
    this.state.consecutiveFailures++;

    this.addNotification({
      type: NotificationType.ERROR,
      title: 'System Monitoring Issue',
      message: 'Unable to monitor system health. Using emergency fallback mode.',
      dismissible: false,
    });
  }

  /**
   * Determine the best fallback data source
   */
  private async determineFallbackSource(): Promise<{
    source: FallbackDataSource;
    status: ServiceStatus;
  }> {
    // Try markdown files first
    try {
      const markdownTest = await this.testMarkdownSource();
      if (markdownTest.available) {
        return {
          source: FallbackDataSource.MARKDOWN,
          status: ServiceStatus.DEGRADED,
        };
      }
    } catch (error) {
      console.warn('Markdown fallback unavailable:', error);
    }

    // Try cache
    try {
      const cacheTest = await this.testCacheSource();
      if (cacheTest.available) {
        return {
          source: FallbackDataSource.CACHE,
          status: ServiceStatus.DEGRADED,
        };
      }
    } catch (error) {
      console.warn('Cache fallback unavailable:', error);
    }

    // Fall back to mock data
    return {
      source: FallbackDataSource.MOCK,
      status: ServiceStatus.UNAVAILABLE,
    };
  }

  /**
   * Test markdown data source availability
   */
  private async testMarkdownSource(): Promise<{ available: boolean; latency?: number }> {
    const startTime = Date.now();
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/blog/markdown?action=test`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (response.ok) {
        const latency = Date.now() - startTime;
        return { available: true, latency };
      }
      
      return { available: false };
    } catch (error) {
      return { available: false };
    }
  }

  /**
   * Test cache data source availability
   */
  private async testCacheSource(): Promise<{ available: boolean; size?: number }> {
    try {
      const { blogAPIClient } = await import('./api-client');
      const cacheStats = blogAPIClient.getCacheStats();
      
      return {
        available: cacheStats.size > 0,
        size: cacheStats.size,
      };
    } catch (error) {
      return { available: false };
    }
  }

  /**
   * Attempt automatic recovery
   */
  private async attemptRecovery(): Promise<void> {
    if (this.state.status === ServiceStatus.HEALTHY) {
      return; // Already healthy
    }

    if (this.state.recoveryAttempts >= this.config.maxRecoveryAttempts) {
      console.warn('Max recovery attempts reached, stopping automatic recovery');
      return;
    }

    this.state.recoveryAttempts++;
    this.recoveryMetrics.totalAttempts++;

    try {
      console.log(`Attempting recovery (attempt ${this.state.recoveryAttempts})`);
      
      // Update status to recovering
      this.state.status = ServiceStatus.RECOVERING;
      this.addNotification({
        type: NotificationType.INFO,
        title: 'Attempting Recovery',
        message: 'Trying to restore full service functionality...',
        dismissible: true,
        duration: 5000,
      });

      // Perform recovery actions
      const recoveryResult = await BlogHealthChecker.attemptAutoRecovery();
      
      if (recoveryResult.successful) {
        console.log('Recovery successful:', recoveryResult.actions);
        await this.handleHealthyState();
      } else {
        console.warn('Recovery failed:', recoveryResult.actions);
        
        // Calculate backoff delay
        const backoffDelay = Math.min(
          this.config.recoveryCheckInterval * 
          Math.pow(this.config.recoveryBackoffMultiplier, this.state.recoveryAttempts - 1),
          300000 // Max 5 minutes
        );

        setTimeout(() => {
          this.state.status = ServiceStatus.DEGRADED;
        }, backoffDelay);
      }
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      this.recordFailureReason('recovery_failed');
    }
  }

  /**
   * Force a recovery attempt (triggered by user action)
   */
  public async forceRecoveryAttempt(): Promise<boolean> {
    try {
      this.state.recoveryAttempts = 0; // Reset counter for manual attempt
      await this.attemptRecovery();
      return this.state.status === ServiceStatus.HEALTHY;
    } catch (error) {
      console.error('Forced recovery failed:', error);
      return false;
    }
  }

  /**
   * Get data with intelligent fallback
   */
  public async getDataWithFallback<T>(
    primaryOperation: () => Promise<T>,
    operationName: string,
    fallbackData?: T
  ): Promise<BlogAPIResponse<T>> {
    const startTime = Date.now();

    try {
      // If we're in healthy state, try primary operation
      if (this.state.status === ServiceStatus.HEALTHY) {
        const result = await primaryOperation();
        return {
          success: true,
          data: result,
          fallback: false,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: this.state.currentSource,
            latency: Date.now() - startTime,
          },
        };
      }

      // Use fallback based on current source
      const fallbackResult = await this.getFallbackData<T>(operationName, fallbackData);
      
      return {
        success: true,
        data: fallbackResult,
        fallback: true,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: this.state.currentSource,
          latency: Date.now() - startTime,
          degraded: true,
        },
      };
    } catch (error) {
      console.error(`Operation ${operationName} failed:`, error);
      
      // Last resort - use provided fallback or mock data
      if (fallbackData) {
        return {
          success: true,
          data: fallbackData,
          fallback: true,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: FallbackDataSource.MOCK,
            latency: Date.now() - startTime,
            emergency: true,
          },
        };
      }

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Operation failed',
          code: 'FALLBACK_FAILED',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: this.state.currentSource,
          latency: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get fallback data based on current source
   */
  private async getFallbackData<T>(operationName: string, fallbackData?: T): Promise<T> {
    switch (this.state.currentSource) {
      case FallbackDataSource.MARKDOWN:
        return await this.getMarkdownFallbackData<T>(operationName);
      
      case FallbackDataSource.CACHE:
        return await this.getCachedFallbackData<T>(operationName);
      
      case FallbackDataSource.MOCK:
      default:
        return this.getMockFallbackData<T>(operationName, fallbackData);
    }
  }

  /**
   * Get data from markdown files
   */
  private async getMarkdownFallbackData<T>(operationName: string): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    let endpoint = `${baseUrl}/api/blog/markdown`;
    
    if (operationName.includes('getAllBlogPosts')) {
      endpoint += '?action=all';
    } else if (operationName.includes('getBlogPostBySlug')) {
      endpoint += '?action=single';
    } else if (operationName.includes('getFeaturedPosts')) {
      endpoint += '?action=featured';
    }

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Markdown fallback failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data as T;
  }

  /**
   * Get data from cache
   */
  private async getCachedFallbackData<T>(operationName: string): Promise<T> {
    const { blogAPIClient } = await import('./api-client');
    const cacheStats = blogAPIClient.getCacheStats();
    
    // Try to find relevant cached data
    const relevantKeys = cacheStats.keys.filter(key => 
      key.includes(operationName.toLowerCase()) || 
      key.includes('blog-posts') ||
      key.includes('blog-categories')
    );

    if (relevantKeys.length === 0) {
      throw new Error('No relevant cached data found');
    }

    // This is a simplified implementation - in practice, you'd need
    // to implement proper cache retrieval logic
    throw new Error('Cache fallback not fully implemented');
  }

  /**
   * Get mock data
   */
  private getMockFallbackData<T>(operationName: string, fallbackData?: T): T {
    if (fallbackData) {
      return fallbackData;
    }

    // Return appropriate mock data based on operation
    if (operationName.includes('getAllBlogPosts') || operationName.includes('getFeaturedPosts')) {
      return mockBlogPosts as unknown as T;
    }
    
    if (operationName.includes('getAllBlogCategories')) {
      return mockCategories as unknown as T;
    }
    
    if (operationName.includes('getBlogPostBySlug')) {
      return mockBlogPosts[0] as unknown as T;
    }

    throw new Error(`No mock data available for operation: ${operationName}`);
  }

  /**
   * Notification management
   */
  public addNotification(notification: ServiceNotification): void {
    // Remove existing notifications of the same type if not dismissible
    if (!notification.dismissible) {
      this.state.notifications = this.state.notifications.filter(
        n => n.type !== notification.type || n.dismissible
      );
    }

    this.state.notifications.push(notification);
    this.notifySubscribers();

    // Auto-dismiss if duration is set
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.duration);
    }
  }

  public removeNotification(notification: ServiceNotification): void {
    this.state.notifications = this.state.notifications.filter(n => n !== notification);
    this.notifySubscribers();
  }

  public clearNotificationsByType(type: NotificationType): void {
    this.state.notifications = this.state.notifications.filter(n => n.type !== type);
    this.notifySubscribers();
  }

  public clearAllNotifications(): void {
    this.state.notifications = [];
    this.notifySubscribers();
  }

  /**
   * Subscribe to notification updates
   */
  public subscribeToNotifications(callback: (notifications: ServiceNotification[]) => void): () => void {
    this.notificationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback([...this.state.notifications]);
      } catch (error) {
        console.error('Notification callback error:', error);
      }
    });
  }

  /**
   * Utility methods
   */
  private identifyPrimaryFailure(healthResult: any): string {
    if (!healthResult.services.sanity.healthy) {
      return 'sanity_connection';
    }
    if (!healthResult.services.api.healthy) {
      return 'api_endpoints';
    }
    if (healthResult.services.fallbackMode) {
      return 'fallback_mode_active';
    }
    return 'unknown_failure';
  }

  private recordFailureReason(reason: string): void {
    this.recoveryMetrics.failureReasons[reason] = 
      (this.recoveryMetrics.failureReasons[reason] || 0) + 1;
  }

  private recordSuccessfulRecovery(): void {
    this.recoveryMetrics.successfulRecoveries++;
    this.recoveryMetrics.lastRecoveryTime = new Date();
    this.state.recoveryAttempts = 0;

    // Calculate average recovery time (simplified)
    const totalRecoveries = this.recoveryMetrics.successfulRecoveries;
    const currentTime = Date.now();
    const lastFailureTime = this.state.lastHealthCheck.getTime();
    const recoveryTime = currentTime - lastFailureTime;

    this.recoveryMetrics.averageRecoveryTime = 
      (this.recoveryMetrics.averageRecoveryTime * (totalRecoveries - 1) + recoveryTime) / totalRecoveries;
  }

  private generateRequestId(): string {
    return `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Public API methods
   */
  public getSystemState(): FallbackState {
    return { ...this.state };
  }

  public getRecoveryMetrics(): RecoveryMetrics {
    return { ...this.recoveryMetrics };
  }

  public getCurrentNotifications(): ServiceNotification[] {
    return [...this.state.notifications];
  }

  public isHealthy(): boolean {
    return this.state.status === ServiceStatus.HEALTHY;
  }

  public isDegraded(): boolean {
    return this.state.status === ServiceStatus.DEGRADED;
  }

  public isUnavailable(): boolean {
    return this.state.status === ServiceStatus.UNAVAILABLE;
  }

  public getCurrentDataSource(): FallbackDataSource {
    return this.state.currentSource;
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
      this.recoveryInterval = null;
    }
    
    this.notificationCallbacks = [];
  }
}

// Singleton instance
export const enhancedFallbackSystem = EnhancedFallbackSystem.getInstance();

// Export types for external use
export type { ServiceNotification, FallbackState, RecoveryMetrics };