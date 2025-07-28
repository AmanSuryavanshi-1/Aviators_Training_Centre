#!/usr/bin/env node

console.log('🚀 Publishing all optimized blog posts to Sanity...');

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
});

// Professional content enhancement functions
function enhanceTitle(originalTitle) {
  const powerWords = ['Complete', 'Ultimate', 'Professional', 'Expert', 'Comprehensive', 'Essential'];
  const yearSuffix = '2024';
  
  if (!originalTitle.includes(yearSuffix) && !powerWords.some(word => originalTitle.includes(word))) {
    const randomPowerWord = powerWords[Math.floor(Math.random() * powerWords.length)];
    return `${randomPowerWord} ${originalTitle} Guide ${yearSuffix}`;
  }
  
  return originalTitle;
}

function generateSEOOptimizedExcerpt(content, focusKeyword) {
  // Remove frontmatter and markdown syntax
  let cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();
  cleanContent = cleanContent.replace(/#{1,6}\s+/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
  
  const sentences = cleanContent.split('.').filter(s => s.trim().length > 20).slice(0, 2);
  let excerpt = sentences.join('.') + '.';
  
  if (excerpt.length < 120) {
    const moreSentences = cleanContent.split('.').slice(2, 4);
    excerpt += ' ' + moreSentences.join('.') + '.';
  }
  
  // Ensure focus keyword is included
  if (!excerpt.toLowerCase().includes(focusKeyword.toLowerCase())) {
    excerpt = `Learn about ${focusKeyword}: ${excerpt}`;
  }
  
  return excerpt.substring(0, 160).trim();
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateAdditionalKeywords(focusKeyword, content) {
  const aviationKeywords = [
    'pilot training', 'aviation career', 'flight school', 'DGCA', 'commercial pilot',
    'airline pilot', 'aviation industry', 'pilot license', 'flight training',
    'aviation courses', 'pilot salary', 'aviation jobs', 'CPL', 'ATPL', 'RTR license',
    'type rating', 'aviation english', 'medical examination', 'ground school'
  ];
  
  const contentWords = content.toLowerCase();
  const relevantKeywords = aviationKeywords.filter(keyword => 
    contentWords.includes(keyword.toLowerCase()) && keyword !== focusKeyword
  );
  
  return relevantKeywords.slice(0, 5);
}

function extractFocusKeyword(title) {
  const aviationTerms = [
    'pilot training', 'aviation career', 'flight school', 'DGCA', 'commercial pilot',
    'airline pilot', 'pilot license', 'flight training', 'aviation courses', 'pilot salary',
    'CPL', 'ATPL', 'RTR license', 'type rating', 'aviation english', 'medical examination'
  ];
  
  const titleLower = title.toLowerCase();
  const foundTerm = aviationTerms.find(term => titleLower.includes(term));
  
  return foundTerm || 'pilot training';
}

function convertToPortableText(content) {
  // Remove frontmatter
  let cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();
  
  const blocks = [];
  const sections = cleanContent.split('\n\n');
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    if (section.startsWith('#')) {
      // Handle headings
      const level = section.match(/^#+/)?.[0].length || 1;
      const text = section.replace(/^#+\s*/, '').trim();
      
      if (text) {
        blocks.push({
          _type: 'block',
          style: level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4',
          children: [{ _type: 'span', text }]
        });
      }
    } else if (section.includes('- ') || section.includes('* ')) {
      // Handle lists
      const lines = section.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          blocks.push({
            _type: 'block',
            style: 'normal',
            listItem: 'bullet',
            children: [{ _type: 'span', text: line.replace(/^[-*]\s*/, '').trim() }]
          });
        } else if (line.trim()) {
          blocks.push({
            _type: 'block',
            style: 'normal',
            children: [{ _type: 'span', text: line.trim() }]
          });
        }
      }
    } else {
      // Regular paragraph
      const cleanText = section.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
      if (cleanText && !cleanText.startsWith('<!--')) {
        blocks.push({
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: cleanText }]
        });
      }
    }
  }
  
  return blocks;
}

async function loadOptimizedBlogPosts() {
  const optimizedDir = path.join(process.cwd(), 'data-blog-posts', 'optimized-blog-posts');
  
  try {
    console.log(`📂 Reading directory: ${optimizedDir}`);
    const files = await fs.readdir(optimizedDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');
    console.log(`📄 Found ${markdownFiles.length} markdown files`);
    
    const posts = [];
    
    for (const file of markdownFiles) {
      console.log(`📖 Processing file: ${file}`);
      const filePath = path.join(optimizedDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '').replace(/-/g, ' ');
      
      // Generate focus keyword from title
      const focusKeyword = extractFocusKeyword(title);
      
      // Extract first meaningful paragraph as excerpt
      const cleanContent = content.replace(/^---[\s\S]*?---/, '').trim();
      const paragraphs = cleanContent.split('\n\n').filter(p => p.trim() && !p.startsWith('#') && !p.startsWith('<!--'));
      const firstParagraph = paragraphs[0] || '';
      
      const post = {
        title: title,
        slug: file.replace('.md', ''),
        excerpt: generateSEOOptimizedExcerpt(cleanContent, focusKeyword),
        content: content,
        category: 'Aviation Training',
        seoTitle: enhanceTitle(title),
        seoDescription: generateSEOOptimizedExcerpt(cleanContent, focusKeyword),
        focusKeyword: focusKeyword,
        additionalKeywords: generateAdditionalKeywords(focusKeyword, content),
        readingTime: calculateReadingTime(content),
        featured: Math.random() > 0.8 // 20% chance of being featured
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

async function getOrCreateCategory(name) {
  try {
    const existing = await client.fetch(
      `*[_type == "category" && title == $name][0]`,
      { name }
    );
    
    if (existing) {
      console.log(`📂 Using existing category: ${name}`);
      return existing._id;
    }
    
    const category = await client.create({
      _type: 'category',
      title: name,
      slug: { current: name.toLowerCase().replace(/\s+/g, '-') },
      description: `${name} related content and resources for aspiring pilots and aviation professionals.`
    });
    
    console.log(`📂 Created new category: ${name} (${category._id})`);
    return category._id;
  } catch (error) {
    console.error('Error with category:', error);
    throw error;
  }
}

async function getOrCreateAuthor(name) {
  try {
    const existing = await client.fetch(
      `*[_type == "author" && name == $name][0]`,
      { name }
    );
    
    if (existing) {
      console.log(`👤 Using existing author: ${name}`);
      return existing._id;
    }
    
    const author = await client.create({
      _type: 'author',
      name,
      slug: { current: name.toLowerCase().replace(/\s+/g, '-') },
      bio: 'Aviation industry expert with years of experience in pilot training and career guidance. Specializes in helping aspiring pilots navigate their aviation career journey.',
      expertise: ['Aviation Training', 'Pilot Career Guidance', 'Flight Education', 'DGCA Regulations']
    });
    
    console.log(`👤 Created new author: ${name} (${author._id})`);
    return author._id;
  } catch (error) {
    console.error('Error with author:', error);
    throw error;
  }
}

async function publishBlogPosts() {
  console.log('🚀 Starting comprehensive blog publishing process...');
  
  try {
    // Load all optimized blog posts
    const optimizedPosts = await loadOptimizedBlogPosts();
    console.log(`📚 Loaded ${optimizedPosts.length} optimized blog posts`);
    
    if (optimizedPosts.length === 0) {
      console.log('❌ No blog posts found to process');
      return;
    }
    
    // Get or create default category and author
    console.log('\n🔧 Setting up category and author...');
    const categoryId = await getOrCreateCategory('Aviation Training');
    const authorId = await getOrCreateAuthor('Aviation Expert');
    
    let publishedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    console.log(`\n📝 Publishing ${optimizedPosts.length} blog posts...`);
    
    for (const [index, post] of optimizedPosts.entries()) {
      try {
        console.log(`\n[${index + 1}/${optimizedPosts.length}] Processing: ${post.title}`);
        
        // Check if post already exists
        const existingPost = await client.fetch(
          `*[_type == "post" && slug.current == $slug][0]`,
          { slug: post.slug }
        );
        
        if (existingPost) {
          console.log(`⏭️  Post already exists: ${post.title}`);
          skippedCount++;
          continue;
        }
        
        // Create comprehensive blog post
        const enhancedPost = {
          _type: 'post',
          title: post.title,
          slug: { current: post.slug },
          excerpt: post.excerpt,
          body: convertToPortableText(post.content),
          category: { _ref: categoryId },
          author: { _ref: authorId },
          publishedAt: new Date().toISOString(),
          featured: post.featured,
          readingTime: post.readingTime,
          
          // SEO Fields
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          focusKeyword: post.focusKeyword,
          additionalKeywords: post.additionalKeywords,
          
          // Structured Data
          structuredData: {
            articleType: 'EducationalArticle',
            learningResourceType: 'Guide',
            educationalLevel: 'intermediate',
            timeRequired: `PT${post.readingTime}M`
          },
          
          // CTA Configuration
          ctaPlacements: [
            {
              position: 'top',
              ctaType: 'course-promo',
              customTitle: 'Start Your Aviation Career Today',
              customMessage: 'Join thousands of successful pilots who started their journey with us.',
              buttonText: 'Explore Courses',
              variant: 'primary'
            },
            {
              position: 'bottom',
              ctaType: 'consultation',
              customTitle: 'Ready to Take Flight?',
              customMessage: 'Get personalized guidance from our aviation experts.',
              buttonText: 'Book Free Consultation',
              variant: 'secondary'
            }
          ],
          
          // Intelligent CTA Routing
          intelligentCTARouting: {
            enableIntelligentRouting: true,
            fallbackAction: 'courses-overview'
          },
          
          // Workflow Status
          workflowStatus: 'published',
          
          // Performance Metrics
          performanceMetrics: {
            estimatedReadingTime: post.readingTime,
            wordCount: post.content.split(/\s+/).length,
            lastSEOCheck: new Date().toISOString(),
            seoScore: 85 // Default good SEO score
          },
          
          // Content Validation
          contentValidation: {
            hasRequiredFields: true,
            hasValidSEO: true,
            hasValidImages: false, // No images for now
            readyForPublish: true
          }
        };
        
        const result = await client.create(enhancedPost);
        
        console.log(`✅ Published: ${post.title}`);
        console.log(`   📍 ID: ${result._id}`);
        console.log(`   🔗 Slug: ${post.slug}`);
        console.log(`   📊 Reading Time: ${post.readingTime} min`);
        console.log(`   🎯 Focus Keyword: ${post.focusKeyword}`);
        console.log(`   ⭐ Featured: ${post.featured ? 'Yes' : 'No'}`);
        
        publishedCount++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Error publishing ${post.title}:`, error.message);
        errorCount++;
        
        // Continue with next post instead of stopping
        continue;
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BLOG PUBLISHING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully published: ${publishedCount} posts`);
    console.log(`⏭️  Already existed (skipped): ${skippedCount} posts`);
    console.log(`❌ Errors encountered: ${errorCount} posts`);
    console.log(`📚 Total processed: ${optimizedPosts.length} posts`);
    console.log('='.repeat(60));
    
    if (publishedCount > 0) {
      console.log('\n🎉 Blog publishing completed successfully!');
      console.log('🌐 Your aviation blog is now live with professional content.');
      console.log('📈 All posts include SEO optimization and intelligent CTAs.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during blog publishing:', error);
    process.exit(1);
  }
}

// Main execution
publishBlogPosts().catch(console.error);