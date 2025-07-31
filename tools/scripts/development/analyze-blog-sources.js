#!/usr/bin/env node

/**
 * Analyze Blog Sources - Sanity vs Markdown
 * 
 * This script helps you understand which blogs come from where:
 * - Sanity CMS (editable, deletable from admin panel)
 * - Markdown files (read-only, stored in codebase)
 * 
 * Usage: node scripts/analyze-blog-sources.js
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

// Create Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function analyzeBlogSources() {
  console.log('📊 Analyzing Blog Sources...\n');

  try {
    // Get Sanity posts
    console.log('🔍 Checking Sanity CMS...');
    const sanityPosts = await client.fetch(`
      *[_type == "post"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt
      }
    `);

    console.log(`   ✅ Found ${sanityPosts.length} posts in Sanity CMS`);
    if (sanityPosts.length > 0) {
      console.log('   📋 Sanity posts:');
      sanityPosts.forEach((post, index) => {
        console.log(`      ${index + 1}. ${post.title}`);
      });
    }

    // Check markdown posts
    console.log('\n🔍 Checking Markdown Files...');
    
    // Read the production blog data file
    const blogDataPath = path.join(process.cwd(), 'lib', 'blog', 'production-blog-data.ts');
    
    if (fs.existsSync(blogDataPath)) {
      const blogDataContent = fs.readFileSync(blogDataPath, 'utf8');
      
      // Count markdown posts by counting _id occurrences
      const markdownPostMatches = blogDataContent.match(/_id:\s*['"`][^'"`]+['"`]/g);
      const markdownPostCount = markdownPostMatches ? markdownPostMatches.length : 0;
      
      console.log(`   ✅ Found ${markdownPostCount} posts in Markdown files`);
      
      if (markdownPostCount > 0) {
        console.log('   📋 Markdown posts (first 10):');
        
        // Extract titles for display
        const titleMatches = blogDataContent.match(/title:\s*['"`]([^'"`]+)['"`]/g);
        if (titleMatches) {
          titleMatches.slice(0, 10).forEach((match, index) => {
            const title = match.replace(/title:\s*['"`]([^'"`]+)['"`]/, '$1');
            console.log(`      ${index + 1}. ${title}`);
          });
          
          if (titleMatches.length > 10) {
            console.log(`      ... and ${titleMatches.length - 10} more`);
          }
        }
      }
    } else {
      console.log('   ❌ Markdown blog data file not found');
    }

    // Get markdown count for summary
    let finalMarkdownCount = 0;
    const summaryBlogDataPath = path.join(process.cwd(), 'lib', 'blog', 'production-blog-data.ts');
    
    if (fs.existsSync(summaryBlogDataPath)) {
      const summaryBlogDataContent = fs.readFileSync(summaryBlogDataPath, 'utf8');
      const summaryMarkdownMatches = summaryBlogDataContent.match(/_id:\s*['"`][^'"`]+['"`]/g);
      finalMarkdownCount = summaryMarkdownMatches ? summaryMarkdownMatches.length : 0;
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   🗄️  Sanity CMS Posts: ${sanityPosts.length} (editable, deletable)`);
    console.log(`   📄 Markdown Posts: ${finalMarkdownCount} (read-only, code-based)`);
    console.log(`   📋 Total Posts: ${sanityPosts.length + finalMarkdownCount}`);

    console.log('\n💡 What This Means:');
    
    if (sanityPosts.length === 0 && finalMarkdownCount > 0) {
      console.log('   ✅ All Sanity posts successfully deleted');
      console.log('   📄 The remaining posts are markdown-based (stored in your code)');
      console.log('   🚫 Markdown posts CANNOT be deleted from admin panel');
      console.log('   🔧 To remove markdown posts, you need to edit the code files');
    } else if (sanityPosts.length > 0) {
      console.log('   ⚠️  You still have posts in Sanity that can be deleted');
      console.log('   💡 Run "npm run sanity:delete-all" to remove them');
    }

    console.log('\n🔧 Next Steps:');
    
    if (finalMarkdownCount > 0) {
      console.log('   1. The 15 posts you see are markdown-based (read-only)');
      console.log('   2. They are stored in: lib/blog/production-blog-data.ts');
      console.log('   3. To remove them: Delete or comment out entries in that file');
      console.log('   4. To keep them: They serve as example/template content');
      console.log('   5. Add new posts: Use admin panel (will go to Sanity)');
    }

    if (sanityPosts.length === 0 && finalMarkdownCount === 0) {
      console.log('   🎉 No posts found - completely clean slate!');
      console.log('   💡 Start adding new posts through the admin panel');
    }

  } catch (error) {
    console.error('❌ Error analyzing blog sources:', error.message);
  }
}

// Run the analysis
analyzeBlogSources();

export { analyzeBlogSources };
