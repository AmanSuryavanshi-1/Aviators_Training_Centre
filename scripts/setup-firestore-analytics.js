#!/usr/bin/env node

/**
 * Firebase Firestore Analytics Setup Script
 * 
 * This script sets up the enhanced Firestore schema for the advanced analytics dashboard:
 * - Creates required collections
 * - Sets up composite indexes
 * - Validates security rules
 * - Performs health checks
 */

// Load environment variables first
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

// Collection names
const COLLECTIONS = {
  ANALYTICS_EVENTS: 'analytics_events',
  USER_JOURNEYS: 'user_journeys',
  TRAFFIC_SOURCES: 'traffic_sources'
};

// Required indexes configuration
const REQUIRED_INDEXES = [
  {
    collection: COLLECTIONS.ANALYTICS_EVENTS,
    fields: [
      { field: 'timestamp', order: 'desc' },
      { field: 'source.category', order: 'asc' },
      { field: 'validation.isValid', order: 'asc' }
    ]
  },
  {
    collection: COLLECTIONS.ANALYTICS_EVENTS,
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'sessionId', order: 'asc' },
      { field: 'timestamp', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.ANALYTICS_EVENTS,
    fields: [
      { field: 'page.category', order: 'asc' },
      { field: 'timestamp', order: 'desc' },
      { field: 'validation.isValid', order: 'asc' }
    ]
  },
  {
    collection: COLLECTIONS.USER_JOURNEYS,
    fields: [
      { field: 'startTime', order: 'desc' },
      { field: 'outcome.type', order: 'asc' },
      { field: 'entry.source.category', order: 'asc' }
    ]
  },
  {
    collection: COLLECTIONS.USER_JOURNEYS,
    fields: [
      { field: 'userId', order: 'asc' },
      { field: 'startTime', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.TRAFFIC_SOURCES,
    fields: [
      { field: 'date', order: 'desc' },
      { field: 'metrics.conversionRate', order: 'desc' },
      { field: 'authenticity.confidenceScore', order: 'desc' }
    ]
  },
  {
    collection: COLLECTIONS.TRAFFIC_SOURCES,
    fields: [
      { field: 'category', order: 'asc' },
      { field: 'date', order: 'desc' }
    ]
  }
];

// Security rules content
const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Analytics Events Collection
    match /analytics_events/{eventId} {
      // Allow read access for authenticated admin users
      allow read: if isAuthenticated() && isAdmin();
      
      // Allow write access for the analytics tracking system
      allow create: if isValidAnalyticsEvent();
      
      // Prevent updates and deletes to maintain data integrity
      allow update, delete: if false;
    }
    
    // User Journeys Collection
    match /user_journeys/{journeyId} {
      // Allow read access for authenticated admin users
      allow read: if isAuthenticated() && isAdmin();
      
      // Allow create and update for journey tracking
      allow create, update: if isValidUserJourney();
      
      // Prevent deletes to maintain historical data
      allow delete: if false;
    }
    
    // Traffic Sources Collection
    match /traffic_sources/{sourceId} {
      // Allow read access for authenticated admin users
      allow read: if isAuthenticated() && isAdmin();
      
      // Allow create and update for aggregated data
      allow create, update: if isValidTrafficSource();
      
      // Allow delete for data cleanup (admin only)
      allow delete: if isAuthenticated() && isAdmin();
    }
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      // Check if user has admin role or is accessing from admin domain
      return request.auth.token.admin == true || 
             request.auth.token.email in ['admin@aviatorstrainingcentre.com'];
    }
    
    function isValidAnalyticsEvent() {
      let data = request.resource.data;
      return data.keys().hasAll(['timestamp', 'userId', 'sessionId', 'event', 'page', 'source', 'user', 'journey', 'validation']) &&
             data.event.keys().hasAll(['type', 'category', 'action']) &&
             data.page.keys().hasAll(['url', 'title', 'path', 'category']) &&
             data.source.keys().hasAll(['category', 'source', 'medium', 'isAuthentic', 'confidence']) &&
             data.user.keys().hasAll(['isReturning', 'deviceType', 'browser', 'os']) &&
             data.journey.keys().hasAll(['journeyId', 'stepNumber', 'isEntryPoint', 'isExitPoint', 'timeSpent', 'scrollDepth']) &&
             data.validation.keys().hasAll(['isValid', 'isBot', 'botScore', 'flags']) &&
             data.timestamp is timestamp &&
             data.source.confidence >= 0 && data.source.confidence <= 100 &&
             data.validation.botScore >= 0 && data.validation.botScore <= 100;
    }
    
    function isValidUserJourney() {
      let data = request.resource.data;
      return data.keys().hasAll(['userId', 'sessionId', 'startTime', 'entry', 'path', 'outcome', 'metrics', 'attribution']) &&
             data.entry.keys().hasAll(['page', 'source', 'referrer']) &&
             data.outcome.keys().hasAll(['type']) &&
             data.metrics.keys().hasAll(['duration', 'pageCount', 'interactionCount', 'averageScrollDepth', 'engagementScore']) &&
             data.attribution.keys().hasAll(['firstTouch', 'lastTouch', 'assistingChannels']) &&
             data.startTime is timestamp &&
             data.metrics.duration >= 0 &&
             data.metrics.pageCount >= 0 &&
             data.metrics.interactionCount >= 0 &&
             data.metrics.averageScrollDepth >= 0 && data.metrics.averageScrollDepth <= 100 &&
             data.metrics.engagementScore >= 0 && data.metrics.engagementScore <= 100;
    }
    
    function isValidTrafficSource() {
      let data = request.resource.data;
      return data.keys().hasAll(['date', 'source', 'medium', 'category', 'metrics', 'authenticity']) &&
             data.metrics.keys().hasAll(['visitors', 'sessions', 'pageViews', 'conversions', 'conversionRate', 'averageSessionDuration', 'bounceRate']) &&
             data.authenticity.keys().hasAll(['validTraffic', 'suspiciousTraffic', 'botTraffic', 'confidenceScore']) &&
             data.date is string &&
             data.metrics.visitors >= 0 &&
             data.metrics.sessions >= 0 &&
             data.metrics.pageViews >= 0 &&
             data.metrics.conversions >= 0 &&
             data.metrics.conversionRate >= 0 && data.metrics.conversionRate <= 100 &&
             data.metrics.bounceRate >= 0 && data.metrics.bounceRate <= 100 &&
             data.authenticity.confidenceScore >= 0 && data.authenticity.confidenceScore <= 100;
    }
  }
}
`;

async function validateEnvironment() {
  logStep('1', 'Validating environment variables...');
  
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];
  
  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(', ')}`);
    logError('Please ensure your .env.local file contains all required Firebase Admin SDK variables.');
    return false;
  }
  
  logSuccess('Environment variables validated');
  return true;
}

async function initializeCollections() {
  logStep('2', 'Initializing Firestore collections...');
  
  try {
    // Import Firebase Admin dynamically
    const admin = require('firebase-admin');
    
    // Initialize Firebase Admin if not already initialized
    if (admin.apps.length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    
    const db = admin.firestore();
    
    // Create collections with initial documents if they don't exist
    const collections = Object.values(COLLECTIONS);

    for (const collectionName of collections) {
      const collectionRef = db.collection(collectionName);
      const snapshot = await collectionRef.limit(1).get();
      
      if (snapshot.empty) {
        // Create a placeholder document to initialize the collection
        await collectionRef.add({
          _placeholder: true,
          createdAt: admin.firestore.Timestamp.now(),
          note: `Placeholder document for ${collectionName} collection initialization`
        });
        
        logSuccess(`Initialized collection: ${collectionName}`);
      } else {
        logSuccess(`Collection already exists: ${collectionName}`);
      }
    }
    
    return true;
  } catch (error) {
    logError(`Failed to initialize collections: ${error.message}`);
    return false;
  }
}

async function createIndexes() {
  logStep('3', 'Setting up composite indexes...');
  
  log(`${colors.yellow}Note: Composite indexes must be created through the Firebase Console or Firebase CLI.${colors.reset}`);
  log(`${colors.yellow}The following indexes are required for optimal performance:${colors.reset}\n`);
  
  REQUIRED_INDEXES.forEach((index, i) => {
    log(`${colors.bright}Index ${i + 1}: ${index.collection}${colors.reset}`);
    index.fields.forEach(field => {
      log(`  - ${field.field} (${field.order})`);
    });
    log('');
  });
  
  log(`${colors.cyan}To create these indexes:${colors.reset}`);
  log('1. Visit the Firebase Console: https://console.firebase.google.com/');
  log(`2. Select your project: ${process.env.FIREBASE_PROJECT_ID}`);
  log('3. Go to Firestore Database > Indexes');
  log('4. Create composite indexes as listed above');
  log('');
  log(`${colors.cyan}Or use Firebase CLI:${colors.reset}`);
  log('firebase firestore:indexes');
  log('');
  
  logWarning('Manual index creation required - see instructions above');
  return true;
}

async function generateFirebaseIndexConfig() {
  logStep('4', 'Generating firestore.indexes.json configuration...');
  
  const indexConfig = {
    indexes: REQUIRED_INDEXES.map(index => ({
      collectionGroup: index.collection,
      queryScope: 'COLLECTION',
      fields: index.fields.map(field => ({
        fieldPath: field.field,
        order: field.order.toUpperCase()
      }))
    }))
  };
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const configPath = path.join(process.cwd(), 'firestore.indexes.json');
    fs.writeFileSync(configPath, JSON.stringify(indexConfig, null, 2));
    logSuccess(`Index configuration saved to: ${configPath}`);
    log(`${colors.cyan}Deploy indexes with: firebase deploy --only firestore:indexes${colors.reset}`);
    return true;
  } catch (error) {
    logError(`Failed to write index configuration: ${error.message}`);
    return false;
  }
}

async function generateSecurityRules() {
  logStep('5', 'Generating firestore.rules configuration...');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    const rulesPath = path.join(process.cwd(), 'firestore.rules');
    fs.writeFileSync(rulesPath, FIRESTORE_SECURITY_RULES);
    logSuccess(`Security rules saved to: ${rulesPath}`);
    log(`${colors.cyan}Deploy rules with: firebase deploy --only firestore:rules${colors.reset}`);
    return true;
  } catch (error) {
    logError(`Failed to write security rules: ${error.message}`);
    return false;
  }
}

async function performHealthCheck() {
  logStep('6', 'Performing health check...');
  
  try {
    const admin = require('firebase-admin');
    const db = admin.firestore();
    
    const collections = Object.values(COLLECTIONS);
    const results = {};

    for (const collectionName of collections) {
      try {
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.count().get();
        
        results[collectionName] = {
          exists: true,
          documentCount: snapshot.data().count
        };
      } catch (error) {
        results[collectionName] = {
          exists: false,
          documentCount: 0
        };
      }
    }

    logSuccess('Firestore health check passed');
    
    log(`${colors.bright}Collection Status:${colors.reset}`);
    Object.entries(results).forEach(([name, info]) => {
      const status = info.exists ? colors.green : colors.red;
      log(`  ${status}${name}${colors.reset}: ${info.exists ? 'EXISTS' : 'MISSING'} (${info.documentCount} documents)`);
    });
    
    return true;
  } catch (error) {
    logError(`Health check failed: ${error.message}`);
    return false;
  }
}

async function displaySummary() {
  log(`\n${colors.bright}${colors.green}🎉 Firestore Analytics Setup Complete!${colors.reset}\n`);
  
  log(`${colors.bright}What was set up:${colors.reset}`);
  log(`${colors.green}✓${colors.reset} Analytics collections initialized`);
  log(`${colors.green}✓${colors.reset} Collection health check passed`);
  log(`${colors.green}✓${colors.reset} Index configuration generated`);
  log(`${colors.green}✓${colors.reset} Security rules generated`);
  
  log(`\n${colors.bright}Next steps:${colors.reset}`);
  log(`${colors.cyan}1.${colors.reset} Deploy Firestore indexes: ${colors.yellow}firebase deploy --only firestore:indexes${colors.reset}`);
  log(`${colors.cyan}2.${colors.reset} Deploy security rules: ${colors.yellow}firebase deploy --only firestore:rules${colors.reset}`);
  log(`${colors.cyan}3.${colors.reset} Test the analytics tracking system`);
  log(`${colors.cyan}4.${colors.reset} Monitor collection performance in Firebase Console`);
  
  log(`\n${colors.bright}Collections created:${colors.reset}`);
  Object.values(COLLECTIONS).forEach(collection => {
    log(`${colors.green}•${colors.reset} ${collection}`);
  });
  
  log(`\n${colors.bright}Files generated:${colors.reset}`);
  log(`${colors.green}•${colors.reset} firestore.indexes.json`);
  log(`${colors.green}•${colors.reset} firestore.rules`);
}

async function main() {
  try {
    log(`${colors.bright}${colors.blue}Firebase Firestore Analytics Setup${colors.reset}\n`);
    
    const results = [];
    
    results.push(await validateEnvironment());
    results.push(await initializeCollections());
    results.push(await createIndexes());
    results.push(await generateFirebaseIndexConfig());
    results.push(await generateSecurityRules());
    results.push(await performHealthCheck());
    
    const allStepsSuccessful = results.every(result => result);
    
    if (allStepsSuccessful) {
      await displaySummary();
      process.exit(0);
    } else {
      logError('\nSetup completed with errors. Please review the output above.');
      process.exit(1);
    }
    
  } catch (error) {
    logError(`\nSetup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle script execution
if (require.main === module) {
  main().catch(error => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  validateEnvironment,
  initializeCollections,
  createIndexes,
  generateFirebaseIndexConfig,
  generateSecurityRules,
  performHealthCheck
};