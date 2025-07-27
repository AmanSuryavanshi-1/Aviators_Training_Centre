'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  Calendar,
  FileText,
  Loader2,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Simple interface for automated drafts
interface AutomatedDraft {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  status: string;
  _createdAt: string;
  _updatedAt: string;
  automationMetadata: {
    automationId?: string;
    sourceUrl?: string;
    createdAt: string;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedByName?: string;
    rejectedAt?: string;
  };
}

interface SimpleAutomatedDraftReviewProps {
  className?: string;
}

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  pending_review: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export function SimpleAutomatedDraftReview({ className }: SimpleAutomatedDraftReviewProps) {
  const [drafts, setDrafts] = useState<AutomatedDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<AutomatedDraft | null>(null);
  const [draftDetails, setDraftDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [actionComments, setActionComments] = useState('');

  // Mock editor info - in real app, this would come from auth context
  const editorInfo = {
    editorId: 'admin-001',
    editorName: 'Admin User',
  };

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      let url = '/api/n8n/drafts/simple';
      
      if (activeTab !== 'all') {
        url += `?status=${activeTab}`;
      }
      
      if (searchQuery) {
        url += `${activeTab !== 'all' ? '&' : '?'}search=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await fetch(url);
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
  };

  const fetchDraftDetails = async (draftId: string) => {
    try {
      const response = await fetch(`/api/n8n/drafts/simple/${draftId}`);
      const result = await response.json();

      if (result.success) {
        setDraftDetails(result.data.draft);
      } else {
        toast.error('Failed to fetch draft details');
      }
    } catch (error) {
      console.error('Error fetching draft details:', error);
      toast.error('Error loading draft details');
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrafts();
  };

  const handleDraftAction = async (action: 'approve' | 'reject') => {
    if (!selectedDraft) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/n8n/drafts/simple/${selectedDraft._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...editorInfo,
          comments: actionComments
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Draft ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        setActionComments('');
        await fetchDrafts();
        
        // Update the selected draft status
        if (selectedDraft) {
          setSelectedDraft({
            ...selectedDraft,
            status: action === 'approve' ? 'approved' : 'rejected'
          });
          
          // Also update draft details if available
          if (draftDetails) {
            await fetchDraftDetails(selectedDraft._id);
          }
        }
      } else {
        toast.error(result.error || `Failed to ${action} draft`);
      }
    } catch (error) {
      console.error(`Error ${action}ing draft:`, error);
      toast.error(`Error ${action}ing draft`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!selectedDraft) return;
    
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch(
        `/api/n8n/drafts/simple/${selectedDraft._id}?editorId=${editorInfo.editorId}&editorName=${encodeURIComponent(editorInfo.editorName)}&reason=Manual deletion`,
        { method: 'DELETE' }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Draft deleted successfully');
        setSelectedDraft(null);
        setDraftDetails(null);
        await fetchDrafts();
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

  const filteredDrafts = drafts;

  if (loading && drafts.length === 0) {
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
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search drafts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 w-[200px]"
                  />
                </div>
                <Button type="submit" variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDrafts}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs and Content */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Drafts</TabsTrigger>
          <TabsTrigger value="pending_review">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Drafts List */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Draft List</CardTitle>
                </CardHeader>
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
                        const StatusIcon = statusConfig[draft.status]?.icon || FileText;
                        
                        return (
                          <div
                            key={draft._id}
                            className={cn(
                              "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors",
                              selectedDraft?._id === draft._id && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600"
                            )}
                            onClick={() => {
                              setSelectedDraft(draft);
                              fetchDraftDetails(draft._id);
                            }}
                          >
                            <div className="flex items-start gap-3">
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
                                  
                                  <Badge className={statusConfig[draft.status]?.color || "bg-gray-100 text-gray-800"}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig[draft.status]?.label || "Unknown"}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(draft._createdAt)}
                                  </div>
                                </div>
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
            <div className="lg:col-span-2">
              {selectedDraft ? (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-slate-900 dark:text-slate-100 line-clamp-2">
                          {selectedDraft.title}
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          {selectedDraft.automationMetadata.automationId ? 
                            `Automation ID: ${selectedDraft.automationMetadata.automationId}` : 
                            `Created: ${formatDate(selectedDraft._createdAt)}`}
                        </CardDescription>
                      </div>
                      <Badge className={statusConfig[selectedDraft.status]?.color || "bg-gray-100 text-gray-800"}>
                        {statusConfig[selectedDraft.status]?.label || "Unknown"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Excerpt</h3>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedDraft.excerpt}
                      </p>
                    </div>

                    <Separator />

                    {draftDetails && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Content Preview</h3>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-sm text-slate-700 dark:text-slate-300 max-h-[300px] overflow-y-auto">
                          {draftDetails.body ? (
                            <div>
                              {draftDetails.body.map((block: any, i: number) => (
                                <div key={i} className="mb-4">
                                  {block.children?.map((child: any, j: number) => (
                                    <p key={j}>{child.text}</p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p>No content available</p>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    {selectedDraft.status === 'pending_review' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">Actions</h3>
                        
                        <Textarea
                          placeholder="Add comments (optional)"
                          value={actionComments}
                          onChange={(e) => setActionComments(e.target.value)}
                          className="h-24"
                        />
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDraftAction('approve')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          
                          <Button
                            onClick={() => handleDraftAction('reject')}
                            variant="destructive"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                          
                          <Button
                            onClick={handleDeleteDraft}
                            variant="outline"
                            className="ml-auto"
                            disabled={actionLoading}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Status Information */}
                    {selectedDraft.status === 'approved' && (
                      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-300">Approved</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-400">
                          This draft was approved by {selectedDraft.automationMetadata.approvedByName || 'an editor'} 
                          {selectedDraft.automationMetadata.approvedAt && ` on ${formatDate(selectedDraft.automationMetadata.approvedAt)}`}.
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedDraft.status === 'rejected' && (
                      <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <AlertTitle className="text-red-800 dark:text-red-300">Rejected</AlertTitle>
                        <AlertDescription className="text-red-700 dark:text-red-400">
                          This draft was rejected by {selectedDraft.automationMetadata.rejectedByName || 'an editor'} 
                          {selectedDraft.automationMetadata.rejectedAt && ` on ${formatDate(selectedDraft.automationMetadata.rejectedAt)}`}.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* View/Edit Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full flex items-center justify-center">
                  <CardContent className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No draft selected
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Select a draft from the list to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}