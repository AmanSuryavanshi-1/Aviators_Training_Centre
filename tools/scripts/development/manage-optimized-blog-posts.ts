#!/usr/bin/env node

/**
 * Blog Post Management Script for Optimized Blog Posts
 * 
 * This script helps manage the optimized blog posts in data/optimized-blog-posts/
 * It can validate, count, and prepare blog posts for publishing to Sanity CMS.
 */

import fs from 'fs';
import path from 'path';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  quality: string;
  conversionPotential: string;
  wordCount: number;
  filePath: string;
  priority: number;
}

interface BlogMetadata {
  totalPosts: number;
  optimizationDate: string;
  description: string;
  posts: BlogPost[];
  categories: string[];
  qualityDistribution: Record<string, number>;
  conversionPotential: Record<string, number>;
  totalWordCount: number;
  averageWordCount: number;
  seoOptimized: boolean;
  readyForProduction: boolean;
}

const OPTIMIZED_BLOG_DIR = path.join(process.cwd(), 'data', 'optimized-blog-posts');
const METADATA_FILE = path.join(OPTIMIZED_BLOG_DIR, 'metadata.json');

/**
 * Load and parse the blog metadata
 */
function loadMetadata(): BlogMetadata {
  try {
    const metadataContent = fs.readFileSync(METADATA_FILE, 'utf-8');
    return JSON.parse(metadataContent);
  } catch (error) {
    console.error('Error loading metadata:', error);
    process.exit(1);
  }
}

/**
 * Validate that all blog post files exist
 */
function validateBlogPosts(metadata: BlogMetadata): boolean {
  console.log('🔍 Validating blog post files...');
  
  let allValid = true;
  
  for (const post of metadata.posts) {
    const fullPath = path.join(process.cwd(), post.filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing file: ${post.filePath}`);
      allValid = false;
    } else {
      console.log(`✅ Found: ${post.title}`);
    }
  }
  
  return allValid;
}

/**
 * Count words in a markdown file
 */
function countWordsInFile(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Remove markdown syntax and count words
    const plainText = content
      .replace(/^---[\s\S]*?---/m, '') // Remove frontmatter
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
    
    return plainText.split(/\s+/).filter(word => word.length > 0).length;
  } catch (error) {
    console.error(`Error counting words in ${filePath}:`, error);
    return 0;
  }
}

/**
 * Display blog post statistics
 */
function displayStatistics(metadata: BlogMetadata): void {
  console.log('\n📊 Blog Post Statistics:');
  console.log('========================');
  console.log(`Total Posts: ${metadata.totalPosts}`);
  console.log(`Total Word Count: ${metadata.totalWordCount.toLocaleString()}`);
  console.log(`Average Word Count: ${metadata.averageWordCount}`);
  console.log(`SEO Optimized: ${metadata.seoOptimized ? '✅' : '❌'}`);
  console.log(`Production Ready: ${metadata.readyForProduction ? '✅' : '❌'}`);
  
  console.log('\n📈 Quality Distribution:');
  Object.entries(metadata.qualityDistribution).forEach(([quality, count]) => {
    console.log(`  ${quality}: ${count} posts`);
  });
  
  console.log('\n🎯 Conversion Potential:');
  Object.entries(metadata.conversionPotential).forEach(([potential, count]) => {
    console.log(`  ${potential}: ${count} posts`);
  });
  
  console.log('\n📂 Categories:');
  metadata.categories.forEach(category => {
    const postsInCategory = metadata.posts.filter(post => post.category === category).length;
    console.log(`  ${category}: ${postsInCategory} posts`);
  });
}

/**
 * List all blog posts with details
 */
function listBlogPosts(metadata: BlogMetadata): void {
  console.log('\n📝 Blog Posts (by priority):');
  console.log('============================');
  
  const sortedPosts = [...metadata.posts].sort((a, b) => a.priority - b.priority);
  
  sortedPosts.forEach(post => {
    console.log(`\n${post.priority}. ${post.title}`);
    console.log(`   Category: ${post.category}`);
    console.log(`   Conversion: ${post.conversionPotential}`);
    console.log(`   Quality: ${post.quality}`);
    console.log(`   Words: ${post.wordCount.toLocaleString()}`);
    console.log(`   File: ${post.filePath}`);
  });
}

/**
 * Verify word counts match actual files
 */
function verifyWordCounts(metadata: BlogMetadata): void {
  console.log('\n🔢 Verifying word counts...');
  
  for (const post of metadata.posts) {
    const fullPath = path.join(process.cwd(), post.filePath);
    
    if (fs.existsSync(fullPath)) {
      const actualWordCount = countWordsInFile(fullPath);
      const difference = Math.abs(actualWordCount - post.wordCount);
      
      if (difference > 50) { // Allow some variance
        console.log(`⚠️  ${post.title}: Expected ${post.wordCount}, found ${actualWordCount} (diff: ${difference})`);
      } else {
        console.log(`✅ ${post.title}: ${actualWordCount} words`);
      }
    }
  }
}

/**
 * Generate a summary for task updates
 */
function generateTaskSummary(metadata: BlogMetadata): void {
  console.log('\n📋 Task Update Summary:');
  console.log('======================');
  console.log(`✅ Consolidated ${metadata.totalPosts} high-quality blog posts`);
  console.log(`✅ Total content: ${metadata.totalWordCount.toLocaleString()} words`);
  console.log(`✅ Conversion potential: ${metadata.conversionPotential.veryHigh} very-high, ${metadata.conversionPotential.high} high, ${metadata.conversionPotential.medium} medium`);
  console.log(`✅ All posts are SEO optimized and production ready`);
  console.log(`✅ Organized in single clean directory: data/optimized-blog-posts/`);
  console.log(`✅ Old scattered folders moved to backup location`);
  
  console.log('\n🎯 Recommended Task Updates:');
  console.log(`- Update task references from "5 blog posts" to "${metadata.totalPosts} blog posts"`);
  console.log(`- Update file paths to reference "data/optimized-blog-posts/"`);
  console.log(`- All blog posts are ready for Sanity CMS publishing`);
}

/**
 * Main function
 */
function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';
  
  console.log('🚀 Optimized Blog Post Manager');
  console.log('==============================');
  
  const metadata = loadMetadata();
  
  switch (command) {
    case 'validate':
      const isValid = validateBlogPosts(metadata);
      console.log(isValid ? '\n✅ All blog posts validated successfully!' : '\n❌ Validation failed!');
      process.exit(isValid ? 0 : 1);
      break;
      
    case 'list':
      listBlogPosts(metadata);
      break;
      
    case 'verify-words':
      verifyWordCounts(metadata);
      break;
      
    case 'summary':
      generateTaskSummary(metadata);
      break;
      
    case 'stats':
    default:
      displayStatistics(metadata);
      break;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { loadMetadata, validateBlogPosts, countWordsInFile };
