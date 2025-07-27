import { BlogPost, BlogPostPreview, BlogCategory, Course, BlogError } from '../types/blog';

// Enhanced error boundary for blog components
export class BlogErrorBoundary {
  private static errorCount = 0;
  private static readonly MAX_ERRORS = 10;
  private static readonly ERROR_RESET_TIME = 300000; // 5 minutes
  private static lastErrorReset = Date.now();

  static handleError(error: Error, context: {
    component: string;
    operation: string;
    data?: any;
  }): void {
    // Reset error count if enough time has passed
    if (Date.now() - this.lastErrorReset > this.ERROR_RESET_TIME) {
      this.errorCount = 0;
      this.lastErrorReset = Date.now();
    }

    this.errorCount++;

    // Log error with context
    console.error(`Blog Error [${context.component}:${context.operation}]:`, {
      error: error.message,
      stack: error.stack,
      context,
      errorCount: this.errorCount,
      timestamp: new Date().toISOString(),
    });

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, context);
    }

    // Circuit breaker: if too many errors, disable certain features
    if (this.errorCount >= this.MAX_ERRORS) {
      console.warn('Blog error threshold reached, enabling fallback mode');
      this.enableFallbackMode();
    }
  }

  private static reportError(error: Error, context: any): void {
    // In a real application, this would send to Sentry, LogRocket, etc.
    try {
      // Example: Send to analytics or error tracking service
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: `${context.component}:${context.operation} - ${error.message}`,
          fatal: false,
        });
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private static enableFallbackMode(): void {
    // Set a flag that components can check to enable fallback behavior
    if (typeof window !== 'undefined') {
      (window as any).__BLOG_FALLBACK_MODE__ = true;
    }
  }

  static isFallbackMode(): boolean {
    return typeof window !== 'undefined' && (window as any).__BLOG_FALLBACK_MODE__ === true;
  }

  static resetErrorCount(): void {
    this.errorCount = 0;
    this.lastErrorReset = Date.now();
    if (typeof window !== 'undefined') {
      delete (window as any).__BLOG_FALLBACK_MODE__;
    }
  }
}

// Fallback data providers
export class BlogFallbackProvider {
  // Fallback blog post for when individual posts fail to load
  static getFallbackBlogPost(slug?: string): BlogPost {
    return {
      _id: `fallback-post-${slug || 'unknown'}`,
      _type: 'post',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      title: 'Content Temporarily Unavailable',
      slug: { current: slug || 'unavailable' },
      publishedAt: new Date().toISOString(),
      excerpt: 'We apologize, but this content is temporarily unavailable. Please try again later or contact us if the problem persists.',
      body: [
        {
          _type: 'block',
          _key: 'fallback-content',
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: 'fallback-text',
              text: 'This content is temporarily unavailable. Our team has been notified and is working to resolve the issue. Please try refreshing the page or contact us if you continue to experience problems.',
              marks: [],
            },
          ],
          markDefs: [],
        },
      ],
      image: {
        asset: {} as any,
        alt: 'Content unavailable',
      },
      category: this.getFallbackCategory(),
      author: this.getFallbackAuthor(),
      readingTime: 1,
      featured: false,
      tags: ['system', 'fallback'],
      difficulty: 'beginner',
      contentType: 'guide',
      enableComments: false,
      enableSocialSharing: false,
      enableNewsletterSignup: false,
      viewCount: 0,
      shareCount: 0,
      engagementScore: 0,
    };
  }

  // Fallback blog post preview for listings
  static getFallbackBlogPostPreview(slug?: string): BlogPostPreview {
    return {
      _id: `fallback-preview-${slug || 'unknown'}`,
      title: 'Content Loading...',
      slug: { current: slug || 'loading' },
      publishedAt: new Date().toISOString(),
      excerpt: 'Content is being loaded. Please wait a moment.',
      image: {
        asset: {} as any,
        alt: 'Loading content',
      },
      category: {
        title: 'General',
        slug: { current: 'general' },
        color: '#075E68',
      },
      author: {
        name: 'System',
        slug: { current: 'system' },
        role: 'Administrator',
      },
      readingTime: 1,
      featured: false,
      tags: ['loading'],
      difficulty: 'beginner',
    };
  }

  // Fallback category
  static getFallbackCategory(): BlogCategory {
    return {
      _id: 'fallback-category',
      _type: 'category',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      title: 'General Aviation',
      slug: { current: 'general-aviation' },
      description: 'General aviation content and resources',
      color: '#075E68',
    };
  }

  // Fallback author
  static getFallbackAuthor() {
    return {
      _id: 'fallback-author',
      _type: 'author',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      name: 'Aviators Training Centre',
      slug: { current: 'aviators-training-centre' },
      role: 'Editorial Team',
      credentials: 'Professional Aviation Training',
    };
  }

  // Fallback course for CTA routing
  static getFallbackCourse(): Course {
    return {
      _id: 'fallback-course',
      _type: 'course',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      name: 'Aviation Training Programs',
      slug: { current: 'aviation-training' },
      category: 'general',
      description: 'Comprehensive aviation training programs designed to help you achieve your flying goals.',
      shortDescription: 'Professional aviation training for aspiring pilots',
      targetUrl: '/courses',
      keywords: ['aviation', 'training', 'pilot', 'course', 'flying'],
      ctaSettings: {
        primaryButtonText: 'Explore Our Courses',
        secondaryButtonText: 'Contact Us',
        ctaTitle: 'Start Your Aviation Journey',
        ctaMessage: 'Take the first step towards your aviation career with our comprehensive training programs.',
        urgencyText: 'Limited seats available',
      },
      active: true,
      featured: true,
    };
  }

  // Generate multiple fallback posts for listings
  static getFallbackBlogPosts(count: number = 3): BlogPostPreview[] {
    return Array.from({ length: count }, (_, index) => ({
      ...this.getFallbackBlogPostPreview(`fallback-${index + 1}`),
      title: `Aviation Training Article ${index + 1}`,
      excerpt: 'Comprehensive aviation training content is being prepared for you.',
    }));
  }

  // Generate fallback categories
  static getFallbackCategories(): BlogCategory[] {
    return [
      {
        ...this.getFallbackCategory(),
        _id: 'fallback-technical',
        title: 'Technical Training',
        slug: { current: 'technical-training' },
        description: 'Technical aspects of aviation training',
        color: '#1E40AF',
      },
      {
        ...this.getFallbackCategory(),
        _id: 'fallback-commercial',
        title: 'Commercial Pilot',
        slug: { current: 'commercial-pilot' },
        description: 'Commercial pilot license training',
        color: '#059669',
      },
      {
        ...this.getFallbackCategory(),
        _id: 'fallback-general',
        title: 'General Aviation',
        slug: { current: 'general-aviation' },
        description: 'General aviation topics and training',
        color: '#075E68',
      },
    ];
  }

  // Generate fallback courses
  static getFallbackCourses(): Course[] {
    return [
      {
        ...this.getFallbackCourse(),
        _id: 'fallback-technical-general',
        name: 'Technical General Ground School',
        slug: { current: 'technical-general' },
        category: 'technical-general',
        targetUrl: '/courses/technical-general',
      },
      {
        ...this.getFallbackCourse(),
        _id: 'fallback-cpl',
        name: 'CPL Ground School',
        slug: { current: 'cpl-ground-school' },
        category: 'cpl-ground-school',
        targetUrl: '/courses/cpl-ground-school',
      },
      {
        ...this.getFallbackCourse(),
        _id: 'fallback-atpl',
        name: 'ATPL Ground School',
        slug: { current: 'atpl-ground-school' },
        category: 'atpl-ground-school',
        targetUrl: '/courses/atpl-ground-school',
      },
    ];
  }
}

// Retry mechanism for failed operations
export class BlogRetryHandler {
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_DELAY = 1000;
  private static readonly MAX_DELAY = 10000;

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      backoffMultiplier?: number;
      shouldRetry?: (error: Error) => boolean;
      onRetry?: (attempt: number, error: Error) => void;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = this.DEFAULT_MAX_RETRIES,
      delay = this.DEFAULT_DELAY,
      backoffMultiplier = 2,
      shouldRetry = () => true,
      onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Check if we should retry this error
        if (!shouldRetry(lastError)) {
          break;
        }

        // Call retry callback
        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        // Calculate delay with exponential backoff
        const currentDelay = Math.min(delay * Math.pow(backoffMultiplier, attempt), this.MAX_DELAY);
        await this.sleep(currentDelay);
      }
    }

    throw lastError!;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Enhanced circuit breaker for preventing cascading failures
export class BlogCircuitBreaker {
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;
  private lastSuccessTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private metrics = {
    totalRequests: 0,
    totalFailures: 0,
    totalSuccesses: 0,
    averageResponseTime: 0,
    lastResetTime: Date.now(),
  };

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 60000, // 1 minute
    private readonly successThreshold: number = 2,
    private readonly name: string = 'BlogCircuitBreaker'
  ) {}

  async execute<T>(operation: () => Promise<T>, fallback?: () => T): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        console.log(`${this.name}: Transitioning from OPEN to HALF_OPEN`);
        this.state = 'HALF_OPEN';
        this.successes = 0; // Reset success counter for half-open state
      } else {
        console.warn(`${this.name}: Circuit is OPEN, using fallback`);
        if (fallback) {
          return fallback();
        }
        throw new Error(`Circuit breaker ${this.name} is OPEN - service unavailable`);
      }
    }

    try {
      const result = await operation();
      const responseTime = Date.now() - startTime;
      this.onSuccess(responseTime);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.onFailure(error as Error, responseTime);
      
      if (fallback) {
        console.warn(`${this.name}: Operation failed, using fallback:`, (error as Error).message);
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(responseTime: number): void {
    this.successes++;
    this.failures = 0; // Reset failure count on success
    this.lastSuccessTime = Date.now();
    this.metrics.totalSuccesses++;
    this.updateAverageResponseTime(responseTime);

    if (this.state === 'HALF_OPEN') {
      if (this.successes >= this.successThreshold) {
        console.log(`${this.name}: Transitioning from HALF_OPEN to CLOSED`);
        this.state = 'CLOSED';
        this.successes = 0;
      }
    } else if (this.state === 'OPEN') {
      // This shouldn't happen, but handle it gracefully
      console.log(`${this.name}: Unexpected success in OPEN state, transitioning to CLOSED`);
      this.state = 'CLOSED';
    }
  }

  private onFailure(error: Error, responseTime: number): void {
    this.failures++;
    this.successes = 0; // Reset success count on failure
    this.lastFailureTime = Date.now();
    this.metrics.totalFailures++;
    this.updateAverageResponseTime(responseTime);

    console.error(`${this.name}: Operation failed (${this.failures}/${this.failureThreshold}):`, error.message);

    if (this.state === 'HALF_OPEN') {
      // Any failure in HALF_OPEN state should immediately open the circuit
      console.log(`${this.name}: Failure in HALF_OPEN state, transitioning to OPEN`);
      this.state = 'OPEN';
    } else if (this.failures >= this.failureThreshold) {
      console.log(`${this.name}: Failure threshold reached, transitioning to OPEN`);
      this.state = 'OPEN';
    }
  }

  private updateAverageResponseTime(responseTime: number): void {
    const totalRequests = this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }

  getState(): string {
    return this.state;
  }

  getMetrics(): typeof this.metrics & {
    failureRate: number;
    successRate: number;
    uptime: number;
  } {
    const totalRequests = this.metrics.totalRequests;
    const failureRate = totalRequests > 0 ? this.metrics.totalFailures / totalRequests : 0;
    const successRate = totalRequests > 0 ? this.metrics.totalSuccesses / totalRequests : 0;
    const uptime = Date.now() - this.metrics.lastResetTime;

    return {
      ...this.metrics,
      failureRate,
      successRate,
      uptime,
    };
  }

  reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
    this.lastSuccessTime = 0;
    this.state = 'CLOSED';
    this.metrics = {
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      averageResponseTime: 0,
      lastResetTime: Date.now(),
    };
    console.log(`${this.name}: Circuit breaker reset`);
  }

  // Force state change (useful for testing or manual intervention)
  forceState(state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'): void {
    console.log(`${this.name}: Forcing state change to ${state}`);
    this.state = state;
    if (state === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
    }
  }

  // Check if circuit breaker is healthy
  isHealthy(): boolean {
    return this.state === 'CLOSED' || this.state === 'HALF_OPEN';
  }
}

// Global circuit breakers for different operations
export const blogCircuitBreakers = {
  fetchPosts: new BlogCircuitBreaker(5, 60000, 2, 'FetchPosts'),
  fetchSinglePost: new BlogCircuitBreaker(3, 30000, 1, 'FetchSinglePost'),
  fetchCategories: new BlogCircuitBreaker(3, 120000, 1, 'FetchCategories'),
  fetchCourses: new BlogCircuitBreaker(3, 120000, 1, 'FetchCourses'),
  ctaRouting: new BlogCircuitBreaker(5, 60000, 2, 'CTARouting'),
  sanityConnection: new BlogCircuitBreaker(3, 30000, 1, 'SanityConnection'),
  adminOperations: new BlogCircuitBreaker(5, 60000, 2, 'AdminOperations'),
};

// Utility function to safely execute blog operations with comprehensive error handling
export async function safeBlogOperation<T>(
  operation: () => Promise<T>,
  options: {
    operationName: string;
    component: string;
    fallback?: () => T;
    circuitBreaker?: BlogCircuitBreaker;
    retryOptions?: Parameters<typeof BlogRetryHandler.withRetry>[1];
  }
): Promise<T> {
  const { operationName, component, fallback, circuitBreaker, retryOptions } = options;

  try {
    const executeWithRetry = () => BlogRetryHandler.withRetry(operation, {
      ...retryOptions,
      onRetry: (attempt, error) => {
        console.warn(`Retrying ${operationName} (attempt ${attempt}):`, error.message);
      },
    });

    if (circuitBreaker) {
      return await circuitBreaker.execute(executeWithRetry, fallback);
    } else {
      return await executeWithRetry();
    }
  } catch (error) {
    BlogErrorBoundary.handleError(error as Error, {
      component,
      operation: operationName,
    });

    if (fallback) {
      console.warn(`Using fallback for ${operationName} due to error:`, (error as Error).message);
      return fallback();
    }

    throw error;
  }
}

// Enhanced health check utilities with comprehensive monitoring
export class BlogHealthChecker {
  private static healthHistory: Array<{
    timestamp: string;
    overall: boolean;
    services: any;
  }> = [];
  
  private static readonly MAX_HISTORY = 100;

  static async checkSanityConnection(): Promise<{
    healthy: boolean;
    latency?: number;
    error?: string;
    details?: {
      projectId: string;
      dataset: string;
      apiVersion: string;
    };
  }> {
    try {
      const startTime = Date.now();
      
      // Simple query to test connection
      const { enhancedClient, client } = await import('../sanity/client');
      const testResult = await enhancedClient.fetch('*[_type == "post"][0]._id', {}, { retries: 1 });
      
      const latency = Date.now() - startTime;
      
      return {
        healthy: true,
        latency,
        details: {
          projectId: client.config().projectId || 'unknown',
          dataset: client.config().dataset || 'unknown',
          apiVersion: client.config().apiVersion || 'unknown',
        },
      };
    } catch (error) {
      return {
        healthy: false,
        error: (error as Error).message,
        details: {
          projectId: 'unknown',
          dataset: 'unknown',
          apiVersion: 'unknown',
        },
      };
    }
  }

  static async checkAPIEndpoints(): Promise<{
    healthy: boolean;
    endpoints: Record<string, { healthy: boolean; latency?: number; error?: string }>;
  }> {
    const endpoints = [
      { name: 'blogs', url: '/api/blogs' },
      { name: 'health', url: '/api/health' },
    ];

    const results: Record<string, { healthy: boolean; latency?: number; error?: string }> = {};
    let overallHealthy = true;

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.url, { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const latency = Date.now() - startTime;
        
        if (response.ok) {
          results[endpoint.name] = { healthy: true, latency };
        } else {
          results[endpoint.name] = { 
            healthy: false, 
            error: `HTTP ${response.status}: ${response.statusText}` 
          };
          overallHealthy = false;
        }
      } catch (error) {
        results[endpoint.name] = { 
          healthy: false, 
          error: (error as Error).message 
        };
        overallHealthy = false;
      }
    }

    return {
      healthy: overallHealthy,
      endpoints: results,
    };
  }

  static async performHealthCheck(): Promise<{
    overall: boolean;
    services: {
      sanity: { healthy: boolean; latency?: number; error?: string; details?: any };
      api: { healthy: boolean; endpoints: Record<string, any> };
      circuitBreakers: Record<string, { state: string; metrics: any }>;
      fallbackMode: boolean;
    };
    timestamp: string;
    uptime: number;
  }> {
    const startTime = Date.now();
    
    // Check Sanity connection
    const sanityHealth = await this.checkSanityConnection();
    
    // Check API endpoints
    const apiHealth = await this.checkAPIEndpoints();
    
    // Get circuit breaker states and metrics
    const circuitBreakerStates = Object.entries(blogCircuitBreakers).reduce(
      (acc, [name, breaker]) => {
        acc[name] = {
          state: breaker.getState(),
          metrics: breaker.getMetrics(),
        };
        return acc;
      },
      {} as Record<string, { state: string; metrics: any }>
    );

    // Check if we're in fallback mode
    const fallbackMode = BlogErrorBoundary.isFallbackMode();

    const overall = sanityHealth.healthy && 
                   apiHealth.healthy && 
                   !fallbackMode &&
                   Object.values(circuitBreakerStates).every(cb => cb.state !== 'OPEN');

    const healthResult = {
      overall,
      services: {
        sanity: sanityHealth,
        api: apiHealth,
        circuitBreakers: circuitBreakerStates,
        fallbackMode,
      },
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
    };

    // Store in history
    this.healthHistory.push(healthResult);
    if (this.healthHistory.length > this.MAX_HISTORY) {
      this.healthHistory.shift();
    }

    return healthResult;
  }

  static getHealthHistory(): typeof this.healthHistory {
    return [...this.healthHistory];
  }

  static getHealthTrends(): {
    uptimePercentage: number;
    averageLatency: number;
    errorRate: number;
    recentIssues: string[];
  } {
    if (this.healthHistory.length === 0) {
      return {
        uptimePercentage: 100,
        averageLatency: 0,
        errorRate: 0,
        recentIssues: [],
      };
    }

    const totalChecks = this.healthHistory.length;
    const healthyChecks = this.healthHistory.filter(h => h.overall).length;
    const uptimePercentage = (healthyChecks / totalChecks) * 100;

    const latencies = this.healthHistory
      .map(h => h.services.sanity.latency)
      .filter(l => l !== undefined) as number[];
    const averageLatency = latencies.length > 0 
      ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length 
      : 0;

    const errorRate = ((totalChecks - healthyChecks) / totalChecks) * 100;

    const recentIssues = this.healthHistory
      .slice(-10) // Last 10 checks
      .filter(h => !h.overall)
      .map(h => {
        const issues = [];
        if (!h.services.sanity.healthy) issues.push(`Sanity: ${h.services.sanity.error}`);
        if (!h.services.api.healthy) issues.push('API endpoints unhealthy');
        if (h.services.fallbackMode) issues.push('System in fallback mode');
        return issues.join(', ');
      })
      .filter(issue => issue.length > 0);

    return {
      uptimePercentage,
      averageLatency,
      errorRate,
      recentIssues,
    };
  }

  static clearHealthHistory(): void {
    this.healthHistory = [];
  }

  // Auto-recovery mechanism
  static async attemptAutoRecovery(): Promise<{
    attempted: boolean;
    successful: boolean;
    actions: string[];
  }> {
    const actions: string[] = [];
    let successful = false;

    try {
      // Reset error boundary if in fallback mode
      if (BlogErrorBoundary.isFallbackMode()) {
        BlogErrorBoundary.resetErrorCount();
        actions.push('Reset error boundary fallback mode');
      }

      // Reset circuit breakers that are open
      Object.entries(blogCircuitBreakers).forEach(([name, breaker]) => {
        if (breaker.getState() === 'OPEN') {
          breaker.reset();
          actions.push(`Reset ${name} circuit breaker`);
        }
      });

      // Clear API client cache
      const { blogAPIClient } = await import('./api-client');
      blogAPIClient.clearCache();
      actions.push('Cleared API client cache');

      // Test connection after recovery
      const healthCheck = await this.performHealthCheck();
      successful = healthCheck.overall;

      if (successful) {
        actions.push('Auto-recovery successful');
      } else {
        actions.push('Auto-recovery attempted but system still unhealthy');
      }

      return {
        attempted: true,
        successful,
        actions,
      };
    } catch (error) {
      actions.push(`Auto-recovery failed: ${(error as Error).message}`);
      return {
        attempted: true,
        successful: false,
        actions,
      };
    }
  }
}

// Export error types for external use
export type { BlogError } from '../types/blog';