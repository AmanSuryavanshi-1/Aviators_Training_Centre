'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { BlogPostTable } from '@/components/admin/BlogPostTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Tag, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { type BlogPostPreview } from '@/lib/types/blog';
import { toast } from 'sonner';
import { simpleBlogService } from '@/lib/blog/simple-blog-service';
import { useRealTimeSync } from '@/hooks/use-real-time-sync';
import { SyncStatusIndicator } from '@/components/admin/SyncStatusIndicator';
import { BulkOperationsPanel } from '@/components/admin/BulkOperationsPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<BlogPostPreview[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Real-time sync integration
  const { syncStatus, isConnected, forceSyncCheck, optimisticUpdate } = useRealTimeSync();

  // Enhanced blog loading with real-time sync
  const loadAllBlogs = async (showToast = true) => {
    try {
      setLoading(true);
      setConnectionError(null);
      
      // Simple connection test
      try {
        await simpleBlogService.getAllPosts({ limit: 1 });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        setConnectionError(errorMessage);
        if (showToast) {
          toast.error(`Connection issue: ${errorMessage}`);
        }
        return;
      }
      
      const allPosts = await simpleBlogService.getAllPosts();
      
      // Convert unified posts to BlogPostPreview format
      const blogPreviews: BlogPostPreview[] = allPosts.map(post => ({
        _id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featured: post.featured,
        publishedAt: post.publishedAt,
        author: post.author,
        category: post.category,
        tags: post.tags,
        image: post.image,
        analytics: {
          views: post.views || 0,
          engagementRate: post.engagementRate || 0,
          shares: post.shares || 0
        },
        readingTime: post.readingTime,
        source: post.source,
        editable: post.editable,
        _createdAt: post._createdAt
      }));
      
      setBlogs(blogPreviews);
      setLastRefresh(new Date());
      
      if (showToast) {
        toast.success(`${blogPreviews.length} blog posts loaded successfully!`);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load blog posts';
      setConnectionError(errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBlogs();
  }, []);

  // Auto-refresh when sync status changes
  useEffect(() => {
    if (isConnected && syncStatus.lastSync) {
      loadAllBlogs(false); // Refresh without toast
    }
  }, [syncStatus.lastSync, isConnected]);

  const handleDeleteBlog = async (slug: string) => {
    try {
      const blogToDelete = blogs.find(blog => 
        (typeof blog.slug === 'string' ? blog.slug : blog.slug?.current) === slug
      );
      
      if (!blogToDelete) {
        throw new Error('Blog post not found');
      }

      if (!blogToDelete.editable) {
        toast.error('This post cannot be deleted (read-only)');
        return;
      }

      // Use optimistic update with real-time sync
      await optimisticUpdate(
        async () => {
          const result = await simpleBlogService.deletePost(blogToDelete._id);
          if (!result.success) {
            throw new Error(result.error || 'Failed to delete blog');
          }
          return result;
        },
        async () => {
          // Rollback: reload blogs
          await loadAllBlogs(false);
        }
      );

      // Optimistically update UI
      setBlogs(prev => prev.filter(blog => blog._id !== blogToDelete._id));
      toast.success('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete blog. Please try again.');
    }
  };

  const handleToggleFeatured = async (slug: string, featured: boolean) => {
    try {
      const blogToUpdate = blogs.find(blog => 
        (typeof blog.slug === 'string' ? blog.slug : blog.slug?.current) === slug
      );
      
      if (!blogToUpdate) {
        throw new Error('Blog post not found');
      }

      if (!blogToUpdate.editable) {
        toast.error('This post cannot be edited (read-only)');
        return;
      }

      // Use optimistic update with real-time sync
      await optimisticUpdate(
        async () => {
          const result = await simpleBlogService.updatePost(blogToUpdate._id, {
            featured
          });
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to update blog');
          }
          return result;
        },
        async () => {
          // Rollback: revert UI change
          setBlogs(prev => prev.map(blog => 
            blog._id === blogToUpdate._id
              ? { ...blog, featured: !featured }
              : blog
          ));
        }
      );

      // Optimistically update UI
      setBlogs(prev => prev.map(blog => 
        blog._id === blogToUpdate._id
          ? { ...blog, featured }
          : blog
      ));
      
      toast.success(`Blog ${featured ? 'marked as featured' : 'removed from featured'}!`);
    } catch (error) {
      console.error('Error updating blog:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update blog. Please try again.');
    }
  };

  const handleBulkAction = async (action: string, postIds: string[], options?: any) => {
    try {
      // Filter only editable posts for destructive actions
      const selectedBlogs = blogs.filter(blog => postIds.includes(blog._id));
      const editableBlogs = selectedBlogs.filter(blog => blog.editable);
      const readOnlyBlogs = selectedBlogs.filter(blog => !blog.editable);

      if (readOnlyBlogs.length > 0 && ['delete', 'feature', 'unfeature', 'change-category', 'add-tags'].includes(action)) {
        toast.error(`${readOnlyBlogs.length} markdown-based posts cannot be modified. Only Sanity posts can be edited.`);
      }

      switch (action) {
        case 'delete':
          for (const blog of editableBlogs) {
            const slug = typeof blog.slug === 'string' ? blog.slug : blog.slug?.current;
            if (slug) {
              await handleDeleteBlog(slug);
            }
          }
          break;
        
        case 'feature':
          for (const blog of editableBlogs) {
            const slug = typeof blog.slug === 'string' ? blog.slug : blog.slug?.current;
            if (slug) {
              await handleToggleFeatured(slug, true);
            }
          }
          break;
        
        case 'unfeature':
          for (const blog of editableBlogs) {
            const slug = typeof blog.slug === 'string' ? blog.slug : blog.slug?.current;
            if (slug) {
              await handleToggleFeatured(slug, false);
            }
          }
          break;
        
        case 'change-category':
          // Update category for editable posts using unified service with optimistic updates
          for (const blog of editableBlogs) {
            try {
              await optimisticUpdate(
                async () => {
                  const result = await simpleBlogService.updatePost(blog._id, {
                    category: options.category
                  });
                  if (!result.success) {
                    throw new Error(result.error || 'Failed to update category');
                  }
                  return result;
                },
                async () => {
                  // Rollback: reload blogs
                  await loadAllBlogs(false);
                }
              );
              
              // Optimistically update UI
              setBlogs(prev => prev.map(b => 
                b._id === blog._id 
                  ? { ...b, category: { ...b.category, title: options.category } }
                  : b
              ));
            } catch (error) {
              console.error(`Failed to update category for post ${blog._id}:`, error);
            }
          }
          break;
        
        case 'add-tags':
          // Add tags for editable posts using unified service with optimistic updates
          for (const blog of editableBlogs) {
            try {
              const newTags = [...(blog.tags || []), ...options.tags];
              
              await optimisticUpdate(
                async () => {
                  const result = await simpleBlogService.updatePost(blog._id, {
                    tags: newTags
                  });
                  if (!result.success) {
                    throw new Error(result.error || 'Failed to update tags');
                  }
                  return result;
                },
                async () => {
                  // Rollback: reload blogs
                  await loadAllBlogs(false);
                }
              );
              
              // Optimistically update UI
              setBlogs(prev => prev.map(b => 
                b._id === blog._id 
                  ? { ...b, tags: newTags }
                  : b
              ));
            } catch (error) {
              console.error(`Failed to update tags for post ${blog._id}:`, error);
            }
          }
          break;
        
        case 'export':
          // Export selected posts (works for all posts)
          const exportData = blogs.filter(blog => postIds.includes(blog._id));
          const dataStr = JSON.stringify(exportData, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          const exportFileDefaultName = 'blog-posts-export.json';
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
          break;
        
        case 'duplicate':
          // Duplicate editable posts using unified service with optimistic updates
          for (const blog of editableBlogs) {
            try {
              await optimisticUpdate(
                async () => {
                  const originalPost = await simpleBlogService.getPostBySlug(
                    typeof blog.slug === 'string' ? blog.slug : blog.slug?.current || ''
                  );
                  
                  if (!originalPost.success || !originalPost.data) {
                    throw new Error('Failed to fetch original post');
                  }

                  const duplicateData = {
                    title: `${originalPost.data.title} (Copy)`,
                    content: originalPost.data.content || '',
                    excerpt: originalPost.data.excerpt,
                    category: originalPost.data.category.title,
                    author: originalPost.data.author.name,
                    tags: originalPost.data.tags,
                    featured: false, // Don't duplicate featured status
                    seoTitle: `${originalPost.data.title} (Copy) | Aviators Training Centre`,
                    seoDescription: originalPost.data.excerpt.substring(0, 160)
                  };
                  
                  const result = await simpleBlogService.createPost(duplicateData);
                  return result;
                },
                async () => {
                  // Rollback: reload blogs
                  await loadAllBlogs(false);
                }
              );
              
              // Refresh the blog list to show the new duplicate
              await loadAllBlogs(false);
            } catch (error) {
              console.error(`Failed to duplicate post ${blog._id}:`, error);
              toast.error(`Failed to duplicate "${blog.title}"`);
            }
          }
          break;
        
        default:
          console.log(`Bulk action ${action} not implemented`);
      }

      if (editableBlogs.length > 0) {
        toast.success(`Bulk action completed for ${editableBlogs.length} posts`);
      }
    } catch (error) {
      console.error(`Error executing bulk action ${action}:`, error);
      throw error;
    }
  };

  const categories = Array.from(new Set(blogs.map(blog => blog.category?.title).filter(Boolean)));

  return (
    <AdminLayout>
      {/* Header Section with Aviation Theme */}
      <div className="mb-8">
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Blog Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                Create, edit, and manage your aviation content
              </p>
              <div className="flex items-center gap-4 mt-3">
                <SyncStatusIndicator status={syncStatus} />
                <div className="text-sm text-slate-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  forceSyncCheck();
                  loadAllBlogs();
                }}
                disabled={loading}
                className="border-teal-200 text-teal-600 hover:bg-teal-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/admin/new">
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create New Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive" className="mb-6">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Connection issue: {connectionError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAllBlogs()}
              disabled={loading}
              className="ml-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Enhanced Tabs with Aviation Theme */}
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-1 rounded-lg shadow-sm">
          <TabsTrigger 
            value="posts" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            All Posts ({blogs.length})
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
          >
            <Tag className="h-4 w-4 mr-2" />
            Categories ({categories.length})
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {/* Enhanced Bulk Operations Panel */}
          <BulkOperationsPanel
            selectedPosts={selectedPosts}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedPosts([])}
            availableCategories={categories}
          />

          {/* Posts Table with Better Styling */}
          <div className="animate-in fade-in-50 duration-500">
            <BlogPostTable
              posts={blogs}
              onDeletePost={handleDeleteBlog}
              onToggleFeatured={handleToggleFeatured}
              loading={loading}
              onSelectionChange={setSelectedPosts}
            />
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-full mb-6">
                <Tag className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Category Management
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Organize your aviation content with categories for better navigation and SEO
              </p>
              <Button 
                variant="outline" 
                className="border-teal-200 text-teal-600 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-900/20"
              >
                <Tag className="h-4 w-4 mr-2" />
                Manage Categories
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
