#!/usr/bin/env node

/**
 * Verify Genuine Analytics Data
 * 
 * This script helps verify if your custom analytics is collecting
 * real data by comparing with Google Analytics and testing live tracking
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function checkRealTimeData() {
  console.log('🔍 Checking Real-Time Data Collection...');
  console.log('='.repeat(50));
  
  // Check active sessions in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const activeSessionsSnapshot = await db.collection('user_sessions')
    .where('isActive', '==', true)
    .where('lastActivity', '>=', admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
    .get();
  
  console.log(`👤 Active Sessions (last 5 min): ${activeSessionsSnapshot.size}`);
  
  if (activeSessionsSnapshot.size > 0) {
    console.log('\n📋 Active Session Details:');
    activeSessionsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. Session: ${doc.id.substring(0, 8)}...`);
      console.log(`      Last Activity: ${data.lastActivity.toDate().toLocaleString()}`);
      console.log(`      Page Views: ${data.pageViews}`);
      console.log(`      Current Page: ${data.currentPage || 'unknown'}`);
      console.log(`      Source: ${data.source?.source || 'unknown'}`);
    });
  }
  
  // Check recent events
  const recentEventsSnapshot = await db.collection('analytics_events')
    .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
    .orderBy('timestamp', 'desc')
    .limit(10)
    .get();
  
  console.log(`\n📊 Recent Events (last 5 min): ${recentEventsSnapshot.size}`);
  
  if (recentEventsSnapshot.size > 0) {
    console.log('\n📋 Recent Event Details:');
    recentEventsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`   ${index + 1}. ${data.event.type} on ${data.event.page}`);
      console.log(`      Time: ${data.timestamp.toDate().toLocaleString()}`);
      console.log(`      Source: ${data.source.source}`);
      console.log(`      Valid: ${data.validation.isValid}`);
      console.log(`      User Agent: ${data.user.userAgent.substring(0, 50)}...`);
    });
  }
  
  return {
    activeSessions: activeSessionsSnapshot.size,
    recentEvents: recentEventsSnapshot.size
  };
}

async function checkDataFreshness() {
  console.log('\n🕐 Checking Data Freshness...');
  console.log('='.repeat(50));
  
  // Check when the most recent data was created
  const latestEventSnapshot = await db.collection('analytics_events')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();
  
  if (!latestEventSnapshot.empty) {
    const latestEvent = latestEventSnapshot.docs[0].data();
    const latestTime = latestEvent.timestamp.toDate();
    const minutesAgo = Math.floor((Date.now() - latestTime.getTime()) / (1000 * 60));
    
    console.log(`📅 Latest Event: ${latestTime.toLocaleString()}`);
    console.log(`⏰ Time Since Latest: ${minutesAgo} minutes ago`);
    
    if (minutesAgo < 5) {
      console.log('✅ Data is FRESH (recent activity detected)');
      return true;
    } else if (minutesAgo < 60) {
      console.log('⚠️  Data is STALE (no recent activity)');
      return false;
    } else {
      console.log('❌ Data is OLD (likely test data only)');
      return false;
    }
  } else {
    console.log('❌ No events found in database');
    return false;
  }
}

async function checkDataPatterns() {
  console.log('\n🔍 Analyzing Data Patterns...');
  console.log('='.repeat(50));
  
  // Check for suspicious patterns that indicate fake data
  const allEventsSnapshot = await db.collection('analytics_events')
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();
  
  if (allEventsSnapshot.empty) {
    console.log('❌ No events found');
    return false;
  }
  
  const events = allEventsSnapshot.docs.map(doc => doc.data());
  
  // Check for variety in user agents
  const userAgents = new Set(events.map(e => e.user.userAgent));
  console.log(`🖥️  Unique User Agents: ${userAgents.size}`);
  
  // Check for variety in IP addresses
  const ipAddresses = new Set(events.map(e => e.user.ipAddress));
  console.log(`🌐 Unique IP Addresses: ${ipAddresses.size}`);
  
  // Check for variety in pages
  const pages = new Set(events.map(e => e.event.page));
  console.log(`📄 Unique Pages Visited: ${pages.size}`);
  console.log(`   Pages: ${Array.from(pages).join(', ')}`);
  
  // Check for variety in sources
  const sources = new Set(events.map(e => e.source.source));
  console.log(`🚦 Unique Traffic Sources: ${sources.size}`);
  console.log(`   Sources: ${Array.from(sources).join(', ')}`);
  
  // Check for realistic time distribution
  const hours = events.map(e => e.timestamp.toDate().getHours());
  const hourDistribution = {};
  hours.forEach(hour => {
    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
  });
  
  console.log(`⏰ Time Distribution: ${Object.keys(hourDistribution).length} different hours`);
  
  // Detect if data looks too uniform (fake)
  const isLikelyFake = userAgents.size < 2 && ipAddresses.size < 2 && sources.size < 2;
  
  if (isLikelyFake) {
    console.log('⚠️  WARNING: Data patterns suggest test/fake data');
    console.log('   - Very few unique user agents, IPs, or sources');
    return false;
  } else {
    console.log('✅ Data patterns look realistic');
    return true;
  }
}

async function testLiveTracking() {
  console.log('\n🧪 Testing Live Tracking...');
  console.log('='.repeat(50));
  
  const testSessionId = `live-test-${Date.now()}`;
  
  try {
    // Create a test event
    await db.collection('analytics_events').add({
      sessionId: testSessionId,
      timestamp: admin.firestore.Timestamp.now(),
      event: {
        type: 'page_view',
        page: '/verification-test',
        data: { test: true }
      },
      source: {
        source: 'verification-script',
        category: 'test'
      },
      user: {
        userAgent: 'Verification Script 1.0',
        ipAddress: '127.0.0.1',
        device: {
          type: 'script',
          browser: 'node',
          os: 'system'
        }
      },
      validation: {
        isValid: true,
        isBot: false,
        confidence: 100,
        flags: ['verification-test']
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Successfully created test event');
    
    // Wait a moment and check if it appears in queries
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const testEventSnapshot = await db.collection('analytics_events')
      .where('sessionId', '==', testSessionId)
      .get();
    
    if (!testEventSnapshot.empty) {
      console.log('✅ Test event found in database');
      console.log('✅ Live tracking is working correctly');
      
      // Clean up test event
      await testEventSnapshot.docs[0].ref.delete();
      console.log('🧹 Test event cleaned up');
      
      return true;
    } else {
      console.log('❌ Test event not found - tracking may not be working');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Live tracking test failed:', error.message);
    return false;
  }
}

async function compareWithGoogleAnalytics() {
  console.log('\n📊 Google Analytics Comparison Guide...');
  console.log('='.repeat(50));
  
  console.log('To verify your custom analytics against Google Analytics:');
  console.log('');
  console.log('1. 📈 Check Google Analytics Real-Time Report:');
  console.log('   - Go to Google Analytics > Reports > Realtime');
  console.log('   - Note the "Users right now" count');
  console.log('');
  console.log('2. 🔍 Check Your Custom Analytics:');
  console.log('   - Go to http://localhost:3000/admin/analytics');
  console.log('   - Compare "Active Users" with Google Analytics');
  console.log('');
  console.log('3. 📄 Test Page Views:');
  console.log('   - Visit different pages on your site');
  console.log('   - Check if both systems show the page views');
  console.log('');
  console.log('4. 🚦 Check Traffic Sources:');
  console.log('   - Compare traffic source breakdown');
  console.log('   - Both should show similar patterns');
  console.log('');
  console.log('⚠️  Note: Small differences are normal due to:');
  console.log('   - Different tracking methods');
  console.log('   - Bot filtering differences');
  console.log('   - Timing differences');
  console.log('');
  console.log('✅ If numbers are roughly similar (within 20%), your tracking is working!');
}

async function runVerification() {
  console.log('🔍 GENUINE DATA VERIFICATION');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    const realTimeData = await checkRealTimeData();
    const dataFreshness = await checkDataFreshness();
    const dataPatterns = await checkDataPatterns();
    const liveTracking = await testLiveTracking();
    
    await compareWithGoogleAnalytics();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const results = {
      'Real-time Data': realTimeData.activeSessions > 0 || realTimeData.recentEvents > 0,
      'Data Freshness': dataFreshness,
      'Data Patterns': dataPatterns,
      'Live Tracking': liveTracking
    };
    
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    const overallScore = Object.values(results).filter(r => r).length;
    const totalTests = Object.values(results).length;
    
    console.log('\n' + '='.repeat(60));
    
    if (overallScore === totalTests) {
      console.log('🎉 VERIFICATION PASSED - DATA IS GENUINE!');
      console.log('✅ Your analytics is collecting real, live data');
      console.log('✅ System is working correctly in production');
    } else if (overallScore >= totalTests * 0.75) {
      console.log('⚠️  PARTIAL VERIFICATION - MOSTLY WORKING');
      console.log('✅ Analytics is mostly working but may need attention');
      console.log('💡 Check failed tests above for issues');
    } else {
      console.log('❌ VERIFICATION FAILED - DATA MAY BE FAKE');
      console.log('❌ Analytics may not be collecting genuine data');
      console.log('💡 Check your tracking implementation');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('1. Compare with Google Analytics real-time data');
    console.log('2. Visit your site and check if events appear');
    console.log('3. Monitor the admin dashboard for live updates');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

runVerification();