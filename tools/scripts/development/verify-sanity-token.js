#!/usr/bin/env node

console.log('🔍 Verifying Sanity API Token Configuration...');

import { createClient } from '@sanity/client';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('\n📋 Current Configuration:');
console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
console.log(`API Version: ${process.env.NEXT_PUBLIC_SANITY_API_VERSION}`);
console.log(`Token Length: ${process.env.SANITY_API_TOKEN ? process.env.SANITY_API_TOKEN.length : 'Not found'} characters`);
console.log(`Token Prefix: ${process.env.SANITY_API_TOKEN ? process.env.SANITY_API_TOKEN.substring(0, 10) + '...' : 'Not found'}`);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
});

async function verifyToken() {
  try {
    console.log('\n🔍 Testing API Access...');
    
    // Test basic read access
    console.log('📖 Testing read access...');
    const posts = await client.fetch(`*[_type == "post"][0...3]`);
    console.log(`✅ Read access successful - found ${posts.length} posts`);
    
    // Test write access with a minimal document
    console.log('✍️  Testing write access...');
    
    try {
      const testDoc = await client.create({
        _type: 'post',
        title: 'API Test - Please Delete',
        slug: { current: 'api-test-delete-me' },
        excerpt: 'This is a test document to verify API write permissions.',
        body: [
          {
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: 'Test content for API verification.' }]
          }
        ],
        publishedAt: new Date().toISOString(),
        readingTime: 1,
        workflowStatus: 'draft'
      });
      
      console.log(`✅ Write access successful! Created test document: ${testDoc._id}`);
      
      // Clean up test document
      await client.delete(testDoc._id);
      console.log(`🧹 Test document cleaned up successfully`);
      
      return true;
      
    } catch (writeError) {
      console.log(`❌ Write access failed: ${writeError.message}`);
      
      if (writeError.message.includes('Insufficient permissions')) {
        console.log('\n🔧 TROUBLESHOOTING STEPS:');
        console.log('1. Go to your Sanity project dashboard');
        console.log('2. Navigate to API → Tokens');
        console.log('3. Create a new token with "Editor" or "Admin" permissions');
        console.log('4. Update the SANITY_API_TOKEN in your .env.local file');
        console.log('5. Make sure the token has permissions for your dataset');
        console.log('6. Restart your development server');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    return false;
  }
}

async function checkExistingData() {
  try {
    console.log('\n📊 Checking existing data...');
    
    const categories = await client.fetch(`*[_type == "category"]`);
    console.log(`📂 Categories: ${categories.length}`);
    categories.forEach(cat => console.log(`   - ${cat.title}`));
    
    const authors = await client.fetch(`*[_type == "author"]`);
    console.log(`👤 Authors: ${authors.length}`);
    authors.forEach(author => console.log(`   - ${author.name}`));
    
    const posts = await client.fetch(`*[_type == "post"]`);
    console.log(`📝 Posts: ${posts.length}`);
    
  } catch (error) {
    console.log('❌ Could not fetch existing data:', error.message);
  }
}

// Production Token Guidance
function showProductionGuidance() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PRODUCTION DEPLOYMENT GUIDANCE');
  console.log('='.repeat(60));
  console.log('\n📋 Token Strategy for Production:');
  console.log('\n🔒 RECOMMENDED APPROACH:');
  console.log('1. Use READ-ONLY token in production environment');
  console.log('2. Keep EDITOR token only in local development');
  console.log('3. Use separate tokens for different environments');
  console.log('\n💡 REASONING:');
  console.log('• Production should only read content, not create/modify');
  console.log('• Admin panel will be used for content management');
  console.log('• Reduces security risk if production token is compromised');
  console.log('• Better separation of concerns');
  console.log('\n🔧 IMPLEMENTATION:');
  console.log('• .env.local (development): EDITOR token');
  console.log('• .env.production: READ-ONLY token');
  console.log('• Admin dashboard: Uses EDITOR token for management');
  console.log('\n⚠️  SECURITY NOTE:');
  console.log('• Never commit tokens to version control');
  console.log('• Use environment variables in production');
  console.log('• Rotate tokens periodically');
  console.log('• Monitor token usage in Sanity dashboard');
}

// Run verification
verifyToken().then(async (hasWriteAccess) => {
  await checkExistingData();
  showProductionGuidance();
  
  if (hasWriteAccess) {
    console.log('\n🎉 Token verification successful! Ready to publish blog posts.');
  } else {
    console.log('\n⚠️  Token needs to be updated with write permissions.');
  }
}).catch(console.error);
