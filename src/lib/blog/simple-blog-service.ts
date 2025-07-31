import { createClient } from '@sanity/client';

// Simplified blog service that directly queries Sanity
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "3u4fa9kl",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", 
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
});

export interface SimpleBlogPost {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  content?: string;
  body?: any[];
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
  views?: number;
  engagementRate?: number;
  shares?: number;
  source: 'sanity';
  editable: boolean;
}

class SimpleBlogService {
  private static instance: SimpleBlogService;

  static getInstance(): SimpleBlogService {
    if (!SimpleBlogService.instance) {
      SimpleBlogService.instance = new SimpleBlogService();
    }
    return SimpleBlogService.instance;
  }

  async getAllPosts(options: { limit?: number; featured?: boolean; category?: string } = {}): Promise<SimpleBlogPost[]> {
    try {
      
      const query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
        _id,
        _createdAt,
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

      const posts = await client.fetch(query);
      
      return posts
        .filter((post: any) => {
          // Filter out posts with missing critical data
          return post && 
                 post._id && 
                 post.title && 
                 post.slug && 
                 post.slug.current &&
                 post.publishedAt;
        })
        .map((post: any) => ({
        _id: post._id,
        _createdAt: post._createdAt,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || 'Discover expert aviation insights and training guidance.',
        content: this.convertPortableTextToMarkdown(post.body),
        body: post.body,
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
        readingTime: post.readingTime || Math.max(1, Math.ceil((post.body?.length || 0) / 10)),
        image: {
          asset: post.image?.asset || {
            url: post.image?.asset?.url || '/Blogs/Blog_Header.webp'
          },
          alt: post.image?.alt || post.title
        },
        tags: post.tags || [],
        featured: post.featured || false,
        views: post.views || 0,
        engagementRate: post.engagementRate || 0,
        shares: post.shares || 0,
        source: 'sanity' as const,
        editable: true
      }));
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      return [];
    }
  }

  async getPost(identifier: string): Promise<SimpleBlogPost | null> {
    const allPosts = await this.getAllPosts();
    return allPosts.find(post => 
      post._id === identifier || 
      post.slug.current === identifier
    ) || null;
  }

  async getPostBySlug(slug: string): Promise<{ success: boolean; data?: SimpleBlogPost; error?: string }> {
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

  private convertMarkdownToPortableText(markdown: string): any[] {
    if (!markdown) return [];
    
    const lines = markdown.split('\n');
    const blocks: any[] = [];
    let currentList: any[] | null = null;
    let listItemNumber = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Skip empty lines unless we're in a list
      if (!trimmedLine && !currentList) continue;
      
      // End list if we hit an empty line
      if (!trimmedLine && currentList) {
        currentList = null;
        listItemNumber = 1;
        continue;
      }
      
      // Headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        blocks.push({
          _type: 'block',
          style: `h${level}`,
          children: [{ _type: 'span', text: headerMatch[2] }]
        });
        currentList = null;
        continue;
      }
      
      // Bullet list
      if (line.match(/^[\*\-\+]\s+/)) {
        const text = line.replace(/^[\*\-\+]\s+/, '');
        blocks.push({
          _type: 'block',
          listItem: 'bullet',
          children: [{ _type: 'span', text }]
        });
        currentList = 'bullet';
        continue;
      }
      
      // Numbered list
      if (line.match(/^\d+\.\s+/)) {
        const text = line.replace(/^\d+\.\s+/, '');
        blocks.push({
          _type: 'block',
          listItem: 'number',
          children: [{ _type: 'span', text }]
        });
        currentList = 'number';
        continue;
      }
      
      // Blockquote
      if (line.match(/^>\s*/)) {
        const text = line.replace(/^>\s*/, '');
        blocks.push({
          _type: 'block',
          style: 'blockquote',
          children: [{ _type: 'span', text }]
        });
        currentList = null;
        continue;
      }
      
      // Code block
      if (line.startsWith('```')) {
        const language = line.slice(3).trim() || 'text';
        let codeContent = '';
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent += lines[i] + '\n';
          i++;
        }
        blocks.push({
          _type: 'code',
          language,
          code: codeContent.trimEnd()
        });
        currentList = null;
        continue;
      }
      
      // Normal paragraph
      blocks.push({
        _type: 'block',
        style: 'normal',
        children: [{ _type: 'span', text: trimmedLine }]
      });
      currentList = null;
    }
    
    return blocks;
  }

  private async findOrCreateCategory(categoryName: string): Promise<string> {
    try {
      // First, try to find existing category
      const existingCategory = await client.fetch(
        `*[_type == "category" && title == $title][0]._id`,
        { title: categoryName }
      );
      
      if (existingCategory) {
        return existingCategory;
      }
      
      // Create new category if not found
      const newCategory = await client.create({
        _type: 'category',
        title: categoryName,
        slug: {
          _type: 'slug',
          current: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        },
        description: `Articles about ${categoryName}`,
        color: '#075E68' // Default color
      });
      
      return newCategory._id;
    } catch (error) {
      console.error('Error finding/creating category:', error);
      // Return a default category ID if available
      const defaultCategory = await client.fetch(
        `*[_type == "category" && title == "General"][0]._id`
      );
      return defaultCategory || 'general';
    }
  }

  private async findOrCreateAuthor(authorName: string): Promise<string> {
    try {
      // First, try to find existing author
      const existingAuthor = await client.fetch(
        `*[_type == "author" && name == $name][0]._id`,
        { name: authorName }
      );
      
      if (existingAuthor) {
        return existingAuthor;
      }
      
      // Create new author if not found
      const newAuthor = await client.create({
        _type: 'author',
        name: authorName,
        slug: {
          _type: 'slug',
          current: authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        },
        role: 'Contributor',
        bio: [{
          _type: 'block',
          style: 'normal',
          children: [{ _type: 'span', text: `${authorName} is a contributor to Aviators Training Centre.` }]
        }]
      });
      
      return newAuthor._id;
    } catch (error) {
      console.error('Error finding/creating author:', error);
      // Return a default author ID if available
      const defaultAuthor = await client.fetch(
        `*[_type == "author" && name == "ATC Instructor"][0]._id`
      );
      return defaultAuthor || 'default-author';
    }
  }

  private convertPortableTextToMarkdown(blocks: any[]): string {
    if (!Array.isArray(blocks) || blocks.length === 0) {
      return '';
    }
    
    const markdownBlocks = blocks.map((block) => {
      if (!block) return '';
      
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
      
      if (block._type === 'block' || !block._type) {
        const children = block.children || [];
        if (children.length === 0) return '';
        
        const text = children.map((child: any) => child.text || '').join('');
        if (!text.trim()) return '';
        
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
      
      return '';
    }).filter(block => block.trim() !== '');
    
    return markdownBlocks.join('\n\n');
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string; timestamp: string }> {
    try {
      // Simple health check - try to fetch one post
      const posts = await this.getAllPosts({ limit: 1 });
      
      return {
        status: 'healthy',
        message: 'Simple blog service is working',
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

  async createPost(postData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Convert content to Portable Text blocks
      const bodyBlocks = this.convertMarkdownToPortableText(postData.content || '');
      
      // Create the post document
      const newPost = {
        _type: 'post',
        title: postData.title,
        slug: {
          _type: 'slug',
          current: postData.slug || postData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        },
        excerpt: postData.excerpt,
        body: bodyBlocks,
        publishedAt: postData.publishedAt || new Date().toISOString(),
        featured: postData.featured || false,
        readingTime: postData.readingTime || Math.ceil((postData.content?.split(' ').length || 0) / 200),
        // References need to be created properly
        category: {
          _type: 'reference',
          _ref: postData.categoryId || await this.findOrCreateCategory(postData.category)
        },
        author: {
          _type: 'reference',
          _ref: postData.authorId || await this.findOrCreateAuthor(postData.author)
        },
        image: postData.image ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: postData.image.assetId || postData.image._id
          },
          alt: postData.image.alt || postData.title
        } : undefined,
        tags: postData.tags || [],
        seoTitle: postData.seoTitle || postData.title,
        seoDescription: postData.seoDescription || postData.excerpt,
        focusKeyword: postData.focusKeyword || ''
      };

      const result = await client.create(newPost);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error creating post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create post'
      };
    }
  }

  async updatePost(id: string, updateData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const patchData: any = {};
      
      // Only update fields that are provided
      if (updateData.title !== undefined) patchData.title = updateData.title;
      if (updateData.slug !== undefined) {
        patchData.slug = {
          _type: 'slug',
          current: updateData.slug
        };
      }
      if (updateData.excerpt !== undefined) patchData.excerpt = updateData.excerpt;
      if (updateData.content !== undefined) {
        patchData.body = this.convertMarkdownToPortableText(updateData.content);
      }
      if (updateData.publishedAt !== undefined) patchData.publishedAt = updateData.publishedAt;
      if (updateData.featured !== undefined) patchData.featured = updateData.featured;
      if (updateData.tags !== undefined) patchData.tags = updateData.tags;
      if (updateData.seoTitle !== undefined) patchData.seoTitle = updateData.seoTitle;
      if (updateData.seoDescription !== undefined) patchData.seoDescription = updateData.seoDescription;
      if (updateData.focusKeyword !== undefined) patchData.focusKeyword = updateData.focusKeyword;
      
      // Handle category update
      if (updateData.category !== undefined) {
        patchData.category = {
          _type: 'reference',
          _ref: updateData.categoryId || await this.findOrCreateCategory(updateData.category)
        };
      }
      
      // Handle author update
      if (updateData.author !== undefined) {
        patchData.author = {
          _type: 'reference',
          _ref: updateData.authorId || await this.findOrCreateAuthor(updateData.author)
        };
      }
      
      // Handle image update
      if (updateData.image !== undefined) {
        patchData.image = updateData.image ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: updateData.image.assetId || updateData.image._id
          },
          alt: updateData.image.alt || updateData.title || 'Blog image'
        } : null;
      }
      
      // Update reading time if content changed
      if (updateData.content !== undefined && updateData.readingTime === undefined) {
        patchData.readingTime = Math.ceil((updateData.content.split(' ').length || 0) / 200);
      }
      
      const result = await client
        .patch(id)
        .set(patchData)
        .commit();
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error updating post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update post'
      };
    }
  }

  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await client.delete(id);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting post:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete post'
      };
    }
  }
}

export const simpleBlogService = SimpleBlogService.getInstance();
export default simpleBlogService;
