/**
 * Client-side Blog API - Safe for browser use
 * This system fetches blog data from the server API
 */

import { BlogPost, BlogPostPreview, BlogCategory, BlogAuthor } from '@/lib/types/blog';

// Client-side Blog API
export class OptimizedBlogClient {
  private static baseUrl = '/api/blog/unified';

  static async getAllPostPreviews(): Promise<BlogPostPreview[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  static async getFeaturedPosts(): Promise<BlogPostPreview[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=featured`);
      if (!response.ok) throw new Error('Failed to fetch featured posts');
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  }

  static async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const response = await fetch(`${this.baseUrl}?action=post&slug=${encodeURIComponent(slug)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      return data.post || null;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  }

  static async getPostsByCategory(categorySlug: string): Promise<BlogPostPreview[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=category-posts&category=${encodeURIComponent(categorySlug)}`);
      if (!response.ok) throw new Error('Failed to fetch category posts');
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('Error fetching category posts:', error);
      return [];
    }
  }

  static async getAllCategories(): Promise<BlogCategory[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getAllAuthors(): Promise<BlogAuthor[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=authors`);
      if (!response.ok) throw new Error('Failed to fetch authors');
      const data = await response.json();
      return data.authors || [];
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  }

  static async getAllSlugs(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=slugs`);
      if (!response.ok) throw new Error('Failed to fetch slugs');
      const data = await response.json();
      return data.slugs || [];
    } catch (error) {
      console.error('Error fetching slugs:', error);
      return [];
    }
  }

  static async getRelatedPosts(currentPostId: string, limit: number = 3): Promise<BlogPostPreview[]> {
    try {
      // Get all posts and filter client-side for simplicity
      const posts = await this.getAllPostPreviews();
      const currentPost = posts.find(post => post._id === currentPostId);
      if (!currentPost) return [];

      return posts
        .filter(post => 
          post._id !== currentPostId && 
          post.category.slug.current === currentPost.category.slug.current
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }
  }

  static async searchPosts(query: string): Promise<BlogPostPreview[]> {
    try {
      const posts = await this.getAllPostPreviews();
      const searchTerm = query.toLowerCase();
      return posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }

  static async createPost(postData: {
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    category: string;
    author?: string;
    tags?: string[];
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
  }): Promise<{ success: boolean; post?: any; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create post' };
      }

      return { success: true, post: data.post };
    } catch (error) {
      console.error('Error creating post:', error);
      return { success: false, error: 'Network error while creating post' };
    }
  }

  static async updatePost(id: string, updateData: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    author?: string;
    tags?: string[];
    featured?: boolean;
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
  }): Promise<{ success: boolean; post?: any; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updateData }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to update post' };
      }

      return { success: true, post: data.post };
    } catch (error) {
      console.error('Error updating post:', error);
      return { success: false, error: 'Network error while updating post' };
    }
  }

  static async deletePost(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to delete post' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: 'Network error while deleting post' };
    }
  }

  static async getHealthStatus(): Promise<{
    healthy: boolean;
    sources: Record<string, { status: string; count: number }>;
    total: number;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}?action=health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      return {
        healthy: false,
        sources: { sanity: { status: 'error', count: 0 }, markdown: { status: 'error', count: 0 } },
        total: 0,
        timestamp: new Date().toISOString()
      };
    }
  }
}
