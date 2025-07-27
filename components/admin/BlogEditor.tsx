'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Save,
  Eye,
  Upload,
  X,
  Plus,
  Loader2,
  FileText,
  Settings,
  Search,
  Tag,
  User,
  Calendar,
  Globe,
  Target,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { BlogPost, BlogCategory, Course } from '@/lib/types/blog';
import { SEOAnalyzer } from './SEOAnalyzer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ValidationSummary } from './ValidationSummary';

interface BlogEditorProps {
  initialData?: Partial<BlogPost>;
  categories?: BlogCategory[];
  courses?: Course[];
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
  author: {
    name: string;
    email?: string;
  };
  tags: string[];
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  contentType: 'tutorial' | 'guide' | 'news' | 'opinion' | 'case-study' | 'reference';
  publishedAt?: string;
  enableComments: boolean;
  enableSocialSharing: boolean;
  enableNewsletterSignup: boolean;
  seoEnhancement: {
    seoTitle: string;
    seoDescription: string;
    focusKeyword: string;
    additionalKeywords: string[];
  };
  ctaPlacements: Array<{
    position: 'top' | 'middle' | 'bottom';
    targetCourse?: string;
    customMessage?: string;
  }>;
  image?: {
    url: string;
    alt: string;
  };
}

// Ensure all form fields have proper default values to prevent uncontrolled input warnings
const defaultFormData: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  author: {
    name: 'Aviators Training Centre',
    email: 'admin@aviatorstrainingcentre.in',
  },
  tags: [],
  featured: false,
  difficulty: 'beginner',
  contentType: 'guide',
  enableComments: true,
  enableSocialSharing: true,
  enableNewsletterSignup: true,
  seoEnhancement: {
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
    additionalKeywords: [],
  },
  ctaPlacements: [],
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

const courses = [
  { id: 'technical-general', name: 'Technical General Ground School' },
  { id: 'technical-specific', name: 'Technical Specific Training' },
  { id: 'cpl-ground-school', name: 'CPL Ground School' },
  { id: 'atpl-ground-school', name: 'ATPL Ground School' },
  { id: 'type-rating', name: 'Type Rating Courses' },
];

export function BlogEditor({ 
  initialData, 
  onSave, 
  onPreview, 
  loading = false, 
  mode = 'create' 
}: BlogEditorProps) {
  // Initialize form data with proper defaults to prevent uncontrolled input warnings
  const [formData, setFormData] = useState<BlogFormData>(() => {
    if (initialData) {
      return {
        ...defaultFormData,
        ...initialData,
        // Ensure all fields have proper values, never undefined
        title: initialData.title || '',
        slug: initialData.slug || '',
        excerpt: initialData.excerpt || '',
        content: initialData.content || '',
        category: initialData.category || '',
        author: {
          name: initialData.author?.name || 'Aviators Training Centre',
          email: initialData.author?.email || 'admin@aviatorstrainingcentre.in',
        },
        tags: initialData.tags || [],
        featured: initialData.featured || false,
        difficulty: initialData.difficulty || 'beginner',
        contentType: initialData.contentType || 'guide',
        enableComments: initialData.enableComments !== undefined ? initialData.enableComments : true,
        enableSocialSharing: initialData.enableSocialSharing !== undefined ? initialData.enableSocialSharing : true,
        enableNewsletterSignup: initialData.enableNewsletterSignup !== undefined ? initialData.enableNewsletterSignup : true,
        seoEnhancement: {
          seoTitle: initialData.seoEnhancement?.seoTitle || '',
          seoDescription: initialData.seoEnhancement?.seoDescription || '',
          focusKeyword: initialData.seoEnhancement?.focusKeyword || '',
          additionalKeywords: initialData.seoEnhancement?.additionalKeywords || [],
        },
        ctaPlacements: initialData.ctaPlacements || [],
      };
    }
    return defaultFormData;
  });
  
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

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
        author: {
          name: initialData.author?.name || 'Aviators Training Centre',
          email: initialData.author?.email || 'admin@aviatorstrainingcentre.in',
        },
        tags: initialData.tags || [],
        featured: initialData.featured || false,
        difficulty: initialData.difficulty || 'beginner',
        contentType: initialData.contentType || 'guide',
        enableComments: initialData.enableComments !== undefined ? initialData.enableComments : true,
        enableSocialSharing: initialData.enableSocialSharing !== undefined ? initialData.enableSocialSharing : true,
        enableNewsletterSignup: initialData.enableNewsletterSignup !== undefined ? initialData.enableNewsletterSignup : true,
        seoEnhancement: {
          seoTitle: initialData.seoEnhancement?.seoTitle || '',
          seoDescription: initialData.seoEnhancement?.seoDescription || '',
          focusKeyword: initialData.seoEnhancement?.focusKeyword || '',
          additionalKeywords: initialData.seoEnhancement?.additionalKeywords || [],
        },
        ctaPlacements: initialData.ctaPlacements || [],
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
    if (formData.title && !formData.seoEnhancement.seoTitle) {
      setFormData(prev => ({
        ...prev,
        seoEnhancement: {
          ...prev.seoEnhancement,
          seoTitle: `${formData.title} | Aviators Training Centre`,
        },
      }));
    }
    if (formData.excerpt && !formData.seoEnhancement.seoDescription) {
      setFormData(prev => ({
        ...prev,
        seoEnhancement: {
          ...prev.seoEnhancement,
          seoDescription: formData.excerpt.substring(0, 160),
        },
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

  const handleNestedInputChange = useCallback((
    parentField: keyof BlogFormData,
    childField: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField] as any,
        [childField]: value,
      },
    }));
  }, []);

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

  const handleAddKeyword = useCallback(() => {
    if (keywordInput.trim() && !formData.seoEnhancement.additionalKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoEnhancement: {
          ...prev.seoEnhancement,
          additionalKeywords: [...prev.seoEnhancement.additionalKeywords, keywordInput.trim()],
        },
      }));
      setKeywordInput('');
    }
  }, [keywordInput, formData.seoEnhancement.additionalKeywords]);

  const handleRemoveKeyword = useCallback((keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoEnhancement: {
        ...prev.seoEnhancement,
        additionalKeywords: prev.seoEnhancement.additionalKeywords.filter(keyword => keyword !== keywordToRemove),
      },
    }));
  }, []);

  const handleAddCTAPlacement = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ctaPlacements: [
        ...prev.ctaPlacements,
        {
          position: 'middle' as const,
          targetCourse: '',
          customMessage: '',
        },
      ],
    }));
  }, []);

  const handleRemoveCTAPlacement = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      ctaPlacements: prev.ctaPlacements.filter((_, i) => i !== index),
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

    if (formData.seoEnhancement.seoTitle.length > 60) {
      errors.seoTitle = 'SEO title should be under 60 characters';
    }

    if (formData.seoEnhancement.seoDescription.length > 160) {
      errors.seoDescription = 'SEO description should be under 160 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      // Show specific validation error count instead of generic message
      const errorCount = Object.keys(validationErrors).length;
      toast.error(`Please fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} before saving`);
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
        // Single success notification
        toast.success(`Blog post ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      // Single error notification with more specific message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} blog post: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validateForm, onSave, mode, validationErrors]);

  const handlePreview = useCallback(() => {
    if (onPreview) {
      onPreview(formData);
    }
  }, [formData, onPreview]);

  const getSEOScore = useCallback((): { score: number; issues: string[] } => {
    const issues: string[] = [];
    let score = 100;

    if (!formData.seoEnhancement.seoTitle) {
      issues.push('Missing SEO title');
      score -= 20;
    } else if (formData.seoEnhancement.seoTitle.length > 60) {
      issues.push('SEO title too long');
      score -= 10;
    }

    if (!formData.seoEnhancement.seoDescription) {
      issues.push('Missing SEO description');
      score -= 20;
    } else if (formData.seoEnhancement.seoDescription.length > 160) {
      issues.push('SEO description too long');
      score -= 10;
    }

    if (!formData.seoEnhancement.focusKeyword) {
      issues.push('Missing focus keyword');
      score -= 15;
    }

    if (formData.content.length < 300) {
      issues.push('Content too short (minimum 300 words recommended)');
      score -= 15;
    }

    if (formData.tags.length === 0) {
      issues.push('No tags added');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  }, [formData]);

  const seoAnalysis = getSEOScore();

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

      {/* Validation Summary */}
      <ValidationSummary errors={validationErrors} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="content" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="cta">CTAs</TabsTrigger>
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
              <SEOAnalyzer
                content={{
                  title: formData.title,
                  excerpt: formData.excerpt,
                  content: formData.content,
                  focusKeyword: formData.seoEnhancement.focusKeyword,
                  additionalKeywords: formData.seoEnhancement.additionalKeywords,
                  seoTitle: formData.seoEnhancement.seoTitle,
                  seoDescription: formData.seoEnhancement.seoDescription,
                  slug: formData.slug,
                  category: formData.category,
                  tags: formData.tags,
                }}
                onSuggestionApply={(field, value) => {
                  if (field.startsWith('seoEnhancement.')) {
                    const seoField = field.replace('seoEnhancement.', '');
                    handleNestedInputChange('seoEnhancement', seoField, value);
                  } else {
                    handleInputChange(field as keyof BlogFormData, value);
                  }
                }}
                realTime={true}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    SEO Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      placeholder="SEO-optimized title..."
                      value={formData.seoEnhancement.seoTitle}
                      onChange={(e) => handleNestedInputChange('seoEnhancement', 'seoTitle', e.target.value)}
                      className={validationErrors.seoTitle ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.seoEnhancement.seoTitle.length}/60 characters
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
                      value={formData.seoEnhancement.seoDescription}
                      onChange={(e) => handleNestedInputChange('seoEnhancement', 'seoDescription', e.target.value)}
                      rows={3}
                      className={validationErrors.seoDescription ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.seoEnhancement.seoDescription.length}/160 characters
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
                      value={formData.seoEnhancement.focusKeyword}
                      onChange={(e) => handleNestedInputChange('seoEnhancement', 'focusKeyword', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Additional Keywords</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Add keyword..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      />
                      <Button type="button" onClick={handleAddKeyword} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.seoEnhancement.additionalKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.seoEnhancement.additionalKeywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                            {keyword}
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyword(keyword)}
                              className="hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CTA Tab */}
            <TabsContent value="cta" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Call-to-Action Placements
                  </CardTitle>
                  <CardDescription>
                    Configure strategic CTA placements to drive course enrollments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.ctaPlacements.map((cta, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">CTA Placement {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCTAPlacement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Position</Label>
                          <Select
                            value={cta.position}
                            onValueChange={(value) => {
                              const newPlacements = [...formData.ctaPlacements];
                              newPlacements[index].position = value as 'top' | 'middle' | 'bottom';
                              handleInputChange('ctaPlacements', newPlacements);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Top of Post</SelectItem>
                              <SelectItem value="middle">Middle of Post</SelectItem>
                              <SelectItem value="bottom">Bottom of Post</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Target Course</Label>
                          <Select
                            value={cta.targetCourse}
                            onValueChange={(value) => {
                              const newPlacements = [...formData.ctaPlacements];
                              newPlacements[index].targetCourse = value;
                              handleInputChange('ctaPlacements', newPlacements);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Custom Message (Optional)</Label>
                        <Input
                          placeholder="Custom CTA message..."
                          value={cta.customMessage}
                          onChange={(e) => {
                            const newPlacements = [...formData.ctaPlacements];
                            newPlacements[index].customMessage = e.target.value;
                            handleInputChange('ctaPlacements', newPlacements);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddCTAPlacement}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add CTA Placement
                  </Button>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Difficulty Level</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => handleInputChange('difficulty', value)}
                      >
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
                    
                    <div>
                      <Label>Content Type</Label>
                      <Select
                        value={formData.contentType}
                        onValueChange={(value) => handleInputChange('contentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="guide">Guide</SelectItem>
                          <SelectItem value="news">News</SelectItem>
                          <SelectItem value="opinion">Opinion</SelectItem>
                          <SelectItem value="case-study">Case Study</SelectItem>
                          <SelectItem value="reference">Reference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium">Engagement Features</h4>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Comments</Label>
                        <p className="text-sm text-slate-500">Allow readers to comment on this post</p>
                      </div>
                      <Switch
                        checked={formData.enableComments}
                        onCheckedChange={(checked) => handleInputChange('enableComments', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Social Sharing</Label>
                        <p className="text-sm text-slate-500">Show social sharing buttons</p>
                      </div>
                      <Switch
                        checked={formData.enableSocialSharing}
                        onCheckedChange={(checked) => handleInputChange('enableSocialSharing', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Newsletter Signup</Label>
                        <p className="text-sm text-slate-500">Show newsletter signup form</p>
                      </div>
                      <Switch
                        checked={formData.enableNewsletterSignup}
                        onCheckedChange={(checked) => handleInputChange('enableNewsletterSignup', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Publish Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured Post</Label>
                  <p className="text-sm text-slate-500">Highlight this post</p>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>
              
              <div>
                <Label>Publish Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
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
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Author
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.author.name}
                  onChange={(e) => handleNestedInputChange('author', 'name', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.author.email}
                  onChange={(e) => handleNestedInputChange('author', 'email', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SEO Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge 
                    variant={seoAnalysis.score >= 80 ? 'default' : seoAnalysis.score >= 60 ? 'secondary' : 'destructive'}
                  >
                    {seoAnalysis.score}/100
                  </Badge>
                </div>
                
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      seoAnalysis.score >= 80 
                        ? 'bg-green-600' 
                        : seoAnalysis.score >= 60 
                        ? 'bg-yellow-600' 
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${seoAnalysis.score}%` }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Content length: {wordCount} words</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span>Reading time: {readingTime} min</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}