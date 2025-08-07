/**
 * Setup Validation Service
 * 
 * Comprehensive validation for all required environment variables and credentials
 * with specific validation for each analytics service and detailed setup guidance.
 */

import { credentialValidator } from './CredentialValidator';
import { authManager } from './AuthenticationManager';
import { errorHandler } from './ErrorHandler';

export interface EnvironmentVariable {
  key: string;
  required: boolean;
  description: string;
  category: 'ga4' | 'firebase' | 'search-console' | 'general';
  validator?: (value: string) => boolean;
  errorMessage?: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  variable?: string;
  currentValue?: string;
  expectedFormat?: string;
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export interface SetupValidationResult {
  isValid: boolean;
  overallScore: number; // 0-100
  issues: ValidationIssue[];
  serviceStatuses: {
    ga4: 'configured' | 'partial' | 'not_configured' | 'error';
    firebase: 'configured' | 'partial' | 'not_configured' | 'error';
    searchConsole: 'configured' | 'partial' | 'not_configured' | 'error';
  };
  recommendations: string[];
  nextSteps: string[];
}

export class SetupValidationService {
  private readonly REQUIRED_VARIABLES: EnvironmentVariable[] = [
    // GA4 Variables
    {
      key: 'GA4_PROPERTY_ID',
      required: true,
      description: 'Google Analytics 4 Property ID',
      category: 'ga4',
      validator: (value) => /^\\d{9,}$/.test(value),
      errorMessage: 'Must be a numeric property ID (9+ digits)'
    },
    {
      key: 'GA4_SERVICE_ACCOUNT_KEY',
      required: true,
      description: 'GA4 Service Account JSON Key',
      category: 'ga4',
      validator: (value) => {
        try {
          const parsed = JSON.parse(value);
          return parsed.type === 'service_account' && 
                 parsed.private_key && 
                 parsed.client_email;
        } catch {
          return false;
        }
      },
      errorMessage: 'Must be valid service account JSON with type, private_key, and client_email'
    },

    // Firebase Variables
    {
      key: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      required: true,
      description: 'Google Service Account Email',
      category: 'firebase',
      validator: (value) => value.includes('@') && value.includes('.iam.gserviceaccount.com'),
      errorMessage: 'Must be a valid service account email ending with .iam.gserviceaccount.com'
    },
    {
      key: 'GOOGLE_PRIVATE_KEY',
      required: true,
      description: 'Google Service Account Private Key',
      category: 'firebase',
      validator: (value) => value.includes('-----BEGIN PRIVATE KEY-----') && 
                           value.includes('-----END PRIVATE KEY-----'),
      errorMessage: 'Must be a valid PEM format private key'
    },
    {
      key: 'GOOGLE_CLOUD_PROJECT_ID',
      required: true,
      description: 'Google Cloud Project ID',
      category: 'general',
      validator: (value) => /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value),
      errorMessage: 'Must be a valid Google Cloud project ID (lowercase, 6-30 chars, alphanumeric and hyphens)'
    },

    // Search Console Variables
    {
      key: 'GOOGLE_SEARCH_CONSOLE_SITE_URL',
      required: true,
      description: 'Google Search Console Site URL',
      category: 'search-console',
      validator: (value) => {
        try {
          const url = new URL(value);
          return ['http:', 'https:'].includes(url.protocol);
        } catch {
          return false;
        }
      },
      errorMessage: 'Must be a valid URL starting with http:// or https://'
    },

    // Optional but recommended
    {
      key: 'GA4_SERVICE_ACCOUNT_PATH',
      required: false,
      description: 'Path to GA4 Service Account JSON file (alternative to GA4_SERVICE_ACCOUNT_KEY)',
      category: 'ga4'
    }
  ];

  /**
   * Perform comprehensive setup validation
   */
  async validateSetup(): Promise<SetupValidationResult> {
    try {
      const issues: ValidationIssue[] = [];
      const serviceStatuses = {
        ga4: 'not_configured' as const,
        firebase: 'not_configured' as const,
        searchConsole: 'not_configured' as const
      };

      // 1. Validate environment variables
      const envIssues = this.validateEnvironmentVariables();
      issues.push(...envIssues);

      // 2. Validate credentials using CredentialValidator
      const credentialResults = await credentialValidator.validateAllCredentials();
      
      // Process GA4 validation
      if (credentialResults.ga4.isValid) {
        serviceStatuses.ga4 = 'configured';
      } else if (credentialResults.ga4.propertyId || credentialResults.ga4.serviceAccountEmail) {
        serviceStatuses.ga4 = 'partial';
        issues.push(...this.createCredentialIssues('ga4', credentialResults.ga4));
      } else {
        serviceStatuses.ga4 = 'not_configured';
        issues.push(this.createNotConfiguredIssue('ga4'));
      }

      // Process Firebase validation
      if (credentialResults.firebase.isValid) {
        serviceStatuses.firebase = 'configured';
      } else if (credentialResults.firebase.serviceAccountEmail || credentialResults.firebase.projectId) {
        serviceStatuses.firebase = 'partial';
        issues.push(...this.createCredentialIssues('firebase', credentialResults.firebase));
      } else {
        serviceStatuses.firebase = 'not_configured';
        issues.push(this.createNotConfiguredIssue('firebase'));
      }

      // Process Search Console validation
      if (credentialResults.searchConsole.isValid) {
        serviceStatuses.searchConsole = 'configured';
      } else if (credentialResults.searchConsole.siteUrl) {
        serviceStatuses.searchConsole = 'partial';
        issues.push(...this.createCredentialIssues('search-console', credentialResults.searchConsole));
      } else {
        serviceStatuses.searchConsole = 'not_configured';
        issues.push(this.createNotConfiguredIssue('search-console'));
      }

      // 3. Check service connectivity
      const connectivityIssues = await this.validateServiceConnectivity(serviceStatuses);
      issues.push(...connectivityIssues);

      // 4. Generate recommendations and next steps
      const recommendations = this.generateRecommendations(serviceStatuses, issues);
      const nextSteps = this.generateNextSteps(issues);

      // 5. Calculate overall score
      const overallScore = this.calculateOverallScore(serviceStatuses, issues);

      return {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        overallScore,
        issues: issues.sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority)),
        serviceStatuses,
        recommendations,
        nextSteps
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'setup-validation',
        operation: 'validate_setup',
        timestamp: new Date()
      });

      return {
        isValid: false,
        overallScore: 0,
        issues: [{
          severity: 'error',
          category: 'system',
          title: 'Setup Validation Failed',
          description: authError.userMessage,
          action: 'Check system configuration and try again',
          priority: 'critical',
          estimatedTime: '5 minutes'
        }],
        serviceStatuses: {
          ga4: 'error',
          firebase: 'error',
          searchConsole: 'error'
        },
        recommendations: ['Fix system configuration issues'],
        nextSteps: ['Review error logs and system setup']
      };
    }
  }

  /**
   * Validate environment variables
   */
  private validateEnvironmentVariables(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const variable of this.REQUIRED_VARIABLES) {
      const value = process.env[variable.key];

      if (variable.required && !value) {
        issues.push({
          severity: 'error',
          category: variable.category,
          title: `Missing ${variable.description}`,
          description: `Environment variable ${variable.key} is required but not set`,
          variable: variable.key,
          expectedFormat: variable.errorMessage || 'Required value',
          action: `Set ${variable.key} environment variable`,
          priority: 'critical',
          estimatedTime: '5 minutes'
        });
      } else if (value && variable.validator && !variable.validator(value)) {
        issues.push({
          severity: 'error',
          category: variable.category,
          title: `Invalid ${variable.description}`,
          description: `Environment variable ${variable.key} has invalid format`,
          variable: variable.key,
          currentValue: this.maskSensitiveValue(variable.key, value),
          expectedFormat: variable.errorMessage || 'Valid format required',
          action: `Fix ${variable.key} format`,
          priority: 'high',
          estimatedTime: '10 minutes'
        });
      } else if (!variable.required && !value) {
        issues.push({
          severity: 'info',
          category: variable.category,
          title: `Optional ${variable.description} not set`,
          description: `${variable.key} is optional but recommended for full functionality`,
          variable: variable.key,
          action: `Consider setting ${variable.key}`,
          priority: 'low',
          estimatedTime: '5 minutes'
        });
      }
    }

    return issues;
  }

  /**
   * Create credential validation issues
   */
  private createCredentialIssues(service: string, result: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const error of result.errors) {
      issues.push({
        severity: 'error',
        category: service,
        title: `${this.getServiceDisplayName(service)} Configuration Error`,
        description: error,
        action: `Fix ${service} credentials`,
        priority: 'high',
        estimatedTime: '15 minutes'
      });
    }

    for (const warning of result.warnings) {
      issues.push({
        severity: 'warning',
        category: service,
        title: `${this.getServiceDisplayName(service)} Configuration Warning`,
        description: warning,
        action: `Review ${service} setup`,
        priority: 'medium',
        estimatedTime: '10 minutes'
      });
    }

    return issues;
  }

  /**
   * Create not configured issue
   */
  private createNotConfiguredIssue(service: string): ValidationIssue {
    return {
      severity: 'warning',
      category: service,
      title: `${this.getServiceDisplayName(service)} Not Configured`,
      description: `${this.getServiceDisplayName(service)} credentials are not configured`,
      action: `Configure ${this.getServiceDisplayName(service)}`,
      priority: 'medium',
      estimatedTime: '20 minutes'
    };
  }

  /**
   * Validate service connectivity
   */
  private async validateServiceConnectivity(serviceStatuses: any): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    try {
      const authStatuses = await authManager.getServiceStatus();

      for (const authStatus of authStatuses) {
        const serviceName = this.normalizeServiceName(authStatus.service);
        
        if (serviceStatuses[serviceName] === 'configured' && authStatus.status === 'error') {
          issues.push({
            severity: 'error',
            category: serviceName,
            title: `${authStatus.service} Connection Failed`,
            description: authStatus.error || 'Service connection test failed',
            action: `Check ${authStatus.service} permissions and network connectivity`,
            priority: 'high',
            estimatedTime: '15 minutes'
          });
        }
      }
    } catch (error) {
      issues.push({
        severity: 'warning',
        category: 'connectivity',
        title: 'Service Connectivity Check Failed',
        description: 'Unable to test service connectivity',
        action: 'Check network connection and service availability',
        priority: 'medium',
        estimatedTime: '10 minutes'
      });
    }

    return issues;
  }

  /**
   * Generate recommendations based on current state
   */
  private generateRecommendations(serviceStatuses: any, issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (errorCount === 0 && warningCount === 0) {
      recommendations.push('✅ All analytics services are properly configured and working');
      recommendations.push('Consider setting up monitoring and alerts for service health');
      return recommendations;
    }

    if (serviceStatuses.ga4 === 'not_configured') {
      recommendations.push('🔧 Set up Google Analytics 4 for comprehensive web analytics');
    } else if (serviceStatuses.ga4 === 'partial') {
      recommendations.push('⚠️ Complete Google Analytics 4 configuration for full functionality');
    }

    if (serviceStatuses.firebase === 'not_configured') {
      recommendations.push('🔧 Configure Firebase for enhanced analytics and data storage');
    } else if (serviceStatuses.firebase === 'partial') {
      recommendations.push('⚠️ Fix Firebase configuration issues for reliable data storage');
    }

    if (serviceStatuses.searchConsole === 'not_configured') {
      recommendations.push('🔧 Set up Google Search Console for SEO insights');
    } else if (serviceStatuses.searchConsole === 'partial') {
      recommendations.push('⚠️ Complete Search Console setup for search performance data');
    }

    if (errorCount > 0) {
      recommendations.push(`🚨 Fix ${errorCount} critical configuration error${errorCount > 1 ? 's' : ''} first`);
    }

    if (warningCount > 0) {
      recommendations.push(`⚠️ Address ${warningCount} configuration warning${warningCount > 1 ? 's' : ''} for optimal performance`);
    }

    return recommendations;
  }

  /**
   * Generate next steps based on issues
   */
  private generateNextSteps(issues: ValidationIssue[]): string[] {
    const nextSteps: string[] = [];
    const criticalIssues = issues.filter(i => i.priority === 'critical');
    const highIssues = issues.filter(i => i.priority === 'high');

    if (criticalIssues.length > 0) {
      nextSteps.push(`1. Fix ${criticalIssues.length} critical issue${criticalIssues.length > 1 ? 's' : ''} immediately`);
      criticalIssues.slice(0, 3).forEach((issue, index) => {
        nextSteps.push(`   ${String.fromCharCode(97 + index)}. ${issue.action}`);
      });
    }

    if (highIssues.length > 0) {
      const startIndex = criticalIssues.length > 0 ? 2 : 1;
      nextSteps.push(`${startIndex}. Address ${highIssues.length} high-priority issue${highIssues.length > 1 ? 's' : ''}`);
      highIssues.slice(0, 2).forEach((issue, index) => {
        nextSteps.push(`   ${String.fromCharCode(97 + index)}. ${issue.action}`);
      });
    }

    if (issues.length === 0) {
      nextSteps.push('1. All configurations are valid - no immediate action required');
      nextSteps.push('2. Consider setting up monitoring and backup procedures');
    }

    return nextSteps;
  }

  /**
   * Calculate overall setup score (0-100)
   */
  private calculateOverallScore(serviceStatuses: any, issues: ValidationIssue[]): number {
    let score = 100;

    // Deduct points for service configuration issues
    Object.values(serviceStatuses).forEach((status: any) => {
      switch (status) {
        case 'not_configured':
          score -= 20;
          break;
        case 'partial':
          score -= 10;
          break;
        case 'error':
          score -= 25;
          break;
      }
    });

    // Deduct points for issues
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'error':
          score -= issue.priority === 'critical' ? 15 : 10;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get priority weight for sorting
   */
  private getPriorityWeight(priority: string): number {
    const weights = { critical: 1, high: 2, medium: 3, low: 4 };
    return weights[priority as keyof typeof weights] || 5;
  }

  /**
   * Mask sensitive values for display
   */
  private maskSensitiveValue(key: string, value: string): string {
    const sensitiveKeys = ['KEY', 'SECRET', 'TOKEN', 'PASSWORD'];
    
    if (sensitiveKeys.some(sensitive => key.includes(sensitive))) {
      if (value.length <= 8) {
        return '*'.repeat(value.length);
      }
      return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
    }

    return value;
  }

  /**
   * Get display name for service
   */
  private getServiceDisplayName(service: string): string {
    const mapping: Record<string, string> = {
      'ga4': 'Google Analytics 4',
      'firebase': 'Firebase Analytics',
      'search-console': 'Google Search Console'
    };

    return mapping[service] || service;
  }

  /**
   * Normalize service names
   */
  private normalizeServiceName(service: string): string {
    const mapping: Record<string, string> = {
      'Google Analytics 4': 'ga4',
      'Firebase Analytics': 'firebase',
      'Google Search Console': 'searchConsole'
    };

    return mapping[service] || service.toLowerCase().replace(/\\s+/g, '');
  }

  /**
   * Get setup instructions for specific issues
   */
  getSetupInstructions(issues: ValidationIssue[]): Record<string, string[]> {
    const instructions: Record<string, string[]> = {};

    for (const issue of issues) {
      if (!instructions[issue.category]) {
        instructions[issue.category] = [];
      }

      switch (issue.category) {
        case 'ga4':
          if (issue.variable === 'GA4_PROPERTY_ID') {
            instructions[issue.category].push(
              '1. Go to Google Analytics (analytics.google.com)',
              '2. Select your property',
              '3. Go to Admin > Property Settings',
              '4. Copy the Property ID (numeric value)',
              '5. Set GA4_PROPERTY_ID environment variable'
            );
          } else if (issue.variable === 'GA4_SERVICE_ACCOUNT_KEY') {
            instructions[issue.category].push(
              '1. Go to Google Cloud Console (console.cloud.google.com)',
              '2. Select your project',
              '3. Go to IAM & Admin > Service Accounts',
              '4. Create or select a service account',
              '5. Generate a new JSON key',
              '6. Set GA4_SERVICE_ACCOUNT_KEY with the JSON content'
            );
          }
          break;

        case 'firebase':
          if (issue.variable === 'GOOGLE_SERVICE_ACCOUNT_EMAIL') {
            instructions[issue.category].push(
              '1. Go to Google Cloud Console',
              '2. Navigate to IAM & Admin > Service Accounts',
              '3. Copy the service account email',
              '4. Set GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable'
            );
          } else if (issue.variable === 'GOOGLE_PRIVATE_KEY') {
            instructions[issue.category].push(
              '1. Generate a service account key in Google Cloud Console',
              '2. Download the JSON key file',
              '3. Extract the private_key field',
              '4. Set GOOGLE_PRIVATE_KEY environment variable'
            );
          }
          break;

        case 'search-console':
          if (issue.variable === 'GOOGLE_SEARCH_CONSOLE_SITE_URL') {
            instructions[issue.category].push(
              '1. Go to Google Search Console (search.google.com/search-console)',
              '2. Add and verify your website',
              '3. Copy the verified site URL',
              '4. Set GOOGLE_SEARCH_CONSOLE_SITE_URL environment variable'
            );
          }
          break;
      }
    }

    return instructions;
  }

  /**
   * Quick validation check for specific service
   */
  async validateService(service: 'ga4' | 'firebase' | 'search-console'): Promise<{
    isValid: boolean;
    issues: ValidationIssue[];
    score: number;
  }> {
    const fullValidation = await this.validateSetup();
    const serviceIssues = fullValidation.issues.filter(i => i.category === service);
    const serviceStatus = fullValidation.serviceStatuses[service];
    
    let score = 100;
    if (serviceStatus === 'not_configured') score = 0;
    else if (serviceStatus === 'partial') score = 50;
    else if (serviceStatus === 'error') score = 25;

    serviceIssues.forEach(issue => {
      if (issue.severity === 'error') score -= 20;
      else if (issue.severity === 'warning') score -= 10;
    });

    return {
      isValid: serviceIssues.filter(i => i.severity === 'error').length === 0,
      issues: serviceIssues,
      score: Math.max(0, score)
    };
  }
}

// Export singleton instance
export const setupValidationService = new SetupValidationService();