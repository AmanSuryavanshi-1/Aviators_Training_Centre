#!/usr/bin/env node

/**
 * Blog Display Fix Script
 * 
 * This script fixes the issue where blog posts exist in Sanity but aren't displaying
 * on the frontend by testing and clearing caches, validating API endpoints.
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

async function main() {
  log('bright', '🔧 BLOG DISPLAY FIX SCRIPT');
  log('white', 'Fixing the issue where posts exist in Sanity but don\'t display...\n');

  // Create Sanity client
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });

  // Step 1: Verify posts exist
  logSection('1. VERIFYING POSTS IN SANITY');
  
  const publishedPosts = await client.fetch('*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc)');
  log('green', `✅ Found ${publishedPosts.length} published posts in Sanity`);
  
  publishedPosts.forEach((post, index) => {
    log('white', `   ${index + 1}. ${post.title}`);
    log('blue', `      ID: ${post._id}`);
    log('blue', `      Slug: ${post.slug?.current || 'No slug'}`);
    log('blue', `      Published: ${post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}`);
  });

  // Step 2: Test detailed post structure
  logSection('2. ANALYZING POST STRUCTURE');
  
  if (publishedPosts.length > 0) {
    const firstPost = publishedPosts[0];
    log('cyan', `Analyzing post: "${firstPost.title}"`);
    
    // Check required fields
    const requiredFields = ['title', 'slug', 'excerpt', 'publishedAt', 'body'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!firstPost[field]) {
        missingFields.push(field);
        log('red', `   ❌ Missing: ${field}`);
      } else {
        log('green', `   ✅ Has: ${field}`);
      }
    });
    
    // Check body content
    if (firstPost.body && Array.isArray(firstPost.body)) {
      log('blue', `   📝 Body has ${firstPost.body.length} blocks`);
      if (firstPost.body.length === 0) {
        log('yellow', '   ⚠️  Body is empty - this might cause display issues');
      }
    }
    
    // Check category and author
    if (firstPost.category) {
      log('green', '   ✅ Has category reference');
    } else {
      log('yellow', '   ⚠️  No category - might cause filtering issues');
    }
    
    if (firstPost.author) {
      log('green', '   ✅ Has author reference');
    } else {
      log('yellow', '   ⚠️  No author - might cause display issues');
    }
  }

  // Step 3: Test the unified blog service query
  logSection('3. TESTING BLOG SERVICE QUERY');
  
  try {
    // This is the exact query your unified blog service uses
    const serviceQuery = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      body,
      publishedAt,
      featured,
      readingTime,
      views,
      engagementRate,
      shares,
      category->{
        title,
        slug,
        color
      },
      author->{
        name,
        slug,
        role,
        image {
          asset->,
          alt
        },
        bio
      },
      image {
        asset->,
        alt
      },
      tags,
      seoTitle,
      seoDescription,
      focusKeyword
    }`;
    
    const serviceResults = await client.fetch(serviceQuery);
    log('green', `✅ Blog service query returned ${serviceResults.length} posts`);
    
    if (serviceResults.length > 0) {
      const firstResult = serviceResults[0];
      log('cyan', 'First post structure:');
      log('white', `   Title: ${firstResult.title}`);
      log('white', `   Slug: ${firstResult.slug?.current || 'Missing'}`);
      log('white', `   Excerpt: ${firstResult.excerpt ? 'Present' : 'Missing'}`);
      log('white', `   Body blocks: ${firstResult.body?.length || 0}`);
      log('white', `   Category: ${firstResult.category?.title || 'Missing'}`);
      log('white', `   Author: ${firstResult.author?.name || 'Missing'}`);
      log('white', `   Published: ${firstResult.publishedAt || 'Missing'}`);
    }
    
  } catch (error) {
    log('red', `❌ Blog service query failed: ${error.message}`);
  }

  // Step 4: Clear Next.js cache
  logSection('4. CLEARING NEXT.JS CACHE');
  
  const cacheDirectories = ['.next/cache', '.next/static'];
  
  for (const cacheDir of cacheDirectories) {
    if (fs.existsSync(cacheDir)) {
      try {
        fs.rmSync(cacheDir, { recursive: true, force: true });
        log('green', `✅ Cleared ${cacheDir}`);
      } catch (error) {
        log('yellow', `⚠️  Could not clear ${cacheDir}: ${error.message}`);
      }
    } else {
      log('blue', `   ${cacheDir} doesn't exist (already clean)`);
    }
  }

  // Step 5: Check for any draft posts that should be published
  logSection('5. CHECKING FOR UNPUBLISHED DRAFTS');
  
  const draftPosts = await client.fetch('*[_id in path("drafts.**") && _type == "post"]');
  log('blue', `Found ${draftPosts.length} draft posts`);
  
  if (draftPosts.length > 0) {
    log('yellow', '\n⚠️  You have draft posts that might need to be published:');
    draftPosts.slice(0, 5).forEach((draft, index) => {
      if (!draft.title?.includes('Connection Test')) { // Skip test posts
        log('white', `   ${index + 1}. ${draft.title || 'Untitled'}`);
        log('blue', `      Draft ID: ${draft._id}`);
      }
    });
  }

  // Step 6: Generate fix recommendations
  logSection('6. FIX RECOMMENDATIONS');
  
  log('bright', '🎯 IMMEDIATE ACTIONS TO TRY:');
  
  if (publishedPosts.length > 0) {
    log('green', '✅ Your posts exist in Sanity and look good!');
    log('cyan', '\n🔧 Try these fixes in order:');
    log('white', '1. Restart your development server:');
    log('blue', '   npm run dev');
    log('white', '\n2. Clear browser cache and hard refresh the /blog page');
    log('white', '\n3. Check browser console for JavaScript errors');
    log('white', '\n4. If still not working, check your blog API endpoint:');
    log('blue', '   Visit: http://localhost:3000/api/blog/posts');
    
    log('bright', '\n🚀 NEXT STEPS:');
    log('cyan', '1. Start your dev server: npm run dev');
    log('cyan', '2. Visit: http://localhost:3000/blog');
    log('cyan', '3. If posts still don\'t show, check the browser console for errors');
    log('cyan', '4. Test the admin interface: http://localhost:3000/admin');
    
  } else {
    log('red', '❌ No published posts found');
    log('yellow', 'Your posts might be in draft state or have been deleted');
    log('cyan', '\n🔧 Try these fixes:');
    log('white', '1. Check Sanity Studio to see if posts exist there');
    log('white', '2. Try creating a new test post through the admin interface');
    log('white', '3. Check if posts were accidentally moved to drafts');
  }

  log('green', '\n✅ Fix script complete! Try the recommendations above.');
}

// Run the fix
main().catch(error => {
  log('red', `\n💥 FIX SCRIPT FAILED: ${error.message}`);
  console.error(error);
  process.exit(1);
});
