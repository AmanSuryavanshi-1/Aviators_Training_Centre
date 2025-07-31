export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: AlertChannel[];
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface AlertCondition {
  type: 'health_status' | 'response_time' | 'error_rate' | 'uptime' | 'maintenance_failure';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  component?: string;
}

export interface AlertChannel {
  type: 'console' | 'email' | 'webhook' | 'slack';
  config: {
    url?: string;
    email?: string;
    webhookUrl?: string;
    slackChannel?: string;
  };
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  message: string;
  details: any;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export class AlertingSystem {
  private rules: AlertRule[] = [];
  private alerts: Alert[] = [];
  private maxAlertHistory = 1000;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'system-critical',
        name: 'System Critical Status',
        description: 'Alert when system health is critical',
        condition: {
          type: 'health_status',
          operator: 'equals',
          value: 'critical'
        },
        severity: 'critical',
        enabled: true,
        channels: [{ type: 'console', config: {} }],
        cooldownMinutes: 5
      },
      {
        id: 'system-degraded',
        name: 'System Degraded Status',
        description: 'Alert when system health is degraded',
        condition: {
          type: 'health_status',
          operator: 'equals',
          value: 'degraded'
        },
        severity: 'medium',
        enabled: true,
        channels: [{ type: 'console', config: {} }],
        cooldownMinutes: 15
      },
      {
        id: 'low-uptime',
        name: 'Low System Uptime',
        description: 'Alert when system uptime drops below 95%',
        condition: {
          type: 'uptime',
          operator: 'less_than',
          value: 95
        },
        severity: 'high',
        enabled: true,
        channels: [{ type: 'console', config: {} }],
        cooldownMinutes: 30
      },
      {
        id: 'slow-response',
        name: 'Slow Response Times',
        description: 'Alert when response times exceed 5 seconds',
        condition: {
          type: 'response_time',
          operator: 'greater_than',
          value: 5000
        },
        severity: 'medium',
        enabled: true,
        channels: [{ type: 'console', config: {} }],
        cooldownMinutes: 10
      },
      {
        id: 'maintenance-failure',
        name: 'Maintenance Task Failure',
        description: 'Alert when maintenance tasks fail',
        condition: {
          type: 'maintenance_failure',
          operator: 'equals',
          value: true
        },
        severity: 'high',
        enabled: true,
        channels: [{ type: 'console', config: {} }],
        cooldownMinutes: 5
      }
    ];
  }

  /**
   * Evaluate alert rules against current system state
   */
  async evaluateAlerts(systemData: {
    health?: any;
    uptime?: number;
    maintenanceResults?: any[];
    components?: any[];
  }): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      // Check cooldown period
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldownMinutes * 60 * 1000;
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < cooldownMs) {
          continue;
        }
      }

      const shouldTrigger = this.evaluateCondition(rule.condition, systemData);
      
      if (shouldTrigger) {
        const alert = await this.createAlert(rule, systemData);
        triggeredAlerts.push(alert);
        
        // Update last triggered time
        rule.lastTriggered = new Date();
        
        // Send alert through configured channels
        await this.sendAlert(alert, rule.channels);
      }
    }

    return triggeredAlerts;
  }

  /**
   * Evaluate a single alert condition
   */
  private evaluateCondition(condition: AlertCondition, systemData: any): boolean {
    let actualValue: any;

    switch (condition.type) {
      case 'health_status':
        actualValue = systemData.health?.overall;
        break;
      case 'uptime':
        actualValue = systemData.uptime;
        break;
      case 'response_time':
        if (condition.component) {
          const component = systemData.components?.find((c: any) => c.component === condition.component);
          actualValue = component?.responseTime;
        } else {
          // Average response time across all components
          const responseTimes = systemData.components?.filter((c: any) => c.responseTime).map((c: any) => c.responseTime) || [];
          actualValue = responseTimes.length > 0 ? responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length : 0;
        }
        break;
      case 'maintenance_failure':
        actualValue = systemData.maintenanceResults?.some((r: any) => !r.success) || false;
        break;
      default:
        return false;
    }

    if (actualValue === undefined || actualValue === null) {
      return false;
    }

    switch (condition.operator) {
      case 'equals':
        return actualValue === condition.value;
      case 'not_equals':
        return actualValue !== condition.value;
      case 'greater_than':
        return actualValue > condition.value;
      case 'less_than':
        return actualValue < condition.value;
      case 'contains':
        return String(actualValue).includes(String(condition.value));
      default:
        return false;
    }
  }

  /**
   * Create an alert
   */
  private async createAlert(rule: AlertRule, systemData: any): Promise<Alert> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, systemData),
      details: {
        condition: rule.condition,
        systemData: this.sanitizeSystemData(systemData),
        rule: {
          id: rule.id,
          name: rule.name,
          description: rule.description
        }
      },
      timestamp: new Date(),
      resolved: false
    };

    // Add to alert history
    this.alerts.push(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > this.maxAlertHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertHistory);
    }

    return alert;
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(rule: AlertRule, systemData: any): string {
    const condition = rule.condition;
    
    switch (condition.type) {
      case 'health_status':
        return `System health is ${systemData.health?.overall} - ${rule.description}`;
      case 'uptime':
        return `System uptime is ${systemData.uptime}% - ${rule.description}`;
      case 'response_time':
        const avgResponseTime = systemData.components?.filter((c: any) => c.responseTime)
          .reduce((sum: number, c: any, _, arr: any[]) => sum + c.responseTime / arr.length, 0) || 0;
        return `Average response time is ${Math.round(avgResponseTime)}ms - ${rule.description}`;
      case 'maintenance_failure':
        const failedTasks = systemData.maintenanceResults?.filter((r: any) => !r.success) || [];
        return `${failedTasks.length} maintenance task(s) failed - ${rule.description}`;
      default:
        return `Alert triggered: ${rule.name}`;
    }
  }

  /**
   * Sanitize system data for alert details
   */
  private sanitizeSystemData(systemData: any): any {
    return {
      healthStatus: systemData.health?.overall,
      uptime: systemData.uptime,
      componentCount: systemData.components?.length || 0,
      unhealthyComponents: systemData.components?.filter((c: any) => c.status === 'unhealthy').length || 0,
      maintenanceFailures: systemData.maintenanceResults?.filter((r: any) => !r.success).length || 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Send alert through configured channels
   */
  private async sendAlert(alert: Alert, channels: AlertChannel[]): Promise<void> {
    const severityEmojis = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      critical: '🔴'
    };

    const emoji = severityEmojis[alert.severity as keyof typeof severityEmojis] || '⚪';
    const alertMessage = `${emoji} ${alert.severity.toUpperCase()} ALERT: ${alert.message}`;

    for (const channel of channels) {
      try {
        await this.sendToChannel(channel, alertMessage, alert);
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error);
      }
    }
  }

  /**
   * Send alert to specific channel
   */
  private async sendToChannel(channel: AlertChannel, message: string, alert: Alert): Promise<void> {
    switch (channel.type) {
      case 'console':
        console.error(`🚨 ALERT [${alert.timestamp.toISOString()}]: ${message}`);
        if (alert.details) {
          console.error('Alert Details:', JSON.stringify(alert.details, null, 2));
        }
        break;

      case 'webhook':
        if (channel.config.webhookUrl) {
          await fetch(channel.config.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              alert: {
                id: alert.id,
                severity: alert.severity,
                message: alert.message,
                timestamp: alert.timestamp,
                details: alert.details
              }
            })
          });
        }
        break;

      case 'email':
        // Email implementation would go here
        console.log(`📧 Email alert would be sent to ${channel.config.email}: ${message}`);
        break;

      case 'slack':
        // Slack implementation would go here
        console.log(`💬 Slack alert would be sent to ${channel.config.slackChannel}: ${message}`);
        break;

      default:
        console.log(`Unknown alert channel: ${channel.type}`);
    }
  }

  /**
   * Add custom alert rule
   */
  addRule(rule: Omit<AlertRule, 'id'>): string {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRule: AlertRule = { ...rule, id };
    this.rules.push(newRule);
    return id;
  }

  /**
   * Update alert rule
   */
  updateRule(id: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return false;
    
    this.rules[ruleIndex] = { ...this.rules[ruleIndex], ...updates };
    return true;
  }

  /**
   * Remove alert rule
   */
  removeRule(id: string): boolean {
    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) return false;
    
    this.rules.splice(ruleIndex, 1);
    return true;
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return [...this.rules];
  }

  /**
   * Get alert history
   */
  getAlerts(limit?: number): Alert[] {
    const sortedAlerts = [...this.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sortedAlerts.slice(0, limit) : sortedAlerts;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.resolved) return false;
    
    alert.resolved = true;
    alert.resolvedAt = new Date();
    return true;
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(hours: number = 24): {
    total: number;
    bySeverity: { [key: string]: number };
    byRule: { [key: string]: number };
    resolved: number;
    unresolved: number;
  } {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const recentAlerts = this.alerts.filter(alert => alert.timestamp >= cutoffTime);

    const bySeverity: { [key: string]: number } = {};
    const byRule: { [key: string]: number } = {};

    recentAlerts.forEach(alert => {
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      byRule[alert.ruleName] = (byRule[alert.ruleName] || 0) + 1;
    });

    return {
      total: recentAlerts.length,
      bySeverity,
      byRule,
      resolved: recentAlerts.filter(a => a.resolved).length,
      unresolved: recentAlerts.filter(a => !a.resolved).length
    };
  }
}

// Global alerting system instance
let globalAlertingSystem: AlertingSystem | null = null;

/**
 * Get or create the global alerting system instance
 */
export function getGlobalAlertingSystem(): AlertingSystem {
  if (!globalAlertingSystem) {
    globalAlertingSystem = new AlertingSystem();
  }
  return globalAlertingSystem;
}
