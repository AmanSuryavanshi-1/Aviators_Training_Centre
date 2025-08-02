/**
 * Monitoring and Alerting System
 * Handles critical authentication events and system monitoring
 */

export enum AlertType {
  SECURITY_BREACH = 'SECURITY_BREACH',
  AUTHENTICATION_FAILURE_SPIKE = 'AUTHENTICATION_FAILURE_SPIKE',
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  MEMBER_VALIDATION_FAILURE = 'MEMBER_VALIDATION_FAILURE',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  actions?: AlertAction[];
}

export interface AlertAction {
  id: string;
  label: string;
  url?: string;
  action?: () => void;
  primary?: boolean;
}

export interface AlertingConfig {
  enabled: boolean;
  channels: {
    email?: {
      enabled: boolean;
      recipients: string[];
      smtpConfig?: any;
    };
    slack?: {
      enabled: boolean;
      webhookUrl: string;
      channel: string;
    };
    webhook?: {
      enabled: boolean;
      url: string;
      headers?: Record<string, string>;
    };
  };
  thresholds: {
    authFailuresPerMinute: number;
    authFailuresPerHour: number;
    errorRatePercentage: number;
    responseTimeMs: number;
  };
}

export class AlertingSystem {
  private static instance: AlertingSystem;
  private config: AlertingConfig;
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): AlertingSystem {
    if (!AlertingSystem.instance) {
      AlertingSystem.instance = new AlertingSystem();
    }
    return AlertingSystem.instance;
  }

  constructor() {
    this.config = this.loadConfig();
    this.startMetricsCollection();
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const alert: Alert = {
      id: this.generateAlertId(),
      type,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      metadata,
      resolved: false,
      actions: this.getAlertActions(type),
    };

    // Store alert
    this.activeAlerts.set(alert.id, alert);
    this.alertHistory.push(alert);

    // Send notifications
    if (this.config.enabled) {
      await this.sendNotifications(alert);
    }

    // Log alert
    console.log(`🚨 Alert [${severity}]: ${title}`, alert);

    return alert.id;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy?: string): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      return false;
    }

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = resolvedBy;

    this.activeAlerts.delete(alertId);

    // Send resolution notification
    if (this.config.enabled) {
      await this.sendResolutionNotification(alert);
    }

    return true;
  }

  /**
   * Check for authentication failure spikes
   */
  async checkAuthFailureSpike(failures: number, timeWindowMinutes: number = 5): Promise<void> {
    const threshold = this.config.thresholds.authFailuresPerMinute * timeWindowMinutes;
    
    if (failures > threshold) {
      await this.triggerAlert(
        AlertType.AUTHENTICATION_FAILURE_SPIKE,
        AlertSeverity.ERROR,
        'Authentication Failure Spike Detected',
        `${failures} authentication failures detected in ${timeWindowMinutes} minutes (threshold: ${threshold})`,
        {
          failures,
          timeWindowMinutes,
          threshold,
        }
      );
    }
  }

  /**
   * Check for suspicious activity
   */
  async checkSuspiciousActivity(
    description: string,
    riskScore: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (riskScore >= 8) {
      await this.triggerAlert(
        AlertType.SUSPICIOUS_ACTIVITY,
        AlertSeverity.CRITICAL,
        'Suspicious Activity Detected',
        description,
        {
          riskScore,
          ...metadata,
        }
      );
    }
  }

  /**
   * Check system health
   */
  async checkSystemHealth(): Promise<void> {
    try {
      // Check API endpoints
      const healthChecks = await Promise.allSettled([
        this.checkEndpointHealth('/api/health'),
        this.checkEndpointHealth('/api/auth/session'),
        this.checkSanityConnection(),
      ]);

      const failedChecks = healthChecks.filter(result => result.status === 'rejected');
      
      if (failedChecks.length > 0) {
        await this.triggerAlert(
          AlertType.SERVICE_UNAVAILABLE,
          AlertSeverity.ERROR,
          'System Health Check Failed',
          `${failedChecks.length} health checks failed`,
          {
            failedChecks: failedChecks.length,
            totalChecks: healthChecks.length,
          }
        );
      }
    } catch (error) {
      await this.triggerAlert(
        AlertType.SYSTEM_ERROR,
        AlertSeverity.ERROR,
        'Health Check Error',
        `Failed to perform system health check: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): Alert[] {
    return this.alertHistory
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): {
    total: number;
    active: number;
    resolved: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<AlertSeverity, number>;
  } {
    const stats = {
      total: this.alertHistory.length,
      active: this.activeAlerts.size,
      resolved: this.alertHistory.filter(a => a.resolved).length,
      byType: {} as Record<AlertType, number>,
      bySeverity: {} as Record<AlertSeverity, number>,
    };

    // Initialize counters
    Object.values(AlertType).forEach(type => {
      stats.byType[type] = 0;
    });
    Object.values(AlertSeverity).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });

    // Count alerts
    this.alertHistory.forEach(alert => {
      stats.byType[alert.type]++;
      stats.bySeverity[alert.severity]++;
    });

    return stats;
  }

  /**
   * Load configuration
   */
  private loadConfig(): AlertingConfig {
    return {
      enabled: process.env.ALERTING_ENABLED === 'true',
      channels: {
        email: {
          enabled: process.env.EMAIL_ALERTS_ENABLED === 'true',
          recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
        },
        slack: {
          enabled: process.env.SLACK_ALERTS_ENABLED === 'true',
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.SLACK_ALERT_CHANNEL || '#alerts',
        },
        webhook: {
          enabled: process.env.WEBHOOK_ALERTS_ENABLED === 'true',
          url: process.env.ALERT_WEBHOOK_URL || '',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ALERT_WEBHOOK_TOKEN}`,
          },
        },
      },
      thresholds: {
        authFailuresPerMinute: parseInt(process.env.AUTH_FAILURE_THRESHOLD_PER_MINUTE || '10'),
        authFailuresPerHour: parseInt(process.env.AUTH_FAILURE_THRESHOLD_PER_HOUR || '100'),
        errorRatePercentage: parseInt(process.env.ERROR_RATE_THRESHOLD_PERCENTAGE || '5'),
        responseTimeMs: parseInt(process.env.RESPONSE_TIME_THRESHOLD_MS || '5000'),
      },
    };
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get alert actions
   */
  private getAlertActions(type: AlertType): AlertAction[] {
    const baseActions: AlertAction[] = [
      {
        id: 'view_logs',
        label: 'View Logs',
        url: '/admin/logs',
      },
      {
        id: 'view_metrics',
        label: 'View Metrics',
        url: '/admin/metrics',
      },
    ];

    switch (type) {
      case AlertType.AUTHENTICATION_FAILURE_SPIKE:
        return [
          ...baseActions,
          {
            id: 'view_auth_logs',
            label: 'View Auth Logs',
            url: '/admin/security/auth-logs',
            primary: true,
          },
          {
            id: 'block_ips',
            label: 'Block Suspicious IPs',
            url: '/admin/security/ip-blocking',
          },
        ];

      case AlertType.SUSPICIOUS_ACTIVITY:
        return [
          ...baseActions,
          {
            id: 'view_security_events',
            label: 'View Security Events',
            url: '/admin/security/events',
            primary: true,
          },
          {
            id: 'review_sessions',
            label: 'Review Active Sessions',
            url: '/admin/security/sessions',
          },
        ];

      case AlertType.SERVICE_UNAVAILABLE:
        return [
          ...baseActions,
          {
            id: 'check_status',
            label: 'Check Service Status',
            url: '/admin/health',
            primary: true,
          },
          {
            id: 'restart_services',
            label: 'Restart Services',
            action: () => this.restartServices(),
          },
        ];

      default:
        return baseActions;
    }
  }

  /**
   * Send notifications
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    const promises: Promise<void>[] = [];

    // Email notifications
    if (this.config.channels.email?.enabled) {
      promises.push(this.sendEmailNotification(alert));
    }

    // Slack notifications
    if (this.config.channels.slack?.enabled) {
      promises.push(this.sendSlackNotification(alert));
    }

    // Webhook notifications
    if (this.config.channels.webhook?.enabled) {
      promises.push(this.sendWebhookNotification(alert));
    }

    await Promise.allSettled(promises);
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    try {
      const emailConfig = this.config.channels.email!;
      
      // This would integrate with your email service (Resend, SendGrid, etc.)
      console.log(`📧 Email alert sent to ${emailConfig.recipients.join(', ')}:`, alert.title);
      
      // Example implementation:
      // await emailService.send({
      //   to: emailConfig.recipients,
      //   subject: `[${alert.severity}] ${alert.title}`,
      //   html: this.generateEmailTemplate(alert),
      // });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert): Promise<void> {
    try {
      const slackConfig = this.config.channels.slack!;
      
      const payload = {
        channel: slackConfig.channel,
        username: 'Alert Bot',
        icon_emoji: this.getSlackEmoji(alert.severity),
        attachments: [
          {
            color: this.getSlackColor(alert.severity),
            title: alert.title,
            text: alert.message,
            fields: [
              {
                title: 'Type',
                value: alert.type,
                short: true,
              },
              {
                title: 'Severity',
                value: alert.severity,
                short: true,
              },
              {
                title: 'Time',
                value: new Date(alert.timestamp).toLocaleString(),
                short: true,
              },
            ],
            actions: alert.actions?.map(action => ({
              type: 'button',
              text: action.label,
              url: action.url,
              style: action.primary ? 'primary' : 'default',
            })),
          },
        ],
      };

      await fetch(slackConfig.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert): Promise<void> {
    try {
      const webhookConfig = this.config.channels.webhook!;
      
      await fetch(webhookConfig.url, {
        method: 'POST',
        headers: webhookConfig.headers,
        body: JSON.stringify({
          event: 'alert_triggered',
          alert,
        }),
      });
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  /**
   * Send resolution notification
   */
  private async sendResolutionNotification(alert: Alert): Promise<void> {
    if (this.config.channels.slack?.enabled) {
      try {
        const slackConfig = this.config.channels.slack!;
        
        const payload = {
          channel: slackConfig.channel,
          username: 'Alert Bot',
          icon_emoji: ':white_check_mark:',
          text: `✅ Alert resolved: ${alert.title}`,
          attachments: [
            {
              color: 'good',
              fields: [
                {
                  title: 'Resolved At',
                  value: new Date(alert.resolvedAt!).toLocaleString(),
                  short: true,
                },
                {
                  title: 'Resolved By',
                  value: alert.resolvedBy || 'System',
                  short: true,
                },
              ],
            },
          ],
        };

        await fetch(slackConfig.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error('Failed to send resolution notification:', error);
      }
    }
  }

  /**
   * Check endpoint health
   */
  private async checkEndpointHealth(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check Sanity connection
   */
  private async checkSanityConnection(): Promise<boolean> {
    try {
      // This would check Sanity API connectivity
      // For now, we'll simulate a check
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    // Collect metrics every minute
    setInterval(() => {
      this.collectMetrics();
    }, 60000);
  }

  /**
   * Collect metrics
   */
  private collectMetrics(): void {
    const now = Date.now();
    
    // Collect various metrics
    const metrics = {
      activeAlerts: this.activeAlerts.size,
      totalAlerts: this.alertHistory.length,
      memoryUsage: typeof process !== 'undefined' ? process.memoryUsage().heapUsed : 0,
      timestamp: now,
    };

    // Store metrics (simplified - in production, you'd use a proper metrics store)
    Object.entries(metrics).forEach(([key, value]) => {
      if (!this.metrics.has(key)) {
        this.metrics.set(key, []);
      }
      const values = this.metrics.get(key)!;
      values.push(typeof value === 'number' ? value : 0);
      
      // Keep only last 1440 data points (24 hours at 1-minute intervals)
      if (values.length > 1440) {
        values.shift();
      }
    });
  }

  /**
   * Get Slack emoji for severity
   */
  private getSlackEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return ':rotating_light:';
      case AlertSeverity.ERROR:
        return ':exclamation:';
      case AlertSeverity.WARNING:
        return ':warning:';
      default:
        return ':information_source:';
    }
  }

  /**
   * Get Slack color for severity
   */
  private getSlackColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return 'danger';
      case AlertSeverity.ERROR:
        return 'danger';
      case AlertSeverity.WARNING:
        return 'warning';
      default:
        return 'good';
    }
  }

  /**
   * Restart services (placeholder)
   */
  private async restartServices(): Promise<void> {
    console.log('🔄 Restarting services...');
    // Implementation would depend on your deployment setup
  }
}

// Export singleton instance
export const alertingSystem = AlertingSystem.getInstance();