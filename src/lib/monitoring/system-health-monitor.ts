import { enhancedClient } from '../sanity/client';
import { SanityDiagnosticService } from '../diagnostics/sanity-diagnostic-service';

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  details?: any;
  timestamp: Date;
  responseTime?: number;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  components: HealthCheckResult[];
  summary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    total: number;
  };
  recommendations: string[];
  timestamp: Date;
}

export class SystemHealthMonitor {
  private diagnosticService: SanityDiagnosticService;
  private healthHistory: SystemHealthReport[] = [];
  private maxHistorySize = 100;
  private alertThresholds = {
    responseTime: 5000, // 5 seconds
    consecutiveFailures: 3,
    degradedComponents: 2
  };

  constructor() {
    this.diagnosticService = new SanityDiagnosticService();
  }

  /**
   * Performs a comprehensive health check of all system components
   */
  async performHealthCheck(): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const components: HealthCheckResult[] = [];

    // 1. Check Sanity Connection
    const sanityHealth = await this.checkSanityHealth();
    components.push(sanityHealth);

    // 2. Check Blog API Endpoints
    const apiHealth = await this.checkBlogAPIHealth();
    components.push(apiHealth);

    // 3. Check Database Connectivity
    const dbHealth = await this.checkDatabaseHealth();
    components.push(dbHealth);

    // 4. Check Blog Post Retrieval
    const blogRetrievalHealth = await this.checkBlogRetrievalHealth();
    components.push(blogRetrievalHealth);

    // 5. Check Admin Interface Accessibility
    const adminHealth = await this.checkAdminInterfaceHealth();
    components.push(adminHealth);

    // Calculate overall health status
    const healthyCounts = {
      healthy: components.filter(c => c.status === 'healthy').length,
      degraded: components.filter(c => c.status === 'degraded').length,
      unhealthy: components.filter(c => c.status === 'unhealthy').length,
      total: components.length
    };

    let overall: 'healthy' | 'degraded' | 'critical';
    if (healthyCounts.unhealthy > 0) {
      overall = 'critical';
    } else if (healthyCounts.degraded >= this.alertThresholds.degradedComponents) {
      overall = 'critical';
    } else if (healthyCounts.degraded > 0) {
      overall = 'degraded';
    } else {
      overall = 'healthy';
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(components, overall);

    const report: SystemHealthReport = {
      overall,
      components,
      summary: healthyCounts,
      recommendations,
      timestamp: new Date()
    };

    // Store in history
    this.addToHistory(report);

    return report;
  }

  /**
   * Checks Sanity CMS health
   */
  private async checkSanityHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const diagnosticReport = await this.diagnosticService.generateDiagnosticReport();
      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (diagnosticReport.overall === 'healthy') {
        status = 'healthy';
        message = 'Sanity CMS is fully operational';
      } else if (diagnosticReport.overall === 'degraded') {
        status = 'degraded';
        message = 'Sanity CMS has some issues but is functional';
      } else {
        status = 'unhealthy';
        message = 'Sanity CMS has critical issues';
      }

      return {
        component: 'Sanity CMS',
        status,
        message,
        details: {
          connection: diagnosticReport.connection.status,
          readPermissions: diagnosticReport.readPermissions.status,
          writePermissions: diagnosticReport.writePermissions.status,
          dataIntegrity: diagnosticReport.dataIntegrity.status,
          recommendations: diagnosticReport.recommendations
        },
        timestamp: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        component: 'Sanity CMS',
        status: 'unhealthy',
        message: `Sanity health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Checks Blog API endpoints health
   */
  private async checkBlogAPIHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Check if API routes exist and are accessible
      const fs = await import('fs');
      const path = await import('path');
      
      const apiRoutes = [
        'app/api/blogs/enhanced/route.ts',
        'app/api/blog/posts/route.ts',
        'app/api/blog/health/route.ts'
      ];

      const existingRoutes = [];
      const missingRoutes = [];

      for (const route of apiRoutes) {
        const routePath = path.default.join(process.cwd(), route);
        if (fs.default.existsSync(routePath)) {
          existingRoutes.push(route);
        } else {
          missingRoutes.push(route);
        }
      }

      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (missingRoutes.length === 0) {
        status = 'healthy';
        message = 'All blog API endpoints are available';
      } else if (existingRoutes.length > missingRoutes.length) {
        status = 'degraded';
        message = `Some API endpoints are missing: ${missingRoutes.join(', ')}`;
      } else {
        status = 'unhealthy';
        message = 'Most API endpoints are missing';
      }

      return {
        component: 'Blog API',
        status,
        message,
        details: {
          existingRoutes,
          missingRoutes,
          totalRoutes: apiRoutes.length
        },
        timestamp: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        component: 'Blog API',
        status: 'unhealthy',
        message: `API health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Checks database connectivity and performance
   */
  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test basic database query performance
      const testQuery = '*[_type == "post"][0...5] { _id, title, publishedAt }';
      const posts = await enhancedClient.fetch(testQuery, {}, { 
        cache: 'no-store',
        validateConnection: false 
      });

      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (responseTime < 1000) {
        status = 'healthy';
        message = `Database query performance is excellent (${responseTime}ms)`;
      } else if (responseTime < this.alertThresholds.responseTime) {
        status = 'degraded';
        message = `Database query performance is acceptable (${responseTime}ms)`;
      } else {
        status = 'unhealthy';
        message = `Database query performance is poor (${responseTime}ms)`;
      }

      return {
        component: 'Database',
        status,
        message,
        details: {
          queryTime: responseTime,
          postsRetrieved: posts.length,
          threshold: this.alertThresholds.responseTime
        },
        timestamp: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        component: 'Database',
        status: 'unhealthy',
        message: `Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Checks blog post retrieval functionality
   */
  private async checkBlogRetrievalHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test blog listing query
      const listingQuery = `
        *[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
          _id,
          title,
          slug,
          publishedAt,
          excerpt
        }[0...10]
      `;
      
      const posts = await enhancedClient.fetch(listingQuery, {}, { 
        cache: 'no-store',
        validateConnection: false 
      });

      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (posts.length > 0 && responseTime < 2000) {
        status = 'healthy';
        message = `Blog retrieval is working well (${posts.length} posts, ${responseTime}ms)`;
      } else if (posts.length > 0) {
        status = 'degraded';
        message = `Blog retrieval is slow but functional (${posts.length} posts, ${responseTime}ms)`;
      } else {
        status = 'unhealthy';
        message = 'No blog posts could be retrieved';
      }

      return {
        component: 'Blog Retrieval',
        status,
        message,
        details: {
          postsFound: posts.length,
          queryTime: responseTime,
          samplePosts: posts.slice(0, 3).map((p: any) => ({ id: p._id, title: p.title }))
        },
        timestamp: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        component: 'Blog Retrieval',
        status: 'unhealthy',
        message: `Blog retrieval health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Checks admin interface accessibility
   */
  private async checkAdminInterfaceHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const adminComponents = [
        'app/admin/page.tsx',
        'app/admin/new/page.tsx',
        'components/admin/ManualBlogEditor.tsx',
        'components/admin/ImageUploader.tsx'
      ];

      const existingComponents = [];
      const missingComponents = [];

      for (const component of adminComponents) {
        const componentPath = path.default.join(process.cwd(), component);
        if (fs.default.existsSync(componentPath)) {
          existingComponents.push(component);
        } else {
          missingComponents.push(component);
        }
      }

      const responseTime = Date.now() - startTime;

      let status: 'healthy' | 'degraded' | 'unhealthy';
      let message: string;

      if (missingComponents.length === 0) {
        status = 'healthy';
        message = 'All admin interface components are available';
      } else if (existingComponents.length > missingComponents.length) {
        status = 'degraded';
        message = `Some admin components are missing: ${missingComponents.join(', ')}`;
      } else {
        status = 'unhealthy';
        message = 'Most admin interface components are missing';
      }

      return {
        component: 'Admin Interface',
        status,
        message,
        details: {
          existingComponents,
          missingComponents,
          totalComponents: adminComponents.length
        },
        timestamp: new Date(),
        responseTime
      };
    } catch (error) {
      return {
        component: 'Admin Interface',
        status: 'unhealthy',
        message: `Admin interface health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Generates recommendations based on health check results
   */
  private generateRecommendations(components: HealthCheckResult[], overall: string): string[] {
    const recommendations: string[] = [];

    // Overall system recommendations
    if (overall === 'critical') {
      recommendations.push('🚨 System is in critical state - immediate attention required');
    } else if (overall === 'degraded') {
      recommendations.push('⚠️ System performance is degraded - consider maintenance');
    }

    // Component-specific recommendations
    components.forEach(component => {
      if (component.status === 'unhealthy') {
        recommendations.push(`🔧 Fix ${component.component}: ${component.message}`);
      } else if (component.status === 'degraded') {
        recommendations.push(`⚡ Optimize ${component.component}: ${component.message}`);
      }

      // Performance recommendations
      if (component.responseTime && component.responseTime > this.alertThresholds.responseTime) {
        recommendations.push(`🐌 ${component.component} response time is slow (${component.responseTime}ms) - consider optimization`);
      }
    });

    // General maintenance recommendations
    if (overall === 'healthy') {
      recommendations.push('✅ System is healthy - continue regular monitoring');
      recommendations.push('📊 Consider setting up automated health checks');
    }

    return recommendations;
  }

  /**
   * Adds a health report to history
   */
  private addToHistory(report: SystemHealthReport): void {
    this.healthHistory.push(report);
    
    // Keep only the most recent reports
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Gets health history
   */
  getHealthHistory(limit?: number): SystemHealthReport[] {
    const history = [...this.healthHistory].reverse(); // Most recent first
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Gets health trends over time
   */
  getHealthTrends(): {
    overallTrend: string;
    componentTrends: { [component: string]: string };
    averageResponseTimes: { [component: string]: number };
  } {
    if (this.healthHistory.length < 2) {
      return {
        overallTrend: 'insufficient-data',
        componentTrends: {},
        averageResponseTimes: {}
      };
    }

    const recent = this.healthHistory.slice(-10); // Last 10 reports
    const componentTrends: { [component: string]: string } = {};
    const averageResponseTimes: { [component: string]: number } = {};

    // Calculate component trends
    const componentNames = [...new Set(recent.flatMap(r => r.components.map(c => c.component)))];
    
    componentNames.forEach(componentName => {
      const componentHistory = recent
        .flatMap(r => r.components)
        .filter(c => c.component === componentName);
      
      if (componentHistory.length >= 2) {
        const first = componentHistory[0];
        const last = componentHistory[componentHistory.length - 1];
        
        if (last.status === 'healthy' && first.status !== 'healthy') {
          componentTrends[componentName] = 'improving';
        } else if (last.status !== 'healthy' && first.status === 'healthy') {
          componentTrends[componentName] = 'degrading';
        } else {
          componentTrends[componentName] = 'stable';
        }

        // Calculate average response time
        const responseTimes = componentHistory
          .filter(c => c.responseTime)
          .map(c => c.responseTime!);
        
        if (responseTimes.length > 0) {
          averageResponseTimes[componentName] = Math.round(
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
          );
        }
      }
    });

    // Calculate overall trend
    const overallStatuses = recent.map(r => r.overall);
    const firstOverall = overallStatuses[0];
    const lastOverall = overallStatuses[overallStatuses.length - 1];
    
    let overallTrend: string;
    if (lastOverall === 'healthy' && firstOverall !== 'healthy') {
      overallTrend = 'improving';
    } else if (lastOverall !== 'healthy' && firstOverall === 'healthy') {
      overallTrend = 'degrading';
    } else {
      overallTrend = 'stable';
    }

    return {
      overallTrend,
      componentTrends,
      averageResponseTimes
    };
  }

  /**
   * Checks if system needs immediate attention
   */
  needsImmediateAttention(): boolean {
    if (this.healthHistory.length === 0) return false;
    
    const latest = this.healthHistory[this.healthHistory.length - 1];
    return latest.overall === 'critical';
  }

  /**
   * Gets system uptime percentage
   */
  getUptimePercentage(hours: number = 24): number {
    if (this.healthHistory.length === 0) return 0;
    
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentReports = this.healthHistory.filter(r => r.timestamp >= cutoffTime);
    
    if (recentReports.length === 0) return 0;
    
    const healthyReports = recentReports.filter(r => r.overall === 'healthy').length;
    return Math.round((healthyReports / recentReports.length) * 100);
  }
}
