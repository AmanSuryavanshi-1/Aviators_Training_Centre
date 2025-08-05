#!/usr/bin/env node

/**
 * Quick Analytics System Check
 * Run this while the dev server is running to verify analytics functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function checkRealTimeAnalytics() {
  console.log('🔍 Checking Real-time Analytics...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/realtime?type=metrics`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ Real-time API failed:', response.status);
      return false;
    }
    
    console.log('📊 Real-time Data:');
    console.log(`   Active Users: ${data.data.activeUsers}`);
    console.log(`   Page Views: ${data.data.currentPageViews}`);
    console.log(`   Conversions: ${data.data.conversionsToday}`);
    console.log(`   Using Fallback: ${data.fallback || false}`);
    
    if (data.fallback) {
      console.log('⚠️  WARNING: Using fallback data (not genuine Firebase data)');
      return false;
    }
    
    console.log('✅ Real-time analytics working with genuine data');
    return true;
    
  } catch (error) {
    console.log('❌ Real-time check failed:', error.message);
    return false;
  }
}

async function checkAnalyticsTracking() {
  console.log('\n📝 Testing Analytics Tracking...');
  
  const testEvent = {
    sessionId: `test-${Date.now()}`,
    event: {
      type: 'page_view',
      page: '/verification-test'
    },
    source: {
      source: 'verification',
      category: 'test'
    }
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Verification-Script/1.0'
      },
      body: JSON.stringify(testEvent)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ Tracking failed:', response.status, data);
      return false;
    }
    
    if (!data.success) {
      console.log('❌ Tracking error:', data.error);
      return false;
    }
    
    console.log('✅ Analytics tracking working');
    console.log(`   Event ID: ${data.eventId}`);
    return true;
    
  } catch (error) {
    console.log('❌ Tracking test failed:', error.message);
    return false;
  }
}

async function checkAdvancedAnalytics() {
  console.log('\n📈 Checking Advanced Analytics...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/advanced?type=events&start=2025-01-01T00:00:00.000Z&end=2025-12-31T23:59:59.999Z&validOnly=true`);
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ Advanced analytics failed:', response.status);
      return false;
    }
    
    console.log('✅ Advanced analytics working');
    console.log(`   Events found: ${data.data ? data.data.length : 0}`);
    return true;
    
  } catch (error) {
    console.log('❌ Advanced analytics failed:', error.message);
    return false;
  }
}

async function runQuickCheck() {
  console.log('🚀 Quick Analytics System Check');
  console.log('='.repeat(40));
  
  const results = {
    realtime: await checkRealTimeAnalytics(),
    tracking: await checkAnalyticsTracking(),
    advanced: await checkAdvancedAnalytics()
  };
  
  console.log('\n' + '='.repeat(40));
  console.log('📋 RESULTS:');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASS' : 'FAIL'}`);
  });
  
  const allPassed = Object.values(results).every(r => r === true);
  
  console.log('\n' + (allPassed ? '🎉 ALL CHECKS PASSED!' : '⚠️  SOME ISSUES DETECTED'));
  
  if (allPassed) {
    console.log('✅ Analytics system is working correctly');
    console.log('✅ Collecting genuine data from Firebase');
    console.log('✅ Ready for production deployment');
  } else {
    console.log('❌ Issues need to be resolved');
    console.log('❌ May be using fallback/mock data');
  }
  
  return allPassed;
}

// Check if node-fetch is available
try {
  require('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch@2', { stdio: 'inherit' });
}

runQuickCheck().catch(console.error);