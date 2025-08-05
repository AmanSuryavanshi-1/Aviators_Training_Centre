#!/usr/bin/env node

/**
 * Debug Firebase Configuration
 * 
 * This script checks what Firebase configuration is actually being used
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔍 FIREBASE CONFIGURATION DEBUG');
console.log('='.repeat(50));
console.log('');

console.log('📋 Environment Variables:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('NEXT_PUBLIC_FIREBASE_DATABASE_URL:', process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);

console.log('\n📋 Server-side Variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET' : 'NOT SET');

console.log('\n🔍 Configuration Analysis:');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase Config Object:');
console.log(JSON.stringify(firebaseConfig, null, 2));

console.log('\n🔍 Issues Check:');
const issues = [];

if (!firebaseConfig.apiKey) issues.push('Missing API Key');
if (!firebaseConfig.authDomain) issues.push('Missing Auth Domain');
if (!firebaseConfig.databaseURL) issues.push('Missing Database URL');
if (!firebaseConfig.projectId) issues.push('Missing Project ID');
if (!firebaseConfig.storageBucket) issues.push('Missing Storage Bucket');
if (!firebaseConfig.messagingSenderId) issues.push('Missing Messaging Sender ID');
if (!firebaseConfig.appId) issues.push('Missing App ID');

if (issues.length > 0) {
  console.log('❌ Configuration Issues:');
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('✅ All required configuration values are present');
}

// Check database URL region
if (firebaseConfig.databaseURL) {
  if (firebaseConfig.databaseURL.includes('asia-southeast1')) {
    console.log('✅ Database URL is using correct region (asia-southeast1)');
  } else {
    console.log('⚠️  Database URL region might be incorrect');
    console.log('   Current:', firebaseConfig.databaseURL);
    console.log('   Expected: Should include "asia-southeast1"');
  }
} else {
  console.log('❌ Database URL is missing');
}

console.log('\n💡 Recommendations:');
if (issues.length > 0) {
  console.log('1. Check your .env.local file');
  console.log('2. Ensure all NEXT_PUBLIC_ prefixed variables are set');
  console.log('3. Restart your development server after making changes');
} else {
  console.log('1. Configuration looks correct');
  console.log('2. If contact form is still not working, check for Firebase app conflicts');
  console.log('3. Check browser console for Firebase initialization errors');
}