/**
 * Rate Limiting Service
 * Implements rate limiting for authentication endpoints
 */

import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if request is within rate limit
   */
  checkRateLimit(
    identifier: string,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    maxRequests: number = 5
  ): RateLimitResult {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const entry = this.store.get(identifier);

    if (!entry) {
      // First request from this identifier
      this.store.set(identifier, {
        count: 1,
        resetTime,
        firstRequest: now,
      });

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    // Check if window has expired
    if (now >= entry.resetTime) {
      // Reset the window
      this.store.set(identifier, {
        count: 1,
        resetTime,
        firstRequest: now,
      });

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime,
      };
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Get identifier for rate limiting (IP + User Agent hash)
   */
  getIdentifier(request: NextRequest): string {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Create a simple hash of user agent to avoid storing full UA strings
    const uaHash = this.simpleHash(userAgent);
    
    return `${ip}:${uaHash}`;
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    // Check various headers for the real IP
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }

    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    // Fallback to a default IP for development
    return '127.0.0.1';
  }

  /**
   * Simple hash function for user agent
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.store.delete(key));
    
    if (toDelete.length > 0) {
      console.log(`🧹 Cleaned up ${toDelete.length} expired rate limit entries`);
    }
  }

  /**
   * Clear all rate limit entries (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current stats
   */
  getStats(): {
    totalEntries: number;
    activeEntries: number;
  } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.store.values()) {
      if (now < entry.resetTime) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.store.size,
      activeEntries,
    };
  }

  /**
   * Destroy the rate limiter (cleanup)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

/**
 * Rate limiting configurations for different endpoints
 */
export const rateLimitConfigs = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // API endpoints - moderate limits
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  
  // Admin endpoints - moderate limits
  admin: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  
  // Studio endpoints - lenient limits
  studio: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
};

// Export singleton instance
export const rateLimiter = RateLimiter.getInstance();