/**
 * Setup Guidance System
 * 
 * Provides step-by-step setup instructions for each authentication failure,
 * with specific guidance for GA4, Firebase, and Search Console configuration.
 */

import { setupValidationService, ValidationIssue } from './SetupValidationService';
import { errorHandler } from './ErrorHandler';

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  action: string;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites?: string[];
  resources: {
    documentation?: string;
    video?: string;
    screenshots?: string[];
  };
  verification: {
    description: string;
    command?: string;
    expectedResult?: string;
  };
}

export interface SetupGuide {
  service: 'ga4' | 'firebase' | 'search-console';
  title: string;
  description: string;
  overview: string;
  totalSteps: number;
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: SetupStep[];
  troubleshooting: {
    commonIssues: Array<{
      issue: string;
      solution: string;
      resources?: string[];
    }>;
  };
}

export interface GuidanceRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  description: string;
  guide: string;
  step?: string;
  estimatedTime: string;
}

export class SetupGuidanceSystem {
  private readonly guides: Map<string, SetupGuide> = new Map();

  constructor() {
    this.initializeGuides();
  }

  /**
   * Initialize all setup guides
   */
  private initializeGuides(): void {
    this.guides.set('ga4', this.createGA4Guide());
    this.guides.set('firebase', this.createFirebaseGuide());
    this.guides.set('search-console', this.createSearchConsoleGuide());
  }

  /**
   * Get setup guidance based on validation issues
   */
  async getSetupGuidance(issues?: ValidationIssue[]): Promise<{
    recommendations: GuidanceRecommendation[];
    guides: SetupGuide[];
    nextActions: GuidanceRecommendation[];
  }> {
    try {
      // If no issues provided, get them from validation service
      if (!issues) {
        const validation = await setupValidationService.validateSetup();
        issues = validation.issues;
      }

      const recommendations = this.generateRecommendations(issues);
      const relevantGuides = this.getRelevantGuides(issues);
      const nextActions = this.prioritizeActions(recommendations);

      return {
        recommendations,
        guides: relevantGuides,
        nextActions: nextActions.slice(0, 5) // Top 5 actions
      };

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'setup-guidance',
        operation: 'get_setup_guidance',
        timestamp: new Date()
      });

      throw new Error(authError.userMessage);
    }
  }

  /**
   * Get specific setup guide
   */
  getGuide(service: 'ga4' | 'firebase' | 'search-console'): SetupGuide | null {
    return this.guides.get(service) || null;
  }

  /**
   * Get step-by-step instructions for specific issue
   */
  getInstructionsForIssue(issue: ValidationIssue): SetupStep[] {
    const guide = this.guides.get(issue.category);
    if (!guide) return [];

    // Find relevant steps based on the issue
    return guide.steps.filter(step => 
      step.title.toLowerCase().includes(issue.variable?.toLowerCase() || '') ||
      step.description.toLowerCase().includes(issue.variable?.toLowerCase() || '')
    );
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(issues: ValidationIssue[]): GuidanceRecommendation[] {
    const recommendations: GuidanceRecommendation[] = [];
    const serviceIssues = this.groupIssuesByService(issues);

    for (const [service, serviceIssueList] of serviceIssues.entries()) {
      const criticalIssues = serviceIssueList.filter(i => i.priority === 'critical');
      const highIssues = serviceIssueList.filter(i => i.priority === 'high');

      if (criticalIssues.length > 0) {
        recommendations.push({
          priority: 'critical',
          action: `Fix ${service.toUpperCase()} Critical Issues`,
          description: `${criticalIssues.length} critical configuration issue${criticalIssues.length > 1 ? 's' : ''} preventing ${service} from working`,
          guide: service,
          estimatedTime: this.calculateTotalTime(criticalIssues)
        });
      }

      if (highIssues.length > 0) {
        recommendations.push({
          priority: 'high',
          action: `Complete ${service.toUpperCase()} Setup`,
          description: `${highIssues.length} configuration issue${highIssues.length > 1 ? 's' : ''} affecting ${service} functionality`,
          guide: service,
          estimatedTime: this.calculateTotalTime(highIssues)
        });
      }
    }

    // Add general recommendations
    if (issues.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'Setup Monitoring',
        description: 'All services are configured. Consider setting up monitoring and alerts.',
        guide: 'monitoring',
        estimatedTime: '15 minutes'
      });
    }

    return recommendations;
  }

  /**
   * Get relevant guides based on issues
   */
  private getRelevantGuides(issues: ValidationIssue[]): SetupGuide[] {
    const relevantServices = new Set(issues.map(i => i.category));
    const guides: SetupGuide[] = [];

    for (const service of relevantServices) {
      const guide = this.guides.get(service);
      if (guide) {
        guides.push(guide);
      }
    }

    return guides;
  }

  /**
   * Prioritize actions based on severity and dependencies
   */
  private prioritizeActions(recommendations: GuidanceRecommendation[]): GuidanceRecommendation[] {
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    
    return recommendations.sort((a, b) => {
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      // Secondary sort by estimated time (shorter first)
      const aTime = this.parseTime(a.estimatedTime);
      const bTime = this.parseTime(b.estimatedTime);
      return aTime - bTime;
    });
  }

  /**
   * Group issues by service
   */
  private groupIssuesByService(issues: ValidationIssue[]): Map<string, ValidationIssue[]> {
    const grouped = new Map<string, ValidationIssue[]>();
    
    for (const issue of issues) {
      if (!grouped.has(issue.category)) {
        grouped.set(issue.category, []);
      }
      grouped.get(issue.category)!.push(issue);
    }
    
    return grouped;
  }

  /**
   * Calculate total estimated time for issues
   */
  private calculateTotalTime(issues: ValidationIssue[]): string {
    const totalMinutes = issues.reduce((total, issue) => {
      return total + this.parseTime(issue.estimatedTime);
    }, 0);

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Parse time string to minutes
   */
  private parseTime(timeStr: string): number {
    const match = timeStr.match(/(\\d+)\\s*(minutes?|mins?|hours?|hrs?|h|m)/i);
    if (!match) return 10; // Default 10 minutes

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('h')) {
      return value * 60;
    }
    return value;
  }

  /**
   * Create GA4 setup guide
   */
  private createGA4Guide(): SetupGuide {
    return {
      service: 'ga4',
      title: 'Google Analytics 4 Setup',
      description: 'Set up Google Analytics 4 for comprehensive web analytics and user behavior tracking',
      overview: 'Google Analytics 4 provides detailed insights into user behavior, traffic sources, and conversion tracking. This guide will help you configure GA4 with proper service account authentication.',
      totalSteps: 6,
      estimatedTime: '30-45 minutes',
      difficulty: 'medium',
      steps: [
        {
          id: 'ga4-create-property',
          title: 'Create GA4 Property',
          description: 'Create a new Google Analytics 4 property for your website',
          action: 'Set up GA4 property in Google Analytics dashboard',
          estimatedTime: '10 minutes',
          difficulty: 'easy',
          resources: {
            documentation: 'https://support.google.com/analytics/answer/9304153',
            video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          verification: {
            description: 'Verify you can see your property in Google Analytics dashboard',
            expectedResult: 'Property appears in analytics.google.com with a numeric Property ID'
          }
        },
        {
          id: 'ga4-get-property-id',
          title: 'Get Property ID',
          description: 'Find and copy your GA4 Property ID from the admin settings',
          action: 'Navigate to Admin > Property Settings and copy the Property ID',
          estimatedTime: '3 minutes',
          difficulty: 'easy',
          prerequisites: ['ga4-create-property'],
          resources: {
            documentation: 'https://support.google.com/analytics/answer/9539598'
          },
          verification: {
            description: 'Property ID should be a 9+ digit number',
            expectedResult: 'Numeric ID like 123456789'
          }
        },
        {
          id: 'ga4-create-service-account',
          title: 'Create Service Account',
          description: 'Create a service account in Google Cloud Console for API access',
          action: 'Create service account with Analytics API permissions',
          estimatedTime: '15 minutes',
          difficulty: 'medium',
          resources: {
            documentation: 'https://cloud.google.com/iam/docs/creating-managing-service-accounts'
          },
          verification: {
            description: 'Service account should be created with proper permissions',
            expectedResult: 'Service account email ending with @project-id.iam.gserviceaccount.com'
          }
        },
        {
          id: 'ga4-generate-key',
          title: 'Generate Service Account Key',
          description: 'Generate and download JSON key for the service account',
          action: 'Generate new JSON key for service account',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          prerequisites: ['ga4-create-service-account'],
          resources: {
            documentation: 'https://cloud.google.com/iam/docs/creating-managing-service-account-keys'
          },
          verification: {
            description: 'JSON key file should contain type, private_key, and client_email fields',
            expectedResult: 'Valid JSON with service account credentials'
          }
        },
        {
          id: 'ga4-add-permissions',
          title: 'Add Analytics Permissions',
          description: 'Add service account to GA4 property with Viewer permissions',
          action: 'Add service account email to GA4 property users',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          prerequisites: ['ga4-create-service-account'],
          resources: {
            documentation: 'https://support.google.com/analytics/answer/1009702'
          },
          verification: {
            description: 'Service account should appear in property access management',
            expectedResult: 'Service account listed with Viewer role'
          }
        },
        {
          id: 'ga4-set-environment',
          title: 'Set Environment Variables',
          description: 'Configure environment variables with GA4 credentials',
          action: 'Set GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_KEY variables',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          prerequisites: ['ga4-get-property-id', 'ga4-generate-key'],
          verification: {
            description: 'Environment variables should be set correctly',
            command: 'echo $GA4_PROPERTY_ID',
            expectedResult: 'Your GA4 property ID should be displayed'
          }
        }
      ],
      troubleshooting: {
        commonIssues: [
          {
            issue: 'Property ID not found or invalid',
            solution: 'Ensure you\'re copying the Property ID (not Measurement ID) from Admin > Property Settings',
            resources: ['https://support.google.com/analytics/answer/9539598']
          },
          {
            issue: 'Service account authentication fails',
            solution: 'Verify service account has Analytics API enabled and proper permissions in GA4 property',
            resources: ['https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries']
          },
          {
            issue: 'JSON key format errors',
            solution: 'Ensure the entire JSON key content is properly escaped when setting as environment variable',
            resources: ['https://cloud.google.com/iam/docs/creating-managing-service-account-keys']
          }
        ]
      }
    };
  }

  /**
   * Create Firebase setup guide
   */
  private createFirebaseGuide(): SetupGuide {
    return {
      service: 'firebase',
      title: 'Firebase Analytics Setup',
      description: 'Set up Firebase for analytics data storage and additional insights',
      overview: 'Firebase provides real-time database capabilities and additional analytics features. This guide will help you configure Firebase Admin SDK for server-side operations.',
      totalSteps: 4,
      estimatedTime: '20-30 minutes',
      difficulty: 'medium',
      steps: [
        {
          id: 'firebase-create-project',
          title: 'Create Firebase Project',
          description: 'Create a new Firebase project or use existing one',
          action: 'Set up Firebase project in Firebase Console',
          estimatedTime: '10 minutes',
          difficulty: 'easy',
          resources: {
            documentation: 'https://firebase.google.com/docs/projects/learn-more',
            video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          verification: {
            description: 'Project should appear in Firebase Console',
            expectedResult: 'Firebase project visible at console.firebase.google.com'
          }
        },
        {
          id: 'firebase-enable-services',
          title: 'Enable Required Services',
          description: 'Enable Firestore and Analytics in your Firebase project',
          action: 'Enable Firestore Database and Google Analytics',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          prerequisites: ['firebase-create-project'],
          resources: {
            documentation: 'https://firebase.google.com/docs/firestore/quickstart'
          },
          verification: {
            description: 'Firestore and Analytics should be enabled in project settings',
            expectedResult: 'Services appear as enabled in Firebase Console'
          }
        },
        {
          id: 'firebase-service-account',
          title: 'Configure Service Account',
          description: 'Set up service account for Firebase Admin SDK',
          action: 'Generate service account key for Firebase Admin',
          estimatedTime: '10 minutes',
          difficulty: 'medium',
          prerequisites: ['firebase-create-project'],
          resources: {
            documentation: 'https://firebase.google.com/docs/admin/setup'
          },
          verification: {
            description: 'Service account key should be generated',
            expectedResult: 'JSON key file with Firebase Admin credentials'
          }
        },
        {
          id: 'firebase-environment',
          title: 'Set Environment Variables',
          description: 'Configure environment variables for Firebase Admin SDK',
          action: 'Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_CLOUD_PROJECT_ID',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          prerequisites: ['firebase-service-account'],
          verification: {
            description: 'Environment variables should be set correctly',
            command: 'echo $GOOGLE_CLOUD_PROJECT_ID',
            expectedResult: 'Your Firebase project ID should be displayed'
          }
        }
      ],
      troubleshooting: {
        commonIssues: [
          {
            issue: 'Permission denied errors',
            solution: 'Ensure service account has proper IAM roles: Firebase Admin SDK Administrator Service Agent',
            resources: ['https://firebase.google.com/docs/admin/setup#initialize_the_sdk']
          },
          {
            issue: 'Private key format issues',
            solution: 'Ensure private key includes proper PEM headers and newlines are escaped as \\\\n',
            resources: ['https://firebase.google.com/docs/admin/setup#add_firebase_to_your_app']
          },
          {
            issue: 'Project ID not found',
            solution: 'Use the Project ID (not Project Name) from Firebase project settings',
            resources: ['https://support.google.com/firebase/answer/7015592']
          }
        ]
      }
    };
  }

  /**
   * Create Search Console setup guide
   */
  private createSearchConsoleGuide(): SetupGuide {
    return {
      service: 'search-console',
      title: 'Google Search Console Setup',
      description: 'Set up Google Search Console for SEO insights and search performance data',
      overview: 'Google Search Console provides valuable insights into how your site appears in Google search results. This guide will help you verify your site and configure API access.',
      totalSteps: 5,
      estimatedTime: '25-35 minutes',
      difficulty: 'medium',
      steps: [
        {
          id: 'search-console-verify-site',
          title: 'Verify Website',
          description: 'Add and verify your website in Google Search Console',
          action: 'Verify site ownership using recommended method',
          estimatedTime: '15 minutes',
          difficulty: 'medium',
          resources: {
            documentation: 'https://support.google.com/webmasters/answer/9008080',
            video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          },
          verification: {
            description: 'Site should show as verified in Search Console',
            expectedResult: 'Green checkmark next to your site URL'
          }
        },
        {
          id: 'search-console-enable-api',
          title: 'Enable Search Console API',
          description: 'Enable Google Search Console API in Google Cloud Console',
          action: 'Enable Search Console API for your project',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          resources: {
            documentation: 'https://developers.google.com/webmaster-tools/search-console-api-original/v3/quickstart'
          },
          verification: {
            description: 'API should be enabled in Google Cloud Console',
            expectedResult: 'Search Console API appears in enabled APIs list'
          }
        },
        {
          id: 'search-console-service-account',
          title: 'Add Service Account',
          description: 'Add your service account to Search Console with permissions',
          action: 'Add service account email as user in Search Console',
          estimatedTime: '5 minutes',
          difficulty: 'easy',
          prerequisites: ['search-console-verify-site'],
          resources: {
            documentation: 'https://support.google.com/webmasters/answer/7687615'
          },
          verification: {
            description: 'Service account should appear in Search Console users',
            expectedResult: 'Service account email listed with Full permissions'
          }
        },
        {
          id: 'search-console-test-access',
          title: 'Test API Access',
          description: 'Verify service account can access Search Console data',
          action: 'Test API access with sample query',
          estimatedTime: '5 minutes',
          difficulty: 'medium',
          prerequisites: ['search-console-service-account'],
          verification: {
            description: 'API should return search data without errors',
            expectedResult: 'Successful API response with search analytics data'
          }
        },
        {
          id: 'search-console-environment',
          title: 'Set Environment Variable',
          description: 'Configure site URL environment variable',
          action: 'Set GOOGLE_SEARCH_CONSOLE_SITE_URL variable',
          estimatedTime: '3 minutes',
          difficulty: 'easy',
          prerequisites: ['search-console-verify-site'],
          verification: {
            description: 'Environment variable should match verified site URL',
            command: 'echo $GOOGLE_SEARCH_CONSOLE_SITE_URL',
            expectedResult: 'Your verified site URL (e.g., https://example.com)'
          }
        }
      ],
      troubleshooting: {
        commonIssues: [
          {
            issue: 'Site verification fails',
            solution: 'Try alternative verification methods like HTML file upload or DNS record',
            resources: ['https://support.google.com/webmasters/answer/9008080']
          },
          {
            issue: 'Service account permission denied',
            solution: 'Ensure service account is added as Full user (not just Restricted) in Search Console',
            resources: ['https://support.google.com/webmasters/answer/7687615']
          },
          {
            issue: 'API quota exceeded',
            solution: 'Check API quotas in Google Cloud Console and request increase if needed',
            resources: ['https://developers.google.com/webmaster-tools/search-console-api-original/v3/limits']
          }
        ]
      }
    };
  }

  /**
   * Get interactive troubleshooting for specific error
   */
  getTroubleshootingSteps(error: string, service?: string): Array<{
    step: string;
    action: string;
    verification: string;
  }> {
    const troubleshootingSteps: Array<{
      step: string;
      action: string;
      verification: string;
    }> = [];

    // Common authentication errors
    if (error.includes('authentication') || error.includes('credentials')) {
      troubleshootingSteps.push(
        {
          step: 'Verify credentials format',
          action: 'Check that all credential environment variables are properly formatted',
          verification: 'No JSON parsing errors or format warnings'
        },
        {
          step: 'Test service account permissions',
          action: 'Verify service account has required permissions for the service',
          verification: 'Service account appears in service user management'
        },
        {
          step: 'Check API enablement',
          action: 'Ensure required APIs are enabled in Google Cloud Console',
          verification: 'APIs appear in enabled services list'
        }
      );
    }

    // Permission errors
    if (error.includes('permission') || error.includes('access denied')) {
      troubleshootingSteps.push(
        {
          step: 'Review service permissions',
          action: 'Check that service account has appropriate roles and permissions',
          verification: 'Service account has required IAM roles'
        },
        {
          step: 'Verify resource access',
          action: 'Ensure service account is added to the specific resource (GA4 property, Search Console site)',
          verification: 'Service account appears in resource user list'
        }
      );
    }

    // Network/connectivity errors
    if (error.includes('network') || error.includes('connection') || error.includes('timeout')) {
      troubleshootingSteps.push(
        {
          step: 'Check network connectivity',
          action: 'Verify internet connection and firewall settings',
          verification: 'Can access Google APIs from your environment'
        },
        {
          step: 'Test API endpoints',
          action: 'Try accessing API endpoints directly to isolate the issue',
          verification: 'API endpoints respond without network errors'
        }
      );
    }

    return troubleshootingSteps;
  }
}

// Export singleton instance
export const setupGuidanceSystem = new SetupGuidanceSystem();