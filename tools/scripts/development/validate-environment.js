#!/usr/bin/env node

/**
 * Environment Validation Script
 * Checks if all required environment variables are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Validating Environment Configuration...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.local.example');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  if (fs.existsSync(envExamplePath)) {
    console.log('💡 Run: cp .env.local.example .env.local');
  }
  process.exit(1);
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: envPath });

const requiredVars = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
  'NEXT_PUBLIC_SANITY_API_VERSION'
];

const optionalVars = [
  'SANITY_API_TOKEN',
  'NEXT_PUBLIC_SITE_URL',
  'SANITY_WEBHOOK_SECRET'
];

let hasErrors = false;
let hasWarnings = false;

console.log('📋 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: Not set`);
    hasErrors = true;
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`⚠️  ${varName}: Not set`);
    if (varName === 'SANITY_API_TOKEN') {
      console.log('   → Blog writing and analytics will be limited');
      hasWarnings = true;
    }
  }
});

console.log('\n🔍 Configuration Analysis:');

// Check Sanity configuration
if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID.includes('your_') || 
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === 'your_sanity_project_id') {
    console.log('❌ SANITY_PROJECT_ID appears to be a placeholder');
    hasErrors = true;
  } else {
    console.log('✅ Sanity Project ID looks valid');
  }
}

if (process.env.SANITY_API_TOKEN) {
  if (process.env.SANITY_API_TOKEN.includes('your_') || 
      process.env.SANITY_API_TOKEN === 'your_sanity_write_token_here') {
    console.log('❌ SANITY_API_TOKEN appears to be a placeholder');
    hasErrors = true;
  } else {
    console.log('✅ Sanity API Token is configured');
  }
} else {
  console.log('⚠️  Sanity API Token not configured - write operations will be skipped');
}

// Dataset check
if (process.env.NEXT_PUBLIC_SANITY_DATASET) {
  if (['production', 'development'].includes(process.env.NEXT_PUBLIC_SANITY_DATASET)) {
    console.log(`✅ Using ${process.env.NEXT_PUBLIC_SANITY_DATASET} dataset`);
  } else {
    console.log(`⚠️  Using custom dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
  }
}

console.log('\n📊 Summary:');
if (hasErrors) {
  console.log('❌ Configuration has errors - some features will not work');
  console.log('📖 See docs/ENVIRONMENT_SETUP.md for detailed setup instructions');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Configuration has warnings - some features will be limited');
  console.log('📖 See docs/ENVIRONMENT_SETUP.md for full feature setup');
} else {
  console.log('✅ Configuration looks good!');
}

console.log('\n🚀 You can now run: npm run dev');