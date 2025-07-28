'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  MessageSquare,
  Calendar,
  User,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle2,
  History,
  Settings,
  Target,
  BarChart3,
  Plus,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Types for automated drafts
interface AutomatedDraft {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  body?: any[];
  status: 'draft' | 'pending_review' | 'needs_revision' | 'approved' | 'rejected';
  readingTime: number;
  category?: {
    _id: string;
    title: string;
    slug: { current: string };
  };
  author?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  tags?: string[];
  automationMetadata: {
    automationId: string;
    sourceUrl?: string;
    createdAt: string;
    validationScore: number;
    requiresHumanReview: boolean;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedByName?: string;
    rejectedAt?: string;
    revisionRequestedBy?: string;
    revisionRequestedByName?: string;
    revisionRequestedAt?: string;
    revisionComments?: string;
    revisionRequests?: Array<{
      section: string;
      comment: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    editHistory?: Array<{
      editorId: string;
      editorName: string;
      timestamp: string;
      reason: string;
      changes: string[];
    }>;
  };
  seoEnhancement?: {
    seoTitle?: string;
    seoDescription?: string;
    focusKeyword?: string;
  };
  _createdAt: string;
  _updatedAt: string;
}

interface AuditLog {
  _id: string;
  type: string;
  automationId: string;
  status: string;
  timestamp: string;
  userId?: string;
  metadata?: any;
}

interface DraftFilters {
  status: string;
  requiresHumanReview: string;
  validationScoreMin: string;
  validationScoreMax: string;
  search: string;
}

interface RevisionRequest {
  section: string;
  comment: string;
  priority: 'low' | 'medium' | 'high';
}

interface AutomatedDraftReviewProps {
  className?: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  needs_revision: { label: 'Needs Revision', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-blue-100 text-blue-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'bg-red-100 text-red-800' },
};

export function AutomatedDraftReview({ className }: AutomatedDraftReviewProps) {
  const [drafts, setDrafts] = useState<AutomatedDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<AutomatedDraft | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState<DraftFilters>({
    status: '',
    requiresHumanReview: '',
    validationScoreMin: '',
    validationScoreMax: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [bulkActionDialog, setBulkActionDialog] = useState<string | null>(null);
  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([]);
  const [actionComments, setActionComments] = useState('');
  const [editingDraft, setEditingDraft] = useState<AutomatedDraft | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    tags: [] as string[],
    category: '',
    seoTitle: '',
    seoDescription: '',
    focusKeyword: '',
  });

  // Mock editor info - in real app, this would come from auth context
  const editorInfo = {
    editorId: 'admin-001',
    editorName: 'Admin User',
  };

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/n8n/drafts?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setDrafts(result.data.drafts);
      } else {
        toast.error('Failed to fetch automated drafts');
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error('Error loading automated drafts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchDraftDetails = useCallback(async (draftId: string) => {
    try {
      const response = await fetch(`/api/n8n/drafts/${draftId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedDraft(result.data.draft);
        setAuditLogs(result.data.auditLogs || []);
      } else {
        toast.error('Failed to fetch draft details');
      }
    } catch (error) {
      console.error('Error fetching draft details:', error);
      toast.error('Error loading draft details');
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleFilterChange = (key: keyof DraftFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      requiresHumanReview: '',
      validationScoreMin: '',
      validationScoreMax: '',
      search: '',
    });
  };

  const handleDraftAction = async (
    draftId: string,
    action: 'approve' | 'reject' | 'request_revision' | 'publish',
    options: {
      comments?: string;
      revisionRequests?: RevisionRequest[];
      publishImmediately?: boolean;
    } = {}
  ) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/n8n/drafts/${draftId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...editorInfo,
          comments: options.comments,
          revisionRequests: options.revisionRequests,
          publishImmediately: options.publishImmediately,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Draft ${action} completed successfully`);
        await fetchDrafts();
        if (selectedDraft?._id === draftId) {
          await fetchDraftDetails(draftId);
        }
      } else {
        toast.error(result.error || `Failed to ${action} draft`);
      }
    } catch (error) {
      console.error(`Error ${action} draft:`, error);
      toast.error(`Error ${action} draft`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDrafts.length === 0) {
      toast.error('No drafts selected');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/n8n/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          draftIds: selectedDrafts,
          editorInfo,
          publishImmediately: action === 'approve_all',
          rejectionReason: actionComments,
          revisionRequests: revisionRequests,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Bulk ${action} completed successfully`);
        setSelectedDrafts([]);
        setBulkActionDialog(null);
        setActionComments('');
        setRevisionRequests([]);
        await fetchDrafts();
      } else {
        toast.error(result.error || `Failed to perform bulk ${action}`);
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Error performing bulk ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditDraft = async () => {
    if (!editingDraft) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/n8n/drafts/${editingDraft._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          ...editorInfo,
          updateReason: 'Manual content update',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Draft updated successfully');
        setEditingDraft(null);
        await fetchDrafts();
        if (selectedDraft?._id === editingDraft._id) {
          await fetchDraftDetails(editingDraft._id);
        }
      } else {
        toast.error(result.error || 'Failed to update draft');
      }
    } catch (error) {
      console.error('Error updating draft:', error);
      toast.error('Error updating draft');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this automated draft? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/n8n/drafts/${draftId}?editorId=${editorInfo.editorId}&editorName=${encodeURIComponent(editorInfo.editorName)}&reason=Manual deletion`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Draft deleted successfully');
        await fetchDrafts();
        if (selectedDraft?._id === draftId) {
          setSelectedDraft(null);
        }
      } else {
        toast.error(result.error || 'Failed to delete draft');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Error deleting draft');
    } finally {
      setActionLoading(false);
    }
  };

  const addRevisionRequest = () => {
    setRevisionRequests(prev => [...prev, { section: '', comment: '', priority: 'medium' }]);
  };

  const updateRevisionRequest = (index: number, field: keyof RevisionRequest, value: string) => {
    setRevisionRequests(prev => prev.map((req, i) => 
      i === index ? { ...req, [field]: value } : req
    ));
  };

  const removeRevisionRequest = (index: number) => {
    setRevisionRequests(prev => prev.filter((_, i) => i !== index));
  };

  const openEditDialog = (draft: AutomatedDraft) => {
    setEditingDraft(draft);
    setEditFormData({
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.body ? JSON.stringify(draft.body) : '',
      tags: draft.tags || [],
      category: draft.category?._id || '',
      seoTitle: draft.seoEnhancement?.seoTitle || '',
      seoDescription: draft.seoEnhancement?.seoDescription || '',
      focusKeyword: draft.seoEnhancement?.focusKeyword || '',
    });
  };

  const getValidationScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDrafts = drafts.filter(draft => {
    if (filters.search && !draft.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Card className={cn("bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automated Draft Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">Loading automated drafts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
 
 return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Bot className="h-5 w-5" />
                Automated Draft Review
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Review and manage AI-generated blog drafts ({filteredDrafts.length} drafts)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDrafts}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              {selectedDrafts.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Bulk Actions ({selectedDrafts.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setBulkActionDialog('approve_all')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkActionDialog('reject_all')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject All
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBulkActionDialog('mark_for_review')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Mark for Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Filters */}
        {showFilters && (
          <CardContent className="border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search drafts..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.requiresHumanReview} onValueChange={(value) => handleFilterChange('requiresHumanReview', value)}>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                  <SelectValue placeholder="Review Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Requires Review</SelectItem>
                  <SelectItem value="false">Auto-Approved</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Score (0-100)"
                value={filters.validationScoreMin}
                onChange={(e) => handleFilterChange('validationScoreMin', e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />

              <div className="flex gap-2">
                <Input
                  placeholder="Max Score"
                  value={filters.validationScoreMax}
                  onChange={(e) => handleFilterChange('validationScoreMax', e.target.value)}
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drafts List */}
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="p-0">
              {filteredDrafts.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No automated drafts found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {drafts.length === 0 
                      ? "No automated drafts have been created yet." 
                      : "No drafts match your current filters."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredDrafts.map((draft) => {
                    const StatusIcon = statusConfig[draft.status].icon;
                    const isSelected = selectedDrafts.includes(draft._id);
                    
                    return (
                      <div
                        key={draft._id}
                        className={cn(
                          "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors",
                          selectedDraft?._id === draft._id && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600"
                        )}
                        onClick={() => fetchDraftDetails(draft._id)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedDrafts(prev => 
                                isSelected 
                                  ? prev.filter(id => id !== draft._id)
                                  : [...prev, draft._id]
                              );
                            }}
                            className="mt-1"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {draft.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                  {draft.excerpt}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <Badge className={statusConfig[draft.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[draft.status].label}
                                </Badge>
                                <div className={cn("text-sm font-medium", getValidationScoreColor(draft.automationMetadata.validationScore))}>
                                  {draft.automationMetadata.validationScore}%
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(draft.automationMetadata.createdAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {draft.readingTime} min read
                              </div>
                              {draft.category && (
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {draft.category.title}
                                </div>
                              )}
                              {draft.automationMetadata.requiresHumanReview && (
                                <Badge variant="outline" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Review Required
                                </Badge>
                              )}
                            </div>
                            
                            {draft.tags && draft.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {draft.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {draft.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{draft.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Draft Details */}
        <div className="space-y-6">
          {selectedDraft ? (
            <>
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-slate-900 dark:text-slate-100 line-clamp-2">
                        {selectedDraft.title}
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Automation ID: {selectedDraft.automationMetadata.automationId}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEditDialog(selectedDraft)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteDraft(selectedDraft._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Draft
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Status</Label>
                      <div className="mt-1">
                        <Badge className={statusConfig[selectedDraft.status].color}>
                          {statusConfig[selectedDraft.status].label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400">Validation Score</Label>
                      <div className={cn("text-lg font-semibold mt-1", getValidationScoreColor(selectedDraft.automationMetadata.validationScore))}>
                        {selectedDraft.automationMetadata.validationScore}%
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs text-slate-500 dark:text-slate-400">Excerpt</Label>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {selectedDraft.excerpt}
                    </p>
                  </div>

                  {selectedDraft.seoEnhancement && (
                    <div>
                      <Label className="text-xs text-slate-500 dark:text-slate-400">SEO Focus</Label>
                      <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                        {selectedDraft.seoEnhancement.focusKeyword || 'No focus keyword'}
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {selectedDraft.status === 'pending_review' && (
                      <>
                        <Button
                          onClick={() => handleDraftAction(selectedDraft._id, 'approve', { publishImmediately: false })}
                          disabled={actionLoading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Draft
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Request Revision
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Request Revision</DialogTitle>
                              <DialogDescription>
                                Specify what needs to be revised in this automated draft.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>General Comments</Label>
                                <Textarea
                                  placeholder="Provide general feedback about the draft..."
                                  value={actionComments}
                                  onChange={(e) => setActionComments(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Specific Revision Requests</Label>
                                  <Button type="button" size="sm" onClick={addRevisionRequest}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Request
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  {revisionRequests.map((request, index) => (
                                    <div key={index} className="p-3 border rounded-lg space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Input
                                          placeholder="Section (e.g., Introduction, SEO, Content)"
                                          value={request.section}
                                          onChange={(e) => updateRevisionRequest(index, 'section', e.target.value)}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removeRevisionRequest(index)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <Textarea
                                        placeholder="Describe what needs to be changed..."
                                        value={request.comment}
                                        onChange={(e) => updateRevisionRequest(index, 'comment', e.target.value)}
                                        rows={2}
                                      />
                                      <Select
                                        value={request.priority}
                                        onValueChange={(value) => updateRevisionRequest(index, 'priority', value as 'low' | 'medium' | 'high')}
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="low">Low Priority</SelectItem>
                                          <SelectItem value="medium">Medium Priority</SelectItem>
                                          <SelectItem value="high">High Priority</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={() => handleDraftAction(selectedDraft._id, 'request_revision', {
                                  comments: actionComments,
                                  revisionRequests: revisionRequests
                                })}
                                disabled={actionLoading}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Send Revision Request
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          onClick={() => handleDraftAction(selectedDraft._id, 'reject')}
                          disabled={actionLoading}
                          variant="destructive"
                          className="w-full"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Draft
                        </Button>
                      </>
                    )}

                    {selectedDraft.status === 'approved' && (
                      <Button
                        onClick={() => handleDraftAction(selectedDraft._id, 'publish')}
                        disabled={actionLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Publish Now
                      </Button>
                    )}

                    {selectedDraft.status === 'needs_revision' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Revision Required</AlertTitle>
                        <AlertDescription>
                          This draft needs revision before it can be approved.
                          {selectedDraft.automationMetadata.revisionComments && (
                            <div className="mt-2 text-sm">
                              <strong>Comments:</strong> {selectedDraft.automationMetadata.revisionComments}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Audit Log */}
              {auditLogs.length > 0 && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <History className="h-4 w-4" />
                      Activity Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {auditLogs.map((log) => (
                          <div key={log._id} className="text-sm p-2 bg-slate-50 dark:bg-slate-700 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{log.type.replace('_', ' ')}</span>
                              <span className="text-xs text-slate-500">
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                            {log.metadata && (
                              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {JSON.stringify(log.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="text-center py-12">
                <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Select a Draft
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose a draft from the list to view details and take actions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Draft Dialog */}
      <Dialog open={!!editingDraft} onOpenChange={() => setEditingDraft(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Automated Draft</DialogTitle>
            <DialogDescription>
              Make changes to the automated draft content before approval.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="content" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={editFormData.excerpt}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={editFormData.content}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  className="font-mono"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-4">
              <div>
                <Label>SEO Title</Label>
                <Input
                  value={editFormData.seoTitle}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea
                  value={editFormData.seoDescription}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Focus Keyword</Label>
                <Input
                  value={editFormData.focusKeyword}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, focusKeyword: e.target.value }))}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={editFormData.tags.join(', ')}
                  onChange={(e) => setEditFormData(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDraft(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditDraft} disabled={actionLoading}>
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialogs */}
      <Dialog open={!!bulkActionDialog} onOpenChange={() => setBulkActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkActionDialog === 'approve_all' && 'Approve Selected Drafts'}
              {bulkActionDialog === 'reject_all' && 'Reject Selected Drafts'}
              {bulkActionDialog === 'mark_for_review' && 'Mark for Review'}
            </DialogTitle>
            <DialogDescription>
              This action will affect {selectedDrafts.length} selected draft(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Comments (Optional)</Label>
              <Textarea
                placeholder="Add comments for this bulk action..."
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkActionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleBulkAction(bulkActionDialog!)}
              disabled={actionLoading}
              variant={bulkActionDialog === 'reject_all' ? 'destructive' : 'default'}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Confirm Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}