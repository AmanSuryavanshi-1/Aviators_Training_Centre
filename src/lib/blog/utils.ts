import { BlogPost, BlogPostPreview, Course, BlogCategory } from '../types/blog';
import { urlFor } from '../sanity/client';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Enhanced image URL generation with comprehensive fallback mechanisms
export function getImageUrl(
  image: { asset: SanityImageSource } | null | undefined,
  width?: number,
  height?: number,
  fallbackUrl?: string
): string {
  try {
    if (!image?.asset || image.asset._ref === 'image-placeholder') {
      // Return high-quality aviation fallback - bulletproof system will handle further fallbacks
      return fallbackUrl || 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    let imageBuilder = urlFor(image.asset);

    if (width && width > 0) imageBuilder = imageBuilder.width(width);
    if (height && height > 0) imageBuilder = imageBuilder.height(height);

    const url = imageBuilder.url();

    // Validate URL format
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.warn('Invalid image URL generated, using bulletproof fallback:', url);
      return fallbackUrl || 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
    }

    return url;
  } catch (error) {
    console.error('Error generating image URL, using bulletproof fallback:', error);
    return fallbackUrl || 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
  }
}

// Enhanced image URL generation with bulletproof fallback integration
export function getBulletproofImageUrl(
  image: { asset: SanityImageSource } | null | undefined,
  alt: string,
  width?: number,
  height?: number,
  category?: 'aviation' | 'pilot' | 'training' | 'medical' | 'aircraft'
): string {
  // First try to get the Sanity image URL
  const sanityUrl = getImageUrl(image, width, height);
  
  // The bulletproof system will handle all fallbacks from here
  return sanityUrl;
}

// Enhanced optimized image URL generation with modern format support
export function getOptimizedImageUrl(
  image: { asset: SanityImageSource } | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min';
    fallbackUrl?: string;
  } = {}
): string {
  try {
    if (!image?.asset) {
      return options.fallbackUrl || '/placeholder.svg';
    }

    let imageBuilder = urlFor(image.asset);

    if (options.width && options.width > 0) imageBuilder = imageBuilder.width(options.width);
    if (options.height && options.height > 0) imageBuilder = imageBuilder.height(options.height);
    if (options.quality && options.quality > 0 && options.quality <= 100) {
      imageBuilder = imageBuilder.quality(options.quality);
    }
    if (options.format) imageBuilder = imageBuilder.format(options.format);
    if (options.fit) imageBuilder = imageBuilder.fit(options.fit);

    const url = imageBuilder.url();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return options.fallbackUrl || '/placeholder.svg';
    }

    return url;
  } catch (error) {
    console.error('Error generating optimized image URL:', error);
    return options.fallbackUrl || '/placeholder.svg';
  }
}

// Generate responsive image srcSet for different screen sizes
export function getResponsiveImageSrcSet(
  image: { asset: SanityImageSource } | null | undefined,
  options: {
    sizes: number[];
    format?: 'webp' | 'jpg' | 'png';
    quality?: number;
    fallbackUrl?: string;
  }
): string {
  try {
    if (!image?.asset) {
      return options.fallbackUrl || '/placeholder.svg';
    }

    const { sizes, format = 'webp', quality = 80 } = options;

    const srcSetEntries = sizes.map(size => {
      const url = getOptimizedImageUrl(image, {
        width: size,
        format,
        quality,
        fallbackUrl: options.fallbackUrl,
      });
      return `${url} ${size}w`;
    });

    return srcSetEntries.join(', ');
  } catch (error) {
    console.error('Error generating responsive image srcSet:', error);
    return options.fallbackUrl || '/placeholder.svg';
  }
}

// Blog post validation with comprehensive checks
export function validateBlogPost(post: any): post is BlogPost {
  if (!post || typeof post !== 'object') return false;

  const requiredFields = ['_id', 'slug', 'title'];
  for (const field of requiredFields) {
    if (!post[field]) {
      console.warn(`Invalid or missing required field: ${field}`);
      return false;
    }
  }

  // Validate slug structure
  if (post.slug && typeof post.slug === 'object' && !post.slug.current) {
    console.warn('Invalid slug structure - missing current property');
    return false;
  }

  return true;
}

// Blog post preview validation
export function validateBlogPostPreview(post: any): post is BlogPostPreview {
  if (!post || typeof post !== 'object') return false;

  const requiredFields = ['_id', 'slug', 'title'];
  for (const field of requiredFields) {
    if (!post[field]) {
      console.warn(`Invalid or missing required field in preview: ${field}`);
      return false;
    }
  }

  return true;
}

// Sanitize blog post data with comprehensive fallbacks
export function sanitizeBlogPost(post: any): BlogPost | null {
  if (!validateBlogPost(post)) return null;

  return {
    ...post,
    slug: typeof post.slug === 'string' ? { current: post.slug } : (post.slug?.current ? post.slug : { current: 'untitled' }),
    excerpt: post.excerpt || '',
    readingTime: typeof post.readingTime === 'number' && post.readingTime > 0 ? post.readingTime : 5,
    publishedAt: post.publishedAt || new Date().toISOString(),
    image: post.image || {
      asset: {} as SanityImageSource,
      alt: 'Blog post image',
    },
    category: post.category || {
      _id: 'default-category',
      _type: 'category',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      title: 'General',
      slug: { current: 'general' },
      color: '#075E68',
    },
    author: post.author || {
      _id: 'default-author',
      _type: 'author',
      _createdAt: new Date().toISOString(),
      _updatedAt: new Date().toISOString(),
      _rev: '',
      name: 'Anonymous',
      slug: { current: 'anonymous' },
      role: 'Author',
    },
    body: Array.isArray(post.body) ? post.body : [],
    ctaPlacements: Array.isArray(post.ctaPlacements) ? post.ctaPlacements : [],
    featured: Boolean(post.featured),
    tags: Array.isArray(post.tags) ? post.tags : [],
    difficulty: post.difficulty || 'beginner',
    contentType: post.contentType || 'guide',
    enableComments: post.enableComments !== false,
    enableSocialSharing: post.enableSocialSharing !== false,
    enableNewsletterSignup: post.enableNewsletterSignup !== false,
    viewCount: post.viewCount || 0,
    shareCount: post.shareCount || 0,
    engagementScore: post.engagementScore || 0,
    seoEnhancement: post.seoEnhancement || {
      seoTitle: post.title,
      seoDescription: post.excerpt || '',
      focusKeyword: '',
    },
  };
}

// Sanitize blog post preview data
export function sanitizeBlogPostPreview(post: any): BlogPostPreview {
  return {
    _id: post._id || 'unknown',
    title: post.title || 'Untitled Post',
    slug: post.slug?.current ? post.slug : { current: post.slug || 'untitled' },
    publishedAt: post.publishedAt || new Date().toISOString(),
    excerpt: post.excerpt || '',
    image: post.image || {
      asset: {} as SanityImageSource,
      alt: 'Blog post image',
    },
    category: post.category || {
      title: 'General',
      slug: { current: 'general' },
      color: '#075E68',
    },
    author: post.author || {
      name: 'Anonymous',
      slug: { current: 'anonymous' },
      role: 'Author',
    },
    readingTime: typeof post.readingTime === 'number' && post.readingTime > 0 ? post.readingTime : 5,
    featured: Boolean(post.featured),
    tags: Array.isArray(post.tags) ? post.tags : [],
    difficulty: post.difficulty || 'beginner',
  };
}

// Calculate estimated reading time based on content
export function calculateReadingTime(content: string | any[]): number {
  try {
    let wordCount = 0;

    if (typeof content === 'string') {
      // Simple word count for plain text
      wordCount = content.trim().split(/\s+/).length;
    } else if (Array.isArray(content)) {
      // Handle Portable Text blocks
      wordCount = content.reduce((count, block) => {
        if (block._type === 'block' && block.children) {
          const blockText = block.children
            .filter((child: any) => child._type === 'span')
            .map((child: any) => child.text || '')
            .join(' ');
          return count + blockText.trim().split(/\s+/).length;
        }
        return count;
      }, 0);
    }

    // Average reading speed: 200 words per minute
    const readingTime = Math.ceil(wordCount / 200);
    return Math.max(1, readingTime); // Minimum 1 minute
  } catch (error) {
    console.error('Error calculating reading time:', error);
    return 5; // Default fallback
  }
}

// Extract plain text from Portable Text blocks
export function extractTextFromPortableText(blocks: any[]): string {
  try {
    if (!Array.isArray(blocks)) return '';

    return blocks
      .filter(block => block._type === 'block')
      .map(block => {
        if (!block.children || !Array.isArray(block.children)) return '';
        
        return block.children
          .filter((child: any) => child._type === 'span')
          .map((child: any) => child.text || '')
          .join(' ');
      })
      .join(' ')
      .trim();
  } catch (error) {
    console.error('Error extracting text from Portable Text:', error);
    return '';
  }
}

// Generate SEO-friendly URL slug from title
export function generateSlug(title: string): string {
  try {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  } catch (error) {
    console.error('Error generating slug:', error);
    return 'untitled';
  }
}

// Format date for display
export function formatDate(
  dateString: string,
  options: {
    format?: 'short' | 'medium' | 'long' | 'relative';
    locale?: string;
  } = {}
): string {
  try {
    const { format = 'medium', locale = 'en-US' } = options;
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn('Invalid date string provided:', dateString);
      return 'Invalid date';
    }

    if (format === 'relative') {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
      return `${Math.floor(diffInSeconds / 31536000)} years ago`;
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      short: { month: 'short', day: 'numeric', year: 'numeric' },
      medium: { month: 'long', day: 'numeric', year: 'numeric' },
      long: { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      },
    }[format] as Intl.DateTimeFormatOptions || { month: 'long', day: 'numeric', year: 'numeric' };

    return date.toLocaleDateString(locale, formatOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Unknown date';
  }
}

// Generate breadcrumb navigation for blog posts
export function generateBlogBreadcrumbs(
  post: BlogPost,
  options: {
    includeHome?: boolean;
    homePath?: string;
    blogPath?: string;
  } = {}
): Array<{ label: string; href: string }> {
  const {
    includeHome = true,
    homePath = '/',
    blogPath = '/blog',
  } = options;

  const breadcrumbs: Array<{ label: string; href: string }> = [];

  if (includeHome) {
    breadcrumbs.push({ label: 'Home', href: homePath });
  }

  breadcrumbs.push({ label: 'Blog', href: blogPath });

  if (post.category?.title && post.category?.slug?.current) {
    breadcrumbs.push({
      label: post.category.title,
      href: `${blogPath}/category/${post.category.slug.current}`,
    });
  }

  breadcrumbs.push({
    label: post.title,
    href: `${blogPath}/${post.slug.current}`,
  });

  return breadcrumbs;
}

// Generate structured data for blog posts (JSON-LD)
export function generateBlogPostStructuredData(post: BlogPost): object {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aviatorstrainingcentre.in';
    
    return {
      '@context': 'https://schema.org',
      '@type': post.seoEnhancement?.structuredData?.articleType || 'BlogPosting',
      headline: post.title,
      description: post.seoEnhancement?.seoDescription || post.excerpt,
      image: post.image ? getOptimizedImageUrl(post.image, { width: 1200, height: 630 }) : undefined,
      datePublished: post.publishedAt,
      dateModified: post.lastModified || post.publishedAt,
      author: {
        '@type': 'Person',
        name: post.author.name,
        url: post.author.slug?.current ? `${baseUrl}/authors/${post.author.slug.current}` : undefined,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Aviators Training Centre',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${post.slug.current}`,
      },
      keywords: [
        post.seoEnhancement?.focusKeyword,
        ...(post.seoEnhancement?.additionalKeywords || []),
        ...(post.tags || []),
      ].filter(Boolean).join(', '),
      articleSection: post.category?.title,
      wordCount: post.body ? extractTextFromPortableText(post.body).split(/\s+/).length : undefined,
      timeRequired: `PT${post.readingTime}M`,
      ...(post.seoEnhancement?.structuredData?.learningResourceType && {
        '@type': 'LearningResource',
        learningResourceType: post.seoEnhancement.structuredData.learningResourceType,
        educationalLevel: post.seoEnhancement.structuredData.educationalLevel,
        teaches: post.seoEnhancement.structuredData.learningOutcomes,
      }),
    };
  } catch (error) {
    console.error('Error generating structured data:', error);
    return {};
  }
}

// Validate and sanitize course data
export function sanitizeCourse(course: any): Course {
  return {
    ...course,
    name: course.name || 'Untitled Course',
    slug: course.slug?.current ? course.slug : { current: course.slug || 'untitled' },
    description: course.description || '',
    shortDescription: course.shortDescription || course.description || '',
    targetUrl: course.targetUrl || `/courses/${course.slug?.current || 'untitled'}`,
    keywords: Array.isArray(course.keywords) ? course.keywords : [],
    ctaSettings: course.ctaSettings || {
      primaryButtonText: 'Learn More',
      secondaryButtonText: 'Contact Us',
      ctaTitle: `Enroll in ${course.name || 'Course'}`,
      ctaMessage: 'Take the next step in your aviation career.',
    },
    active: course.active !== false,
    category: course.category || 'general',
  };
}

// Validate and sanitize category data
export function sanitizeBlogCategory(category: any): BlogCategory {
  return {
    ...category,
    title: category.title || 'Untitled Category',
    slug: category.slug?.current ? category.slug : { current: category.slug || 'untitled' },
    description: category.description || '',
    color: category.color || '#075E68',
  };
}

// Generate cache tags for blog content
export function generateCacheTags(
  type: 'post' | 'posts' | 'category' | 'categories' | 'course' | 'courses',
  identifier?: string
): string[] {
  const baseTags = [`blog-${type}`];
  
  if (identifier) {
    baseTags.push(`blog-${type}-${identifier}`);
  }
  
  // Add general blog cache tag
  baseTags.push('blog');
  
  return baseTags;
}

// Utility to check if content is stale and needs revalidation
export function isContentStale(
  lastModified: string | undefined,
  cacheTime: number = 3600 // 1 hour default
): boolean {
  if (!lastModified) return true;
  
  try {
    const lastModifiedTime = new Date(lastModified).getTime();
    const now = Date.now();
    const ageInSeconds = (now - lastModifiedTime) / 1000;
    
    return ageInSeconds > cacheTime;
  } catch (error) {
    console.error('Error checking content staleness:', error);
    return true; // Assume stale if we can't determine
  }
}

// Performance monitoring utilities
export function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = performance.now();
    
    try {
      const result = await operation();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${operationName} took ${duration.toFixed(2)}ms`);
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
        try {
          if ((window as any).gtag) {
            (window as any).gtag('event', 'timing_complete', {
              name: operationName,
              value: Math.round(duration),
            });
          }
        } catch (analyticsError) {
          console.warn('Failed to send performance data to analytics:', analyticsError);
        }
      }
      
      resolve({ result, duration });
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
      reject(error);
    }
  });
}

// All utility functions are already exported above with their declarations
