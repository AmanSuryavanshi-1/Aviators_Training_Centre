import { enhancedClient, urlFor } from './client';
import {
  POSTS_QUERY,
  POST_QUERY,
  FEATURED_POSTS_QUERY,
  POSTS_BY_CATEGORY_QUERY,
  POSTS_BY_TAG_QUERY,
  RELATED_POSTS_QUERY,
  POST_SLUGS_QUERY,
  CATEGORIES_QUERY,
  TAGS_QUERY,
  AUTHORS_QUERY,
  AUTHOR_QUERY,
} from './queries';

// Type definitions for better type safety
export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  image?: {
    asset: { _id: string; url: string };
    alt?: string;
  };
  category: {
    title: string;
    slug: { current: string };
    color?: string;
  };
  tags?: Array<{
    title: string;
    slug: { current: string };
    color?: string;
    category?: string;
  }>;
  author?: {
    name: string;
    slug: { current: string };
    image?: {
      asset: { _id: string; url: string };
      alt?: string;
    };
    bio?: string;
    socialMedia?: {
      linkedin?: string;
      twitter?: string;
      website?: string;
    };
  };
  body?: any[];
  publishedAt: string;
  readingTime: number;
  wordCount?: number;
  featured?: boolean;
  featuredOnHome?: boolean;
  ctaPositions?: number[];
  ctaPlacements?: any[];
  intelligentCTARouting?: any;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  additionalKeywords?: string[];
  openGraphImage?: {
    asset: { _id: string; url: string };
    alt?: string;
  };
  structuredData?: any;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  color?: string;
  postCount?: number;
}

export interface Tag {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  color?: string;
  category?: string;
  postCount?: number;
}

export interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  bio?: string;
  image?: {
    asset: { _id: string; url: string };
    alt?: string;
  };
  role?: string;
  credentials?: any[];
  experience?: any;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  postCount?: number;
  posts?: BlogPost[];
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  category?: string;
  tag?: string;
  author?: string;
  featured?: boolean;
  cache?: 'force-cache' | 'no-store' | 'default';
  revalidate?: number | false;
}

/**
 * Sanity service class for blog operations
 */
export class SanityService {
  private static instance: SanityService;

  static getInstance(): SanityService {
    if (!SanityService.instance) {
      SanityService.instance = new SanityService();
    }
    return SanityService.instance;
  }

  // Blog Post Operations
  async getAllPosts(options: QueryOptions = {}): Promise<BlogPost[]> {
    try {
      const { limit, offset = 0, cache = 'default', revalidate } = options;
      
      let query = POSTS_QUERY;
      const params: Record<string, any> = {};

      // Add pagination if specified
      if (limit) {
        query += `[${offset}...${offset + limit}]`;
      }

      const posts = await enhancedClient.fetch<BlogPost[]>(query, params, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
        validateConnection: true,
      });

      return posts || [];
    } catch (error) {
      console.error('Error fetching all posts:', error);
      throw new Error(`Failed to fetch blog posts: ${(error as Error).message}`);
    }
  }

  async getPostBySlug(slug: string, options: { cache?: 'force-cache' | 'no-store' | 'default'; revalidate?: number | false } = {}): Promise<BlogPost | null> {
    try {
      const { cache = 'default', revalidate } = options;

      const post = await enhancedClient.fetch<BlogPost>(POST_QUERY, { slug }, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
        validateConnection: true,
      });

      return post || null;
    } catch (error) {
      console.error(`Error fetching post with slug "${slug}":`, error);
      throw new Error(`Failed to fetch blog post: ${(error as Error).message}`);
    }
  }

  async getFeaturedPosts(limit: number = 3, options: { cache?: 'force-cache' | 'no-store' | 'default'; revalidate?: number | false } = {}): Promise<BlogPost[]> {
    try {
      const { cache = 'default', revalidate } = options;

      let query = FEATURED_POSTS_QUERY;
      if (limit !== 3) {
        query = query.replace('[0...3]', `[0...${limit}]`);
      }

      const posts = await enhancedClient.fetch<BlogPost[]>(query, {}, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
        validateConnection: true,
      });

      return posts || [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      throw new Error(`Failed to fetch featured posts: ${(error as Error).message}`);
    }
  }

  async getPostsByCategory(categorySlug: string, options: QueryOptions = {}): Promise<BlogPost[]> {
    try {
      const { limit, offset = 0, cache = 'default', revalidate } = options;

      // First get the category ID
      const category = await this.getCategoryBySlug(categorySlug);
      if (!category) {
        throw new Error(`Category "${categorySlug}" not found`);
      }

      let query = POSTS_BY_CATEGORY_QUERY;
      if (limit) {
        query += `[${offset}...${offset + limit}]`;
      }

      const posts = await enhancedClient.fetch<BlogPost[]>(query, { categoryId: category._id }, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      return posts || [];
    } catch (error) {
      console.error(`Error fetching posts by category "${categorySlug}":`, error);
      throw new Error(`Failed to fetch posts by category: ${(error as Error).message}`);
    }
  }

  async getPostsByTag(tagSlug: string, options: QueryOptions = {}): Promise<BlogPost[]> {
    try {
      const { limit, offset = 0, cache = 'default', revalidate } = options;

      // First get the tag ID
      const tag = await this.getTagBySlug(tagSlug);
      if (!tag) {
        throw new Error(`Tag "${tagSlug}" not found`);
      }

      let query = POSTS_BY_TAG_QUERY;
      if (limit) {
        query += `[${offset}...${offset + limit}]`;
      }

      const posts = await enhancedClient.fetch<BlogPost[]>(query, { tagId: tag._id }, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      return posts || [];
    } catch (error) {
      console.error(`Error fetching posts by tag "${tagSlug}":`, error);
      throw new Error(`Failed to fetch posts by tag: ${(error as Error).message}`);
    }
  }

  async getRelatedPosts(currentPostId: string, categoryId: string, tagIds: string[] = [], limit: number = 4): Promise<BlogPost[]> {
    try {
      const posts = await enhancedClient.fetch<BlogPost[]>(RELATED_POSTS_QUERY, {
        currentPostId,
        categoryId,
        tagIds,
      }, {
        cache: 'default',
        validateConnection: true,
      });

      return (posts || []).slice(0, limit);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      // Return empty array instead of throwing to avoid breaking the page
      return [];
    }
  }

  async getPostSlugs(): Promise<Array<{ slug: { current: string } }>> {
    try {
      const slugs = await enhancedClient.fetch<Array<{ slug: { current: string } }>>(POST_SLUGS_QUERY, {}, {
        cache: 'force-cache',
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      return slugs || [];
    } catch (error) {
      console.error('Error fetching post slugs:', error);
      throw new Error(`Failed to fetch post slugs: ${(error as Error).message}`);
    }
  }

  // Category Operations
  async getCategories(options: { cache?: 'force-cache' | 'no-store' | 'default'; revalidate?: number | false } = {}): Promise<Category[]> {
    try {
      const { cache = 'default', revalidate } = options;

      const categories = await enhancedClient.fetch<Category[]>(CATEGORIES_QUERY, {}, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      return categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${(error as Error).message}`);
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const query = `*[_type == "category" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        color
      }`;

      const category = await enhancedClient.fetch<Category>(query, { slug }, {
        cache: 'default',
      });

      return category || null;
    } catch (error) {
      console.error(`Error fetching category with slug "${slug}":`, error);
      return null;
    }
  }

  // Tag Operations
  async getTags(options: { cache?: 'force-cache' | 'no-store' | 'default'; revalidate?: number | false } = {}): Promise<Tag[]> {
    try {
      const { cache = 'default', revalidate } = options;

      const tags = await enhancedClient.fetch<Tag[]>(TAGS_QUERY, {}, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      return tags || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw new Error(`Failed to fetch tags: ${(error as Error).message}`);
    }
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    try {
      const query = `*[_type == "tag" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        color,
        category
      }`;

      const tag = await enhancedClient.fetch<Tag>(query, { slug }, {
        cache: 'default',
      });

      return tag || null;
    } catch (error) {
      console.error(`Error fetching tag with slug "${slug}":`, error);
      return null;
    }
  }

  // Author Operations
  async getAuthors(options: { cache?: 'force-cache' | 'no-store' | 'default'; revalidate?: number | false } = {}): Promise<Author[]> {
    try {
      const { cache = 'default', revalidate } = options;

      const authors = await enhancedClient.fetch<Author[]>(AUTHORS_QUERY, {}, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      return authors || [];
    } catch (error) {
      console.error('Error fetching authors:', error);
      throw new Error(`Failed to fetch authors: ${(error as Error).message}`);
    }
  }

  async getAuthorBySlug(slug: string, options: { cache?: 'force-cache' | 'no-store' | 'default'; revalidate?: number | false } = {}): Promise<Author | null> {
    try {
      const { cache = 'default', revalidate } = options;

      const author = await enhancedClient.fetch<Author>(AUTHOR_QUERY, { slug }, {
        cache,
        next: revalidate !== undefined ? { revalidate } : undefined,
      });

      return author || null;
    } catch (error) {
      console.error(`Error fetching author with slug "${slug}":`, error);
      return null;
    }
  }

  // CRUD Operations (require authentication)
  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    try {
      // Validate required fields
      if (!postData.title || !postData.slug?.current) {
        throw new Error('Title and slug are required for creating a post');
      }

      const document = {
        _type: 'post',
        ...postData,
        publishedAt: postData.publishedAt || new Date().toISOString(),
        readingTime: postData.readingTime || this.calculateReadingTime(postData.body),
        wordCount: postData.wordCount || this.calculateWordCount(postData.body),
      };

      const result = await enhancedClient.create(document, {
        validateConnection: true,
        useCircuitBreaker: true,
      });

      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error(`Failed to create post: ${(error as Error).message}`);
    }
  }

  async updatePost(postId: string, updates: Partial<BlogPost>): Promise<BlogPost> {
    try {
      // Calculate reading time and word count if body is updated
      if (updates.body) {
        updates.readingTime = updates.readingTime || this.calculateReadingTime(updates.body);
        updates.wordCount = updates.wordCount || this.calculateWordCount(updates.body);
      }

      const patch = enhancedClient.patch(postId, { validateConnection: true });
      const result = await patch.set(updates).commit();

      return result;
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      throw new Error(`Failed to update post: ${(error as Error).message}`);
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      await enhancedClient.delete(postId, {
        validateConnection: true,
        useCircuitBreaker: true,
      });
    } catch (error) {
      console.error(`Error deleting post ${postId}:`, error);
      throw new Error(`Failed to delete post: ${(error as Error).message}`);
    }
  }

  // Image URL generation with optimization
  getImageUrl(image: { asset: { _id: string; url: string } } | undefined, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
    fit?: 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'clip' | 'min';
  } = {}): string {
    if (!image?.asset) {
      return '/placeholder-image.jpg'; // Fallback image
    }

    try {
      let builder = urlFor(image);

      if (options.width) builder = builder.width(options.width);
      if (options.height) builder = builder.height(options.height);
      if (options.quality) builder = builder.quality(options.quality);
      if (options.format) builder = builder.format(options.format);
      if (options.fit) builder = builder.fit(options.fit);

      // Default optimizations
      if (!options.quality) builder = builder.quality(85);
      if (!options.format) builder = builder.format('webp');

      return builder.url();
    } catch (error) {
      console.error('Error generating image URL:', error);
      return '/placeholder-image.jpg';
    }
  }

  // Utility functions
  private calculateReadingTime(body: any[] | undefined): number {
    if (!body || !Array.isArray(body)) return 1;

    const wordsPerMinute = 200;
    const wordCount = this.calculateWordCount(body);
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  private calculateWordCount(body: any[] | undefined): number {
    if (!body || !Array.isArray(body)) return 0;

    let wordCount = 0;

    const countWordsInBlock = (block: any): number => {
      if (block._type === 'block' && block.children) {
        return block.children.reduce((count: number, child: any) => {
          if (child.text) {
            return count + child.text.split(/\s+/).filter((word: string) => word.length > 0).length;
          }
          return count;
        }, 0);
      }
      return 0;
    };

    body.forEach(block => {
      wordCount += countWordsInBlock(block);
    });

    return wordCount;
  }

  // Health check
  async performHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const healthCheck = await enhancedClient.performHealthCheck();
      return {
        status: healthCheck.overall,
        details: healthCheck,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: (error as Error).message,
        },
      };
    }
  }
}

// Export singleton instance
export const sanityService = SanityService.getInstance();

// Export individual functions for convenience
export const {
  getAllPosts,
  getPostBySlug,
  getFeaturedPosts,
  getPostsByCategory,
  getPostsByTag,
  getRelatedPosts,
  getPostSlugs,
  getCategories,
  getCategoryBySlug,
  getTags,
  getTagBySlug,
  getAuthors,
  getAuthorBySlug,
  createPost,
  updatePost,
  deletePost,
  getImageUrl,
  performHealthCheck,
} = sanityService;
