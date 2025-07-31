'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Trash2,
  Star,
  StarOff,
  Tag,
  Copy,
  Download,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface BulkOperationsPanelProps {
  selectedPosts: string[];
  onBulkAction: (action: string, postIds: string[], options?: any) => Promise<void>;
  onClearSelection: () => void;
  availableCategories: string[];
}

export function BulkOperationsPanel({
  selectedPosts,
  onBulkAction,
  onClearSelection,
  availableCategories
}: BulkOperationsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newTags, setNewTags] = useState('');

  const handleBulkAction = async (action: string, options?: any) => {
    if (selectedPosts.length === 0) {
      toast.error('No posts selected');
      return;
    }

    setIsLoading(true);
    try {
      await onBulkAction(action, selectedPosts, options);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(error instanceof Error ? error.message : 'Bulk action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    await handleBulkAction('change-category', { category: selectedCategory });
    setShowCategoryDialog(false);
    setSelectedCategory('');
  };

  const handleAddTags = async () => {
    if (!newTags.trim()) {
      toast.error('Please enter tags');
      return;
    }

    const tags = newTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tags.length === 0) {
      toast.error('Please enter valid tags');
      return;
    }

    await handleBulkAction('add-tags', { tags });
    setShowTagsDialog(false);
    setNewTags('');
  };

  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedPosts.length} selected posts? This action cannot be undone.`)) {
      handleBulkAction('delete');
    }
  };

  if (selectedPosts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-teal-200 dark:border-teal-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-teal-800 dark:text-teal-200">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bulk Operations
          </div>
          <Badge variant="secondary" className="bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100">
            {selectedPosts.length} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('feature')}
            disabled={isLoading}
            className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300"
          >
            <Star className="h-4 w-4 mr-1" />
            Feature
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('unfeature')}
            disabled={isLoading}
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <StarOff className="h-4 w-4 mr-1" />
            Unfeature
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('duplicate')}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Copy className="h-4 w-4 mr-1" />
            Duplicate
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAction('export')}
            disabled={isLoading}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>

        <Separator />

        {/* Advanced Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Category Change Dialog */}
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Tag className="h-4 w-4 mr-1" />
                Change Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Category</DialogTitle>
                <DialogDescription>
                  Select a new category for {selectedPosts.length} selected posts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">New Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCategoryChange} disabled={isLoading}>
                  Update Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Tags Dialog */}
          <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Tag className="h-4 w-4 mr-1" />
                Add Tags
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Tags</DialogTitle>
                <DialogDescription>
                  Add tags to {selectedPosts.length} selected posts. Separate multiple tags with commas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="e.g., aviation, pilot training, DGCA"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTagsDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTags} disabled={isLoading}>
                  Add Tags
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={confirmDelete}
            disabled={isLoading}
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>

        <Separator />

        {/* Clear Selection */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedPosts.length} posts selected for bulk operations
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
