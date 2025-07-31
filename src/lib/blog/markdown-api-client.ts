'use client';

import { BlogPost, BlogPostPreview } from '../types/blog';

export interface MarkdownAPIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    count?: number;
    total?: number;
    source: string;
    timestamp: string;
    pagination?: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    category?: string;
    query?: string;
  };
}

export class MarkdownAPIClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  }

  private async fetchAPI<T>(endpoint: string): Promise<MarkdownAPIResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/blog/markdown${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Markdown API client error:', error);
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        meta: {
          source: 'markdown-api-client',
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async getAllBlogPosts(options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<MarkdownAPIResponse<BlogPostPreview[]>> {
    const { limit = 50, offset = 0 } = options;
    return this.fetchAPI<BlogPostPreview[]>(`?action=all&limit=${limit}&offset=${offset}`);
  }

  async getFeaturedBlogPosts(): Promise<MarkdownAPIResponse<BlogPostPreview[]>> {
    return this.fetchAPI<BlogPostPreview[]>('?action=featured');
  }

  async getBlogPostBySlug(slug: string): Promise<MarkdownAPIResponse<BlogPost | null>> {
    if (!slug) {
      return {
        success: false,
        data: null,
        error: 'Slug is required',
        meta: {
          source: 'markdown-api-client',
          timestamp: new Date().toISOString(),
        },
      };
    }
    return this.fetchAPI<BlogPost | null>(`?action=single&slug=${encodeURIComponent(slug)}`);
  }

  async getBlogPostsByCategory(category: string): Promise<MarkdownAPIResponse<BlogPostPreview[]>> {
    if (!category) {
      return {
        success: false,
        data: [],
        error: 'Category is required',
        meta: {
          source: 'markdown-api-client',
          timestamp: new Date().toISOString(),
        },
      };
    }
    return this.fetchAPI<BlogPostPreview[]>(`?action=by-category&category=${encodeURIComponent(category)}`);
  }

  async searchBlogPosts(query: string): Promise<MarkdownAPIResponse<BlogPostPreview[]>> {
    if (!query) {
      return {
        success: false,
        data: [],
        error: 'Query is required',
        meta: {
          source: 'markdown-api-client',
          timestamp: new Date().toISOString(),
        },
      };
    }
    return this.fetchAPI<BlogPostPreview[]>(`?action=search&query=${encodeURIComponent(query)}`);
  }

  async getAllCategories(): Promise<MarkdownAPIResponse<string[]>> {
    return this.fetchAPI<string[]>('?action=categories');
  }

  async getAllTags(): Promise<MarkdownAPIResponse<string[]>> {
    return this.fetchAPI<string[]>('?action=tags');
  }

  async isMarkdownBlogAvailable(): Promise<MarkdownAPIResponse<boolean>> {
    return this.fetchAPI<boolean>('?action=availability');
  }
}

// Create and export a singleton instance for client-side use
export const markdownAPIClient = new MarkdownAPIClient();

// Default export for convenience
export default markdownAPIClient;
