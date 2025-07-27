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
      console.log('🔄 Fetching posts from Sanity...');
      
      const query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
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

      const posts = await client.fetch(query);
      console.log(`✅ Fetched ${posts.length} posts from Sanity`);
      
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

  async createPost(postData: any): Promise<any> {
    // For now, return a mock response since we're focusing on display functionality
    console.log('Create post called with:', postData);
    return {
      success: true,
      message: 'Post creation functionality needs to be implemented',
      data: postData
    };
  }

  async updatePost(id: string, updateData: any): Promise<{ success: boolean; data?: any; error?: string }> {
    // For now, return a mock response
    console.log('Update post called with:', id, updateData);
    return {
      success: true,
      data: { ...updateData, _id: id }
    };
  }

  async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    // For now, return a mock response
    console.log('Delete post called with:', id);
    return {
      success: true
    };
  }
}

export const simpleBlogService = SimpleBlogService.getInstance();
export default simpleBlogService;
