import { PreventiveMaintenanceSystem } from './preventive-maintenance';
import { SystemHealthMonitor } from './system-health-monitor';
import { AlertingSystem, getGlobalAlertingSystem } from './alerting-system';
import { CacheRefreshSystem, getGlobalCacheRefreshSystem } from './cache-refresh-system';

export interface AutomatedMonitoringConfig {
  healthCheckInterval: number; // minutes
  maintenanceEnabled: boolean;
  alertingEnabled: boolean;
  autoStart: boolean;
}

export class AutomatedMonitoringService {
  private maintenanceSystem: PreventiveMaintenanceSystem;
  private healthMonitor: SystemHealthMonitor;
  private alertingSystem: AlertingSystem;
  private cacheRefreshSystem: CacheRefreshSystem;
  private config: AutomatedMonitoringConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config?: Partial<AutomatedMonitoringConfig>) {
    this.maintenanceSystem = new PreventiveMaintenanceSystem();
    this.healthMonitor = new SystemHealthMonitor();
    this.alertingSystem = getGlobalAlertingSystem();
    this.cacheRefreshSystem = getGlobalCacheRefreshSystem();
    
    this.config = {
      healthCheckInterval: 15, // 15 minutes
      maintenanceEnabled: true,
      alertingEnabled: true,
      autoStart: true,
      ...config
    };

    // Auto-start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start automated monitoring
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Automated monitoring is already running');
      return;
    }

    console.log('🚀 Starting automated monitoring system...');
    this.isRunning = true;

    // Start preventive maintenance system
    if (this.config.maintenanceEnabled) {
      this.maintenanceSystem.start();
    }

    // Start cache refresh system
    this.cacheRefreshSystem.start();

    // Start periodic health checks
    this.startPeriodicHealthChecks();

    console.log('✅ Automated monitoring system started');
  }

  /**
   * Stop automated monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⏹️ Automated monitoring is not running');
      return;
    }

    console.log('⏹️ Stopping automated monitoring system...');
    this.isRunning = false;

    // Stop preventive maintenance system
    this.maintenanceSystem.stop();

    // Stop cache refresh system
    this.cacheRefreshSystem.stop();

    // Stop periodic health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }

    console.log('⏹️ Automated monitoring system stopped');
  }

  /**
   * Start periodic health checks
   */
  private startPeriodicHealthChecks(): void {
    const intervalMs = this.config.healthCheckInterval * 60 * 1000;
    
    // Run initial health check
    setTimeout(() => {
      this.performScheduledHealthCheck();
    }, 5000); // 5 seconds after start

    // Set up periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performScheduledHealthCheck();
    }, intervalMs);

    console.log(`📊 Periodic health checks scheduled every ${this.config.healthCheckInterval} minutes`);
  }

  /**
   * Perform scheduled health check
   */
  private async performScheduledHealthCheck(): Promise<void> {
    try {
      console.log('🔍 Performing scheduled health check...');
      
      const healthReport = await this.healthMonitor.performHealthCheck();
      
      // Log health status
      const statusEmoji = {
        healthy: '✅',
        degraded: '⚠️',
        critical: '🚨'
      };

      console.log(`${statusEmoji[healthReport.overall]} System health: ${healthReport.overall}`);
      
      if (healthReport.overall !== 'healthy') {
        console.log(`📊 Health summary: ${healthReport.summary.healthy} healthy, ${healthReport.summary.degraded} degraded, ${healthReport.summary.unhealthy} unhealthy`);
        
        if (healthReport.recommendations.length > 0) {
          console.log('💡 Recommendations:');
          healthReport.recommendations.forEach(rec => console.log(`   ${rec}`));
        }
      }

      // Evaluate and send alerts if needed
      if (this.config.alertingEnabled) {
        const maintenanceStatus = this.maintenanceSystem.getStatus();
        await this.alertingSystem.evaluateAlerts({
          health: healthReport,
          uptime: this.healthMonitor.getUptimePercentage(24),
          maintenanceResults: maintenanceStatus.recentResults,
          components: healthReport.components
        });
      }

      // Trigger conditional cache refresh if needed
      const averageResponseTime = healthReport.components
        .filter(c => c.responseTime)
        .reduce((sum, c, _, arr) => sum + (c.responseTime! / arr.length), 0);

      await this.cacheRefreshSystem.triggerConditionalRefresh({
        healthStatus: healthReport.overall,
        maintenanceFailure: this.maintenanceSystem.getStatus().recentResults.some(r => !r.success),
        averageResponseTime
      });

    } catch (error) {
      console.error('❌ Scheduled health check failed:', error);
      
      if (this.config.alertingEnabled) {
        await this.alertingSystem.evaluateAlerts({
          health: { overall: 'critical' },
          uptime: 0,
          maintenanceResults: [{ success: false, message: 'Health check failed' }],
          components: []
        });
      }
    }
  }

  /**
   * Send health alert
   */
  private async sendHealthAlert(healthReport: any): Promise<void> {
    const alertMessage = `🚨 CRITICAL SYSTEM HEALTH ALERT\n` +
                        `Status: ${healthReport.overall}\n` +
                        `Unhealthy components: ${healthReport.summary.unhealthy}\n` +
                        `Degraded components: ${healthReport.summary.degraded}\n` +
                        `Time: ${healthReport.timestamp}\n` +
                        `Recommendations:\n${healthReport.recommendations.join('\n')}`;

    console.error(alertMessage);
    
    // Here you could integrate with external alerting systems:
    // - Email notifications
    // - Slack/Discord webhooks  
    // - SMS alerts
    // - PagerDuty/Opsgenie
  }

  /**
   * Send error alert
   */
  private async sendErrorAlert(title: string, error: any): Promise<void> {
    const alertMessage = `🚨 MONITORING SYSTEM ERROR\n` +
                        `Title: ${title}\n` +
                        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
                        `Time: ${new Date().toISOString()}`;

    console.error(alertMessage);
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    const maintenanceStatus = this.maintenanceSystem.getStatus();
    const healthHistory = this.healthMonitor.getHealthHistory(5);
    const healthTrends = this.healthMonitor.getHealthTrends();
    const cacheStatus = this.cacheRefreshSystem.getStatus();

    return {
      isRunning: this.isRunning,
      config: this.config,
      maintenance: {
        isRunning: maintenanceStatus.isRunning,
        nextTask: maintenanceStatus.nextScheduledTask,
        recentResults: maintenanceStatus.recentResults.slice(-5)
      },
      health: {
        current: healthHistory[0] || null,
        history: healthHistory,
        trends: healthTrends,
        uptime: this.healthMonitor.getUptimePercentage(24),
        needsAttention: this.healthMonitor.needsImmediateAttention()
      },
      cache: {
        isRunning: cacheStatus.isRunning,
        statistics: cacheStatus.statistics,
        recentResults: cacheStatus.recentResults.slice(-5)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AutomatedMonitoringConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    // Restart health checks if interval changed
    if (oldConfig.healthCheckInterval !== this.config.healthCheckInterval && this.isRunning) {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      this.startPeriodicHealthChecks();
    }

    // Start/stop maintenance system if needed
    if (oldConfig.maintenanceEnabled !== this.config.maintenanceEnabled) {
      if (this.config.maintenanceEnabled && this.isRunning) {
        this.maintenanceSystem.start();
      } else {
        this.maintenanceSystem.stop();
      }
    }

    console.log('⚙️ Automated monitoring configuration updated');
  }

  /**
   * Force immediate health check
   */
  async forceHealthCheck() {
    return await this.performScheduledHealthCheck();
  }

  /**
   * Get maintenance system instance
   */
  getMaintenanceSystem(): PreventiveMaintenanceSystem {
    return this.maintenanceSystem;
  }

  /**
   * Get health monitor instance
   */
  getHealthMonitor(): SystemHealthMonitor {
    return this.healthMonitor;
  }
}

// Global instance for the application
let globalMonitoringService: AutomatedMonitoringService | null = null;

/**
 * Get or create the global monitoring service instance
 */
export function getGlobalMonitoringService(): AutomatedMonitoringService {
  if (!globalMonitoringService) {
    globalMonitoringService = new AutomatedMonitoringService();
  }
  return globalMonitoringService;
}

/**
 * Initialize monitoring on application startup
 */
export function initializeMonitoring(config?: Partial<AutomatedMonitoringConfig>): AutomatedMonitoringService {
  if (globalMonitoringService) {
    console.log('🔄 Monitoring service already initialized');
    return globalMonitoringService;
  }

  console.log('🚀 Initializing automated monitoring service...');
  globalMonitoringService = new AutomatedMonitoringService(config);
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📡 Received SIGTERM, shutting down monitoring gracefully...');
    globalMonitoringService?.stop();
  });

  process.on('SIGINT', () => {
    console.log('📡 Received SIGINT, shutting down monitoring gracefully...');
    globalMonitoringService?.stop();
  });

  return globalMonitoringService;
}