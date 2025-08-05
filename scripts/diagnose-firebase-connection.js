#!/usr/bin/env node

/**
 * Diagnose Firebase Connection Issues
 * 
 * This script checks Firebase connectivity and identifies why
 * the analytics system is using fallback data
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

async function checkEnvironmentVariables() {
  console.log('🔧 Checking Environment Variables...');
  console.log('='.repeat(50));
  
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY'
  ];
  
  const missing = [];
  const present = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      present.push(varName);
      console.log(`✅ ${varName}: Present`);
    } else {
      missing.push(varName);
      console.log(`❌ ${varName}: Missing`);
    }
  });
  
  if (missing.length > 0) {
    console.log(`\n❌ Missing ${missing.length} required environment variables`);
    return false;
  } else {
    console.log(`\n✅ All ${present.length} environment variables present`);
    return true;
  }
}

async function initializeFirebase() {
  console.log('\n🔥 Initializing Firebase Admin...');
  console.log('='.repeat(50));
  
  try {
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin initialized successfully');
      return true;
    } else {
      console.log('✅ Firebase Admin already initialized');
      return true;
    }
  } catch (error) {
    console.log('❌ Firebase Admin initialization failed:', error.message);
    return false;
  }
}

async function testFirestoreConnection() {
  console.log('\n🗄️  Testing Firestore Connection...');
  console.log('='.repeat(50));
  
  try {
    const db = admin.firestore();
    
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const testDoc = await db.collection('_connection_test').limit(1).get();
    console.log('✅ Basic Firestore connection successful');
    
    return true;
  } catch (error) {
    console.log('❌ Firestore connection failed:', error.message);
    console.log('   Error code:', error.code);
    return false;
  }
}

async function checkAnalyticsCollections() {
  console.log('\n📊 Checking Analytics Collections...');
  console.log('='.repeat(50));
  
  try {
    const db = admin.firestore();
    
    // Check user_sessions collection
    console.log('👤 Checking user_sessions collection...');
    const sessionsSnapshot = await db.collection('user_sessions').limit(5).get();
    console.log(`   Found ${sessionsSnapshot.size} session documents`);
    
    if (sessionsSnapshot.size > 0) {
      const sampleSession = sessionsSnapshot.docs[0].data();
      console.log('   Sample session fields:', Object.keys(sampleSession));
    }
    
    // Check analytics_events collection
    console.log('📈 Checking analytics_events collection...');
    const eventsSnapshot = await db.collection('analytics_events').limit(5).get();
    console.log(`   Found ${eventsSnapshot.size} event documents`);
    
    if (eventsSnapshot.size > 0) {
      const sampleEvent = eventsSnapshot.docs[0].data();
      console.log('   Sample event fields:', Object.keys(sampleEvent));
    }
    
    // Check traffic_sources collection
    console.log('🚦 Checking traffic_sources collection...');
    const sourcesSnapshot = await db.collection('traffic_sources').limit(5).get();
    console.log(`   Found ${sourcesSnapshot.size} traffic source documents`);
    
    return {
      sessions: sessionsSnapshot.size,
      events: eventsSnapshot.size,
      sources: sourcesSnapshot.size
    };
    
  } catch (error) {
    console.log('❌ Failed to check collections:', error.message);
    return null;
  }
}

async function testAnalyticsQueries() {
  console.log('\n🔍 Testing Analytics Queries...');
  console.log('='.repeat(50));
  
  try {
    const db = admin.firestore();
    
    // Test active sessions query (the one that's likely failing)
    console.log('👥 Testing active sessions query...');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    try {
      const activeSessionsSnapshot = await db.collection('user_sessions')
        .where('isActive', '==', true)
        .where('lastActivity', '>=', admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
        .get();
      
      console.log(`✅ Active sessions query successful: ${activeSessionsSnapshot.size} results`);
    } catch (queryError) {
      console.log('❌ Active sessions query failed:', queryError.message);
      if (queryError.message.includes('index')) {
        console.log('   🔍 This is likely an index issue');
        console.log('   💡 The composite index for user_sessions may not be working');
      }
    }
    
    // Test recent events query
    console.log('📊 Testing recent events query...');
    try {
      const recentEventsSnapshot = await db.collection('analytics_events')
        .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(fiveMinutesAgo))
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      console.log(`✅ Recent events query successful: ${recentEventsSnapshot.size} results`);
    } catch (queryError) {
      console.log('❌ Recent events query failed:', queryError.message);
      if (queryError.message.includes('index')) {
        console.log('   🔍 This is likely an index issue');
        console.log('   💡 The composite index for analytics_events may not be working');
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Query testing failed:', error.message);
    return false;
  }
}

async function checkIndexes() {
  console.log('\n📇 Checking Firestore Indexes...');
  console.log('='.repeat(50));
  
  console.log('💡 Required indexes for analytics:');
  console.log('');
  console.log('1. user_sessions collection:');
  console.log('   - isActive (Ascending)');
  console.log('   - lastActivity (Ascending)');
  console.log('   - __name__ (Ascending)');
  console.log('');
  console.log('2. analytics_events collection:');
  console.log('   - event.type (Ascending)');
  console.log('   - validation.isValid (Ascending)');
  console.log('   - timestamp (Descending)');
  console.log('   - __name__ (Descending)');
  console.log('');
  console.log('3. analytics_events collection:');
  console.log('   - validation.isValid (Ascending)');
  console.log('   - timestamp (Descending)');
  console.log('   - __name__ (Descending)');
  console.log('');
  console.log('🔗 Check your indexes at:');
  console.log(`https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore/indexes`);
}

async function runDiagnostics() {
  console.log('🔍 FIREBASE CONNECTION DIAGNOSTICS');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    // Step 1: Check environment variables
    const envVarsOk = await checkEnvironmentVariables();
    if (!envVarsOk) {
      console.log('\n❌ DIAGNOSIS: Missing environment variables');
      console.log('💡 Fix: Check your .env.local file');
      return;
    }
    
    // Step 2: Initialize Firebase
    const firebaseOk = await initializeFirebase();
    if (!firebaseOk) {
      console.log('\n❌ DIAGNOSIS: Firebase initialization failed');
      console.log('💡 Fix: Check your Firebase credentials');
      return;
    }
    
    // Step 3: Test Firestore connection
    const firestoreOk = await testFirestoreConnection();
    if (!firestoreOk) {
      console.log('\n❌ DIAGNOSIS: Firestore connection failed');
      console.log('💡 Fix: Check your Firebase project settings');
      return;
    }
    
    // Step 4: Check collections
    const collections = await checkAnalyticsCollections();
    if (!collections) {
      console.log('\n❌ DIAGNOSIS: Cannot access analytics collections');
      return;
    }
    
    // Step 5: Test queries
    const queriesOk = await testAnalyticsQueries();
    
    // Step 6: Show index information
    await checkIndexes();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`✅ Environment Variables: OK`);
    console.log(`✅ Firebase Initialization: OK`);
    console.log(`✅ Firestore Connection: OK`);
    console.log(`📊 Collections Found:`);
    console.log(`   - Sessions: ${collections.sessions}`);
    console.log(`   - Events: ${collections.events}`);
    console.log(`   - Sources: ${collections.sources}`);
    console.log(`${queriesOk ? '✅' : '❌'} Analytics Queries: ${queriesOk ? 'OK' : 'FAILED'}`);
    
    if (queriesOk && collections.events > 0) {
      console.log('\n🎉 DIAGNOSIS: Firebase connection is working!');
      console.log('✅ Your analytics should be collecting genuine data');
      console.log('💡 If you\'re still seeing fallback data, check:');
      console.log('   1. Browser console for JavaScript errors');
      console.log('   2. Analytics tracker initialization');
      console.log('   3. API endpoint responses');
    } else if (!queriesOk) {
      console.log('\n⚠️  DIAGNOSIS: Index issues detected');
      console.log('❌ Analytics queries are failing due to missing indexes');
      console.log('💡 Fix: Create the required Firestore indexes');
      console.log('   Run: node scripts/create-firestore-index.js');
    } else if (collections.events === 0) {
      console.log('\n⚠️  DIAGNOSIS: No analytics data found');
      console.log('❌ Analytics collections are empty');
      console.log('💡 Fix: Analytics tracking is not working');
      console.log('   1. Check if analytics tracker is initializing');
      console.log('   2. Visit your website to generate test data');
      console.log('   3. Check browser console for errors');
    }
    
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
  }
}

runDiagnostics();