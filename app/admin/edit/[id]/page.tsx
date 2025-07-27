'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ManualBlogEditor } from '@/components/admin/ManualBlogEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { unifiedBlogService } from '@/lib/blog/unified-blog-service';

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

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [initialData, setInitialData] = useState<Partial<BlogFormData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string>('');
  
  // Removed useRealTimeSync to simplify error handling

  useEffect(() => {
    const loadBlogPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Clear cache first to ensure fresh data
        unifiedBlogService.clearCache();
        
        const result = await unifiedBlogService.getPost(id);
        
        if (!result) {
          throw new Error(`Blog post not found with ID: ${id}. The post may have been deleted or the ID is incorrect.`);
        }

        if (!result.editable) {
          throw new Error('This post is read-only and cannot be edited');
        }

        setPostId(result._id);
        setInitialData({
          title: result.title,
          slug: typeof result.slug === 'string' ? result.slug : result.slug.current,
          excerpt: result.excerpt,
          content: result.content || '',
          category: result.category.title,
          author: result.author.name,
          tags: result.tags || [],
          featured: result.featured,
          seoTitle: result.title + ' | Aviators Training Centre',
          seoDescription: result.excerpt.substring(0, 160),
          focusKeyword: '',
          image: result.image ? {
            url: result.image.asset.url,
            alt: result.image.alt
          } : undefined
        });
      } catch (error) {
        console.error('Error loading blog post:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load blog post';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBlogPost();
    }
  }, [id]);

  const handleSave = async (formData: BlogFormData) => {
    if (!postId) {
      throw new Error('Post ID not found');
    }

    // Enhanced validation
    const missingFields = [];
    if (!formData.title?.trim()) missingFields.push('title');
    if (!formData.content?.trim()) missingFields.push('content');
    if (!formData.excerpt?.trim()) missingFields.push('excerpt');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate excerpt length
    if (formData.excerpt.trim().length < 50) {
      throw new Error('Excerpt must be at least 50 characters long');
    }
    
    if (formData.excerpt.trim().length > 300) {
      throw new Error('Excerpt must be less than 300 characters');
    }

    setSaving(true);
    try {
      // Use API endpoint instead of direct service call
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim(),
        category: formData.category.trim(),
        author: formData.author?.trim() || 'Aman Suryavanshi',
        tags: Array.isArray(formData.tags) ? formData.tags.filter(tag => tag.trim()) : [],
        featured: Boolean(formData.featured),
        seoTitle: formData.seoTitle?.trim() || `${formData.title} | Aviators Training Centre`,
        seoDescription: formData.seoDescription?.trim() || formData.excerpt.substring(0, 160),
        focusKeyword: formData.focusKeyword?.trim() || ''
      };

      console.log('🔄 Updating post via API:', Object.keys(updateData));

      const response = await fetch(`/api/blog/posts/update/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      
      console.log('📝 API response:', result);
      
      if (!response.ok || !result.success) {
        const errorMessage = result.error?.message || result.error || 'Failed to update blog post';
        console.error('❌ Update failed:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('✅ Post updated successfully via API');

      toast.success('Blog post updated successfully!');
      
      // Navigate back to blog management
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update blog post');
      throw error;
    } finally {
      setSaving(false);
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
            .updated-badge {
              background: #10b981;
              color: white;
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 0.75rem;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="updated-badge">UPDATED VERSION</div>
          <h1>${formData.title || 'Untitled Post'}</h1>
          
          <div class="meta">
            <p><strong>Author:</strong> ${formData.author || 'Unknown'}</p>
            <p><strong>Category:</strong> ${formData.category || 'Uncategorized'}</p>
            <p><strong>Featured:</strong> ${formData.featured ? 'Yes' : 'No'}</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading blog post...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/admin/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog Management
              </Button>
            </Link>
          </div>
          
          <Alert variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link href="/admin/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog Management
              </Button>
            </Link>
          </div>
          
          <Alert>
            <AlertDescription>
              Blog post data not available.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/blogs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog Management
              </Button>
            </Link>
          </div>
        </div>

        {/* Blog Editor */}
        <ManualBlogEditor
          mode="edit"
          initialData={initialData}
          onSave={handleSave}
          onPreview={handlePreview}
          loading={saving}
        />
      </div>
    </div>
  );
}