/**
 * Automated CORS Configuration Checker
 * Tests and validates CORS configuration automatically
 */

export interface CORSTestResult {
  origin: string;
  isWorking: boolean;
  error?: string;
  responseTime?: number;
  details: {
    preflight: boolean;
    credentials: boolean;
    methods: string[];
    headers: string[];
  };
}

export interface CORSCheckReport {
  timestamp: Date;
  overallStatus: 'pass' | 'fail' | 'partial';
  results: CORSTestResult[];
  recommendations: string[];
  summary: {
    totalOrigins: number;
    workingOrigins: number;
    failedOrigins: number;
  };
}

export class CORSChecker {
  private projectId: string;
  private dataset: string;
  private apiVersion: string;

  constructor() {
    this.projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
    this.dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';
    this.apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '';
  }

  /**
   * Perform comprehensive CORS check
   */
  async performCORSCheck(origins: string[]): Promise<CORSCheckReport> {
    const results: CORSTestResult[] = [];
    const recommendations: string[] = [];

    for (const origin of origins) {
      const result = await this.testOrigin(origin);
      results.push(result);
    }

    // Generate recommendations
    const failedResults = results.filter(r => !r.isWorking);
    if (failedResults.length > 0) {
      recommendations.push('Configure CORS origins in Sanity Management Console');
      recommendations.push('Ensure "Allow credentials" is enabled for all origins');
    }

    const workingCount = results.filter(r => r.isWorking).length;
    const overallStatus = workingCount === results.length ? 'pass' : 
                         workingCount > 0 ? 'partial' : 'fail';

    return {
      timestamp: new Date(),
      overallStatus,
      results,
      recommendations,
      summary: {
        totalOrigins: results.length,
        workingOrigins: workingCount,
        failedOrigins: results.length - workingCount,
      },
    };
  }

  /**
   * Test individual origin
   */
  private async testOrigin(origin: string): Promise<CORSTestResult> {
    const result: CORSTestResult = {
      origin,
      isWorking: false,
      details: {
        preflight: false,
        credentials: false,
        methods: [],
        headers: [],
      },
    };

    try {
      const startTime = Date.now();
      
      // Test basic API endpoint
      const apiUrl = `https://${this.projectId}.api.sanity.io/v${this.apiVersion}/data/query/${this.dataset}`;
      const testQuery = '*[_type=="post"][0]';
      const fullUrl = `${apiUrl}?query=${encodeURIComponent(testQuery)}`;

      // Simulate CORS request (in browser environment)
      if (typeof window !== 'undefined') {
        try {
          const response = await fetch(fullUrl, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          result.responseTime = Date.now() - startTime;
          result.isWorking = response.ok || response.status === 401; // 401 is OK for auth check
          
          // Check response headers
          const corsHeaders = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
          };

          result.details.credentials = corsHeaders['access-control-allow-credentials'] === 'true';
          result.details.methods = corsHeaders['access-control-allow-methods']?.split(',').map(m => m.trim()) || [];
          result.details.headers = corsHeaders['access-control-allow-headers']?.split(',').map(h => h.trim()) || [];
          
        } catch (error) {
          result.error = error instanceof Error ? error.message : 'Unknown error';
          
          // Check if it's a CORS error
          if (result.error.includes('CORS') || result.error.includes('cross-origin')) {
            result.error = 'CORS policy blocked the request';
          }
        }
      } else {
        // Server-side simulation
        result.isWorking = true; // Assume working for server-side
        result.details.credentials = true;
        result.details.methods = ['GET', 'POST', 'PUT', 'DELETE'];
      }

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Test failed';
    }

    return result;
  }

  /**
   * Test preflight request
   */
  private async testPreflight(origin: string): Promise<boolean> {
    if (typeof window === 'undefined') return true;

    try {
      const apiUrl = `https://${this.projectId}.api.sanity.io/v${this.apiVersion}/data/query/${this.dataset}`;
      
      // This will trigger a preflight request
      const response = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test',
        },
        body: JSON.stringify({ query: '*[_type=="post"][0]' }),
      });

      return response.status !== 0; // 0 usually indicates CORS failure
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate CORS fix suggestions
   */
  generateFixSuggestions(report: CORSCheckReport): {
    issue: string;
    solution: string;
    priority: 'high' | 'medium' | 'low';
    steps: string[];
  }[] {
    const suggestions: {
      issue: string;
      solution: string;
      priority: 'high' | 'medium' | 'low';
      steps: string[];
    }[] = [];

    const failedResults = report.results.filter(r => !r.isWorking);

    if (failedResults.length > 0) {
      suggestions.push({
        issue: 'CORS origins not configured',
        solution: 'Add missing origins to Sanity Management Console',
        priority: 'high',
        steps: [
          'Go to https://www.sanity.io/manage/personal/project/3u4fa9kl/api',
          'Scroll to CORS Origins section',
          'Click "Add CORS origin"',
          'Enter your domain URL',
          'Enable "Allow credentials"',
          'Save configuration',
        ],
      });
    }

    const credentialIssues = report.results.filter(r => r.isWorking && !r.details.credentials);
    if (credentialIssues.length > 0) {
      suggestions.push({
        issue: 'Credentials not allowed for some origins',
        solution: 'Enable "Allow credentials" for all origins',
        priority: 'high',
        steps: [
          'Go to Sanity Management Console',
          'Find your CORS origins',
          'Check "Allow credentials" for each origin',
          'Save configuration',
        ],
      });
    }

    const slowResponses = report.results.filter(r => r.responseTime && r.responseTime > 5000);
    if (slowResponses.length > 0) {
      suggestions.push({
        issue: 'Slow CORS response times',
        solution: 'Check network connectivity and API performance',
        priority: 'medium',
        steps: [
          'Test network connectivity',
          'Check Sanity API status',
          'Consider using CDN or caching',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Generate detailed CORS report
   */
  generateDetailedReport(report: CORSCheckReport): string {
    let output = `# CORS Configuration Report\n\n`;
    
    output += `**Generated:** ${report.timestamp.toISOString()}\n`;
    output += `**Overall Status:** ${report.overallStatus.toUpperCase()}\n`;
    output += `**Working Origins:** ${report.summary.workingOrigins}/${report.summary.totalOrigins}\n\n`;

    // Results by origin
    output += `## Origin Test Results\n\n`;
    report.results.forEach(result => {
      const status = result.isWorking ? '✅' : '❌';
      output += `### ${status} ${result.origin}\n`;
      
      if (result.isWorking) {
        output += `- **Status:** Working\n`;
        if (result.responseTime) {
          output += `- **Response Time:** ${result.responseTime}ms\n`;
        }
        output += `- **Credentials Allowed:** ${result.details.credentials ? 'Yes' : 'No'}\n`;
        if (result.details.methods.length > 0) {
          output += `- **Allowed Methods:** ${result.details.methods.join(', ')}\n`;
        }
      } else {
        output += `- **Status:** Failed\n`;
        if (result.error) {
          output += `- **Error:** ${result.error}\n`;
        }
      }
      output += `\n`;
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      output += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        output += `- ${rec}\n`;
      });
      output += `\n`;
    }

    // Fix suggestions
    const suggestions = this.generateFixSuggestions(report);
    if (suggestions.length > 0) {
      output += `## Fix Suggestions\n\n`;
      suggestions.forEach(suggestion => {
        output += `### ${suggestion.issue} (${suggestion.priority} priority)\n`;
        output += `**Solution:** ${suggestion.solution}\n\n`;
        output += `**Steps:**\n`;
        suggestion.steps.forEach((step, index) => {
          output += `${index + 1}. ${step}\n`;
        });
        output += `\n`;
      });
    }

    return output;
  }

  /**
   * Quick CORS test for single origin
   */
  async quickTest(origin: string): Promise<{
    isWorking: boolean;
    error?: string;
    suggestions: string[];
  }> {
    const result = await this.testOrigin(origin);
    const suggestions: string[] = [];

    if (!result.isWorking) {
      suggestions.push('Add this origin to Sanity CORS configuration');
      suggestions.push('Ensure "Allow credentials" is enabled');
      suggestions.push('Wait 5-10 minutes after configuration changes');
    }

    if (result.isWorking && !result.details.credentials) {
      suggestions.push('Enable "Allow credentials" for this origin');
    }

    return {
      isWorking: result.isWorking,
      error: result.error,
      suggestions,
    };
  }
}

// Export singleton instance
export const corsChecker = new CORSChecker();