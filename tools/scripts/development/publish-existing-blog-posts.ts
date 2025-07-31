#!/usr/bin/env tsx

/**
 * Script to publish existing aviation blog posts from data/optimized-blog-posts
 * This will make the high-quality blog posts available on the blog page
 */

import { config } from 'dotenv';
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Load environment variables
config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

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

interface BlogPostFrontMatter {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  quality: string;
  conversionPotential: string;
  publishedAt: string;
}

async function createAuthorIfNotExists() {
  // Check if author exists
  const existingAuthor = await client.fetch(`*[_type == "author" && slug.current == "atc-instructor"][0]`);
  
  if (existingAuthor) {
    console.log('✅ Author already exists:', existingAuthor.name);
    return existingAuthor._id;
  }

  // Create author
  const author = await client.create({
    _type: 'author',
    name: 'ATC Instructor',
    slug: { current: 'atc-instructor' },
    bio: 'Senior Aviation Instructor and Commercial Pilot with over 10 years of experience in DGCA training and aviation education. Expert in CPL/ATPL ground school preparation and career guidance.',
    credentials: [
      'Commercial Pilot License (CPL)',
      'Airline Transport Pilot License (ATPL)',
      'DGCA Ground Instructor Rating',
      'Type Rating on A320/B737'
    ],
    expertise: [
      'DGCA Exam Preparation',
      'Aviation Career Guidance',
      'Flight Training',
      'Technical Knowledge',
      'Aviation Medical'
    ],
    experience: '10+ years in aviation training and instruction',
    image: null, // Can be added later
  });

  console.log('✅ Created author:', author.name);
  return author._id;
}

async function createCategoriesIfNotExist() {
  const categories = [
    { title: 'DGCA Exam Preparation', slug: 'dgca-exam-preparation', color: '#075E68' },
    { title: 'Aviation Medical', slug: 'aviation-medical', color: '#219099' },
    { title: 'Career Guidance', slug: 'career-guidance', color: '#56A7B0' },
    { title: 'Flight Training', slug: 'flight-training', color: '#73B5BD' },
    { title: 'Technical Knowledge', slug: 'technical-knowledge', color: '#075E68' },
  ];

  const categoryIds: Record<string, string> = {};

  for (const category of categories) {
    const existing = await client.fetch(`*[_type == "category" && slug.current == "${category.slug}"][0]`);
    
    if (existing) {
      categoryIds[category.title] = existing._id;
      console.log('✅ Category already exists:', category.title);
    } else {
      const created = await client.create({
        _type: 'category',
        title: category.title,
        slug: { current: category.slug },
        color: category.color,
        description: `Articles related to ${category.title.toLowerCase()}`,
      });
      categoryIds[category.title] = created._id;
      console.log('✅ Created category:', category.title);
    }
  }

  return categoryIds;
}

async function publishBlogPost(
  postData: BlogPostMetadata,
  content: string,
  frontMatter: BlogPostFrontMatter,
  authorId: string,
  categoryIds: Record<string, string>
) {
  // Check if post already exists
  const existingPost = await client.fetch(`*[_type == "post" && slug.current == "${postData.slug}"][0]`);
  
  if (existingPost) {
    console.log('⚠️  Post already exists:', postData.title);
    return existingPost._id;
  }

  // Convert markdown content to portable text (simplified)
  const bodyBlocks = content.split('\n\n').map((paragraph, index) => {
    if (paragraph.startsWith('# ')) {
      return {
        _type: 'block',
        _key: `heading-${index}`,
        style: 'h1',
        children: [{ _type: 'span', text: paragraph.replace('# ', '') }],
      };
    } else if (paragraph.startsWith('## ')) {
      return {
        _type: 'block',
        _key: `heading-${index}`,
        style: 'h2',
        children: [{ _type: 'span', text: paragraph.replace('## ', '') }],
      };
    } else if (paragraph.startsWith('### ')) {
      return {
        _type: 'block',
        _key: `heading-${index}`,
        style: 'h3',
        children: [{ _type: 'span', text: paragraph.replace('### ', '') }],
      };
    } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
      return {
        _type: 'block',
        _key: `paragraph-${index}`,
        style: 'normal',
        children: [{ 
          _type: 'span', 
          text: paragraph.replace(/\*\*/g, ''),
          marks: ['strong']
        }],
      };
    } else if (paragraph.trim()) {
      return {
        _type: 'block',
        _key: `paragraph-${index}`,
        style: 'normal',
        children: [{ _type: 'span', text: paragraph }],
      };
    }
    return null;
  }).filter(Boolean);

  const categoryId = categoryIds[postData.category];
  if (!categoryId) {
    console.error('❌ Category not found:', postData.category);
    return null;
  }

  // Determine if post should be featured (top 2 by priority)
  const featured = postData.priority <= 2;

  const post = await client.create({
    _type: 'post',
    title: postData.title,
    slug: { current: postData.slug },
    excerpt: postData.excerpt,
    body: bodyBlocks,
    publishedAt: frontMatter.publishedAt || new Date().toISOString(),
    author: { _type: 'reference', _ref: authorId },
    category: { _type: 'reference', _ref: categoryId },
    featured,
    seoTitle: postData.title,
    seoDescription: postData.excerpt,
    focusKeyword: postData.category.toLowerCase().replace(/\s+/g, '-'),
    readingTime: Math.ceil(postData.wordCount / 200), // Estimate reading time
    tags: [postData.category, 'Aviation', 'DGCA', 'Pilot Training'],
    image: null, // Can be added later
  });

  console.log(`✅ Published post: ${postData.title} ${featured ? '(Featured)' : ''}`);
  return post._id;
}

async function main() {
  try {
    console.log('🚀 Starting blog post publishing process...');

    // Read metadata
    const metadataPath = path.join(process.cwd(), 'data/optimized-blog-posts/metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    console.log(`📚 Found ${metadata.totalPosts} blog posts to publish`);

    // Create author and categories
    const authorId = await createAuthorIfNotExists();
    const categoryIds = await createCategoriesIfNotExist();

    // Process each blog post
    for (const postData of metadata.posts) {
      console.log(`\n📝 Processing: ${postData.title}`);

      // Read markdown file
      const filePath = path.join(process.cwd(), postData.filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data: frontMatter, content } = matter(fileContent);

      await publishBlogPost(
        postData,
        content,
        frontMatter as BlogPostFrontMatter,
        authorId,
        categoryIds
      );

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n🎉 Blog post publishing completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total posts processed: ${metadata.totalPosts}`);
    console.log(`- Categories created: ${Object.keys(categoryIds).length}`);
    console.log(`- Author: ATC Instructor`);
    console.log('\n✅ Blog posts are now available on the website!');

  } catch (error) {
    console.error('❌ Error publishing blog posts:', error);
    process.exit(1);
  }
}

// Run the script
console.log('Script starting...');
console.log('Environment check:', {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  hasToken: !!process.env.SANITY_API_TOKEN
});

main().catch(console.error);

export { main as publishExistingBlogPosts };
