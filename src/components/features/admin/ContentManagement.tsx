'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Users, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { sanitySimpleService } from '@/lib/sanity/client.simple';
import { urlGenerator } from '@/lib/utils/urlGenerator';

interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: { name: string };
  category?: { title: string };
  featured: boolean;
  _updatedAt: string;
}

interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  email?: string;
  _updatedAt: string;
}

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  color?: string;
  _updatedAt: string;
}

interface ContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  totalAuthors: number;
  totalCategories: number;
}

const ContentManagement: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'authors' | 'categories'>('posts');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching content...');

      // Fetch all content in parallel
      const [postsData, authorsData, categoriesData] = await Promise.all([
        sanitySimpleService.getAllPosts({ limit: 50 }).catch(err => {
          console.error('Error fetching posts:', err);
          return [];
        }),
        fetchAuthors().catch(err => {
          console.error('Error fetching authors:', err);
          return [];
        }),
        fetchCategories().catch(err => {
          console.error('Error fetching categories:', err);
          return [];
        })
      ]);

      console.log('Fetched data:', {
        posts: postsData?.length || 0,
        authors: authorsData?.length || 0,
        categories: categoriesData?.length || 0
      });

      // Ensure arrays
      const safePosts = Array.isArray(postsData) ? postsData : [];
      const safeAuthors = Array.isArray(authorsData) ? authorsData : [];
      const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];

      setPosts(safePosts);
      setAuthors(safeAuthors);
      setCategories(safeCategories);

      // Calculate stats
      const publishedPosts = safePosts.filter(post => post.publishedAt);
      const featuredPosts = safePosts.filter(post => post.featured);

      setStats({
        totalPosts: safePosts.length,
        publishedPosts: publishedPosts.length,
        draftPosts: safePosts.length - publishedPosts.length,
        featuredPosts: featuredPosts.length,
        totalAuthors: safeAuthors.length,
        totalCategories: safeCategories.length,
      });

    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch content');
      
      // Set empty arrays as fallback
      setPosts([]);
      setAuthors([]);
      setCategories([]);
      setStats({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        featuredPosts: 0,
        totalAuthors: 0,
        totalCategories: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async (): Promise<Author[]> => {
    try {
      const authors = await sanitySimpleService.getAuthors();
      return authors.map(author => ({
        _id: author._id,
        name: author.name,
        slug: author.slug,
        email: author.email,
        _updatedAt: new Date().toISOString() // Mock update time
      }));
    } catch (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
  };

  const fetchCategories = async (): Promise<Category[]> => {
    try {
      const categories = await sanitySimpleService.getCategories();
      return categories.map(category => ({
        _id: category._id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        color: category.color,
        _updatedAt: new Date().toISOString() // Mock update time
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const handleDelete = async (type: 'post' | 'author' | 'category', id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await fetch('/api/sanity/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete item');
      }

      // Remove from local state
      if (type === 'post') {
        setPosts(prev => prev.filter(post => post._id !== id));
      } else if (type === 'author') {
        setAuthors(prev => prev.filter(author => author._id !== id));
      } else if (type === 'category') {
        setCategories(prev => prev.filter(category => category._id !== id));
      }

      // Refresh stats
      await fetchContent();

    } catch (err) {
      console.error('Error deleting item:', err);
      alert(`Failed to delete ${title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Content Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-aviation-primary mr-2" />
            <span>Loading content...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Content Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load content: {error}
            </AlertDescription>
          </Alert>
          <Button onClick={fetchContent} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Content Management
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchContent}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" asChild>
                <a href={urlGenerator.getStudioUrl()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Studio
                </a>
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage your blog content, authors, and categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-600">{stats.totalPosts}</p>
                <p className="text-sm text-blue-700">Total Posts</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
                <p className="text-sm text-green-700">Published</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <Edit className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
                <p className="text-sm text-yellow-700">Drafts</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-600">{stats.featuredPosts}</p>
                <p className="text-sm text-purple-700">Featured</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <Users className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-orange-600">{stats.totalAuthors}</p>
                <p className="text-sm text-orange-700">Authors</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <FolderOpen className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-indigo-600">{stats.totalCategories}</p>
                <p className="text-sm text-indigo-700">Categories</p>
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'posts', label: 'Blog Posts', count: posts.length },
                { key: 'authors', label: 'Authors', count: authors.length },
                { key: 'categories', label: 'Categories', count: categories.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-aviation-primary text-aviation-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Content Lists */}
          <div className="space-y-3">
            {activeTab === 'posts' && (
              <div className="space-y-3">
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No blog posts found</p>
                    <Button className="mt-4" asChild>
                      <a href={urlGenerator.getCreateUrl('post')} target="_blank">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Post
                      </a>
                    </Button>
                  </div>
                ) : (
                  posts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <div className="flex gap-2">
                            {post.featured && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                Featured
                              </Badge>
                            )}
                            {post.publishedAt ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                                Draft
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>/{post.slug?.current || 'no-slug'}</span>
                          {post.author?.name && <span>by {post.author.name}</span>}
                          {post.category?.title && <span>in {post.category.title}</span>}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post._updatedAt || post.publishedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/blog/${post.slug?.current || post._id}`} target="_blank">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={urlGenerator.getEditUrl(post._id, 'post')} target="_blank">
                            <Edit className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('post', post._id, post.title)}
                          disabled={deletingId === post._id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === post._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'authors' && (
              <div className="space-y-3">
                {authors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No authors found</p>
                    <Button className="mt-4" asChild>
                      <a href={urlGenerator.getCreateUrl('author')} target="_blank">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Author
                      </a>
                    </Button>
                  </div>
                ) : (
                  authors.map((author, index) => (
                    <motion.div
                      key={author._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{author.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>/{author.slug?.current || 'no-slug'}</span>
                          {author.email && <span>{author.email}</span>}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(author._updatedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={urlGenerator.getEditUrl(author._id, 'author')} target="_blank">
                            <Edit className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('author', author._id, author.name)}
                          disabled={deletingId === author._id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === author._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No categories found</p>
                    <Button className="mt-4" asChild>
                      <a href={urlGenerator.getCreateUrl('category')} target="_blank">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Category
                      </a>
                    </Button>
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <motion.div
                      key={category._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium text-gray-900">{category.title}</h4>
                          {category.color && (
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>/{category.slug?.current || 'no-slug'}</span>
                          {category.description && (
                            <span className="truncate max-w-xs">{category.description}</span>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(category._updatedAt || Date.now()).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={urlGenerator.getEditUrl(category._id, 'category')} target="_blank">
                            <Edit className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete('category', category._id, category.title)}
                          disabled={deletingId === category._id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === category._id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentManagement;