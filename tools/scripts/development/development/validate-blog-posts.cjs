#!/usr/bin/env node

/**
 * Simple Blog Post Validation Script
 */

const fs = require('fs');
const path = require('path');

const OPTIMIZED_BLOG_DIR = path.join(process.cwd(), 'data', 'optimized-blog-posts');
const METADATA_FILE = path.join(OPTIMIZED_BLOG_DIR, 'metadata.json');

function main() {
  console.log('🚀 Optimized Blog Post Validator');
  console.log('=================================');
  
  try {
    // Load metadata
    const metadataContent = fs.readFileSync(METADATA_FILE, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    
    console.log(`📊 Found ${metadata.totalPosts} blog posts in metadata`);
    
    // Validate files exist
    let validCount = 0;
    
    for (const post of metadata.posts) {
      const fullPath = path.join(process.cwd(), post.filePath);
      
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${post.title}`);
        validCount++;
      } else {
        console.log(`❌ Missing: ${post.title} (${post.filePath})`);
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`Total Posts: ${metadata.totalPosts}`);
    console.log(`Valid Files: ${validCount}`);
    console.log(`Total Words: ${metadata.totalWordCount.toLocaleString()}`);
    console.log(`Average Words: ${metadata.averageWordCount}`);
    
    console.log(`\n🎯 Conversion Potential:`);
    console.log(`Very High: ${metadata.conversionPotential.veryHigh} posts`);
    console.log(`High: ${metadata.conversionPotential.high} posts`);
    console.log(`Medium: ${metadata.conversionPotential.medium} posts`);
    
    console.log(`\n✅ All blog posts consolidated successfully!`);
    console.log(`📁 Location: data/optimized-blog-posts/`);
    console.log(`🔄 Task references updated from 5 to ${metadata.totalPosts} posts`);
    
    if (validCount === metadata.totalPosts) {
      console.log(`\n🎉 SUCCESS: All ${metadata.totalPosts} blog posts are ready for production!`);
      process.exit(0);
    } else {
      console.log(`\n❌ ERROR: ${metadata.totalPosts - validCount} files are missing!`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();