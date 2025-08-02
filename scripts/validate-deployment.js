#!/usr/bin/env node

/**
 * Production Deployment Validation Script
 * Validates that all required components are working in production
 */

const https = require('https');
const http = require('http');

// Configuration
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';
const TIMEOUT = 10000; // 10 seconds

// Test endpoints
const ENDPOINTS = [
  { path: '/', name: 'Homepage', critical: true },
  { path: '/login', name: 'Login Page', critical: true },
  { path: '/admin', name: 'Admin Dashboard (should redirect)', critical: true },
  { path: '/studio', name: 'Sanity Studio', critical: true },
  { path: '/api/studio/health', name: 'Studio Health Check', critical: true },
  { path: '/api/auth/login', name: 'Auth Login API', critical: true, method: 'POST' },
  { path: '/blog', name: 'Blog Page', critical: false },
];

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Deployment-Validator/1.0',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 * Test endpoint
 */
async function testEndpoint(endpoint) {
  const url = `${SITE_URL}${endpoint.path}`;
  const startTime = Date.now();
  
  try {
    const options = {
      method: endpoint.method || 'GET',
    };

    // Add test data for POST requests
    if (endpoint.method === 'POST' && endpoint.path === '/api/auth/login') {
      options.body = JSON.stringify({
        email: 'test@example.com',
        password: 'test123',
      });
      options.headers = {
        'Content-Type': 'application/json',
      };
    }

    const response = await makeRequest(url, options);
    const duration = Date.now() - startTime;
    
    // Determine if response is acceptable
    let status = 'PASS';
    let message = `${response.statusCode} (${duration}ms)`;
    
    // Check for expected status codes
    if (endpoint.path === '/admin' && response.statusCode === 302) {
      status = 'PASS';
      message = `${response.statusCode} - Redirect to login (${duration}ms)`;
    } else if (endpoint.path === '/api/auth/login' && response.statusCode === 401) {
      status = 'PASS';
      message = `${response.statusCode} - Auth validation working (${duration}ms)`;
    } else if (response.statusCode >= 200 && response.statusCode < 400) {
      status = 'PASS';
    } else if (response.statusCode >= 400 && response.statusCode < 500) {
      status = endpoint.critical ? 'FAIL' : 'WARN';
      message = `${response.statusCode} - Client error (${duration}ms)`;
    } else {
      status = 'FAIL';
      message = `${response.statusCode} - Server error (${duration}ms)`;
    }

    return {
      endpoint: endpoint.name,
      url,
      status,
      message,
      critical: endpoint.critical,
      duration,
      statusCode: response.statusCode,
    };

  } catch (error) {
    return {
      endpoint: endpoint.name,
      url,
      status: 'FAIL',
      message: error.message,
      critical: endpoint.critical,
      duration: Date.now() - startTime,
      error: true,
    };
  }
}

/**
 * Main validation function
 */
async function validateDeployment() {
  console.log('🚀 Starting Production Deployment Validation');
  console.log(`📍 Site URL: ${SITE_URL}`);
  console.log('─'.repeat(80));

  const results = [];
  let criticalFailures = 0;
  let warnings = 0;

  // Test all endpoints
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);

    // Print result
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    const criticalFlag = result.critical ? ' [CRITICAL]' : '';
    
    console.log(`${icon} ${result.endpoint}${criticalFlag}`);
    console.log(`   ${result.message}`);
    console.log(`   ${result.url}`);
    
    if (result.status === 'FAIL' && result.critical) {
      criticalFailures++;
    } else if (result.status === 'WARN') {
      warnings++;
    }
    
    console.log('');
  }

  // Summary
  console.log('─'.repeat(80));
  console.log('📊 VALIDATION SUMMARY');
  console.log('─'.repeat(80));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`🔥 Critical Failures: ${criticalFailures}`);

  // Environment check
  console.log('\n🔧 ENVIRONMENT CHECK');
  console.log('─'.repeat(40));
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`NEXT_PUBLIC_SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'not set'}`);
  console.log(`SANITY_PROJECT_ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'not set'}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'set' : 'not set'}`);
  console.log(`ADMIN_PASSWORD: ${process.env.ADMIN_PASSWORD ? 'set' : 'not set'}`);

  // Final result
  console.log('\n🎯 FINAL RESULT');
  console.log('─'.repeat(40));
  
  if (criticalFailures === 0) {
    console.log('🎉 DEPLOYMENT VALIDATION PASSED');
    console.log('✨ All critical systems are operational');
    if (warnings > 0) {
      console.log(`⚠️  Note: ${warnings} non-critical warnings detected`);
    }
    process.exit(0);
  } else {
    console.log('💥 DEPLOYMENT VALIDATION FAILED');
    console.log(`❌ ${criticalFailures} critical system(s) are not working`);
    console.log('🔧 Please fix critical issues before going live');
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validateDeployment().catch(error => {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  });
}

module.exports = { validateDeployment };