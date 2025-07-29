/**
 * Sanity-Only Blog Service
 * 
 * This service replaces the unified blog service and only queries Sanity CMS.
 * It removes all markdown file dependencies and fallback logic to ensure
 * a single source of truth for blog content.
 * 
 * Requirements addressed:
 * - 1.1: All blog data sourced exclusively from Sanity CMS
 * - 1.2: Admin dashboard displays all blog posts from Sanity
 * - 1.3: Blog page displays same posts as admin (from Sanity)
 * - 1.4: System ignores other sources and only uses Sanity data
 */

import { enhancedSanityBlogService, getImageUrl as getSanityImageUrl } from "./features/blog/enhanced-sanity-service";
import {
  BlogPost,
  BlogPostPreview,
  BlogCategory,
  Course,
  BlogAuthor,
  BlogListingData,
  BlogPostPageData,
  BlogAPIResponse,
  CreateBlogPost,
  UpdateBlogPost,
} from './types/blog';

/**
 * Main Blog Service Functions
 * 
 * These functions provide a clean interface to the Sanity-only blog service
 * and maintain backward compatibility with existing code.
 */

/**
 * Get all blog posts from Sanity CMS only
 * 
 * @param options - Query options including caching, filtering, and pagination
 * @returns Promise<BlogPost[]> - Array of blog posts from Sanity
 */
export async function getAllBlogPosts(options?: {
  useCache?: boolean;
  revalidate?: number;
  limit?: number;
  featured?: boolean;
  category?: string;
}): Promise<BlogPost[]> {
  try {
    const response = await enhancedSanityBlogService.getAllPosts({
      limit: options?.limit,
      featured: options?.featured,
      category: options?.category,
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch blog posts from Sanity:', response.error);
      return [];
    }

    // Convert BlogPostPreview[] to BlogPost[] for backward compatibility
    const posts: BlogPost[] = [];
    
    for (const preview of response.data) {
      // Fetch full post data for each preview
      const fullPostResponse = await enhancedSanityBlogService.getPostById(preview._id, {
        useCache: options?.useCache,
      });
      
      if (fullPostResponse.success && fullPostResponse.data) {
        posts.push(fullPostResponse.data);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error in getAllBlogPosts:', error);
    return [];
  }
}

/**
 * Get a single blog post by slug from Sanity CMS only
 * 
 * @param slug - The blog post slug
 * @param options - Query options including caching
 * @returns Promise<BlogPost | null> - The blog post or null if not found
 */
export async function getBlogPostBySlug(slug: string, options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogPost | null> {
  try {
    const response = await enhancedSanityBlogService.getPostBySlug(slug, {
      useCache: options?.useCache,
    });

    if (!response.success) {
      if (response.error?.code === 'INVALID_SLUG') {
        return null;
      }
      console.error('Failed to fetch blog post by slug:', response.error);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error('Error in getBlogPostBySlug:', error);
    return null;
  }
}

/**
 * Get all blog post slugs for static generation from Sanity CMS only
 * 
 * @param options - Query options including caching
 * @returns Promise<Array<{ params: { slug: string } }>> - Array of slug parameters
 */
export async function getAllBlogPostSlugs(options?: {
  useCache?: boolean;
  revalidate?: number;
}) {
  try {
    const response = await enhancedSanityBlogService.getAllPostSlugs({
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch blog post slugs:', response.error);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error in getAllBlogPostSlugs:', error);
    return [];
  }
}

/**
 * Get featured blog posts from Sanity CMS only
 * 
 * @param count - Number of featured posts to fetch
 * @param options - Query options including caching
 * @returns Promise<BlogPost[]> - Array of featured blog posts
 */
export async function getFeaturedBlogPosts(count = 3, options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogPost[]> {
  try {
    if (count <= 0 || count > 20) {
      console.warn('Invalid count for featured posts, using default:', count);
      count = 3;
    }

    const response = await enhancedSanityBlogService.getFeaturedPosts({
      limit: count,
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch featured blog posts:', response.error);
      return [];
    }

    // Convert BlogPostPreview[] to BlogPost[] for backward compatibility
    const posts: BlogPost[] = [];
    
    for (const preview of response.data) {
      // Fetch full post data for each preview
      const fullPostResponse = await enhancedSanityBlogService.getPostById(preview._id, {
        useCache: options?.useCache,
      });
      
      if (fullPostResponse.success && fullPostResponse.data) {
        posts.push(fullPostResponse.data);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error in getFeaturedBlogPosts:', error);
    return [];
  }
}

/**
 * Get blog posts by category from Sanity CMS only
 * 
 * @param categorySlug - The category slug to filter by
 * @param options - Query options including caching
 * @returns Promise<BlogPost[]> - Array of blog posts in the category
 */
export async function getBlogPostsByCategory(categorySlug: string, options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogPost[]> {
  try {
    if (!categorySlug || typeof categorySlug !== 'string') {
      console.warn('Invalid categorySlug provided to getBlogPostsByCategory:', categorySlug);
      return [];
    }

    const response = await enhancedSanityBlogService.getPostsByCategory(categorySlug, {
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch blog posts by category:', response.error);
      return [];
    }

    // Convert BlogPostPreview[] to BlogPost[] for backward compatibility
    const posts: BlogPost[] = [];
    
    for (const preview of response.data) {
      // Fetch full post data for each preview
      const fullPostResponse = await enhancedSanityBlogService.getPostById(preview._id, {
        useCache: options?.useCache,
      });
      
      if (fullPostResponse.success && fullPostResponse.data) {
        posts.push(fullPostResponse.data);
      }
    }

    return posts;
  } catch (error) {
    console.error(`Error in getBlogPostsByCategory: ${categorySlug}`, error);
    return [];
  }
}

/**
 * Get all blog categories from Sanity CMS only
 * 
 * @param options - Query options including caching
 * @returns Promise<BlogCategory[]> - Array of blog categories
 */
export async function getAllBlogCategories(options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogCategory[]> {
  try {
    const response = await enhancedSanityBlogService.getAllCategories({
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch blog categories:', response.error);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error in getAllBlogCategories:', error);
    return [];
  }
}

/**
 * Get all courses from Sanity CMS only
 * 
 * @param options - Query options including caching
 * @returns Promise<Course[]> - Array of courses
 */
export async function getAllCourses(options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<Course[]> {
  try {
    const response = await enhancedSanityBlogService.getAllCourses({
      activeOnly: true,
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch courses:', response.error);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    return [];
  }
}

/**
 * Get recommended course for a blog post using intelligent CTA routing
 * 
 * @param blogPost - The blog post to get recommendations for
 * @param allCourses - Optional pre-fetched courses array
 * @returns Promise<Course | null> - Recommended course or null
 */
export async function getRecommendedCourse(
  blogPost: BlogPost,
  allCourses?: Course[]
): Promise<Course | null> {
  try {
    return await enhancedSanityBlogService.getRecommendedCourse(blogPost);
  } catch (error) {
    console.error('Error in getRecommendedCourse:', error);
    return null;
  }
}

/**
 * Get image URL from Sanity with fallback mechanisms
 * 
 * @param image - Sanity image object
 * @param width - Optional width
 * @param height - Optional height
 * @param fallbackUrl - Fallback URL if image is not available
 * @returns string - Image URL or fallback
 */
export function getImageUrl(
  image: { asset: any } | null | undefined, 
  width?: number, 
  height?: number,
  fallbackUrl?: string
): string {
  return enhancedSanityBlogService.getOptimizedImageUrl(image, {
    width,
    height,
    fallbackUrl,
  });
}

/**
 * Get optimized image URL with WebP/AVIF support
 * 
 * @param image - Sanity image object
 * @param options - Image optimization options
 * @returns string - Optimized image URL or fallback
 */
export function getOptimizedImageUrl(
  image: { asset: any } | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min';
    fallbackUrl?: string;
  } = {}
): string {
  return enhancedSanityBlogService.getOptimizedImageUrl(image, options);
}

/**
 * Utility function to validate blog post data
 * 
 * @param post - Blog post data to validate
 * @returns boolean - True if valid blog post
 */
export function validateBlogPost(post: any): post is BlogPost {
  if (!post || typeof post !== 'object') return false;
  
  const requiredFields = ['_id', 'slug', 'title'];
  for (const field of requiredFields) {
    if (!post[field]) {
      console.warn(`Invalid or missing required field: ${field}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Utility function to sanitize blog post data with fallbacks
 * 
 * @param post - Raw blog post data
 * @returns BlogPost | null - Sanitized blog post or null if invalid
 */
export function sanitizeBlogPost(post: any): BlogPost | null {
  if (!validateBlogPost(post)) return null;
  
  // The Sanity service already handles sanitization
  return post;
}

/**
 * Utility function for error boundary fallback data
 * 
 * @returns Object with empty arrays for posts, categories, and courses
 */
export function getBlogErrorFallback(): {
  posts: BlogPost[];
  categories: BlogCategory[];
  courses: Course[];
} {
  return {
    posts: [],
    categories: [],
    courses: [],
  };
}

/**
 * Get related blog posts from Sanity CMS only
 * 
 * @param currentPost - The current blog post
 * @param count - Number of related posts to fetch
 * @param options - Query options including caching
 * @returns Promise<BlogPost[]> - Array of related blog posts
 */
export async function getRelatedBlogPosts(
  currentPost: BlogPost,
  count = 3,
  options?: {
    useCache?: boolean;
    revalidate?: number;
  }
): Promise<BlogPost[]> {
  try {
    if (!currentPost?._id) {
      console.warn('Invalid current post provided to getRelatedBlogPosts');
      return [];
    }

    const response = await enhancedSanityBlogService.getRelatedPosts(
      currentPost._id,
      currentPost.category?.slug?.current,
      {
        limit: count,
        useCache: options?.useCache,
      }
    );

    if (!response.success || !response.data) {
      console.error('Failed to fetch related blog posts:', response.error);
      return [];
    }

    // Convert BlogPostPreview[] to BlogPost[] for backward compatibility
    const posts: BlogPost[] = [];
    
    for (const preview of response.data) {
      // Fetch full post data for each preview
      const fullPostResponse = await enhancedSanityBlogService.getPostById(preview._id, {
        useCache: options?.useCache,
      });
      
      if (fullPostResponse.success && fullPostResponse.data) {
        posts.push(fullPostResponse.data);
      }
    }

    return posts;
  } catch (error) {
    console.error('Error in getRelatedBlogPosts:', error);
    return [];
  }
}

/**
 * CRUD Operations for Blog Posts
 * 
 * These functions provide create, update, and delete operations
 * for blog posts in Sanity CMS with automatic cache invalidation.
 */

/**
 * Create a new blog post in Sanity CMS
 * 
 * @param data - Blog post data to create
 * @returns Promise<BlogAPIResponse<BlogPost>> - Created blog post response
 */
export async function createBlogPost(data: CreateBlogPost): Promise<BlogAPIResponse<BlogPost>> {
  return await enhancedSanityBlogService.createPost(data);
}

/**
 * Update an existing blog post in Sanity CMS
 * 
 * @param id - Blog post ID to update
 * @param data - Partial blog post data to update
 * @returns Promise<BlogAPIResponse<BlogPost>> - Updated blog post response
 */
export async function updateBlogPost(id: string, data: Partial<UpdateBlogPost>): Promise<BlogAPIResponse<BlogPost>> {
  return await enhancedSanityBlogService.updatePost(id, data);
}

/**
 * Delete a blog post from Sanity CMS
 * 
 * @param id - Blog post ID to delete
 * @returns Promise<BlogAPIResponse<void>> - Deletion response
 */
export async function deleteBlogPost(id: string): Promise<BlogAPIResponse<void>> {
  return await enhancedSanityBlogService.deletePost(id);
}

/**
 * Get all authors from Sanity CMS
 * 
 * @param options - Query options including caching
 * @returns Promise<BlogAuthor[]> - Array of blog authors
 */
export async function getAllAuthors(options?: {
  useCache?: boolean;
  revalidate?: number;
}): Promise<BlogAuthor[]> {
  try {
    const response = await enhancedSanityBlogService.getAllAuthors({
      useCache: options?.useCache,
    });

    if (!response.success || !response.data) {
      console.error('Failed to fetch authors:', response.error);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error in getAllAuthors:', error);
    return [];
  }
}

/**
 * Validate Sanity connection
 * 
 * @returns Promise<boolean> - True if connection is valid
 */
export async function validateSanityConnection(): Promise<boolean> {
  return await enhancedSanityBlogService.validateConnection();
}

/**
 * Force refresh all blog caches
 * 
 * This function can be used to manually refresh all blog-related caches
 * when needed (e.g., after bulk operations or system maintenance).
 */
export async function refreshBlogCaches(): Promise<void> {
  return await enhancedSanityBlogService.refreshAllCaches();
}

/**
 * Get comprehensive blog post page data
 * 
 * @param slug - Blog post slug
 * @returns Promise<BlogPostPageData> - Complete blog post page data
 */
export async function getBlogPostPageData(slug: string): Promise<BlogPostPageData> {
  const data = await enhancedSanityBlogService.getBlogPostPageData(slug);
  
  return {
    post: data.post,
    relatedPosts: data.relatedPosts,
    recommendedCourse: data.recommendedCourse,
    nextPost: undefined, // Could be implemented if needed
    previousPost: undefined, // Could be implemented if needed
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Blog', href: '/blog' },
      { label: data.post?.title || 'Post', href: `/blog/${slug}` },
    ],
  };
}

/**
 * Get comprehensive blog listing page data
 * 
 * @param options - Query options for blog listing
 * @returns Promise<BlogListingData> - Complete blog listing page data
 */
export async function getBlogListingPageData(options: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
} = {}): Promise<BlogListingData> {
  const data = await enhancedSanityBlogService.getBlogListingPageData(options);
  
  return {
    posts: data.posts,
    featuredPosts: data.featuredPosts,
    categories: data.categories,
    totalPosts: data.totalPosts,
    currentPage: data.currentPage,
    totalPages: Math.ceil(data.totalPosts / (options.limit || 12)),
    hasNextPage: data.hasNextPage,
    hasPreviousPage: data.currentPage > 1,
  };
}

// Export the enhanced service for direct access if needed
export { enhancedSanityBlogService };
