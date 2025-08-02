/**
 * Environment Variable Validation and Configuration Management
 * Validates required production environment variables and provides configuration service
 */

export interface EnvironmentVariable {
  key: string;
  required: boolean;
  description: string;
  defaultValue?: string;
  validator?: (value: string) => boolean;
  errorMessage?: string;
  category: 'sanity' | 'firebase' | 'auth' | 'email' | 'site' | 'admin';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  invalid: string[];
  summary: {
    total: number;
    valid: number;
    missing: number;
    invalid: number;
  };
}

export interface ConfigurationSummary {
  environment: string;
  isProduction: boolean;
  sanity: {
    configured: boolean;
    projectId: string;
    dataset: string;
    hasToken: boolean;
  };
  firebase: {
    configured: boolean;
    hasAdminCredentials: boolean;
  };
  authentication: {
    configured: boolean;
    hasJwtSecret: boolean;
  };
  email: {
    configured: boolean;
    provider: string;
  };
  site: {
    configured: boolean;
    url: string;
  };
}

export class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private environmentVariables: EnvironmentVariable[];

  constructor() {
    this.environmentVariables = this.defineEnvironmentVariables();
  }

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  /**
   * Define all environment variables with their validation rules
   */
  private defineEnvironmentVariables(): EnvironmentVariable[] {
    return [
      // Sanity Configuration
      {
        key: 'NEXT_PUBLIC_SANITY_PROJECT_ID',
        required: true,
        description: 'Sanity project ID for CMS integration',
        category: 'sanity',
        validator: (value) => /^[a-z0-9]{8}$/.test(value),
        errorMessage: 'Must be an 8-character alphanumeric string',
      },
      {
        key: 'NEXT_PUBLIC_SANITY_DATASET',
        required: true,
        description: 'Sanity dataset name',
        category: 'sanity',
        defaultValue: 'production',
        validator: (value) => ['production', 'development', 'staging'].includes(value),
        errorMessage: 'Must be one of: production, development, staging',
      },
      {
        key: 'NEXT_PUBLIC_SANITY_API_VERSION',
        required: true,
        description: 'Sanity API version',
        category: 'sanity',
        defaultValue: '2024-01-01',
        validator: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
        errorMessage: 'Must be in YYYY-MM-DD format',
      },
      {
        key: 'SANITY_API_TOKEN',
        required: true,
        description: 'Sanity API token for write operations',
        category: 'sanity',
        validator: (value) => value.startsWith('sk') && value.length > 50,
        errorMessage: 'Must be a valid Sanity API token starting with "sk"',
      },

      // Site Configuration
      {
        key: 'NEXT_PUBLIC_SITE_URL',
        required: true,
        description: 'Production site URL',
        category: 'site',
        validator: (value) => {
          try {
            const url = new URL(value);
            return url.protocol === 'https:' || url.hostname === 'localhost';
          } catch {
            return false;
          }
        },
        errorMessage: 'Must be a valid HTTPS URL or localhost',
      },

      // Firebase Configuration
      {
        key: 'FIREBASE_API_KEY',
        required: true,
        description: 'Firebase API key',
        category: 'firebase',
        validator: (value) => value.length > 30,
        errorMessage: 'Must be a valid Firebase API key',
      },
      {
        key: 'FIREBASE_PROJECT_ID',
        required: true,
        description: 'Firebase project ID',
        category: 'firebase',
        validator: (value) => /^[a-z0-9-]+$/.test(value),
        errorMessage: 'Must be a valid Firebase project ID (lowercase, numbers, hyphens)',
      },
      {
        key: 'FIREBASE_PRIVATE_KEY',
        required: false,
        description: 'Firebase Admin SDK private key',
        category: 'firebase',
        validator: (value) => value.includes('BEGIN PRIVATE KEY'),
        errorMessage: 'Must be a valid private key in PEM format',
      },
      {
        key: 'FIREBASE_CLIENT_EMAIL',
        required: false,
        description: 'Firebase Admin SDK client email',
        category: 'firebase',
        validator: (value) => value.includes('@') && value.includes('.iam.gserviceaccount.com'),
        errorMessage: 'Must be a valid Firebase service account email',
      },

      // Email Configuration
      {
        key: 'RESEND_API_KEY',
        required: true,
        description: 'Resend API key for email sending',
        category: 'email',
        validator: (value) => value.startsWith('re_'),
        errorMessage: 'Must be a valid Resend API key starting with "re_"',
      },
      {
        key: 'FROM_EMAIL',
        required: true,
        description: 'From email address for notifications',
        category: 'email',
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        errorMessage: 'Must be a valid email address',
      },

      // Admin Configuration
      {
        key: 'ADMIN_USERNAME',
        required: true,
        description: 'Admin dashboard username',
        category: 'admin',
        validator: (value) => value.length >= 3,
        errorMessage: 'Must be at least 3 characters long',
      },
      {
        key: 'ADMIN_PASSWORD',
        required: true,
        description: 'Admin dashboard password',
        category: 'admin',
        validator: (value) => value.length >= 8,
        errorMessage: 'Must be at least 8 characters long',
      },

      // Authentication Configuration
      {
        key: 'JWT_SECRET',
        required: false,
        description: 'JWT secret for token signing (falls back to SANITY_API_TOKEN)',
        category: 'auth',
        validator: (value) => value.length >= 32,
        errorMessage: 'Must be at least 32 characters long',
      },

      // Optional Configuration
      {
        key: 'NEXT_PUBLIC_GA_MEASUREMENT_ID',
        required: false,
        description: 'Google Analytics measurement ID',
        category: 'site',
        validator: (value) => value.startsWith('G-'),
        errorMessage: 'Must be a valid GA4 measurement ID starting with "G-"',
      },
    ];
  }

  /**
   * Validate all environment variables
   */
  validateEnvironment(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const envVar of this.environmentVariables) {
      const value = process.env[envVar.key];

      if (!value) {
        if (envVar.required) {
          missing.push(envVar.key);
          errors.push(`Missing required environment variable: ${envVar.key} - ${envVar.description}`);
        } else {
          warnings.push(`Optional environment variable not set: ${envVar.key} - ${envVar.description}`);
        }
        continue;
      }

      // Validate the value if validator is provided
      if (envVar.validator && !envVar.validator(value)) {
        invalid.push(envVar.key);
        errors.push(`Invalid value for ${envVar.key}: ${envVar.errorMessage || 'Invalid format'}`);
      }
    }

    // Additional validation rules
    this.validateAdditionalRules(errors, warnings);

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      missing,
      invalid,
      summary: {
        total: this.environmentVariables.length,
        valid: this.environmentVariables.length - missing.length - invalid.length,
        missing: missing.length,
        invalid: invalid.length,
      },
    };
  }

  /**
   * Additional validation rules that depend on multiple variables
   */
  private validateAdditionalRules(errors: string[], warnings: string[]): void {
    // Check if Firebase Admin SDK is properly configured
    const hasFirebasePrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
    const hasFirebaseClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;

    if (hasFirebasePrivateKey !== hasFirebaseClientEmail) {
      errors.push('Firebase Admin SDK requires both FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL to be set');
    }

    // Check production-specific requirements
    if (process.env.NODE_ENV === 'production') {
      if (process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
        errors.push('Production environment should not use localhost URLs');
      }

      if (!process.env.JWT_SECRET && !process.env.SANITY_API_TOKEN) {
        errors.push('Production environment requires either JWT_SECRET or SANITY_API_TOKEN for secure authentication');
      }
    }

    // Check for development-specific warnings
    if (process.env.NODE_ENV === 'development') {
      if (!hasFirebasePrivateKey || !hasFirebaseClientEmail) {
        warnings.push('Firebase Admin SDK not configured - some features may not work in development');
      }
    }
  }

  /**
   * Get configuration summary
   */
  getConfigurationSummary(): ConfigurationSummary {
    return {
      environment: process.env.NODE_ENV || 'development',
      isProduction: process.env.NODE_ENV === 'production',
      sanity: {
        configured: !!(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_DATASET),
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'not-configured',
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'not-configured',
        hasToken: !!process.env.SANITY_API_TOKEN,
      },
      firebase: {
        configured: !!(process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID),
        hasAdminCredentials: !!(process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL),
      },
      authentication: {
        configured: !!(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD),
        hasJwtSecret: !!(process.env.JWT_SECRET || process.env.SANITY_API_TOKEN),
      },
      email: {
        configured: !!(process.env.RESEND_API_KEY && process.env.FROM_EMAIL),
        provider: process.env.RESEND_API_KEY ? 'resend' : 'not-configured',
      },
      site: {
        configured: !!process.env.NEXT_PUBLIC_SITE_URL,
        url: process.env.NEXT_PUBLIC_SITE_URL || 'not-configured',
      },
    };
  }

  /**
   * Get environment variables by category
   */
  getVariablesByCategory(category: string): EnvironmentVariable[] {
    return this.environmentVariables.filter(envVar => envVar.category === category);
  }

  /**
   * Get missing required variables
   */
  getMissingRequiredVariables(): string[] {
    return this.environmentVariables
      .filter(envVar => envVar.required && !process.env[envVar.key])
      .map(envVar => envVar.key);
  }

  /**
   * Generate environment template
   */
  generateEnvironmentTemplate(): string {
    const categories = [...new Set(this.environmentVariables.map(v => v.category))];
    
    let template = '# Environment Variables Configuration\n';
    template += '# Generated by Environment Validator\n\n';

    for (const category of categories) {
      const categoryVars = this.getVariablesByCategory(category);
      template += `# ${category.toUpperCase()} Configuration\n`;
      
      for (const envVar of categoryVars) {
        template += `# ${envVar.description}\n`;
        if (envVar.required) {
          template += `${envVar.key}=${envVar.defaultValue || 'your_value_here'}\n`;
        } else {
          template += `# ${envVar.key}=${envVar.defaultValue || 'optional_value'}\n`;
        }
        template += '\n';
      }
    }

    return template;
  }

  /**
   * Validate startup configuration
   */
  validateStartupConfiguration(): {
    canStart: boolean;
    criticalErrors: string[];
    warnings: string[];
  } {
    const validation = this.validateEnvironment();
    const criticalErrors: string[] = [];
    const warnings: string[] = [...validation.warnings];

    // Check for critical errors that prevent startup
    const criticalVars = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET',
      'SANITY_API_TOKEN',
      'NEXT_PUBLIC_SITE_URL',
    ];

    for (const varName of criticalVars) {
      if (!process.env[varName]) {
        criticalErrors.push(`Critical: Missing ${varName} - application cannot start`);
      }
    }

    // Add other critical errors from validation
    criticalErrors.push(...validation.errors.filter(error => 
      error.includes('Missing required') || error.includes('Invalid value')
    ));

    return {
      canStart: criticalErrors.length === 0,
      criticalErrors,
      warnings,
    };
  }

  /**
   * Log configuration status
   */
  logConfigurationStatus(): void {
    const validation = this.validateEnvironment();
    const summary = this.getConfigurationSummary();

    console.log('\n🔧 Environment Configuration Status:');
    console.log(`Environment: ${summary.environment}`);
    console.log(`Valid Variables: ${validation.summary.valid}/${validation.summary.total}`);

    if (validation.isValid) {
      console.log('✅ All required environment variables are configured correctly');
    } else {
      console.log('❌ Configuration issues found:');
      validation.errors.forEach(error => console.log(`  • ${error}`));
    }

    if (validation.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      validation.warnings.forEach(warning => console.log(`  • ${warning}`));
    }

    // Log service status
    console.log('\n📊 Service Configuration:');
    console.log(`Sanity CMS: ${summary.sanity.configured ? '✅' : '❌'} ${summary.sanity.hasToken ? '(Write Access)' : '(Read Only)'}`);
    console.log(`Firebase: ${summary.firebase.configured ? '✅' : '❌'} ${summary.firebase.hasAdminCredentials ? '(Admin SDK)' : '(Client Only)'}`);
    console.log(`Email Service: ${summary.email.configured ? '✅' : '❌'} (${summary.email.provider})`);
    console.log(`Authentication: ${summary.authentication.configured ? '✅' : '❌'}`);
    console.log(`Site URL: ${summary.site.configured ? '✅' : '❌'} (${summary.site.url})`);
  }
}

// Export singleton instance
export const environmentValidator = EnvironmentValidator.getInstance();

// Export utility functions
export const {
  validateEnvironment,
  getConfigurationSummary,
  getMissingRequiredVariables,
  validateStartupConfiguration,
  logConfigurationStatus,
  generateEnvironmentTemplate,
} = environmentValidator;