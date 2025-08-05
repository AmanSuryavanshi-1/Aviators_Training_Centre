#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * Sets up monitoring, alerting, and health checks for the analytics system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'aviators-training-centre';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '[admin_email]';
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK || null;

console.log('📊 Setting up production monitoring for analytics system...');

async function main() {
  try {
    // 1. Set up Firebase monitoring
    await setupFirebaseMonitoring();
    
    // 2. Configure performance monitoring
    await setupPerformanceMonitoring();
    
    // 3. Set up data quality monitoring
    await setupDataQualityMonitoring();
    
    // 4. Configure alerting rules
    await setupAlertingRules();
    
    // 5. Create health check endpoints
    await createHealthChecks();
    
    // 6. Set up automated reports
    await setupAutomatedReports();
    
    console.log('✅ Production monitoring setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Monitoring setup failed:', error.message);
    process.exit(1);
  }
}

async function setupFirebaseMonitoring() {
  console.log('🔥 Setting up Firebase monitoring...');
  
  const monitoringConfig = {
    projectId: PROJECT_ID,
    monitoring: {
      firestore: {
        enabled: true,
        metrics: [
          'document_reads',
          'document_writes',
          'document_deletes',
          'query_count',
          'index_usage'
        ],
        alerts: {
          highReadCount: {
            threshold: 10000, // per hour
            enabled: true
          },
          highWriteCount: {
            threshold: 5000, // per hour
            enabled: true
          },
          indexMisses: {
            threshold: 100, // per hour
            enabled: true
          }
        }
      },
      functions: {
        enabled: true,
        metrics: [
          'execution_count',
          'execution_time',
          'memory_usage',
          'error_count'
        ],
        alerts: {
          highErrorRate: {
            threshold: 5, // 5%
            enabled: true
          },
          highLatency: {
            threshold: 10000, // 10 seconds
            enabled: true
          }
        }
      }
    }
  };
  
  // Write monitoring configuration
  const configPath = 'monitoring/firebase-monitoring.json';
  ensureDirectoryExists(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(monitoringConfig, null, 2));
  
  console.log(`✅ Firebase monitoring configuration saved to ${configPath}`);
}

async function setupPerformanceMonitoring() {
  console.log('⚡ Setting up performance monitoring...');
  
  const performanceScript = `
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: '${PROJECT_ID}'
  });
}

const db = admin.firestore();

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
  }

  async trackQueryPerformance(collectionName, queryType, duration, resultCount) {
    const metric = {
      collection: collectionName,
      queryType,
      duration,
      resultCount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      efficiency: resultCount / duration // results per ms
    };

    // Store metric
    await db.collection('_monitoring').doc('performance').collection('queries').add(metric);

    // Check for performance issues
    if (duration > 5000) { // 5 seconds
      await this.createAlert('slow_query', {
        collection: collectionName,
        queryType,
        duration,
        severity: 'high'
      });
    }
  }

  async trackMemoryUsage(component, memoryUsage) {
    const metric = {
      component,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('_monitoring').doc('performance').collection('memory').add(metric);

    // Alert on high memory usage (>500MB)
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
      await this.createAlert('high_memory', {
        component,
        memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        severity: 'medium'
      });
    }
  }

  async createAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      resolved: false
    };

    await db.collection('_monitoring').doc('alerts').collection('active').add(alert);
    
    // Send notification
    await this.sendNotification(alert);
  }

  async sendNotification(alert) {
    // Implementation would send email/Slack notification
    console.log('Alert:', alert.type, alert.data);
  }
}

module.exports = PerformanceMonitor;
`;
  
  const scriptPath = 'monitoring/performance-monitor.js';
  ensureDirectoryExists(path.dirname(scriptPath));
  fs.writeFileSync(scriptPath, performanceScript);
  
  console.log(`✅ Performance monitoring script created at ${scriptPath}`);
}

async function setupDataQualityMonitoring() {
  console.log('🔍 Setting up data quality monitoring...');
  
  const dataQualityScript = `
const admin = require('firebase-admin');

class DataQualityMonitor {
  constructor() {
    this.db = admin.firestore();
    this.qualityThresholds = {
      completeness: 90, // 90% of required fields present
      accuracy: 85,     // 85% of data passes validation
      consistency: 80,  // 80% of data is consistent
      timeliness: 95    // 95% of data is recent
    };
  }

  async checkDataQuality(collectionName, sampleSize = 100) {
    console.log(\`Checking data quality for \${collectionName}...\`);
    
    const snapshot = await this.db.collection(collectionName)
      .limit(sampleSize)
      .get();
    
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const quality = {
      completeness: this.checkCompleteness(documents),
      accuracy: this.checkAccuracy(documents),
      consistency: this.checkConsistency(documents),
      timeliness: this.checkTimeliness(documents),
      sampleSize: documents.length,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Calculate overall score
    quality.overallScore = (
      quality.completeness + 
      quality.accuracy + 
      quality.consistency + 
      quality.timeliness
    ) / 4;
    
    // Store quality metrics
    await this.db.collection('_monitoring')
      .doc('data_quality')
      .collection(collectionName)
      .add(quality);
    
    // Check for quality issues
    await this.checkQualityAlerts(collectionName, quality);
    
    return quality;
  }

  checkCompleteness(documents) {
    if (documents.length === 0) return 0;
    
    const requiredFields = ['timestamp', 'userId', 'sessionId'];
    let completeCount = 0;
    
    documents.forEach(doc => {
      const hasAllFields = requiredFields.every(field => 
        doc[field] !== undefined && doc[field] !== null
      );
      if (hasAllFields) completeCount++;
    });
    
    return (completeCount / documents.length) * 100;
  }

  checkAccuracy(documents) {
    if (documents.length === 0) return 0;
    
    let accurateCount = 0;
    
    documents.forEach(doc => {
      let isAccurate = true;
      
      // Check timestamp validity
      if (doc.timestamp) {
        const timestamp = doc.timestamp.toDate ? doc.timestamp.toDate() : new Date(doc.timestamp);
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        
        if (timestamp > now || timestamp < oneYearAgo) {
          isAccurate = false;
        }
      }
      
      // Check email format if present
      if (doc.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(doc.email)) {
        isAccurate = false;
      }
      
      // Check URL format if present
      if (doc.url && !/^https?:\\/\\/.+/.test(doc.url)) {
        isAccurate = false;
      }
      
      if (isAccurate) accurateCount++;
    });
    
    return (accurateCount / documents.length) * 100;
  }

  checkConsistency(documents) {
    if (documents.length === 0) return 0;
    
    // Check for consistent data patterns
    const userAgents = new Set();
    const sources = new Set();
    let consistentCount = 0;
    
    documents.forEach(doc => {
      if (doc.userAgent) userAgents.add(doc.userAgent);
      if (doc.source) sources.add(doc.source);
      
      // Basic consistency checks
      let isConsistent = true;
      
      // Check if bot detection is consistent with user agent
      if (doc.validation && doc.userAgent) {
        const isBotUA = /bot|crawler|spider/i.test(doc.userAgent);
        const isBotDetected = doc.validation.isBot;
        
        // Allow some tolerance for bot detection
        if (isBotUA && !isBotDetected) {
          isConsistent = false;
        }
      }
      
      if (isConsistent) consistentCount++;
    });
    
    return (consistentCount / documents.length) * 100;
  }

  checkTimeliness(documents) {
    if (documents.length === 0) return 0;
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let timelyCount = 0;
    
    documents.forEach(doc => {
      if (doc.timestamp) {
        const timestamp = doc.timestamp.toDate ? doc.timestamp.toDate() : new Date(doc.timestamp);
        if (timestamp >= oneDayAgo) {
          timelyCount++;
        }
      }
    });
    
    return (timelyCount / documents.length) * 100;
  }

  async checkQualityAlerts(collectionName, quality) {
    const alerts = [];
    
    Object.entries(this.qualityThresholds).forEach(([metric, threshold]) => {
      if (quality[metric] < threshold) {
        alerts.push({
          type: 'data_quality_issue',
          collection: collectionName,
          metric,
          value: quality[metric],
          threshold,
          severity: quality[metric] < threshold * 0.8 ? 'high' : 'medium'
        });
      }
    });
    
    // Store alerts
    for (const alert of alerts) {
      await this.db.collection('_monitoring')
        .doc('alerts')
        .collection('active')
        .add({
          ...alert,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          resolved: false
        });
    }
    
    return alerts;
  }
}

module.exports = DataQualityMonitor;
`;
  
  const scriptPath = 'monitoring/data-quality-monitor.js';
  ensureDirectoryExists(path.dirname(scriptPath));
  fs.writeFileSync(scriptPath, dataQualityScript);
  
  console.log(`✅ Data quality monitoring script created at ${scriptPath}`);
}

async function setupAlertingRules() {
  console.log('🚨 Setting up alerting rules...');
  
  const alertingConfig = {
    rules: [
      {
        name: 'High Error Rate',
        condition: 'error_rate > 5%',
        severity: 'high',
        cooldown: 300, // 5 minutes
        notifications: ['email', 'slack']
      },
      {
        name: 'High Latency',
        condition: 'avg_response_time > 2000ms',
        severity: 'medium',
        cooldown: 600, // 10 minutes
        notifications: ['email']
      },
      {
        name: 'Low Data Quality',
        condition: 'data_quality_score < 80%',
        severity: 'medium',
        cooldown: 1800, // 30 minutes
        notifications: ['email']
      },
      {
        name: 'High Bot Traffic',
        condition: 'bot_traffic_percentage > 20%',
        severity: 'low',
        cooldown: 3600, // 1 hour
        notifications: ['email']
      },
      {
        name: 'Database Connection Issues',
        condition: 'db_connection_errors > 10',
        severity: 'critical',
        cooldown: 60, // 1 minute
        notifications: ['email', 'slack', 'sms']
      }
    ],
    notifications: {
      email: {
        enabled: true,
        recipients: [ADMIN_EMAIL],
        template: 'alert-email-template'
      },
      slack: {
        enabled: !!SLACK_WEBHOOK,
        webhook: SLACK_WEBHOOK,
        channel: '#alerts'
      },
      sms: {
        enabled: false,
        service: 'twilio',
        numbers: []
      }
    }
  };
  
  const configPath = 'monitoring/alerting-rules.json';
  ensureDirectoryExists(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(alertingConfig, null, 2));
  
  console.log(`✅ Alerting rules configuration saved to ${configPath}`);
}

async function createHealthChecks() {
  console.log('🏥 Creating health check endpoints...');
  
  const healthCheckScript = `
const admin = require('firebase-admin');

class HealthChecker {
  constructor() {
    this.db = admin.firestore();
    this.checks = new Map();
  }

  async runAllChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: {}
    };

    // Database connectivity
    results.checks.database = await this.checkDatabase();
    
    // Analytics collections
    results.checks.analytics_collections = await this.checkAnalyticsCollections();
    
    // Indexes status
    results.checks.indexes = await this.checkIndexes();
    
    // Data quality
    results.checks.data_quality = await this.checkDataQuality();
    
    // Performance metrics
    results.checks.performance = await this.checkPerformance();

    // Determine overall health
    const failedChecks = Object.values(results.checks).filter(check => check.status !== 'healthy');
    if (failedChecks.length > 0) {
      results.overall = failedChecks.some(check => check.severity === 'critical') ? 'critical' : 'degraded';
    }

    // Store health check results
    await this.db.collection('_monitoring').doc('health_checks').set(results);

    return results;
  }

  async checkDatabase() {
    try {
      const testDoc = await this.db.collection('_health').doc('test').get();
      return {
        status: 'healthy',
        message: 'Database connection successful',
        responseTime: Date.now() - testDoc.readTime
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        severity: 'critical',
        message: \`Database connection failed: \${error.message}\`
      };
    }
  }

  async checkAnalyticsCollections() {
    const collections = ['analytics_events', 'user_journeys', 'traffic_sources'];
    const results = {};

    for (const collection of collections) {
      try {
        const snapshot = await this.db.collection(collection).limit(1).get();
        results[collection] = {
          status: 'healthy',
          documentCount: snapshot.size
        };
      } catch (error) {
        results[collection] = {
          status: 'unhealthy',
          severity: 'high',
          message: error.message
        };
      }
    }

    const unhealthyCollections = Object.values(results).filter(r => r.status !== 'healthy');
    
    return {
      status: unhealthyCollections.length === 0 ? 'healthy' : 'degraded',
      collections: results,
      message: \`\${collections.length - unhealthyCollections.length}/\${collections.length} collections healthy\`
    };
  }

  async checkIndexes() {
    // This would require Firebase Admin SDK extensions or CLI integration
    return {
      status: 'healthy',
      message: 'Index status check not implemented'
    };
  }

  async checkDataQuality() {
    try {
      const qualityDoc = await this.db.collection('_monitoring')
        .doc('data_quality')
        .collection('analytics_events')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (qualityDoc.empty) {
        return {
          status: 'unknown',
          message: 'No data quality metrics available'
        };
      }

      const latestQuality = qualityDoc.docs[0].data();
      const score = latestQuality.overallScore || 0;

      return {
        status: score >= 80 ? 'healthy' : score >= 60 ? 'degraded' : 'unhealthy',
        score: score,
        message: \`Data quality score: \${score.toFixed(1)}%\`
      };
    } catch (error) {
      return {
        status: 'unknown',
        message: \`Failed to check data quality: \${error.message}\`
      };
    }
  }

  async checkPerformance() {
    try {
      const performanceDoc = await this.db.collection('_monitoring')
        .doc('performance')
        .collection('queries')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      if (performanceDoc.empty) {
        return {
          status: 'unknown',
          message: 'No performance metrics available'
        };
      }

      const queries = performanceDoc.docs.map(doc => doc.data());
      const avgDuration = queries.reduce((sum, q) => sum + q.duration, 0) / queries.length;

      return {
        status: avgDuration < 1000 ? 'healthy' : avgDuration < 3000 ? 'degraded' : 'unhealthy',
        averageQueryTime: avgDuration,
        message: \`Average query time: \${avgDuration.toFixed(0)}ms\`
      };
    } catch (error) {
      return {
        status: 'unknown',
        message: \`Failed to check performance: \${error.message}\`
      };
    }
  }
}

module.exports = HealthChecker;
`;
  
  const scriptPath = 'monitoring/health-checker.js';
  ensureDirectoryExists(path.dirname(scriptPath));
  fs.writeFileSync(scriptPath, healthCheckScript);
  
  console.log(`✅ Health checker script created at ${scriptPath}`);
}

async function setupAutomatedReports() {
  console.log('📊 Setting up automated reports...');
  
  const reportConfig = {
    schedules: [
      {
        name: 'Daily Analytics Summary',
        frequency: 'daily',
        time: '09:00',
        timezone: 'UTC',
        recipients: [ADMIN_EMAIL],
        format: 'email',
        template: 'daily-summary'
      },
      {
        name: 'Weekly Performance Report',
        frequency: 'weekly',
        day: 'monday',
        time: '10:00',
        timezone: 'UTC',
        recipients: [ADMIN_EMAIL],
        format: 'pdf',
        template: 'weekly-performance'
      },
      {
        name: 'Monthly Analytics Report',
        frequency: 'monthly',
        day: 1,
        time: '08:00',
        timezone: 'UTC',
        recipients: [ADMIN_EMAIL],
        format: 'dashboard',
        template: 'monthly-analytics'
      }
    ],
    templates: {
      'daily-summary': {
        sections: ['overview', 'traffic', 'conversions', 'alerts'],
        charts: ['traffic-trend', 'conversion-funnel']
      },
      'weekly-performance': {
        sections: ['performance', 'data-quality', 'user-journeys'],
        charts: ['performance-trend', 'quality-score', 'journey-analysis']
      },
      'monthly-analytics': {
        sections: ['comprehensive-overview', 'insights', 'recommendations'],
        charts: ['all-metrics', 'comparative-analysis']
      }
    }
  };
  
  const configPath = 'monitoring/automated-reports.json';
  ensureDirectoryExists(path.dirname(configPath));
  fs.writeFileSync(configPath, JSON.stringify(reportConfig, null, 2));
  
  console.log(`✅ Automated reports configuration saved to ${configPath}`);
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Run the monitoring setup
main();

module.exports = {
  setupFirebaseMonitoring,
  setupPerformanceMonitoring,
  setupDataQualityMonitoring,
  setupAlertingRules
};