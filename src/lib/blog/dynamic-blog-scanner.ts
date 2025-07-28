/**
 * Dynamic Blog Scanner - Automatically detects and includes new blog posts
 * This system scans the blog directory for markdown files and includes them dynamically
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPostMeta {
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
  isNew?: boolean;
}

export interface DynamicBlogMetadata {
  totalPosts: number;
  posts: BlogPostMeta[];
  categories: string[];
  lastScanned: string;
  newPostsDetected: number;
}

// Function to extract word count from markdown content
function getWordCount(content: string): number {
  // Remove markdown syntax and count words
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

// Function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Function to determine category from content or filename
function determineCategory(frontMatter: any, filename: string, content: string): string {
  // Check frontmatter first
  if (frontMatter.category) {
    return frontMatter.category;
  }
  
  // Analyze content for keywords to determine category
  const contentLower = (frontMatter.title + ' ' + content).toLowerCase();
  
  if (contentLower.includes('dgca') && (contentLower.includes('exam') || contentLower.includes('preparation'))) {
    return 'DGCA Exam Preparation';
  }
  if (contentLower.includes('medical') && contentLower.includes('aviation')) {
    return 'Aviation Medical';
  }
  if (contentLower.includes('salary') || contentLower.includes('career') || contentLower.includes('job')) {
    return 'Career Guidance';
  }
  if (contentLower.includes('flight') && contentLower.includes('training')) {
    return 'Flight Training';
  }
  if (contentLower.includes('technology') || contentLower.includes('technical')) {
    return 'Technical Knowledge';
  }
  if (contentLower.includes('atpl') && contentLower.includes('cpl')) {
    return 'License Comparison';
  }
  if (contentLower.includes('type rating') || contentLower.includes('a320') || contentLower.includes('b737')) {
    return 'Type Rating';
  }
  if (contentLower.includes('rtr') || contentLower.includes('radio telephony')) {
    return 'RTR License';
  }
  if (contentLower.includes('interview') && contentLower.includes('pilot')) {
    return 'Interview Preparation';
  }
  if (contentLower.includes('ground school')) {
    return 'Ground School';
  }
  if (contentLower.includes('cost') && contentLower.includes('training')) {
    return 'Training Costs';
  }
  if (contentLower.includes('english') && contentLower.includes('proficiency')) {
    return 'English Proficiency';
  }
  if (contentLower.includes('airline') && contentLower.includes('recruitment')) {
    return 'Airline Recruitment';
  }
  
  // Default category
  return 'Aviation Training';
}

// Function to determine conversion potential based on content
function determineConversionPotential(frontMatter: any, content: string): string {
  if (frontMatter.conversionPotential) {
    return frontMatter.conversionPotential;
  }
  
  const contentLower = content.toLowerCase();
  
  // High conversion potential keywords
  if (contentLower.includes('cost') || contentLower.includes('salary') || 
      contentLower.includes('exam') || contentLower.includes('license') ||
      contentLower.includes('training') || contentLower.includes('course')) {
    return 'very-high';
  }
  
  // Medium conversion potential
  if (contentLower.includes('career') || contentLower.includes('guide') ||
      contentLower.includes('tips') || contentLower.includes('requirements')) {
    return 'high';
  }
  
  return 'medium';
}

// Main function to scan and generate dynamic metadata
export function scanBlogPosts(): DynamicBlogMetadata {
  try {
    const blogDir = path.join(process.cwd(), 'data-blog-posts/optimized-blog-posts');
    const metadataPath = path.join(blogDir, 'metadata.json');
    
    // Read existing metadata if it exists
    let existingMetadata: any = { posts: [], categories: [] };
    if (fs.existsSync(metadataPath)) {
      try {
        existingMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      } catch (error) {
        console.warn('Error reading existing metadata:', error);
      }
    }
    
    // Get all markdown files
    const files = fs.readdirSync(blogDir)
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .sort();
    
    const posts: BlogPostMeta[] = [];
    const categories = new Set<string>();
    let newPostsDetected = 0;
    
    // Create a map of existing posts by slug for comparison
    const existingPosts = new Map<string, any>();
    if (existingMetadata.posts) {
      existingMetadata.posts.forEach((post: any) => {
        existingPosts.set(post.slug, post);
      });
    }
    
    files.forEach((file, index) => {
      try {
        const filePath = path.join(blogDir, file);
        const markdownContent = fs.readFileSync(filePath, 'utf-8');
        const { data: frontMatter, content } = matter(markdownContent);
        
        // Generate slug from filename (remove .md extension)
        const baseSlug = file.replace('.md', '');
        const slug = frontMatter.slug || baseSlug;
        
        // Check if this is a new post
        const isNew = !existingPosts.has(slug);
        if (isNew) {
          newPostsDetected++;
        }
        
        // Get existing post data or create new
        const existingPost = existingPosts.get(slug);
        
        const title = frontMatter.title || 
          baseSlug.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        
        const excerpt = frontMatter.excerpt || 
          content.substring(0, 200).replace(/[#*`]/g, '').trim() + '...';
        
        const category = determineCategory(frontMatter, file, content);
        categories.add(category);
        
        const wordCount = getWordCount(content);
        
        const post: BlogPostMeta = {
          id: existingPost?.id || (index + 1),
          title,
          slug,
          category,
          excerpt,
          quality: frontMatter.quality || 'high',
          conversionPotential: determineConversionPotential(frontMatter, content),
          wordCount,
          filePath: `data/optimized-blog-posts/${file}`,
          priority: existingPost?.priority || (index + 1),
          isNew
        };
        
        posts.push(post);
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    });
    
    // Sort posts by priority
    posts.sort((a, b) => a.priority - b.priority);
    
    const metadata: DynamicBlogMetadata = {
      totalPosts: posts.length,
      posts,
      categories: Array.from(categories).sort(),
      lastScanned: new Date().toISOString(),
      newPostsDetected
    };
    
    // Update the metadata file with new posts
    try {
      const updatedMetadata = {
        ...existingMetadata,
        totalPosts: metadata.totalPosts,
        posts: metadata.posts,
        categories: metadata.categories,
        lastScanned: metadata.lastScanned,
        newPostsDetected: metadata.newPostsDetected,
        // Preserve other metadata
        optimizationDate: existingMetadata.optimizationDate || new Date().toISOString(),
        description: existingMetadata.description || "Comprehensive blog post collection covering all aspects of aviation training and career development",
        qualityDistribution: {
          high: posts.filter(p => p.quality === 'high').length,
          medium: posts.filter(p => p.quality === 'medium').length,
          low: posts.filter(p => p.quality === 'low').length,
        },
        conversionPotential: {
          veryHigh: posts.filter(p => p.conversionPotential === 'very-high').length,
          high: posts.filter(p => p.conversionPotential === 'high').length,
          medium: posts.filter(p => p.conversionPotential === 'medium').length,
          low: posts.filter(p => p.conversionPotential === 'low').length,
        },
        totalWordCount: posts.reduce((sum, post) => sum + post.wordCount, 0),
        averageWordCount: Math.round(posts.reduce((sum, post) => sum + post.wordCount, 0) / posts.length),
        seoOptimized: true,
        readyForProduction: true
      };
      
      fs.writeFileSync(metadataPath, JSON.stringify(updatedMetadata, null, 2));
      console.log(`✅ Updated metadata.json with ${posts.length} posts (${newPostsDetected} new)`);
    } catch (error) {
      console.error('Error updating metadata file:', error);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error scanning blog posts:', error);
    return {
      totalPosts: 0,
      posts: [],
      categories: [],
      lastScanned: new Date().toISOString(),
      newPostsDetected: 0
    };
  }
}

// Function to refresh blog cache (can be called from admin or API)
export function refreshBlogCache(): DynamicBlogMetadata {
  console.log('🔄 Refreshing blog cache...');
  return scanBlogPosts();
}