#!/usr/bin/env node

/**
 * Simple environment validation script
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Environment Validation');
console.log('='.repeat(40));

const requiredVars = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET', 
  'SANITY_API_TOKEN'
];

const optionalVars = [
  'NEXT_PUBLIC_SANITY_API_VERSION',
  'NEXT_PUBLIC_SITE_URL'
];

let allValid = true;

console.log('\n📋 Required Environment Variables:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allValid = false;
  }
}

console.log('\n📋 Optional Environment Variables:');
for (const varName of optionalVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: Not set (using default)`);
  }
}

console.log('\n' + '='.repeat(40));

if (allValid) {
  console.log('🎉 All required environment variables are configured!');
  
  // Test basic Sanity client creation
  try {
    const { createClient } = await import('@sanity/client');
    
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
      useCdn: false
    });
    
    console.log('✅ Sanity client created successfully');
    
    // Test basic connection
    const testQuery = '*[_type == "post"][0]._id';
    await client.fetch(testQuery);
    console.log('✅ Sanity connection test successful');
    
  } catch (error) {
    console.log(`❌ Sanity connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allValid = false;
  }
} else {
  console.log('❌ Some required environment variables are missing.');
  console.log('\n🔧 To fix this:');
  console.log('1. Copy .env.local.example to .env.local');
  console.log('2. Fill in your Sanity project details');
  console.log('3. Get your API token from https://sanity.io/manage');
}

process.exit(allValid ? 0 : 1);