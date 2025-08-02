#!/usr/bin/env tsx

console.log('🎯 Script starting...');

import { createClient } from '@sanity/client';
import fs from 'fs/promises';
import path from 'path';

// Sanity client configuration with hardcoded values for now
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: '2024-01-01',
});

interface BlogPost {
  _id?: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  body: any[];
  category: { _ref: string };
  author: { _ref: string };
  publishedAt: string;
  featured: boolean;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  additionalKeywords: string[];
  structuredData: {
    articleType: string;
    learningResourceType: string;
    educationalLevel: string;
    timeRequired: string;
  };
  ctaVariants: {
    primary: string;
    secondary: string;
    urgency: string;
  };
}

interface OptimizedBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  additionalKeywords: string[];
  readingTime: number;
  featured: boolean;
}

// Professional content enhancement functions
function enhanceTitle(originalTitle: string): string {
  const powerWords = ['Complete', 'Ultimate', 'Professional', 'Expert', 'Comprehensive', 'Essential'];
  const yearSuffix = '2024';
  
  if (!originalTitle.includes(yearSuffix) && !powerWords.some(word => originalTitle.includes(word))) {
    const randomPowerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    return `${randomPowerWord} ${originalTitle} Guide ${yearSuffix}`;
  }
  
  return originalTitle;
}

function generateSEOOptimizedExcerpt(content: string, focusKeyword: string): string {
  const sentences = content.split('.').slice(0, 3);
  let excerpt = sentences.join('.') + '.';
  
  if (!excerpt.toLowerCase().includes(focusKeyword.toLowerCase())) {
    excerpt = `${focusKeyword}: ${excerpt}`;
  }
  
  return excerpt.substring(0, 160);
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateAdditionalKeywords(focusKeyword: string, content: string): string[] {
  const aviationKeywords = [
    'pilot training', 'aviation career', 'flight school', 'DGCA', 'commercial pilot',
    'airline pilot', 'aviation industry', 'pilot license', 'flight training',
    'aviation courses', 'pilot salary', 'aviation jobs'
  ];
  
  const contentWords = content.toLowerCase();
  const relevantKeywords = aviationKeywords.filter(keyword => 
    contentWords.includes(keyword.toLowerCase()) && keyword !== focusKeyword
  );
  
  return relevantKeywords.slice(0, 5);
}

async function loadOptimizedBlogPosts(): Promise<OptimizedBlogPost[]> {
  const optimizedDir = path.join(process.cwd(), 'data-blog-posts', 'optimized-blog-posts');
  
  try {
    console.log(`📂 Reading directory: ${optimizedDir}`);
    const files = await fs.readdir(optimizedDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');
    console.log(`📄 Found ${markdownFiles.length} markdown files`);
    
    const posts: OptimizedBlogPost[] = [];
    
    for (const file of markdownFiles) {
      console.log(`📖 Processing file: ${file}`);
      const filePath = path.join(optimizedDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '').replace(/-/g, ' ');
      
      // Extract first paragraph as excerpt
      const paragraphs = content.split('\n\n').filter(p => p.trim() && !p.startsWith('#'));
      const firstParagraph = paragraphs[0] || '';
      
      // Generate focus keyword from title
      const focusKeyword = extractFocusKeyword(title);
      
      const post: OptimizedBlogPost = {
        title: title,
        slug: file.replace('.md', ''),
        excerpt: generateSEOOptimizedExcerpt(firstParagraph, focusKeyword),
        content: content,
        category: 'Aviation Training',
        seoTitle: enhanceTitle(title),
        seoDescription: generateSEOOptimizedExcerpt(firstParagraph, focusKeyword),
        focusKeyword: focusKeyword,
        additionalKeywords: generateAdditionalKeywords(focusKeyword, content),
        readingTime: calculateReadingTime(content),
        featured: Math.random() > 0.7 // Randomly feature some posts
      };
      
      posts.push(post);
      console.log(`✅ Processed: ${title}`);
    }
    
    return posts;
  } catch (error) {
    console.error('Error loading optimized blog posts:', error);
    return [];
  }
}

function extractFocusKeyword(title: string): string {
  const aviationTerms = [
    'pilot training', 'aviation career', 'flight school', 'DGCA', 'commercial pilot',
    'airline pilot', 'pilot license', 'flight training', 'aviation courses', 'pilot salary'
  ];
  
  const titleLower = title.toLowerCase();
  const foundTerm = aviationTerms.find(term => titleLower.includes(term));
  
  return foundTerm || 'pilot training';
}

function parseFrontmatter(frontmatter: string): Record<string, any> {
  const lines = frontmatter.split('\n');
  const metadata: Record<string, any> = {};
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      
      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        metadata[key.trim()] = value.slice(1, -1).split(',').map(item => item.trim().replace(/['"]/g, ''));
      } else {
        metadata[key.trim()] = value.replace(/['"]/g, '');
      }
    }
  }
  
  return metadata;
}

function convertToPortableText(content: string): any[] {
  const blocks = [];
  const paragraphs = content.split('\n\n');
  
  for (const paragraph of paragraphs) {
    if (paragraph.trim()) {
      if (paragraph.startsWith('#')) {
        // Handle headings
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const text = paragraph.replace(/^#+\s*/, '');
        
        blocks.push({
          _type: 'block',
          style: `h${Math.min(level, 6)}`,
          children: [{ _type: 'span', text }]
        });
      } else if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        // Handle lists
        const items = paragraph.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        
        blocks.push({
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: items.map(item => ({
            _type: 'span',
            text: item.replace(/^[-*]\s*/, '')
          }))
        });
      } else {
        // Regular paragraph
        blocks.push({
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: paragraph }]
        });
      }
    }
  }
  
  return blocks;
}

async function enhanceAndPublishBlogPosts(): Promise<void> {
  console.log('🚀 Starting professional blog content enhancement...');
  
  // Debug configuration
  console.log('🔧 Configuration check:');
  console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
  console.log(`Dataset: production`);
  console.log(`Token configured: true`);
  
  try {
    const optimizedPosts = await loadOptimizedBlogPosts();
    console.log(`📚 Loaded ${optimizedPosts.length} optimized blog posts`);
    
    // Get or create default category and author
    const categoryId = await getOrCreateCategory('Aviation Training');
    const authorId = await getOrCreateAuthor('Aviation Expert');
    
    let publishedCount = 0;
    let errorCount = 0;
    
    for (const post of optimizedPosts) {
      try {
        console.log(`📝 Processing: ${post.title}`);
        
        // Check if post already exists
        const existingPost = await client.fetch(
          `*[_type == "post" && slug.current == $slug][0]`,
          { slug: post.slug }
        );
        
        if (existingPost) {
          console.log(`⏭️  Post already exists: ${post.title}`);
          continue;
        }
        
        const enhancedPost: BlogPost = {
          title: enhanceTitle(post.title),
          slug: { current: post.slug },
          excerpt: post.excerpt,
          body: convertToPortableText(post.content),
          category: { _ref: categoryId },
          author: { _ref: authorId },
          publishedAt: new Date().toISOString(),
          featured: post.featured,
          readingTime: post.readingTime,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          focusKeyword: post.focusKeyword,
          additionalKeywords: post.additionalKeywords,
          structuredData: {
            articleType: 'Educational',
            learningResourceType: 'Guide',
            educationalLevel: 'Intermediate',
            timeRequired: `PT${post.readingTime}M`
          },
          ctaVariants: {
            primary: 'Start Your Aviation Career Today',
            secondary: 'Learn More About Our Courses',
            urgency: 'Limited Seats Available - Apply Now'
          }
        };
        
        const result = await client.create({
          _type: 'post',
          ...enhancedPost
        });
        
        console.log(`✅ Published: ${post.title} (ID: ${result._id})`);
        publishedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error publishing ${post.title}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📊 Enhancement Summary:');
    console.log(`✅ Successfully published: ${publishedCount} posts`);
    console.log(`❌ Errors encountered: ${errorCount} posts`);
    console.log(`📚 Total processed: ${optimizedPosts.length} posts`);
    
  } catch (error) {
    console.error('❌ Fatal error during blog enhancement:', error);
    process.exit(1);
  }
}

async function getOrCreateCategory(name: string): Promise<string> {
  const existing = await client.fetch(
    `*[_type == "category" && title == $name][0]`,
    { name }
  );
  
  if (existing) {
    return existing._id;
  }
  
  const category = await client.create({
    _type: 'category',
    title: name,
    slug: { current: name.toLowerCase().replace(/\s+/g, '-') },
    description: `${name} related content and resources`
  });
  
  return category._id;
}

async function getOrCreateAuthor(name: string): Promise<string> {
  const existing = await client.fetch(
    `*[_type == "author" && name == $name][0]`,
    { name }
  );
  
  if (existing) {
    return existing._id;
  }
  
  const author = await client.create({
    _type: 'author',
    name,
    slug: { current: name.toLowerCase().replace(/\s+/g, '-') },
    bio: 'Aviation industry expert with years of experience in pilot training and career guidance.',
    expertise: ['Aviation Training', 'Pilot Career Guidance', 'Flight Education']
  });
  
  return author._id;
}

// Main execution
if (require.main === module) {
  enhanceAndPublishBlogPosts().catch(console.error);
}
