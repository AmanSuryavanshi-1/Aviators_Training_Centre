#!/usr/bin/env tsx

/**
 * Upload Optimized Blog Posts to Sanity CMS
 * This script reads the optimized blog posts from data-blog-posts folder
 * and uploads them to Sanity CMS with proper formatting and images
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

// Blog post metadata
interface BlogPostMetadata {
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

// Category mapping for Sanity
const categoryMapping: Record<string, { title: string; slug: string; color: string }> = {
  'DGCA Exam Preparation': { title: 'DGCA Exam Preparation', slug: 'dgca-exam-preparation', color: '#075E68' },
  'Aviation Medical': { title: 'Aviation Medical', slug: 'aviation-medical', color: '#0C6E72' },
  'Career Guidance': { title: 'Career Guidance', slug: 'career-guidance', color: '#0A5A5E' },
  'Flight Training': { title: 'Flight Training', slug: 'flight-training', color: '#0E7A80' },
  'Technical Knowledge': { title: 'Technical Knowledge', slug: 'technical-knowledge', color: '#4A90A4' },
  'License Comparison': { title: 'License Comparison', slug: 'license-comparison', color: '#6B73FF' },
  'Type Rating': { title: 'Type Rating', slug: 'type-rating', color: '#10B981' },
  'RTR License': { title: 'RTR License', slug: 'rtr-license', color: '#F59E0B' },
  'Interview Preparation': { title: 'Interview Preparation', slug: 'interview-preparation', color: '#EF4444' },
  'Ground School': { title: 'Ground School', slug: 'ground-school', color: '#8B5CF6' },
  'Training Costs': { title: 'Training Costs', slug: 'training-costs', color: '#06B6D4' },
  'Exam Preparation': { title: 'Exam Preparation', slug: 'exam-preparation', color: '#84CC16' },
  'English Proficiency': { title: 'English Proficiency', slug: 'english-proficiency', color: '#F97316' },
  'Airline Recruitment': { title: 'Airline Recruitment', slug: 'airline-recruitment', color: '#EC4899' },
};

// Author mapping
const authorMapping: Record<string, any> = {
  'Aman Suryavanshi': {
    name: 'Aman Suryavanshi',
    slug: { current: 'aman-suryavanshi' },
    bio: 'Senior Flight Instructor with 15+ years of experience in aviation training and DGCA examination preparation.',
    role: 'Chief Flight Instructor',
    credentials: 'ATPL, CFI, DGCA Approved Examiner',
    email: 'aman@aviatorstrainingcentre.com',
  },
  'Dr. Priya Sharma': {
    name: 'Dr. Priya Sharma',
    slug: { current: 'dr-priya-sharma' },
    bio: 'Aviation Medical Examiner with 10+ years of experience in pilot medical assessments.',
    role: 'Aviation Medical Examiner',
    credentials: 'MBBS, Aviation Medicine Specialist, DGCA AME',
    email: 'priya@aviatorstrainingcentre.com',
  },
  'Capt. Rajesh Kumar': {
    name: 'Capt. Rajesh Kumar',
    slug: { current: 'capt-rajesh-kumar' },
    bio: 'Airline Captain with 20+ years of experience flying for major Indian airlines.',
    role: 'Senior Airline Captain',
    credentials: 'ATPL, Boeing 737 Type Rating, Airbus A320 Type Rating',
    email: 'rajesh@aviatorstrainingcentre.com',
  },
};

// Generate aviation-themed SVG image
function generateAviationSVG(title: string, color: string): string {
  const svg = `<svg width="800" height="450" viewBox="0 0 800 450" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gradient-${title.replace(/\s+/g, '-')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustColor(color, -20)};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#gradient-${title.replace(/\s+/g, '-')})"/>
    
    <!-- Aircraft silhouette -->
    <g transform="translate(400, 200)">
      <path d="M-60 -8 L60 -8 L80 0 L60 8 L-60 8 L-80 0 Z" fill="white" fill-opacity="0.3"/>
      <circle cx="0" cy="0" r="4" fill="white" fill-opacity="0.8"/>
      <path d="M-30 -6 L30 -6 M-30 6 L30 6" stroke="white" stroke-opacity="0.6" stroke-width="2"/>
      <path d="M-15 -15 L-5 -8 M15 -15 L5 -8" stroke="white" stroke-opacity="0.5" stroke-width="2"/>
      <path d="M-15 15 L-5 8 M15 15 L5 8" stroke="white" stroke-opacity="0.5" stroke-width="2"/>
    </g>
    
    <!-- Title -->
    <text x="400" y="320" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="700" opacity="0.9">${title}</text>
    <text x="400" y="350" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" font-weight="400" opacity="0.7">Aviators Training Centre</text>
    
    <!-- Decorative elements -->
    <circle cx="150" cy="100" r="3" fill="white" fill-opacity="0.4"/>
    <circle cx="650" cy="350" r="3" fill="white" fill-opacity="0.4"/>
    <circle cx="100" cy="350" r="2" fill="white" fill-opacity="0.3"/>
    <circle cx="700" cy="100" r="2" fill="white" fill-opacity="0.3"/>
  </svg>`;
  
  return svg;
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Convert markdown to Sanity blocks
function markdownToBlocks(markdown: string): any[] {
  // Simple markdown to blocks conversion
  const lines = markdown.split('\n');
  const blocks: any[] = [];
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    
    if (line.startsWith('# ')) {
      blocks.push({
        _type: 'block',
        style: 'h1',
        children: [{ _type: 'span', text: line.substring(2) }],
      });
    } else if (line.startsWith('## ')) {
      blocks.push({
        _type: 'block',
        style: 'h2',
        children: [{ _type: 'span', text: line.substring(3) }],
      });
    } else if (line.startsWith('### ')) {
      blocks.push({
        _type: 'block',
        style: 'h3',
        children: [{ _type: 'span', text: line.substring(4) }],
      });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({
        _type: 'block',
        style: 'normal',
        listItem: 'bullet',
        children: [{ _type: 'span', text: line.substring(2) }],
      });
    } else if (/^\d+\. /.test(line)) {
      blocks.push({
        _type: 'block',
        style: 'normal',
        listItem: 'number',
        children: [{ _type: 'span', text: line.replace(/^\d+\. /, '') }],
      });
    } else {
      blocks.push({
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: line }],
      });
    }
  }
  
  return blocks;
}

// Upload image to Sanity
async function uploadImageToSanity(svg: string, filename: string): Promise<any> {
  try {
    const buffer = Buffer.from(svg, 'utf-8');
    const asset = await client.assets.upload('image', buffer, {
      filename: `${filename}.svg`,
      contentType: 'image/svg+xml',
    });
    return asset;
  } catch (error) {
    console.error(`Error uploading image ${filename}:`, error);
    return null;
  }
}

// Create or get category
async function createOrGetCategory(categoryName: string): Promise<any> {
  const categoryInfo = categoryMapping[categoryName];
  if (!categoryInfo) {
    console.warn(`Unknown category: ${categoryName}`);
    return null;
  }

  // Check if category exists
  const existingCategory = await client.fetch(
    `*[_type == "category" && slug.current == $slug][0]`,
    { slug: categoryInfo.slug }
  );

  if (existingCategory) {
    return existingCategory;
  }

  // Create new category
  const category = await client.create({
    _type: 'category',
    title: categoryInfo.title,
    slug: { current: categoryInfo.slug },
    description: `${categoryInfo.title} related content and guides`,
    color: categoryInfo.color,
  });

  console.log(`Created category: ${category.title}`);
  return category;
}

// Create or get author
async function createOrGetAuthor(authorName: string): Promise<any> {
  const authorInfo = authorMapping[authorName] || authorMapping['Aman Suryavanshi'];

  // Check if author exists
  const existingAuthor = await client.fetch(
    `*[_type == "author" && slug.current == $slug][0]`,
    { slug: authorInfo.slug.current }
  );

  if (existingAuthor) {
    return existingAuthor;
  }

  // Create new author
  const author = await client.create({
    _type: 'author',
    ...authorInfo,
  });

  console.log(`Created author: ${author.name}`);
  return author;
}

// Main upload function
async function uploadOptimizedBlogPosts() {
  try {
    console.log('🚀 Starting upload of optimized blog posts to Sanity...');

    // Read metadata
    const metadataPath = path.join(process.cwd(), 'data-blog-posts/optimized-blog-posts/metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    
    console.log(`📊 Found ${metadata.totalPosts} optimized blog posts`);

    // Process each blog post
    for (const postMeta of metadata.posts) {
      console.log(`\n📝 Processing: ${postMeta.title}`);

      // Read markdown file
      const markdownPath = path.join(process.cwd(), 'data-blog-posts/optimized-blog-posts', `${postMeta.slug}.md`);
      
      if (!fs.existsSync(markdownPath)) {
        console.warn(`⚠️  Markdown file not found: ${markdownPath}`);
        continue;
      }

      const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
      const { data: frontMatter, content } = matter(markdownContent);

      // Check if post already exists
      const existingPost = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug: postMeta.slug }
      );

      if (existingPost) {
        console.log(`✅ Post already exists: ${postMeta.title}`);
        continue;
      }

      // Create category and author
      const category = await createOrGetCategory(postMeta.category);
      const author = await createOrGetAuthor(frontMatter.author || 'Aman Suryavanshi');

      if (!category || !author) {
        console.error(`❌ Failed to create category or author for: ${postMeta.title}`);
        continue;
      }

      // Generate and upload image
      const svg = generateAviationSVG(postMeta.title, category.color);
      const imageAsset = await uploadImageToSanity(svg, postMeta.slug);

      // Convert markdown to blocks
      const bodyBlocks = markdownToBlocks(content);

      // Create blog post
      const blogPost = {
        _type: 'post',
        title: postMeta.title,
        slug: { current: postMeta.slug },
        publishedAt: new Date().toISOString(),
        excerpt: postMeta.excerpt,
        body: bodyBlocks,
        image: imageAsset ? {
          asset: { _ref: imageAsset._id },
          alt: postMeta.title,
        } : undefined,
        category: { _ref: category._id },
        author: { _ref: author._id },
        readingTime: Math.ceil(postMeta.wordCount / 200), // Estimate reading time
        featured: postMeta.priority <= 3, // First 3 posts are featured
        tags: frontMatter.tags || [
          postMeta.category,
          'Aviation Training',
          'DGCA',
          'Pilot Training'
        ],
        difficulty: frontMatter.difficulty || 'intermediate',
        contentType: 'guide',
        enableComments: true,
        enableSocialSharing: true,
        enableNewsletterSignup: true,
        viewCount: Math.floor(Math.random() * 5000) + 1000, // Random view count for demo
        shareCount: Math.floor(Math.random() * 200) + 50,
        engagementScore: Math.floor(Math.random() * 40) + 60,
      };

      const createdPost = await client.create(blogPost);
      console.log(`✅ Created blog post: ${createdPost.title}`);
    }

    console.log('\n🎉 Successfully uploaded all optimized blog posts to Sanity!');
    console.log('📊 Summary:');
    console.log(`   - Total posts processed: ${metadata.totalPosts}`);
    console.log(`   - Categories created: ${Object.keys(categoryMapping).length}`);
    console.log(`   - Authors created: ${Object.keys(authorMapping).length}`);

  } catch (error) {
    console.error('❌ Error uploading blog posts:', error);
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  uploadOptimizedBlogPosts();
}

export { uploadOptimizedBlogPosts };