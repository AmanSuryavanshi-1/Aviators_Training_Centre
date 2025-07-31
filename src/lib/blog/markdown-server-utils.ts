'use server';

// Server-side utilities for markdown operations
// This file provides server-side functions that can be safely imported in server components

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { 
  BlogPost, 
  BlogPostPreview, 
  BlogCategory, 
  BlogAuthor, 
  SanityImage, 
  SEOEnhancement 
} from '../types/blog';

interface MarkdownBlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  tags: string[];
  featured: boolean;
  readingTime: number;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  publishedAt: string;
  content: string;
  priority: number;
}

class MarkdownBlogReader {
  private blogPostsDir: string;

  constructor() {
    this.blogPostsDir = path.join(process.cwd(), 'data', 'optimized-blog-posts');
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.blogPostsDir)) {
      fs.mkdirSync(this.blogPostsDir, { recursive: true });
    }
  }

  private parseMarkdownFile(filePath: string): MarkdownBlogPost | null {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);

      // Determine if post should be featured based on priority or explicit flag
      const priority = data.priority || 999;
      const isFeatured = data.featured === true || priority <= 3;

      // Calculate reading time based on content length
      const wordsPerMinute = 200;
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

      return {
        title: data.title || '',
        slug: data.slug || path.basename(filePath, '.md'),
        excerpt: data.excerpt || '',
        category: data.category || 'General',
        author: data.author || 'ATC Instructor',
        tags: data.tags || [],
        featured: isFeatured,
        readingTime: readingTime,
        seoTitle: data.seoTitle || data.title || '',
        seoDescription: data.seoDescription || data.excerpt || '',
        focusKeyword: data.focusKeyword || '',
        publishedAt: data.publishedAt || new Date().toISOString(),
        content: content,
        priority: priority,
      };
    } catch (error) {
      console.error(`Error parsing markdown file ${filePath}:`, error);
      return null;
    }
  }

  private createCategory(categoryName: string): BlogCategory {
    return {
      _id: `category-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
      _type: 'category',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: 'v1',
      title: categoryName,
      slug: { current: categoryName.toLowerCase().replace(/\s+/g, '-') },
      color: '#1E40AF',
      description: `${categoryName} related content`,
    };
  }

  private createAuthor(authorName: string): BlogAuthor {
    return {
      _id: `author-${authorName.toLowerCase().replace(/\s+/g, '-')}`,
      _type: 'author',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: 'v1',
      name: authorName,
      slug: { current: authorName.toLowerCase().replace(/\s+/g, '-') },
      role: 'Chief Flight Instructor',
      credentials: 'ATPL, CFI, 12,000+ flight hours',
      bio: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: `${authorName} is an experienced aviation professional and instructor.`,
            },
          ],
        },
      ],
    };
  }

  private createPlaceholderImage(title: string): SanityImage {
    return {
      asset: {
        _ref: 'image-placeholder',
        _type: 'reference',
      },
      alt: title,
    };
  }

  private createSEOEnhancement(markdownPost: MarkdownBlogPost): SEOEnhancement {
    return {
      seoTitle: markdownPost.seoTitle,
      seoDescription: markdownPost.seoDescription,
      focusKeyword: markdownPost.focusKeyword,
      additionalKeywords: markdownPost.tags,
      canonicalUrl: `https://aviatorstrainingcentre.com/blog/${markdownPost.slug}`,
      structuredData: {
        articleType: 'EducationalArticle',
        learningResourceType: 'Guide',
        educationalLevel: 'intermediate',
        timeRequired: `PT${markdownPost.readingTime}M`,
      },
    };
  }

  private convertToBlogPost(markdownPost: MarkdownBlogPost): BlogPost {
    return {
      _id: `markdown-${markdownPost.slug}`,
      _type: 'post',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: 'v1',
      title: markdownPost.title,
      slug: { current: markdownPost.slug },
      publishedAt: markdownPost.publishedAt,
      excerpt: markdownPost.excerpt,
      body: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: markdownPost.content,
            },
          ],
        },
      ],
      readingTime: markdownPost.readingTime,
      featured: markdownPost.featured,
      category: this.createCategory(markdownPost.category),
      author: this.createAuthor(markdownPost.author),
      tags: markdownPost.tags,
      image: this.createPlaceholderImage(markdownPost.title),
      seoEnhancement: this.createSEOEnhancement(markdownPost),
      ctaPlacements: [
        {
          position: 'bottom',
          ctaType: 'course-promo',
          customTitle: 'Ready to Start Your Aviation Journey?',
          customMessage: 'Join our comprehensive training programs and take the first step toward your aviation career.',
          buttonText: 'Explore Courses',
          variant: 'primary',
        },
      ],
      intelligentCTARouting: {
        enableIntelligentRouting: true,
        fallbackAction: 'courses-overview',
      },
      difficulty: 'intermediate',
      contentType: 'guide',
      enableComments: true,
      enableSocialSharing: true,
      enableNewsletterSignup: true,
    };
  }

  private convertToBlogPostPreview(markdownPost: MarkdownBlogPost & { priority?: number }): BlogPostPreview & { priority?: number } {
    return {
      _id: `markdown-${markdownPost.slug}`,
      title: markdownPost.title,
      slug: { current: markdownPost.slug },
      publishedAt: markdownPost.publishedAt,
      excerpt: markdownPost.excerpt,
      readingTime: markdownPost.readingTime,
      featured: markdownPost.featured,
      category: this.createCategory(markdownPost.category),
      author: this.createAuthor(markdownPost.author),
      tags: markdownPost.tags,
      image: this.createPlaceholderImage(markdownPost.title),
      priority: (markdownPost as any).priority,
    };
  }

  getAllBlogPosts(): BlogPostPreview[] {
    this.ensureDirectoryExists();

    try {
      const files = fs.readdirSync(this.blogPostsDir);
      const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');

      const blogPosts: BlogPostPreview[] = [];

      for (const file of markdownFiles) {
        const filePath = path.join(this.blogPostsDir, file);
        const markdownPost = this.parseMarkdownFile(filePath);

        if (markdownPost) {
          blogPosts.push(this.convertToBlogPostPreview(markdownPost));
        }
      }

      // Sort by priority first (lower number = higher priority), then by featured status, then by date
      return blogPosts.sort((a, b) => {
        const aPriority = (a as any).priority || 999;
        const bPriority = (b as any).priority || 999;
        
        // Sort by priority first
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Featured posts first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        
        // Then by date (newest first)
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    } catch (error) {
      console.error('Error reading markdown blog posts:', error);
      return [];
    }
  }

  getBlogPostBySlug(slug: string): BlogPost | null {
    this.ensureDirectoryExists();

    try {
      const files = fs.readdirSync(this.blogPostsDir);
      const markdownFiles = files.filter(file => file.endsWith('.md') && file !== 'README.md');

      for (const file of markdownFiles) {
        const filePath = path.join(this.blogPostsDir, file);
        const markdownPost = this.parseMarkdownFile(filePath);

        if (markdownPost && markdownPost.slug === slug) {
          return this.convertToBlogPost(markdownPost);
        }
      }

      return null;
    } catch (error) {
      console.error(`Error reading blog post with slug ${slug}:`, error);
      return null;
    }
  }

  getFeaturedBlogPosts(): BlogPostPreview[] {
    const allPosts = this.getAllBlogPosts();
    return allPosts
      .filter(post => post.featured)
      .sort((a, b) => {
        // Sort featured posts by priority if available, then by date
        const aPriority = (a as any).priority || 999;
        const bPriority = (b as any).priority || 999;
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }

  getBlogPostsByCategory(category: string): BlogPostPreview[] {
    const allPosts = this.getAllBlogPosts();
    return allPosts.filter(post => 
      post.category.title.toLowerCase() === category.toLowerCase()
    );
  }

  searchBlogPosts(query: string): BlogPostPreview[] {
    const allPosts = this.getAllBlogPosts();
    const searchTerm = query.toLowerCase();

    return allPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.category.title.toLowerCase().includes(searchTerm)
    );
  }

  getAllCategories(): string[] {
    const allPosts = this.getAllBlogPosts();
    const categories = new Set(allPosts.map(post => post.category.title));
    return Array.from(categories);
  }

  getAllTags(): string[] {
    const allPosts = this.getAllBlogPosts();
    const tags = new Set(allPosts.flatMap(post => post.tags || []));
    return Array.from(tags);
  }
}

// Create and export a singleton instance for server-side use
const markdownBlogReaderInstance = new MarkdownBlogReader();

// Named exports for all methods to avoid default export issues
export async function getMarkdownBlogPosts(options: {
  limit?: number;
  offset?: number;
  featured?: boolean;
} = {}): Promise<BlogPostPreview[]> {
  try {
    const { limit = 50, offset = 0, featured } = options;
    
    let posts = markdownBlogReaderInstance.getAllBlogPosts();
    
    if (featured !== undefined) {
      posts = posts.filter(post => post.featured === featured);
    }
    
    return posts.slice(offset, offset + limit);
  } catch (error) {
    console.error('Error fetching markdown blog posts:', error);
    return [];
  }
}

export async function getMarkdownBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    if (!slug || typeof slug !== 'string') {
      return null;
    }
    
    return markdownBlogReaderInstance.getBlogPostBySlug(slug);
  } catch (error) {
    console.error(`Error fetching markdown blog post by slug: ${slug}`, error);
    return null;
  }
}

export async function getMarkdownFeaturedBlogPosts(): Promise<BlogPostPreview[]> {
  try {
    return markdownBlogReaderInstance.getFeaturedBlogPosts();
  } catch (error) {
    console.error('Error fetching featured markdown blog posts:', error);
    return [];
  }
}

export async function getMarkdownBlogPostsByCategory(category: string): Promise<BlogPostPreview[]> {
  try {
    if (!category || typeof category !== 'string') {
      return [];
    }
    
    return markdownBlogReaderInstance.getBlogPostsByCategory(category);
  } catch (error) {
    console.error(`Error fetching markdown blog posts by category: ${category}`, error);
    return [];
  }
}

export async function searchMarkdownBlogPosts(query: string): Promise<BlogPostPreview[]> {
  try {
    if (!query || typeof query !== 'string') {
      return [];
    }
    
    return markdownBlogReaderInstance.searchBlogPosts(query);
  } catch (error) {
    console.error(`Error searching markdown blog posts with query: ${query}`, error);
    return [];
  }
}

export async function getMarkdownBlogCategories(): Promise<string[]> {
  try {
    return markdownBlogReaderInstance.getAllCategories();
  } catch (error) {
    console.error('Error fetching markdown blog categories:', error);
    return [];
  }
}

export async function getMarkdownBlogTags(): Promise<string[]> {
  try {
    return markdownBlogReaderInstance.getAllTags();
  } catch (error) {
    console.error('Error fetching markdown blog tags:', error);
    return [];
  }
}

export async function isMarkdownBlogAvailable(): Promise<boolean> {
  try {
    const posts = markdownBlogReaderInstance.getAllBlogPosts();
    return posts.length > 0;
  } catch (error) {
    console.error('Error checking markdown blog availability:', error);
    return false;
  }
}
