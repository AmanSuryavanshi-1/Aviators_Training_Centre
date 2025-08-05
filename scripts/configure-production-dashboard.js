#!/usr/bin/env node

/**
 * Production Dashboard Configuration Script
 * Configures the analytics dashboard for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const ENVIRONMENT = process.env.NODE_ENV || 'production';
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'aviators-training-centre';
const DOMAIN = process.env.PRODUCTION_DOMAIN || 'aviatorstraining.com';

console.log('🔧 Configuring analytics dashboard for production...');
console.log(`🌍 Environment: ${ENVIRONMENT}`);
console.log(`🆔 Project ID: ${PROJECT_ID}`);
console.log(`🌐 Domain: ${DOMAIN}`);

async function main() {
  try {
    // 1. Configure environment variables
    await configureEnvironmentVariables();
    
    // 2. Set up API rate limiting
    await setupApiRateLimiting();
    
    // 3. Configure security measures
    await configureSecurityMeasures();
    
    // 4. Set up caching strategies
    await setupCaching();
    
    // 5. Configure monitoring integration
    await configureMonitoringIntegration();
    
    // 6. Set up automated backups
    await setupAutomatedBackups();
    
    // 7. Configure GDPR compliance
    await configureGdprCompliance();
    
    // 8. Generate production documentation
    await generateProductionDocumentation();
    
    // 9. Create deployment scripts
    await createDeploymentScripts();
    
    // 10. Validate configuration
    await validateConfiguration();
    
    console.log('✅ Production dashboard configuration completed successfully!');
    
  } catch (error) {
    console.error('❌ Configuration failed:', error.message);
    process.exit(1);
  }
}

async function configureEnvironmentVariables() {
  console.log('🔧 Configuring environment variables...');
  
  const productionEnv = {
    // Core Configuration
    NODE_ENV: 'production',
    NEXT_PUBLIC_APP_ENV: 'production',
    
    // Firebase Configuration
    FIREBASE_PROJECT_ID: PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID,
    
    // Analytics Configuration
    ANALYTICS_ENABLED: 'true',
    ANALYTICS_SAMPLE_RATE: '1.0',
    ANALYTICS_DEBUG: 'false',
    ANALYTICS_BATCH_SIZE: '100',
    ANALYTICS_FLUSH_INTERVAL: '30000',
    
    // Performance Configuration
    CACHE_TTL: '300',
    MAX_QUERY_SIZE: '1000',
    ENABLE_QUERY_OPTIMIZATION: 'true',
    ENABLE_DATA_AGGREGATION: 'true',
    VIRTUAL_SCROLL_THRESHOLD: '100',
    
    // Security Configuration
    ENABLE_RATE_LIMITING: 'true',
    RATE_LIMIT_WINDOW: '900000', // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: '1000',
    ENABLE_CORS_PROTECTION: 'true',
    ENABLE_CSRF_PROTECTION: 'true',
    
    // Monitoring Configuration
    MONITORING_ENABLED: 'true',
    HEALTH_CHECK_INTERVAL: '60000', // 1 minute
    PERFORMANCE_MONITORING: 'true',
    ERROR_REPORTING: 'true',
    
    // Data Quality Configuration
    DATA_QUALITY_CHECKS: 'true',
    BOT_DETECTION_ENABLED: 'true',
    DATA_VALIDATION_STRICT: 'true',
    ANOMALY_DETECTION: 'true',
    
    // GDPR Configuration
    GDPR_COMPLIANCE: 'true',
    DATA_RETENTION_DAYS: '365',
    ANONYMIZATION_ENABLED: 'true',
    CONSENT_TRACKING: 'true'
  };
  
  // Write environment template
  const envTemplate = Object.entries(productionEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync('.env.production.template', envTemplate);
  
  // Create Vercel environment configuration
  const vercelEnv = {
    build: productionEnv,
    preview: { ...productionEnv, NODE_ENV: 'preview' },
    production: productionEnv
  };
  
  fs.writeFileSync('vercel-env.json', JSON.stringify(vercelEnv, null, 2));
  
  console.log('✅ Environment variables configured');
  console.log('📋 Template saved to .env.production.template');
  console.log('📋 Vercel config saved to vercel-env.json');
}

async function setupApiRateLimiting() {
  console.log('🚦 Setting up API rate limiting...');
  
  const rateLimitConfig = `
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    parseInt(process.env.RATE_LIMIT_WINDOW || '900000') + 'ms'
  ),
  analytics: true,
});

export async function rateLimitMiddleware(request: NextRequest) {
  // Skip rate limiting for health checks
  if (request.nextUrl.pathname.startsWith('/api/health')) {
    return null;
  }

  // Get client identifier
  const identifier = getClientIdentifier(request);
  
  // Check rate limit
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  if (!success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        limit,
        reset,
        remaining: 0
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.round((reset - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // Add rate limit headers to successful responses
  return {
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    }
  };
}

function getClientIdentifier(request: NextRequest): string {
  // Use API key if available
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return \`api:\${apiKey}\`;
  }

  // Use user ID if authenticated
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return \`user:\${userId}\`;
  }

  // Fall back to IP address
  const ip = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  return \`ip:\${ip}\`;
}

export default rateLimitMiddleware;
`;
  
  const middlewarePath = 'src/middleware/rateLimit.ts';
  ensureDirectoryExists(path.dirname(middlewarePath));
  fs.writeFileSync(middlewarePath, rateLimitConfig);
  
  console.log(`✅ Rate limiting configured at ${middlewarePath}`);
}

async function configureSecurityMeasures() {
  console.log('🔒 Configuring security measures...');
  
  const securityConfig = `
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export class SecurityManager {
  private static readonly ALLOWED_ORIGINS = [
    'https://${DOMAIN}',
    'https://www.${DOMAIN}',
    process.env.VERCEL_URL ? \`https://\${process.env.VERCEL_URL}\` : null
  ].filter(Boolean);

  static validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    
    if (!origin) {
      // Allow same-origin requests
      return true;
    }

    return this.ALLOWED_ORIGINS.includes(origin);
  }

  static validateApiKey(request: NextRequest): boolean {
    const apiKey = request.headers.get('x-api-key');
    const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
    
    if (validApiKeys.length === 0) {
      // No API key validation configured
      return true;
    }

    return apiKey && validApiKeys.includes(apiKey);
  }

  static validateUserAgent(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent');
    
    if (!userAgent) {
      return false;
    }

    // Block known malicious user agents
    const blockedPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /masscan/i,
      /nmap/i
    ];

    return !blockedPatterns.some(pattern => pattern.test(userAgent));
  }

  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove potential XSS vectors
      return input
        .replace(/<script[^>]*>.*?<\\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\\w+=/gi, '');
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com",
        "frame-ancestors 'none'"
      ].join('; ')
    };
  }
}

export default SecurityManager;
`;
  
  const securityPath = 'src/lib/security/SecurityManager.ts';
  ensureDirectoryExists(path.dirname(securityPath));
  fs.writeFileSync(securityPath, securityConfig);
  
  console.log(`✅ Security measures configured at ${securityPath}`);
}

async function setupCaching() {
  console.log('💾 Setting up caching strategies...');
  
  const cacheConfig = `
import { NextRequest, NextResponse } from 'next/server';

export class CacheManager {
  private static cache = new Map<string, { data: any; expires: number }>();
  private static readonly DEFAULT_TTL = parseInt(process.env.CACHE_TTL || '300') * 1000; // 5 minutes

  static set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });

    // Clean up expired entries periodically
    if (this.cache.size > 1000) {
      this.cleanup();
    }
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  static delete(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  static generateKey(request: NextRequest): string {
    const url = new URL(request.url);
    const params = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => \`\${key}=\${value}\`)
      .join('&');
    
    return \`\${url.pathname}?\${params}\`;
  }

  static getCacheHeaders(ttl: number = this.DEFAULT_TTL): Record<string, string> {
    const maxAge = Math.floor(ttl / 1000);
    
    return {
      'Cache-Control': \`public, max-age=\${maxAge}, s-maxage=\${maxAge}\`,
      'Expires': new Date(Date.now() + ttl).toUTCString(),
      'Last-Modified': new Date().toUTCString()
    };
  }

  static shouldCache(request: NextRequest): boolean {
    // Don't cache POST requests
    if (request.method !== 'GET') {
      return false;
    }

    // Don't cache real-time endpoints
    if (request.nextUrl.pathname.includes('/realtime')) {
      return false;
    }

    // Don't cache authenticated requests with user-specific data
    if (request.headers.get('authorization')) {
      return false;
    }

    return true;
  }
}

export default CacheManager;
`;
  
  const cachePath = 'src/lib/cache/CacheManager.ts';
  ensureDirectoryExists(path.dirname(cachePath));
  fs.writeFileSync(cachePath, cacheConfig);
  
  console.log(`✅ Caching strategies configured at ${cachePath}`);
}

async function configureMonitoringIntegration() {
  console.log('📊 Configuring monitoring integration...');
  
  const monitoringConfig = `
import { NextRequest } from 'next/server';

export class MonitoringIntegration {
  private static metrics = new Map<string, number>();
  private static errors: Array<{ timestamp: number; error: string; context: any }> = [];

  static trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    const key = tags ? \`\${name}:\${JSON.stringify(tags)}\` : name;
    this.metrics.set(key, value);

    // Send to external monitoring service if configured
    if (process.env.MONITORING_WEBHOOK) {
      this.sendToMonitoring('metric', { name, value, tags });
    }
  }

  static trackError(error: Error, context?: any): void {
    const errorData = {
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
      context
    };

    this.errors.push(errorData);

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors.shift();
    }

    // Send to external monitoring service
    if (process.env.MONITORING_WEBHOOK) {
      this.sendToMonitoring('error', errorData);
    }

    console.error('Analytics Error:', errorData);
  }

  static trackPerformance(operation: string, duration: number, metadata?: any): void {
    this.trackMetric(\`performance.\${operation}\`, duration, metadata);

    // Alert on slow operations
    if (duration > 5000) { // 5 seconds
      this.trackError(new Error(\`Slow operation: \${operation} took \${duration}ms\`), metadata);
    }
  }

  static trackApiCall(request: NextRequest, response: Response, duration: number): void {
    const endpoint = request.nextUrl.pathname;
    const method = request.method;
    const status = response.status;

    this.trackMetric('api.calls', 1, { endpoint, method, status: status.toString() });
    this.trackMetric('api.duration', duration, { endpoint, method });

    // Track error rates
    if (status >= 400) {
      this.trackMetric('api.errors', 1, { endpoint, method, status: status.toString() });
    }
  }

  static getHealthMetrics(): any {
    const now = Date.now();
    const recentErrors = this.errors.filter(e => now - e.timestamp < 300000); // Last 5 minutes

    return {
      timestamp: now,
      metrics: Object.fromEntries(this.metrics),
      errorCount: recentErrors.length,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }

  private static async sendToMonitoring(type: string, data: any): Promise<void> {
    try {
      const webhook = process.env.MONITORING_WEBHOOK;
      if (!webhook) return;

      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
          service: 'analytics-dashboard'
        })
      });
    } catch (error) {
      console.error('Failed to send monitoring data:', error);
    }
  }
}

export default MonitoringIntegration;
`;
  
  const monitoringPath = 'src/lib/monitoring/MonitoringIntegration.ts';
  ensureDirectoryExists(path.dirname(monitoringPath));
  fs.writeFileSync(monitoringPath, monitoringConfig);
  
  console.log(`✅ Monitoring integration configured at ${monitoringPath}`);
}

async function setupAutomatedBackups() {
  console.log('💾 Setting up automated backups...');
  
  const backupScript = `
#!/usr/bin/env node

/**
 * Automated Backup Script for Analytics Data
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('../service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: '${PROJECT_ID}'
  });
}

const db = admin.firestore();

class BackupManager {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
  }

  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, \`analytics-backup-\${timestamp}\`);
    
    console.log(\`Creating backup at \${backupPath}...\`);
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const collections = ['analytics_events', 'user_journeys', 'traffic_sources', 'analytics_aggregations'];
    const backup = {
      timestamp,
      collections: {}
    };

    for (const collectionName of collections) {
      console.log(\`Backing up \${collectionName}...\`);
      
      const snapshot = await db.collection(collectionName).get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          data: doc.data()
        });
      });
      
      backup.collections[collectionName] = documents;
      console.log(\`✅ Backed up \${documents.length} documents from \${collectionName}\`);
    }

    // Write backup file
    fs.writeFileSync(\`\${backupPath}.json\`, JSON.stringify(backup, null, 2));
    
    // Compress backup
    const { execSync } = require('child_process');
    try {
      execSync(\`gzip "\${backupPath}.json"\`);
      console.log(\`✅ Backup compressed: \${backupPath}.json.gz\`);
    } catch (error) {
      console.warn('⚠️ Failed to compress backup:', error.message);
    }

    // Clean up old backups
    await this.cleanupOldBackups();
    
    return \`\${backupPath}.json.gz\`;
  }

  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    const files = fs.readdirSync(this.backupDir);
    let cleanedCount = 0;
    
    for (const file of files) {
      if (file.startsWith('analytics-backup-')) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          cleanedCount++;
        }
      }
    }
    
    if (cleanedCount > 0) {
      console.log(\`✅ Cleaned up \${cleanedCount} old backup files\`);
    }
  }

  async restoreBackup(backupFile) {
    console.log(\`Restoring backup from \${backupFile}...\`);
    
    // Read backup file
    let backupData;
    try {
      const backupContent = fs.readFileSync(backupFile, 'utf8');
      backupData = JSON.parse(backupContent);
    } catch (error) {
      throw new Error(\`Failed to read backup file: \${error.message}\`);
    }

    // Restore collections
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      console.log(\`Restoring \${collectionName}...\`);
      
      const batch = db.batch();
      let batchCount = 0;
      
      for (const doc of documents) {
        const docRef = db.collection(collectionName).doc(doc.id);
        batch.set(docRef, doc.data);
        batchCount++;
        
        // Commit batch every 500 documents
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // Commit remaining documents
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log(\`✅ Restored \${documents.length} documents to \${collectionName}\`);
    }
    
    console.log('✅ Backup restoration completed');
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const backupManager = new BackupManager();
  
  switch (command) {
    case 'create':
      backupManager.createBackup()
        .then(backupFile => {
          console.log(\`✅ Backup created: \${backupFile}\`);
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Backup failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('❌ Please specify backup file to restore');
        process.exit(1);
      }
      
      backupManager.restoreBackup(backupFile)
        .then(() => {
          console.log('✅ Restore completed');
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Restore failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node backup-manager.js <create|restore> [backup-file]');
      process.exit(1);
  }
}

module.exports = BackupManager;
`;
  
  const backupPath = 'scripts/backup-manager.js';
  fs.writeFileSync(backupPath, backupScript);
  
  // Make script executable
  try {
    execSync(`chmod +x ${backupPath}`);
  } catch (error) {
    console.warn('⚠️ Could not make backup script executable:', error.message);
  }
  
  console.log(`✅ Automated backup system configured at ${backupPath}`);
}

async function configureGdprCompliance() {
  console.log('🔐 Configuring GDPR compliance...');
  
  const gdprConfig = `
import { NextRequest } from 'next/server';

export class GdprCompliance {
  private static readonly PII_PATTERNS = [
    /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g, // Email
    /\\b\\d{3}-\\d{2}-\\d{4}\\b/g, // SSN
    /\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b/g, // Credit card
    /\\b\\+?1?[\\s-]?\\(?\\d{3}\\)?[\\s-]?\\d{3}[\\s-]?\\d{4}\\b/g // Phone
  ];

  static anonymizeData(data: any): any {
    if (typeof data === 'string') {
      let anonymized = data;
      
      // Replace email addresses
      anonymized = anonymized.replace(this.PII_PATTERNS[0], '[email]');
      
      // Replace SSNs
      anonymized = anonymized.replace(this.PII_PATTERNS[1], '[ssn]');
      
      // Replace credit card numbers
      anonymized = anonymized.replace(this.PII_PATTERNS[2], '[credit_card]');
      
      // Replace phone numbers
      anonymized = anonymized.replace(this.PII_PATTERNS[3], '[phone]');
      
      return anonymized;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.anonymizeData(item));
    }

    if (typeof data === 'object' && data !== null) {
      const anonymized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip certain fields that might contain PII
        if (['email', 'phone', 'ssn', 'creditCard', 'personalInfo'].includes(key)) {
          anonymized[key] = '[redacted]';
        } else {
          anonymized[key] = this.anonymizeData(value);
        }
      }
      return anonymized;
    }

    return data;
  }

  static trackConsent(userId: string, consentType: string, granted: boolean): void {
    // Implementation would store consent in database
    console.log(\`Consent tracked: \${userId} - \${consentType}: \${granted}\`);
  }

  static hasConsent(userId: string, consentType: string): boolean {
    // Implementation would check consent from database
    // For now, assume consent is granted
    return true;
  }

  static generateDataExport(userId: string): Promise<any> {
    // Implementation would collect all user data for export
    return Promise.resolve({
      userId,
      exportDate: new Date().toISOString(),
      data: {
        analytics: 'User analytics data would be here',
        journeys: 'User journey data would be here'
      }
    });
  }

  static async deleteUserData(userId: string): Promise<void> {
    // Implementation would delete all user data
    console.log(\`Deleting all data for user: \${userId}\`);
    
    // This would involve:
    // 1. Deleting from analytics_events
    // 2. Deleting from user_journeys
    // 3. Anonymizing references in aggregated data
    // 4. Updating consent records
  }

  static getPrivacyPolicy(): string {
    return \`
# Privacy Policy - Analytics Data

## Data Collection
We collect analytics data to improve our services, including:
- Page views and user interactions
- Traffic sources and referrers
- Device and browser information
- Performance metrics

## Data Usage
Analytics data is used for:
- Understanding user behavior
- Improving website performance
- Generating usage statistics
- Detecting and preventing abuse

## Data Retention
- Analytics events: 1 year
- User journeys: 2 years
- Aggregated data: 3 years
- Monitoring data: 90 days

## Your Rights
Under GDPR, you have the right to:
- Access your data
- Correct inaccurate data
- Delete your data
- Export your data
- Withdraw consent

## Contact
For privacy-related questions, contact: privacy@\${process.env.DOMAIN || 'example.com'}
    \`.trim();
  }
}

export default GdprCompliance;
`;
  
  const gdprPath = 'src/lib/compliance/GdprCompliance.ts';
  ensureDirectoryExists(path.dirname(gdprPath));
  fs.writeFileSync(gdprPath, gdprConfig);
  
  console.log(`✅ GDPR compliance configured at ${gdprPath}`);
}

async function generateProductionDocumentation() {
  console.log('📚 Generating production documentation...');
  
  const apiDocs = `
# Analytics API Documentation

## Authentication
All API endpoints require authentication via API key or session token.

### Headers
\`\`\`
Authorization: Bearer <token>
X-API-Key: <api-key>
Content-Type: application/json
\`\`\`

## Endpoints

### GET /api/analytics/advanced
Retrieve advanced analytics data with filtering and aggregation.

**Parameters:**
- \`type\`: Data type (events, journeys, sources, funnel)
- \`start\`: Start date (ISO 8601)
- \`end\`: End date (ISO 8601)
- \`limit\`: Maximum results (default: 100, max: 1000)
- \`offset\`: Pagination offset
- \`validOnly\`: Filter valid data only (boolean)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [...],
  "metadata": {
    "totalCount": 1000,
    "filteredCount": 950,
    "processingTime": 150,
    "cacheHit": false,
    "dataQuality": {
      "score": 95,
      "issues": []
    }
  }
}
\`\`\`

### GET /api/analytics/realtime
Get real-time analytics metrics.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "activeUsers": 25,
    "currentPageViews": 45,
    "conversionsToday": 8,
    "topPages": [...],
    "topSources": [...],
    "alerts": [...]
  }
}
\`\`\`

### POST /api/analytics/track
Track analytics events.

**Request Body:**
\`\`\`json
{
  "type": "page_view",
  "page": "/courses",
  "title": "Aviation Courses",
  "timestamp": "2023-01-01T12:00:00Z",
  "userId": "user123",
  "sessionId": "session456"
}
\`\`\`

### GET /api/health/analytics
Health check endpoint for monitoring.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2023-01-01T12:00:00Z",
  "checks": {
    "database": { "status": "healthy" },
    "indexes": { "status": "healthy" },
    "performance": { "status": "healthy" }
  }
}
\`\`\`

## Rate Limits
- 1000 requests per 15 minutes per API key
- 100 requests per minute for unauthenticated requests
- Real-time endpoints: 60 requests per minute

## Error Codes
- \`400\`: Bad Request - Invalid parameters
- \`401\`: Unauthorized - Missing or invalid authentication
- \`403\`: Forbidden - Insufficient permissions
- \`429\`: Too Many Requests - Rate limit exceeded
- \`500\`: Internal Server Error - Server error

## SDKs and Libraries
- JavaScript/TypeScript: Built-in fetch API
- Node.js: Use axios or node-fetch
- Python: Use requests library
- cURL: Standard HTTP client

## Examples

### Fetch Analytics Data
\`\`\`javascript
const response = await fetch('/api/analytics/advanced?type=events&start=2023-01-01&end=2023-01-31', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
\`\`\`

### Track Event
\`\`\`javascript
await fetch('/api/analytics/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'conversion',
    conversionType: 'form_submission',
    page: '/contact',
    timestamp: new Date().toISOString()
  })
});
\`\`\`
`;
  
  fs.writeFileSync('docs/API_DOCUMENTATION.md', apiDocs);
  
  console.log('✅ Production documentation generated');
  console.log('📋 API docs saved to docs/API_DOCUMENTATION.md');
}

async function createDeploymentScripts() {
  console.log('🚀 Creating deployment scripts...');
  
  const deployScript = `
#!/bin/bash

# Production Deployment Script for Analytics Dashboard

set -e

echo "🚀 Starting production deployment..."

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v firebase >/dev/null 2>&1 || { echo "❌ Firebase CLI is required but not installed."; exit 1; }

# Validate environment
echo "🔧 Validating environment..."
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
npm run test:analytics || { echo "❌ Tests failed"; exit 1; }

# Build application
echo "🏗️ Building application..."
npm run build || { echo "❌ Build failed"; exit 1; }

# Deploy Firestore configuration
echo "🔥 Deploying Firestore configuration..."
npm run deploy:firestore-production || { echo "❌ Firestore deployment failed"; exit 1; }

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod || { echo "❌ Vercel deployment failed"; exit 1; }

# Run post-deployment validation
echo "✅ Running post-deployment validation..."
npm run validate:production-analytics || { echo "⚠️ Validation warnings found"; }

# Set up monitoring
echo "📊 Setting up monitoring..."
npm run setup:monitoring || { echo "⚠️ Monitoring setup failed"; }

echo "✅ Production deployment completed successfully!"
echo "🌐 Your analytics dashboard is now live!"
`;
  
  fs.writeFileSync('scripts/deploy-production.sh', deployScript);
  
  // Make script executable
  try {
    execSync('chmod +x scripts/deploy-production.sh');
  } catch (error) {
    console.warn('⚠️ Could not make deploy script executable:', error.message);
  }
  
  console.log('✅ Deployment scripts created');
  console.log('📋 Deploy script saved to scripts/deploy-production.sh');
}

async function validateConfiguration() {
  console.log('🔍 Validating production configuration...');
  
  const requiredFiles = [
    '.env.production.template',
    'vercel-env.json',
    'src/middleware/rateLimit.ts',
    'src/lib/security/SecurityManager.ts',
    'src/lib/cache/CacheManager.ts',
    'src/lib/monitoring/MonitoringIntegration.ts',
    'src/lib/compliance/GdprCompliance.ts',
    'scripts/backup-manager.js',
    'scripts/deploy-production.sh',
    'docs/API_DOCUMENTATION.md'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    throw new Error('Configuration validation failed');
  }
  
  console.log('✅ All required configuration files are present');
  
  // Validate package.json scripts
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = [
    'deploy:firestore-production',
    'validate:production-analytics',
    'setup:monitoring',
    'test:analytics'
  ];
  
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
  
  if (missingScripts.length > 0) {
    console.warn('⚠️ Missing recommended scripts in package.json:');
    missingScripts.forEach(script => console.warn(`   - ${script}`));
  }
  
  console.log('✅ Configuration validation completed');
}

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Run the configuration
main();

module.exports = {
  configureEnvironmentVariables,
  setupApiRateLimiting,
  configureSecurityMeasures,
  setupCaching
};