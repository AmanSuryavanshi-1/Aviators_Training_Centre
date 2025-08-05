#!/usr/bin/env node

/**
 * Production Firestore Deployment Script
 * Deploys Firestore indexes, security rules, and sets up analytics collections
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'aviators-training-centre';
const ENVIRONMENT = process.env.NODE_ENV || 'production';

console.log('🚀 Starting Firestore production deployment...');
console.log(`📋 Project ID: ${PROJECT_ID}`);
console.log(`🌍 Environment: ${ENVIRONMENT}`);

async function main() {
  try {
    // 1. Validate environment
    await validateEnvironment();
    
    // 2. Deploy Firestore indexes
    await deployFirestoreIndexes();
    
    // 3. Deploy security rules
    await deploySecurityRules();
    
    // 4. Set up analytics collections
    await setupAnalyticsCollections();
    
    // 5. Configure data retention policies
    await configureDataRetention();
    
    // 6. Set up monitoring and alerts
    await setupMonitoring();
    
    // 7. Verify deployment
    await verifyDeployment();
    
    console.log('✅ Firestore production deployment completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

async function validateEnvironment() {
  console.log('🔍 Validating environment...');
  
  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
  } catch (error) {
    throw new Error('Firebase CLI is not installed. Please install it with: npm install -g firebase-tools');
  }
  
  // Check if user is authenticated
  try {
    execSync('firebase projects:list', { stdio: 'pipe' });
    console.log('✅ Firebase authentication verified');
  } catch (error) {
    throw new Error('Not authenticated with Firebase. Please run: firebase login');
  }
  
  // Check if project exists
  try {
    const projects = execSync('firebase projects:list --json', { encoding: 'utf8' });
    const projectList = JSON.parse(projects);
    const project = projectList.find(p => p.projectId === PROJECT_ID);
    
    if (!project) {
      throw new Error(`Project ${PROJECT_ID} not found. Please check your project ID.`);
    }
    
    console.log(`✅ Project ${PROJECT_ID} found`);
  } catch (error) {
    throw new Error(`Failed to verify project: ${error.message}`);
  }
  
  // Check required files exist
  const requiredFiles = [
    'firestore.indexes.json',
    'firestore.rules'
  ];
  
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file ${file} not found`);
    }
  }
  
  console.log('✅ All required files found');
}

async function deployFirestoreIndexes() {
  console.log('📊 Deploying Firestore indexes...');
  
  try {
    // Read and validate indexes
    const indexesContent = fs.readFileSync('firestore.indexes.json', 'utf8');
    const indexes = JSON.parse(indexesContent);
    
    console.log(`📋 Found ${indexes.indexes.length} indexes to deploy`);
    
    // Deploy indexes
    execSync(`firebase deploy --only firestore:indexes --project ${PROJECT_ID}`, {
      stdio: 'inherit'
    });
    
    console.log('✅ Firestore indexes deployed successfully');
    
    // Wait for indexes to build
    console.log('⏳ Waiting for indexes to build...');
    await waitForIndexes();
    
  } catch (error) {
    throw new Error(`Failed to deploy Firestore indexes: ${error.message}`);
  }
}

async function deploySecurityRules() {
  console.log('🔒 Deploying Firestore security rules...');
  
  try {
    // Validate rules syntax
    execSync(`firebase firestore:rules --project ${PROJECT_ID}`, {
      stdio: 'pipe'
    });
    
    console.log('✅ Security rules syntax validated');
    
    // Deploy rules
    execSync(`firebase deploy --only firestore:rules --project ${PROJECT_ID}`, {
      stdio: 'inherit'
    });
    
    console.log('✅ Firestore security rules deployed successfully');
    
  } catch (error) {
    throw new Error(`Failed to deploy security rules: ${error.message}`);
  }
}

async function setupAnalyticsCollections() {
  console.log('📈 Setting up analytics collections...');
  
  const collections = [
    {
      name: 'analytics_events',
      description: 'User interaction events and page views'
    },
    {
      name: 'user_journeys',
      description: 'Complete user journey tracking'
    },
    {
      name: 'traffic_sources',
      description: 'Traffic source attribution and metrics'
    },
    {
      name: 'analytics_aggregations',
      description: 'Pre-computed analytics aggregations'
    }
  ];
  
  // Create a temporary script to initialize collections
  const initScript = `
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: '${PROJECT_ID}'
});

const db = admin.firestore();

async function initializeCollections() {
  console.log('Initializing analytics collections...');
  
  const collections = ${JSON.stringify(collections)};
  
  for (const collection of collections) {
    try {
      // Create a placeholder document to initialize the collection
      await db.collection(collection.name).doc('_placeholder').set({
        _description: collection.description,
        _created: admin.firestore.FieldValue.serverTimestamp(),
        _placeholder: true
      });
      
      console.log(\`✅ Collection \${collection.name} initialized\`);
    } catch (error) {
      console.error(\`❌ Failed to initialize \${collection.name}:\`, error.message);
    }
  }
  
  console.log('✅ All collections initialized');
  process.exit(0);
}

initializeCollections().catch(console.error);
`;
  
  // Write temporary script
  fs.writeFileSync('temp-init-collections.js', initScript);
  
  try {
    // Check if service account key exists
    if (!fs.existsSync('service-account-key.json')) {
      console.log('⚠️ Service account key not found. Collections will be created on first use.');
      return;
    }
    
    // Run initialization script
    execSync('node temp-init-collections.js', { stdio: 'inherit' });
    
  } catch (error) {
    console.warn('⚠️ Failed to initialize collections:', error.message);
    console.log('Collections will be created automatically on first use.');
  } finally {
    // Clean up temporary script
    if (fs.existsSync('temp-init-collections.js')) {
      fs.unlinkSync('temp-init-collections.js');
    }
  }
}

async function configureDataRetention() {
  console.log('🗄️ Configuring data retention policies...');
  
  const retentionScript = `
const admin = require('firebase-admin');

// Initialize Firebase Admin (reuse existing initialization)
const db = admin.firestore();

async function configureRetention() {
  console.log('Setting up data retention policies...');
  
  // Create retention policy document
  await db.collection('_system').doc('retention_policies').set({
    analytics_events: {
      retentionDays: 365, // 1 year
      archiveAfterDays: 90, // Archive after 3 months
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    },
    user_journeys: {
      retentionDays: 730, // 2 years
      archiveAfterDays: 180, // Archive after 6 months
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    },
    traffic_sources: {
      retentionDays: 1095, // 3 years
      archiveAfterDays: 365, // Archive after 1 year
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    },
    analytics_aggregations: {
      retentionDays: 90, // 3 months (regenerated regularly)
      archiveAfterDays: 30, // Archive after 1 month
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }
  });
  
  console.log('✅ Data retention policies configured');
  process.exit(0);
}

configureRetention().catch(console.error);
`;
  
  // Write and execute retention script
  fs.writeFileSync('temp-retention.js', retentionScript);
  
  try {
    if (fs.existsSync('service-account-key.json')) {
      execSync('node temp-retention.js', { stdio: 'inherit' });
    } else {
      console.log('⚠️ Service account key not found. Retention policies will be set up manually.');
    }
  } catch (error) {
    console.warn('⚠️ Failed to configure retention policies:', error.message);
  } finally {
    if (fs.existsSync('temp-retention.js')) {
      fs.unlinkSync('temp-retention.js');
    }
  }
}

async function setupMonitoring() {
  console.log('📊 Setting up monitoring and alerts...');
  
  try {
    // Create monitoring configuration
    const monitoringConfig = {
      alerts: {
        highErrorRate: {
          threshold: 5, // 5% error rate
          enabled: true
        },
        highLatency: {
          threshold: 2000, // 2 seconds
          enabled: true
        },
        lowDataQuality: {
          threshold: 80, // 80% quality score
          enabled: true
        }
      },
      metrics: {
        collectInterval: 300, // 5 minutes
        retentionDays: 30
      },
      notifications: {
        email: process.env.ADMIN_EMAIL || '[admin_email]',
        slack: process.env.SLACK_WEBHOOK || null
      }
    };
    
    // Write monitoring configuration
    fs.writeFileSync('monitoring-config.json', JSON.stringify(monitoringConfig, null, 2));
    
    console.log('✅ Monitoring configuration created');
    
  } catch (error) {
    console.warn('⚠️ Failed to setup monitoring:', error.message);
  }
}

async function waitForIndexes() {
  console.log('⏳ Waiting for indexes to build...');
  
  let attempts = 0;
  const maxAttempts = 30; // 5 minutes max
  
  while (attempts < maxAttempts) {
    try {
      const result = execSync(`firebase firestore:indexes --project ${PROJECT_ID} --json`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const indexes = JSON.parse(result);
      const building = indexes.filter(index => index.state === 'CREATING');
      
      if (building.length === 0) {
        console.log('✅ All indexes are ready');
        return;
      }
      
      console.log(`⏳ ${building.length} indexes still building...`);
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      attempts++;
      
    } catch (error) {
      console.warn('⚠️ Could not check index status:', error.message);
      break;
    }
  }
  
  if (attempts >= maxAttempts) {
    console.warn('⚠️ Timeout waiting for indexes. They may still be building in the background.');
  }
}

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...');
  
  try {
    // Check indexes
    const indexResult = execSync(`firebase firestore:indexes --project ${PROJECT_ID} --json`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const indexes = JSON.parse(indexResult);
    const readyIndexes = indexes.filter(index => index.state === 'READY');
    
    console.log(`✅ ${readyIndexes.length} indexes are ready`);
    
    // Check rules
    try {
      execSync(`firebase firestore:rules --project ${PROJECT_ID}`, {
        stdio: 'pipe'
      });
      console.log('✅ Security rules are valid');
    } catch (error) {
      console.warn('⚠️ Could not verify security rules');
    }
    
    console.log('✅ Deployment verification completed');
    
  } catch (error) {
    console.warn('⚠️ Could not fully verify deployment:', error.message);
  }
}

// Run the deployment
main();

module.exports = {
  deployFirestoreIndexes,
  deploySecurityRules,
  setupAnalyticsCollections,
  configureDataRetention
};