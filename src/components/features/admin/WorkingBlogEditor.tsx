'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Eye, X, Plus, Loader2, FileText, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkingBlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
}

// Ensure all form fields have proper default values to prevent uncontrolled input warnings
const defaultFormData: WorkingBlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  author: 'ATC Instructor',
  tags: [],
  featured: false,
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
};

const categories = [
  'DGCA Exam Preparation',
  'Aviation Training',
  'Career Guidance',
  'Technical Knowledge',
  'Safety Tips',
  'Industry News',
  'Flight Training',
  'Ground School',
  'Regulations',
  'Equipment & Technology'
];

interface WorkingBlogEditorProps {
  initialData?: Partial<WorkingBlogFormData>;
  onSave?: (data: WorkingBlogFormData) => Promise<void>;
  onPreview?: (data: WorkingBlogFormData) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

export function WorkingBlogEditor({ 
  initialData, 
  onSave, 
  onPreview, 
  loading = false, 
  mode = 'create' 
}: WorkingBlogEditorProps) {
  // Initialize form data with proper defaults to prevent uncontrolled input warnings
  const [formData, setFormData] = useState<WorkingBlogFormData>(() => {
    if (initialData) {
      return {
        ...defaultFormData,
        ...initialData,
        // Ensure all fields have string values, never undefined
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || '',
        author: initialData.author || 'ATC Instructor',
        tags: Array.isArray(initialData.tags) ? initialData.tags : [],
        featured: Boolean(initialData.featured),
        seoTitle: initialData.seoTitle || '',
        seoDescription: initialData.seoDescription || '',
        focusKeyword: initialData.focusKeyword || '',
      };
    }
    return defaultFormData;
  });
  
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...defaultFormData,
        ...initialData,
        // Ensure all fields have proper values, never undefined
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || '',
        author: initialData.author || 'ATC Instructor',
        tags: initialData.tags || [],
        featured: initialData.featured || false,
        seoTitle: initialData.seoTitle || '',
        seoDescription: initialData.seoDescription || '',
        focusKeyword: initialData.focusKeyword || '',
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
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  }, [formData.content]);

  // Auto-generate SEO fields
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

  const handleInputChange = useCallback((field: keyof WorkingBlogFormData, value: any) => {
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

    // Required field validation with clear error messages
    if (!formData.title?.trim()) {
      errors.title = 'Title is required and cannot be empty';
    } else if (formData.title.length < 10) {
      errors.title = 'Title must be at least 10 characters long (Sanity requirement)';
    } else if (formData.title.length > 80) {
      errors.title = 'Title must be less than 80 characters (Sanity requirement)';
    }

    if (!formData.content?.trim()) {
      errors.content = 'Content is required and cannot be empty';
    } else if (formData.content.length < 100) {
      errors.content = 'Content must be at least 100 characters long for a meaningful blog post';
    }

    if (!formData.category) {
      errors.category = 'Please select a category (required by Sanity schema)';
    }

    if (!formData.excerpt?.trim()) {
      errors.excerpt = 'Excerpt is required and cannot be empty';
    } else if (formData.excerpt.length < 120) {
      errors.excerpt = 'Excerpt must be at least 120 characters long (Sanity requirement)';
    } else if (formData.excerpt.length > 160) {
      errors.excerpt = 'Excerpt must be less than 160 characters (Sanity requirement)';
    }

    // SEO validation with helpful messages
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      errors.seoTitle = 'SEO title should be under 60 characters for optimal search results';
    }

    if (formData.seoDescription && formData.seoDescription.length > 160) {
      errors.seoDescription = 'SEO description should be under 160 characters for optimal search results';
    }

    // Author validation
    if (!formData.author?.trim()) {
      errors.author = 'Author name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      // Show specific validation error instead of generic message
      const errorCount = Object.keys(validationErrors).length;
      toast.error(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} before saving`);
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
        // Success notification will be handled by the parent component
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      // Error notification will be handled by the parent component
      throw error; // Re-throw to let parent handle it
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, onSave, validationErrors]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(formData);
    } else {
      // Default preview behavior - toggle sidebar
      setShowPreview(!showPreview);
    }
  }, [formData, onPreview, showPreview]);

  const getValidationStatus = () => {
    const requiredFields = ['title', 'content', 'category', 'excerpt'];
    const completedFields = requiredFields.filter(field => {
      const value = formData[field as keyof WorkingBlogFormData];
      return value && String(value).trim().length > 0;
    });
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      isValid: Object.keys(validationErrors).length === 0 && completedFields.length === requiredFields.length
    };
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>{wordCount} words • {readingTime} min read</span>
            <div className="flex items-center gap-2">
              {validationStatus.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <span>
                {validationStatus.completed}/{validationStatus.total} required fields completed
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={!formData.title || !formData.content}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || loading || !validationStatus.isValid}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
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

      {/* Global Validation Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-2">
              Please fix {Object.keys(validationErrors).length} validation error{Object.keys(validationErrors).length > 1 ? 's' : ''}:
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field}>
                  <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Main Editor */}
        <div className="space-y-6">
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
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
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title * <span className="text-xs text-slate-500">(10-80 characters)</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter blog post title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={validationErrors.title ? 'border-red-500 focus:border-red-500' : ''}
                      aria-invalid={!!validationErrors.title}
                      aria-describedby={validationErrors.title ? 'title-error' : undefined}
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{formData.title.length}/80 characters</span>
                      {formData.title.length >= 10 && formData.title.length <= 80 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {validationErrors.title && (
                      <div id="title-error" className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.title}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium">
                      URL Slug
                    </Label>
                    <Input
                      id="slug"
                      placeholder="url-friendly-slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      Auto-generated from title. You can customize it if needed.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt" className="text-sm font-medium">
                      Excerpt * <span className="text-xs text-slate-500">(120-160 characters)</span>
                    </Label>
                    <Textarea
                      id="excerpt"
                      placeholder="Brief description of the blog post..."
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      className={validationErrors.excerpt ? 'border-red-500 focus:border-red-500' : ''}
                      aria-invalid={!!validationErrors.excerpt}
                      aria-describedby={validationErrors.excerpt ? 'excerpt-error' : undefined}
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{formData.excerpt.length}/160 characters</span>
                      {formData.excerpt.length >= 120 && formData.excerpt.length <= 160 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {validationErrors.excerpt && (
                      <div id="excerpt-error" className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.excerpt}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">
                      Content * <span className="text-xs text-slate-500">(minimum 100 characters)</span>
                    </Label>
                    <Textarea
                      id="content"
                      placeholder="Write your blog content here..."
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={20}
                      className={`font-mono ${validationErrors.content ? 'border-red-500 focus:border-red-500' : ''}`}
                      aria-invalid={!!validationErrors.content}
                      aria-describedby={validationErrors.content ? 'content-error' : undefined}
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{wordCount} words • {readingTime} min read</span>
                      {formData.content.length >= 100 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {validationErrors.content && (
                      <div id="content-error" className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.content}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="seoTitle" className="text-sm font-medium">
                      SEO Title <span className="text-xs text-slate-500">(recommended: under 60 characters)</span>
                    </Label>
                    <Input
                      id="seoTitle"
                      placeholder="SEO-optimized title..."
                      value={formData.seoTitle}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      className={validationErrors.seoTitle ? 'border-red-500 focus:border-red-500' : ''}
                      aria-invalid={!!validationErrors.seoTitle}
                      aria-describedby={validationErrors.seoTitle ? 'seo-title-error' : undefined}
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{formData.seoTitle.length}/60 characters</span>
                      {formData.seoTitle.length > 0 && formData.seoTitle.length <= 60 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {validationErrors.seoTitle && (
                      <div id="seo-title-error" className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.seoTitle}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seoDescription" className="text-sm font-medium">
                      SEO Description <span className="text-xs text-slate-500">(recommended: under 160 characters)</span>
                    </Label>
                    <Textarea
                      id="seoDescription"
                      placeholder="SEO meta description..."
                      value={formData.seoDescription}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      rows={3}
                      className={validationErrors.seoDescription ? 'border-red-500 focus:border-red-500' : ''}
                      aria-invalid={!!validationErrors.seoDescription}
                      aria-describedby={validationErrors.seoDescription ? 'seo-description-error' : undefined}
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>{formData.seoDescription.length}/160 characters</span>
                      {formData.seoDescription.length > 0 && formData.seoDescription.length <= 160 && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {validationErrors.seoDescription && (
                      <div id="seo-description-error" className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.seoDescription}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="focusKeyword" className="text-sm font-medium">
                      Focus Keyword
                    </Label>
                    <Input
                      id="focusKeyword"
                      placeholder="Primary keyword for this post..."
                      value={formData.focusKeyword}
                      onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                    />
                    <p className="text-xs text-slate-500">
                      This keyword will be used for SEO optimization and content analysis.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Post Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger 
                          className={validationErrors.category ? 'border-red-500 focus:border-red-500' : ''}
                          aria-invalid={!!validationErrors.category}
                        >
                          <SelectValue placeholder="Select category" />
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
                        <div className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.category}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="author" className="text-sm font-medium">
                        Author *
                      </Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        className={validationErrors.author ? 'border-red-500 focus:border-red-500' : ''}
                        aria-invalid={!!validationErrors.author}
                        aria-describedby={validationErrors.author ? 'author-error' : undefined}
                      />
                      {validationErrors.author && (
                        <div id="author-error" className="flex items-center gap-1 text-sm text-red-600">
                          <AlertCircle className="h-4 w-4" />
                          {validationErrors.author}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:text-red-600 ml-1"
                              aria-label={`Remove ${tag} tag`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      Press Enter or click the + button to add tags
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Featured Post</Label>
                      <p className="text-sm text-slate-500">Show this post prominently on the blog page</p>
                    </div>
                    <Switch
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        {showPreview && (
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                  {/* Blog Post Preview */}
                  <div className="border rounded-lg p-4 bg-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">
                      {formData.title || 'Untitled Post'}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Author:</span>
                        <span>{formData.author || 'Unknown'}</span>
                      </div>
                      
                      {formData.category && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Category:</span>
                          <Badge variant="secondary" className="text-xs">
                            {formData.category}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Reading Time:</span>
                        <span>{readingTime} min</span>
                      </div>
                      
                      {formData.featured && (
                        <Badge variant="default" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.excerpt && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                        <p className="text-blue-800 font-medium text-sm mb-1">Excerpt:</p>
                        <p className="text-blue-700 text-sm leading-relaxed">
                          {formData.excerpt}
                        </p>
                      </div>
                    )}
                    
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                        {formData.content || (
                          <span className="text-slate-400 italic">
                            Start writing your content to see the preview...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* SEO Preview */}
                  {(formData.seoTitle || formData.seoDescription || formData.focusKeyword) && (
                    <div className="border rounded-lg p-4 bg-yellow-50">
                      <h3 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        SEO Preview
                      </h3>
                      
                      {formData.seoTitle && (
                        <div className="mb-2">
                          <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                            {formData.seoTitle}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-green-700 text-sm mb-1">
                        aviatorstrainingcentre.com/blog/{formData.slug || 'untitled'}
                      </div>
                      
                      {formData.seoDescription && (
                        <div className="text-slate-600 text-sm leading-relaxed">
                          {formData.seoDescription}
                        </div>
                      )}
                      
                      {formData.focusKeyword && (
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <div className="text-xs text-yellow-700">
                            <span className="font-medium">Focus Keyword:</span> {formData.focusKeyword}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Validation Status */}
                  <div className="border rounded-lg p-4 bg-slate-50">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Validation Status</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Required Fields</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{validationStatus.completed}/{validationStatus.total}</span>
                          {validationStatus.completed === validationStatus.total ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Validation Errors</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{Object.keys(validationErrors).length}</span>
                          {Object.keys(validationErrors).length === 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Ready to Publish</span>
                        {validationStatus.isValid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
