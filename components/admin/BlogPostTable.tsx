'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Star,
  Calendar,
  User,
  Tag,
  TrendingUp,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { BlogPostPreview } from '@/lib/types/blog';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { DeletionConfirmationDialog } from './DeletionConfirmationDialog';
import { DeletionStatusIndicator, DeletionProgress } from './DeletionStatusIndicator';
import { useToast } from '@/hooks/use-toast';

interface BlogPostTableProps {
  posts: BlogPostPreview[];
  onDeletePost?: (slug: string) => Promise<void>;
  onToggleFeatured?: (slug: string, featured: boolean) => Promise<void>;
  loading?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
}

type SortField = 'title' | 'publishedAt' | 'category' | 'author' | 'readingTime' | 'featured';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  search: string;
  category: string;
  author: string;
  featured: string;
  difficulty: string;
}

const ITEMS_PER_PAGE = 10;

export function BlogPostTable({ posts, onDeletePost, onToggleFeatured, loading, onSelectionChange }: BlogPostTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    author: '',
    featured: '',
    difficulty: '',
  });
  const [sortField, setSortField] = useState<SortField>('publishedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Deletion-related state
  const [deletionDialog, setDeletionDialog] = useState<{
    isOpen: boolean;
    post: BlogPostPreview | null;
  }>({ isOpen: false, post: null });
  const [deletionProgress, setDeletionProgress] = useState<Map<string, DeletionProgress>>(new Map());
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [deletionError, setDeletionError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const categories = Array.from(new Set(posts.map(post => post.category?.title).filter(Boolean)));
    const authors = Array.from(new Set(posts.map(post => post.author?.name).filter(Boolean)));
    const difficulties = Array.from(new Set(posts.map(post => post.difficulty).filter((d): d is 'beginner' | 'intermediate' | 'advanced' => Boolean(d))));
    
    return { categories, authors, difficulties };
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = !filters.search || 
        post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(filters.search.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())));
      
      const matchesCategory = !filters.category || filters.category === 'all' || post.category?.title === filters.category;
      const matchesAuthor = !filters.author || filters.author === 'all' || post.author?.name === filters.author;
      const matchesFeatured = !filters.featured || filters.featured === 'all' || 
        (filters.featured === 'featured' && post.featured) ||
        (filters.featured === 'regular' && !post.featured);
      const matchesDifficulty = !filters.difficulty || filters.difficulty === 'all' || post.difficulty === filters.difficulty;

      return matchesSearch && matchesCategory && matchesAuthor && matchesFeatured && matchesDifficulty;
    });

    // Sort posts
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle nested properties
      if (sortField === 'category') {
        aValue = a.category?.title || '';
        bValue = b.category?.title || '';
      } else if (sortField === 'author') {
        aValue = a.author?.name || '';
        bValue = b.author?.name || '';
      }

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortOrder === 'asc' ? 
          (aValue === bValue ? 0 : aValue ? 1 : -1) : 
          (aValue === bValue ? 0 : aValue ? -1 : 1);
      }

      // Handle dates
      if (sortField === 'publishedAt') {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate;
      }

      return 0;
    });

    return filtered;
  }, [posts, filters, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / ITEMS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      author: '',
      featured: '',
      difficulty: '',
    });
    setCurrentPage(1);
  };

  const handleSelectPost = (postId: string, selected: boolean) => {
    const newSelectedIds = new Set(selectedIds);
    if (selected) {
      newSelectedIds.add(postId);
    } else {
      newSelectedIds.delete(postId);
    }
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(Array.from(newSelectedIds));
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      const allIds = new Set(paginatedPosts.map(post => post._id));
      setSelectedIds(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  // Enhanced deletion handling
  const handleDeletePost = (post: BlogPostPreview) => {
    setDeletionDialog({ isOpen: true, post });
    setDeletionError(null);
  };

  const handleConfirmDeletion = async () => {
    if (!deletionDialog.post) return;

    const post = deletionDialog.post;
    const identifier = post.slug?.current || post._id;
    
    setIsDeletingPost(true);
    setDeletionError(null);

    // Initialize progress tracking
    const initialProgress: DeletionProgress = {
      status: 'validating',
      message: 'Preparing to delete post...',
      progress: 0,
      postTitle: post.title
    };
    
    setDeletionProgress(prev => new Map(prev.set(identifier, initialProgress)));

    try {
      // Update progress to deleting
      setDeletionProgress(prev => new Map(prev.set(identifier, {
        ...initialProgress,
        status: 'deleting',
        message: 'Deleting post from database...',
        progress: 50
      })));

      // Use the API endpoint instead of direct service call
      const response = await fetch(`/api/blog/posts/${identifier}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          retryAttempts: 3,
          retryDelay: 1000,
          skipCacheInvalidation: false,
          validateBeforeDelete: true
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update progress to cache invalidation
        setDeletionProgress(prev => new Map(prev.set(identifier, {
          status: 'cache-invalidating',
          message: 'Updating cached data...',
          progress: 80,
          postTitle: post.title,
          cacheInvalidated: result.data?.cacheInvalidated
        })));

        // Simulate brief cache invalidation delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        // Success
        setDeletionProgress(prev => new Map(prev.set(identifier, {
          status: 'success',
          message: 'Post successfully deleted',
          progress: 100,
          postTitle: post.title,
          cacheInvalidated: result.data?.cacheInvalidated,
          duration: result.meta?.timestamp ? Date.now() - new Date(result.meta.timestamp).getTime() : undefined
        })));

        // Show success toast
        toast({
          title: "Post Deleted",
          description: `"${post.title}" has been successfully deleted.`,
          variant: "default",
        });

        // Call the original onDeletePost if provided (for parent component updates)
        if (onDeletePost) {
          await onDeletePost(identifier);
        }

        // Close dialog after brief delay
        setTimeout(() => {
          setDeletionDialog({ isOpen: false, post: null });
          setDeletionProgress(prev => {
            const newMap = new Map(prev);
            newMap.delete(identifier);
            return newMap;
          });
        }, 2000);

      } else {
        // Handle deletion failure
        const error = result.error || { message: 'Unknown error occurred' };
        setDeletionProgress(prev => new Map(prev.set(identifier, {
          status: 'error',
          message: error.message,
          error: error,
          postTitle: post.title,
          retryCount: result.retryCount || 0
        })));

        setDeletionError(error.message);

        // Show error toast
        toast({
          title: "Deletion Failed",
          description: error.message,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setDeletionProgress(prev => new Map(prev.set(identifier, {
        status: 'error',
        message: errorMessage,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage,
          category: 'unknown',
          retryable: true
        },
        postTitle: post.title
      })));

      setDeletionError(errorMessage);

      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleRetryDeletion = async () => {
    if (!deletionDialog.post) return;
    
    const identifier = deletionDialog.post.slug?.current || deletionDialog.post._id;
    
    // Update progress to retrying
    setDeletionProgress(prev => new Map(prev.set(identifier, {
      status: 'retrying',
      message: 'Retrying deletion...',
      progress: 25,
      postTitle: deletionDialog.post!.title
    })));

    // Retry the deletion
    await handleConfirmDeletion();
  };

  const handleCancelDeletion = () => {
    setDeletionDialog({ isOpen: false, post: null });
    setDeletionError(null);
    setIsDeletingPost(false);
  };

  const handleToggleFeatured = async (slug: string, currentFeatured: boolean) => {
    if (!onToggleFeatured) return;
    await onToggleFeatured(slug, !currentFeatured);
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-teal-50/50 dark:hover:bg-teal-800/20 transition-all duration-200 text-slate-700 dark:text-slate-300 font-semibold"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          sortField === field && sortOrder === 'desc' && "rotate-180",
          sortField === field ? "text-teal-600 dark:text-teal-400" : "text-slate-400"
        )} />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-100">Blog Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600 dark:text-slate-400">Loading blog posts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-slate-900 dark:text-slate-100">Blog Posts</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Manage and organize your blog content ({filteredAndSortedPosts.length} posts)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
            <Link href="/admin/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <FileText className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
          {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
            />
          </div>
          
          <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filterOptions.categories.map(category => (
                <SelectItem key={category} value={category || 'uncategorized'}>{category || 'Uncategorized'}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.author} onValueChange={(value) => handleFilterChange('author', value)}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200">
              <SelectValue placeholder="All Authors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authors</SelectItem>
              {filterOptions.authors.map(author => (
                <SelectItem key={author || 'unknown'} value={author || 'unknown'}>{author || 'Unknown Author'}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.featured} onValueChange={(value) => handleFilterChange('featured', value)}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200">
              <SelectValue placeholder="All Posts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Posts</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
              <SelectItem value="regular">Regular Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.difficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200/50 dark:border-slate-700/50 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {filterOptions.difficulties.map(difficulty => (
                <SelectItem key={difficulty || 'beginner'} value={difficulty || 'beginner'}>
                  {(difficulty || 'beginner').charAt(0).toUpperCase() + (difficulty || 'beginner').slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="table-wrapper">
        {paginatedPosts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No posts found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {posts.length === 0 
                ? "You haven't created any blog posts yet." 
                : "No posts match your current filters."}
            </p>
            {posts.length === 0 ? (
              <Link href="/admin/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Create Your First Post
                </Button>
              </Link>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
              <Table className="sticky-header">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-900/20 border-b border-slate-200/50 dark:border-slate-700/50">
                    <SortableHeader field="title">Title</SortableHeader>
                    <SortableHeader field="category">Category</SortableHeader>
                    <SortableHeader field="author">Author</SortableHeader>
                    <SortableHeader field="publishedAt">Published</SortableHeader>
                    <SortableHeader field="readingTime">Reading Time</SortableHeader>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPosts.map((post) => (
                    <TableRow key={post._id} className="hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-colors duration-150 border-b border-slate-100 dark:border-slate-800/50">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          {post.featured && (
                            <Star className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {post.title}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                              {post.excerpt}
                            </div>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {post.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {post.category?.title || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {post.author?.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {post.readingTime} min
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {/* Deletion Status Indicator */}
                          {(() => {
                            const identifier = post.slug?.current || post._id;
                            const progress = deletionProgress.get(identifier);
                            
                            if (progress) {
                              return (
                                <DeletionStatusIndicator
                                  progress={progress}
                                  compact={true}
                                  showDetails={false}
                                />
                              );
                            }
                            
                            return (
                              <>
                                <Badge variant="outline" className="w-fit text-green-600 border-green-200">
                                  Published
                                </Badge>
                                {post.difficulty && (
                                  <Badge variant="outline" className="w-fit text-xs">
                                    {post.difficulty.charAt(0).toUpperCase() + post.difficulty.slice(1)}
                                  </Badge>
                                )}
                              </>
                            );
                          })()}
                        </div>
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
                            <DropdownMenuItem asChild>
                              <Link href={`/blog/${post.slug?.current || post._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Post
                              </Link>
                            </DropdownMenuItem>
                            {post.editable ? (
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/edit/${post._id}`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Post
                                </Link>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled>
                                <Edit className="h-4 w-4 mr-2 opacity-50" />
                                Edit Post (Read-only)
                              </DropdownMenuItem>
                            )}
                            {onToggleFeatured && (
                              <DropdownMenuItem 
                                onClick={() => handleToggleFeatured(post.slug?.current || post._id, post.featured || false)}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                {post.featured ? 'Remove from Featured' : 'Mark as Featured'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {onDeletePost && (
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => handleDeletePost(post)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Post
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedPosts.length)} of{' '}
                  {filteredAndSortedPosts.length} posts
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "w-8 h-8 p-0",
                            currentPage === page && "bg-blue-600 text-white"
                          )}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-slate-400">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className={cn(
                            "w-8 h-8 p-0",
                            currentPage === totalPages && "bg-blue-600 text-white"
                          )}
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </CardContent>
    </Card>

    {/* Deletion Confirmation Dialog */}
    <DeletionConfirmationDialog
      isOpen={deletionDialog.isOpen}
      onClose={handleCancelDeletion}
      onConfirm={handleConfirmDeletion}
      post={deletionDialog.post}
      isDeleting={isDeletingPost}
      error={deletionError}
    />
    </>
  );
}