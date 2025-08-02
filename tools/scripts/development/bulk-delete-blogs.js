#!/usr/bin/env node

/**
 * Bulk Delete All Blog Posts from Sanity
 * 
 * This script will delete ALL blog posts from your Sanity dataset.
 * Use with caution - this action cannot be undone!
 * 
 * Usage: node scripts/bulk-delete-blogs.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config({ path: '.env.local' });

// Create Sanity client with write permissions
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false, // Don't use CDN for write operations
});

async function bulkDeleteBlogs() {
  try {
    console.log('🔍 Checking Sanity connection and permissions...');
    
    // Test connection and permissions
    try {
      await client.fetch('*[_type == "post"][0]');
      console.log('✅ Successfully connected to Sanity');
    } catch (error) {
      console.error('❌ Failed to connect to Sanity:', error.message);
      if (error.message.includes('Unauthorized')) {
        console.error('💡 Please check your SANITY_API_TOKEN in .env.local');
        console.error('💡 Make sure the token has read/write permissions for the dataset');
      }
      process.exit(1);
    }

    // Fetch all blog posts
    console.log('📋 Fetching all blog posts...');
    const posts = await client.fetch(`
      *[_type == "post"] {
        _id,
        title,
        slug,
        publishedAt
      }
    `);

    if (posts.length === 0) {
      console.log('✅ No blog posts found in Sanity. Nothing to delete.');
      return;
    }

    console.log(`📊 Found ${posts.length} blog posts to delete:`);
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.title} (${post._id})`);
    });

    // Confirm deletion
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(`\n⚠️  Are you sure you want to delete ALL ${posts.length} blog posts? This cannot be undone! (yes/no): `, resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Deletion cancelled by user.');
      return;
    }

    // Delete posts in batches
    console.log('\n🗑️  Starting bulk deletion...');
    const batchSize = 10;
    let deletedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(posts.length / batchSize)}...`);

      const deletePromises = batch.map(async (post) => {
        try {
          await client.delete(post._id);
          console.log(`   ✅ Deleted: ${post.title}`);
          deletedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to delete ${post.title}: ${error.message}`);
          failedCount++;
        }
      });

      await Promise.all(deletePromises);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < posts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n📊 Deletion Summary:');
    console.log(`   ✅ Successfully deleted: ${deletedCount} posts`);
    console.log(`   ❌ Failed to delete: ${failedCount} posts`);
    console.log(`   📋 Total processed: ${posts.length} posts`);

    if (deletedCount > 0) {
      console.log('\n🎉 Bulk deletion completed successfully!');
      console.log('💡 You can now add your new markdown-based blog posts.');
    }

    if (failedCount > 0) {
      console.log('\n⚠️  Some posts failed to delete. This might be due to:');
      console.log('   - Insufficient permissions on the API token');
      console.log('   - Network issues');
      console.log('   - Posts being referenced by other documents');
      console.log('\n💡 You may need to delete these manually in Sanity Studio.');
    }

  } catch (error) {
    console.error('💥 Unexpected error during bulk deletion:', error);
    
    if (error.message.includes('permission')) {
      console.error('\n💡 Permission Error Solutions:');
      console.error('   1. Check that SANITY_API_TOKEN is set in .env.local');
      console.error('   2. Verify the token has "Editor" or "Administrator" role');
      console.error('   3. Ensure the token is for the correct dataset');
      console.error('   4. Try regenerating the token in Sanity Management');
    }
    
    process.exit(1);
  }
}

// Run the script
bulkDeleteBlogs();

export { bulkDeleteBlogs };
