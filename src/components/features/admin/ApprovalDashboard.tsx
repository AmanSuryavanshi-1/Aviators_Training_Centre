'use client'

import React, { useState, useEffect } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Filter,
  Search,
  Eye,
  MessageSquare,
  Flag,
  Zap,
  Timer,
  Award,
  Target,
  Activity
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

interface ApprovalStage {
  stageId: string
  name: string
  description: string
  order: number
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  requiredApprovals: number
  approverLevels: string[]
  specificApprovers: Author[]
  startedAt?: string
  completedAt?: string
  dueDate?: string
  canSkip: boolean
  isParallel: boolean
  escalationHours?: number
  escalateTo: string[]
}

interface ApprovalDecision {
  decisionId: string
  stageId: string
  approver: Author
  decision: 'approve' | 'reject' | 'request_changes'
  timestamp: string
  notes?: string
  conditions?: string[]
  priority: 'high' | 'medium' | 'low'
  relatedFields?: string[]
}

interface ApprovalWorkflow {
  _id: string
  contentRef: {
    _id: string
    title: string
    _type: string
  }
  workflowId: string
  currentStage: number
  status: 'active' | 'completed' | 'cancelled'
  stages: ApprovalStage[]
  decisions: ApprovalDecision[]
  totalApprovals: number
  totalRejections: number
  createdAt: string
  completedAt?: string
  metadata: {
    contentType: string
    contentArea?: string
    wordCount?: number
    hasImages?: boolean
    hasSEOData?: boolean
    originalAuthor: Author
    requestedBy: Author
    priority: 'high' | 'medium' | 'low'
  }
  pendingEscalations?: Array<{
    stageId: string
    shouldEscalate: boolean
    escalateTo: string[]
    reason: string
  }>
}

interface ApprovalDashboardProps {
  currentUser: Author
  availableAuthors: Author[]
}

const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({
  currentUser,
  availableAuthors
}) => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedToMe: false,
    search: ''
  })
  const [showDecisionDialog, setShowDecisionDialog] = useState(false)
  const [pendingDecision, setPendingDecision] = useState<{
    workflowId: string
    stageId: string
    decision: string
    notes: string
    priority: string
  }>({
    workflowId: '',
    stageId: '',
    decision: '',
    notes: '',
    priority: 'medium'
  })

  const statusConfig = {
    active: { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: Clock },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: XCircle }
  }

  const priorityConfig = {
    high: { label: 'High Priority', color: 'bg-red-100 text-red-800', icon: '🔴' },
    medium: { label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    low: { label: 'Low Priority', color: 'bg-green-100 text-green-800', icon: '🟢' }
  }

  const decisionConfig = {
    approve: { label: 'Approve', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    reject: { label: 'Reject', color: 'bg-red-100 text-red-800', icon: XCircle },
    request_changes: { label: 'Request Changes', color: 'bg-orange-100 text-orange-800', icon: MessageSquare }
  }

  // Fetch approval workflows
  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/approval-workflows')
      const result = await response.json()

      if (result.success) {
        setWorkflows(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch approval workflows",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Submit approval decision
  const handleDecisionSubmit = async () => {
    try {
      const response = await fetch(`/api/admin/workflows/${pendingDecision.workflowId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageId: pendingDecision.stageId,
          approverId: currentUser._id,
          decision: pendingDecision.decision,
          notes: pendingDecision.notes,
          priority: pendingDecision.priority
        }),
      })

      const result = await response.json()
      if (result.success) {
        await fetchWorkflows()
        setShowDecisionDialog(false)
        setPendingDecision({
          workflowId: '',
          stageId: '',
          decision: '',
          notes: '',
          priority: 'medium'
        })
        toast({
          title: "Decision Submitted",
          description: `Your ${pendingDecision.decision} decision has been recorded.`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit decision",
        variant: "destructive",
      })
    }
  }

  // Open decision dialog
  const openDecisionDialog = (workflow: ApprovalWorkflow, stageId: string, decision: string) => {
    setPendingDecision({
      workflowId: workflow.workflowId,
      stageId,
      decision,
      notes: '',
      priority: 'medium'
    })
    setShowDecisionDialog(true)
  }

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filters.status === 'all' || workflow.status === filters.status
    const matchesPriority = filters.priority === 'all' || workflow.metadata.priority === filters.priority
    const matchesSearch = !filters.search || 
      workflow.contentRef.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      workflow.metadata.originalAuthor.name.toLowerCase().includes(filters.search.toLowerCase())
    
    let matchesAssignment = true
    if (filters.assignedToMe) {
      const currentStage = workflow.stages[workflow.currentStage]
      matchesAssignment = currentStage && (
        currentStage.approverLevels.includes(currentUser.authorLevel) ||
        currentStage.specificApprovers.some(approver => approver._id === currentUser._id)
      )
    }
    
    return matchesStatus && matchesPriority && matchesSearch && matchesAssignment
  })

  // Calculate statistics
  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    pendingMyApproval: workflows.filter(w => {
      if (w.status !== 'active') return false
      const currentStage = w.stages[w.currentStage]
      return currentStage && (
        currentStage.approverLevels.includes(currentUser.authorLevel) ||
        currentStage.specificApprovers.some(approver => approver._id === currentUser._id)
      )
    }).length,
    escalations: workflows.reduce((sum, w) => sum + (w.pendingEscalations?.length || 0), 0)
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Approval Dashboard</h1>
          <p className="text-muted-foreground">
            Manage content approval workflows and decisions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending My Approval</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingMyApproval}</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Escalations</p>
                <p className="text-2xl font-bold text-red-600">{stats.escalations}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.priority} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={filters.assignedToMe ? "default" : "outline"}
              onClick={() => setFilters(prev => ({ ...prev, assignedToMe: !prev.assignedToMe }))}
            >
              <User className="h-4 w-4 mr-2" />
              My Approvals
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredWorkflows.map((workflow) => {
          const statusConfig_ = statusConfig[workflow.status]
          const priorityConfig_ = priorityConfig[workflow.metadata.priority]
          const currentStage = workflow.stages[workflow.currentStage]
          const canApprove = currentStage && workflow.status === 'active' && (
            currentStage.approverLevels.includes(currentUser.authorLevel) ||
            currentStage.specificApprovers.some(approver => approver._id === currentUser._id)
          )

          return (
            <Card key={workflow._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {workflow.contentRef.title}
                      {workflow.pendingEscalations && workflow.pendingEscalations.length > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Escalated
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      by {workflow.metadata.originalAuthor.name} • {workflow.metadata.contentType}
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
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">
                      Stage {workflow.currentStage + 1} of {workflow.stages.length}
                    </span>
                  </div>
                  <Progress 
                    value={((workflow.currentStage + 1) / workflow.stages.length) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Current Stage Info */}
                {currentStage && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{currentStage.name}</span>
                      <Badge variant="outline">
                        {currentStage.requiredApprovals} approval{currentStage.requiredApprovals !== 1 ? 's' : ''} needed
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{currentStage.description}</p>
                  </div>
                )}

                {/* Recent Decisions */}
                {workflow.decisions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recent Decisions</h4>
                    <div className="space-y-2">
                      {workflow.decisions.slice(-2).map((decision) => {
                        const decisionConfig_ = decisionConfig[decision.decision]
                        return (
                          <div key={decision.decisionId} className="flex items-center gap-2 text-sm">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={decision.approver.image?.asset?.url} alt={decision.approver.name} />
                              <AvatarFallback className="text-xs">
                                {decision.approver.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{decision.approver.name}</span>
                            <Badge className={decisionConfig_.color}>
                              {decisionConfig_.label}
                            </Badge>
                            <span className="text-muted-foreground">
                              {new Date(decision.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(workflow.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {canApprove && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => openDecisionDialog(workflow, currentStage.stageId, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDecisionDialog(workflow, currentStage.stageId, 'reject')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
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
            <p className="text-muted-foreground">
              {filters.assignedToMe || filters.search || filters.status !== 'all'
                ? 'No workflows match your current filters.'
                : 'No approval workflows have been created yet.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingDecision.decision === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {pendingDecision.decision === 'approve' ? 'Approve Content' : 'Reject Content'}
            </DialogTitle>
            <DialogDescription>
              Please provide your decision details and any additional notes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={pendingDecision.priority} 
                onValueChange={(value) => setPendingDecision(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 High Priority</SelectItem>
                  <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                  <SelectItem value="low">🟢 Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={pendingDecision.notes}
                onChange={(e) => setPendingDecision(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any comments or feedback..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDecisionSubmit}
              className={pendingDecision.decision === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              Submit {pendingDecision.decision === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ApprovalDashboard
