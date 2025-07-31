'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Eye,
  Loader2,
  FileText,
  Search,
  Tag,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { SimpleSEOValidator } from './SimpleSEOValidator';

interface SimpleBlogEditorProps {
  initialData?: Partial<BlogFormData>;
  onSave?: (data: BlogFormData) => Promise<void>;
  onPreview?: (data: BlogFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
}

const defaultFormData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  tags: [],
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
};

const categories = [
  'Aviation Training',
  'DGCA Exams',
  'Safety Tips',
  'Career Guidance',
  'Technical Knowledge',
  'Industry News',
  'Flight Training',
  'Ground School',
  'Regulations',
  'Equipment & Technology'
];

export function SimpleBlogEditor({ 
  initialData, 
  onSave, 
  onPreview, 
  loading = false, 
  mode = 'create' 
}: SimpleBlogEditorProps) {
  const [formData, setFormData] = useState<BlogFormData>(defaultFormData);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && mode === 'create') {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, mode]);

  // Calculate word count and reading time
  useEffect(() => {
    const words = formData.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200))); // Average reading speed: 200 words/minute
  }, [formData.content]);

  // Auto-generate SEO title and description
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoTitle: `${formData.title} | Aviators Training Centre`,
      }));
    }
    if (formData.excerpt && !formData.seoDescription) {
      setFormData(prev => ({
        ...prev,
        seoDescription: formData.excerpt.substring(0, 160),
      }));
    }
  }, [formData.title, formData.excerpt]);

  const handleInputChange = useCallback((field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.excerpt.trim()) {
      errors.excerpt = 'Excerpt is required';
    }

    if (formData.seoTitle.length > 60) {
      errors.seoTitle = 'SEO title should be under 60 characters';
    }

    if (formData.seoDescription.length > 160) {
      errors.seoDescription = 'SEO description should be under 160 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, onSave]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(formData);
    }
  }, [formData, onPreview]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {wordCount} words • {readingTime} min read
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!formData.title || !formData.content}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {mode === 'create' ? 'Create Post' : 'Update Post'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter blog post title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={validationErrors.title ? 'border-red-500' : ''}
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      placeholder="url-friendly-slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className={validationErrors.category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.category && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.category}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of the blog post..."
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      className={validationErrors.excerpt ? 'border-red-500' : ''}
                    />
                    {validationErrors.excerpt && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.excerpt}</p>
                    )}
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your blog content here using Markdown..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={20}
                      className={`font-mono ${validationErrors.content ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.content && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.content}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <SimpleSEOValidator
                title={formData.title}
                seoTitle={formData.seoTitle}
                seoDescription={formData.seoDescription}
                focusKeyword={formData.focusKeyword}
                slug={formData.slug}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      placeholder="SEO-optimized title..."
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      className={validationErrors.seoTitle ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.seoTitle.length}/60 characters
                    </p>
                    {validationErrors.seoTitle && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.seoTitle}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      placeholder="SEO meta description..."
                      value={formData.seoDescription}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      rows={3}
                      className={validationErrors.seoDescription ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.seoDescription.length}/160 characters
                    </p>
                    {validationErrors.seoDescription && (
                      <p className="text-sm text-red-600 mt-1">{validationErrors.seoDescription}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="focusKeyword">Focus Keyword</Label>
                    <Input
                      id="focusKeyword"
                      placeholder="Primary keyword for this post..."
                      value={formData.focusKeyword}
                      onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSave}
                disabled={isSaving || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {mode === 'create' ? 'Create Post' : 'Update Post'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                SEO Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>SEO Title</span>
                  <Badge variant={formData.seoTitle ? 'default' : 'destructive'}>
                    {formData.seoTitle ? 'Set' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>SEO Description</span>
                  <Badge variant={formData.seoDescription ? 'default' : 'destructive'}>
                    {formData.seoDescription ? 'Set' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Focus Keyword</span>
                  <Badge variant={formData.focusKeyword ? 'default' : 'destructive'}>
                    {formData.focusKeyword ? 'Set' : 'Missing'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
