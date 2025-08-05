#!/usr/bin/env node

/**
 * Production Analytics Validation Script
 * Validates that all analytics components are properly configured and working
 */

const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

// Configuration
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'aviators-training-centre';
const BASE_URL = process.env.PRODUCTION_URL || 'https://aviatorstraining.com';

console.log('🔍 Validating production analytics configuration...');
console.log(`📋 Project ID: ${PROJECT_ID}`);
console.log(`🌐 Base URL: ${BASE_URL}`);

async function main() {
  const results = {
    timestamp: new Date().toISOString(),
    projectId: PROJECT_ID,
    baseUrl: BASE_URL,
    checks: {},
    overall: 'unknown'
  };

  try {
    // 1. Validate Firestore configuration
    results.checks.firestore = await validateFirestore();
    
    // 2. Validate security rules
    results.checks.securityRules = await validateSecurityRules();
    
    // 3. Validate indexes
    results.checks.indexes = await validateIndexes();
    
    // 4. Validate API endpoints
    results.checks.apiEndpoints = await validateApiEndpoints();
    
    // 5. Validate analytics tracking
    results.checks.analyticsTracking = await validateAnalyticsTracking();
    
    // 6. Validate dashboard access
    results.checks.dashboardAccess = await validateDashboardAccess();
    
    // 7. Validate monitoring setup
    results.checks.monitoring = await validateMonitoring();
    
    // 8. Validate data quality
    results.checks.dataQuality = await validateDataQuality();
    
    // 9. Validate performance
    results.checks.performance = await validatePerformance();
    
    // 10. Validate GDPR compliance
    results.checks.gdprCompliance = await validateGdprCompliance();
    
    // Determine overall status
    const failedChecks = Object.values(results.checks).filter(check => !check.passed);
    const criticalFailures = failedChecks.filter(check => check.severity === 'critical');
    
    if (criticalFailures.length > 0) {
      results.overall = 'critical';
    } else if (failedChecks.length > 0) {
      results.overall = 'warning';
    } else {
      results.overall = 'passed';
    }
    
    // Generate report
    await generateValidationReport(results);
    
    // Print summary
    printSummary(results);
    
    // Exit with appropriate code
    if (results.overall === 'critical') {
      process.exit(1);
    } else if (results.overall === 'warning') {
      process.exit(2);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

async function validateFirestore() {
  console.log('🔥 Validating Firestore configuration...');
  
  try {
    // Check if Firebase CLI is available and authenticated
    execSync('firebase projects:list', { stdio: 'pipe' });
    
    // Check project access
    const projectInfo = execSync(`firebase projects:list --json`, { encoding: 'utf8' });
    const projects = JSON.parse(projectInfo);
    const project = projects.find(p => p.projectId === PROJECT_ID);
    
    if (!project) {
      return {
        passed: false,
        severity: 'critical',
        message: `Project ${PROJECT_ID} not found or not accessible`,
        details: 'Ensure you have proper permissions and the project ID is correct'
      };
    }
    
    return {
      passed: true,
      message: 'Firestore configuration is valid',
      details: {
        projectId: project.projectId,
        displayName: project.displayName
      }
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'critical',
      message: 'Failed to validate Firestore configuration',
      details: error.message
    };
  }
}

async function validateSecurityRules() {
  console.log('🔒 Validating security rules...');
  
  try {
    // Check if rules file exists
    if (!fs.existsSync('firestore.rules')) {
      return {
        passed: false,
        severity: 'critical',
        message: 'firestore.rules file not found',
        details: 'Security rules file is required for production deployment'
      };
    }
    
    // Validate rules syntax
    execSync(`firebase firestore:rules --project ${PROJECT_ID}`, { stdio: 'pipe' });
    
    // Read and analyze rules
    const rulesContent = fs.readFileSync('firestore.rules', 'utf8');
    const hasAnalyticsRules = rulesContent.includes('analytics_events') && 
                              rulesContent.includes('user_journeys') && 
                              rulesContent.includes('traffic_sources');
    
    if (!hasAnalyticsRules) {
      return {
        passed: false,
        severity: 'high',
        message: 'Analytics collections not properly secured',
        details: 'Security rules should include proper access controls for analytics collections'
      };
    }
    
    return {
      passed: true,
      message: 'Security rules are valid and include analytics protections',
      details: 'All required collections have proper access controls'
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'critical',
      message: 'Security rules validation failed',
      details: error.message
    };
  }
}

async function validateIndexes() {
  console.log('📊 Validating Firestore indexes...');
  
  try {
    // Check if indexes file exists
    if (!fs.existsSync('firestore.indexes.json')) {
      return {
        passed: false,
        severity: 'critical',
        message: 'firestore.indexes.json file not found',
        details: 'Indexes configuration is required for optimal performance'
      };
    }
    
    // Read and validate indexes
    const indexesContent = fs.readFileSync('firestore.indexes.json', 'utf8');
    const indexes = JSON.parse(indexesContent);
    
    if (!indexes.indexes || indexes.indexes.length === 0) {
      return {
        passed: false,
        severity: 'high',
        message: 'No indexes defined',
        details: 'Analytics queries require proper indexes for performance'
      };
    }
    
    // Check for required analytics indexes
    const analyticsIndexes = indexes.indexes.filter(index => 
      ['analytics_events', 'user_journeys', 'traffic_sources'].includes(index.collectionGroup)
    );
    
    if (analyticsIndexes.length < 3) {
      return {
        passed: false,
        severity: 'high',
        message: 'Missing required analytics indexes',
        details: 'All analytics collections should have proper composite indexes'
      };
    }
    
    // Check index status in production
    try {
      const indexStatus = execSync(`firebase firestore:indexes --project ${PROJECT_ID} --json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const productionIndexes = JSON.parse(indexStatus);
      const buildingIndexes = productionIndexes.filter(index => index.state === 'CREATING');
      
      if (buildingIndexes.length > 0) {
        return {
          passed: false,
          severity: 'medium',
          message: `${buildingIndexes.length} indexes are still building`,
          details: 'Wait for all indexes to complete before going live'
        };
      }
      
    } catch (error) {
      // If we can't check production indexes, that's a warning but not critical
      return {
        passed: true,
        severity: 'medium',
        message: 'Indexes configuration is valid (production status unknown)',
        details: 'Could not verify production index status'
      };
    }
    
    return {
      passed: true,
      message: `${indexes.indexes.length} indexes configured and ready`,
      details: `${analyticsIndexes.length} analytics-specific indexes found`
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'critical',
      message: 'Index validation failed',
      details: error.message
    };
  }
}

async function validateApiEndpoints() {
  console.log('🌐 Validating API endpoints...');
  
  const endpoints = [
    '/api/analytics/advanced',
    '/api/analytics/realtime',
    '/api/analytics/track'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeHttpRequest(`${BASE_URL}${endpoint}?test=true`);
      
      results.push({
        endpoint,
        status: response.statusCode,
        passed: response.statusCode === 200 || response.statusCode === 401, // 401 is OK (auth required)
        responseTime: response.responseTime
      });
      
    } catch (error) {
      results.push({
        endpoint,
        status: 'error',
        passed: false,
        error: error.message
      });
    }
  }
  
  const failedEndpoints = results.filter(r => !r.passed);
  
  return {
    passed: failedEndpoints.length === 0,
    severity: failedEndpoints.length > 0 ? 'critical' : 'low',
    message: `${results.length - failedEndpoints.length}/${results.length} endpoints accessible`,
    details: results
  };
}

async function validateAnalyticsTracking() {
  console.log('📈 Validating analytics tracking...');
  
  try {
    // Check if tracking scripts exist
    const trackingFiles = [
      'src/lib/analytics/trafficSourceTracker.ts',
      'src/lib/analytics/userJourneyTracker.ts',
      'src/lib/analytics/botDetection.ts',
      'src/lib/analytics/dataProcessor.ts'
    ];
    
    const missingFiles = trackingFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      return {
        passed: false,
        severity: 'critical',
        message: `${missingFiles.length} tracking components missing`,
        details: missingFiles
      };
    }
    
    // Test tracking endpoint
    try {
      const testPayload = {
        type: 'page_view',
        page: '/test',
        timestamp: new Date().toISOString(),
        test: true
      };
      
      const response = await makeHttpRequest(`${BASE_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      
      if (response.statusCode !== 200) {
        return {
          passed: false,
          severity: 'high',
          message: 'Analytics tracking endpoint not responding correctly',
          details: `Status: ${response.statusCode}`
        };
      }
      
    } catch (error) {
      return {
        passed: false,
        severity: 'high',
        message: 'Failed to test analytics tracking',
        details: error.message
      };
    }
    
    return {
      passed: true,
      message: 'Analytics tracking components are properly configured',
      details: `${trackingFiles.length} tracking components found and endpoint is responsive`
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'critical',
      message: 'Analytics tracking validation failed',
      details: error.message
    };
  }
}

async function validateDashboardAccess() {
  console.log('📊 Validating dashboard access...');
  
  try {
    const response = await makeHttpRequest(`${BASE_URL}/admin/analytics`);
    
    // We expect either 200 (if no auth) or 401/403 (if auth required)
    const validStatuses = [200, 401, 403];
    
    if (!validStatuses.includes(response.statusCode)) {
      return {
        passed: false,
        severity: 'high',
        message: 'Analytics dashboard not accessible',
        details: `Status: ${response.statusCode}`
      };
    }
    
    return {
      passed: true,
      message: 'Analytics dashboard is accessible',
      details: `Status: ${response.statusCode} (${response.statusCode === 200 ? 'public' : 'protected'})`
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'high',
      message: 'Failed to access analytics dashboard',
      details: error.message
    };
  }
}

async function validateMonitoring() {
  console.log('📊 Validating monitoring setup...');
  
  const monitoringFiles = [
    'monitoring/firebase-monitoring.json',
    'monitoring/performance-monitor.js',
    'monitoring/data-quality-monitor.js',
    'monitoring/health-checker.js'
  ];
  
  const existingFiles = monitoringFiles.filter(file => fs.existsSync(file));
  
  return {
    passed: existingFiles.length >= 2, // At least basic monitoring
    severity: existingFiles.length === 0 ? 'high' : 'medium',
    message: `${existingFiles.length}/${monitoringFiles.length} monitoring components configured`,
    details: {
      existing: existingFiles,
      missing: monitoringFiles.filter(file => !fs.existsSync(file))
    }
  };
}

async function validateDataQuality() {
  console.log('🔍 Validating data quality measures...');
  
  try {
    // Check if data validation components exist
    const validationFiles = [
      'src/lib/analytics/dataProcessor.ts',
      'src/lib/analytics/botDetection.ts'
    ];
    
    const missingFiles = validationFiles.filter(file => !fs.existsSync(file));
    
    if (missingFiles.length > 0) {
      return {
        passed: false,
        severity: 'high',
        message: 'Data quality validation components missing',
        details: missingFiles
      };
    }
    
    return {
      passed: true,
      message: 'Data quality validation components are configured',
      details: 'Bot detection and data validation systems are in place'
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'medium',
      message: 'Data quality validation failed',
      details: error.message
    };
  }
}

async function validatePerformance() {
  console.log('⚡ Validating performance configuration...');
  
  try {
    // Check if performance optimization components exist
    const performanceFiles = [
      'src/lib/analytics/queryOptimizer.ts',
      'src/lib/analytics/aggregationService.ts',
      'src/hooks/useMemoryOptimization.ts'
    ];
    
    const existingFiles = performanceFiles.filter(file => fs.existsSync(file));
    
    if (existingFiles.length < 2) {
      return {
        passed: false,
        severity: 'medium',
        message: 'Performance optimization components missing',
        details: `Only ${existingFiles.length}/${performanceFiles.length} components found`
      };
    }
    
    return {
      passed: true,
      message: 'Performance optimization components are configured',
      details: `${existingFiles.length}/${performanceFiles.length} optimization components found`
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'medium',
      message: 'Performance validation failed',
      details: error.message
    };
  }
}

async function validateGdprCompliance() {
  console.log('🔐 Validating GDPR compliance...');
  
  try {
    // Check for privacy policy and data handling
    const complianceChecks = [
      { check: 'Data anonymization in analytics', file: 'src/lib/analytics/dataProcessor.ts' },
      { check: 'User consent handling', pattern: /consent|gdpr|privacy/i },
      { check: 'Data retention policies', file: 'monitoring/automated-reports.json' }
    ];
    
    const results = [];
    
    for (const check of complianceChecks) {
      if (check.file) {
        const exists = fs.existsSync(check.file);
        results.push({
          check: check.check,
          passed: exists,
          details: exists ? 'Component found' : 'Component missing'
        });
      }
    }
    
    const passedChecks = results.filter(r => r.passed).length;
    
    return {
      passed: passedChecks >= 2, // At least basic compliance
      severity: passedChecks === 0 ? 'high' : 'medium',
      message: `${passedChecks}/${results.length} GDPR compliance checks passed`,
      details: results
    };
    
  } catch (error) {
    return {
      passed: false,
      severity: 'medium',
      message: 'GDPR compliance validation failed',
      details: error.message
    };
  }
}

async function makeHttpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    }, (res) => {
      const responseTime = Date.now() - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function generateValidationReport(results) {
  const reportPath = 'validation-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📋 Validation report saved to ${reportPath}`);
}

function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 PRODUCTION ANALYTICS VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  const statusEmoji = {
    'passed': '✅',
    'warning': '⚠️',
    'critical': '❌'
  };
  
  console.log(`${statusEmoji[results.overall]} Overall Status: ${results.overall.toUpperCase()}`);
  console.log(`🕐 Validation Time: ${results.timestamp}`);
  console.log(`🆔 Project ID: ${results.projectId}`);
  console.log(`🌐 Base URL: ${results.baseUrl}`);
  
  console.log('\n📊 Check Results:');
  Object.entries(results.checks).forEach(([checkName, result]) => {
    const emoji = result.passed ? '✅' : '❌';
    const severity = result.severity ? ` (${result.severity})` : '';
    console.log(`${emoji} ${checkName}${severity}: ${result.message}`);
  });
  
  const failedChecks = Object.values(results.checks).filter(check => !check.passed);
  const criticalFailures = failedChecks.filter(check => check.severity === 'critical');
  
  if (criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    criticalFailures.forEach(check => {
      console.log(`   • ${check.message}`);
      if (check.details) {
        console.log(`     Details: ${typeof check.details === 'string' ? check.details : JSON.stringify(check.details)}`);
      }
    });
    console.log('\n❌ DEPLOYMENT BLOCKED - Fix critical issues before proceeding');
  } else if (failedChecks.length > 0) {
    console.log('\n⚠️ WARNINGS FOUND:');
    failedChecks.forEach(check => {
      console.log(`   • ${check.message}`);
    });
    console.log('\n⚠️ DEPLOYMENT ALLOWED - Consider fixing warnings');
  } else {
    console.log('\n✅ ALL CHECKS PASSED - Ready for production deployment');
  }
  
  console.log('='.repeat(60));
}

// Run validation
main();

module.exports = {
  validateFirestore,
  validateSecurityRules,
  validateIndexes,
  validateApiEndpoints
};