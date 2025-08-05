/**
 * Admin authentication configuration validation
 */

export interface AdminConfig {
  username: string;
  password: string;
  jwtSecret: string;
  sessionDuration: number;
  maxLoginAttempts: number;
  rateLimitWindow: number;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config?: AdminConfig;
}

/**
 * Validate admin configuration from environment variables
 */
export function validateAdminConfig(): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username) {
    errors.push('ADMIN_USERNAME environment variable is required');
  } else if (username.length < 3) {
    warnings.push('ADMIN_USERNAME should be at least 3 characters long');
  }

  if (!password) {
    errors.push('ADMIN_PASSWORD environment variable is required');
  } else if (password.length < 8) {
    warnings.push('ADMIN_PASSWORD should be at least 8 characters long for security');
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    warnings.push('ADMIN_PASSWORD should contain uppercase, lowercase, and numeric characters');
  }

  // Optional environment variables with defaults
  const jwtSecret = process.env.ADMIN_JWT_SECRET || 'fallback-secret-key-change-in-production';
  const sessionDuration = parseInt(process.env.ADMIN_SESSION_DURATION || '86400'); // 24 hours
  const maxLoginAttempts = parseInt(process.env.ADMIN_MAX_LOGIN_ATTEMPTS || '5');
  const rateLimitWindow = parseInt(process.env.ADMIN_RATE_LIMIT_WINDOW || '900'); // 15 minutes

  // Validate JWT secret
  if (jwtSecret === 'fallback-secret-key-change-in-production') {
    if (process.env.NODE_ENV === 'production') {
      errors.push('ADMIN_JWT_SECRET must be set in production environment');
    } else {
      warnings.push('ADMIN_JWT_SECRET should be set for enhanced security');
    }
  } else if (jwtSecret.length < 32) {
    warnings.push('ADMIN_JWT_SECRET should be at least 32 characters long');
  }

  // Validate numeric values
  if (isNaN(sessionDuration) || sessionDuration < 300) { // Minimum 5 minutes
    warnings.push('ADMIN_SESSION_DURATION should be a valid number (minimum 300 seconds)');
  }

  if (isNaN(maxLoginAttempts) || maxLoginAttempts < 1 || maxLoginAttempts > 20) {
    warnings.push('ADMIN_MAX_LOGIN_ATTEMPTS should be between 1 and 20');
  }

  if (isNaN(rateLimitWindow) || rateLimitWindow < 60) { // Minimum 1 minute
    warnings.push('ADMIN_RATE_LIMIT_WINDOW should be at least 60 seconds');
  }

  const valid = errors.length === 0;

  const result: ConfigValidationResult = {
    valid,
    errors,
    warnings
  };

  if (valid && username && password) {
    result.config = {
      username,
      password,
      jwtSecret,
      sessionDuration: isNaN(sessionDuration) ? 86400 : sessionDuration,
      maxLoginAttempts: isNaN(maxLoginAttempts) ? 5 : maxLoginAttempts,
      rateLimitWindow: isNaN(rateLimitWindow) ? 900 : rateLimitWindow
    };
  }

  return result;
}

/**
 * Get admin configuration with validation
 */
export function getAdminConfig(): AdminConfig {
  const validation = validateAdminConfig();
  
  if (!validation.valid) {
    throw new Error(`Admin configuration invalid: ${validation.errors.join(', ')}`);
  }

  if (!validation.config) {
    throw new Error('Admin configuration not available');
  }

  return validation.config;
}

/**
 * Check if admin is properly configured
 */
export function isAdminConfigured(): boolean {
  const validation = validateAdminConfig();
  return validation.valid;
}

/**
 * Get configuration status for admin dashboard
 */
export function getConfigStatus(): {
  configured: boolean;
  errors: string[];
  warnings: string[];
  environment: string;
  securityLevel: 'low' | 'medium' | 'high';
} {
  const validation = validateAdminConfig();
  const environment = process.env.NODE_ENV || 'development';
  
  // Determine security level
  let securityLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (validation.valid) {
    if (validation.warnings.length === 0) {
      securityLevel = 'high';
    } else if (validation.warnings.length <= 2) {
      securityLevel = 'medium';
    }
  }

  return {
    configured: validation.valid,
    errors: validation.errors,
    warnings: validation.warnings,
    environment,
    securityLevel
  };
}

/**
 * Development vs Production configuration differences
 */
export function getEnvironmentSpecificConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    isProduction,
    cookieSecure: isProduction,
    cookieSameSite: isProduction ? 'strict' as const : 'lax' as const,
    sessionDuration: isProduction ? 8 * 60 * 60 : 24 * 60 * 60, // 8 hours in prod, 24 in dev
    rateLimitStrict: isProduction,
    detailedErrors: !isProduction,
    logLevel: isProduction ? 'error' : 'debug'
  };
}