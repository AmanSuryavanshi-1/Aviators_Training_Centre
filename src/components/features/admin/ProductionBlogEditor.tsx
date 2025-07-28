"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Eye, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  FileText,
  Tag,
  User,
  Calendar,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { enhancedClient } from '@/lib/sanity/client';
import { ProductionBlogAPI } from '@/lib/blog/production-blog-system';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  tags: string[];
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const ProductionBlogEditor: React.FC<{
  postId?: string;
  onSave?: (postData: any) => void;
  onCancel?: () => void;
}> = ({ postId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    tags: [],
    featured: false,
    difficulty: 'beginner',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: ''
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');

  // Load categories and authors
  useEffect(() => {
    loadCategoriesAndAuthors();
    if (postId) {
      loadPost(postId);
    }
  }, [postId]);

  const loadCategoriesAndAuthors = async () => {
    try {
      // Load categories
      const categoriesData = ProductionBlogAPI.getAllCategories();
      setCategories(categoriesData);

      // Load authors (mock data for now)
      const authorsData = [
        {
          _id: 'aman-suryavanshi',
          name: 'Aman Suryavanshi',
          role: 'Chief Flight Instructor'
        },
        {
          _id: 'dr-priya-sharma',
          name: 'Dr. Priya Sharma',
          role: 'Aviation Medical Examiner'
        },
        {
          _id: 'capt-rajesh-kumar',
          name: 'Capt. Rajesh Kumar',
          role: 'Senior Airline Captain'
        }
      ];
      setAuthors(authorsData);
    } catch (error) {
      console.error('Error loading categories and authors:', error);
    }
  };

  const loadPost = async (id: string) => {
    setIsLoading(true);
    try {
      // Try to load from Sanity first, then fallback to production data
      let post = null;
      
      try {
        post = await enhancedClient.fetch(
          `*[_type == "post" && _id == $id][0]{
            title,
            slug,
            excerpt,
            body,
            category->{_id, title},
            author->{_id, name},
            tags,
            featured,
            difficulty,
            seoTitle,
            seoDescription,
            focusKeyword
          }`,
          { id }
        );
      } catch (sanityError) {
        console.warn('Could not load from Sanity, using production data');
        post = ProductionBlogAPI.getPostBySlug(id);
      }

      if (post) {
        setFormData({
          title: post.title || '',
          slug: post.slug?.current || '',
          excerpt: post.excerpt || '',
          content: extractContentFromBody(post.body) || '',
          category: post.category?._id || '',
          author: post.author?._id || '',
          tags: post.tags || [],
          featured: post.featured || false,
          difficulty: post.difficulty || 'beginner',
          seoTitle: post.seoTitle || post.title || '',
          seoDescription: post.seoDescription || post.excerpt || '',
          focusKeyword: post.focusKeyword || ''
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const extractContentFromBody = (body: any[]): string => {
    if (!Array.isArray(body)) return '';
    
    return body
      .filter(block => block._type === 'block')
      .map(block => {
        if (block.children && Array.isArray(block.children)) {
          return block.children
            .filter((child: any) => child._type === 'span')
            .map((child: any) => child.text || '')
            .join('');
        }
        return '';
      })
      .join('\n\n');
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && value) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }

    // Auto-generate SEO title if not manually set
    if (field === 'title' && value && !formData.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoTitle: value
      }));
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      errors.title = 'Title must be at least 10 characters';
    } else if (formData.title.length > 80) {
      errors.title = 'Title must be less than 80 characters';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length < 120) {
      errors.excerpt = 'Excerpt must be at least 120 characters';
    } else if (formData.excerpt.length > 160) {
      errors.excerpt = 'Excerpt must be less than 160 characters';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.length < 100) {
      errors.content = 'Content must be at least 100 characters';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.author) {
      errors.author = 'Author is required';
    }

    if (formData.seoTitle && formData.seoTitle.length > 60) {
      errors.seoTitle = 'SEO title must be less than 60 characters';
    }

    if (formData.seoDescription && formData.seoDescription.length > 160) {
      errors.seoDescription = 'SEO description must be less than 160 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const convertToPortableText = (content: string): any[] => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => ({
      _type: 'block',
      _key: `block-${index}`,
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: `span-${index}`,
          text: paragraph.trim(),
          marks: []
        }
      ]
    }));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const postData = {
        _type: 'post',
        title: formData.title,
        slug: { current: formData.slug },
        excerpt: formData.excerpt,
        body: convertToPortableText(formData.content),
        publishedAt: new Date().toISOString(),
        featured: formData.featured,
        readingTime: Math.max(1, Math.ceil(formData.content.split(' ').length / 200)),
        category: { _type: 'reference', _ref: formData.category },
        author: { _type: 'reference', _ref: formData.author },
        tags: formData.tags,
        difficulty: formData.difficulty,
        contentType: 'guide',
        workflowStatus: 'published',
        enableComments: true,
        enableSocialSharing: true,
        enableNewsletterSignup: true,
        
        // SEO fields
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
        focusKeyword: formData.focusKeyword,
        
        // Structured data
        structuredData: {
          articleType: 'EducationalArticle',
          learningResourceType: 'Guide',
          educationalLevel: formData.difficulty,
          timeRequired: `PT${Math.max(1, Math.ceil(formData.content.split(' ').length / 200))}M`
        },
        
        // Performance metrics
        performanceMetrics: {
          estimatedReadingTime: Math.max(1, Math.ceil(formData.content.split(' ').length / 200)),
          wordCount: formData.content.split(' ').length,
          lastSEOCheck: new Date().toISOString(),
          seoScore: 85
        },
        
        // Content validation
        contentValidation: {
          hasRequiredFields: true,
          hasValidSEO: true,
          hasValidImages: false, // No image upload in this version
          readyForPublish: true
        }
      };

      let result;
      if (postId) {
        // Update existing post
        result = await enhancedClient
          .patch(postId)
          .set(postData)
          .commit();
      } else {
        // Create new post
        result = await enhancedClient.create(postData);
      }

      setSaveStatus('success');
      
      if (onSave) {
        onSave(result);
      }

      // Reset form if creating new post
      if (!postId) {
        setFormData({
          title: '',
          slug: '',
          excerpt: '',
          content: '',
          category: '',
          author: '',
          tags: [],
          featured: false,
          difficulty: 'beginner',
          seoTitle: '',
          seoDescription: '',
          focusKeyword: ''
        });
      }

    } catch (error) {
      console.error('Error saving post:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (formData.slug) {
      const previewUrl = `/blog/${formData.slug}?preview=true`;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading post...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {postId ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-muted-foreground">
            {postId ? 'Update your blog post content and settings' : 'Create a new blog post for your aviation training website'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {formData.slug && (
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {postId ? 'Update' : 'Publish'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Blog post {postId ? 'updated' : 'published'} successfully!
          </AlertDescription>
        </Alert>
      )}

      {saveStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {Object.keys(validationErrors).length > 0 
              ? 'Please fix the validation errors below.'
              : 'An error occurred while saving the post. Please try again.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Tag className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Upload className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter blog post title..."
                  className={validationErrors.title ? 'border-red-500' : ''}
                />
                {validationErrors.title && (
                  <p className="text-sm text-red-600">{validationErrors.title}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/80 characters
                </p>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="url-friendly-slug"
                  className={validationErrors.slug ? 'border-red-500' : ''}
                />
                {validationErrors.slug && (
                  <p className="text-sm text-red-600">{validationErrors.slug}</p>
                )}
                {formData.slug && (
                  <p className="text-xs text-muted-foreground">
                    URL: /blog/{formData.slug}
                  </p>
                )}
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief summary of the blog post..."
                  rows={3}
                  className={validationErrors.excerpt ? 'border-red-500' : ''}
                />
                {validationErrors.excerpt && (
                  <p className="text-sm text-red-600">{validationErrors.excerpt}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.excerpt.length}/160 characters (appears in search results)
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={15}
                  className={validationErrors.content ? 'border-red-500' : ''}
                />
                {validationErrors.content && (
                  <p className="text-sm text-red-600">{validationErrors.content}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.content.split(' ').length} words • 
                  {Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min read
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.category && (
                  <p className="text-sm text-red-600">{validationErrors.category}</p>
                )}
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Select value={formData.author} onValueChange={(value) => handleInputChange('author', value)}>
                  <SelectTrigger className={validationErrors.author ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select an author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author._id} value={author._id}>
                        {author.name} - {author.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.author && (
                  <p className="text-sm text-red-600">{validationErrors.author}</p>
                )}
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={formData.difficulty} onValueChange={(value: any) => handleInputChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SEO Title */}
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="Optimized title for search engines..."
                  className={validationErrors.seoTitle ? 'border-red-500' : ''}
                />
                {validationErrors.seoTitle && (
                  <p className="text-sm text-red-600">{validationErrors.seoTitle}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              {/* SEO Description */}
              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Meta description for search results..."
                  rows={2}
                  className={validationErrors.seoDescription ? 'border-red-500' : ''}
                />
                {validationErrors.seoDescription && (
                  <p className="text-sm text-red-600">{validationErrors.seoDescription}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              {/* Focus Keyword */}
              <div className="space-y-2">
                <Label htmlFor="focusKeyword">Focus Keyword</Label>
                <Input
                  id="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                  placeholder="Primary keyword for SEO..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionBlogEditor;