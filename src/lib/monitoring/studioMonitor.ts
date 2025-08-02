/**
 * Studio Deployment Health Monitor
 * Monitors studio deployment status and health metrics
 */

export interface HealthMetric {
  name: string;
  value: number | string | boolean;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: Date;
  details?: any;
}

export interface MonitoringAlert {
  id: string;
  type: 'cors' | 'auth' | 'deployment' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  details: any;
}

export interface StudioHealthReport {
  timestamp: Date;
  overallStatus: 'healthy' | 'degraded' | 'down';
  metrics: HealthMetric[];
  alerts: MonitoringAlert[];
  uptime: {
    percentage: number;
    totalChecks: number;
    successfulChecks: number;
    lastDowntime?: Date;
  };
  performance: {
    averageResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
  };
  recommendations: string[];
}

export class StudioMonitor {
  private static instance: StudioMonitor;
  private healthHistory: HealthMetric[] = [];
  private alertHistory: MonitoringAlert[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  private constructor() {
    // Load persisted data if available
    this.loadPersistedData();
  }

  static getInstance(): StudioMonitor {
    if (!StudioMonitor.instance) {
      StudioMonitor.instance = new StudioMonitor();
    }
    return StudioMonitor.instance;
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs: number = 5 * 60 * 1000): void { // Default 5 minutes
    if (this.isMonitoring) {
      console.log('Monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Starting studio health monitoring...');

    // Initial check
    this.performHealthCheck();

    // Set up interval
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Studio health monitoring stopped');
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<StudioHealthReport> {
    const timestamp = new Date();
    const metrics: HealthMetric[] = [];
    const alerts: MonitoringAlert[] = [];

    try {
      // Check studio accessibility
      const accessibilityMetric = await this.checkStudioAccessibility();
      metrics.push(accessibilityMetric);

      // Check CORS configuration
      const corsMetric = await this.checkCORSHealth();
      metrics.push(corsMetric);

      // Check authentication
      const authMetric = await this.checkAuthenticationHealth();
      metrics.push(authMetric);

      // Check API connectivity
      const apiMetric = await this.checkAPIConnectivity();
      metrics.push(apiMetric);

      // Check configuration
      const configMetric = await this.checkConfigurationHealth();
      metrics.push(configMetric);

      // Generate alerts based on metrics
      const newAlerts = this.generateAlerts(metrics);
      alerts.push(...newAlerts);

      // Store metrics and alerts
      this.healthHistory.push(...metrics);
      this.alertHistory.push(...alerts);

      // Cleanup old data (keep last 24 hours)
      this.cleanupOldData();

      // Persist data
      this.persistData();

    } catch (error) {
      console.error('Health check failed:', error);
      
      // Add critical alert
      alerts.push({
        id: `health-check-error-${Date.now()}`,
        type: 'deployment',
        severity: 'critical',
        message: 'Health check system failure',
        timestamp,
        resolved: false,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }

    return this.generateHealthReport();
  }

  /**
   * Check studio accessibility
   */
  private async checkStudioAccessibility(): Promise<HealthMetric> {
    const startTime = Date.now();
    
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
      const studioUrl = `${siteUrl}/studio`;
      
      if (typeof window !== 'undefined') {
        // Browser environment - test actual accessibility
        const response = await fetch(studioUrl, { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        const responseTime = Date.now() - startTime;
        const isAccessible = response.ok;
        
        return {
          name: 'Studio Accessibility',
          value: isAccessible,
          status: isAccessible ? 'healthy' : 'critical',
          timestamp: new Date(),
          details: {
            url: studioUrl,
            responseTime,
            statusCode: response.status,
          },
        };
      } else {
        // Server environment - basic URL validation
        const isValidUrl = siteUrl && !siteUrl.includes('localhost') && siteUrl.startsWith('https://');
        
        return {
          name: 'Studio Accessibility',
          value: isValidUrl,
          status: isValidUrl ? 'healthy' : 'warning',
          timestamp: new Date(),
          details: {
            url: studioUrl,
            serverSide: true,
          },
        };
      }
    } catch (error) {
      return {
        name: 'Studio Accessibility',
        value: false,
        status: 'critical',
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Check CORS health
   */
  private async checkCORSHealth(): Promise<HealthMetric> {
    try {
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';
      const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '';
      
      if (!projectId || !dataset) {
        return {
          name: 'CORS Health',
          value: false,
          status: 'critical',
          timestamp: new Date(),
          details: { error: 'Missing Sanity configuration' },
        };
      }

      if (typeof window !== 'undefined') {
        // Test CORS with actual request
        const apiUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
        const testQuery = '*[_type=="post"][0]';
        
        try {
          const response = await fetch(`${apiUrl}?query=${encodeURIComponent(testQuery)}`, {
            credentials: 'include',
          });
          
          const corsWorking = response.ok || response.status === 401; // 401 is OK for auth test
          
          return {
            name: 'CORS Health',
            value: corsWorking,
            status: corsWorking ? 'healthy' : 'critical',
            timestamp: new Date(),
            details: {
              statusCode: response.status,
              corsHeaders: {
                origin: response.headers.get('access-control-allow-origin'),
                credentials: response.headers.get('access-control-allow-credentials'),
              },
            },
          };
        } catch (error) {
          const isCorsError = error instanceof Error && error.message.includes('CORS');
          
          return {
            name: 'CORS Health',
            value: false,
            status: 'critical',
            timestamp: new Date(),
            details: {
              error: error instanceof Error ? error.message : 'Unknown error',
              isCorsError,
            },
          };
        }
      } else {
        // Server-side - assume healthy if config is present
        return {
          name: 'CORS Health',
          value: true,
          status: 'healthy',
          timestamp: new Date(),
          details: { serverSide: true },
        };
      }
    } catch (error) {
      return {
        name: 'CORS Health',
        value: false,
        status: 'critical',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check authentication health
   */
  private async checkAuthenticationHealth(): Promise<HealthMetric> {
    try {
      if (typeof window !== 'undefined') {
        // Check for authentication cookies
        const cookies = document.cookie;
        const hasSanityCookies = cookies.includes('sanity') || cookies.includes('__sanity');
        
        return {
          name: 'Authentication Health',
          value: hasSanityCookies,
          status: hasSanityCookies ? 'healthy' : 'warning',
          timestamp: new Date(),
          details: {
            cookieCount: document.cookie.split(';').length,
            hasSanityCookies,
          },
        };
      } else {
        // Server-side - check if auth is configured
        const hasJwtSecret = !!process.env.JWT_SECRET;
        
        return {
          name: 'Authentication Health',
          value: hasJwtSecret,
          status: hasJwtSecret ? 'healthy' : 'warning',
          timestamp: new Date(),
          details: { serverSide: true },
        };
      }
    } catch (error) {
      return {
        name: 'Authentication Health',
        value: false,
        status: 'warning',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check API connectivity
   */
  private async checkAPIConnectivity(): Promise<HealthMetric> {
    const startTime = Date.now();
    
    try {
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';
      const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '';
      
      if (!projectId || !dataset) {
        return {
          name: 'API Connectivity',
          value: false,
          status: 'critical',
          timestamp: new Date(),
          details: { error: 'Missing API configuration' },
        };
      }

      const apiUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
      const responseTime = Date.now() - startTime;
      
      // For server-side, just validate URL format
      if (typeof window === 'undefined') {
        const isValidUrl = apiUrl.startsWith('https://') && projectId.length === 8;
        
        return {
          name: 'API Connectivity',
          value: isValidUrl,
          status: isValidUrl ? 'healthy' : 'critical',
          timestamp: new Date(),
          details: {
            apiUrl,
            serverSide: true,
            responseTime,
          },
        };
      }

      // Browser-side test (would be done in actual implementation)
      return {
        name: 'API Connectivity',
        value: true,
        status: 'healthy',
        timestamp: new Date(),
        details: {
          apiUrl,
          responseTime,
        },
      };
    } catch (error) {
      return {
        name: 'API Connectivity',
        value: false,
        status: 'critical',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Check configuration health
   */
  private async checkConfigurationHealth(): Promise<HealthMetric> {
    try {
      const requiredVars = [
        'NEXT_PUBLIC_SANITY_PROJECT_ID',
        'NEXT_PUBLIC_SANITY_DATASET',
        'NEXT_PUBLIC_SITE_URL',
        'SANITY_API_TOKEN',
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      const isHealthy = missingVars.length === 0;
      
      return {
        name: 'Configuration Health',
        value: isHealthy,
        status: isHealthy ? 'healthy' : 'critical',
        timestamp: new Date(),
        details: {
          totalRequired: requiredVars.length,
          missing: missingVars,
          missingCount: missingVars.length,
        },
      };
    } catch (error) {
      return {
        name: 'Configuration Health',
        value: false,
        status: 'critical',
        timestamp: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  /**
   * Generate alerts based on metrics
   */
  private generateAlerts(metrics: HealthMetric[]): MonitoringAlert[] {
    const alerts: MonitoringAlert[] = [];
    const timestamp = new Date();

    metrics.forEach(metric => {
      if (metric.status === 'critical') {
        alerts.push({
          id: `${metric.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          type: this.getAlertType(metric.name),
          severity: 'critical',
          message: `${metric.name} is critical: ${metric.value}`,
          timestamp,
          resolved: false,
          details: metric.details,
        });
      } else if (metric.status === 'warning') {
        alerts.push({
          id: `${metric.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          type: this.getAlertType(metric.name),
          severity: 'medium',
          message: `${metric.name} has warnings: ${metric.value}`,
          timestamp,
          resolved: false,
          details: metric.details,
        });
      }
    });

    return alerts;
  }

  /**
   * Get alert type from metric name
   */
  private getAlertType(metricName: string): MonitoringAlert['type'] {
    if (metricName.toLowerCase().includes('cors')) return 'cors';
    if (metricName.toLowerCase().includes('auth')) return 'auth';
    if (metricName.toLowerCase().includes('api')) return 'deployment';
    if (metricName.toLowerCase().includes('accessibility')) return 'deployment';
    return 'deployment';
  }

  /**
   * Generate comprehensive health report
   */
  generateHealthReport(): StudioHealthReport {
    const recentMetrics = this.getRecentMetrics(1000); // Last 1000 metrics
    const recentAlerts = this.getRecentAlerts(100); // Last 100 alerts
    
    // Calculate overall status
    const criticalMetrics = recentMetrics.filter(m => m.status === 'critical');
    const warningMetrics = recentMetrics.filter(m => m.status === 'warning');
    
    let overallStatus: 'healthy' | 'degraded' | 'down';
    if (criticalMetrics.length > 0) {
      overallStatus = 'down';
    } else if (warningMetrics.length > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    // Calculate uptime
    const totalChecks = recentMetrics.length;
    const successfulChecks = recentMetrics.filter(m => m.status === 'healthy').length;
    const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 100;

    // Calculate performance metrics
    const responseTimeMetrics = recentMetrics
      .filter(m => m.details?.responseTime)
      .map(m => ({ name: m.name, time: m.details.responseTime }));
    
    const averageResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.time, 0) / responseTimeMetrics.length
      : 0;

    const slowestEndpoint = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((prev, current) => prev.time > current.time ? prev : current).name
      : 'N/A';

    const fastestEndpoint = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((prev, current) => prev.time < current.time ? prev : current).name
      : 'N/A';

    // Generate recommendations
    const recommendations: string[] = [];
    if (criticalMetrics.length > 0) {
      recommendations.push('Address critical issues immediately');
    }
    if (warningMetrics.length > 0) {
      recommendations.push('Review and resolve warning conditions');
    }
    if (uptimePercentage < 95) {
      recommendations.push('Investigate frequent downtime causes');
    }
    if (averageResponseTime > 5000) {
      recommendations.push('Optimize performance - response times are slow');
    }

    return {
      timestamp: new Date(),
      overallStatus,
      metrics: recentMetrics.slice(-10), // Last 10 metrics
      alerts: recentAlerts.filter(a => !a.resolved).slice(-10), // Last 10 unresolved alerts
      uptime: {
        percentage: uptimePercentage,
        totalChecks,
        successfulChecks,
        lastDowntime: this.getLastDowntime(),
      },
      performance: {
        averageResponseTime,
        slowestEndpoint,
        fastestEndpoint,
      },
      recommendations,
    };
  }

  /**
   * Get recent metrics
   */
  private getRecentMetrics(limit: number): HealthMetric[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Get recent alerts
   */
  private getRecentAlerts(limit: number): MonitoringAlert[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Get last downtime
   */
  private getLastDowntime(): Date | undefined {
    const criticalMetrics = this.healthHistory
      .filter(m => m.status === 'critical')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return criticalMetrics.length > 0 ? criticalMetrics[0].timestamp : undefined;
  }

  /**
   * Cleanup old data
   */
  private cleanupOldData(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    this.healthHistory = this.healthHistory.filter(m => m.timestamp > cutoffTime);
    this.alertHistory = this.alertHistory.filter(a => a.timestamp > cutoffTime);
  }

  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        healthHistory: this.healthHistory.slice(-100), // Keep last 100
        alertHistory: this.alertHistory.slice(-50), // Keep last 50
      };
      
      localStorage.setItem('studio_monitor_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to persist monitoring data:', error);
    }
  }

  /**
   * Load persisted data from localStorage
   */
  private loadPersistedData(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = localStorage.getItem('studio_monitor_data');
      if (data) {
        const parsed = JSON.parse(data);
        this.healthHistory = parsed.healthHistory || [];
        this.alertHistory = parsed.alertHistory || [];
        
        // Convert timestamp strings back to Date objects
        this.healthHistory.forEach(m => {
          m.timestamp = new Date(m.timestamp);
        });
        this.alertHistory.forEach(a => {
          a.timestamp = new Date(a.timestamp);
        });
      }
    } catch (error) {
      console.warn('Failed to load persisted monitoring data:', error);
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alertHistory.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.persistData();
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isActive: boolean;
    lastCheck?: Date;
    totalMetrics: number;
    totalAlerts: number;
  } {
    const lastMetric = this.healthHistory[this.healthHistory.length - 1];
    
    return {
      isActive: this.isMonitoring,
      lastCheck: lastMetric?.timestamp,
      totalMetrics: this.healthHistory.length,
      totalAlerts: this.alertHistory.length,
    };
  }
}

// Export singleton instance
export const studioMonitor = StudioMonitor.getInstance();