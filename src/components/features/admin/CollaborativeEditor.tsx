'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Edit3,
  Eye,
  Users,
  ArrowRight,
  History,
  Bell,
  BellOff,
  Flag,
  FileText,
  Save,
  RotateCcw
} from 'lucide-react'

interface Author {
  _id: string
  name: string
  email: string
  image?: {
    asset: { url: string }
    alt: string
  }
  authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
}

interface WorkflowComment {
  _id: string
  timestamp: string
  author: Author
  comment: string
  type: 'general' | 'edit' | 'issue' | 'approval' | 'seo'
  resolved: boolean
}

interface WorkflowHistoryItem {
  timestamp: string
  action: 'created' | 'submitted' | 'approved' | 'rejected' | 'published' | 'archived' | 'reassigned'
  performedBy: Author
  notes?: string
}

interface WorkflowData {
  _id: string
  title: string
  contentRef: {
    _id: string
    title: string
    _type: string
  }
  currentStatus: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  assignedTo?: Author
  reviewer?: Author
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  workflowHistory: WorkflowHistoryItem[]
  comments: WorkflowComment[]
  notifications: {
    notifyOnStatusChange: boolean
    notifyOnComment: boolean
    reminderFrequency: 'daily' | 'weekly' | 'none'
  }
}

interface CollaborativeEditorProps {
  workflow: WorkflowData
  availableAuthors: Author[]
  currentUser: Author
  onWorkflowUpdate: (workflow: WorkflowData) => void
  onStatusChange: (workflowId: string, newStatus: string, notes?: string) => void
  onAssignmentChange: (workflowId: string, assignedTo?: string, reviewer?: string) => void
  onCommentAdd: (workflowId: string, comment: string, type: string) => void
  onCommentResolve: (workflowId: string, commentId: string) => void
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  workflow,
  availableAuthors,
  currentUser,
  onWorkflowUpdate,
  onStatusChange,
  onAssignmentChange,
  onCommentAdd,
  onCommentResolve
}) => {
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<string>('general')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAssignee, setSelectedAssignee] = useState(workflow.assignedTo?._id || '')
  const [selectedReviewer, setSelectedReviewer] = useState(workflow.reviewer?._id || '')

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit3 },
    review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Eye },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    published: { label: 'Published', color: 'bg-blue-100 text-blue-800', icon: FileText },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: History }
  }

  const priorityConfig = {
    high: { label: 'High Priority', color: 'bg-red-100 text-red-800', icon: '🔴' },
    medium: { label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    low: { label: 'Low Priority', color: 'bg-green-100 text-green-800', icon: '🟢' }
  }

  const commentTypeConfig = {
    general: { label: 'General Comment', icon: '💬', color: 'bg-blue-100 text-blue-800' },
    edit: { label: 'Edit Request', icon: '✏️', color: 'bg-orange-100 text-orange-800' },
    issue: { label: 'Issue Found', icon: '❌', color: 'bg-red-100 text-red-800' },
    approval: { label: 'Approval', icon: '✅', color: 'bg-green-100 text-green-800' },
    seo: { label: 'SEO Feedback', icon: '🔍', color: 'bg-purple-100 text-purple-800' }
  }

  const canChangeStatus = useCallback((fromStatus: string, toStatus: string) => {
    const userLevel = currentUser.authorLevel
    
    // Admin and senior authors can change any status
    if (userLevel === 'admin' || userLevel === 'senior') {
      return true
    }
    
    // Regular authors can only submit for review
    if (userLevel === 'regular') {
      return fromStatus === 'draft' && toStatus === 'review'
    }
    
    // Guest authors can only work with drafts
    if (userLevel === 'guest') {
      return fromStatus === 'draft' && toStatus === 'draft'
    }
    
    return false
  }, [currentUser.authorLevel])

  const handleStatusChange = async (newStatus: string) => {
    if (!canChangeStatus(workflow.currentStatus, newStatus)) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to change to this status.",
        variant: "destructive",
      })
      return
    }

    try {
      await onStatusChange(workflow._id, newStatus)
      toast({
        title: "Status Updated",
        description: `Workflow status changed to ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow status.",
        variant: "destructive",
      })
    }
  }

  const handleAssignmentChange = async () => {
    try {
      await onAssignmentChange(workflow._id, selectedAssignee, selectedReviewer)
      toast({
        title: "Assignment Updated",
        description: "Workflow assignments have been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignments.",
        variant: "destructive",
      })
    }
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await onCommentAdd(workflow._id, newComment, commentType)
      setNewComment('')
      setCommentType('general')
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the workflow.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentResolve = async (commentId: string) => {
    try {
      await onCommentResolve(workflow._id, commentId)
      toast({
        title: "Comment Resolved",
        description: "Comment has been marked as resolved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve comment.",
        variant: "destructive",
      })
    }
  }

  const unresolvedComments = workflow.comments.filter(comment => !comment.resolved)
  const resolvedComments = workflow.comments.filter(comment => comment.resolved)

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {workflow.title}
              </CardTitle>
              <CardDescription>
                Content: {workflow.contentRef.title}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusConfig[workflow.currentStatus].color}>
                {statusConfig[workflow.currentStatus].label}
              </Badge>
              <Badge className={priorityConfig[workflow.priority].color}>
                {priorityConfig[workflow.priority].icon} {priorityConfig[workflow.priority].label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Assigned: {workflow.assignedTo?.name || 'Unassigned'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Reviewer: {workflow.reviewer?.name || 'Unassigned'}
              </span>
            </div>
            {workflow.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Due: {new Date(workflow.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({unresolvedComments.length})
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          {/* Add New Comment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Comment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commentType">Comment Type</Label>
                <Select value={commentType} onValueChange={setCommentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(commentTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.icon} {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment or feedback..."
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleCommentSubmit} 
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Adding...' : 'Add Comment'}
              </Button>
            </CardContent>
          </Card>

          {/* Unresolved Comments */}
          {unresolvedComments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Unresolved Comments ({unresolvedComments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {unresolvedComments.map((comment) => {
                  const typeConfig = commentTypeConfig[comment.type]
                  return (
                    <div key={comment._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={comment.author.image?.asset?.url} 
                              alt={comment.author.name}
                            />
                            <AvatarFallback>
                              {comment.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={typeConfig.color}>
                            {typeConfig.icon} {typeConfig.label}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCommentResolve(comment._id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Resolve
                        </Button>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Resolved Comments */}
          {resolvedComments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Resolved Comments ({resolvedComments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resolvedComments.map((comment) => {
                  const typeConfig = commentTypeConfig[comment.type]
                  return (
                    <div key={comment._id} className="border rounded-lg p-4 opacity-60">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={comment.author.image?.asset?.url} 
                              alt={comment.author.name}
                            />
                            <AvatarFallback>
                              {comment.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={typeConfig.color}>
                            {typeConfig.icon} {typeConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-green-600">
                            ✅ Resolved
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm">{comment.comment}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Actions</CardTitle>
              <CardDescription>
                Change the status of this content workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(statusConfig).map(([status, config]) => {
                  const canChange = canChangeStatus(workflow.currentStatus, status)
                  const isCurrent = workflow.currentStatus === status
                  
                  return (
                    <Button
                      key={status}
                      variant={isCurrent ? "default" : "outline"}
                      disabled={!canChange || isCurrent}
                      onClick={() => handleStatusChange(status)}
                      className="flex items-center gap-2"
                    >
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </Button>
                  )
                })}
              </div>
              
              {workflow.currentStatus === 'review' && currentUser.authorLevel !== 'guest' && (
                <div className="flex gap-2 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-green-600 hover:text-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Content</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this content? It will be ready for publishing.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleStatusChange('approved')}>
                          Approve
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject Content</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject this content? It will be sent back to draft status.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleStatusChange('draft')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reject
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Assignments</CardTitle>
              <CardDescription>
                Assign authors and reviewers to this workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo">Assigned Author</Label>
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {availableAuthors.map((author) => (
                        <SelectItem key={author._id} value={author._id}>
                          {author.name} ({author.authorLevel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reviewer">Assigned Reviewer</Label>
                  <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {availableAuthors
                        .filter(author => author.authorLevel === 'admin' || author.authorLevel === 'senior')
                        .map((author) => (
                          <SelectItem key={author._id} value={author._id}>
                            {author.name} ({author.authorLevel})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAssignmentChange} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Update Assignments
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow History</CardTitle>
              <CardDescription>
                Complete history of actions taken on this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflow.workflowHistory.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.action}</span>
                        <span className="text-xs text-muted-foreground">
                          by {item.performedBy.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CollaborativeEditor
