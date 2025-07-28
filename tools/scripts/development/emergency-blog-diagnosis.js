#!/usr/bin/env node

/**
 * Emergency Blog System Diagnosis Script
 * 
 * This script performs immediate diagnosis of the blog system to identify
 * why posts aren't displaying and admin functionality isn't working.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log('bright', `  ${title}`);
  console.log('='.repeat(60));
}

function logSubSection(title) {
  console.log('\n' + '-'.repeat(40));
  log('cyan', `${title}`);
  console.log('-'.repeat(40));
}

async function main() {
  log('bright', '🚨 EMERGENCY BLOG SYSTEM DIAGNOSIS');
  log('white', 'Checking what went wrong with your blog system...\n');

  // Step 1: Environment Variables Check
  logSection('1. ENVIRONMENT CONFIGURATION CHECK');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET', 
    'NEXT_PUBLIC_SANITY_API_VERSION',
    'SANITY_API_TOKEN'
  ];

  let envIssues = [];
  
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log('red', `❌ ${varName}: MISSING`);
      envIssues.push(`${varName} is not set`);
    } else {
      // Mask sensitive tokens
      const displayValue = varName.includes('TOKEN') 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 8)}`
        : value;
      log('green', `✅ ${varName}: ${displayValue}`);
    }
  });

  if (envIssues.length > 0) {
    log('red', '\n🚨 CRITICAL: Environment variables are missing!');
    envIssues.forEach(issue => log('red', `   - ${issue}`));
    log('yellow', '\nPlease check your .env.local file and ensure all Sanity variables are set.');
    return;
  }

  // Step 2: Sanity Client Creation
  logSection('2. SANITY CLIENT INITIALIZATION');
  
  let client;
  try {
    client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      useCdn: false, // Use fresh data for diagnosis
      token: process.env.SANITY_API_TOKEN,
    });
    
    log('green', '✅ Sanity client created successfully');
    log('blue', `   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    log('blue', `   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    log('blue', `   API Version: ${process.env.NEXT_PUBLIC_SANITY_API_VERSION}`);
  } catch (error) {
    log('red', `❌ Failed to create Sanity client: ${error.message}`);
    return;
  }

  // Step 3: Basic Connection Test
  logSection('3. SANITY CONNECTION TEST');
  
  try {
    const startTime = Date.now();
    const testQuery = '*[_type == "post"][0]._id';
    await client.fetch(testQuery);
    const latency = Date.now() - startTime;
    
    log('green', `✅ Connection successful (${latency}ms)`);
  } catch (error) {
    log('red', `❌ Connection failed: ${error.message}`);
    
    // Provide specific guidance based on error type
    if (error.message.includes('Unauthorized')) {
      log('yellow', '\n💡 SOLUTION: Your API token may be invalid or expired.');
      log('yellow', '   1. Go to https://sanity.io/manage');
      log('yellow', '   2. Select your project');
      log('yellow', '   3. Go to API → Tokens');
      log('yellow', '   4. Create a new token with Editor permissions');
      log('yellow', '   5. Update SANITY_API_TOKEN in your .env.local file');
    } else if (error.message.includes('not found')) {
      log('yellow', '\n💡 SOLUTION: Project ID or dataset may be incorrect.');
      log('yellow', '   1. Verify NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local');
      log('yellow', '   2. Verify NEXT_PUBLIC_SANITY_DATASET in .env.local');
    }
    return;
  }

  // Step 4: Blog Posts Discovery
  logSection('4. BLOG POSTS DISCOVERY');
  
  try {
    // Check for posts in different states
    const queries = {
      'Published Posts': '*[_type == "post" && !(_id in path("drafts.**"))]',
      'Draft Posts': '*[_id in path("drafts.**") && _type == "post"]',
      'All Posts (including drafts)': '*[_type == "post"]'
    };

    let totalPostsFound = 0;
    let publishedPosts = [];
    let allPostCounts = {};

    for (const [queryName, query] of Object.entries(queries)) {
      logSubSection(queryName);
      
      try {
        const posts = await client.fetch(query);
        log('blue', `Found ${posts.length} posts`);
        
        allPostCounts[queryName] = posts.length;
        
        if (queryName === 'Published Posts') {
          publishedPosts = posts;
          totalPostsFound = posts.length; // Only count published posts for main total
        }
        
        if (posts.length > 0) {
          posts.slice(0, 5).forEach((post, index) => {
            log('white', `   ${index + 1}. ${post.title || 'Untitled'} (ID: ${post._id})`);
            if (post.slug?.current) {
              log('white', `      Slug: ${post.slug.current}`);
            }
            if (post.publishedAt) {
              log('white', `      Published: ${new Date(post.publishedAt).toLocaleDateString()}`);
            }
          });
          
          if (posts.length > 5) {
            log('white', `   ... and ${posts.length - 5} more posts`);
          }
        }
      } catch (error) {
        log('red', `❌ Error querying ${queryName}: ${error.message}`);
      }
    }

    if (totalPostsFound === 0) {
      log('yellow', '\n⚠️  NO POSTS FOUND IN SANITY CMS');
      log('yellow', 'This explains why your blog page is empty.');
      log('yellow', '\n💡 POSSIBLE CAUSES:');
      log('yellow', '   1. Posts were accidentally deleted');
      log('yellow', '   2. Posts are in a different dataset');
      log('yellow', '   3. Posts have a different _type than "post"');
      log('yellow', '   4. Database connection is pointing to wrong project');
    } else {
      log('green', `\n✅ Found ${totalPostsFound} total posts in Sanity`);
      
      if (publishedPosts.length === 0) {
        log('yellow', '⚠️  But no PUBLISHED posts found!');
        log('yellow', 'All posts might be in draft state.');
      }
    }

  } catch (error) {
    log('red', `❌ Error during post discovery: ${error.message}`);
  }

  // Step 5: Schema Validation
  logSection('5. SCHEMA VALIDATION');
  
  try {
    // Check if required document types exist
    const schemaTypes = ['post', 'author', 'category'];
    
    for (const type of schemaTypes) {
      try {
        const count = await client.fetch(`count(*[_type == "${type}"])`);
        log('blue', `${type}: ${count} documents`);
      } catch (error) {
        log('red', `❌ Error checking ${type}: ${error.message}`);
      }
    }
  } catch (error) {
    log('red', `❌ Schema validation failed: ${error.message}`);
  }

  // Step 6: API Token Permissions Test
  logSection('6. API TOKEN PERMISSIONS TEST');
  
  try {
    // Test read permissions
    await client.fetch('*[_type == "post"][0]');
    log('green', '✅ Read permissions: OK');
    
    // Test write permissions by creating and deleting a test document
    try {
      const testDoc = {
        _type: 'post',
        _id: `test-${Date.now()}`,
        title: 'Connection Test - Will be deleted',
        slug: { current: `test-${Date.now()}` },
        publishedAt: new Date().toISOString(),
        excerpt: 'Test document for connection validation',
        body: [],
        featured: false,
        readingTime: 1,
        tags: ['test']
      };
      
      const created = await client.create(testDoc);
      await client.delete(created._id);
      
      log('green', '✅ Write permissions: OK');
    } catch (writeError) {
      log('red', `❌ Write permissions: FAILED - ${writeError.message}`);
      log('yellow', '\n💡 SOLUTION: Your API token needs write permissions.');
      log('yellow', '   1. Go to https://sanity.io/manage');
      log('yellow', '   2. Select your project');
      log('yellow', '   3. Go to API → Tokens');
      log('yellow', '   4. Edit your token and ensure it has "Editor" or "Administrator" permissions');
    }
    
  } catch (error) {
    log('red', `❌ Permission test failed: ${error.message}`);
  }

  // Step 7: Generate Summary and Recommendations
  logSection('7. DIAGNOSIS SUMMARY & RECOMMENDATIONS');
  
  log('bright', '📋 SUMMARY:');
  
  if (totalPostsFound > 0) {
    log('green', `✅ Found ${totalPostsFound} posts in Sanity CMS`);
    log('yellow', '⚠️  Issue: Posts exist but aren\'t displaying on your website');
    
    log('bright', '\n🔧 RECOMMENDED ACTIONS:');
    log('cyan', '1. Clear your application cache and restart the development server');
    log('cyan', '2. Check if your blog listing component is properly fetching from Sanity');
    log('cyan', '3. Verify your blog API endpoints are working correctly');
    log('cyan', '4. Check browser console for JavaScript errors on the blog page');
    
    log('bright', '\n🚀 IMMEDIATE FIXES TO TRY:');
    log('white', '1. Run: npm run dev (restart your development server)');
    log('white', '2. Clear browser cache and refresh /blog page');
    log('white', '3. Check browser developer tools console for errors');
  } else {
    log('red', '❌ No posts found in Sanity CMS');
    log('yellow', '⚠️  This explains why your blog page is empty');
    
    log('bright', '\n🔧 RECOMMENDED ACTIONS:');
    log('cyan', '1. Check if posts were accidentally deleted');
    log('cyan', '2. Verify you\'re connected to the correct Sanity project and dataset');
    log('cyan', '3. Try creating a new test post through the admin interface');
    log('cyan', '4. Check Sanity Studio to see if posts exist there');
  }

  log('bright', '\n📞 NEXT STEPS:');
  log('white', '1. If posts exist but aren\'t showing: Focus on frontend/API issues');
  log('white', '2. If no posts exist: Focus on data recovery or recreation');
  log('white', '3. If admin interface isn\'t working: Check API token permissions');
  
  log('green', '\n✅ Diagnosis complete! Use the recommendations above to fix your blog system.');
}

// Run the diagnosis
main().catch(error => {
  log('red', `\n💥 DIAGNOSIS SCRIPT FAILED: ${error.message}`);
  console.error(error);
  process.exit(1);
});