#!/usr/bin/env node

/**
 * Comprehensive Analytics System Verification
 * 
 * This script thoroughly tests all analytics components to ensure:
 * 1. Real data collection (not fallback/mock data)
 * 2. Proper Firestore integration
 * 3. All API endpoints working correctly
 * 4. Data integrity and validation
 * 5. Production readiness
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const tests = {
  realtime: `${BASE_URL}/api/analytics/realtime?type=metrics`,
  advanced: `${BASE_URL}/api/analytics/advanced?type=events&start=2025-01-01T00:00:00.000Z&end=2025-12-31T23:59:59.999Z&validOnly=true`,
  track: `${BASE_URL}/api/analytics/track`,
  sessionUpdate: `${BASE_URL}/api/analytics/session/update`,
  health: `${BASE_URL}/api/health`
};

console.log('🔍 Analytics System Verification');
console.log('='.repeat(50));
console.log('');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testRealTimeAnalytics() {
  console.log('📊 Testing Real-time Analytics...');
  
  try {
    const response = await makeRequest(tests.realtime);
    
    if (response.status !== 200) {
      console.log('❌ Real-time API failed:', response.status);
      return false;
    }
    
    const data = response.data;
    
    // Check if it's using fallback data
    if (data.fallback === true) {
      console.log('⚠️  Real-time analytics is using FALLBACK data (not genuine Firebase data)');
      console.log('   This means Firestore queries are failing');
      return false;
    }
    
    // Verify data structure
    const required = ['activeUsers', 'currentPageViews', 'conversionsToday', 'topPages', 'topSources'];
    const missing = required.filter(field => !(field in data.data));
    
    if (missing.length > 0) {
      console.log('❌ Missing required fields:', missing);
      return false;
    }
    
    // Check for realistic data patterns
    const metrics = data.data;
    console.log('✅ Real-time metrics received:');
    console.log(`   Active Users: ${metrics.activeUsers}`);
    console.log(`   Page Views: ${metrics.currentPageViews}`);
    console.log(`   Conversions: ${metrics.conversionsToday}`);
    console.log(`   Top Pages: ${metrics.topPages.length} entries`);
    console.log(`   Top Sources: ${metrics.topSources.length} entries`);
    
    // Verify it's not using static mock data
    if (metrics.topPages.length > 0 && metrics.topPages[0].page === '/' && metrics.topPages[0].views === 45) {
      console.log('⚠️  Appears to be using mock/fallback data (static values detected)');
      return false;
    }
    
    console.log('✅ Real-time analytics working with genuine data');
    return true;
    
  } catch (error) {
    console.log('❌ Real-time analytics test failed:', error.message);
    return false;
  }
}

async function testAdvancedAnalytics() {
  console.log('\n📈 Testing Advanced Analytics...');
  
  try {
    const response = await makeRequest(tests.advanced);
    
    if (response.status !== 200) {
      console.log('❌ Advanced analytics API failed:', response.status);
      return false;
    }
    
    const data = response.data;
    
    if (data.success !== true) {
      console.log('❌ Advanced analytics returned error:', data.error);
      return false;
    }
    
    console.log('✅ Advanced analytics API working');
    console.log(`   Events returned: ${data.data ? data.data.length : 0}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Advanced analytics test failed:', error.message);
    return false;
  }
}

async function testAnalyticsTracking() {
  console.log('\n📝 Testing Analytics Tracking...');
  
  const testEvent = {
    sessionId: `test-session-${Date.now()}`,
    userId: `test-user-${Date.now()}`,
    event: {
      type: 'page_view',
      page: '/test-page',
      data: { test: true }
    },
    source: {
      source: 'test',
      medium: 'verification',
      category: 'test',
      referrer: 'verification-script'
    },
    user: {
      device: {
        type: 'desktop',
        browser: 'test',
        os: 'test'
      }
    }
  };
  
  try {
    const response = await makeRequest(tests.track, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Analytics-Verification-Script/1.0'
      },
      body: testEvent
    });
    
    if (response.status !== 200) {
      console.log('❌ Analytics tracking failed:', response.status);
      console.log('   Response:', response.data);
      return false;
    }
    
    const data = response.data;
    
    if (data.success !== true) {
      console.log('❌ Analytics tracking returned error:', data.error);
      return false;
    }
    
    console.log('✅ Analytics tracking working');
    console.log(`   Event ID: ${data.eventId}`);
    console.log(`   Processed: ${data.processed}`);
    console.log(`   Bot Detected: ${data.botDetected}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Analytics tracking test failed:', error.message);
    return false;
  }
}

async function testSessionManagement() {
  console.log('\n👤 Testing Session Management...');
  
  const sessionData = {
    sessionId: `test-session-${Date.now()}`,
    lastActivity: new Date().toISOString(),
    pageViews: 1,
    currentPage: '/test',
    duration: 30000
  };
  
  try {
    const response = await makeRequest(tests.sessionUpdate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: sessionData
    });
    
    if (response.status !== 200) {
      console.log('❌ Session update failed:', response.status);
      return false;
    }
    
    const data = response.data;
    
    if (data.success !== true) {
      console.log('❌ Session update returned error:', data.error);
      return false;
    }
    
    console.log('✅ Session management working');
    return true;
    
  } catch (error) {
    console.log('❌ Session management test failed:', error.message);
    return false;
  }
}

async function testSystemHealth() {
  console.log('\n🏥 Testing System Health...');
  
  try {
    const response = await makeRequest(tests.health);
    
    if (response.status !== 200) {
      console.log('❌ Health check failed:', response.status);
      return false;
    }
    
    console.log('✅ System health check passed');
    return true;
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function checkFirestoreConnection() {
  console.log('\n🔥 Checking Firestore Connection...');
  
  // This will be indicated by whether we get real data vs fallback data
  const response = await makeRequest(tests.realtime);
  
  if (response.data && response.data.fallback === true) {
    console.log('❌ Firestore connection issues detected (using fallback data)');
    return false;
  }
  
  console.log('✅ Firestore connection working');
  return true;
}

async function runAllTests() {
  console.log('Starting comprehensive analytics verification...\n');
  
  const results = {
    health: await testSystemHealth(),
    firestore: await checkFirestoreConnection(),
    realtime: await testRealTimeAnalytics(),
    advanced: await testAdvancedAnalytics(),
    tracking: await testAnalyticsTracking(),
    sessions: await testSessionManagement()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 VERIFICATION RESULTS');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.toUpperCase()}`);
  });
  
  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION');
    console.log('✅ Analytics system is collecting genuine data');
    console.log('✅ All APIs working correctly');
    console.log('✅ Firestore integration functional');
    console.log('✅ No fallback data being used');
  } else {
    console.log('⚠️  SOME TESTS FAILED - SYSTEM NOT READY');
    console.log('❌ Issues detected that need resolution');
    console.log('❌ May be using fallback/mock data');
  }
  console.log('='.repeat(50));
  
  return allPassed;
}

// Run the verification
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification script failed:', error);
  process.exit(1);
});