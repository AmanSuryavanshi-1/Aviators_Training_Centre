'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPreviewData {
  title: string;
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

interface BlogPreviewSidebarProps {
  data: BlogPreviewData;
  onClose: () => void;
  wordCount: number;
  readingTime: number;
}

export function BlogPreviewSidebar({ 
  data, 
  onClose, 
  wordCount, 
  readingTime 
}: BlogPreviewSidebarProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-1/2 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Live Preview
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Featured Image */}
            {(data.image?.url || data.image?.file) && (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-100">
                <img
                  src={data.image.file ? URL.createObjectURL(data.image.file) : data.image.url}
                  alt={data.image.alt || 'Featured image'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {data.title || 'Untitled Post'}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-1">
                  <span className="font-medium">By:</span>
                  <span>{data.author || 'Unknown Author'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Category:</span>
                  <Badge variant="outline" className="text-xs">
                    {data.category || 'Uncategorized'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Reading Time:</span>
                  <span>{readingTime} min read</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Words:</span>
                  <span>{wordCount}</span>
                </div>
                {data.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
            </div>

            {/* Excerpt */}
            {data.excerpt && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-lg text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  {data.excerpt}
                </p>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {data.content || 'No content yet...'}
              </div>
            </div>

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 mr-2">
                    Tags:
                  </span>
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Preview */}
            {(data.seoTitle || data.seoDescription) && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-yellow-800 dark:text-yellow-200">
                    SEO Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.seoTitle && (
                    <div>
                      <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                        Search Result Title:
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer">
                        {data.seoTitle}
                      </div>
                    </div>
                  )}
                  
                  {data.seoDescription && (
                    <div>
                      <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                        Meta Description:
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {data.seoDescription}
                      </div>
                    </div>
                  )}

                  {data.focusKeyword && (
                    <div>
                      <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                        Focus Keyword:
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {data.focusKeyword}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Content Statistics */}
            <Card className="bg-slate-50 dark:bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Content Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-slate-600 dark:text-slate-400">
                      Word Count
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {wordCount}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-600 dark:text-slate-400">
                      Reading Time
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {readingTime} min
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-600 dark:text-slate-400">
                      Characters
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {data.content.length}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-600 dark:text-slate-400">
                      Paragraphs
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {data.content.split('\n\n').filter(p => p.trim()).length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
