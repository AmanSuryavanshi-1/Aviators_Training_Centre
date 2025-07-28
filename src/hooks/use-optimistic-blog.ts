/**
 * Optimistic Blog Updates Hook
 * 
 * This hook provides optimistic updates with rollback capabilities
 * for blog CRUD operations, ensuring immediate UI feedback.
 */

import { useState, useCallback, useRef } from 'react';
import { SanityBlogClient } from '@/lib/blog/sanity-blog-client';
import { BlogPost, BlogPostPreview } from '@/lib/types/blog';
import { ErrorInfo } from '@/components/shared/ErrorDisplay';

export interface OptimisticState<T> {
  data: T | null;
  isLoading: boolean;
  isOptimistic: boolean;
  error: ErrorInfo | null;
  lastUpdated: Date | null;
}

export interface OptimisticOperationOptions {
  showOptimisticUpdate?: boolean;
  rollbackOnError?: boolean;
  invalidateCache?: boolean;
}

/**
 * Hook for managing optimistic blog post operations
 */
export function useOptimisticBlog() {
  const [posts, setPosts] = useState<OptimisticState<BlogPostPreview[]>>({
    data: null,
    isLoading: false,
    isOptimistic: false,
    error: null,
    lastUpdated: null,
  });

  const [currentPost, setCurrentPost] = useState<OptimisticState<BlogPost>>({
    data: null,
    isLoading: false,
    isOptimistic: false,
    error: null,
    lastUpdated: null,
  });

  // Store original data for rollback
  const originalPostsRef = useRef<BlogPostPreview[] | null>(null);
  const originalPostRef = useRef<BlogPost | null>(null);

  /**
   * Load all posts with caching
   */
  const loadPosts = useCallback(async (options?: { signal?: AbortSignal }) => {
    setPosts(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await SanityBlogClient.getAllPostPreviews(options);
      originalPostsRef.current = data;
      
      setPosts({
        data,
        isLoading: false,
        isOptimistic: false,
        error: null,
        lastUpdated: new Date(),
      });

      return data;
    } catch (error) {
      const errorInfo: ErrorInfo = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Failed to load posts',
        code: 'LOAD_POSTS_ERROR',
        retryable: true,
        actionable: true,
      };

      setPosts(prev => ({
        ...prev,
        isLoading: false,
        error: errorInfo,
      }));

      throw error;
    }
  }, []);

  /**
   * Load a single post by slug
   */
  const loadPost = useCallback(async (slug: string, options?: { signal?: AbortSignal }) => {
    setCurrentPost(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await SanityBlogClient.getPostBySlug(slug, options);
      originalPostRef.current = data;
      
      setCurrentPost({
        data,
        isLoading: false,
        isOptimistic: false,
        error: null,
        lastUpdated: new Date(),
      });

      return data;
    } catch (error) {
      const errorInfo: ErrorInfo = {
        type: 'server',
        message: error instanceof Error ? error.message : 'Failed to load post',
        code: 'LOAD_POST_ERROR',
        retryable: true,
        actionable: true,
      };

      setCurrentPost(prev => ({
        ...prev,
        isLoading: false,
        error: errorInfo,
      }));

      throw error;
    }
  }, []);

  /**
   * Create a new post with optimistic updates
   */
  const createPost = useCallback(async (
    postData: {
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
    },
    options: OptimisticOperationOptions = {}
  ) => {
    const { showOptimisticUpdate = true, rollbackOnError = true } = options;

    // Create optimistic post preview
    const optimisticPost: BlogPostPreview = {
      _id: `temp-${Date.now()}`,
      title: postData.title,
      slug: { current: postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-') },
      publishedAt: new Date().toISOString(),
      excerpt: postData.excerpt,
      image: { asset: {} as any, alt: 'Blog post image' },
      category: { title: 'Loading...', slug: { current: 'loading' }, color: '#075E68' },
      author: { name: 'Loading...', slug: { current: 'loading' }, role: 'Author' },
      readingTime: 5,
      featured: postData.featured || false,
      tags: postData.tags || [],
      difficulty: 'beginner',
    };

    if (showOptimisticUpdate && posts.data) {
      // Store original data for rollback
      originalPostsRef.current = posts.data;
      
      // Add optimistic post to the beginning of the list
      setPosts(prev => ({
        ...prev,
        data: [optimisticPost, ...prev.data!],
        isOptimistic: true,
        lastUpdated: new Date(),
      }));
    }

    try {
      const result = await SanityBlogClient.createPost(postData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create post');
      }

      // Update with actual data
      if (posts.data) {
        const updatedPosts = posts.data.map(post => 
          post._id === optimisticPost._id ? {
            ...optimisticPost,
            _id: result.post._id,
            category: result.post.category || optimisticPost.category,
            author: result.post.author || optimisticPost.author,
          } : post
        );

        setPosts(prev => ({
          ...prev,
          data: updatedPosts,
          isOptimistic: false,
          error: null,
          lastUpdated: new Date(),
        }));
      }

      return result.post;
    } catch (error) {
      // Rollback on error
      if (rollbackOnError && originalPostsRef.current) {
        setPosts(prev => ({
          ...prev,
          data: originalPostsRef.current,
          isOptimistic: false,
          error: {
            type: 'server',
            message: error instanceof Error ? error.message : 'Failed to create post',
            code: 'CREATE_POST_ERROR',
            retryable: true,
            actionable: true,
          },
        }));
      }

      throw error;
    }
  }, [posts.data]);

  /**
   * Update a post with optimistic updates
   */
  const updatePost = useCallback(async (
    id: string,
    updateData: {
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
    },
    options: OptimisticOperationOptions = {}
  ) => {
    const { showOptimisticUpdate = true, rollbackOnError = true } = options;

    if (showOptimisticUpdate) {
      // Store original data for rollback
      if (posts.data) {
        originalPostsRef.current = posts.data;
        
        // Apply optimistic update to posts list
        const updatedPosts = posts.data.map(post => 
          post._id === id ? { ...post, ...updateData, slug: updateData.slug ? { current: updateData.slug } : post.slug } : post
        );

        setPosts(prev => ({
          ...prev,
          data: updatedPosts,
          isOptimistic: true,
          lastUpdated: new Date(),
        }));
      }

      if (currentPost.data && currentPost.data._id === id) {
        originalPostRef.current = currentPost.data;
        
        // Apply optimistic update to current post
        setCurrentPost(prev => ({
          ...prev,
          data: prev.data ? { ...prev.data, ...updateData } : null,
          isOptimistic: true,
          lastUpdated: new Date(),
        }));
      }
    }

    try {
      const result = await SanityBlogClient.updatePost(id, updateData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update post');
      }

      // Update with actual data
      if (posts.data) {
        const updatedPosts = posts.data.map(post => 
          post._id === id ? {
            ...post,
            ...updateData,
            slug: updateData.slug ? { current: updateData.slug } : post.slug,
          } : post
        );

        setPosts(prev => ({
          ...prev,
          data: updatedPosts,
          isOptimistic: false,
          error: null,
          lastUpdated: new Date(),
        }));
      }

      if (currentPost.data && currentPost.data._id === id) {
        setCurrentPost(prev => ({
          ...prev,
          data: result.post,
          isOptimistic: false,
          error: null,
          lastUpdated: new Date(),
        }));
      }

      return result.post;
    } catch (error) {
      // Rollback on error
      if (rollbackOnError) {
        if (originalPostsRef.current) {
          setPosts(prev => ({
            ...prev,
            data: originalPostsRef.current,
            isOptimistic: false,
            error: {
              type: 'server',
              message: error instanceof Error ? error.message : 'Failed to update post',
              code: 'UPDATE_POST_ERROR',
              retryable: true,
              actionable: true,
            },
          }));
        }

        if (originalPostRef.current) {
          setCurrentPost(prev => ({
            ...prev,
            data: originalPostRef.current,
            isOptimistic: false,
            error: {
              type: 'server',
              message: error instanceof Error ? error.message : 'Failed to update post',
              code: 'UPDATE_POST_ERROR',
              retryable: true,
              actionable: true,
            },
          }));
        }
      }

      throw error;
    }
  }, [posts.data, currentPost.data]);

  /**
   * Delete a post with optimistic updates
   */
  const deletePost = useCallback(async (
    id: string,
    options: OptimisticOperationOptions = {}
  ) => {
    const { showOptimisticUpdate = true, rollbackOnError = true } = options;

    if (showOptimisticUpdate && posts.data) {
      // Store original data for rollback
      originalPostsRef.current = posts.data;
      
      // Remove post optimistically
      const updatedPosts = posts.data.filter(post => post._id !== id);
      
      setPosts(prev => ({
        ...prev,
        data: updatedPosts,
        isOptimistic: true,
        lastUpdated: new Date(),
      }));
    }

    try {
      const result = await SanityBlogClient.deletePost(id);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete post');
      }

      // Confirm deletion
      setPosts(prev => ({
        ...prev,
        isOptimistic: false,
        error: null,
        lastUpdated: new Date(),
      }));

      // Clear current post if it was deleted
      if (currentPost.data && currentPost.data._id === id) {
        setCurrentPost({
          data: null,
          isLoading: false,
          isOptimistic: false,
          error: null,
          lastUpdated: new Date(),
        });
      }

      return true;
    } catch (error) {
      // Rollback on error
      if (rollbackOnError && originalPostsRef.current) {
        setPosts(prev => ({
          ...prev,
          data: originalPostsRef.current,
          isOptimistic: false,
          error: {
            type: 'server',
            message: error instanceof Error ? error.message : 'Failed to delete post',
            code: 'DELETE_POST_ERROR',
            retryable: true,
            actionable: true,
          },
        }));
      }

      throw error;
    }
  }, [posts.data, currentPost.data]);

  /**
   * Refresh data from server
   */
  const refresh = useCallback(async () => {
    try {
      await loadPosts();
    } catch (error) {
      console.error('Failed to refresh posts:', error);
    }
  }, [loadPosts]);

  /**
   * Clear all optimistic states
   */
  const clearOptimistic = useCallback(() => {
    setPosts(prev => ({ ...prev, isOptimistic: false }));
    setCurrentPost(prev => ({ ...prev, isOptimistic: false }));
    originalPostsRef.current = null;
    originalPostRef.current = null;
  }, []);

  return {
    // State
    posts,
    currentPost,
    
    // Actions
    loadPosts,
    loadPost,
    createPost,
    updatePost,
    deletePost,
    refresh,
    clearOptimistic,
    
    // Utilities
    isOptimistic: posts.isOptimistic || currentPost.isOptimistic,
    hasError: posts.error !== null || currentPost.error !== null,
    isLoading: posts.isLoading || currentPost.isLoading,
  };
}