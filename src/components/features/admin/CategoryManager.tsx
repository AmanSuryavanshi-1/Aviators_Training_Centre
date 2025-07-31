'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Palette,
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { BlogCategory } from '@/lib/types/blog';

interface CategoryManagerProps {
  categories?: BlogCategory[];
  onCreateCategory?: (category: CategoryFormData) => Promise<void>;
  onUpdateCategory?: (id: string, category: CategoryFormData) => Promise<void>;
  onDeleteCategory?: (id: string) => Promise<void>;
  loading?: boolean;
}

interface CategoryFormData {
  title: string;
  slug: string;
  description: string;
  color: string;
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  };
}

const defaultFormData: CategoryFormData = {
  title: '',
  slug: '',
  description: '',
  color: '#075E68',
  seoSettings: {
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
  },
};

const predefinedColors = [
  '#075E68', // Aviation Primary
  '#0891B2', // Aviation Secondary
  '#0F766E', // Aviation Tertiary
  '#DC2626', // Red
  '#EA580C', // Orange
  '#CA8A04', // Yellow
  '#16A34A', // Green
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#C2410C', // Brown
];

const mockCategories: BlogCategory[] = [
  {
    _id: '1',
    _type: 'category',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'rev1',
    title: 'Aviation Training',
    slug: { current: 'aviation-training' },
    description: 'Comprehensive aviation training guides and resources',
    color: '#075E68',
    seoSettings: {
      metaTitle: 'Aviation Training | Aviators Training Centre',
      metaDescription: 'Expert aviation training guides and resources for aspiring pilots',
      focusKeyword: 'aviation training',
    },
  },
  {
    _id: '2',
    _type: 'category',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'rev2',
    title: 'DGCA Exams',
    slug: { current: 'dgca-exams' },
    description: 'DGCA examination preparation and study materials',
    color: '#DC2626',
    seoSettings: {
      metaTitle: 'DGCA Exam Preparation | Aviators Training Centre',
      metaDescription: 'Complete DGCA exam preparation guides and study materials',
      focusKeyword: 'dgca exam',
    },
  },
  {
    _id: '3',
    _type: 'category',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'rev3',
    title: 'Safety Tips',
    slug: { current: 'safety-tips' },
    description: 'Aviation safety guidelines and best practices',
    color: '#16A34A',
    seoSettings: {
      metaTitle: 'Aviation Safety Tips | Aviators Training Centre',
      metaDescription: 'Essential aviation safety tips and best practices for pilots',
      focusKeyword: 'aviation safety',
    },
  },
  {
    _id: '4',
    _type: 'category',
    _createdAt: '2024-01-01T00:00:00Z',
    _updatedAt: '2024-01-01T00:00:00Z',
    _rev: 'rev4',
    title: 'Career Guidance',
    slug: { current: 'career-guidance' },
    description: 'Aviation career advice and guidance',
    color: '#7C3AED',
    seoSettings: {
      metaTitle: 'Aviation Career Guidance | Aviators Training Centre',
      metaDescription: 'Professional aviation career guidance and advice',
      focusKeyword: 'aviation career',
    },
  },
];

export function CategoryManager({ 
  categories = mockCategories, 
  onCreateCategory, 
  onUpdateCategory, 
  onDeleteCategory, 
  loading = false 
}: CategoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = useCallback((field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Auto-generate slug from title
    if (field === 'title' && !editingCategory) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [editingCategory, validationErrors]);

  const handleNestedInputChange = useCallback((
    parentField: keyof CategoryFormData,
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

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Category title is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Category slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!formData.description.trim()) {
      errors.description = 'Category description is required';
    }

    // Check for duplicate slug (excluding current category when editing)
    const duplicateSlug = categories.find(cat => 
      cat.slug.current === formData.slug && 
      (!editingCategory || cat._id !== editingCategory._id)
    );
    if (duplicateSlug) {
      errors.slug = 'This slug is already in use';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, categories, editingCategory]);

  const handleOpenDialog = useCallback((category?: BlogCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        slug: category.slug.current,
        description: category.description || '',
        color: category.color || '#075E68',
        seoSettings: {
          metaTitle: category.seoSettings?.metaTitle || '',
          metaDescription: category.seoSettings?.metaDescription || '',
          focusKeyword: category.seoSettings?.focusKeyword || '',
        },
      });
    } else {
      setEditingCategory(null);
      setFormData(defaultFormData);
    }
    setValidationErrors({});
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData(defaultFormData);
    setValidationErrors({});
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory && onUpdateCategory) {
        await onUpdateCategory(editingCategory._id, formData);
        toast.success('Category updated successfully!');
      } else if (onCreateCategory) {
        await onCreateCategory(formData);
        toast.success('Category created successfully!');
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, editingCategory, onCreateCategory, onUpdateCategory, handleCloseDialog]);

  const handleDelete = useCallback(async (category: BlogCategory) => {
    if (!confirm(`Are you sure you want to delete the category "${category.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (onDeleteCategory) {
        await onDeleteCategory(category._id);
        toast.success('Category deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  }, [onDeleteCategory]);

  const getPostCount = useCallback((categoryId: string): number => {
    // In a real implementation, this would come from the API
    // For now, return mock data
    const mockCounts: Record<string, number> = {
      '1': 15,
      '2': 8,
      '3': 12,
      '4': 6,
    };
    return mockCounts[categoryId] || 0;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Category Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Organize your blog content with categories
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update the category information below.'
                  : 'Add a new category to organize your blog posts.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Category Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter category title..."
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={validationErrors.title ? 'border-red-500' : ''}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="url-friendly-slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className={validationErrors.slug ? 'border-red-500' : ''}
                  />
                  {validationErrors.slug && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.slug}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this category..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={validationErrors.description ? 'border-red-500' : ''}
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
                  )}
                </div>

                <div>
                  <Label>Category Color</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-slate-300"
                      style={{ backgroundColor: formData.color }}
                    />
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-20 h-8 p-1 border rounded"
                    />
                    <div className="flex flex-wrap gap-1">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className="w-6 h-6 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleInputChange('color', color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  SEO Settings
                </h4>
                
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO title for this category..."
                    value={formData.seoSettings?.metaTitle}
                    onChange={(e) => handleNestedInputChange('seoSettings', 'metaTitle', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    placeholder="SEO description for this category..."
                    value={formData.seoSettings?.metaDescription}
                    onChange={(e) => handleNestedInputChange('seoSettings', 'metaDescription', e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="focusKeyword">Focus Keyword</Label>
                  <Input
                    id="focusKeyword"
                    placeholder="Primary keyword for this category..."
                    value={formData.seoSettings?.focusKeyword}
                    onChange={(e) => handleNestedInputChange('seoSettings', 'focusKeyword', e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : editingCategory ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categories ({filteredCategories.length})
          </CardTitle>
          <CardDescription>
            Manage your blog categories and their settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600 dark:text-slate-400">Loading categories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No categories found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {categories.length === 0 
                  ? "You haven't created any categories yet." 
                  : "No categories match your search."}
              </p>
              {categories.length === 0 && (
                <Button 
                  onClick={() => handleOpenDialog()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Your First Category
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Posts</TableHead>
                    <TableHead>SEO</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const postCount = getPostCount(category._id);
                    return (
                      <TableRow key={category._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {category.title}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                /{category.slug.current}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {category.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {postCount} posts
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={category.seoSettings?.metaTitle ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {category.seoSettings?.metaTitle ? 'Optimized' : 'Basic'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(category.slug.current)}>
                                <Palette className="h-4 w-4 mr-2" />
                                Copy Slug
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDelete(category)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Category
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
