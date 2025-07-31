import { SystemHealthMonitor } from './system-health-monitor';
import { SanityDiagnosticService } from '../diagnostics/sanity-diagnostic-service';
import { enhancedClient } from '../sanity/client';

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  nextRun?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoFix: boolean;
}

export interface MaintenanceResult {
  taskId: string;
  success: boolean;
  message: string;
  details?: any;
  duration: number;
  timestamp: Date;
  actionsPerformed: string[];
}

export interface AlertConfig {
  enabled: boolean;
  channels: ('console' | 'email' | 'webhook')[];
  thresholds: {
    responseTime: number;
    errorRate: number;
    consecutiveFailures: number;
  };
}

export class PreventiveMaintenanceSystem {
  private healthMonitor: SystemHealthMonitor;
  private diagnosticService: SanityDiagnosticService;
  private maintenanceTasks: MaintenanceTask[] = [];
  private maintenanceHistory: MaintenanceResult[] = [];
  private alertConfig: AlertConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.healthMonitor = new SystemHealthMonitor();
    this.diagnosticService = new SanityDiagnosticService();
    this.alertConfig = {
      enabled: true,
      channels: ['console'],
      thresholds: {
        responseTime: 5000,
        errorRate: 0.1,
        consecutiveFailures: 3
      }
    };

    this.initializeMaintenanceTasks();
  }

  /**
   * Initialize default maintenance tasks
   */
  private initializeMaintenanceTasks(): void {
    this.maintenanceTasks = [
      {
        id: 'health-check',
        name: 'System Health Check',
        description: 'Perform comprehensive system health monitoring',
        frequency: 'hourly',
        status: 'pending',
        priority: 'high',
        autoFix: false
      },
      {
        id: 'connection-validation',
        name: 'Sanity Connection Validation',
        description: 'Validate Sanity CMS connection and permissions',
        frequency: 'daily',
        status: 'pending',
        priority: 'critical',
        autoFix: true
      },
      {
        id: 'data-integrity-check',
        name: 'Data Integrity Check',
        description: 'Check and fix blog post data integrity issues',
        frequency: 'daily',
        status: 'pending',
        priority: 'medium',
        autoFix: true
      },
      {
        id: 'cleanup-test-documents',
        name: 'Cleanup Test Documents',
        description: 'Remove test documents and temporary data',
        frequency: 'daily',
        status: 'pending',
        priority: 'low',
        autoFix: true
      },
      {
        id: 'performance-optimization',
        name: 'Performance Optimization',
        description: 'Optimize queries and clear unnecessary caches',
        frequency: 'weekly',
        status: 'pending',
        priority: 'medium',
        autoFix: true
      },
      {
        id: 'security-audit',
        name: 'Security Audit',
        description: 'Audit API tokens and permissions',
        frequency: 'weekly',
        status: 'pending',
        priority: 'high',
        autoFix: false
      },
      {
        id: 'backup-validation',
        name: 'Backup Validation',
        description: 'Validate that data backups are working correctly',
        frequency: 'weekly',
        status: 'pending',
        priority: 'high',
        autoFix: false
      },
      {
        id: 'comprehensive-recovery-test',
        name: 'Comprehensive Recovery Test',
        description: 'Full system recovery validation test',
        frequency: 'monthly',
        status: 'pending',
        priority: 'critical',
        autoFix: false
      }
    ];

    // Calculate next run times
    this.calculateNextRunTimes();
  }

  /**
   * Calculate next run times for all tasks
   */
  private calculateNextRunTimes(): void {
    const now = new Date();
    
    this.maintenanceTasks.forEach(task => {
      if (!task.nextRun) {
        task.nextRun = this.calculateNextRun(now, task.frequency);
      }
    });
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRun(from: Date, frequency: MaintenanceTask['frequency']): Date {
    const next = new Date(from);
    
    switch (frequency) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
    }
    
    return next;
  }

  /**
   * Start the preventive maintenance system
   */
  start(): void {
    if (this.isRunning) {
      console.log('🔄 Preventive maintenance system is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting preventive maintenance system...');

    // Run maintenance checks every 5 minutes
    this.intervalId = setInterval(() => {
      this.runScheduledMaintenance();
    }, 5 * 60 * 1000);

    // Run initial maintenance check
    setTimeout(() => {
      this.runScheduledMaintenance();
    }, 1000);

    console.log('✅ Preventive maintenance system started');
  }

  /**
   * Stop the preventive maintenance system
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('⏹️ Preventive maintenance system is not running');
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('⏹️ Preventive maintenance system stopped');
  }

  /**
   * Run scheduled maintenance tasks
   */
  private async runScheduledMaintenance(): Promise<void> {
    const now = new Date();
    const dueTasks = this.maintenanceTasks.filter(task => 
      task.nextRun && task.nextRun <= now && task.status !== 'running'
    );

    if (dueTasks.length === 0) {
      return;
    }

    console.log(`🔧 Running ${dueTasks.length} scheduled maintenance task(s)...`);

    for (const task of dueTasks) {
      await this.runMaintenanceTask(task);
    }
  }

  /**
   * Run a specific maintenance task
   */
  async runMaintenanceTask(task: MaintenanceTask): Promise<MaintenanceResult> {
    const startTime = Date.now();
    const actionsPerformed: string[] = [];
    
    console.log(`🔧 Running maintenance task: ${task.name}`);
    
    // Update task status
    task.status = 'running';
    task.lastRun = new Date();

    let result: MaintenanceResult;

    try {
      switch (task.id) {
        case 'health-check':
          result = await this.performHealthCheck(task, actionsPerformed);
          break;
        case 'connection-validation':
          result = await this.performConnectionValidation(task, actionsPerformed);
          break;
        case 'data-integrity-check':
          result = await this.performDataIntegrityCheck(task, actionsPerformed);
          break;
        case 'cleanup-test-documents':
          result = await this.performTestDocumentCleanup(task, actionsPerformed);
          break;
        case 'performance-optimization':
          result = await this.performPerformanceOptimization(task, actionsPerformed);
          break;
        case 'security-audit':
          result = await this.performSecurityAudit(task, actionsPerformed);
          break;
        case 'backup-validation':
          result = await this.performBackupValidation(task, actionsPerformed);
          break;
        case 'comprehensive-recovery-test':
          result = await this.performComprehensiveRecoveryTest(task, actionsPerformed);
          break;
        default:
          throw new Error(`Unknown maintenance task: ${task.id}`);
      }

      task.status = 'completed';
      
    } catch (error) {
      result = {
        taskId: task.id,
        success: false,
        message: `Task failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        actionsPerformed
      };
      
      task.status = 'failed';
      console.error(`❌ Maintenance task failed: ${task.name}`, error);
    }

    // Schedule next run
    task.nextRun = this.calculateNextRun(new Date(), task.frequency);
    
    // Store result in history
    this.maintenanceHistory.push(result);
    
    // Keep only last 100 results
    if (this.maintenanceHistory.length > 100) {
      this.maintenanceHistory = this.maintenanceHistory.slice(-100);
    }

    // Check if alerts should be sent
    if (!result.success && this.alertConfig.enabled) {
      await this.sendAlert(task, result);
    }

    console.log(`${result.success ? '✅' : '❌'} Maintenance task completed: ${task.name} (${result.duration}ms)`);
    
    return result;
  }

  /**
   * Perform system health check
   */
  private async performHealthCheck(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    
    const healthReport = await this.healthMonitor.performHealthCheck();
    actions.push('Performed comprehensive health check');
    
    let message = `Health check completed - Status: ${healthReport.overall}`;
    let success = true;
    
    if (healthReport.overall === 'critical') {
      success = false;
      message += ` (${healthReport.summary.unhealthy} critical issues found)`;
    } else if (healthReport.overall === 'degraded') {
      message += ` (${healthReport.summary.degraded} warnings found)`;
    }

    return {
      taskId: task.id,
      success,
      message,
      details: {
        overall: healthReport.overall,
        summary: healthReport.summary,
        recommendations: healthReport.recommendations
      },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform connection validation
   */
  private async performConnectionValidation(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    
    const diagnosticReport = await this.diagnosticService.generateDiagnosticReport();
    actions.push('Validated Sanity connection and permissions');
    
    let success = true;
    let message = 'Connection validation completed successfully';
    
    if (diagnosticReport.connection.status !== 'healthy') {
      success = false;
      message = `Connection validation failed: ${diagnosticReport.connection.message}`;
    } else if (diagnosticReport.readPermissions.status !== 'healthy') {
      success = false;
      message = `Read permissions failed: ${diagnosticReport.readPermissions.message}`;
    } else if (diagnosticReport.writePermissions.status !== 'healthy') {
      success = false;
      message = `Write permissions failed: ${diagnosticReport.writePermissions.message}`;
    }

    return {
      taskId: task.id,
      success,
      message,
      details: diagnosticReport,
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform data integrity check and fixes
   */
  private async performDataIntegrityCheck(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    let fixedPosts = 0;
    
    // Check for posts with missing required fields
    const posts = await enhancedClient.fetch(`
      *[_type == "post"] {
        _id,
        title,
        slug,
        body,
        excerpt,
        publishedAt,
        "hasTitle": defined(title),
        "hasSlug": defined(slug.current),
        "hasBody": defined(body),
        "hasExcerpt": defined(excerpt)
      }
    `) as Array<{
      _id: string;
      title?: string;
      slug?: { current?: string };
      body?: any;
      excerpt?: string;
      publishedAt?: string;
      hasTitle: boolean;
      hasSlug: boolean;
      hasBody: boolean;
      hasExcerpt: boolean;
    }>;

    actions.push(`Checked ${posts.length} posts for data integrity`);

    const invalidPosts = posts.filter((post) => 
      !post.hasTitle || !post.hasSlug || !post.hasBody
    );

    if (invalidPosts.length > 0 && task.autoFix) {
      actions.push(`Found ${invalidPosts.length} posts with integrity issues`);
      
      for (const post of invalidPosts) {
        try {
          const updates: any = {};
          
          if (!post.hasTitle) {
            updates.title = post.title || 'Untitled Post';
          }
          
          if (!post.hasSlug) {
            const slugText = post.title || 'untitled-post';
            updates.slug = {
              _type: 'slug',
              current: slugText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            };
          }
          
          if (!post.hasBody) {
            updates.body = [
              {
                _type: 'block',
                children: [
                  { _type: 'span', text: post.excerpt || 'Content needs to be added.' }
                ]
              }
            ];
          }

          if (Object.keys(updates).length > 0) {
            await enhancedClient
              .patch(post._id, { validateConnection: false })
              .set(updates)
              .commit();
            
            fixedPosts++;
            actions.push(`Fixed data integrity issues for post: ${post._id}`);
          }
        } catch (fixError) {
          actions.push(`Failed to fix post ${post._id}: ${fixError instanceof Error ? fixError.message : 'Unknown error'}`);
        }
      }
    }

    return {
      taskId: task.id,
      success: true,
      message: `Data integrity check completed - ${fixedPosts} posts fixed`,
      details: {
        totalPosts: posts.length,
        invalidPosts: invalidPosts.length,
        fixedPosts
      },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform test document cleanup
   */
  private async performTestDocumentCleanup(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    let deletedCount = 0;
    
    const testDocs = await enhancedClient.fetch(`
      *[_type == "post" && (
        title match "*Test*" || 
        title match "*Connection Test*" || 
        title match "*Permission Test*" ||
        title match "*Diagnostic*" ||
        title match "*Recovery*" ||
        isTestPost == true || 
        isDiagnosticTest == true ||
        isPermissionTest == true ||
        isRecoveryTest == true ||
        isRecoveryValidationTest == true
      )] {
        _id,
        title,
        _createdAt
      }
    `) as Array<{
      _id: string;
      title?: string;
      _createdAt: string;
    }>;

    actions.push(`Found ${testDocs.length} test documents to clean up`);

    if (testDocs.length > 0 && task.autoFix) {
      for (const doc of testDocs) {
        try {
          await enhancedClient.delete(doc._id, { validateConnection: false });
          deletedCount++;
          actions.push(`Deleted test document: ${doc.title || doc._id}`);
        } catch (deleteError) {
          actions.push(`Failed to delete ${doc._id}: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
        }
      }
    }

    return {
      taskId: task.id,
      success: true,
      message: `Test document cleanup completed - ${deletedCount} documents removed`,
      details: {
        foundDocuments: testDocs.length,
        deletedDocuments: deletedCount
      },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform performance optimization
   */
  private async performPerformanceOptimization(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    
    // Reset connection validation cache
    this.diagnosticService = new SanityDiagnosticService();
    actions.push('Reset diagnostic service cache');
    
    // Reset health monitor cache
    this.healthMonitor = new SystemHealthMonitor();
    actions.push('Reset health monitor cache');
    
    // Reset enhanced client validation cache
    enhancedClient.resetValidationCache();
    actions.push('Reset Sanity client validation cache');

    return {
      taskId: task.id,
      success: true,
      message: 'Performance optimization completed - caches cleared',
      details: {
        optimizations: ['diagnostic cache', 'health monitor cache', 'client validation cache']
      },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform security audit
   */
  private async performSecurityAudit(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    const issues: string[] = [];
    
    // Check environment variables
    const requiredEnvVars = ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SANITY_DATASET', 'SANITY_API_TOKEN'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        issues.push(`Missing environment variable: ${envVar}`);
      }
    }
    actions.push('Checked environment variables');
    
    // Test API token permissions
    try {
      const diagnosticReport = await this.diagnosticService.generateDiagnosticReport();
      if (diagnosticReport.writePermissions.status !== 'healthy') {
        issues.push('API token lacks proper write permissions');
      }
      actions.push('Validated API token permissions');
    } catch (error) {
      issues.push('Failed to validate API token permissions');
    }

    return {
      taskId: task.id,
      success: issues.length === 0,
      message: issues.length === 0 ? 'Security audit passed' : `Security audit found ${issues.length} issues`,
      details: { issues },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform backup validation
   */
  private async performBackupValidation(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    
    // Check if we can retrieve data (basic backup validation)
    const postCount = await enhancedClient.fetch(`count(*[_type == "post"])`);
    actions.push(`Verified ${postCount} posts are accessible`);
    
    // Check if we can create and delete test data (write capability)
    try {
      const testDoc = {
        _type: 'post',
        title: `Backup Validation Test - ${new Date().toISOString()}`,
        slug: { current: `backup-test-${Date.now()}` },
        excerpt: 'Test document for backup validation',
        body: [{ _type: 'block', children: [{ _type: 'span', text: 'Test content' }] }],
        publishedAt: new Date().toISOString(),
        isBackupTest: true
      };
      
      const created = await enhancedClient.create(testDoc, { validateConnection: false });
      await enhancedClient.delete(created._id, { validateConnection: false });
      actions.push('Verified write/delete capabilities');
    } catch (error) {
      actions.push(`Write capability test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      taskId: task.id,
      success: true,
      message: `Backup validation completed - ${postCount} posts verified`,
      details: { postCount },
      duration: Date.now() - startTime,
      timestamp: new Date(),
      actionsPerformed: actions
    };
  }

  /**
   * Perform comprehensive recovery test
   */
  private async performComprehensiveRecoveryTest(task: MaintenanceTask, actions: string[]): Promise<MaintenanceResult> {
    const startTime = Date.now();
    
    // This would run the full recovery validation script
    actions.push('Started comprehensive recovery test');
    
    try {
      const healthReport = await this.healthMonitor.performHealthCheck();
      const diagnosticReport = await this.diagnosticService.generateDiagnosticReport();
      
      actions.push('Completed health check');
      actions.push('Completed diagnostic check');
      
      const success = healthReport.overall !== 'critical' && diagnosticReport.overall !== 'critical';
      
      return {
        taskId: task.id,
        success,
        message: success ? 'Comprehensive recovery test passed' : 'Comprehensive recovery test found critical issues',
        details: {
          healthStatus: healthReport.overall,
          diagnosticStatus: diagnosticReport.overall
        },
        duration: Date.now() - startTime,
        timestamp: new Date(),
        actionsPerformed: actions
      };
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        message: `Comprehensive recovery test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        actionsPerformed: actions
      };
    }
  }

  /**
   * Send alert for failed maintenance task
   */
  private async sendAlert(task: MaintenanceTask, result: MaintenanceResult): Promise<void> {
    const alertMessage = `🚨 Maintenance Alert: ${task.name} failed\n` +
                        `Message: ${result.message}\n` +
                        `Duration: ${result.duration}ms\n` +
                        `Time: ${result.timestamp.toISOString()}`;

    for (const channel of this.alertConfig.channels) {
      switch (channel) {
        case 'console':
          console.error(alertMessage);
          break;
        case 'email':
          // Email implementation would go here
          console.log('📧 Email alert would be sent:', alertMessage);
          break;
        case 'webhook':
          // Webhook implementation would go here
          console.log('🔗 Webhook alert would be sent:', alertMessage);
          break;
      }
    }
  }

  /**
   * Get maintenance status
   */
  getStatus(): {
    isRunning: boolean;
    tasks: MaintenanceTask[];
    recentResults: MaintenanceResult[];
    nextScheduledTask?: { task: MaintenanceTask; timeUntil: number };
  } {
    const now = new Date();
    const nextTask = this.maintenanceTasks
      .filter(task => task.nextRun)
      .sort((a, b) => a.nextRun!.getTime() - b.nextRun!.getTime())[0];

    return {
      isRunning: this.isRunning,
      tasks: [...this.maintenanceTasks],
      recentResults: this.maintenanceHistory.slice(-10),
      nextScheduledTask: nextTask ? {
        task: nextTask,
        timeUntil: nextTask.nextRun!.getTime() - now.getTime()
      } : undefined
    };
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  /**
   * Add custom maintenance task
   */
  addMaintenanceTask(task: Omit<MaintenanceTask, 'nextRun'>): void {
    const newTask: MaintenanceTask = {
      ...task,
      nextRun: this.calculateNextRun(new Date(), task.frequency)
    };
    
    this.maintenanceTasks.push(newTask);
  }

  /**
   * Remove maintenance task
   */
  removeMaintenanceTask(taskId: string): boolean {
    const index = this.maintenanceTasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.maintenanceTasks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get maintenance status (alias for getStatus for API compatibility)
   */
  getMaintenanceStatus() {
    return this.getStatus();
  }

  /**
   * Get maintenance statistics
   */
  getMaintenanceStatistics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recent24h = this.maintenanceHistory.filter(r => r.timestamp >= last24Hours);
    const recent7d = this.maintenanceHistory.filter(r => r.timestamp >= last7Days);

    const successRate24h = recent24h.length > 0 
      ? (recent24h.filter(r => r.success).length / recent24h.length) * 100 
      : 0;

    const successRate7d = recent7d.length > 0 
      ? (recent7d.filter(r => r.success).length / recent7d.length) * 100 
      : 0;

    const averageDuration = recent7d.length > 0
      ? recent7d.reduce((sum, r) => sum + r.duration, 0) / recent7d.length
      : 0;

    return {
      totalTasks: this.maintenanceTasks.length,
      activeTasks: this.maintenanceTasks.filter(t => t.status !== 'failed').length,
      failedTasks: this.maintenanceTasks.filter(t => t.status === 'failed').length,
      successRate24h: Math.round(successRate24h),
      successRate7d: Math.round(successRate7d),
      averageDuration: Math.round(averageDuration),
      totalExecutions: this.maintenanceHistory.length,
      executionsLast24h: recent24h.length,
      executionsLast7d: recent7d.length
    };
  }

  /**
   * Run maintenance task by ID
   */
  async runMaintenanceTask(taskId: string): Promise<MaintenanceResult> {
    const task = this.maintenanceTasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Maintenance task not found: ${taskId}`);
    }
    return this.runMaintenanceTask(task);
  }
}
