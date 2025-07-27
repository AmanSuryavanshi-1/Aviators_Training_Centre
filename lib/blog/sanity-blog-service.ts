import { enhancedClient, urlFor } from '../sanity/client';
import {
  BlogPost,
  BlogPostPreview,
  BlogCategory,
  Course,
  BlogAuthor,
  BlogAPIResponse,
  CreateBlogPost,
  UpdateBlogPost,
  QueryOptions,
  CacheConfig,
  SanityImage,
} from '../types/blog';
import { PortableTextBlock } from '@portabletext/types';

/**
 * Sanity-only Blog Service
 * 
 * This service replaces the unified blog service and only queries Sanity CMS.
 * It removes all markdown file dependencies and fallback logic to ensure
 * a single source of truth for blog content.
 */
export class SanityBlogService {
  private static instance: SanityBlogService;

  // GROQ query fragments for consistency
  private readonly QUERIES = {
    PREVIEW_FIELDS: `
      _id,
      title,
      "slug": slug.current,
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
        _id,
        title,
        "slug": slug.current,
        color
      },
      author-> {
        _id,
        name,
        "slug": slug.current,
        image {
          asset,
          alt
        },
        role
      }
    `,

    FULL_FIELDS: `
      _id,
      _createdAt,
      _updatedAt,
      _rev,
      title,
      "slug": slug.current,
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
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        title,
        "slug": slug.current,
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
            "slug": slug.current,
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
              "slug": slug.current,
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
        _type,
        _createdAt,
        _updatedAt,
        _rev,
        name,
        "slug": slug.current,
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
          "slug": slug.current,
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
          "slug": slug.current,
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
            "slug": slug.current,
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

    CATEGORY_FIELDS: `
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      title,
      "slug": slug.current,
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
          "slug": slug.current,
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
            "slug": slug.current,
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

    COURSE_FIELDS: `
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      name,
      "slug": slug.current,
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

    AUTHOR_FIELDS: `
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      name,
      "slug": slug.current,
      image {
        asset,
        alt
      },
      bio,
      role,
      credentials,
      email,
      socialLinks
    `,
  } as const;

  private constructor() {}

  static getInstance(): SanityBlogService {
    if (!SanityBlogService.instance) {
      SanityBlogService.instance = new SanityBlogService();
    }
    return SanityBlogService.instance;
  }

  /**
   * Get all blog posts from Sanity CMS
   */
  async getAllPosts(options: {
    limit?: number;
    offset?: number;
    featured?: boolean;
    category?: string;
    includeUnpublished?: boolean;
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<BlogPostPreview[]>> {
    try {
      const {
        limit = 50,
        offset = 0,
        featured,
        category,
        includeUnpublished = false,
        cache,
      } = options;

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
          ${this.QUERIES.PREVIEW_FIELDS}
        }
      `;

      const params = category ? { category } : {};
      
      const cacheOptions = this.buildCacheOptions(cache);

      const posts = await enhancedClient.fetch<BlogPostPreview[]>(
        query,
        params,
        cacheOptions
      );

      // Validate and sanitize posts
      const validPosts = this.validateAndSanitizePosts(posts || []);

      return {
        success: true,
        data: validPosts,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching blog posts from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch blog posts',
          code: 'FETCH_POSTS_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get a single blog post by slug from Sanity CMS
   */
  async getPostBySlug(slug: string, options: {
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<BlogPost | null>> {
    try {
      if (!slug || typeof slug !== 'string') {
        return {
          success: false,
          error: {
            message: 'Invalid slug provided',
            code: 'INVALID_SLUG',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: 'sanity',
          },
        };
      }

      const { cache } = options;

      // Make slug query case-insensitive by converting to lowercase
      const normalizedSlug = slug.toLowerCase();
      
      const query = `
        *[_type == "post" && lower(slug.current) == lower($slug)][0] {
          ${this.QUERIES.FULL_FIELDS}
        }
      `;

      const cacheOptions = this.buildCacheOptions(cache, [`blog-post-${slug}`]);

      const post = await enhancedClient.fetch<BlogPost>(
        query,
        { slug: normalizedSlug },
        cacheOptions
      );

      if (!post) {
        return {
          success: true,
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            cached: !!cache?.enabled,
            source: 'sanity',
          },
        };
      }

      // Validate and sanitize post
      const sanitizedPost = this.sanitizeBlogPost(post);

      return {
        success: true,
        data: sanitizedPost,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching blog post by slug from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch blog post',
          code: 'FETCH_POST_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get a single blog post by ID from Sanity CMS
   */
  async getPostById(id: string, options: {
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<BlogPost | null>> {
    try {
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: {
            message: 'Invalid post ID provided',
            code: 'INVALID_POST_ID',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: 'sanity',
          },
        };
      }

      const { cache } = options;

      const query = `
        *[_type == "post" && _id == $id][0] {
          ${this.QUERIES.FULL_FIELDS}
        }
      `;

      const cacheOptions = this.buildCacheOptions(cache, [`blog-post-id-${id}`]);

      const post = await enhancedClient.fetch<BlogPost>(
        query,
        { id },
        cacheOptions
      );

      if (!post) {
        return {
          success: true,
          data: null,
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            cached: !!cache?.enabled,
            source: 'sanity',
          },
        };
      }

      // Validate and sanitize post
      const sanitizedPost = this.sanitizeBlogPost(post);

      return {
        success: true,
        data: sanitizedPost,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching blog post by ID from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch blog post',
          code: 'FETCH_POST_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Create a new blog post in Sanity CMS
   */
  async createPost(data: CreateBlogPost): Promise<BlogAPIResponse<BlogPost>> {
    try {
      // Validate required fields
      if (!data.title || !data.slug?.current) {
        return {
          success: false,
          error: {
            message: 'Title and slug are required',
            code: 'VALIDATION_ERROR',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: 'sanity',
          },
        };
      }

      // Prepare document for Sanity
      const document = {
        _type: 'post',
        title: data.title,
        slug: data.slug,
        publishedAt: data.publishedAt || new Date().toISOString(),
        excerpt: data.excerpt || '',
        body: data.body || [],
        image: data.image,
        category: data.category ? { _ref: data.category._id, _type: 'reference' } : undefined,
        author: data.author ? { _ref: data.author._id, _type: 'reference' } : undefined,
        readingTime: data.readingTime || 5,
        featured: data.featured || false,
        tags: data.tags || [],
        difficulty: data.difficulty || 'beginner',
        contentType: data.contentType || 'guide',
        enableComments: data.enableComments !== false,
        enableSocialSharing: data.enableSocialSharing !== false,
        enableNewsletterSignup: data.enableNewsletterSignup !== false,
        seoEnhancement: data.seoEnhancement,
        ctaPlacements: data.ctaPlacements || [],
        intelligentCTARouting: data.intelligentCTARouting,
        viewCount: 0,
        shareCount: 0,
        engagementScore: 0,
      };

      const createdPost = await enhancedClient.create(document);

      // Fetch the complete post with populated references
      const fullPostResponse = await this.getPostById(createdPost._id);
      
      if (!fullPostResponse.success || !fullPostResponse.data) {
        throw new Error('Failed to fetch created post');
      }

      return {
        success: true,
        data: fullPostResponse.data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error creating blog post in Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create blog post',
          code: 'CREATE_POST_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Update an existing blog post in Sanity CMS
   */
  async updatePost(id: string, data: Partial<UpdateBlogPost>): Promise<BlogAPIResponse<BlogPost>> {
    try {
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: {
            message: 'Invalid post ID provided',
            code: 'INVALID_POST_ID',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: 'sanity',
          },
        };
      }

      // Prepare update data
      const updateData: any = { ...data };
      
      // Handle reference fields
      if (data.category) {
        updateData.category = { _ref: data.category._id, _type: 'reference' };
      }
      
      if (data.author) {
        updateData.author = { _ref: data.author._id, _type: 'reference' };
      }

      // Add lastModified timestamp
      updateData.lastModified = new Date().toISOString();

      const updatedPost = await enhancedClient.patch(id).set(updateData).commit();

      // Fetch the complete updated post with populated references
      const fullPostResponse = await this.getPostById(updatedPost._id);
      
      if (!fullPostResponse.success || !fullPostResponse.data) {
        throw new Error('Failed to fetch updated post');
      }

      return {
        success: true,
        data: fullPostResponse.data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error updating blog post in Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update blog post',
          code: 'UPDATE_POST_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Delete a blog post from Sanity CMS
   */
  async deletePost(id: string): Promise<BlogAPIResponse<void>> {
    try {
      if (!id || typeof id !== 'string') {
        return {
          success: false,
          error: {
            message: 'Invalid post ID provided',
            code: 'INVALID_POST_ID',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: 'sanity',
          },
        };
      }

      await enhancedClient.delete(id);

      return {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error deleting blog post from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete blog post',
          code: 'DELETE_POST_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get all blog categories from Sanity CMS
   */
  async getAllCategories(options: {
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<BlogCategory[]>> {
    try {
      const { cache } = options;

      const query = `
        *[_type == "category"] | order(title asc) {
          ${this.QUERIES.CATEGORY_FIELDS}
        }
      `;

      const cacheOptions = this.buildCacheOptions(cache);

      const categories = await enhancedClient.fetch<BlogCategory[]>(
        query,
        {},
        cacheOptions
      );

      // Validate and sanitize categories
      const validCategories = this.validateAndSanitizeCategories(categories || []);

      return {
        success: true,
        data: validCategories,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching blog categories from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch blog categories',
          code: 'FETCH_CATEGORIES_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get all authors from Sanity CMS
   */
  async getAllAuthors(options: {
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<BlogAuthor[]>> {
    try {
      const { cache } = options;

      const query = `
        *[_type == "author"] | order(name asc) {
          ${this.QUERIES.AUTHOR_FIELDS}
        }
      `;

      const cacheOptions = this.buildCacheOptions(cache);

      const authors = await enhancedClient.fetch<BlogAuthor[]>(
        query,
        {},
        cacheOptions
      );

      // Validate and sanitize authors
      const validAuthors = this.validateAndSanitizeAuthors(authors || []);

      return {
        success: true,
        data: validAuthors,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching authors from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch authors',
          code: 'FETCH_AUTHORS_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get all courses from Sanity CMS
   */
  async getAllCourses(options: {
    activeOnly?: boolean;
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<Course[]>> {
    try {
      const { activeOnly = true, cache } = options;

      const conditions = ['_type == "course"'];
      if (activeOnly) {
        conditions.push('active == true');
      }

      const query = `
        *[${conditions.join(' && ')}] | order(name asc) {
          ${this.QUERIES.COURSE_FIELDS}
        }
      `;

      const cacheOptions = this.buildCacheOptions(cache);

      const courses = await enhancedClient.fetch<Course[]>(
        query,
        {},
        cacheOptions
      );

      // Validate and sanitize courses
      const validCourses = this.validateAndSanitizeCourses(courses || []);

      return {
        success: true,
        data: validCourses,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching courses from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch courses',
          code: 'FETCH_COURSES_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get related blog posts from Sanity CMS
   */
  async getRelatedPosts(
    currentPostId: string,
    categorySlug?: string,
    options: {
      limit?: number;
      cache?: CacheConfig;
    } = {}
  ): Promise<BlogAPIResponse<BlogPostPreview[]>> {
    try {
      if (!currentPostId) {
        return {
          success: false,
          error: {
            message: 'Current post ID is required',
            code: 'MISSING_POST_ID',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            source: 'sanity',
          },
        };
      }

      const { limit = 3, cache } = options;

      // First try to get posts from the same category
      let query = `
        *[_type == "post" && _id != $currentPostId && defined(publishedAt) && publishedAt <= now()`;
      
      if (categorySlug) {
        query += ` && category->slug.current == $categorySlug`;
      }
      
      query += `] | order(publishedAt desc) [0...${limit}] {
        ${this.QUERIES.PREVIEW_FIELDS}
      }`;

      const params = categorySlug ? { currentPostId, categorySlug } : { currentPostId };

      const cacheOptions = this.buildCacheOptions(cache, [`related-posts-${currentPostId}`]);

      const relatedPosts = await enhancedClient.fetch<BlogPostPreview[]>(
        query,
        params,
        cacheOptions
      );

      // If we don't have enough related posts, get recent posts
      let finalPosts = relatedPosts || [];
      
      if (finalPosts.length < limit) {
        const additionalQuery = `
          *[_type == "post" && _id != $currentPostId && defined(publishedAt) && publishedAt <= now()] 
          | order(publishedAt desc) [0...${limit - finalPosts.length}] {
            ${this.QUERIES.PREVIEW_FIELDS}
          }
        `;

        const additionalPosts = await enhancedClient.fetch<BlogPostPreview[]>(
          additionalQuery,
          { currentPostId },
          cacheOptions
        );

        finalPosts.push(...(additionalPosts || []));
      }

      // Validate and sanitize posts
      const validPosts = this.validateAndSanitizePosts(finalPosts.slice(0, limit));

      return {
        success: true,
        data: validPosts,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching related blog posts from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch related posts',
          code: 'FETCH_RELATED_POSTS_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Get all blog post slugs for static generation
   */
  async getAllPostSlugs(options: {
    cache?: CacheConfig;
  } = {}): Promise<BlogAPIResponse<Array<{ params: { slug: string } }>>> {
    try {
      const { cache } = options;

      const query = `
        *[_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()] {
          "slug": slug.current
        }
      `;

      const cacheOptions = this.buildCacheOptions(cache);

      const slugs = await enhancedClient.fetch<{ slug: string }[]>(
        query,
        {},
        cacheOptions
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
          requestId: this.generateRequestId(),
          cached: !!cache?.enabled,
          source: 'sanity',
        },
      };
    } catch (error) {
      console.error('Error fetching blog post slugs from Sanity:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to fetch blog post slugs',
          code: 'FETCH_SLUGS_ERROR',
          details: error,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          source: 'sanity',
        },
      };
    }
  }

  /**
   * Validate Sanity connection
   */
  async validateConnection(): Promise<boolean> {
    try {
      // Try to fetch a simple query to test connection
      await enhancedClient.fetch('*[_type == "post"][0]._id');
      return true;
    } catch (error) {
      console.error('Sanity connection validation failed:', error);
      return false;
    }
  }

  // Private helper methods

  private buildCacheOptions(cache?: CacheConfig, additionalTags: string[] = []) {
    if (!cache?.enabled) return undefined;

    return {
      cache: 'force-cache' as const,
      next: {
        revalidate: cache.ttl,
        tags: [...cache.tags, ...additionalTags],
      },
    };
  }

  private validateAndSanitizePosts(posts: any[]): BlogPostPreview[] {
    return posts
      .filter(post => {
        if (!post._id || !post.slug || !post.title) {
          console.warn('Invalid blog post found, skipping:', post);
          return false;
        }
        return true;
      })
      .map(this.sanitizeBlogPostPreview);
  }

  private validateAndSanitizeCategories(categories: any[]): BlogCategory[] {
    return categories
      .filter(category => {
        if (!category._id || !category.slug || !category.title) {
          console.warn('Invalid blog category found, skipping:', category);
          return false;
        }
        return true;
      })
      .map(this.sanitizeBlogCategory);
  }

  private validateAndSanitizeAuthors(authors: any[]): BlogAuthor[] {
    return authors
      .filter(author => {
        if (!author._id || !author.slug || !author.name) {
          console.warn('Invalid author found, skipping:', author);
          return false;
        }
        return true;
      })
      .map(this.sanitizeBlogAuthor);
  }

  private validateAndSanitizeCourses(courses: any[]): Course[] {
    return courses
      .filter(course => {
        if (!course._id || !course.slug?.current || !course.name) {
          console.warn('Invalid course found, skipping:', course);
          return false;
        }
        return true;
      })
      .map(this.sanitizeCourse);
  }

  private sanitizeBlogPostPreview = (post: any): BlogPostPreview => {
    return {
      _id: post._id,
      title: post.title || 'Untitled Post',
      slug: post.slug ? { current: post.slug } : { current: 'untitled' },
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
  };

  private sanitizeBlogPost = (post: any): BlogPost => {
    return {
      ...post,
      _type: 'post',
      title: post.title || 'Untitled Post',
      slug: post.slug ? { current: post.slug } : { current: 'untitled' },
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
  };

  private sanitizeBlogCategory = (category: any): BlogCategory => {
    return {
      ...category,
      _type: 'category',
      title: category.title || 'Untitled Category',
      slug: category.slug ? { current: category.slug } : { current: 'untitled' },
      description: category.description || '',
      color: category.color || '#075E68',
    };
  };

  private sanitizeBlogAuthor = (author: any): BlogAuthor => {
    return {
      ...author,
      _type: 'author',
      name: author.name || 'Anonymous',
      slug: author.slug ? { current: author.slug } : { current: 'anonymous' },
      role: author.role || 'Author',
    };
  };

  private sanitizeCourse = (course: any): Course => {
    return {
      ...course,
      _type: 'course',
      name: course.name || 'Untitled Course',
      slug: course.slug ? { current: course.slug } : { current: 'untitled' },
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
  };

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const sanityBlogService = SanityBlogService.getInstance();

// Export helper function to get image URL
export function getImageUrl(
  image: SanityImage | null | undefined,
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
    console.error('Error generating image URL:', error);
    return options.fallbackUrl || '/placeholder.svg';
  }
}