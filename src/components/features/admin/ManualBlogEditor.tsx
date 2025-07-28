'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Code, 
  Eye, 
  Save,
  Type,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  PenTool,
  Settings,
  Search,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ImageUploader } from './ImageUploader';
import { RealTimePreview } from './RealTimePreview';
import { BlogValidation } from './BlogValidation';

interface BlogFormData {
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
  image?: {
    file?: File;
    url?: string;
    alt: string;
  };
}

interface ManualBlogEditorProps {
  initialData?: Partial<BlogFormData>;
  mode?: 'create' | 'edit';
  onSave: (data: BlogFormData) => void;
  onPreview?: (data: BlogFormData) => void;
  loading?: boolean;
}

export function ManualBlogEditor({
  initialData = {},
  mode = 'create',
  onSave,
  onPreview,
  loading = false
}: ManualBlogEditorProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: initialData.title || '',
    slug: initialData.slug || '',
    excerpt: initialData.excerpt || '',
    content: initialData.content || '',
    category: initialData.category || '',
    author: initialData.author || 'Aman Suryavanshi',
    tags: initialData.tags || [],
    featured: initialData.featured || false,
    seoTitle: initialData.seoTitle || '',
    seoDescription: initialData.seoDescription || '',
    focusKeyword: initialData.focusKeyword || '',
    image: initialData.image
  });

  const [newTag, setNewTag] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Available blog images
  const availableImages = [
    '/Blogs/Blog2.webp',
    '/Blogs/Blog3.webp', 
    '/Blogs/Blog4.webp',
    '/Blogs/Blog5.webp',
    '/Blogs/Blog6.webp',
    '/Blogs/Blog7.webp',
    '/Blogs/Blog8.webp',
    '/Blogs/Blog_Header.webp',
    '/Blogs/Blog_Preperation.webp',
    '/Blogs/Blog_money.webp',
    '/Blogs/Blog_money2.webp',
    '/Blogs/Instructor.webp'
  ];

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      seoTitle: prev.seoTitle || `${title} | Aviators Training Centre`
    }));
  };

  // Rich text formatting functions
  const insertFormatting = (before: string, after: string = '') => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = `${before}${selectedText}${after}`;
    
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertFormatting('**', '**'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertFormatting('*', '*'), tooltip: 'Italic' },
    { icon: Underline, action: () => insertFormatting('<u>', '</u>'), tooltip: 'Underline' },
    { icon: Code, action: () => insertFormatting('`', '`'), tooltip: 'Inline Code' },
    { icon: Quote, action: () => insertFormatting('> '), tooltip: 'Blockquote' },
    { icon: List, action: () => insertFormatting('- '), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertFormatting('1. '), tooltip: 'Numbered List' },
    { icon: Link, action: () => insertFormatting('[Link Text](', ')'), tooltip: 'Link' },
    { icon: ImageIcon, action: () => insertFormatting('![Alt Text](', ')'), tooltip: 'Image' }
  ];

  const headingButtons = [
    { icon: Type, action: () => insertFormatting('# '), tooltip: 'Heading 1' },
    { icon: Type, action: () => insertFormatting('## '), tooltip: 'Heading 2' },
    { icon: Type, action: () => insertFormatting('### '), tooltip: 'Heading 3' },
    { icon: Hash, action: () => insertFormatting('#### '), tooltip: 'Heading 4' }
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }
    
    if (!formData.excerpt.trim()) {
      toast.error('Excerpt is required');
      return;
    }
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/30">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-aviation-primary via-aviation-secondary to-aviation-tertiary text-white rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">
                        {mode === 'create' ? 'Create New Blog Post' : 'Edit Blog Post'}
                      </h1>
                      <p className="text-white/80 text-sm mt-1">
                        Share your aviation expertise with our community
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {onPreview && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => onPreview(formData)}
                        disabled={loading}
                        className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-aviation-primary backdrop-blur-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-aviation-primary backdrop-blur-sm font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Tabs defaultValue="content" className="space-y-8">
                  <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100 rounded-xl p-1">
                    <TabsTrigger value="content" className="flex items-center gap-2 rounded-lg">
                      <BookOpen className="w-4 h-4" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex items-center gap-2 rounded-lg">
                      <ImageIcon className="w-4 h-4" />
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="flex items-center gap-2 rounded-lg">
                      <Search className="w-4 h-4" />
                      SEO
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex items-center gap-2 rounded-lg">
                      <Settings className="w-4 h-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>
            
                  <TabsContent value="content" className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="title" className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-aviation-primary" />
                          Title *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Enter an engaging blog post title..."
                          required
                          className="h-12 text-lg border-2 border-gray-200 focus:border-aviation-primary transition-colors"
                        />
                        {formData.title && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Great! Your title looks engaging.
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="slug" className="text-lg font-semibold text-gray-800">URL Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          placeholder="auto-generated-from-title"
                          className="h-12 border-2 border-gray-200 focus:border-aviation-primary transition-colors"
                        />
                        <p className="text-sm text-gray-500">URL: /blog/{formData.slug || 'your-post-slug'}</p>
                      </div>
                    </div>
              
                    {/* Excerpt */}
                    <div className="space-y-3">
                      <Label htmlFor="excerpt" className="text-lg font-semibold text-gray-800">Excerpt *</Label>
                      <Textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Write a compelling summary that will make readers want to click and read more..."
                        rows={4}
                        required
                        className="border-2 border-gray-200 focus:border-aviation-primary transition-colors resize-none text-base"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{formData.excerpt.length} characters</span>
                        <span className={`${
                          formData.excerpt.length >= 50 && formData.excerpt.length <= 300 
                            ? 'text-green-600' 
                            : formData.excerpt.length < 50 
                              ? 'text-orange-500' 
                              : 'text-red-500'
                        }`}>
                          {formData.excerpt.length < 50 
                            ? `Need ${50 - formData.excerpt.length} more characters` 
                            : formData.excerpt.length > 300 
                              ? `${formData.excerpt.length - 300} characters too long` 
                              : 'Good length'}
                        </span>
                      </div>
                    </div>
              
                    {/* Rich Text Editor */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold text-gray-800">Content *</Label>
                      
                      {/* Enhanced Formatting Toolbar */}
                      <div className="border rounded-xl p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1 mr-3">
                            <Type className="w-4 h-4" />
                            Headings:
                          </span>
                          {headingButtons.map((btn, idx) => (
                            <Button
                              key={idx}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={btn.action}
                              title={btn.tooltip}
                              className="h-9 px-3 hover:bg-aviation-primary hover:text-white transition-colors"
                            >
                              <btn.icon className="h-4 w-4" />
                              <span className="ml-1 text-xs">{idx + 1}</span>
                            </Button>
                          ))}
                        </div>
                        
                        <Separator className="bg-gray-200" />
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1 mr-3">
                            <PenTool className="w-4 h-4" />
                            Format:
                          </span>
                          {formatButtons.map((btn, idx) => (
                            <Button
                              key={idx}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={btn.action}
                              title={btn.tooltip}
                              className="h-9 px-3 hover:bg-aviation-primary hover:text-white transition-colors"
                            >
                              <btn.icon className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Content Textarea */}
                      <div className="relative">
                        <Textarea
                          ref={contentRef}
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Write your aviation expertise here...\n\nâ€¢ Share practical insights\nâ€¢ Include real-world examples\nâ€¢ Use clear, engaging language\nâ€¢ Break content into digestible sections\n\nTip: Use the formatting toolbar above for headings, lists, and emphasis."
                          rows={25}
                          className="font-mono text-base border-2 border-gray-200 focus:border-aviation-primary transition-colors resize-none leading-relaxed"
                          required
                        />
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">{wordCount} words</span>
                            <span className="text-aviation-primary font-medium">{readingTime} min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
            
                  <TabsContent value="media" className="space-y-6">
                    <ImageUploader
                      onImageSelect={(imageData) => {
                        setFormData(prev => ({
                          ...prev,
                          image: imageData
                        }));
                        if (imageData.url) {
                          setSelectedImage(imageData.url);
                        }
                      }}
                      selectedImage={formData.image}
                      availableImages={availableImages}
                    />
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="seoTitle" className="text-lg font-semibold text-gray-800">SEO Title</Label>
                        <Input
                          id="seoTitle"
                          value={formData.seoTitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                          placeholder="Custom SEO title (auto-generated if empty)"
                          className="h-12 border-2 border-gray-200 focus:border-aviation-primary transition-colors"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{formData.seoTitle.length} characters</span>
                          <span className={`${formData.seoTitle.length <= 60 ? 'text-green-600' : 'text-red-500'}`}>
                            {formData.seoTitle.length <= 60 ? 'Good length' : 'Too long'} (Recommended: 50-60)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="seoDescription" className="text-lg font-semibold text-gray-800">SEO Description</Label>
                        <Textarea
                          id="seoDescription"
                          value={formData.seoDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                          placeholder="Custom SEO description (auto-generated if empty)"
                          rows={4}
                          className="border-2 border-gray-200 focus:border-aviation-primary transition-colors resize-none"
                        />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">{formData.seoDescription.length} characters</span>
                          <span className={`${formData.seoDescription.length <= 160 ? 'text-green-600' : 'text-red-500'}`}>
                            {formData.seoDescription.length <= 160 ? 'Good length' : 'Too long'} (Recommended: 150-160)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="focusKeyword" className="text-lg font-semibold text-gray-800">Focus Keyword</Label>
                        <Input
                          id="focusKeyword"
                          value={formData.focusKeyword}
                          onChange={(e) => setFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                          placeholder="e.g., DGCA CPL exam, pilot training, aviation career"
                          className="h-12 border-2 border-gray-200 focus:border-aviation-primary transition-colors"
                        />
                        <p className="text-sm text-gray-500">Choose a primary keyword that best describes your article</p>
                      </div>
                    </div>
                  </TabsContent>
            
                  <TabsContent value="settings" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-lg font-semibold text-gray-800">Category</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-aviation-primary">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DGCA Exams">DGCA Exams</SelectItem>
                            <SelectItem value="Flight Training">Flight Training</SelectItem>
                            <SelectItem value="Career Guidance">Career Guidance</SelectItem>
                            <SelectItem value="Aviation Technology">Aviation Technology</SelectItem>
                            <SelectItem value="Pilot Life">Pilot Life</SelectItem>
                            <SelectItem value="Safety">Safety</SelectItem>
                            <SelectItem value="Regulations">Regulations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="author" className="text-lg font-semibold text-gray-800">Author</Label>
                        <Select value={formData.author} onValueChange={(value) => setFormData(prev => ({ ...prev, author: value }))}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-aviation-primary">
                            <SelectValue placeholder="Select an author" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Capt. Aman Suryavanshi">Capt. Aman Suryavanshi</SelectItem>
                            <SelectItem value="Capt. Ankit Kumar">Capt. Ankit Kumar</SelectItem>
                            <SelectItem value="Capt. Dhruv Shirkoli">Capt. Dhruv Shirkoli</SelectItem>
                            <SelectItem value="Capt. Saksham Engine">Capt. Saksham Engine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold text-gray-800">Tags</Label>
                      <div className="flex gap-3">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a relevant tag..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="h-12 border-2 border-gray-200 focus:border-aviation-primary transition-colors"
                        />
                        <Button 
                          type="button" 
                          onClick={addTag} 
                          variant="outline"
                          className="h-12 px-6 border-2 border-aviation-primary text-aviation-primary hover:bg-aviation-primary hover:text-white"
                        >
                          Add Tag
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer px-3 py-1 bg-aviation-primary/10 text-aviation-primary hover:bg-red-100 hover:text-red-600 transition-colors" 
                            onClick={() => removeTag(tag)}
                          >
                            {tag} Ã—
                          </Badge>
                        ))}
                      </div>
                      {formData.tags.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Add tags to help categorize your content</p>
                      )}
                    </div>
                    
                    {/* Featured Toggle */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="featured" className="text-lg font-semibold text-gray-800">Featured Post</Label>
                          <p className="text-sm text-gray-600 mt-1">Featured posts appear prominently on the blog homepage</p>
                        </div>
                        <Switch
                          id="featured"
                          checked={formData.featured}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                          className="data-[state=checked]:bg-aviation-primary"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
            </div>

            {/* Real-time Preview and Validation Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <BlogValidation
                formData={formData}
                isVisible={showValidation}
              />
              
              <RealTimePreview
                formData={formData}
                isVisible={showPreview}
                onToggleVisibility={() => setShowPreview(!showPreview)}
                onOpenFullPreview={() => onPreview?.(formData)}
              />
            </div>
          </div>
        </motion.div>
    </div>
  </div>
  );
}
