import { sanityBlogService, getImageUrl } from './sanity-blog-service';
import { revalidateTag, revalidatePath } from 'next/cache';
import {
  BlogPost,
  BlogPostPreview,
  BlogCategory,
  Course,
  BlogAuthor,
  BlogAPIResponse,
  CreateBlogPost,
  UpdateBlogPost,
} from '../types/blog';

/**
 * Enhanced Sanity Blog Service
 * 
 * This service extends the base Sanity blog service with additional features:
 * - Automatic cache invalidation using Next.js revalidation
 * - Optimistic updates
 * - Enhanced error handling
 * - Performance monitoring
 * - Intelligent CTA routing
 */
export class EnhancedSanityBlogService {
  private static instance: EnhancedSanityBlogService;

  private constructor() {}

  static getInstance(): EnhancedSanityBlogService {
    if (!EnhancedSanityBlogService.instance) {
      EnhancedSanityBlogService.instance = new EnhancedSanityBlogService();
    }
    return EnhancedSanityBlogService.instance;
  }

  /**
   * Automatic cache invalidation using Next.js revalidation
   */
  private async invalidateCache(data: {
    slug?: string;
    oldSlug?: string;
    categorySlug?: string;
    oldCategorySlug?: string;
    featured?: boolean;
    wasFeatureBefore?: boolean;
  }): Promise<void> {
    try {
      // Invalidate general blog cache tags
      revalidateTag('blog-posts');
      revalidateTag('blog-categories');
      
      // Invalidate specific post caches
      if (data.slug) {
        revalidateTag(`blog-post-${data.slug}`);
        revalidatePath(`/blog/${data.slug}`);
      }
      
      if (data.oldSlug && data.oldSlug !== data.slug) {
        revalidateTag(`blog-post-${data.oldSlug}`);
        revalidatePath(`/blog/${data.oldSlug}`);
      }
      
      // Invalidate category-specific caches
      if (data.categorySlug) {
        revalidateTag(`blog-category-${data.categorySlug}`);
      }
      
      if (data.oldCategorySlug && data.oldCategorySlug !== data.categorySlug) {
        revalidateTag(`blog-category-${data.oldCategorySlug}`);
      }
      
      // Invalidate featured posts if needed
      if (data.featured || data.wasFeatureBefore) {
        revalidateTag('featured-posts');
      }
      
      // Invalidate main blog listing page
      revalidatePath('/blog');
      
      console.log('✅ Cache invalidated automatically');
    } catch (error) {
      console.warn('⚠️ Cache invalidation failed:', error);
      // Don't throw error as this shouldn't break the main operation
    }
  }

  /**
   * Get all blog posts with automatic caching
   */
  async getAllPosts(options: {
    limit?: number;
    offset?: number;
    featured?: boolean;
    category?: string;
    includeUnpublished?: boolean;
  } = {}): Promise<BlogAPIResponse<BlogPostPreview[]>> {
    return await sanityBlogService.getAllPosts({
      ...options,
      cache: { next: { tags: ['blog-posts'], revalidate: 300 } }, // 5 minutes cache
    });
  }

  /**
   * Get a single blog post by slug with automatic caching
   */
  async getPostBySlug(slug: string): Promise<BlogAPIResponse<BlogPost | null>> {
    return await sanityBlogService.getPostBySlug(slug, {
      cache: { next: { tags: [`blog-post-${slug}`, 'blog-posts'], revalidate: 300 } },
    });
  }

  /**
   * Get a single blog post by ID with automatic caching
   */
  async getPostById(id: string): Promise<BlogAPIResponse<BlogPost | null>> {
    return await sanityBlogService.getPostById(id, {
      cache: { next: { tags: [`blog-post-${id}`, 'blog-posts'], revalidate: 300 } },
    });
  }

  /**
   * Create a new blog post with automatic cache invalidation
   */
  async createPost(data: CreateBlogPost): Promise<BlogAPIResponse<BlogPost>> {
    try {
      console.log('🆕 Creating new blog post:', data.title);

      // Create the post
      const result = await sanityBlogService.createPost(data);

      if (result.success && result.data) {
        // Automatically invalidate Next.js cache
        await this.invalidateCache({
          slug: result.data.slug.current,
          categorySlug: result.data.category?.slug?.current,
          featured: result.data.featured,
        });

        console.log('✅ Blog post created and cache invalidated:', result.data.title);
      }

      return result;
    } catch (error) {
      console.error('❌ Error creating blog post:', error);
      throw error;
    }
  }

  /**
   * Update an existing blog post with automatic cache invalidation
   */
  async updatePost(id: string, data: Partial<UpdateBlogPost>): Promise<BlogAPIResponse<BlogPost>> {
    try {
      console.log('📝 Updating blog post:', id);

      // Get the current post to track changes
      const currentPostResponse = await sanityBlogService.getPostById(id);
      const currentPost = currentPostResponse.data;

      // Update the post
      const result = await sanityBlogService.updatePost(id, data);

      if (result.success && result.data) {
        // Automatically invalidate Next.js cache
        await this.invalidateCache({
          slug: result.data.slug.current,
          oldSlug: currentPost?.slug.current,
          categorySlug: result.data.category?.slug?.current,
          oldCategorySlug: currentPost?.category?.slug?.current,
          featured: result.data.featured,
          wasFeatureBefore: currentPost?.featured,
        });

        console.log('✅ Blog post updated and cache invalidated:', result.data.title);
      }

      return result;
    } catch (error) {
      console.error('❌ Error updating blog post:', error);
      throw error;
    }
  }

  /**
   * Delete a blog post with automatic cache invalidation
   */
  async deletePost(id: string): Promise<BlogAPIResponse<void>> {
    try {
      console.log('🗑️ Deleting blog post:', id);

      // Get the current post before deletion for cache invalidation
      const currentPostResponse = await sanityBlogService.getPostById(id);
      const currentPost = currentPostResponse.data;

      // Delete the post
      const result = await sanityBlogService.deletePost(id);

      if (result.success && currentPost) {
        // Automatically invalidate Next.js cache
        await this.invalidateCache({
          slug: currentPost.slug.current,
          categorySlug: currentPost.category?.slug?.current,
          featured: currentPost.featured,
        });

        console.log('✅ Blog post deleted and cache invalidated:', currentPost.title);
      }

      return result;
    } catch (error) {
      console.error('❌ Error deleting blog post:', error);
      throw error;
    }
  }

  /**
   * Get all blog categories with automatic caching
   */
  async getAllCategories(): Promise<BlogAPIResponse<BlogCategory[]>> {
    return await sanityBlogService.getAllCategories({
      cache: { next: { tags: ['blog-categories'], revalidate: 600 } }, // 10 minutes cache
    });
  }

  /**
   * Get all authors with automatic caching
   */
  async getAllAuthors(): Promise<BlogAPIResponse<BlogAuthor[]>> {
    return await sanityBlogService.getAllAuthors({
      cache: { next: { tags: ['blog-authors'], revalidate: 600 } }, // 10 minutes cache
    });
  }

  /**
   * Get all courses with automatic caching
   */
  async getAllCourses(options: {
    activeOnly?: boolean;
  } = {}): Promise<BlogAPIResponse<Course[]>> {
    return await sanityBlogService.getAllCourses({
      ...options,
      cache: { next: { tags: ['courses'], revalidate: 600 } }, // 10 minutes cache
    });
  }

  /**
   * Get related blog posts with automatic caching
   */
  async getRelatedPosts(
    currentPostId: string,
    categorySlug?: string,
    options: {
      limit?: number;
    } = {}
  ): Promise<BlogAPIResponse<BlogPostPreview[]>> {
    return await sanityBlogService.getRelatedPosts(currentPostId, categorySlug, {
      ...options,
      cache: { next: { tags: [`related-posts-${currentPostId}`, 'blog-posts'], revalidate: 1800 } }, // 30 minutes cache
    });
  }

  /**
   * Get all blog post slugs with automatic caching
   */
  async getAllPostSlugs(): Promise<BlogAPIResponse<Array<{ params: { slug: string } }>>> {
    return await sanityBlogService.getAllPostSlugs({
      cache: { next: { tags: ['blog-slugs', 'blog-posts'], revalidate: 300 } }, // 5 minutes cache
    });
  }

  /**
   * Get featured blog posts
   */
  async getFeaturedPosts(options: {
    limit?: number;
  } = {}): Promise<BlogAPIResponse<BlogPostPreview[]>> {
    const { limit = 3 } = options;

    return await this.getAllPosts({
      featured: true,
      limit,
    });
  }

  /**
   * Get blog posts by category
   */
  async getPostsByCategory(
    categorySlug: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<BlogAPIResponse<BlogPostPreview[]>> {
    return await this.getAllPosts({
      category: categorySlug,
      ...options,
    });
  }

  /**
   * Get recommended course for a blog post using intelligent CTA routing
   */
  async getRecommendedCourse(blogPost: BlogPost): Promise<Course | null> {
    try {
      if (!blogPost || !blogPost._id) {
        console.warn('Invalid blog post provided to getRecommendedCourse');
        return null;
      }

      // Get all courses
      const coursesResponse = await this.getAllCourses({ activeOnly: true });
      if (!coursesResponse.success || !coursesResponse.data) {
        console.warn('Failed to fetch courses for CTA routing');
        return null;
      }

      const courses = coursesResponse.data;

      // Check if post has explicit course target
      if (blogPost.intelligentCTARouting?.primaryCourseTarget?.slug) {
        const explicitCourse = courses.find(
          course => course.slug.current === blogPost.intelligentCTARouting?.primaryCourseTarget?.slug.current
        );
        if (explicitCourse) {
          console.log(`Found explicit course target: ${explicitCourse.name}`);
          return explicitCourse;
        }
      }

      // Check category's intelligent routing
      if (blogPost.category && 'intelligentRouting' in blogPost.category) {
        const categoryRouting = (blogPost.category as any).intelligentRouting;
        
        // Check course mapping rules first
        if (categoryRouting?.courseMapping && Array.isArray(categoryRouting.courseMapping)) {
          for (const mapping of categoryRouting.courseMapping) {
            if (!mapping.keywords || !Array.isArray(mapping.keywords)) continue;
            
            const hasMatchingKeyword = mapping.keywords.some((keyword: string) => {
              if (!keyword || typeof keyword !== 'string') return false;
              
              const keywordLower = keyword.toLowerCase();
              return (
                blogPost.title?.toLowerCase().includes(keywordLower) ||
                blogPost.excerpt?.toLowerCase().includes(keywordLower) ||
                blogPost.seoEnhancement?.focusKeyword?.toLowerCase().includes(keywordLower)
              );
            });
            
            if (hasMatchingKeyword && mapping.targetCourse?._id) {
              const mappedCourse = courses.find(
                course => course._id === mapping.targetCourse._id
              );
              if (mappedCourse) {
                console.log(`Found mapped course: ${mappedCourse.name}`);
                return mappedCourse;
              }
            }
          }
        }
        
        // Fall back to category default course
        if (categoryRouting?.defaultCourse?._id) {
          const defaultCourse = courses.find(
            course => course._id === categoryRouting.defaultCourse._id
          );
          if (defaultCourse) {
            console.log(`Found category default course: ${defaultCourse.name}`);
            return defaultCourse;
          }
        }
      }

      // Keyword-based matching as final fallback
      const contentText = `${blogPost.title || ''} ${blogPost.excerpt || ''} ${blogPost.seoEnhancement?.focusKeyword || ''}`.toLowerCase();
      
      if (contentText.trim()) {
        for (const course of courses) {
          if (!course.keywords || !Array.isArray(course.keywords)) continue;
          
          const hasMatchingKeyword = course.keywords.some(keyword => {
            if (!keyword || typeof keyword !== 'string') return false;
            return contentText.includes(keyword.toLowerCase());
          });
          
          if (hasMatchingKeyword) {
            console.log(`Found keyword-matched course: ${course.name}`);
            return course;
          }
        }
      }

      console.log('No matching course found for blog post:', blogPost.title);
      return null;
    } catch (error) {
      console.error('Error in intelligent CTA routing:', error);
      return null;
    }
  }

  /**
   * Validate Sanity connection
   */
  async validateConnection(): Promise<boolean> {
    return await sanityBlogService.validateConnection();
  }

  /**
   * Force refresh all blog caches
   */
  async refreshAllCaches(): Promise<void> {
    console.log('🔄 Force refreshing all blog caches');
    try {
      // Invalidate all blog-related cache tags
      revalidateTag('blog-posts');
      revalidateTag('blog-categories');
      revalidateTag('blog-authors');
      revalidateTag('courses');
      revalidateTag('featured-posts');
      revalidateTag('blog-slugs');
      
      // Invalidate main blog paths
      revalidatePath('/blog');
      revalidatePath('/admin');
      
      console.log('✅ All blog caches refreshed');
    } catch (error) {
      console.error('❌ Error refreshing caches:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL with fallback
   */
  getOptimizedImageUrl(
    image: any,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
      fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min';
      fallbackUrl?: string;
    } = {}
  ): string {
    return getImageUrl(image, {
      quality: 85, // Default quality
      format: 'webp', // Default to WebP for better performance
      ...options,
    });
  }

  /**
   * Get blog post page data with all related information
   */
  async getBlogPostPageData(slug: string): Promise<{
    post: BlogPost | null;
    relatedPosts: BlogPostPreview[];
    recommendedCourse: Course | null;
    categories: BlogCategory[];
  }> {
    try {
      // Fetch post data
      const postResponse = await this.getPostBySlug(slug);
      const post = postResponse.data;

      if (!post) {
        return {
          post: null,
          relatedPosts: [],
          recommendedCourse: null,
          categories: [],
        };
      }

      // Fetch related data in parallel
      const [relatedPostsResponse, categoriesResponse] = await Promise.all([
        this.getRelatedPosts(post._id, post.category?.slug?.current, { limit: 3 }),
        this.getAllCategories(),
      ]);

      // Get recommended course
      const recommendedCourse = await this.getRecommendedCourse(post);

      return {
        post,
        relatedPosts: relatedPostsResponse.data || [],
        recommendedCourse,
        categories: categoriesResponse.data || [],
      };
    } catch (error) {
      console.error('Error fetching blog post page data:', error);
      return {
        post: null,
        relatedPosts: [],
        recommendedCourse: null,
        categories: [],
      };
    }
  }

  /**
   * Get blog listing page data with all related information
   */
  async getBlogListingPageData(options: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
  } = {}): Promise<{
    posts: BlogPostPreview[];
    featuredPosts: BlogPostPreview[];
    categories: BlogCategory[];
    totalPosts: number;
    currentPage: number;
    hasNextPage: boolean;
  }> {
    try {
      const { page = 1, limit = 12, category, featured } = options;
      const offset = (page - 1) * limit;

      // Fetch data in parallel
      const [postsResponse, featuredPostsResponse, categoriesResponse] = await Promise.all([
        this.getAllPosts({ 
          limit: limit + 1, // Fetch one extra to check if there's a next page
          offset, 
          category, 
          featured 
        }),
        featured ? Promise.resolve({ data: [] }) : this.getFeaturedPosts({ limit: 3 }),
        this.getAllCategories(),
      ]);

      const posts = postsResponse.data || [];
      const hasNextPage = posts.length > limit;
      const actualPosts = hasNextPage ? posts.slice(0, limit) : posts;

      return {
        posts: actualPosts,
        featuredPosts: featuredPostsResponse.data || [],
        categories: categoriesResponse.data || [],
        totalPosts: posts.length, // This is approximate, would need a separate count query for exact total
        currentPage: page,
        hasNextPage,
      };
    } catch (error) {
      console.error('Error fetching blog listing page data:', error);
      return {
        posts: [],
        featuredPosts: [],
        categories: [],
        totalPosts: 0,
        currentPage: 1,
        hasNextPage: false,
      };
    }
  }
}

// Export singleton instance
export const enhancedSanityBlogService = EnhancedSanityBlogService.getInstance();

// Export for backward compatibility and convenience
export { getImageUrl } from './sanity-blog-service';