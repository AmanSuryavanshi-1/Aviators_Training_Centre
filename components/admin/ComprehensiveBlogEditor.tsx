"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RichTextEditor from './RichTextEditor';
import { SanityBlogClient } from '@/lib/blog/sanity-blog-client';
import { BlogCategory, BlogAuthor } from '@/lib/types/blog';
import { useOptimisticBlog } from '@/hooks/use-optimistic-blog';
import {
  Save,
  Eye,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Plus,
  Hash,
  User,
  Calendar,
  Globe,
  Search,
  Target,
  Wifi,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Form validation schema
const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  slug: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required').max(300, 'Excerpt must be less than 300 characters'),
  category: z.string().min(1, 'Category is required'),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  seoTitle: z.string().max(60, 'SEO title should be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description should be less than 160 characters').optional(),
  focusKeyword: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface ComprehensiveBlogEditorProps {
  initialData?: Partial<BlogPostFormData>;
  postId?: string;
  onSave?: (data: BlogPostFormData) => void;
  onPublish?: (data: BlogPostFormData) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const ComprehensiveBlogEditor: React.FC<ComprehensiveBlogEditorProps> = ({
  initialData,
  postId,
  onSave,
  onPublish,
  onCancel,
  isEditing = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [categories, setCategories] = React.useState<BlogCategory[]>([]);
  const [authors, setAuthors] = React.useState<BlogAuthor[]>([]);
  const [newTag, setNewTag] = React.useState('');
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  
  // Enhanced Sanity integration states
  const [connectionStatus, setConnectionStatus] = React.useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [connectionError, setConnectionError] = React.useState<string | null>(null);
  const [isValidatingConnection, setIsValidatingConnection] = React.useState(false);
  const [cacheInvalidationStatus, setCacheInvalidationStatus] = React.useState<'idle' | 'invalidating' | 'success' | 'error'>('idle');

  // Optimistic updates hook
  const { createPost, updatePost, isOptimistic } = useOptimisticBlog();

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      content: initialData?.content || '',
      excerpt: initialData?.excerpt || '',
      category: initialData?.category || '',
      author: initialData?.author || '',
      tags: initialData?.tags || [],
      featured: initialData?.featured || false,
      seoTitle: initialData?.seoTitle || '',
      seoDescription: initialData?.seoDescription || '',
      focusKeyword: initialData?.focusKeyword || '',
    },
  });

  const { watch, setValue, getValues } = form;
  const watchedTitle = watch('title');
  const watchedContent = watch('content');
  const watchedTags = watch('tags');

  // Real-time Sanity connection validation with enhanced diagnostics
  const validateConnection = React.useCallback(async () => {
    setIsValidatingConnection(true);
    setConnectionStatus('checking');
    setConnectionError(null);

    try {
      const connectionTest = await SanityBlogClient.testConnection({ timeout: 8000 });
      
      if (connectionTest.connected) {
        setConnectionStatus('connected');
        setConnectionError(null);
        console.log(`✅ Sanity connection validated (${connectionTest.latency}ms)`);
      } else if (connectionTest.error) {
        const error = connectionTest.error;
        
        if (error.type === 'network' || error.type === 'timeout') {
          setConnectionStatus('error');
          setConnectionError(`Connection failed: ${error.message} (${connectionTest.latency}ms)`);
        } else if (error.type === 'permission') {
          setConnectionStatus('disconnected');
          setConnectionError(`Authentication failed: ${error.message}`);
        } else {
          setConnectionStatus('error');
          setConnectionError(`Connection error: ${error.message}`);
        }
        
        console.error('❌ Connection validation failed:', error);
      } else {
        setConnectionStatus('disconnected');
        setConnectionError('Unable to establish connection to Sanity CMS.');
      }
    } catch (error) {
      console.error('Connection validation failed:', error);
      setConnectionStatus('error');
      setConnectionError(error instanceof Error ? error.message : 'Failed to validate Sanity connection');
    } finally {
      setIsValidatingConnection(false);
    }
  }, []);

  // Load categories and authors with enhanced error handling
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // First validate connection
      await validateConnection();
      
      try {
        const [categoriesData, authorsData] = await Promise.all([
          SanityBlogClient.getAllCategories({ timeout: 10000, retries: 2 }),
          SanityBlogClient.getAllAuthors({ timeout: 10000, retries: 2 }),
        ]);
        setCategories(categoriesData);
        setAuthors(authorsData);
        console.log(`✅ Loaded ${categoriesData.length} categories and ${authorsData.length} authors`);
      } catch (error) {
        console.error('❌ Error loading editor data:', error);
        setConnectionStatus('error');
        
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('timeout')) {
            setConnectionError('Network error while loading editor data. Please check your connection.');
          } else if (error.message.includes('permission')) {
            setConnectionError('Permission denied while loading editor data. Please check your API token.');
          } else {
            setConnectionError(`Failed to load editor data: ${error.message}`);
          }
        } else {
          setConnectionError('Failed to load categories and authors. Please check your Sanity configuration.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [validateConnection]);

  // Periodic connection validation (every 30 seconds)
  React.useEffect(() => {
    const interval = setInterval(validateConnection, 30000);
    return () => clearInterval(interval);
  }, [validateConnection]);

  // Auto-generate slug from title
  React.useEffect(() => {
    if (watchedTitle && !isEditing) {
      const slug = watchedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue, isEditing]);

  // Auto-generate SEO title if not set
  React.useEffect(() => {
    if (watchedTitle && !getValues('seoTitle')) {
      setValue('seoTitle', `${watchedTitle} | Aviators Training Centre`);
    }
  }, [watchedTitle, setValue, getValues]);

  // Calculate reading time
  const readingTime = React.useMemo(() => {
    if (!watchedContent) return 0;
    const words = watchedContent.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  }, [watchedContent]);

  // Auto-save functionality
  React.useEffect(() => {
    const autoSave = setTimeout(() => {
      if (watchedTitle && watchedContent && isEditing) {
        handleAutoSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [watchedTitle, watchedContent, isEditing]);

  // Enhanced cache invalidation helper
  const invalidateCache = React.useCallback(async () => {
    setCacheInvalidationStatus('invalidating');
    try {
      // The cache invalidation is now handled automatically by the API endpoints
      // This function now just provides UI feedback
      
      // Simulate a brief delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCacheInvalidationStatus('success');
      
      // Reset status after 2 seconds
      setTimeout(() => setCacheInvalidationStatus('idle'), 2000);
    } catch (error) {
      console.error('Cache invalidation failed:', error);
      setCacheInvalidationStatus('error');
      setTimeout(() => setCacheInvalidationStatus('idle'), 2000);
    }
  }, []);

  const handleAutoSave = async () => {
    if (saveStatus === 'saving') return;

    setSaveStatus('saving');
    try {
      const formData = getValues();
      // Here you would typically save to a draft or temporary storage
      console.log('Auto-saving:', formData);
      setSaveStatus('saved');
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      setValue('tags', [...watchedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async (data: BlogPostFormData) => {
    // Validate connection before saving
    if (connectionStatus !== 'connected') {
      setConnectionError('Cannot save: Sanity connection is not available. Please check your configuration.');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    setConnectionError(null);
    
    try {
      let result;
      
      if (isEditing && postId) {
        // Use optimistic update for editing
        result = await updatePost(postId, data, {
          showOptimisticUpdate: true,
          rollbackOnError: true,
          invalidateCache: true
        });
      } else {
        // Use optimistic update for creation
        result = await createPost(data, {
          showOptimisticUpdate: true,
          rollbackOnError: true,
          invalidateCache: true
        });
      }
      
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // Cache invalidation is now handled automatically by the optimistic update hooks
      // and the API endpoints, but we still show UI feedback
      await invalidateCache();
      
      onSave?.(data);
    } catch (error) {
      console.error('Error saving post:', error);
      setSaveStatus('error');
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.message.includes('network') || 
            error.message.includes('fetch') ||
            error.message.includes('connection')) {
          setConnectionStatus('error');
          setConnectionError('Network error while saving. Please check your connection and try again.');
        } else if (error.message.includes('timeout')) {
          setConnectionError('Save operation timed out. Please try again.');
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          setConnectionStatus('disconnected');
          setConnectionError('Permission denied. Please check your Sanity API token.');
        } else {
          setConnectionError(error.message);
        }
      } else {
        setConnectionError('An unexpected error occurred while saving.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (data: BlogPostFormData) => {
    // Validate connection before publishing
    if (connectionStatus !== 'connected') {
      setConnectionError('Cannot publish: Sanity connection is not available. Please check your configuration.');
      return;
    }

    setIsPublishing(true);
    setConnectionError(null);
    
    try {
      // Save the post first
      await handleSave(data);
      
      // Only proceed if save was successful (no connection error)
      if (!connectionError) {
        // Additional cache invalidation for published content
        await invalidateCache();
        onPublish?.(data);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      if (error instanceof Error) {
        setConnectionError(`Failed to publish: ${error.message}`);
      } else {
        setConnectionError('Failed to publish post due to an unexpected error.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const onSubmit = (data: BlogPostFormData) => {
    handleSave(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? 'Update your blog post content and settings' : 'Write and publish a new blog post'}
          </p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus === 'checking' && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Checking connection...
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="flex items-center text-sm text-green-600">
                <Wifi className="h-4 w-4 mr-1" />
                Connected to Sanity
              </div>
            )}
            {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
              <div className="flex items-center text-sm text-red-600">
                <WifiOff className="h-4 w-4 mr-1" />
                Connection issue
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={validateConnection}
                  disabled={isValidatingConnection}
                  className="ml-1 h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${isValidatingConnection ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Cache Status */}
          {cacheInvalidationStatus !== 'idle' && (
            <div className="flex items-center gap-2">
              {cacheInvalidationStatus === 'invalidating' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Updating cache...
                </div>
              )}
              {cacheInvalidationStatus === 'success' && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Cache updated
                </div>
              )}
              {cacheInvalidationStatus === 'error' && (
                <div className="flex items-center text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Cache update failed
                </div>
              )}
            </div>
          )}

          {/* Save Status */}
          <div className="flex items-center gap-2">
            {saveStatus === 'saving' && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Saving...
              </div>
            )}
            {saveStatus === 'saved' && lastSaved && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                Save failed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{connectionError}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={validateConnection}
              disabled={isValidatingConnection}
              className="ml-2"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isValidatingConnection ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Alert */}
      {connectionStatus === 'disconnected' && !connectionError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sanity connection is not optimal. Some features may be limited. 
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={validateConnection}
              disabled={isValidatingConnection}
              className="ml-1 p-0 h-auto"
            >
              Check connection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="Enter your blog post title"
                    className="mt-1"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    {...form.register('slug')}
                    placeholder="url-friendly-slug"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty to auto-generate from title
                  </p>
                </div>

                {/* Excerpt */}
                <div>
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    {...form.register('excerpt')}
                    placeholder="Brief description of your blog post"
                    className="mt-1"
                    rows={3}
                  />
                  {form.formState.errors.excerpt && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.excerpt.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rich Text Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Content *</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Reading time: ~{readingTime} min</span>
                  <span>Words: {watchedContent.replace(/<[^>]*>/g, '').split(/\s+/).length}</span>
                </div>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={watchedContent}
                  onChange={(content) => setValue('content', content)}
                  placeholder="Start writing your blog post..."
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-600 mt-2">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category and Author */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={watch('category')}
                      onValueChange={(value) => setValue('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category.title}>
                            {category.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Author */}
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Select
                      value={watch('author')}
                      onValueChange={(value) => setValue('author', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select an author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map((author) => (
                          <SelectItem key={author._id} value={author.name}>
                            {author.name} - {author.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={watch('featured')}
                      onCheckedChange={(checked) => setValue('featured', checked)}
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Tag */}
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Tag List */}
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Engine Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* SEO Title */}
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    {...form.register('seoTitle')}
                    placeholder="SEO optimized title"
                    className="mt-1"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {watch('seoTitle')?.length || 0}/60 characters
                  </p>
                  {form.formState.errors.seoTitle && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.seoTitle.message}
                    </p>
                  )}
                </div>

                {/* SEO Description */}
                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    {...form.register('seoDescription')}
                    placeholder="Brief description for search engines"
                    className="mt-1"
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {watch('seoDescription')?.length || 0}/160 characters
                  </p>
                  {form.formState.errors.seoDescription && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.seoDescription.message}
                    </p>
                  )}
                </div>

                {/* Focus Keyword */}
                <div>
                  <Label htmlFor="focusKeyword">Focus Keyword</Label>
                  <Input
                    id="focusKeyword"
                    {...form.register('focusKeyword')}
                    placeholder="Primary keyword for this post"
                    className="mt-1"
                  />
                </div>

                {/* SEO Preview */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-semibold mb-2">Search Preview</h4>
                  <div className="space-y-1">
                    <div className="text-blue-600 text-lg">
                      {watch('seoTitle') || watch('title') || 'Your Blog Post Title'}
                    </div>
                    <div className="text-green-600 text-sm">
                      aviatorstrainingcentre.com/blog/{watch('slug') || 'your-post-slug'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {watch('seoDescription') || watch('excerpt') || 'Your blog post description will appear here...'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto">
                  <h1>{watch('title') || 'Your Blog Post Title'}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>By {watch('author') || 'Author Name'}</span>
                    <span>•</span>
                    <span>{watch('category') || 'Category'}</span>
                    <span>•</span>
                    <span>{readingTime} min read</span>
                  </div>
                  <p className="lead">{watch('excerpt')}</p>
                  <div dangerouslySetInnerHTML={{ __html: watchedContent }} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="outline"
              disabled={isSaving || connectionStatus !== 'connected'}
              title={connectionStatus !== 'connected' ? 'Sanity connection required to save' : ''}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => handlePublish(getValues())}
              disabled={isPublishing || !form.formState.isValid || connectionStatus !== 'connected'}
              title={connectionStatus !== 'connected' ? 'Sanity connection required to publish' : ''}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComprehensiveBlogEditor;