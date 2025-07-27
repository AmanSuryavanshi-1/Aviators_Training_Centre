import { enhancedClient } from '@/lib/sanity/client';
import { handleError, globalErrorHandler } from '@/lib/error-handling/comprehensive-error-handler';
import { withPerformanceMonitoring } from '@/lib/monitoring/performance-monitor';
import { withErrorTracking } from '@/lib/monitoring/error-tracker';
import { queryOptimizer } from '@/lib/monitoring/query-optimizer';

export interface UnifiedBlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content?: string; // Markdown version for compatibility
  body?: any[]; // PortableText blocks for rich content rendering
  publishedAt: string;
  category: {
    title: string;
    slug: { current: string };
    color?: string;
  };
  author: {
    name: string;
    slug: { current: string };
    role?: string;
    image?: {
      asset: any;
      alt: string;
    };
    bio?: any[];
  };
  readingTime: number;
  image: {
    asset: {
      url: string;
    };
    alt: string;
  };
  tags: string[];
  featured: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  views?: number;
  engagementRate?: number;
  shares?: number;
  source: 'sanity';
  editable: boolean;
}

class UnifiedBlogService {
  private static instance: UnifiedBlogService;
  private cache: Map<string, UnifiedBlogPost[]> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static getInstance(): UnifiedBlogService {
    if (!UnifiedBlogService.instance) {
      UnifiedBlogService.instance = new UnifiedBlogService();
    }
    return UnifiedBlogService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const cacheTime = this.cache.get(`${key}_timestamp`) as any;
    if (!cacheTime) return false;
    
    return Date.now() - cacheTime < this.cacheTimeout;
  }

  private setCache(key: string, data: UnifiedBlogPost[]): void {
    this.cache.set(key, data);
    this.cache.set(`${key}_timestamp`, Date.now() as any);
  }

  /**
   * Clear cache to force fresh data fetch
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Unified blog service cache cleared');
  }

  /**
   * Clear cache for specific operations
   */
  clearCacheForPost(postId: string): void {
    // Clear all cache entries since posts might be in different filtered lists
    this.cache.clear();
    console.log(`🧹 Cache cleared for post: ${postId}`);
  }

  async getAllPosts(options: { limit?: number; featured?: boolean; category?: string } = {}): Promise<UnifiedBlogPost[]> {
    return withPerformanceMonitoring(
      'blog-get-all-posts',
      async () => {
        return queryOptimizer.executeOptimizedQuery(
          'blog-listing',
          async () => {
            const cacheKey = `all_posts_${JSON.stringify(options)}`;
            
            if (this.isCacheValid(cacheKey)) {
              return this.cache.get(cacheKey)!;
            }

            let allPosts = await this.fetchFromSanity();
            
            // Apply filters
            if (options.featured !== undefined) {
              allPosts = allPosts.filter(post => post.featured === options.featured);
            }
            
            if (options.category) {
              allPosts = allPosts.filter(post => 
                post.category.title.toLowerCase() === options.category?.toLowerCase() ||
                post.category.slug.current.toLowerCase() === options.category?.toLowerCase()
              );
            }
            
            // Sort by date
            allPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
            
            // Apply limit
            if (options.limit) {
              allPosts = allPosts.slice(0, options.limit);
            }
            
            this.setCache(cacheKey, allPosts);
            return allPosts;
          },
          options
        );
      },
      { options }
    ).catch(error => {
      const comprehensiveError = handleError(error, {
        operation: 'Fetch blog posts',
        category: 'sync',
        severity: 'medium',
        additionalContext: { options }
      });
      
      console.error('Error fetching blog posts from Sanity:', comprehensiveError);
      
      // Return empty array on error - no fallback to markdown
      return [];
    });
  }

  private async fetchFromSanity(): Promise<UnifiedBlogPost[]> {
    return withErrorTracking(
      'sanity-fetch-posts',
      async () => {
        const optimizedQuery = queryOptimizer.getOptimizedQuery(
          'blog-listing',
          `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
            _id,
            title,
            slug,
            excerpt,
            body,
            publishedAt,
            featured,
            readingTime,
            views,
            engagementRate,
            shares,
            category->{
              title,
              slug,
              color
            },
            author->{
              name,
              slug,
              role,
              image {
                asset->,
                alt
              },
              bio
            },
            image {
              asset->,
              alt
            },
            tags,
            seoTitle,
            seoDescription,
            focusKeyword
          }`
        );

        const posts = await enhancedClient.fetch(optimizedQuery);

        console.log(`📊 Fetched ${(posts as any[]).length} posts from Sanity`);

        return (posts as any[]).map((post: any) => {
        // Debug logging for content
        console.log(`🔍 Processing post: ${post.title}`, {
          hasBody: !!post.body,
          bodyType: typeof post.body,
          bodyIsArray: Array.isArray(post.body),
          bodyLength: post.body?.length || 0
        });

        return {
          _id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: this.convertPortableTextToMarkdown(post.body),
          body: post.body, // Keep original PortableText for components that need it
          publishedAt: post.publishedAt,
          category: {
            title: post.category?.title || 'General',
            slug: post.category?.slug || { current: 'general' },
            color: post.category?.color || '#075E68'
          },
          author: {
            name: post.author?.name || 'Aviation Expert',
            slug: post.author?.slug || { current: 'aviation-expert' },
            role: post.author?.role || 'Flight Instructor',
            image: post.author?.image ? {
              asset: post.author.image.asset,
              alt: post.author.image.alt || post.author.name
            } : undefined,
            bio: post.author?.bio
          },
          readingTime: post.readingTime || Math.max(1, Math.ceil((post.body?.length || 0) / 10)), // Estimate based on content
          image: {
            asset: {
              url: post.image?.asset?.url || '/Blogs/Blog_Header.webp'
            },
            alt: post.image?.alt || post.title
          },
          tags: post.tags || [],
          featured: post.featured || false,
          difficulty: post.difficulty || 'intermediate',
          views: post.views || 0,
          engagementRate: post.engagementRate || 0,
          shares: post.shares || 0,
          source: 'sanity' as const,
          editable: true
        };
      });
      },
      {},
      'high'
    );
  }



  async getPost(identifier: string): Promise<UnifiedBlogPost | null> {
    return withPerformanceMonitoring(
      'blog-get-single-post',
      async () => {
        try {
          // First try to get from cache
          const allPosts = await this.getAllPosts();
          const cachedPost = allPosts.find(post => 
            post._id === identifier || 
            post.slug.current === identifier
          );
          
          if (cachedPost) {
            return cachedPost;
          }
          
          // If not found in cache, fetch directly from Sanity
          console.log(`🔍 Post not found in cache, fetching directly: ${identifier}`);
          return await this.fetchSinglePostFromSanity(identifier);
          
        } catch (error) {
          console.error('Error in getPost:', error);
          return null;
        }
      }
    );
  }

  private async fetchSinglePostFromSanity(identifier: string): Promise<UnifiedBlogPost | null> {
    return withErrorTracking(
      'sanity-fetch-single-post',
      async () => {
        // Query by both ID and slug to handle both cases
        const query = `*[_type == "post" && !(_id in path("drafts.**")) && (_id == $identifier || slug.current == $identifier)][0] {
          _id,
          title,
          slug,
          excerpt,
          body,
          publishedAt,
          featured,
          readingTime,
          views,
          engagementRate,
          shares,
          category->{
            title,
            slug,
            color
          },
          author->{
            name,
            slug,
            role,
            image {
              asset->,
              alt
            },
            bio
          },
          image {
            asset->,
            alt
          },
          tags,
          seoTitle,
          seoDescription,
          focusKeyword
        }`;

        const post = await enhancedClient.fetch(query, { identifier });

        if (!post) {
          console.log(`❌ Post not found in Sanity: ${identifier}`);
          return null;
        }

        console.log(`✅ Found post in Sanity: ${post.title}`);

        // Convert to UnifiedBlogPost format
        return {
          _id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: this.convertPortableTextToMarkdown(post.body),
          body: post.body,
          publishedAt: post.publishedAt,
          category: {
            title: post.category?.title || 'General',
            slug: post.category?.slug || { current: 'general' },
            color: post.category?.color || '#075E68'
          },
          author: {
            name: post.author?.name || 'Aman Suryavanshi',
            slug: post.author?.slug || { current: 'aman-suryavanshi' },
            role: post.author?.role || 'Instructor',
            image: post.author?.image,
            bio: post.author?.bio
          },
          readingTime: post.readingTime || this.calculateReadingTime(post.body),
          image: post.image || {
            asset: { url: '/images/default-blog-image.jpg' },
            alt: post.title
          },
          tags: post.tags || [],
          featured: post.featured || false,
          difficulty: 'intermediate',
          views: post.views || 0,
          engagementRate: post.engagementRate || 0,
          shares: post.shares || 0,
          source: 'sanity',
          editable: true
        };
      }
    );
  }

  async getPostBySlug(slug: string): Promise<{ success: boolean; data?: UnifiedBlogPost; error?: string }> {
    try {
      const post = await this.getPost(slug);
      if (post) {
        return { success: true, data: post };
      }
      return { success: false, error: 'Post not found' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getAllCategories(): Promise<Array<{ title: string; slug: { current: string }; color?: string; count?: number }>> {
    try {
      const allPosts = await this.getAllPosts();
      const categoryMap = new Map();
      
      allPosts.forEach(post => {
        const category = post.category;
        const key = category.slug.current;
        
        if (categoryMap.has(key)) {
          categoryMap.get(key).count += 1;
        } else {
          categoryMap.set(key, {
            title: category.title,
            slug: category.slug,
            color: category.color,
            count: 1
          });
        }
      });
      
      return Array.from(categoryMap.values());
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getAllAuthors(): Promise<Array<{ name: string; slug: { current: string }; role?: string; count?: number }>> {
    try {
      const allPosts = await this.getAllPosts();
      const authorMap = new Map();
      
      allPosts.forEach(post => {
        const author = post.author;
        const key = author.slug.current;
        
        if (authorMap.has(key)) {
          authorMap.get(key).count += 1;
        } else {
          authorMap.set(key, {
            name: author.name,
            slug: author.slug,
            role: author.role,
            count: 1
          });
        }
      });
      
      return Array.from(authorMap.values());
    } catch (error) {
      console.error('Error getting authors:', error);
      return [];
    }
  }

  async getPublicPosts(): Promise<UnifiedBlogPost[]> {
    return this.getAllPosts();
  }

  async getAdminPosts(): Promise<UnifiedBlogPost[]> {
    return this.getAllPosts();
  }

  async createPost(postData: any): Promise<UnifiedBlogPost> {
    return this.retryOperation(async () => {
      if (!postData.title || !postData.content || !postData.excerpt) {
        throw new Error('Title, content, and excerpt are required');
      }

      const slug = postData.slug || postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug already exists
      const existingPost = await enhancedClient.fetch(
        `*[_type == "post" && slug.current == $slug][0]`,
        { slug }
      );

      if (existingPost) {
        throw new Error(`A post with slug "${slug}" already exists`);
      }

      let categoryRef = null;
      if (postData.category) {
        categoryRef = await this.ensureCategory(postData.category);
      }

      let authorRef = null;
      if (postData.author) {
        authorRef = await this.ensureAuthor(postData.author);
      }

      const bodyBlocks = this.convertMarkdownToPortableText(postData.content);

      const newPost: any = {
        _type: 'post',
        title: postData.title.trim(),
        slug: {
          _type: 'slug',
          current: slug
        },
        excerpt: postData.excerpt.trim(),
        body: bodyBlocks,
        publishedAt: new Date().toISOString(),
        featured: Boolean(postData.featured),
        readingTime: Math.max(1, Math.ceil(postData.content.split(' ').length / 200)),
        tags: postData.tags || [],
        seoTitle: postData.seoTitle || `${postData.title} | Aviators Training Centre`,
        seoDescription: postData.seoDescription || postData.excerpt.substring(0, 160),
        focusKeyword: postData.focusKeyword || '',
        views: 0,
        engagementRate: 0,
        shares: 0
      };

      // Handle image if provided
      if (postData.image && postData.image.url && postData.image.url !== 'image-default-blog-post') {
        newPost.imageUrl = postData.image.url;
        newPost.imageAlt = postData.image.alt || postData.title;
      }

      if (categoryRef) {
        newPost.category = {
          _type: 'reference',
          _ref: categoryRef
        };
      }

      if (authorRef) {
        newPost.author = {
          _type: 'reference',
          _ref: authorRef
        };
      }

      const result = await enhancedClient.create(newPost);
      
      // Invalidate cache after successful creation
      await this.invalidateCache('all');
      
      return {
        _id: result._id,
        title: result.title,
        slug: result.slug,
        excerpt: result.excerpt,
        content: postData.content,
        publishedAt: result.publishedAt,
        category: {
          title: postData.category || 'General',
          slug: { current: 'general' },
          color: '#075E68'
        },
        author: {
          name: postData.author || 'Aviation Expert',
          slug: { current: 'aviation-expert' },
          role: 'Flight Instructor'
        },
        readingTime: result.readingTime,
        image: {
          asset: {
            url: result.imageUrl || '/Blogs/Blog_Header.webp'
          },
          alt: result.imageAlt || result.title
        },
        tags: result.tags,
        featured: result.featured,
        views: result.views || 0,
        engagementRate: result.engagementRate || 0,
        shares: result.shares || 0,
        source: 'sanity' as const,
        editable: true
      };
    });
  }

  async updatePost(id: string, updateData: any): Promise<{ success: boolean; data?: UnifiedBlogPost; error?: string }> {
    console.log('🔄 Starting updatePost:', { id, updateData });
    
    try {
      // Simplified approach without retryOperation to avoid complex error handling
      const post = await this.getPost(id);
      if (!post) {
        console.error('❌ Post not found:', id);
        return { success: false, error: 'Post not found' };
      }

      console.log('✅ Found post to update:', post.title);

      let bodyBlocks;
      if (updateData.content) {
        try {
          bodyBlocks = this.convertMarkdownToPortableText(updateData.content);
          console.log('✅ Converted markdown to PortableText blocks:', bodyBlocks.length);
        } catch (conversionError) {
          console.error('❌ Error converting markdown:', conversionError);
          throw new Error(`Failed to convert content: ${conversionError instanceof Error ? conversionError.message : 'Unknown conversion error'}`);
        }
      }

      const updates: any = {};
      
      if (updateData.title) updates.title = updateData.title.trim();
      if (updateData.excerpt) updates.excerpt = updateData.excerpt.trim();
      if (bodyBlocks) updates.body = bodyBlocks;
      if (updateData.featured !== undefined) updates.featured = updateData.featured;
      if (updateData.tags) updates.tags = updateData.tags;
      if (updateData.seoTitle) updates.seoTitle = updateData.seoTitle;
      if (updateData.seoDescription) updates.seoDescription = updateData.seoDescription;
      
      // Update reading time if content changed
      if (updateData.content) {
        updates.readingTime = Math.max(1, Math.ceil(updateData.content.split(' ').length / 200));
      }

      console.log('🔄 Applying updates:', Object.keys(updates));

      // Perform the update using the underlying client directly
      // The enhanced client's patch method is not compatible with chaining
      const patchResult = await enhancedClient.client.patch(id).set(updates).commit();
      console.log('✅ Patch completed:', patchResult._id);
      
      // Clear cache after successful update
      this.clearCache();
      console.log('🧹 Cache cleared after update');
      
      // Get the updated post
      const updatedPost = await this.getPost(id);
      if (!updatedPost) {
        console.error('❌ Could not fetch updated post');
        return { success: false, error: 'Could not fetch updated post' };
      }

      console.log('✅ Update completed successfully:', updatedPost.title);
      return { success: true, data: updatedPost };

    } catch (error) {
      console.error('❌ Error updating post:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        id,
        updateData: Object.keys(updateData)
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred while updating post' 
      };
    }
  }

  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.retryOperation(async () => {
        const post = await this.getPost(id);
        if (!post) {
          return { success: false, error: 'Post not found' };
        }

        await enhancedClient.delete(id);
        
        // Invalidate cache after successful deletion
        await this.invalidateCache('all');
        
        return { success: true };
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async ensureCategory(categoryTitle: string): Promise<string | null> {
    try {
      const existing = await enhancedClient.fetch(
        `*[_type == "category" && title == $title][0]`,
        { title: categoryTitle }
      );

      if (existing) {
        return existing._id;
      }

      const newCategory = await enhancedClient.create({
        _type: 'category',
        title: categoryTitle,
        slug: {
          _type: 'slug',
          current: categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        },
        description: `${categoryTitle} related content`,
        color: '#075E68'
      });

      return newCategory._id;
    } catch (error) {
      console.error('Error ensuring category:', error);
      return null;
    }
  }

  private async ensureAuthor(authorName: string): Promise<string | null> {
    try {
      const existing = await enhancedClient.fetch(
        `*[_type == "author" && name == $name][0]`,
        { name: authorName }
      );

      if (existing) {
        return existing._id;
      }

      const newAuthor = await enhancedClient.create({
        _type: 'author',
        name: authorName,
        slug: {
          _type: 'slug',
          current: authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        },
        role: 'Flight Instructor',
        bio: [
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: `${authorName} is an experienced aviation professional.`
              }
            ]
          }
        ]
      });

      return newAuthor._id;
    } catch (error) {
      console.error('Error ensuring author:', error);
      return null;
    }
  }

  private convertMarkdownToPortableText(markdown: string): any[] {
    const lines = markdown.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        return {
          _type: 'block',
          style: 'h1',
          children: [{ _type: 'span', text: trimmed.substring(2) }]
        };
      }
      
      if (trimmed.startsWith('## ')) {
        return {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: trimmed.substring(3) }]
        };
      }
      
      if (trimmed.startsWith('### ')) {
        return {
          _type: 'block',
          style: 'h3',
          children: [{ _type: 'span', text: trimmed.substring(4) }]
        };
      }
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: trimmed.substring(2) }]
        };
      }
      
      if (/^\d+\. /.test(trimmed)) {
        return {
          _type: 'block',
          style: 'normal',
          listItem: 'number',
          children: [{ _type: 'span', text: trimmed.replace(/^\d+\. /, '') }]
        };
      }
      
      return {
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: trimmed }]
      };
    });
  }

  private convertPortableTextToMarkdown(blocks: any[]): string {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      console.log('⚠️ No blocks provided for markdown conversion');
      return '';
    }
    
    console.log(`🔄 Converting ${blocks.length} PortableText blocks to markdown`);
    
    const markdownBlocks = blocks.map((block, index) => {
      if (!block) {
        console.log(`⚠️ Block ${index} is null/undefined`);
        return '';
      }
      
      // Handle different block types
      if (block._type === 'image') {
        const alt = block.alt || '';
        const url = block.asset?.url || '';
        return `![${alt}](${url})`;
      }
      
      if (block._type === 'code') {
        const language = block.language || '';
        const code = block.code || '';
        return `\`\`\`${language}\n${code}\n\`\`\``;
      }
      
      // Handle text blocks
      if (block._type === 'block' || !block._type) {
        const children = block.children || [];
        if (children.length === 0) {
          console.log(`⚠️ Block ${index} has no children`);
          return '';
        }
        
        // Handle text blocks with rich formatting
        const text = this.convertInlineMarksToMarkdown(children);
        
        if (!text.trim()) {
          console.log(`⚠️ Block ${index} produced empty text`);
          return '';
        }
        
        switch (block.style) {
          case 'h1': return `# ${text}`;
          case 'h2': return `## ${text}`;
          case 'h3': return `### ${text}`;
          case 'h4': return `#### ${text}`;
          case 'h5': return `##### ${text}`;
          case 'h6': return `###### ${text}`;
          case 'blockquote': return `> ${text}`;
          default:
            if (block.listItem === 'bullet') return `- ${text}`;
            if (block.listItem === 'number') return `1. ${text}`;
            return text;
        }
      }
      
      console.log(`⚠️ Unknown block type: ${block._type}`);
      return '';
    }).filter(block => block.trim() !== '');
    
    const result = markdownBlocks.join('\n\n');
    console.log(`✅ Converted to ${result.length} characters of markdown`);
    
    return result;
  }
  
  private convertInlineMarksToMarkdown(children: any[]): string {
    if (!Array.isArray(children)) {
      console.log('⚠️ Children is not an array:', typeof children);
      return '';
    }
    
    return children.map((child, index) => {
      if (!child) {
        console.log(`⚠️ Child ${index} is null/undefined`);
        return '';
      }
      
      if (typeof child.text !== 'string') {
        console.log(`⚠️ Child ${index} has no text property:`, Object.keys(child));
        return '';
      }
      
      let text = child.text;
      
      // Handle marks (bold, italic, code, etc.)
      if (child.marks && Array.isArray(child.marks)) {
        child.marks.forEach((mark: any) => {
          if (!mark || !mark._type) return;
          
          switch (mark._type) {
            case 'strong':
              text = `**${text}**`;
              break;
            case 'em':
              text = `*${text}*`;
              break;
            case 'code':
              text = `\`${text}\``;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'strike':
              text = `~~${text}~~`;
              break;
            case 'link':
              const href = mark.href || '#';
              text = `[${text}](${href})`;
              break;
          }
        });
      }
      
      return text;
    }).join('');
  }

  private calculateReadingTime(blocks: any[]): number {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return 1;
    }
    
    // Convert PortableText to plain text to count words
    const plainText = blocks
      .map(block => {
        if (block._type === 'block' && block.children) {
          return block.children
            .map((child: any) => child.text || '')
            .join(' ');
        }
        return '';
      })
      .join(' ');
    
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / 200)); // Assuming 200 words per minute
  }

  clearCache(): void {
    this.cache.clear();
  }

  async invalidateCache(type: 'all' | 'post' | 'category' | 'author' = 'all'): Promise<void> {
    if (type === 'all') {
      this.cache.clear();
    } else {
      // Clear specific cache entries
      const keysToDelete = Array.from(this.cache.keys()).filter(key => 
        key.includes(type) || key.includes('all_posts')
      );
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 1000
  ): Promise<T> {
    const errorId = `retry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      return await globalErrorHandler.retryOperation(operation, errorId, {
        maxRetries,
        baseDelay: delay,
        backoffMultiplier: 2,
        jitter: true
      });
    } catch (error) {
      const comprehensiveError = handleError(error, {
        operation: 'Retry operation',
        category: 'api',
        severity: 'medium',
        additionalContext: { maxRetries, delay }
      });
      
      throw comprehensiveError;
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string; timestamp: string }> {
    try {
      await this.retryOperation(async () => {
        const result = await enhancedClient.fetch('*[_type == "post" && !(_id in path("drafts.**"))][0]');
        return result;
      }, 2, 500);
      
      return {
        status: 'healthy',
        message: 'Sanity connection is working',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async incrementViews(postId: string): Promise<void> {
    try {
      // Check if API token is available before attempting write operations
      if (!process.env.SANITY_API_TOKEN) {
        console.warn('⚠️ SANITY_API_TOKEN not configured - view count increment skipped');
        return;
      }

      await this.retryOperation(async () => {
        // Use the underlying client directly for patch operations
        await enhancedClient.client
          .patch(postId)
          .setIfMissing({ views: 0 })
          .inc({ views: 1 })
          .commit();
      });
      
      // Invalidate cache to reflect updated view count
      await this.invalidateCache('post');
    } catch (error) {
      // Check if it's a token-related error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('SANITY_API_TOKEN')) {
        console.warn('⚠️ Sanity API token not configured - view count increment skipped');
      } else {
        console.error('Error incrementing views:', error);
      }
      // Don't throw error for analytics failures
    }
  }

  async updateEngagement(postId: string, engagementData: { shares?: number; engagementRate?: number }): Promise<void> {
    try {
      // Check if API token is available before attempting write operations
      if (!process.env.SANITY_API_TOKEN) {
        console.warn('⚠️ SANITY_API_TOKEN not configured - engagement update skipped');
        return;
      }

      await this.retryOperation(async () => {
        const updates: any = {};
        if (engagementData.shares !== undefined) updates.shares = engagementData.shares;
        if (engagementData.engagementRate !== undefined) updates.engagementRate = engagementData.engagementRate;
        
        // Use the underlying client directly for patch operations
        await enhancedClient.client.patch(postId).set(updates).commit();
      });
      
      await this.invalidateCache('post');
    } catch (error) {
      // Check if it's a token-related error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('SANITY_API_TOKEN')) {
        console.warn('⚠️ Sanity API token not configured - engagement update skipped');
      } else {
        console.error('Error updating engagement:', error);
      }
      // Don't throw error for analytics failures
      // Don't throw error for analytics failures
    }
  }

  async getAnalytics(): Promise<{
    totalPosts: number;
    publishedPosts: number;
    totalViews: number;
    averageEngagement: number;
    topPosts: UnifiedBlogPost[];
  }> {
    try {
      const posts = await this.getAllPosts();
      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
      const averageEngagement = posts.length > 0 
        ? posts.reduce((sum, post) => sum + (post.engagementRate || 0), 0) / posts.length 
        : 0;
      
      const topPosts = posts
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);

      return {
        totalPosts: posts.length,
        publishedPosts: posts.length, // All posts from Sanity are published
        totalViews,
        averageEngagement,
        topPosts
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalPosts: 0,
        publishedPosts: 0,
        totalViews: 0,
        averageEngagement: 0,
        topPosts: []
      };
    }
  }
}

export const unifiedBlogService = UnifiedBlogService.getInstance();
export default unifiedBlogService;
