'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckSquare,
  Square,
  MoreHorizontal,
  Trash2,
  Star,
  Tag,
  Eye,
  EyeOff,
  Download,
  Upload,
  Copy,
  Archive,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { BlogPostPreview } from '@/lib/types/blog';

interface BulkActionsProps {
  posts: BlogPostPreview[];
  selectedPosts: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkAction?: (action: BulkActionType, postIds: string[], options?: any) => Promise<void>;
  categories?: string[];
  loading?: boolean;
}

type BulkActionType = 
  | 'delete'
  | 'feature'
  | 'unfeature'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'unarchive'
  | 'change-category'
  | 'add-tags'
  | 'remove-tags'
  | 'export'
  | 'duplicate';

interface BulkActionConfig {
  type: BulkActionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'secondary';
  requiresConfirmation?: boolean;
  requiresInput?: boolean;
  inputType?: 'category' | 'tags' | 'text';
  description?: string;
}

const bulkActions: BulkActionConfig[] = [
  {
    type: 'feature',
    label: 'Mark as Featured',
    icon: Star,
    description: 'Mark selected posts as featured',
  },
  {
    type: 'unfeature',
    label: 'Remove from Featured',
    icon: Star,
    variant: 'secondary',
    description: 'Remove featured status from selected posts',
  },
  {
    type: 'change-category',
    label: 'Change Category',
    icon: Tag,
    requiresInput: true,
    inputType: 'category',
    description: 'Change category for selected posts',
  },
  {
    type: 'add-tags',
    label: 'Add Tags',
    icon: Tag,
    requiresInput: true,
    inputType: 'tags',
    description: 'Add tags to selected posts',
  },
  {
    type: 'publish',
    label: 'Publish',
    icon: Eye,
    description: 'Publish selected draft posts',
  },
  {
    type: 'unpublish',
    label: 'Unpublish',
    icon: EyeOff,
    variant: 'secondary',
    requiresConfirmation: true,
    description: 'Unpublish selected posts (move to drafts)',
  },
  {
    type: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    description: 'Create copies of selected posts',
  },
  {
    type: 'export',
    label: 'Export',
    icon: Download,
    description: 'Export selected posts as JSON',
  },
  {
    type: 'archive',
    label: 'Archive',
    icon: Archive,
    variant: 'secondary',
    requiresConfirmation: true,
    description: 'Archive selected posts',
  },
  {
    type: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    requiresConfirmation: true,
    description: 'Permanently delete selected posts',
  },
];

export function BulkActions({ 
  posts, 
  selectedPosts, 
  onSelectionChange, 
  onBulkAction,
  categories = [],
  loading = false 
}: BulkActionsProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<BulkActionConfig | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showInputDialog, setShowInputDialog] = useState<BulkActionConfig | null>(null);

  const isAllSelected = posts.length > 0 && selectedPosts.length === posts.length;
  const isPartiallySelected = selectedPosts.length > 0 && selectedPosts.length < posts.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(posts.map(post => post._id));
    }
  }, [isAllSelected, posts, onSelectionChange]);

  const handlePostSelection = useCallback((postId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPosts, postId]);
    } else {
      onSelectionChange(selectedPosts.filter(id => id !== postId));
    }
  }, [selectedPosts, onSelectionChange]);

  const executeAction = useCallback(async (action: BulkActionConfig, options?: any) => {
    if (selectedPosts.length === 0) {
      toast.error('No posts selected');
      return;
    }

    setIsExecuting(true);
    try {
      if (onBulkAction) {
        await onBulkAction(action.type, selectedPosts, options);
        
        // Show success message
        const postCount = selectedPosts.length;
        const postText = postCount === 1 ? 'post' : 'posts';
        toast.success(`Successfully ${action.label.toLowerCase()} ${postCount} ${postText}`);
        
        // Clear selection after successful action
        onSelectionChange([]);
      }
    } catch (error) {
      console.error(`Error executing ${action.type}:`, error);
      toast.error(`Failed to ${action.label.toLowerCase()} posts`);
    } finally {
      setIsExecuting(false);
      setConfirmAction(null);
      setShowInputDialog(null);
      setInputValue('');
    }
  }, [selectedPosts, onBulkAction, onSelectionChange]);

  const handleActionClick = useCallback((action: BulkActionConfig) => {
    if (action.requiresInput) {
      setShowInputDialog(action);
      setInputValue('');
    } else if (action.requiresConfirmation) {
      setConfirmAction(action);
    } else {
      executeAction(action);
    }
  }, [executeAction]);

  const handleInputSubmit = useCallback(() => {
    if (!showInputDialog || !inputValue.trim()) {
      toast.error('Please provide a valid input');
      return;
    }

    const options = showInputDialog.inputType === 'tags' 
      ? { tags: inputValue.split(',').map(tag => tag.trim()).filter(Boolean) }
      : { [showInputDialog.inputType!]: inputValue.trim() };

    executeAction(showInputDialog, options);
  }, [showInputDialog, inputValue, executeAction]);

  const getSelectedPostsInfo = useCallback(() => {
    const selectedPostsData = posts.filter(post => selectedPosts.includes(post._id));
    const featuredCount = selectedPostsData.filter(post => post.featured).length;
    const categories = Array.from(new Set(selectedPostsData.map(post => post.category?.title).filter(Boolean)));
    
    return {
      total: selectedPosts.length,
      featured: featuredCount,
      categories: categories.slice(0, 3), // Show max 3 categories
      hasMore: categories.length > 3,
    };
  }, [posts, selectedPosts]);

  const selectedInfo = getSelectedPostsInfo();

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Selection Header */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Select All ({posts.length})
            </span>
          </div>
          
          {selectedPosts.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedPosts.length} selected
              </Badge>
              {selectedInfo.featured > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                  {selectedInfo.featured} featured
                </Badge>
              )}
              {selectedInfo.categories.map(category => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {selectedInfo.hasMore && (
                <Badge variant="outline" className="text-xs">
                  +{selectedInfo.categories.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {selectedPosts.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isExecuting || loading}
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                )}
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                Actions for {selectedPosts.length} posts
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {bulkActions.map((action) => (
                <DropdownMenuItem
                  key={action.type}
                  onClick={() => handleActionClick(action)}
                  className={
                    action.variant === 'destructive' 
                      ? 'text-red-600 focus:text-red-600' 
                      : ''
                  }
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Individual Post Selection */}
      <div className="space-y-2">
        {posts.map((post) => (
          <div
            key={post._id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
              selectedPosts.includes(post._id)
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Checkbox
              checked={selectedPosts.includes(post._id)}
              onCheckedChange={(checked) => handlePostSelection(post._id, checked as boolean)}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {post.title}
                </h4>
                {post.featured && (
                  <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                )}
                <Badge variant="secondary" className="text-xs flex-shrink-0">
                  {post.category?.title || 'Uncategorized'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                {post.excerpt}
              </p>
            </div>
            
            <div className="text-xs text-slate-400 flex-shrink-0">
              {post.readingTime} min read
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirm {confirmAction?.label}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description} 
              <br />
              <strong>This action will affect {selectedPosts.length} post(s).</strong>
              {confirmAction?.type === 'delete' && (
                <span className="text-red-600 font-medium">
                  <br />This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && executeAction(confirmAction)}
              className={
                confirmAction?.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {confirmAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Input Dialog */}
      <AlertDialog open={!!showInputDialog} onOpenChange={() => setShowInputDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {showInputDialog?.label}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {showInputDialog?.description}
              <br />
              This will affect {selectedPosts.length} post(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            {showInputDialog?.inputType === 'category' ? (
              <Select value={inputValue} onValueChange={setInputValue}>
                <SelectTrigger>
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
            ) : showInputDialog?.inputType === 'tags' ? (
              <div>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Example: aviation, training, safety
                </p>
              </div>
            ) : (
              <input
                type="text"
                placeholder="Enter value..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleInputSubmit}
              disabled={!inputValue.trim()}
            >
              Apply Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}