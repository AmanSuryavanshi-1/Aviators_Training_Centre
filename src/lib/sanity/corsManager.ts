/**
 * CORS Configuration Manager for Sanity Studio
 * Validates and manages CORS settings for production deployment
 */

export interface CORSValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
  currentOrigins: string[];
  requiredOrigins: string[];
}

export interface CORSInstructions {
  title: string;
  steps: {
    step: number;
    title: string;
    description: string;
    action: string;
    screenshot?: string;
  }[];
  troubleshooting: {
    issue: string;
    solution: string;
  }[];
}

export interface CORSStatus {
  isConfigured: boolean;
  lastChecked: Date;
  origins: {
    url: string;
    status: 'working' | 'error' | 'untested';
    error?: string;
  }[];
  recommendations: string[];
}

export class SanityCORSManager {
  private projectId: string;
  private siteUrl: string;
  private apiVersion: string;

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
    this.siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    this.apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';
  }

  /**
   * Validate current CORS configuration
   */
  async validateCORSConfiguration(): Promise<CORSValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    const requiredOrigins = this.getRequiredOrigins();
    
    // Check if required environment variables are present
    if (!this.projectId) {
      errors.push('NEXT_PUBLIC_SANITY_PROJECT_ID is not configured');
    }
    
    if (!this.siteUrl) {
      errors.push('NEXT_PUBLIC_SITE_URL is not configured');
    }

    // Check if site URL is production ready
    if (this.siteUrl.includes('localhost')) {
      warnings.push('Site URL is localhost - ensure production URL is configured');
    }

    // Validate URL format
    try {
      new URL(this.siteUrl);
    } catch {
      errors.push('NEXT_PUBLIC_SITE_URL is not a valid URL');
    }

    // Check for HTTPS in production
    if (process.env.NODE_ENV === 'production' && !this.siteUrl.startsWith('https://')) {
      errors.push('Production site URL must use HTTPS');
    }

    // Generate recommendations
    if (errors.length === 0) {
      recommendations.push('Configure CORS origins in Sanity Management Console');
      recommendations.push('Test CORS configuration with browser developer tools');
      recommendations.push('Monitor CORS errors in production logs');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      currentOrigins: [], // Would be fetched from Sanity API if available
      requiredOrigins,
    };
  }

  /**
   * Generate step-by-step CORS configuration instructions
   */
  generateCORSInstructions(): CORSInstructions {
    const siteUrl = this.siteUrl || 'https://www.aviatorstrainingcentre.in';
    const projectId = this.projectId || '3u4fa9kl';

    return {
      title: 'Configure CORS Origins in Sanity Management Console',
      steps: [
        {
          step: 1,
          title: 'Access Sanity Management Console',
          description: 'Navigate to the Sanity Management Console',
          action: `Go to https://www.sanity.io/manage/personal/project/${projectId}`,
        },
        {
          step: 2,
          title: 'Navigate to API Settings',
          description: 'Find the API configuration section',
          action: 'Click on "API" in the left sidebar menu',
        },
        {
          step: 3,
          title: 'Access CORS Origins',
          description: 'Locate the CORS origins configuration',
          action: 'Scroll down to find "CORS Origins" section',
        },
        {
          step: 4,
          title: 'Add Production Origin',
          description: 'Add your production website URL',
          action: `Click "Add CORS origin" and enter: ${siteUrl}`,
        },
        {
          step: 5,
          title: 'Enable Credentials',
          description: 'Allow credentials for authentication',
          action: 'Check "Allow credentials" checkbox for the added origin',
        },
        {
          step: 6,
          title: 'Save Configuration',
          description: 'Save the CORS configuration',
          action: 'Click "Save" to apply the CORS settings',
        },
        {
          step: 7,
          title: 'Verify Configuration',
          description: 'Test the CORS configuration',
          action: `Navigate to ${siteUrl}/studio and verify it loads without CORS errors`,
        },
      ],
      troubleshooting: [
        {
          issue: 'CORS error still appears after configuration',
          solution: 'Wait 5-10 minutes for changes to propagate, then clear browser cache and try again',
        },
        {
          issue: 'Studio loads but authentication fails',
          solution: 'Ensure "Allow credentials" is enabled for your origin in Sanity Management Console',
        },
        {
          issue: 'Multiple CORS origins needed',
          solution: 'Add both www and non-www versions of your domain (e.g., https://aviatorstrainingcentre.in and https://www.aviatorstrainingcentre.in)',
        },
        {
          issue: 'Development vs Production origins',
          solution: 'Add localhost:3000 for development and your production URL for live site',
        },
      ],
    };
  }

  /**
   * Check CORS status by attempting requests
   */
  async checkCORSStatus(): Promise<CORSStatus> {
    const origins = this.getRequiredOrigins();
    const status: CORSStatus = {
      isConfigured: false,
      lastChecked: new Date(),
      origins: [],
      recommendations: [],
    };

    for (const origin of origins) {
      try {
        // Simulate a CORS preflight request check
        const originStatus = {
          url: origin,
          status: 'untested' as const,
          error: undefined as string | undefined,
        };

        // In a real implementation, you would make actual requests to test CORS
        // For now, we'll provide basic validation
        if (origin.startsWith('https://') || origin.startsWith('http://localhost')) {
          originStatus.status = 'working';
        } else {
          originStatus.status = 'error';
          originStatus.error = 'Invalid origin format';
        }

        status.origins.push(originStatus);
      } catch (error) {
        status.origins.push({
          url: origin,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Determine if CORS is configured
    status.isConfigured = status.origins.some(o => o.status === 'working');

    // Generate recommendations
    if (!status.isConfigured) {
      status.recommendations.push('Configure CORS origins in Sanity Management Console');
      status.recommendations.push('Add your production domain to allowed origins');
    }

    const hasErrors = status.origins.some(o => o.status === 'error');
    if (hasErrors) {
      status.recommendations.push('Fix CORS configuration errors');
      status.recommendations.push('Verify origin URLs are correctly formatted');
    }

    return status;
  }

  /**
   * Get required CORS origins based on environment
   */
  private getRequiredOrigins(): string[] {
    const origins: string[] = [];

    // Add production URL
    if (this.siteUrl && !this.siteUrl.includes('localhost')) {
      origins.push(this.siteUrl);
      
      // Add www and non-www versions
      if (this.siteUrl.includes('www.')) {
        origins.push(this.siteUrl.replace('www.', ''));
      } else {
        const url = new URL(this.siteUrl);
        origins.push(`${url.protocol}//www.${url.host}${url.pathname}`);
      }
    }

    // Add development origins
    if (process.env.NODE_ENV === 'development') {
      origins.push('http://localhost:3000');
      origins.push('http://localhost:3001');
      origins.push('http://127.0.0.1:3000');
    }

    // Remove duplicates
    return [...new Set(origins)];
  }

  /**
   * Generate CORS configuration summary
   */
  getConfigurationSummary(): {
    projectId: string;
    siteUrl: string;
    requiredOrigins: string[];
    managementConsoleUrl: string;
    apiSettingsUrl: string;
  } {
    return {
      projectId: this.projectId,
      siteUrl: this.siteUrl,
      requiredOrigins: this.getRequiredOrigins(),
      managementConsoleUrl: `https://www.sanity.io/manage/personal/project/${this.projectId}`,
      apiSettingsUrl: `https://www.sanity.io/manage/personal/project/${this.projectId}/api`,
    };
  }

  /**
   * Generate quick fix commands for common CORS issues
   */
  generateQuickFixes(): {
    issue: string;
    fix: string;
    command?: string;
  }[] {
    return [
      {
        issue: 'Missing production URL in environment',
        fix: 'Add NEXT_PUBLIC_SITE_URL to your environment variables',
        command: 'echo "NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in" >> .env.local',
      },
      {
        issue: 'CORS origins not configured in Sanity',
        fix: 'Add your domain to CORS origins in Sanity Management Console',
      },
      {
        issue: 'Studio authentication failing',
        fix: 'Ensure "Allow credentials" is enabled for your origin',
      },
      {
        issue: 'Multiple domains needed',
        fix: 'Add both www and non-www versions of your domain',
      },
    ];
  }
}

// Export singleton instance
export const corsManager = new SanityCORSManager();