import { enhancedClient } from '../sanity/client';
import {
  BlogPost,
  BlogPostPreview,
  BlogCategory,
  Course,
  BlogListingData,
  BlogPostPageData,
  BlogSearchParams,
  BlogSearchResult,
  BlogAPIResponse,
  PaginatedResponse,
  QueryOptions,
  BlogError,
} from '../types/blog';
import { blogAPIClient } from './api-client';
import { BlogFallbackProvider } from './error-handling';
import { enhancedFallbackSystem } from './enhanced-fallback-system';

// Enhanced error handling class
export class BlogAPIError extends Error implements BlogError {
  code?: string;
  statusCode?: number;
  context?: {
    operation: string;
    params?: any;
    timestamp: string;
  };
  retryable?: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      operation?: string;
      params?: any;
      retryable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'BlogAPIError';
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.retryable = options.retryable ?? false;
    this.context = {
      operation: options.operation || 'unknown',
      params: options.params,
      timestamp: new Date().toISOString(),
    };
  }
}

// GROQ query constants for consistency and maintainability
export const BLOG_QUERIES = {
  // Base fields for blog post previews
  PREVIEW_FIELDS: `
    _id,
    title,
    slug,
    publishedAt,
    excerpt,
    image {
      asset,
      alt,
      caption
    },
    readingTime,
    featured,
    tags,
    difficulty,
    category-> {
      title,
      slug,
      color
    },
    author-> {
      name,
      slug,
      image {
        asset,
        alt
      },
      role
    }
  `,

  // Full fields for complete blog posts
  FULL_FIELDS: `
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    publishedAt,
    lastModified,
    excerpt,
    body,
    image {
      asset,
      alt,
      caption,
      hotspot,
      crop
    },
    readingTime,
    featured,
    tags,
    difficulty,
    contentType,
    enableComments,
    enableSocialSharing,
    enableNewsletterSignup,
    viewCount,
    shareCount,
    engagementScore,
    category-> {
      _id,
      title,
      slug,
      description,
      color,
      image {
        asset,
        alt
      },
      intelligentRouting {
        defaultCourse-> {
          _id,
          name,
          slug,
          category,
          shortDescription,
          targetUrl,
          keywords,
          ctaSettings,
          active
        },
        keywords,
        courseMapping[] {
          keywords,
          priority,
          targetCourse-> {
            _id,
            name,
            slug,
            category,
            shortDescription,
            targetUrl,
            keywords,
            ctaSettings,
            active
          }
        }
      },
      seoSettings
    },
    author-> {
      _id,
      name,
      slug,
      image {
        asset,
        alt
      },
      bio,
      role,
      credentials,
      email,
      socialLinks
    },
    seoEnhancement {
      seoTitle,
      seoDescription,
      focusKeyword,
      additionalKeywords,
      canonicalUrl,
      openGraphImage {
        asset,
        alt
      },
      twitterCard,
      structuredData,
      additionalMetaTags
    },
    ctaPlacements[] {
      position,
      ctaType,
      targetCourse-> {
        _id,
        name,
        slug,
        category,
        shortDescription,
        targetUrl,
        ctaSettings,
        active
      },
      customTitle,
      customMessage,
      buttonText,
      variant,
      priority,
      conditions
    },
    intelligentCTARouting {
      enableIntelligentRouting,
      primaryCourseTarget-> {
        _id,
        name,
        slug,
        category,
        shortDescription,
        targetUrl,
        ctaSettings,
        active
      },
      fallbackAction,
      routingRules[] {
        keywords,
        priority,
        targetCourse-> {
          _id,
          name,
          slug,
          category,
          shortDescription,
          targetUrl,
          ctaSettings,
          active
        }
      },
      contextualSettings
    }
  `,

  // Category fields
  CATEGORY_FIELDS: `
    _id,
    title,
    slug,
    description,
    color,
    image {
      asset,
      alt
    },
    intelligentRouting {
      defaultCourse-> {
        _id,
        name,
        slug,
        category,
        shortDescription,
        targetUrl,
        keywords,
        ctaSettings,
        active
      },
      keywords,
      courseMapping[] {
        keywords,
        priority,
        targetCourse-> {
          _id,
          name,
          slug,
          category,
          shortDescription,
          targetUrl,
          keywords,
          ctaSettings,
          active
        }
      }
    },
    seoSettings
  `,

  // Course fields
  COURSE_FIELDS: `
    _id,
    name,
    slug,
    category,
    description,
    shortDescription,
    targetUrl,
    price,
    duration,
    level,
    keywords,
    ctaSettings,
    active,
    featured,
    image {
      asset,
      alt
    },
    prerequisites,
    outcomes
  `,
} as const;

// Enhanced blog post fetching with comprehensive error handling and fallback
export async function getAllBlogPosts(
  options: QueryOptions & {
    limit?: number;
    offset?: number;
    featured?: boolean;
    category?: string;
    includeUnpublished?: boolean;
  } = {}
): Promise<BlogAPIResponse<BlogPostPreview[]>> {
  const {
    limit = 50,
    offset = 0,
    featured,
    category,
    includeUnpublished = false,
    cache,
    retries = 3,
  } = options;

  // Primary operation using Sanity
  const primaryOperation = async (): Promise<BlogPostPreview[]> => {
    // Build dynamic query conditions
    const conditions = ['_type == "post"'];
    
    if (!includeUnpublished) {
      conditions.push('defined(publishedAt)');
      conditions.push('publishedAt <= now()');
    }
    
    if (featured !== undefined) {
      conditions.push(`featured == ${featured}`);
    }
    
    if (category) {
      conditions.push('category->slug.current == $category');
    }

    const query = `
      *[${conditions.join(' && ')}] | order(publishedAt desc) [${offset}...${offset + limit}] {
        ${BLOG_QUERIES.PREVIEW_FIELDS}
      }
    `;

    const params = category ? { category } : {};
    
    const cacheOptions = cache ? {
      cache: cache.enabled ? 'force-cache' as const : 'default' as const,
      next: cache.enabled ? { 
        revalidate: cache.ttl, 
        tags: cache.tags 
      } : undefined,
    } : undefined;

    const posts = await enhancedClient.fetch<BlogPostPreview[]>(
      query,
      params,
      { ...cacheOptions, retries }
    );

    // Validate and sanitize posts
    const validPosts = (posts || []).filter(post => {
      if (!post._id || !post.slug || !post.title) {
        console.warn('Invalid blog post found, skipping:', post);
        return false;
      }
      return true;
    });

    // Apply data transformations and fallbacks
    return validPosts.map(sanitizeBlogPostPreview);
  };

  // Fallback data preparation
  const { mockBlogPosts } = await import('./mock-data');
  let fallbackPosts = mockBlogPosts.map(sanitizeBlogPostPreview);
  
  // Apply filtering to fallback data
  if (featured !== undefined) {
    fallbackPosts = fallbackPosts.filter(post => post.featured === featured);
  }
  
  if (category) {
    fallbackPosts = fallbackPosts.filter(post => 
      post.category.slug.current === category
    );
  }
  
  // Apply pagination to fallback
  const paginatedFallbackPosts = fallbackPosts.slice(offset, offset + limit);

  // Use enhanced fallback system
  return await enhancedFallbackSystem.getDataWithFallback(
    primaryOperation,
    'getAllBlogPosts',
    paginatedFallbackPosts
  );
}

// Enhanced single blog post fetching
export async function getBlogPostBySlug(
  slug: string,
  options: QueryOptions = {}
): Promise<BlogAPIResponse<BlogPost | null>> {
  if (!slug || typeof slug !== 'string') {
    throw new BlogAPIError('Invalid slug provided', {
      code: 'INVALID_SLUG',
      operation: 'getBlogPostBySlug',
      params: { slug },
    });
  }

  const { cache, retries = 3 } = options;

  // Primary operation using Sanity
  const primaryOperation = async (): Promise<BlogPost | null> => {
    const query = `
      *[_type == "post" && slug.current == $slug][0] {
        ${BLOG_QUERIES.FULL_FIELDS}
      }
    `;

    const cacheOptions = cache ? {
      cache: cache.enabled ? 'force-cache' as const : 'default' as const,
      next: cache.enabled ? { 
        revalidate: cache.ttl, 
        tags: [...cache.tags, `blog-post-${slug}`] 
      } : undefined,
    } : undefined;

    const post = await enhancedClient.fetch<BlogPost>(
      query,
      { slug },
      { ...cacheOptions, retries }
    );

    if (!post) {
      return null;
    }

    // Validate and sanitize post
    return sanitizeBlogPost(post);
  };

  // Fallback data - find matching mock post by slug
  const { mockBlogPosts } = await import('./mock-data');
  const fallbackPost = mockBlogPosts.find(post => 
    post.slug.current === slug || 
    post.slug.current.includes(slug) ||
    slug.includes(post.slug.current)
  );

  const sanitizedFallbackPost = fallbackPost ? sanitizeBlogPost(fallbackPost) : null;

  // Use enhanced fallback system
  return await enhancedFallbackSystem.getDataWithFallback(
    primaryOperation,
    'getBlogPostBySlug',
    sanitizedFallbackPost
  );
}

// Enhanced blog categories fetching
export async function getAllBlogCategories(
  options: QueryOptions = {}
): Promise<BlogAPIResponse<BlogCategory[]>> {
  const { cache, retries = 3 } = options;

  // Primary operation using Sanity
  const primaryOperation = async (): Promise<BlogCategory[]> => {
    const query = `
      *[_type == "category"] | order(title asc) {
        ${BLOG_QUERIES.CATEGORY_FIELDS}
      }
    `;

    const cacheOptions = cache ? {
      cache: cache.enabled ? 'force-cache' as const : 'default' as const,
      next: cache.enabled ? { 
        revalidate: cache.ttl, 
        tags: cache.tags 
      } : undefined,
    } : undefined;

    const categories = await enhancedClient.fetch<BlogCategory[]>(
      query,
      {},
      { ...cacheOptions, retries }
    );

    // Validate and sanitize categories
    const validCategories = (categories || []).filter(category => {
      if (!category._id || !category.slug?.current || !category.title) {
        console.warn('Invalid blog category found, skipping:', category);
        return false;
      }
      return true;
    });

    return validCategories.map(sanitizeBlogCategory);
  };

  // Fallback data
  const { mockCategories } = await import('./mock-data');
  const fallbackCategories = mockCategories.map(sanitizeBlogCategory);

  // Use enhanced fallback system
  return await enhancedFallbackSystem.getDataWithFallback(
    primaryOperation,
    'getAllBlogCategories',
    fallbackCategories
  );
}

// Enhanced courses fetching for CTA routing
export async function getAllCourses(
  options: QueryOptions & { activeOnly?: boolean } = {}
): Promise<BlogAPIResponse<Course[]>> {
  try {
    const { activeOnly = true, cache, retries = 3 } = options;

    const conditions = ['_type == "course"'];
    if (activeOnly) {
      conditions.push('active == true');
    }

    const query = `
      *[${conditions.join(' && ')}] | order(name asc) {
        ${BLOG_QUERIES.COURSE_FIELDS}
      }
    `;

    const cacheOptions = cache ? {
      cache: cache.enabled ? 'force-cache' as const : 'default' as const,
      next: cache.enabled ? { 
        revalidate: cache.ttl, 
        tags: cache.tags 
      } : undefined,
    } : undefined;

    const courses = await enhancedClient.fetch<Course[]>(
      query,
      {},
      { ...cacheOptions, retries }
    );

    // Validate and sanitize courses
    const validCourses = (courses || []).filter(course => {
      if (!course._id || !course.slug?.current || !course.name) {
        console.warn('Invalid course found, skipping:', course);
        return false;
      }
      return true;
    });

    const sanitizedCourses = validCourses.map(sanitizeCourse);

    return {
      success: true,
      data: sanitizedCourses,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        cached: !!cache?.enabled,
      },
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch courses',
        code: 'FETCH_COURSES_ERROR',
        details: error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      },
    };
  }
}

// Enhanced related posts fetching
export async function getRelatedBlogPosts(
  currentPostId: string,
  categorySlug?: string,
  options: QueryOptions & { limit?: number } = {}
): Promise<BlogAPIResponse<BlogPostPreview[]>> {
  try {
    if (!currentPostId) {
      throw new BlogAPIError('Current post ID is required', {
        code: 'MISSING_POST_ID',
        operation: 'getRelatedBlogPosts',
        params: { currentPostId, categorySlug },
      });
    }

    const { limit = 3, cache, retries = 3 } = options;

    // First try to get posts from the same category
    let query = `
      *[_type == "post" && _id != $currentPostId && defined(publishedAt) && publishedAt <= now()`;
    
    if (categorySlug) {
      query += ` && category->slug.current == $categorySlug`;
    }
    
    query += `] | order(publishedAt desc) [0...${limit}] {
      ${BLOG_QUERIES.PREVIEW_FIELDS}
    }`;

    const params = categorySlug ? { currentPostId, categorySlug } : { currentPostId };

    const cacheOptions = cache ? {
      cache: cache.enabled ? 'force-cache' as const : 'default' as const,
      next: cache.enabled ? { 
        revalidate: cache.ttl, 
        tags: [...cache.tags, `related-posts-${currentPostId}`] 
      } : undefined,
    } : undefined;

    const relatedPosts = await enhancedClient.fetch<BlogPostPreview[]>(
      query,
      params,
      { ...cacheOptions, retries }
    );

    // If we don't have enough related posts, get recent posts
    if (relatedPosts.length < limit) {
      const additionalQuery = `
        *[_type == "post" && _id != $currentPostId && defined(publishedAt) && publishedAt <= now()] 
        | order(publishedAt desc) [0...${limit - relatedPosts.length}] {
          ${BLOG_QUERIES.PREVIEW_FIELDS}
        }
      `;

      const additionalPosts = await enhancedClient.fetch<BlogPostPreview[]>(
        additionalQuery,
        { currentPostId },
        { ...cacheOptions, retries }
      );

      relatedPosts.push(...additionalPosts);
    }

    // Validate and sanitize posts
    const validPosts = (relatedPosts || []).filter(post => {
      if (!post._id || !post.slug?.current || !post.title) {
        console.warn('Invalid related blog post found, skipping:', post);
        return false;
      }
      return true;
    });

    const sanitizedPosts = validPosts.slice(0, limit).map(sanitizeBlogPostPreview);

    return {
      success: true,
      data: sanitizedPosts,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        cached: !!cache?.enabled,
      },
    };
  } catch (error) {
    console.error('Error fetching related blog posts:', error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch related posts',
        code: 'FETCH_RELATED_POSTS_ERROR',
        details: error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      },
    };
  }
}

// Enhanced blog post slugs fetching for static generation
export async function getAllBlogPostSlugs(
  options: QueryOptions = {}
): Promise<BlogAPIResponse<Array<{ params: { slug: string } }>>> {
  try {
    const { cache, retries = 3 } = options;

    const query = `
      *[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] {
        "slug": slug.current
      }
    `;

    const cacheOptions = cache ? {
      cache: cache.enabled ? 'force-cache' as const : 'default' as const,
      next: cache.enabled ? { 
        revalidate: cache.ttl, 
        tags: cache.tags 
      } : undefined,
    } : undefined;

    const slugs = await enhancedClient.fetch<{ slug: string }[]>(
      query,
      {},
      { ...cacheOptions, retries }
    );

    // Validate slugs and filter out invalid ones
    const validSlugs = (slugs || []).filter(item => {
      if (!item.slug || typeof item.slug !== 'string') {
        console.warn('Invalid slug found, skipping:', item);
        return false;
      }
      return true;
    });

    const formattedSlugs = validSlugs.map(item => ({
      params: { slug: item.slug },
    }));

    return {
      success: true,
      data: formattedSlugs,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
        cached: !!cache?.enabled,
      },
    };
  } catch (error) {
    console.error('Error fetching blog post slugs:', error);
    
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch blog post slugs',
        code: 'FETCH_SLUGS_ERROR',
        details: error,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
      },
    };
  }
}

// Data sanitization functions
function sanitizeBlogPostPreview(post: any): BlogPostPreview {
  return {
    _id: post._id,
    title: post.title || 'Untitled Post',
    slug: post.slug || { current: 'untitled' },
    publishedAt: post.publishedAt || new Date().toISOString(),
    excerpt: post.excerpt || '',
    image: post.image || {
      asset: {} as any,
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

function sanitizeBlogPost(post: any): BlogPost {
  return {
    ...post,
    title: post.title || 'Untitled Post',
    slug: post.slug || { current: 'untitled' },
    publishedAt: post.publishedAt || new Date().toISOString(),
    excerpt: post.excerpt || '',
    body: Array.isArray(post.body) ? post.body : [],
    image: post.image || {
      asset: {} as any,
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
    readingTime: typeof post.readingTime === 'number' && post.readingTime > 0 ? post.readingTime : 5,
    featured: Boolean(post.featured),
    tags: Array.isArray(post.tags) ? post.tags : [],
    ctaPlacements: Array.isArray(post.ctaPlacements) ? post.ctaPlacements : [],
    difficulty: post.difficulty || 'beginner',
    contentType: post.contentType || 'guide',
    enableComments: post.enableComments !== false,
    enableSocialSharing: post.enableSocialSharing !== false,
    enableNewsletterSignup: post.enableNewsletterSignup !== false,
    viewCount: post.viewCount || 0,
    shareCount: post.shareCount || 0,
    engagementScore: post.engagementScore || 0,
  };
}

function sanitizeBlogCategory(category: any): BlogCategory {
  return {
    ...category,
    title: category.title || 'Untitled Category',
    slug: category.slug || { current: 'untitled' },
    description: category.description || '',
    color: category.color || '#075E68',
  };
}

function sanitizeCourse(course: any): Course {
  return {
    ...course,
    name: course.name || 'Untitled Course',
    slug: course.slug || { current: 'untitled' },
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

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// BlogAPIError is already exported above as a class declaration