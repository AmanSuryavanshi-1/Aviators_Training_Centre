'use client';

import { useState, useEffect } from 'react';
import { BlogPost, BlogPostPreview } from '@/lib/types/blog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  Star,
  Eye,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  FileText,
  ExternalLink,
  Trash2,
  X,
  Info
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface DeletionConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  post: BlogPostPreview | BlogPost | null;
  isDeleting?: boolean;
  error?: string | null;
}

interface PostWarning {
  type: 'featured' | 'high-engagement' | 'recent' | 'linked' | 'category-important';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  icon: React.ComponentType<{ className?: string }>;
}

export function DeletionConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  post,
  isDeleting = false,
  error = null
}: DeletionConfirmationDialogProps) {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [warnings, setWarnings] = useState<PostWarning[]>([]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmationChecked(false);
      generateWarnings();
    }
  }, [isOpen, post]);

  // Generate warnings based on post data
  const generateWarnings = () => {
    if (!post) return;

    const newWarnings: PostWarning[] = [];

    // Featured post warning
    if (post.featured) {
      newWarnings.push({
        type: 'featured',
        title: 'Featured Post',
        description: 'This post is currently featured on the homepage. Deleting it will affect the homepage display.',
        severity: 'high',
        icon: Star
      });
    }

    // High engagement warning (mock data - in real app, check analytics)
    const views = (post as any).views || 0;
    if (views > 1000) {
      newWarnings.push({
        type: 'high-engagement',
        title: 'High Engagement',
        description: `This post has ${views.toLocaleString()} views. Consider archiving instead of deleting.`,
        severity: 'medium',
        icon: TrendingUp
      });
    }

    // Recent post warning
    const publishedDate = new Date(post.publishedAt || post._createdAt);
    const daysSincePublished = Math.floor((Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSincePublished <= 7) {
      newWarnings.push({
        type: 'recent',
        title: 'Recently Published',
        description: `This post was published ${daysSincePublished} day${daysSincePublished !== 1 ? 's' : ''} ago. It may still be gaining traction.`,
        severity: 'low',
        icon: Clock
      });
    }

    // Category importance (mock check)
    if (post.category?.title?.toLowerCase().includes('important') || 
        post.category?.title?.toLowerCase().includes('featured')) {
      newWarnings.push({
        type: 'category-important',
        title: 'Important Category',
        description: `This post is in the "${post.category.title}" category, which may be important for site navigation.`,
        severity: 'medium',
        icon: Tag
      });
    }

    setWarnings(newWarnings);
  };

  const getWarningColor = (severity: PostWarning['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getWarningIconColor = (severity: PostWarning['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!post) return null;

  const hasHighSeverityWarnings = warnings.some(w => w.severity === 'high');
  const hasMediumSeverityWarnings = warnings.some(w => w.severity === 'medium');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Post Deletion
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The post will be permanently removed from your blog.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {post.excerpt || 'No excerpt available'}
                </p>
              </div>
              {post.mainImage && (
                <div className="ml-4 flex-shrink-0">
                  <img
                    src={post.mainImage.asset?.url || ''}
                    alt={post.mainImage.alt || post.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Post Metadata */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Published: {formatDate(post.publishedAt || post._createdAt)}</span>
                </div>
                {post.author && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Author: {post.author.name}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {post.category && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-4 w-4" />
                    <span>Category: {post.category.title}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {post.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {post.slug?.current || 'No slug'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Important Considerations
              </h4>
              {warnings.map((warning, index) => {
                const IconComponent = warning.icon;
                return (
                  <Alert key={index} className={cn("border", getWarningColor(warning.severity))}>
                    <IconComponent className={cn("h-4 w-4", getWarningIconColor(warning.severity))} />
                    <AlertTitle className="text-sm font-medium">
                      {warning.title}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
                      {warning.description}
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-800">Deletion Failed</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation Checkbox */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="confirm-deletion"
                checked={confirmationChecked}
                onCheckedChange={(checked) => setConfirmationChecked(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor="confirm-deletion"
                  className="text-sm font-medium text-red-800 cursor-pointer"
                >
                  I understand this action cannot be undone
                </label>
                <p className="text-xs text-red-600 mt-1">
                  {hasHighSeverityWarnings
                    ? 'This post has high-impact warnings. Please review them carefully before proceeding.'
                    : hasMediumSeverityWarnings
                    ? 'This post has some important considerations. Please review them before proceeding.'
                    : 'The post will be permanently deleted from your blog and cannot be recovered.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h5 className="text-sm font-medium text-blue-800 mb-1">
                  Alternative Actions
                </h5>
                <p className="text-xs text-blue-600 mb-2">
                  Consider these alternatives to deletion:
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Unpublish the post to hide it from public view</li>
                  <li>• Archive the post for future reference</li>
                  <li>• Edit the post to update its content</li>
                  <li>• Remove it from featured status if it's currently featured</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-xs text-gray-500">
            Post ID: {post._id}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={!confirmationChecked || isDeleting}
              className="min-w-[120px]"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}