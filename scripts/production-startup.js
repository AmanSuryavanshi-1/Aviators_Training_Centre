#!/usr/bin/env node

/**
 * Production Startup Script
 * Validates environment and configuration before starting the application
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET', 
  'SANITY_API_TOKEN',
  'NEXT_PUBLIC_SITE_URL',
];

// Optional but recommended environment variables
const RECOMMENDED_ENV_VARS = [
  'FIREBASE_API_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
];

/**
 * Check environment variables
 */
function checkEnvironmentVariables() {
  console.log('🔧 Checking Environment Variables...');
  
  const missing = [];
  const missingRecommended = [];
  
  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: set`);
    }
  }
  
  // Check recommended variables
  for (const varName of RECOMMENDED_ENV_VARS) {
    if (!process.env[varName]) {
      missingRecommended.push(varName);
    } else {
      console.log(`✅ ${varName}: set`);
    }
  }
  
  // Report missing required variables
  if (missing.length > 0) {
    console.log('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
    missing.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('\n💡 Please set these variables in your .env.production file');
    return false;
  }
  
  // Report missing recommended variables
  if (missingRecommended.length > 0) {
    console.log('\n⚠️  MISSING RECOMMENDED ENVIRONMENT VARIABLES:');
    missingRecommended.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('   These are optional but recommended for full functionality');
  }
  
  return true;
}

/**
 * Validate Sanity configuration
 */
async function validateSanityConfig() {
  console.log('\n🎨 Validating Sanity Configuration...');
  
  try {
    const { createClient } = require('@sanity/client');
    
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
      useCdn: false,
    });
    
    // Test basic query
    const testQuery = '*[_type == "post"][0...1]{_id, title}';
    const result = await client.fetch(testQuery);
    
    console.log(`✅ Sanity connection successful`);
    console.log(`✅ Found ${result.length} test posts`);
    
    // Test write permissions
    try {
      await client.request({
        url: `/projects/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`,
        method: 'GET',
      });
      console.log(`✅ Sanity write permissions confirmed`);
    } catch (error) {
      console.log(`⚠️  Sanity write permissions may be limited`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Sanity validation failed: ${error.message}`);
    return false;
  }
}

/**
 * Check file permissions and structure
 */
function checkFileStructure() {
  console.log('\n📁 Checking File Structure...');
  
  const criticalPaths = [
    'src/app/studio/[[...index]]/page.tsx',
    'src/app/login/page.tsx',
    'src/app/api/auth/login/route.ts',
    'src/middleware.ts',
    'studio/sanity.config.ts',
  ];
  
  let allExist = true;
  
  for (const filePath of criticalPaths) {
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${filePath}`);
    } else {
      console.log(`❌ ${filePath} - MISSING`);
      allExist = false;
    }
  }
  
  return allExist;
}

/**
 * Validate production URLs
 */
function validateProductionUrls() {
  console.log('\n🌐 Validating Production URLs...');
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!siteUrl) {
    console.log('❌ NEXT_PUBLIC_SITE_URL not set');
    return false;
  }
  
  if (!siteUrl.startsWith('https://')) {
    console.log('❌ NEXT_PUBLIC_SITE_URL must use HTTPS in production');
    return false;
  }
  
  console.log(`✅ Site URL: ${siteUrl}`);
  console.log(`✅ Studio URL: ${siteUrl}/studio`);
  console.log(`✅ Admin URL: ${siteUrl}/admin`);
  
  return true;
}

/**
 * Generate startup report
 */
function generateStartupReport() {
  const report = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    sanityProject: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    sanityDataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    authMethod: 'sanity-studio',
    hasSanityToken: !!process.env.SANITY_API_TOKEN,
  };
  
  // Write report to file
  const reportPath = path.join(process.cwd(), 'startup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Startup report written to: ${reportPath}`);
  return report;
}

/**
 * Main startup validation
 */
async function validateStartup() {
  console.log('🚀 PRODUCTION STARTUP VALIDATION');
  console.log('═'.repeat(50));
  
  let allChecksPass = true;
  
  // 1. Check environment variables
  if (!checkEnvironmentVariables()) {
    allChecksPass = false;
  }
  
  // 2. Validate Sanity configuration
  if (!await validateSanityConfig()) {
    allChecksPass = false;
  }
  
  // 3. Check file structure
  if (!checkFileStructure()) {
    allChecksPass = false;
  }
  
  // 4. Validate production URLs
  if (!validateProductionUrls()) {
    allChecksPass = false;
  }
  
  // 5. Generate report
  const report = generateStartupReport();
  
  console.log('\n═'.repeat(50));
  
  if (allChecksPass) {
    console.log('🎉 STARTUP VALIDATION PASSED');
    console.log('✨ All systems ready for production');
    console.log('\n🔗 Quick Links:');
    console.log(`   Admin: ${process.env.NEXT_PUBLIC_SITE_URL}/admin`);
    console.log(`   Studio: ${process.env.NEXT_PUBLIC_SITE_URL}/studio`);
    console.log(`   Login: ${process.env.NEXT_PUBLIC_SITE_URL}/login`);
    return true;
  } else {
    console.log('💥 STARTUP VALIDATION FAILED');
    console.log('❌ Critical issues detected - please fix before deployment');
    console.log('\n🔧 Common fixes:');
    console.log('   1. Copy .env.production.example to .env.production');
    console.log('   2. Fill in all required environment variables');
    console.log('   3. Ensure Sanity project is accessible');
    console.log('   4. Verify all critical files exist');
    return false;
  }
}

// Run validation if called directly
if (require.main === module) {
  validateStartup()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Startup validation failed:', error);
      process.exit(1);
    });
}

module.exports = { validateStartup };