'use client'

import React, { useState, useEffect } from 'react'
import CollaborativeEditor from "@/components/features/admin/CollaborativeEditor";
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Filter,
  Search,
  Plus
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
  _createdAt: string
  _updatedAt: string
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowData[]>([])
  const [authors, setAuthors] = useState<Author[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    assignedTo: 'all',
    priority: 'all',
    search: ''
  })

  // Mock current user - in real app this would come from auth
  const currentUser: Author = {
    _id: 'current-user',
    name: 'Current User',
    email: 'user@aviatorstrainingcentre.com',
    authorLevel: 'admin'
  }

  const statusConfig = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
    review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    published: { label: 'Published', color: 'bg-blue-100 text-blue-800', icon: FileText },
    archived: { label: 'Archived', color: 'bg-gray-100 text-gray-600', icon: FileText }
  }

  const priorityConfig = {
    high: { label: 'High', color: 'bg-red-100 text-red-800', icon: '🔴' },
    medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    low: { label: 'Low', color: 'bg-green-100 text-green-800', icon: '🟢' }
  }

  // Fetch workflows and authors
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch workflows
      const workflowsResponse = await fetch('/api/admin/workflows')
      const workflowsResult = await workflowsResponse.json()

      // Fetch authors
      const authorsResponse = await fetch('/api/admin/authors')
      const authorsResult = await authorsResponse.json()

      if (workflowsResult.success && authorsResult.success) {
        setWorkflows(workflowsResult.data)
        setAuthors(authorsResult.data)
        setError(null)
      } else {
        throw new Error(workflowsResult.error || authorsResult.error || 'Failed to fetch data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle workflow updates
  const handleWorkflowUpdate = (workflow: WorkflowData) => {
    // Handle async operation without making the function async
    (async () => {
      try {
        const response = await fetch(`/api/admin/workflows/${workflow._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(workflow),
        })

        const result = await response.json()
        if (result.success) {
          setWorkflows(prev => 
            prev.map(w => w._id === workflow._id ? { ...w, ...workflow } : w)
          )
          setSelectedWorkflow({ ...selectedWorkflow!, ...workflow })
        } else {
          throw new Error(result.error)
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update workflow",
          variant: "destructive",
        })
      }
    })()
  }

  // Handle status changes
  const handleStatusChange = async (workflowId: string, newStatus: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          performedBy: currentUser._id,
          notes
        }),
      })

      const result = await response.json()
      if (result.success) {
        // Refresh data
        await fetchData()
        if (selectedWorkflow?._id === workflowId) {
          const updatedWorkflow = workflows.find(w => w._id === workflowId)
          if (updatedWorkflow) {
            setSelectedWorkflow(updatedWorkflow)
          }
        }
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  // Handle assignment changes
  const handleAssignmentChange = async (workflowId: string, assignedTo?: string, reviewer?: string) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo,
          reviewer,
          performedBy: currentUser._id
        }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchData()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update assignments",
        variant: "destructive",
      })
    }
  }

  // Handle comment addition
  const handleCommentAdd = async (workflowId: string, comment: string, type: string) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment,
          type,
          author: currentUser._id
        }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchData()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    }
  }

  // Handle comment resolution
  const handleCommentResolve = async (workflowId: string, commentId: string) => {
    try {
      const response = await fetch(`/api/admin/workflows/${workflowId}/comments/${commentId}/resolve`, {
        method: 'POST',
      })

      const result = await response.json()
      if (result.success) {
        await fetchData()
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resolve comment",
        variant: "destructive",
      })
    }
  }

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filters.status === 'all' || workflow.currentStatus === filters.status
    const matchesAssignee = filters.assignedTo === 'all' || workflow.assignedTo?._id === filters.assignedTo
    const matchesPriority = filters.priority === 'all' || workflow.priority === filters.priority
    const matchesSearch = !filters.search || 
      workflow.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      workflow.contentRef.title.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesAssignee && matchesPriority && matchesSearch
  })

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Workflows</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchData}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (selectedWorkflow) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedWorkflow(null)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Button>
        </div>
        
        <CollaborativeEditor
          workflow={selectedWorkflow}
          availableAuthors={authors}
          currentUser={currentUser}
          onWorkflowUpdate={handleWorkflowUpdate}
          onStatusChange={handleStatusChange}
          onAssignmentChange={handleAssignmentChange}
          onCommentAdd={handleCommentAdd}
          onCommentResolve={handleCommentResolve}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Workflows</h1>
          <p className="text-muted-foreground">
            Manage collaborative editing and approval workflows
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search workflows..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.priority} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkflows.map((workflow) => {
          const statusConfig_ = statusConfig[workflow.currentStatus]
          const priorityConfig_ = priorityConfig[workflow.priority]
          const unresolvedComments = workflow.comments.filter(c => !c.resolved).length

          return (
            <Card 
              key={workflow._id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {workflow.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {workflow.contentRef.title}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge className={statusConfig_.color}>
                      {statusConfig_.label}
                    </Badge>
                    <Badge className={priorityConfig_.color}>
                      {priorityConfig_.icon} {priorityConfig_.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>
                      Author: {workflow.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      Reviewer: {workflow.reviewer?.name || 'Unassigned'}
                    </span>
                  </div>
                  {workflow.dueDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>
                        Due: {new Date(workflow.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {unresolvedComments > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{unresolvedComments} unresolved comment{unresolvedComments !== 1 ? 's' : ''}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Updated {new Date(workflow._updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workflows Found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.status !== 'all' || filters.search
                ? 'No workflows match your current filters.'
                : 'Get started by creating your first workflow.'
              }
            </p>
            {filters.status === 'all' && !filters.search && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Workflow
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
