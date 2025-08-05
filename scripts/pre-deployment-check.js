#!/usr/bin/env node

/**
 * Pre-Deployment Readiness Check
 * 
 * This script verifies all critical functionality before deployment
 * to ensure no existing features are broken
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Critical endpoints that must work in production
const CRITICAL_ENDPOINTS = [
  {
    name: 'Homepage',
    url: `${BASE_URL}/`,
    method: 'GET',
    critical: true
  },
  {
    name: 'Contact API',
    url: `${BASE_URL}/api/contact`,
    method: 'POST',
    body: {
      name: 'Deployment Test',
      email: 'test@aviatorstrainingcentre.in',
      subject: 'Pre-deployment Test',
      message: 'Testing contact form before deployment'
    },
    critical: true
  },
  {
    name: 'Analytics Real-time',
    url: `${BASE_URL}/api/analytics/realtime?type=metrics`,
    method: 'GET',
    critical: false
  },
  {
    name: 'Admin Analytics Dashboard',
    url: `${BASE_URL}/admin/analytics`,
    method: 'GET',
    critical: false
  },
  {
    name: 'Blog API',
    url: `${BASE_URL}/api/blog`,
    method: 'GET',
    critical: true
  },
  {
    name: 'Sanity Studio',
    url: `${BASE_URL}/studio`,
    method: 'GET',
    critical: true
  },
  {
    name: 'Health Check',
    url: `${BASE_URL}/api/health`,
    method: 'GET',
    critical: false
  }
];

async function testEndpoint(endpoint) {
  console.log(`🧪 Testing ${endpoint.name}...`);
  
  try {
    const options = {
      method: endpoint.method,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pre-Deployment-Check/1.0'
      }
    };
    
    if (endpoint.body) {
      options.body = JSON.stringify(endpoint.body);
    }
    
    const startTime = Date.now();
    const response = await fetch(endpoint.url, options);
    const responseTime = Date.now() - startTime;
    
    const isSuccess = response.ok || (response.status >= 200 && response.status < 400);
    
    if (isSuccess) {
      console.log(`   ✅ ${endpoint.name}: OK (${response.status}) - ${responseTime}ms`);
      
      // Special checks for specific endpoints
      if (endpoint.name === 'Analytics Real-time') {
        try {
          const data = await response.json();
          const usingFallback = data.fallback === true;
          if (usingFallback) {
            console.log(`   ⚠️  ${endpoint.name}: Using fallback data (not genuine)`);
          } else {
            console.log(`   ✅ ${endpoint.name}: Using genuine Firebase data`);
          }
        } catch (e) {
          // Ignore JSON parsing errors for this check
        }
      }
      
      return { success: true, status: response.status, responseTime };
    } else {
      console.log(`   ❌ ${endpoint.name}: FAILED (${response.status}) - ${responseTime}ms`);
      return { success: false, status: response.status, responseTime, critical: endpoint.critical };
    }
    
  } catch (error) {
    console.log(`   ❌ ${endpoint.name}: ERROR - ${error.message}`);
    return { success: false, error: error.message, critical: endpoint.critical };
  }
}

async function checkEnvironmentVariables() {
  console.log('\n🔧 Checking Environment Variables...');
  console.log('='.repeat(50));
  
  require('dotenv').config({ path: '.env.local' });
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'RESEND_API_KEY',
    'FROM_EMAIL',
    'OWNER1_EMAIL',
    'OWNER2_EMAIL',
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'SANITY_API_TOKEN',
    'JWT_SECRET',
    'ADMIN_USERNAME',
    'ADMIN_PASSWORD'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
    } else {
      missing.push(varName);
    }
  });
  
  console.log(`✅ Present: ${present.length}/${requiredVars.length} variables`);
  
  if (missing.length > 0) {
    console.log(`❌ Missing: ${missing.length} variables`);
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    return false;
  }
  
  console.log('✅ All required environment variables are present');
  return true;
}

async function checkServerStatus() {
  console.log('\n🔍 Checking Server Status...');
  console.log('='.repeat(40));
  
  try {
    const response = await fetch(BASE_URL, { timeout: 5000 });
    if (response.ok) {
      console.log('✅ Development server is running');
      return true;
    } else {
      console.log(`❌ Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running or unreachable');
    console.log('💡 Make sure to start the server: npm run dev');
    return false;
  }
}

async function runPreDeploymentCheck() {
  console.log('🚀 PRE-DEPLOYMENT READINESS CHECK');
  console.log('='.repeat(60));
  console.log('');
  
  // Check server status
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    console.log('\n❌ DEPLOYMENT NOT READY: Server not running');
    return false;
  }
  
  // Check environment variables
  const envVarsOk = await checkEnvironmentVariables();
  
  // Test all critical endpoints
  console.log('\n🧪 Testing Critical Endpoints...');
  console.log('='.repeat(50));
  
  const results = [];
  for (const endpoint of CRITICAL_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push({ ...result, name: endpoint.name, critical: endpoint.critical });
  }
  
  // Analyze results
  console.log('\n' + '='.repeat(60));
  console.log('📋 DEPLOYMENT READINESS SUMMARY');
  console.log('='.repeat(60));
  
  const criticalFailures = results.filter(r => !r.success && r.critical);
  const nonCriticalFailures = results.filter(r => !r.success && !r.critical);
  const successes = results.filter(r => r.success);
  
  console.log(`✅ Successful Tests: ${successes.length}/${results.length}`);
  console.log(`❌ Critical Failures: ${criticalFailures.length}`);
  console.log(`⚠️  Non-Critical Failures: ${nonCriticalFailures.length}`);
  console.log(`🔧 Environment Variables: ${envVarsOk ? 'OK' : 'ISSUES'}`);
  
  // Detailed results
  console.log('\n📊 Detailed Results:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const critical = result.critical ? '🔴' : '🟡';
    console.log(`${status} ${critical} ${result.name}`);
  });
  
  // Final verdict
  console.log('\n' + '='.repeat(60));
  
  if (criticalFailures.length === 0 && envVarsOk) {
    console.log('🎉 DEPLOYMENT READY!');
    console.log('✅ All critical functionality is working');
    console.log('✅ Environment variables are configured');
    console.log('✅ No breaking changes detected');
    
    if (nonCriticalFailures.length > 0) {
      console.log('\n⚠️  Note: Some non-critical features have issues:');
      nonCriticalFailures.forEach(failure => {
        console.log(`   - ${failure.name}: ${failure.error || `Status ${failure.status}`}`);
      });
      console.log('   These won\'t prevent deployment but should be monitored.');
    }
    
    console.log('\n🚀 Safe to deploy to production!');
    return true;
    
  } else {
    console.log('❌ DEPLOYMENT NOT READY');
    console.log('🚨 Critical issues detected that must be fixed:');
    
    if (!envVarsOk) {
      console.log('   - Missing required environment variables');
    }
    
    criticalFailures.forEach(failure => {
      console.log(`   - ${failure.name}: ${failure.error || `Status ${failure.status}`}`);
    });
    
    console.log('\n🔧 Fix these issues before deploying to production');
    return false;
  }
}

// Run the check
runPreDeploymentCheck().then(ready => {
  process.exit(ready ? 0 : 1);
}).catch(error => {
  console.error('❌ Pre-deployment check failed:', error);
  process.exit(1);
});