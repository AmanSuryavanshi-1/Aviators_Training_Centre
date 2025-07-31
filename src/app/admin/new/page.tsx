'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ManualBlogEditor } from "@/components/features/admin/ManualBlogEditor";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

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

export default function NewBlogPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (formData: BlogFormData) => {
    // Enhanced validation - images and authors are completely optional
    const missingFields = [];
    if (!formData.title?.trim()) missingFields.push('title');
    if (!formData.content?.trim()) missingFields.push('content');
    if (!formData.excerpt?.trim()) missingFields.push('excerpt');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate excerpt length (more flexible range)
    if (formData.excerpt.trim().length < 50) {
      throw new Error('Excerpt must be at least 50 characters long');
    }
    
    if (formData.excerpt.trim().length > 300) {
      throw new Error('Excerpt must be less than 300 characters');
    }

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const submitFormData = new FormData();
      
      // Add text fields
      submitFormData.append('title', formData.title.trim());
      submitFormData.append('slug', formData.slug?.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      submitFormData.append('content', formData.content.trim());
      submitFormData.append('excerpt', formData.excerpt.trim());
      submitFormData.append('category', formData.category.trim());
      submitFormData.append('author', formData.author?.trim() || 'ATC Instructor');
      submitFormData.append('tags', Array.isArray(formData.tags) ? formData.tags.filter(tag => tag.trim()).join(',') : '');
      submitFormData.append('featured', String(Boolean(formData.featured)));
      submitFormData.append('seoTitle', formData.seoTitle?.trim() || `${formData.title} | Aviators Training Centre`);
      submitFormData.append('seoDescription', formData.seoDescription?.trim() || formData.excerpt.substring(0, 160));
      submitFormData.append('focusKeyword', formData.focusKeyword?.trim() || '');
      // Only add image data if image is provided
      if (formData.image?.file || formData.image?.url) {
        submitFormData.append('imageAlt', formData.image?.alt?.trim() || `Image for ${formData.title}`);
        
        // Add image file if present
        if (formData.image?.file) {
          submitFormData.append('image', formData.image.file);
        } else if (formData.image?.url) {
          submitFormData.append('imageUrl', formData.image.url);
        }
      }

      const response = await fetch('/api/blogs/enhanced', {
        method: 'POST',
        body: submitFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Show more helpful error messages for common issues
        if (response.status === 403 && errorData.error?.includes('permissions')) {
          throw new Error(`${errorData.error}\n\nSolution: ${errorData.solution || 'Check your Sanity API token permissions'}`);
        }
        
        throw new Error(errorData.error || 'Failed to create blog post');
      }

      const result = await response.json();
      console.log('Blog post created successfully:', result);
      
      // Show appropriate success message based on image upload status
      if (result.imageStatus === 'failed') {
        toast.success(`Blog post created successfully! Note: ${result.imageError || 'Image upload failed, but post was saved without image.'}`);
      } else if (result.imageStatus === 'uploaded') {
        toast.success('Blog post created successfully with image!');
      } else {
        toast.success('Blog post created successfully without image!');
      }
      
      // Navigate to admin page after successful creation
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create blog post');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (formData: BlogFormData) => {
    // Create a preview window with better styling
    const previewWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview: ${formData.title || 'Untitled Post'}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px; 
              line-height: 1.6;
              color: #333;
              background: #fff;
            }
            h1 { 
              color: #075E68; 
              font-size: 2.5rem;
              margin-bottom: 1rem;
              font-weight: 700;
            }
            .meta { 
              color: #666; 
              margin-bottom: 30px; 
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              border-left: 4px solid #075E68;
            }
            .meta p { margin: 8px 0; }
            .meta strong { color: #333; }
            .content { 
              line-height: 1.8; 
              font-size: 1.1rem;
              white-space: pre-wrap;
            }
            .excerpt {
              font-style: italic;
              color: #555;
              font-size: 1.2rem;
              margin-bottom: 30px;
              padding: 20px;
              background: #f0f9ff;
              border-radius: 8px;
              border-left: 4px solid #0ea5e9;
            }
            .tags {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 10px;
            }
            .tag {
              background: #e0f2fe;
              color: #0369a1;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 0.875rem;
              font-weight: 500;
            }
            .seo-preview {
              margin-top: 40px;
              padding: 20px;
              background: #fef3c7;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            .seo-title {
              color: #1e40af;
              font-size: 1.2rem;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .seo-description {
              color: #374151;
              font-size: 0.95rem;
            }
            .reading-time {
              color: #6b7280;
              font-size: 0.9rem;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h1>${formData.title || 'Untitled Post'}</h1>
          
          <div class="meta">
            <p><strong>Author:</strong> ${formData.author || 'Unknown'}</p>
            <p><strong>Category:</strong> ${formData.category || 'Uncategorized'}</p>
            ${formData.tags && formData.tags.length > 0 ? `
              <p><strong>Tags:</strong></p>
              <div class="tags">
                ${formData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            ` : ''}
            <div class="reading-time">
              <strong>Reading Time:</strong> ${Math.max(1, Math.ceil((formData.content || '').split(' ').length / 200))} min read
            </div>
          </div>
          
          ${formData.excerpt ? `
            <div class="excerpt">
              ${formData.excerpt}
            </div>
          ` : ''}
          
          <div class="content">
            ${(formData.content || 'No content yet...').replace(/\n/g, '<br>')}
          </div>
          
          ${formData.seoTitle || formData.seoDescription ? `
            <div class="seo-preview">
              <h3 style="margin-top: 0; color: #f59e0b;">SEO Preview</h3>
              ${formData.seoTitle ? `<div class="seo-title">${formData.seoTitle}</div>` : ''}
              ${formData.seoDescription ? `<div class="seo-description">${formData.seoDescription}</div>` : ''}
            </div>
          ` : ''}
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Blog Editor */}
        <ManualBlogEditor
          mode="create"
          onSave={handleSave}
          onPreview={handlePreview}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
