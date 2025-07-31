// Consolidated type definitions for the Aviators Training Centre project

// Blog related types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  seo?: SEOMetadata;
}

export interface BlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  featuredImage?: string;
  tags?: string[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error handling types
export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  timestamp?: Date;
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Performance monitoring types
export interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  operation: string;
  totalCalls: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  errorRate: number;
}

// Health check types
export interface HealthCheck {
  name: string;
  description: string;
  check: () => Promise<HealthCheckResult>;
  timeout?: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'unhealthy';
  message: string;
  details?: any;
  timestamp: Date;
}

// Conversion tracking types
export interface ConversionEvent {
  id: string;
  userId: string;
  blogPostId: string;
  eventType: 'view' | 'engagement' | 'conversion';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversionData {
  totalBlogViews: number;
  uniqueVisitors: number;
  conversionRate: number;
  topPerformingPosts: BlogPostPreview[];
  conversionsBySource: Record<string, number>;
}

// Toast notification types
export type ToasterToast = {
  variant?: "default" | "destructive";
  id: string;
  title?: string;
  description?: string;
  action?: any;
  duration?: number;
};

export type Toast = Omit<ToasterToast, "id">;

// Hook return types
export interface UseErrorHandlerReturn {
  error: ErrorInfo | null;
  isRetrying: boolean;
  retry: () => void;
  clearError: () => void;
}

export interface UsePerformanceOptimizationReturn {
  loading: boolean;
  optimizing: boolean;
  metrics: PerformanceMetric[];
  optimize: () => Promise<void>;
}

// Service status types
export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'maintenance';
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface ServiceNotification {
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  dismissible?: boolean;
}

// Configuration types
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
