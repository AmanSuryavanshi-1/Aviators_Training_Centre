import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * Cache Manager for Sanity Blog Service
 * 
 * Handles cache invalidation and management for blog-related data
 * to ensure immediate sync between admin operations and frontend display.
 */
export class BlogCacheManager {
  private static instance: BlogCacheManager;

  // Cache tag constants
  private readonly CACHE_TAGS = {
    ALL_POSTS: 'blog-posts',
    FEATURED_POSTS: 'featured-posts',
    CATEGORIES: 'blog-categories',
    AUTHORS: 'blog-authors',
    COURSES: 'courses',
    SLUGS: 'blog-slugs',
    POST_BY_ID: (id: string) => `blog-post-id-${id}`,
    POST_BY_SLUG: (slug: string) => `blog-post-${slug}`,
    RELATED_POSTS: (id: string) => `related-posts-${id}`,
    CATEGORY_POSTS: (slug: string) => `category-posts-${slug}`,
  } as const;

  // Cache paths
  private readonly CACHE_PATHS = {
    BLOG_HOME: '/blog',
    BLOG_POST: (slug: string) => `/blog/${slug}`,
    CATEGORY_PAGE: (slug: string) => `/blog/category/${slug}`,
    ADMIN_BLOG: '/admin/blog',
  } as const;

  private constructor() {}

  static getInstance(): BlogCacheManager {
    if (!BlogCacheManager.instance) {
      BlogCacheManager.instance = new BlogCacheManager();
    }
    return BlogCacheManager.instance;
  }

  /**
   * Invalidate cache after creating a new blog post
   */
  async invalidateAfterCreate(postData: { slug: string; categorySlug?: string; featured?: boolean }): Promise<void> {
    try {
      console.log('🔄 Invalidating cache after post creation:', postData.slug);

      // Invalidate general blog caches
      await this.revalidateTag(this.CACHE_TAGS.ALL_POSTS);
      await this.revalidateTag(this.CACHE_TAGS.SLUGS);

      // Invalidate featured posts if this post is featured
      if (postData.featured) {
        await this.revalidateTag(this.CACHE_TAGS.FEATURED_POSTS);
      }

      // Invalidate category-specific cache
      if (postData.categorySlug) {
        await this.revalidateTag(this.CACHE_TAGS.CATEGORY_POSTS(postData.categorySlug));
        await this.revalidatePath(this.CACHE_PATHS.CATEGORY_PAGE(postData.categorySlug));
      }

      // Invalidate blog home page
      await this.revalidatePath(this.CACHE_PATHS.BLOG_HOME);

      // Invalidate admin blog page
      await this.revalidatePath(this.CACHE_PATHS.ADMIN_BLOG);

      console.log('✅ Cache invalidation completed after post creation');
    } catch (error) {
      console.error('❌ Error invalidating cache after post creation:', error);
    }
  }

  /**
   * Invalidate cache after updating a blog post
   */
  async invalidateAfterUpdate(
    postId: string,
    postData: { 
      slug: string; 
      oldSlug?: string;
      categorySlug?: string; 
      oldCategorySlug?: string;
      featured?: boolean; 
      wasFeatureBefore?: boolean;
    }
  ): Promise<void> {
    try {
      console.log('🔄 Invalidating cache after post update:', postData.slug);

      // Invalidate general blog caches
      await this.revalidateTag(this.CACHE_TAGS.ALL_POSTS);
      
      // Invalidate specific post caches
      await this.revalidateTag(this.CACHE_TAGS.POST_BY_ID(postId));
      await this.revalidateTag(this.CACHE_TAGS.POST_BY_SLUG(postData.slug));
      
      // If slug changed, invalidate old slug cache
      if (postData.oldSlug && postData.oldSlug !== postData.slug) {
        await this.revalidateTag(this.CACHE_TAGS.POST_BY_SLUG(postData.oldSlug));
        await this.revalidatePath(this.CACHE_PATHS.BLOG_POST(postData.oldSlug));
      }

      // Invalidate related posts cache
      await this.revalidateTag(this.CACHE_TAGS.RELATED_POSTS(postId));

      // Handle featured status changes
      if (postData.featured !== postData.wasFeatureBefore) {
        await this.revalidateTag(this.CACHE_TAGS.FEATURED_POSTS);
      }

      // Handle category changes
      if (postData.categorySlug !== postData.oldCategorySlug) {
        // Invalidate old category cache
        if (postData.oldCategorySlug) {
          await this.revalidateTag(this.CACHE_TAGS.CATEGORY_POSTS(postData.oldCategorySlug));
          await this.revalidatePath(this.CACHE_PATHS.CATEGORY_PAGE(postData.oldCategorySlug));
        }
        
        // Invalidate new category cache
        if (postData.categorySlug) {
          await this.revalidateTag(this.CACHE_TAGS.CATEGORY_POSTS(postData.categorySlug));
          await this.revalidatePath(this.CACHE_PATHS.CATEGORY_PAGE(postData.categorySlug));
        }
      } else if (postData.categorySlug) {
        // Same category, just invalidate it
        await this.revalidateTag(this.CACHE_TAGS.CATEGORY_POSTS(postData.categorySlug));
        await this.revalidatePath(this.CACHE_PATHS.CATEGORY_PAGE(postData.categorySlug));
      }

      // Invalidate page paths
      await this.revalidatePath(this.CACHE_PATHS.BLOG_POST(postData.slug));
      await this.revalidatePath(this.CACHE_PATHS.BLOG_HOME);
      await this.revalidatePath(this.CACHE_PATHS.ADMIN_BLOG);

      console.log('✅ Cache invalidation completed after post update');
    } catch (error) {
      console.error('❌ Error invalidating cache after post update:', error);
    }
  }

  /**
   * Invalidate cache after deleting a blog post
   */
  async invalidateAfterDelete(
    postId: string,
    postData: { slug: string; categorySlug?: string; featured?: boolean }
  ): Promise<void> {
    try {
      console.log('🔄 Invalidating cache after post deletion:', postData.slug);

      // Invalidate general blog caches
      await this.revalidateTag(this.CACHE_TAGS.ALL_POSTS);
      await this.revalidateTag(this.CACHE_TAGS.SLUGS);

      // Invalidate specific post caches
      await this.revalidateTag(this.CACHE_TAGS.POST_BY_ID(postId));
      await this.revalidateTag(this.CACHE_TAGS.POST_BY_SLUG(postData.slug));
      await this.revalidateTag(this.CACHE_TAGS.RELATED_POSTS(postId));

      // Invalidate featured posts if this post was featured
      if (postData.featured) {
        await this.revalidateTag(this.CACHE_TAGS.FEATURED_POSTS);
      }

      // Invalidate category-specific cache
      if (postData.categorySlug) {
        await this.revalidateTag(this.CACHE_TAGS.CATEGORY_POSTS(postData.categorySlug));
        await this.revalidatePath(this.CACHE_PATHS.CATEGORY_PAGE(postData.categorySlug));
      }

      // Invalidate page paths
      await this.revalidatePath(this.CACHE_PATHS.BLOG_POST(postData.slug));
      await this.revalidatePath(this.CACHE_PATHS.BLOG_HOME);
      await this.revalidatePath(this.CACHE_PATHS.ADMIN_BLOG);

      console.log('✅ Cache invalidation completed after post deletion');
    } catch (error) {
      console.error('❌ Error invalidating cache after post deletion:', error);
    }
  }

  /**
   * Invalidate all blog-related caches
   */
  async invalidateAll(): Promise<void> {
    try {
      console.log('🔄 Invalidating all blog caches');

      // Invalidate all tag-based caches
      await Promise.all([
        this.revalidateTag(this.CACHE_TAGS.ALL_POSTS),
        this.revalidateTag(this.CACHE_TAGS.FEATURED_POSTS),
        this.revalidateTag(this.CACHE_TAGS.CATEGORIES),
        this.revalidateTag(this.CACHE_TAGS.AUTHORS),
        this.revalidateTag(this.CACHE_TAGS.COURSES),
        this.revalidateTag(this.CACHE_TAGS.SLUGS),
      ]);

      // Invalidate main paths
      await Promise.all([
        this.revalidatePath(this.CACHE_PATHS.BLOG_HOME),
        this.revalidatePath(this.CACHE_PATHS.ADMIN_BLOG),
        this.revalidatePath('/'), // Home page might show featured posts
      ]);

      console.log('✅ All blog cache invalidation completed');
    } catch (error) {
      console.error('❌ Error invalidating all blog caches:', error);
    }
  }

  /**
   * Get cache configuration for different data types
   */
  getCacheConfig(type: 'posts' | 'post' | 'categories' | 'authors' | 'courses' | 'slugs', identifier?: string) {
    const baseConfig = {
      enabled: true,
      ttl: 3600, // 1 hour default
      tags: [] as string[],
    };

    switch (type) {
      case 'posts':
        return {
          ...baseConfig,
          ttl: 1800, // 30 minutes for post listings
          tags: [this.CACHE_TAGS.ALL_POSTS],
        };

      case 'post':
        return {
          ...baseConfig,
          ttl: 3600, // 1 hour for individual posts
          tags: identifier ? [this.CACHE_TAGS.POST_BY_SLUG(identifier)] : [],
        };

      case 'categories':
        return {
          ...baseConfig,
          ttl: 7200, // 2 hours for categories (change less frequently)
          tags: [this.CACHE_TAGS.CATEGORIES],
        };

      case 'authors':
        return {
          ...baseConfig,
          ttl: 7200, // 2 hours for authors
          tags: [this.CACHE_TAGS.AUTHORS],
        };

      case 'courses':
        return {
          ...baseConfig,
          ttl: 7200, // 2 hours for courses
          tags: [this.CACHE_TAGS.COURSES],
        };

      case 'slugs':
        return {
          ...baseConfig,
          ttl: 1800, // 30 minutes for slugs (for static generation)
          tags: [this.CACHE_TAGS.SLUGS],
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Check if caching is enabled in the current environment
   */
  isCachingEnabled(): boolean {
    // Disable caching in development for immediate updates
    if (process.env.NODE_ENV === 'development') {
      return false;
    }

    // Check for explicit cache disable flag
    if (process.env.DISABLE_BLOG_CACHE === 'true') {
      return false;
    }

    return true;
  }

  // Private helper methods

  private async revalidateTag(tag: string): Promise<void> {
    try {
      if (this.isCachingEnabled()) {
        revalidateTag(tag);
        console.log(`🏷️ Revalidated cache tag: ${tag}`);
      } else {
        console.log(`🏷️ Cache revalidation skipped (disabled): ${tag}`);
      }
    } catch (error) {
      console.error(`❌ Error revalidating tag ${tag}:`, error);
    }
  }

  private async revalidatePath(path: string): Promise<void> {
    try {
      if (this.isCachingEnabled()) {
        revalidatePath(path);
        console.log(`📄 Revalidated cache path: ${path}`);
      } else {
        console.log(`📄 Cache revalidation skipped (disabled): ${path}`);
      }
    } catch (error) {
      console.error(`❌ Error revalidating path ${path}:`, error);
    }
  }
}

// Export singleton instance
export const blogCacheManager = BlogCacheManager.getInstance();

// Export cache tag constants for external use
export const BLOG_CACHE_TAGS = {
  ALL_POSTS: 'blog-posts',
  FEATURED_POSTS: 'featured-posts',
  CATEGORIES: 'blog-categories',
  AUTHORS: 'blog-authors',
  COURSES: 'courses',
  SLUGS: 'blog-slugs',
  POST_BY_ID: (id: string) => `blog-post-id-${id}`,
  POST_BY_SLUG: (slug: string) => `blog-post-${slug}`,
  RELATED_POSTS: (id: string) => `related-posts-${id}`,
  CATEGORY_POSTS: (slug: string) => `category-posts-${slug}`,
} as const;
