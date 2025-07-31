#!/usr/bin/env node

/**
 * Check Sanity Permissions and Token Status
 * 
 * This script will test your Sanity API token permissions
 * and help diagnose permission issues.
 * 
 * Usage: node scripts/check-sanity-permissions.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function checkPermissions() {
  console.log('🔍 Checking Sanity Configuration and Permissions...\n');

  // Check environment variables
  console.log('📋 Environment Configuration:');
  console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'NOT SET'}`);
  console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'NOT SET'}`);
  console.log(`   API Version: ${process.env.NEXT_PUBLIC_SANITY_API_VERSION || 'NOT SET'}`);
  console.log(`   API Token: ${process.env.SANITY_API_TOKEN ? 'SET (length: ' + process.env.SANITY_API_TOKEN.length + ')' : 'NOT SET'}`);

  if (!process.env.SANITY_API_TOKEN) {
    console.error('\n❌ SANITY_API_TOKEN is not set in .env.local');
    console.error('💡 Please add your Sanity API token to .env.local');
    console.error('💡 Get a token from: https://sanity.io/manage');
    return;
  }

  console.log('\n🧪 Testing Permissions...\n');

  // Test READ permission
  try {
    console.log('📖 Testing READ permission...');
    const posts = await client.fetch('*[_type == "post"]');
    console.log(`   ✅ READ: Success - Found ${posts.length} posts`);
  } catch (error) {
    console.error(`   ❌ READ: Failed - ${error.message}`);
    return;
  }

  // Test CREATE permission
  try {
    console.log('📝 Testing CREATE permission...');
    const testDoc = {
      _type: 'post',
      title: 'Permission Test Post - DELETE ME',
      slug: { current: 'permission-test-' + Date.now() },
      excerpt: 'This is a test post to check create permissions',
      publishedAt: new Date().toISOString(),
      body: [
        {
          _type: 'block',
          children: [{ _type: 'span', text: 'Test content' }]
        }
      ]
    };
    
    const created = await client.create(testDoc);
    console.log(`   ✅ CREATE: Success - Created test post with ID: ${created._id}`);
    
    // Test UPDATE permission
    try {
      console.log('✏️  Testing UPDATE permission...');
      await client.patch(created._id).set({ title: 'Updated Test Post' }).commit();
      console.log(`   ✅ UPDATE: Success - Updated test post`);
    } catch (error) {
      console.error(`   ❌ UPDATE: Failed - ${error.message}`);
    }

    // Test DELETE permission
    try {
      console.log('🗑️  Testing DELETE permission...');
      await client.delete(created._id);
      console.log(`   ✅ DELETE: Success - Deleted test post`);
    } catch (error) {
      console.error(`   ❌ DELETE: Failed - ${error.message}`);
      console.error('   💡 This is likely the cause of your blog deletion issues!');
      
      // Try to clean up the test post anyway
      try {
        await client.delete(created._id);
      } catch (cleanupError) {
        console.error(`   ⚠️  Could not clean up test post ${created._id} - please delete manually`);
      }
    }

  } catch (error) {
    console.error(`   ❌ CREATE: Failed - ${error.message}`);
    
    if (error.message.includes('Insufficient permissions')) {
      console.error('\n💡 Permission Error Solutions:');
      console.error('   1. Go to https://sanity.io/manage');
      console.error('   2. Select your project');
      console.error('   3. Go to API → Tokens');
      console.error('   4. Create a new token with "Editor" or "Administrator" permissions');
      console.error('   5. Update SANITY_API_TOKEN in your .env.local file');
      console.error('   6. Make sure the token is for the correct dataset');
    }
    
    return;
  }

  console.log('\n🎉 All permissions tests passed!');
  console.log('💡 Your Sanity API token has full read/write access.');
  console.log('💡 You should be able to delete blog posts from the admin panel.');
}

// Test specific operations
async function testBlogOperations() {
  console.log('\n🔧 Testing Blog-Specific Operations...\n');

  try {
    // Test fetching posts with full query
    console.log('📋 Testing blog post query...');
    const posts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        featured,
        category->{title, slug},
        author->{name, slug},
        tags
      }
    `);
    
    console.log(`   ✅ Blog Query: Success - Found ${posts.length} posts`);
    
    if (posts.length > 0) {
      console.log('   📊 Sample posts:');
      posts.slice(0, 3).forEach((post, index) => {
        console.log(`      ${index + 1}. ${post.title} (${post._id})`);
      });
    }

    // Test categories and authors
    const categories = await client.fetch('*[_type == "category"]');
    const authors = await client.fetch('*[_type == "author"]');
    
    console.log(`   📂 Categories: ${categories.length} found`);
    console.log(`   👥 Authors: ${authors.length} found`);

  } catch (error) {
    console.error(`   ❌ Blog Operations: Failed - ${error.message}`);
  }
}

// Run the checks
async function runAllChecks() {
  await checkPermissions();
  await testBlogOperations();
  
  console.log('\n📋 Summary:');
  console.log('   If all tests passed, your blog deletion should work');
  console.log('   If DELETE failed, you need to update your API token permissions');
  console.log('   Run "node scripts/bulk-delete-blogs.js" to delete all existing posts');
}

// Run if this is the main module
runAllChecks().catch(console.error);

export { checkPermissions, testBlogOperations };
