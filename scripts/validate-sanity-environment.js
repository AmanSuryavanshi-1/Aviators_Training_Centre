#!/usr/bin/env node

/**
 * Sanity Environment Validation Script
 * 
 * This script validates that all required Sanity environment variables
 * are properly configured and that the connection to Sanity CMS works.
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function validateEnvironmentVariables() {
  log('\n🔍 Validating Environment Variables...', 'bold');
  
  const requiredVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'NEXT_PUBLIC_SANITY_API_VERSION',
    'SANITY_API_TOKEN'
  ];
  
  const optionalVars = [
    'SANITY_WEBHOOK_SECRET',
    'NEXT_PUBLIC_SANITY_STUDIO_URL',
    'SANITY_PREVIEW_SECRET'
  ];
  
  let allRequired = true;
  
  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      logError(`Missing required environment variable: ${varName}`);
      allRequired = false;
    } else if (value.includes('your_') || value.includes('_here')) {
      logError(`Environment variable ${varName} contains placeholder value: ${value}`);
      allRequired = false;
    } else {
      logSuccess(`${varName} is set`);
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (!value) {
      logWarning(`Optional environment variable not set: ${varName}`);
    } else {
      logSuccess(`${varName} is set`);
    }
  }
  
  // Validate specific values
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (projectId && projectId !== '3u4fa9kl') {
    logWarning(`Project ID is ${projectId}, expected 3u4fa9kl`);
  }
  
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (dataset && dataset !== 'production') {
    logWarning(`Dataset is ${dataset}, expected production`);
  }
  
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  if (apiVersion && apiVersion !== '2024-01-01') {
    logWarning(`API version is ${apiVersion}, expected 2024-01-01`);
  }
  
  const token = process.env.SANITY_API_TOKEN;
  if (token && !token.startsWith('sk')) {
    logError(`SANITY_API_TOKEN should start with 'sk', got: ${token.substring(0, 10)}...`);
    allRequired = false;
  }
  
  return allRequired;
}

async function validateSanityConnection() {
  log('\n🔗 Testing Sanity Connection...', 'bold');
  
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false
    });
    
    // Test basic read operation
    const result = await client.fetch('*[_type == "post"][0]');
    logSuccess('Basic connection successful');
    
    if (result) {
      logSuccess(`Found blog post: "${result.title || 'Untitled'}"`);
    } else {
      logWarning('No blog posts found in Sanity');
    }
    
    return true;
  } catch (error) {
    logError(`Connection failed: ${error.message}`);
    return false;
  }
}

async function validateWritePermissions() {
  log('\n✏️  Testing Write Permissions...', 'bold');
  
  if (!process.env.SANITY_API_TOKEN) {
    logError('Cannot test write permissions: SANITY_API_TOKEN not set');
    return false;
  }
  
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false
    });
    
    // Test create permission with a test document
    const testDoc = {
      _type: 'post',
      title: 'Environment Validation Test',
      slug: { current: 'env-validation-test-' + Date.now() },
      excerpt: 'This is a test document created during environment validation',
      body: [],
      publishedAt: new Date().toISOString(),
      featured: false,
      readingTime: 1
    };
    
    // Create test document
    const created = await client.create(testDoc);
    logSuccess('CREATE permission: Working');
    
    // Update test document
    await client.patch(created._id).set({ title: 'Updated Test Title' }).commit();
    logSuccess('UPDATE permission: Working');
    
    // Delete test document
    await client.delete(created._id);
    logSuccess('DELETE permission: Working');
    
    return true;
  } catch (error) {
    if (error.message.includes('Insufficient permissions')) {
      logError(`Write permissions failed: ${error.message}`);
      logError('Your API token likely has "Viewer" permissions instead of "Editor"');
      logError('Please create a new token with "Editor" permissions');
    } else {
      logError(`Write permissions test failed: ${error.message}`);
    }
    return false;
  }
}

async function validateContentStructure() {
  log('\n📋 Validating Content Structure...', 'bold');
  
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false
    });
    
    // Check for required document types
    const documentTypes = ['post', 'category', 'author'];
    
    for (const type of documentTypes) {
      const count = await client.fetch(`count(*[_type == "${type}"])`);
      if (count > 0) {
        logSuccess(`Found ${count} ${type} document(s)`);
      } else {
        logWarning(`No ${type} documents found`);
      }
    }
    
    // Check for posts with required fields
    const postsWithIssues = await client.fetch(`
      *[_type == "post" && (!defined(title) || !defined(slug) || !defined(excerpt))] {
        _id,
        title,
        slug
      }
    `);
    
    if (postsWithIssues.length > 0) {
      logWarning(`Found ${postsWithIssues.length} posts with missing required fields`);
    } else {
      logSuccess('All posts have required fields');
    }
    
    return true;
  } catch (error) {
    logError(`Content structure validation failed: ${error.message}`);
    return false;
  }
}

function checkEnvironmentFiles() {
  log('\n📁 Checking Environment Files...', 'bold');
  
  const envFiles = [
    '.env.local',
    '.env.local.example',
    '.env.production.example'
  ];
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logSuccess(`${file} exists`);
    } else {
      if (file === '.env.local') {
        logError(`${file} is missing - copy from .env.local.example`);
      } else {
        logWarning(`${file} is missing`);
      }
    }
  }
}

function generateReport(results) {
  log('\n📊 Validation Report', 'bold');
  log('='.repeat(50), 'blue');
  
  const { envVars, connection, writePerms, contentStructure } = results;
  
  const totalChecks = 4;
  const passedChecks = [envVars, connection, writePerms, contentStructure].filter(Boolean).length;
  
  log(`\nOverall Status: ${passedChecks}/${totalChecks} checks passed`, 
    passedChecks === totalChecks ? 'green' : 'yellow');
  
  log('\nDetailed Results:');
  log(`Environment Variables: ${envVars ? '✅ PASS' : '❌ FAIL'}`, envVars ? 'green' : 'red');
  log(`Sanity Connection: ${connection ? '✅ PASS' : '❌ FAIL'}`, connection ? 'green' : 'red');
  log(`Write Permissions: ${writePerms ? '✅ PASS' : '❌ FAIL'}`, writePerms ? 'green' : 'red');
  log(`Content Structure: ${contentStructure ? '✅ PASS' : '❌ FAIL'}`, contentStructure ? 'green' : 'red');
  
  if (passedChecks === totalChecks) {
    log('\n🎉 All validations passed! Your Sanity environment is properly configured.', 'green');
  } else {
    log('\n⚠️  Some validations failed. Please review the errors above and fix them.', 'yellow');
    log('\nFor help, refer to:', 'blue');
    log('- docs/guides/SANITY_ENVIRONMENT_SETUP.md');
    log('- docs/guides/SANITY_SYNC_TROUBLESHOOTING.md');
  }
}

async function main() {
  log('🚀 Sanity Environment Validation', 'bold');
  log('='.repeat(50), 'blue');
  
  // Load environment variables
  config({ path: '.env.local' });
  
  checkEnvironmentFiles();
  
  const results = {
    envVars: await validateEnvironmentVariables(),
    connection: await validateSanityConnection(),
    writePerms: await validateWritePermissions(),
    contentStructure: await validateContentStructure()
  };
  
  generateReport(results);
  
  // Exit with appropriate code
  const allPassed = Object.values(results).every(Boolean);
  process.exit(allPassed ? 0 : 1);
}

// Run the validation
main().catch(error => {
  logError(`Validation script failed: ${error.message}`);
  process.exit(1);
});

export {
  validateEnvironmentVariables,
  validateSanityConnection,
  validateWritePermissions,
  validateContentStructure
};