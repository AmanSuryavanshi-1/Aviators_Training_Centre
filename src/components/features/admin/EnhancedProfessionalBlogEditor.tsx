'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Hash, 
  Calendar,
  User,
  Tag,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  featuredImage?: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  status: 'draft' | 'review' | 'published';
  featured: boolean;
}

interface EnhancedProfessionalBlogEditorProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => Promise<void>;
  onPreview: (post: BlogPost) => void;
  categories: string[];
  authors: string[];
}

const initialPost: BlogPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: '',
  category: '',
  tags: [],
  publishedAt: new Date().toISOString().split('T')[0],
  readingTime: 5,
  seoTitle: '',
  seoDescription: '',
  focusKeyword: '',
  status: 'draft',
  featured: false,
};

export default function EnhancedProfessionalBlogEditor({
  post,
  onSave,
  onPreview,
  categories = ['DGCA Exam Preparation', 'Pilot Training', 'Aviation Career', 'Flight Training'],
  authors = ['ATC Instructor', 'Aviation Expert', 'Chief Flight Instructor']
}: EnhancedProfessionalBlogEditorProps) {
  const [formData, setFormData] = useState<BlogPost>(post || initialPost);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [contentSections, setContentSections] = useState<string[]>(['']);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !post?.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, post?.slug]);

  // Auto-generate SEO title from title
  useEffect(() => {
    if (formData.title && !formData.seoTitle) {
      setFormData(prev => ({ 
        ...prev, 
        seoTitle: formData.title.length > 60 ? formData.title.substring(0, 57) + '...' : formData.title 
      }));
    }
  }, [formData.title, formData.seoTitle]);

  // Estimate reading time
  useEffect(() => {
    const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    setFormData(prev => ({ ...prev, readingTime }));
  }, [formData.content]);

  const handleInputChange = (field: keyof BlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    const errors: string[] = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.excerpt.trim()) errors.push('Excerpt is required');
    if (!formData.content.trim()) errors.push('Content is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.author) errors.push('Author is required');
    if (formData.excerpt.length < 120) errors.push('Excerpt should be at least 120 characters');
    if (formData.seoDescription.length > 160) errors.push('SEO description should be under 160 characters');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  const addContentSection = () => {
    setContentSections(prev => [...prev, '']);
  };

  const updateContentSection = (index: number, value: string) => {
    const newSections = [...contentSections];
    newSections[index] = value;
    setContentSections(newSections);
    
    // Update main content
    const fullContent = newSections.join('\n\n');
    handleInputChange('content', fullContent);
  };

  const removeContentSection = (index: number) => {
    const newSections = contentSections.filter((_, i) => i !== index);
    setContentSections(newSections);
    
    // Update main content
    const fullContent = newSections.join('\n\n');
    handleInputChange('content', fullContent);
  };

  // Enhanced content templates
  const insertTemplate = (template: string) => {
    const templates = {
      heading: '## Your Heading Here\n\n',
      subheading: '### Your Subheading Here\n\n',
      paragraph: 'Your paragraph content goes here. Make sure to provide valuable, detailed information that helps your readers understand the topic better.\n\n',
      list: '- First important point\n- Second key insight\n- Third valuable tip\n\n',
      quote: '> "This is an important quote or insight that adds credibility to your content."\n\n',
      cta: '**Ready to take the next step?** [Contact our aviation experts](/contact) for personalized guidance on your pilot training journey.\n\n',
      faq: '### Frequently Asked Question?\n\nDetailed answer that provides clear, actionable information to help readers understand this important aspect.\n\n'
    };
    
    const currentContent = formData.content;
    const newContent = currentContent + templates[template as keyof typeof templates];
    handleInputChange('content', newContent);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {post ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create professional, SEO-optimized aviation content
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Post
          </Button>
        </div>
      </motion.div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertCircle className="w-5 h-5" />
            Please fix the following issues:
          </div>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          <TabsTrigger value="media">Media & Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter compelling blog post title..."
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.title.length}/80 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Write a compelling excerpt that summarizes your post..."
                      rows={3}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.excerpt.length}/160 characters (recommended: 120-160)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Content Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Content Editor
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate('heading')}
                    >
                      + Heading
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate('paragraph')}
                    >
                      + Paragraph
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate('list')}
                    >
                      + List
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate('quote')}
                    >
                      + Quote
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate('cta')}
                    >
                      + CTA
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate('faq')}
                    >
                      + FAQ
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your comprehensive blog content here...

Use markdown formatting:
## For headings
### For subheadings
**For bold text**
*For italic text*
- For bullet points
> For quotes

Make sure to include:
- Clear, actionable information
- Expert insights and tips
- Relevant examples
- Call-to-action elements"
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span>
                      {formData.content.split(/\s+/).filter(word => word.length > 0).length} words
                    </span>
                    <span>
                      ~{formData.readingTime} min read
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Post Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="mt-1">
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
                  </div>

                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Select
                      value={formData.author}
                      onValueChange={(value) => handleInputChange('author', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        {authors.map((author) => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="publishedAt">Publish Date</Label>
                    <Input
                      id="publishedAt"
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleInputChange('featured', checked)}
                    />
                    <Label htmlFor="featured">Featured Post</Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO Optimization</CardTitle>
              <p className="text-sm text-gray-600">
                Optimize your content for search engines and social media
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="Optimized title for search engines..."
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Meta description for search results..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label htmlFor="focusKeyword">Focus Keyword</Label>
                <Input
                  id="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                  placeholder="Primary keyword for SEO..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Upload a featured image for your blog post
                </p>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Comments Enabled</Label>
                  <p className="text-sm text-gray-600">Allow readers to comment on this post</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Social Sharing</Label>
                  <p className="text-sm text-gray-600">Enable social media sharing buttons</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Newsletter Promotion</Label>
                  <p className="text-sm text-gray-600">Show newsletter signup in this post</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
