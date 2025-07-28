/**
 * Deletion Rate Limiter and Abuse Prevention
 * 
 * Implements rate limiting, user quotas, and abuse detection
 * to prevent excessive deletion requests and protect the system.
 */

export interface RateLimitRule {
  name: string;
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessful?: boolean; // Only count failed requests
  skipValidation?: boolean; // Skip validation requests
  userSpecific?: boolean; // Apply per user vs globally
}

export interface UserQuota {
  userId: string;
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  currentDaily: number;
  currentWeekly: number;
  currentMonthly: number;
  lastReset: {
    daily: string;
    weekly: string;
    monthly: string;
  };
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  rule: string;
  reason?: string;
}

export interface AbuseDetectionResult {
  isAbusive: boolean;
  confidence: number; // 0-100
  reasons: string[];
  suggestedAction: 'warn' | 'throttle' | 'block' | 'review';
  blockDuration?: number; // milliseconds
}

export interface DeletionAttempt {
  userId: string;
  timestamp: string;
  identifier: string;
  success: boolean;
  error?: string;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

/**
 * Deletion rate limiter and abuse prevention service
 */
export class DeletionRateLimiter {
  private static instance: DeletionRateLimiter;
  private requestCounts: Map<string, Array<{ timestamp: number; success: boolean }>> = new Map();
  private userQuotas: Map<string, UserQuota> = new Map();
  private blockedUsers: Map<string, { until: number; reason: string }> = new Map();
  private deletionAttempts: DeletionAttempt[] = [];
  private readonly maxAttemptHistory = 10000;

  private rateLimitRules: RateLimitRule[] = [
    {
      name: 'global_per_minute',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      userSpecific: false
    },
    {
      name: 'user_per_minute',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
      userSpecific: true
    },
    {
      name: 'user_per_hour',
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 100,
      userSpecific: true
    },
    {
      name: 'user_failures_per_minute',
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5,
      skipSuccessful: true,
      userSpecific: true
    },
    {
      name: 'bulk_operations_per_hour',
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      userSpecific: true
    }
  ];

  private constructor() {
    // Cleanup old data periodically
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  static getInstance(): DeletionRateLimiter {
    if (!DeletionRateLimiter.instance) {
      DeletionRateLimiter.instance = new DeletionRateLimiter();
    }
    return DeletionRateLimiter.instance;
  }

  /**
   * Check if a deletion request is allowed
   */
  async checkRateLimit(
    userId: string,
    requestType: 'single' | 'bulk' | 'validation' = 'single',
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
    }
  ): Promise<RateLimitResult> {
    const now = Date.now();

    // Check if user is blocked
    const blockInfo = this.blockedUsers.get(userId);
    if (blockInfo && blockInfo.until > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockInfo.until,
        retryAfter: blockInfo.until - now,
        rule: 'user_blocked',
        reason: blockInfo.reason
      };
    }

    // Remove expired blocks
    if (blockInfo && blockInfo.until <= now) {
      this.blockedUsers.delete(userId);
    }

    // Check applicable rate limit rules
    for (const rule of this.rateLimitRules) {
      // Skip validation rules if this is a validation request
      if (requestType === 'validation' && rule.skipValidation) {
        continue;
      }

      // Skip bulk-specific rules for single requests
      if (requestType === 'single' && rule.name.includes('bulk')) {
        continue;
      }

      // Skip single-specific rules for bulk requests
      if (requestType === 'bulk' && !rule.name.includes('bulk') && !rule.name.includes('global')) {
        continue;
      }

      const key = rule.userSpecific ? `${rule.name}:${userId}` : rule.name;
      const requests = this.requestCounts.get(key) || [];

      // Remove old requests outside the window
      const windowStart = now - rule.windowMs;
      const recentRequests = requests.filter(req => req.timestamp > windowStart);

      // Filter by success/failure if specified
      const relevantRequests = rule.skipSuccessful
        ? recentRequests.filter(req => !req.success)
        : recentRequests;

      if (relevantRequests.length >= rule.maxRequests) {
        const oldestRequest = Math.min(...recentRequests.map(r => r.timestamp));
        const resetTime = oldestRequest + rule.windowMs;

        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter: resetTime - now,
          rule: rule.name,
          reason: `Rate limit exceeded: ${rule.maxRequests} requests per ${rule.windowMs / 1000} seconds`
        };
      }

      // Update the requests array
      this.requestCounts.set(key, recentRequests);
    }

    // Check user quotas
    const quotaResult = await this.checkUserQuota(userId);
    if (!quotaResult.allowed) {
      return quotaResult;
    }

    // Check for abuse patterns
    const abuseResult = await this.detectAbuse(userId, metadata);
    if (abuseResult.isAbusive && abuseResult.suggestedAction === 'block') {
      const blockDuration = abuseResult.blockDuration || 60 * 60 * 1000; // 1 hour default
      this.blockedUsers.set(userId, {
        until: now + blockDuration,
        reason: `Abuse detected: ${abuseResult.reasons.join(', ')}`
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: now + blockDuration,
        retryAfter: blockDuration,
        rule: 'abuse_detection',
        reason: `Blocked due to abuse: ${abuseResult.reasons.join(', ')}`
      };
    }

    // All checks passed
    return {
      allowed: true,
      remaining: this.calculateRemaining(userId),
      resetTime: now + Math.min(...this.rateLimitRules.map(r => r.windowMs)),
      rule: 'allowed'
    };
  }

  /**
   * Record a deletion attempt
   */
  recordDeletionAttempt(
    userId: string,
    identifier: string,
    success: boolean,
    error?: string,
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
    }
  ): void {
    const now = Date.now();
    const timestamp = new Date().toISOString();

    // Record the attempt
    const attempt: DeletionAttempt = {
      userId,
      timestamp,
      identifier,
      success,
      error,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
      sessionId: metadata?.sessionId
    };

    this.deletionAttempts.push(attempt);

    // Limit history size
    if (this.deletionAttempts.length > this.maxAttemptHistory) {
      this.deletionAttempts = this.deletionAttempts.slice(-this.maxAttemptHistory);
    }

    // Update rate limit counters
    for (const rule of this.rateLimitRules) {
      const key = rule.userSpecific ? `${rule.name}:${userId}` : rule.name;
      const requests = this.requestCounts.get(key) || [];
      
      requests.push({ timestamp: now, success });
      this.requestCounts.set(key, requests);
    }

    // Update user quota
    this.updateUserQuota(userId);

    console.log('📊 Recorded deletion attempt:', {
      userId,
      identifier,
      success,
      error: error ? error.substring(0, 100) : undefined
    });
  }

  /**
   * Check user quota limits
   */
  private async checkUserQuota(userId: string): Promise<RateLimitResult> {
    const quota = this.getUserQuota(userId);
    const now = new Date();

    // Reset counters if needed
    this.resetQuotaCountersIfNeeded(quota, now);

    // Check daily limit
    if (quota.currentDaily >= quota.dailyLimit) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      return {
        allowed: false,
        remaining: 0,
        resetTime: tomorrow.getTime(),
        retryAfter: tomorrow.getTime() - now.getTime(),
        rule: 'daily_quota',
        reason: `Daily quota exceeded: ${quota.dailyLimit} deletions per day`
      };
    }

    // Check weekly limit
    if (quota.currentWeekly >= quota.weeklyLimit) {
      const nextWeek = new Date(quota.lastReset.weekly);
      nextWeek.setDate(nextWeek.getDate() + 7);

      return {
        allowed: false,
        remaining: 0,
        resetTime: nextWeek.getTime(),
        retryAfter: nextWeek.getTime() - now.getTime(),
        rule: 'weekly_quota',
        reason: `Weekly quota exceeded: ${quota.weeklyLimit} deletions per week`
      };
    }

    // Check monthly limit
    if (quota.currentMonthly >= quota.monthlyLimit) {
      const nextMonth = new Date(quota.lastReset.monthly);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      return {
        allowed: false,
        remaining: 0,
        resetTime: nextMonth.getTime(),
        retryAfter: nextMonth.getTime() - now.getTime(),
        rule: 'monthly_quota',
        reason: `Monthly quota exceeded: ${quota.monthlyLimit} deletions per month`
      };
    }

    return {
      allowed: true,
      remaining: Math.min(
        quota.dailyLimit - quota.currentDaily,
        quota.weeklyLimit - quota.currentWeekly,
        quota.monthlyLimit - quota.currentMonthly
      ),
      resetTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).getTime(),
      rule: 'quota_check'
    };
  }

  /**
   * Detect abuse patterns
   */
  private async detectAbuse(
    userId: string,
    metadata?: {
      userAgent?: string;
      ipAddress?: string;
      sessionId?: string;
    }
  ): Promise<AbuseDetectionResult> {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentAttempts = this.deletionAttempts.filter(
      attempt => attempt.userId === userId && new Date(attempt.timestamp).getTime() > oneHourAgo
    );

    const dailyAttempts = this.deletionAttempts.filter(
      attempt => attempt.userId === userId && new Date(attempt.timestamp).getTime() > oneDayAgo
    );

    const reasons: string[] = [];
    let confidence = 0;

    // Check for rapid-fire requests
    if (recentAttempts.length > 50) {
      reasons.push('Excessive requests in short time period');
      confidence += 30;
    }

    // Check for high failure rate
    const failureRate = recentAttempts.length > 0 
      ? recentAttempts.filter(a => !a.success).length / recentAttempts.length 
      : 0;

    if (failureRate > 0.8 && recentAttempts.length > 10) {
      reasons.push('High failure rate indicating automated attacks');
      confidence += 25;
    }

    // Check for suspicious patterns
    const uniqueIdentifiers = new Set(recentAttempts.map(a => a.identifier));
    if (recentAttempts.length > 20 && uniqueIdentifiers.size < 5) {
      reasons.push('Repeated attempts on same posts');
      confidence += 20;
    }

    // Check for bot-like behavior
    if (metadata?.userAgent && this.isSuspiciousUserAgent(metadata.userAgent)) {
      reasons.push('Suspicious user agent detected');
      confidence += 15;
    }

    // Check for distributed attack patterns
    const sessionIds = new Set(recentAttempts.map(a => a.sessionId).filter(Boolean));
    if (sessionIds.size > 10 && recentAttempts.length > 30) {
      reasons.push('Multiple sessions from same user');
      confidence += 20;
    }

    // Check daily volume
    if (dailyAttempts.length > 500) {
      reasons.push('Extremely high daily volume');
      confidence += 35;
    }

    // Determine suggested action
    let suggestedAction: AbuseDetectionResult['suggestedAction'] = 'warn';
    let blockDuration: number | undefined;

    if (confidence >= 80) {
      suggestedAction = 'block';
      blockDuration = 24 * 60 * 60 * 1000; // 24 hours
    } else if (confidence >= 60) {
      suggestedAction = 'throttle';
    } else if (confidence >= 40) {
      suggestedAction = 'review';
    }

    const isAbusive = confidence >= 40;

    if (isAbusive) {
      console.log('🚨 Abuse detected:', {
        userId,
        confidence,
        reasons,
        suggestedAction,
        recentAttempts: recentAttempts.length,
        failureRate: Math.round(failureRate * 100)
      });
    }

    return {
      isAbusive,
      confidence,
      reasons,
      suggestedAction,
      blockDuration
    };
  }

  /**
   * Get or create user quota
   */
  private getUserQuota(userId: string): UserQuota {
    let quota = this.userQuotas.get(userId);
    
    if (!quota) {
      const now = new Date().toISOString();
      quota = {
        userId,
        dailyLimit: 50,
        weeklyLimit: 200,
        monthlyLimit: 500,
        currentDaily: 0,
        currentWeekly: 0,
        currentMonthly: 0,
        lastReset: {
          daily: now,
          weekly: now,
          monthly: now
        }
      };
      this.userQuotas.set(userId, quota);
    }

    return quota;
  }

  /**
   * Update user quota counters
   */
  private updateUserQuota(userId: string): void {
    const quota = this.getUserQuota(userId);
    const now = new Date();

    this.resetQuotaCountersIfNeeded(quota, now);

    quota.currentDaily++;
    quota.currentWeekly++;
    quota.currentMonthly++;
  }

  /**
   * Reset quota counters if time periods have passed
   */
  private resetQuotaCountersIfNeeded(quota: UserQuota, now: Date): void {
    const lastDaily = new Date(quota.lastReset.daily);
    const lastWeekly = new Date(quota.lastReset.weekly);
    const lastMonthly = new Date(quota.lastReset.monthly);

    // Reset daily if it's a new day
    if (now.getDate() !== lastDaily.getDate() || 
        now.getMonth() !== lastDaily.getMonth() || 
        now.getFullYear() !== lastDaily.getFullYear()) {
      quota.currentDaily = 0;
      quota.lastReset.daily = now.toISOString();
    }

    // Reset weekly if it's been 7 days
    const daysSinceWeeklyReset = Math.floor((now.getTime() - lastWeekly.getTime()) / (24 * 60 * 60 * 1000));
    if (daysSinceWeeklyReset >= 7) {
      quota.currentWeekly = 0;
      quota.lastReset.weekly = now.toISOString();
    }

    // Reset monthly if it's a new month
    if (now.getMonth() !== lastMonthly.getMonth() || 
        now.getFullYear() !== lastMonthly.getFullYear()) {
      quota.currentMonthly = 0;
      quota.lastReset.monthly = now.toISOString();
    }
  }

  /**
   * Calculate remaining requests for user
   */
  private calculateRemaining(userId: string): number {
    const quota = this.getUserQuota(userId);
    
    return Math.min(
      quota.dailyLimit - quota.currentDaily,
      quota.weeklyLimit - quota.currentWeekly,
      quota.monthlyLimit - quota.currentMonthly
    );
  }

  /**
   * Check if user agent looks suspicious
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /requests/i,
      /^$/,
      /test/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Get rate limit statistics
   */
  getRateLimitStats(userId?: string): {
    totalRequests: number;
    blockedRequests: number;
    topUsers: Array<{ userId: string; requests: number }>;
    abuseDetections: number;
    quotaExceeded: number;
  } {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentAttempts = this.deletionAttempts.filter(
      attempt => new Date(attempt.timestamp).getTime() > oneHourAgo
    );

    const userAttempts = userId 
      ? recentAttempts.filter(attempt => attempt.userId === userId)
      : recentAttempts;

    // Count requests by user
    const userCounts = new Map<string, number>();
    recentAttempts.forEach(attempt => {
      userCounts.set(attempt.userId, (userCounts.get(attempt.userId) || 0) + 1);
    });

    const topUsers = Array.from(userCounts.entries())
      .map(([userId, requests]) => ({ userId, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      totalRequests: userAttempts.length,
      blockedRequests: this.blockedUsers.size,
      topUsers,
      abuseDetections: 0, // Would track from abuse detection logs
      quotaExceeded: 0 // Would track from quota exceeded logs
    };
  }

  /**
   * Update rate limit rules
   */
  updateRateLimitRules(rules: RateLimitRule[]): void {
    this.rateLimitRules = rules;
    console.log('📊 Rate limit rules updated:', rules.length);
  }

  /**
   * Update user quota limits
   */
  updateUserQuota(userId: string, limits: Partial<Pick<UserQuota, 'dailyLimit' | 'weeklyLimit' | 'monthlyLimit'>>): void {
    const quota = this.getUserQuota(userId);
    
    if (limits.dailyLimit !== undefined) quota.dailyLimit = limits.dailyLimit;
    if (limits.weeklyLimit !== undefined) quota.weeklyLimit = limits.weeklyLimit;
    if (limits.monthlyLimit !== undefined) quota.monthlyLimit = limits.monthlyLimit;

    console.log('📊 User quota updated:', { userId, limits });
  }

  /**
   * Manually block/unblock user
   */
  blockUser(userId: string, durationMs: number, reason: string): void {
    this.blockedUsers.set(userId, {
      until: Date.now() + durationMs,
      reason
    });
    console.log('🚫 User blocked:', { userId, durationMs, reason });
  }

  unblockUser(userId: string): boolean {
    const removed = this.blockedUsers.delete(userId);
    if (removed) {
      console.log('✅ User unblocked:', userId);
    }
    return removed;
  }

  /**
   * Get blocked users
   */
  getBlockedUsers(): Array<{ userId: string; until: number; reason: string }> {
    return Array.from(this.blockedUsers.entries()).map(([userId, info]) => ({
      userId,
      until: info.until,
      reason: info.reason
    }));
  }

  /**
   * Cleanup old data
   */
  private cleanup(): void {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Clean up old request counts
    for (const [key, requests] of this.requestCounts.entries()) {
      const recentRequests = requests.filter(req => req.timestamp > oneDayAgo);
      if (recentRequests.length === 0) {
        this.requestCounts.delete(key);
      } else {
        this.requestCounts.set(key, recentRequests);
      }
    }

    // Clean up old deletion attempts
    this.deletionAttempts = this.deletionAttempts.filter(
      attempt => new Date(attempt.timestamp).getTime() > oneDayAgo
    );

    // Clean up expired blocks
    for (const [userId, blockInfo] of this.blockedUsers.entries()) {
      if (blockInfo.until <= now) {
        this.blockedUsers.delete(userId);
      }
    }

    console.log('🧹 Rate limiter cleanup completed');
  }
}

// Export singleton instance
export const deletionRateLimiter = DeletionRateLimiter.getInstance();