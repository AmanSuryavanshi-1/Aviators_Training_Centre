#!/usr/bin/env node

/**
 * Simple production readiness check for ATC website
 * Focuses on essential functionality only
 */

require('dotenv').config({ path: '.env.local' });

function checkEnvVar(name, required = true) {
  const value = process.env[name];
  const exists = !!value;
  const status = exists ? '✅' : (required ? '❌' : '⚠️');
  const message = exists ? 'Set' : (required ? 'Missing (Required)' : 'Missing (Optional)');
  
  console.log(`   ${status} ${name}: ${message}`);
  return exists;
}

async function checkProductionReadiness() {
  console.log('🚀 Production Readiness Check for ATC Website');
  console.log('==============================================\n');
  
  let criticalIssues = 0;
  let warnings = 0;
  
  // 1. Sanity CMS (Critical)
  console.log('📝 Sanity CMS Configuration:');
  if (!checkEnvVar('NEXT_PUBLIC_SANITY_PROJECT_ID')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_SANITY_DATASET')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_SANITY_API_VERSION')) criticalIssues++;
  if (!checkEnvVar('SANITY_API_TOKEN')) criticalIssues++;
  console.log('');
  
  // 2. Site Configuration (Critical)
  console.log('🌐 Site Configuration:');
  if (!checkEnvVar('NEXT_PUBLIC_SITE_URL')) criticalIssues++;
  console.log('');
  
  // 3. Firebase (Critical for contact forms)
  console.log('🔥 Firebase Configuration:');
  if (!checkEnvVar('NEXT_PUBLIC_FIREBASE_API_KEY')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_FIREBASE_PROJECT_ID')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID')) criticalIssues++;
  if (!checkEnvVar('NEXT_PUBLIC_FIREBASE_APP_ID')) criticalIssues++;
  if (!checkEnvVar('FIREBASE_PRIVATE_KEY')) criticalIssues++;
  if (!checkEnvVar('FIREBASE_CLIENT_EMAIL')) criticalIssues++;
  console.log('');
  
  // 4. Email Service (Critical for contact forms)
  console.log('📧 Email Configuration:');
  if (!checkEnvVar('RESEND_API_KEY')) criticalIssues++;
  if (!checkEnvVar('FROM_EMAIL')) criticalIssues++;
  if (!checkEnvVar('OWNER1_EMAIL')) criticalIssues++;
  if (!checkEnvVar('OWNER2_EMAIL')) criticalIssues++;
  console.log('');
  
  // 5. Analytics (Optional)
  console.log('📊 Analytics Configuration:');
  if (!checkEnvVar('NEXT_PUBLIC_GA_MEASUREMENT_ID', false)) warnings++;
  console.log('');
  
  // 6. Security (Important)
  console.log('🔒 Security Configuration:');
  if (!checkEnvVar('JWT_SECRET')) criticalIssues++;
  console.log('');
  
  // Test Sanity Connection
  console.log('🧪 Testing Sanity Connection...');
  try {
    const { createClient } = require('@sanity/client');
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      token: process.env.SANITY_API_TOKEN,
      useCdn: false
    });
    
    const posts = await client.fetch('*[_type == "post"] | order(publishedAt desc) [0...1]');
    console.log(`   ✅ Sanity connection successful (${posts.length} posts found)`);
  } catch (error) {
    console.log(`   ❌ Sanity connection failed: ${error.message}`);
    criticalIssues++;
  }
  console.log('');
  
  // Summary
  console.log('📋 SUMMARY:');
  console.log('==========');
  
  if (criticalIssues === 0) {
    console.log('✅ All critical requirements met!');
    console.log('🚀 Your website is ready for production deployment.');
    
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} optional feature(s) not configured (won't affect core functionality)`);
    }
    
    console.log('\n🎯 What you need to do:');
    console.log('1. Add these environment variables to Vercel:');
    console.log('   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('   - Copy all variables from your .env.local file');
    console.log('   - Deploy your application');
    console.log('\n2. Test your live website:');
    console.log('   - Visit https://www.aviatorstrainingcentre.in');
    console.log('   - Check that blog posts load correctly');
    console.log('   - Test contact form functionality');
    console.log('   - Access Sanity Studio at /studio');
    
    return true;
  } else {
    console.log(`❌ ${criticalIssues} critical issue(s) found.`);
    console.log('🔧 Please fix the missing environment variables above.');
    return false;
  }
}

// Run the check
if (require.main === module) {
  checkProductionReadiness()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Check failed:', error);
      process.exit(1);
    });
}

module.exports = { checkProductionReadiness };