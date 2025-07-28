'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, ExternalLink, Clock, User, Calendar, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

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
}

interface RealTimePreviewProps {
  formData: BlogFormData;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onOpenFullPreview: () => void;
}

export function RealTimePreview({
  formData,
  isVisible,
  onToggleVisibility,
  onOpenFullPreview
}: RealTimePreviewProps) {
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const words = formData.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
  }, [formData.content]);

  if (!isVisible) {
    return (
      <Card className="sticky top-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Preview</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleVisibility}
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Preview
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Preview</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenFullPreview}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleVisibility}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto max-h-[calc(100vh-8rem)]">
        <div className="space-y-4">
          {/* Post Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {formData.title || 'Untitled Post'}
            </h1>
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {formData.author || 'Unknown Author'}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(new Date().toISOString())}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {readingTime} min read
              </div>
            </div>

            {/* Category and Featured Badge */}
            <div className="flex items-center gap-2 mb-4">
              {formData.category && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {formData.category}
                </Badge>
              )}
              {formData.featured && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Featured
                </Badge>
              )}
            </div>

            {/* Tags */}
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Excerpt */}
          {formData.excerpt && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 dark:text-gray-300 italic">
                {formData.excerpt}
              </p>
            </div>
          )}

          {/* Content Preview */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {formData.content ? (
              <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                {formData.content.split('\n').map((paragraph, index) => {
                  if (paragraph.trim() === '') return <br key={index} />;
                  
                  // Simple markdown-like formatting
                  let formatted = paragraph;
                  
                  // Headers
                  if (formatted.startsWith('# ')) {
                    return (
                      <h1 key={index} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">
                        {formatted.substring(2)}
                      </h1>
                    );
                  }
                  if (formatted.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-lg font-bold mt-5 mb-2 text-gray-900 dark:text-gray-100">
                        {formatted.substring(3)}
                      </h2>
                    );
                  }
                  if (formatted.startsWith('### ')) {
                    return (
                      <h3 key={index} className="text-base font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
                        {formatted.substring(4)}
                      </h3>
                    );
                  }
                  
                  // Lists
                  if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
                    return (
                      <li key={index} className="ml-4 mb-1">
                        {formatted.substring(2)}
                      </li>
                    );
                  }
                  
                  // Regular paragraph
                  return (
                    <p key={index} className="mb-3">
                      {formatted}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Start writing to see your content preview...
              </p>
            )}
          </div>

          <Separator />

          {/* SEO Preview */}
          {(formData.seoTitle || formData.seoDescription) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                SEO Preview
              </h4>
              {formData.seoTitle && (
                <div className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-1">
                  {formData.seoTitle}
                </div>
              )}
              {formData.seoDescription && (
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  {formData.seoDescription}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Words:</span> {wordCount}
              </div>
              <div>
                <span className="font-medium">Reading time:</span> {readingTime} min
              </div>
              <div>
                <span className="font-medium">Characters:</span> {formData.content.length}
              </div>
              <div>
                <span className="font-medium">Excerpt:</span> {formData.excerpt.length}/300
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}