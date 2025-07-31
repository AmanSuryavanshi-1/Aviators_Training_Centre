/**
 * Cache Invalidation Service
 * 
 * This service handles automatic cache clearing after CRUD operations
 * and provides optimistic updates with rollback capabilities.
 */

import { revalidateTag, revalidatePath } from 'next/cache';

export interface CacheInvalidationOptions {
  tags?: string[];
  paths?: string[];
  immediate?: boolean;
  optimistic?: boolean;
}

export interface OptimisticUpdateOptions<T> {
  key: string;
  data: T;
  rollbackData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, rollbackData?: T) => void;
}

/**
 * Cache invalidation service for blog operations
 */
export class CacheInvalidationService {
  private static instance: CacheInvalidationService;
  private optimisticUpdates = new Map<string, any>();
  private rollbackData = new Map<string, any>();

  private constructor() {}

  static getInstance(): CacheInvalidationService {
    if (!CacheInvalidationService.instance) {
      CacheInvalidationService.instance = new CacheInvalidationService();
    }
    return CacheInvalidationService.instance;
  }

  /**
   * Invalidate cache after blog post operations
   */
  async invalidatePostCache(postId: string, slug?: string, categorySlug?: string): Promise<void> {
    try {
      const tags = [
        'blog-posts',
        `blog-post-${slug}`,
        `blog-post-id-${postId}`,
        `related-posts-${postId}`,
      ];

      if (categorySlug) {
        tags.push(`category-${categorySlug}`);
      }

      // Invalidate cache tags
      for (const tag of tags) {
        revalidateTag(tag);
      }

      // Invalidate relevant paths
      const paths = [
        '/blog',
        '/api/blog/posts',
        '/api/blog/health',
      ];

      if (slug) {
        paths.push(`/blog/${slug}`);
        paths.push(`/api/blog/posts/${slug}`);
      }

      if (postId) {
        paths.push(`/api/blog/posts/id/${postId}`);
      }

      for (const path of paths) {
        revalidatePath(path);
      }

      console.log('Cache invalidated for post:', { postId, slug, categorySlug, tags, paths });
    } catch (error) {
      console.error('Failed to invalidate post cache:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache after category operations
   */
  async invalidateCategoryCache(categorySlug?: string): Promise<void> {
    try {
      const tags = ['blog-categories'];
      
      if (categorySlug) {
        tags.push(`category-${categorySlug}`);
      }

      for (const tag of tags) {
        revalidateTag(tag);
      }

      const paths = ['/api/blog/categories'];
      for (const path of paths) {
        revalidatePath(path);
      }

      console.log('Cache invalidated for category:', { categorySlug, tags, paths });
    } catch (error) {
      console.error('Failed to invalidate category cache:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache after author operations
   */
  async invalidateAuthorCache(): Promise<void> {
    try {
      const tags = ['blog-authors'];
      
      for (const tag of tags) {
        revalidateTag(tag);
      }

      const paths = ['/api/blog/authors'];
      for (const path of paths) {
        revalidatePath(path);
      }

      console.log('Cache invalidated for authors:', { tags, paths });
    } catch (error) {
      console.error('Failed to invalidate author cache:', error);
      throw error;
    }
  }

  /**
   * Invalidate all blog-related cache
   */
  async invalidateAllBlogCache(): Promise<void> {
    try {
      const tags = [
        'blog-posts',
        'blog-categories', 
        'blog-authors'
      ];

      for (const tag of tags) {
        revalidateTag(tag);
      }

      const paths = [
        '/blog',
        '/api/blog/posts',
        '/api/blog/categories',
        '/api/blog/authors',
        '/api/blog/health',
      ];

      for (const path of paths) {
        revalidatePath(path);
      }

      console.log('All blog cache invalidated:', { tags, paths });
    } catch (error) {
      console.error('Failed to invalidate all blog cache:', error);
      throw error;
    }
  }

  /**
   * Perform optimistic update with rollback capability
   */
  async performOptimisticUpdate<T>(
    options: OptimisticUpdateOptions<T>,
    operation: () => Promise<T>
  ): Promise<T> {
    const { key, data, rollbackData, onSuccess, onError } = options;

    try {
      // Store optimistic data and rollback data
      this.optimisticUpdates.set(key, data);
      if (rollbackData) {
        this.rollbackData.set(key, rollbackData);
      }

      // Perform the actual operation
      const result = await operation();

      // Update with actual result
      this.optimisticUpdates.set(key, result);
      this.rollbackData.delete(key);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      // Rollback on error
      const rollback = this.rollbackData.get(key);
      if (rollback) {
        this.optimisticUpdates.set(key, rollback);
      } else {
        this.optimisticUpdates.delete(key);
      }
      this.rollbackData.delete(key);

      if (onError) {
        onError(error as Error, rollback);
      }

      throw error;
    }
  }

  /**
   * Get optimistic data for a key
   */
  getOptimisticData<T>(key: string): T | undefined {
    return this.optimisticUpdates.get(key);
  }

  /**
   * Clear optimistic data for a key
   */
  clearOptimisticData(key: string): void {
    this.optimisticUpdates.delete(key);
    this.rollbackData.delete(key);
  }

  /**
   * Clear all optimistic data
   */
  clearAllOptimisticData(): void {
    this.optimisticUpdates.clear();
    this.rollbackData.clear();
  }
}

// Export singleton instance
export const cacheInvalidationService = CacheInvalidationService.getInstance();

/**
 * Helper function to invalidate cache after blog operations
 */
export async function invalidateBlogCache(options: {
  type: 'post' | 'category' | 'author' | 'all';
  postId?: string;
  slug?: string;
  categorySlug?: string;
}): Promise<void> {
  const service = CacheInvalidationService.getInstance();

  switch (options.type) {
    case 'post':
      if (options.postId) {
        await service.invalidatePostCache(options.postId, options.slug, options.categorySlug);
      }
      break;
    case 'category':
      await service.invalidateCategoryCache(options.categorySlug);
      break;
    case 'author':
      await service.invalidateAuthorCache();
      break;
    case 'all':
      await service.invalidateAllBlogCache();
      break;
  }
}

/**
 * Decorator for automatic cache invalidation
 */
export function withCacheInvalidation<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  invalidationOptions: (result: Awaited<ReturnType<T>>, ...args: Parameters<T>) => Promise<void>
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args);
    await invalidationOptions(result, ...args);
    return result;
  }) as T;
}
