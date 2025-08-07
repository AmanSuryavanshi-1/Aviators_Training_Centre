/**
 * Approval Workflow Management System
 * Handles content approval workflows based on author permissions and content requirements
 */

export interface ApprovalRule {
  id: string
  name: string
  description: string
  conditions: {
    authorLevel?: ('admin' | 'senior' | 'regular' | 'guest')[]
    contentType?: string[]
    contentArea?: string[]
    wordCount?: { min?: number; max?: number }
    hasImages?: boolean
    hasSEOData?: boolean
  }
  approvers: {
    required: number
    authorLevels: ('admin' | 'senior')[]
    specificAuthors?: string[]
    excludeOriginalAuthor?: boolean
  }
  autoApprovalConditions?: {
    authorLevel?: ('admin' | 'senior')[]
    previousApprovals?: number
    contentScore?: number
  }
  escalationRules?: {
    timeoutHours: number
    escalateTo: ('admin' | 'senior')[]
  }
}

export interface ApprovalRequest {
  id: string
  workflowId: string
  contentId: string
  requestedBy: string
  requestedAt: string
  rule: ApprovalRule
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'expired'
  approvals: ApprovalDecision[]
  rejections: ApprovalDecision[]
  currentApprovers: string[]
  dueDate?: string
  escalatedAt?: string
  completedAt?: string
  notes?: string
}

export interface ApprovalDecision {
  id: string
  approverId: string
  approverName: string
  decision: 'approve' | 'reject' | 'request_changes'
  timestamp: string
  notes?: string
  conditions?: string[]
  priority?: 'high' | 'medium' | 'low'
}

export interface ApprovalWorkflow {
  id: string
  contentId: string
  contentType: string
  currentStage: number
  stages: ApprovalStage[]
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
  completedAt?: string
  totalApprovals: number
  totalRejections: number
}

export interface ApprovalStage {
  id: string
  name: string
  description: string
  order: number
  rule: ApprovalRule
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  startedAt?: string
  completedAt?: string
  approvals: ApprovalDecision[]
  rejections: ApprovalDecision[]
  canSkip: boolean
  isParallel: boolean
}

// Default approval rules for different content types and author levels
export const defaultApprovalRules: ApprovalRule[] = [
  {
    id: 'guest-author-review',
    name: 'Guest Author Review',
    description: 'All content from guest authors requires senior+ approval',
    conditions: {
      authorLevel: ['guest']
    },
    approvers: {
      required: 1,
      authorLevels: ['admin', 'senior'],
      excludeOriginalAuthor: true
    },
    escalationRules: {
      timeoutHours: 48,
      escalateTo: ['admin']
    }
  },
  {
    id: 'regular-author-review',
    name: 'Regular Author Review',
    description: 'Regular authors need approval for technical content',
    conditions: {
      authorLevel: ['regular'],
      contentArea: ['technical-specific', 'atpl-ground-school', 'type-rating', 'safety-regulations']
    },
    approvers: {
      required: 1,
      authorLevels: ['admin', 'senior'],
      excludeOriginalAuthor: true
    },
    escalationRules: {
      timeoutHours: 72,
      escalateTo: ['admin']
    }
  },
  {
    id: 'high-word-count-review',
    name: 'Long Content Review',
    description: 'Articles over 2000 words require additional review',
    conditions: {
      wordCount: { min: 2000 }
    },
    approvers: {
      required: 1,
      authorLevels: ['admin', 'senior']
    },
    autoApprovalConditions: {
      authorLevel: ['admin'],
      previousApprovals: 5
    }
  },
  {
    id: 'seo-critical-review',
    name: 'SEO Critical Content',
    description: 'Content targeting high-value keywords needs SEO review',
    conditions: {
      hasSEOData: true
    },
    approvers: {
      required: 2,
      authorLevels: ['admin', 'senior']
    }
  },
  {
    id: 'senior-auto-approval',
    name: 'Senior Author Auto-Approval',
    description: 'Senior authors can auto-approve most content',
    conditions: {
      authorLevel: ['senior']
    },
    approvers: {
      required: 0,
      authorLevels: []
    },
    autoApprovalConditions: {
      authorLevel: ['senior'],
      contentScore: 80
    }
  }
]

export class ApprovalWorkflowService {
  /**
   * Determine which approval rules apply to content
   */
  static getApplicableRules(
    content: {
      authorId: string
      authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
      contentType: string
      contentArea?: string
      wordCount?: number
      hasImages?: boolean
      hasSEOData?: boolean
    },
    customRules: ApprovalRule[] = []
  ): ApprovalRule[] {
    const allRules = [...defaultApprovalRules, ...customRules]
    
    return allRules.filter(rule => {
      // Check author level condition
      if (rule.conditions.authorLevel && !rule.conditions.authorLevel.includes(content.authorLevel)) {
        return false
      }
      
      // Check content type condition
      if (rule.conditions.contentType && !rule.conditions.contentType.includes(content.contentType)) {
        return false
      }
      
      // Check content area condition
      if (rule.conditions.contentArea && content.contentArea && 
          !rule.conditions.contentArea.includes(content.contentArea)) {
        return false
      }
      
      // Check word count condition
      if (rule.conditions.wordCount && content.wordCount) {
        const { min, max } = rule.conditions.wordCount
        if (min && content.wordCount < min) return false
        if (max && content.wordCount > max) return false
      }
      
      // Check image condition
      if (rule.conditions.hasImages !== undefined && content.hasImages !== rule.conditions.hasImages) {
        return false
      }
      
      // Check SEO data condition
      if (rule.conditions.hasSEOData !== undefined && content.hasSEOData !== rule.conditions.hasSEOData) {
        return false
      }
      
      return true
    })
  }

  /**
   * Check if content can be auto-approved
   */
  static canAutoApprove(
    content: {
      authorId: string
      authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
      previousApprovals?: number
      contentScore?: number
    },
    rule: ApprovalRule
  ): boolean {
    if (!rule.autoApprovalConditions) return false
    
    const conditions = rule.autoApprovalConditions
    
    // Check author level
    if (conditions.authorLevel && !conditions.authorLevel.includes(content.authorLevel)) {
      return false
    }
    
    // Check previous approvals
    if (conditions.previousApprovals && 
        (!content.previousApprovals || content.previousApprovals < conditions.previousApprovals)) {
      return false
    }
    
    // Check content score
    if (conditions.contentScore && 
        (!content.contentScore || content.contentScore < conditions.contentScore)) {
      return false
    }
    
    return true
  }

  /**
   * Create approval workflow for content
   */
  static createApprovalWorkflow(
    contentId: string,
    contentType: string,
    applicableRules: ApprovalRule[]
  ): ApprovalWorkflow {
    // Sort rules by priority (more restrictive first)
    const sortedRules = applicableRules.sort((a, b) => {
      const priorityA = this.getRulePriority(a)
      const priorityB = this.getRulePriority(b)
      return priorityB - priorityA
    })

    // Create stages from rules
    const stages: ApprovalStage[] = sortedRules.map((rule, index) => ({
      id: `stage_${index + 1}_${rule.id}`,
      name: rule.name,
      description: rule.description,
      order: index + 1,
      rule,
      status: index === 0 ? 'pending' : 'pending',
      approvals: [],
      rejections: [],
      canSkip: rule.autoApprovalConditions !== undefined,
      isParallel: false
    }))

    return {
      id: `workflow_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`,
      contentId,
      contentType,
      currentStage: 0,
      stages,
      status: 'active',
      createdAt: new Date().toISOString(),
      totalApprovals: 0,
      totalRejections: 0
    }
  }

  /**
   * Get available approvers for a rule
   */
  static getAvailableApprovers(
    rule: ApprovalRule,
    allAuthors: Array<{
      _id: string
      name: string
      authorLevel: 'admin' | 'senior' | 'regular' | 'guest'
      status: 'active' | 'inactive' | 'suspended'
    }>,
    excludeAuthorId?: string
  ): Array<{ _id: string; name: string; authorLevel: string }> {
    const availableApprovers = allAuthors.filter(author => {
      // Only active authors
      if (author.status !== 'active') return false
      
      // Exclude original author if specified
      if (rule.approvers.excludeOriginalAuthor && author._id === excludeAuthorId) {
        return false
      }
      
      // Check if author level is in required levels
      if (rule.approvers.authorLevels.includes(author.authorLevel)) {
        return true
      }
      
      // Check if author is specifically listed
      if (rule.approvers.specificAuthors?.includes(author._id)) {
        return true
      }
      
      return false
    })

    return availableApprovers
  }

  /**
   * Process approval decision
   */
  static processApprovalDecision(
    workflow: ApprovalWorkflow,
    stageId: string,
    decision: ApprovalDecision
  ): {
    updatedWorkflow: ApprovalWorkflow
    stageCompleted: boolean
    workflowCompleted: boolean
    nextActions: string[]
  } {
    const updatedWorkflow = { ...workflow }
    const stage = updatedWorkflow.stages.find(s => s.id === stageId)
    
    if (!stage) {
      throw new Error('Stage not found')
    }

    // Add decision to appropriate array
    if (decision.decision === 'approve') {
      stage.approvals.push(decision)
      updatedWorkflow.totalApprovals++
    } else {
      stage.rejections.push(decision)
      updatedWorkflow.totalRejections++
    }

    // Check if stage is completed
    const requiredApprovals = stage.rule.approvers.required
    const stageCompleted = stage.approvals.length >= requiredApprovals || 
                          stage.rejections.length > 0 // Any rejection completes the stage

    if (stageCompleted) {
      stage.status = 'completed'
      stage.completedAt = new Date().toISOString()
    }

    // Check if workflow is completed
    const allStagesCompleted = updatedWorkflow.stages.every(s => 
      s.status === 'completed' || s.status === 'skipped'
    )
    
    const workflowCompleted = allStagesCompleted || stage.rejections.length > 0

    if (workflowCompleted) {
      updatedWorkflow.status = 'completed'
      updatedWorkflow.completedAt = new Date().toISOString()
    } else if (stageCompleted) {
      // Move to next stage
      const currentStageIndex = updatedWorkflow.stages.findIndex(s => s.id === stageId)
      if (currentStageIndex < updatedWorkflow.stages.length - 1) {
        updatedWorkflow.currentStage = currentStageIndex + 1
        updatedWorkflow.stages[currentStageIndex + 1].status = 'in_progress'
        updatedWorkflow.stages[currentStageIndex + 1].startedAt = new Date().toISOString()
      }
    }

    // Determine next actions
    const nextActions: string[] = []
    
    if (decision.decision === 'reject' || decision.decision === 'request_changes') {
      nextActions.push('notify_author')
      nextActions.push('return_to_draft')
    } else if (stageCompleted && !workflowCompleted) {
      nextActions.push('notify_next_approvers')
    } else if (workflowCompleted && stage.rejections.length === 0) {
      nextActions.push('approve_content')
      nextActions.push('notify_author_approved')
    }

    return {
      updatedWorkflow,
      stageCompleted,
      workflowCompleted,
      nextActions
    }
  }

  /**
   * Check for escalation requirements
   */
  static checkEscalation(
    workflow: ApprovalWorkflow,
    currentTime: Date = new Date()
  ): Array<{
    stageId: string
    shouldEscalate: boolean
    escalateTo: ('admin' | 'senior')[]
    reason: string
  }> {
    const escalations: Array<{
      stageId: string
      shouldEscalate: boolean
      escalateTo: ('admin' | 'senior')[]
      reason: string
    }> = []

    workflow.stages.forEach(stage => {
      if (stage.status === 'in_progress' && stage.rule.escalationRules) {
        const startTime = new Date(stage.startedAt || workflow.createdAt)
        const hoursElapsed = (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        
        if (hoursElapsed >= stage.rule.escalationRules.timeoutHours) {
          escalations.push({
            stageId: stage.id,
            shouldEscalate: true,
            escalateTo: stage.rule.escalationRules.escalateTo,
            reason: `Stage timeout after ${stage.rule.escalationRules.timeoutHours} hours`
          })
        }
      }
    })

    return escalations
  }

  /**
   * Get workflow statistics
   */
  static getWorkflowStats(workflows: ApprovalWorkflow[]): {
    total: number
    active: number
    completed: number
    averageCompletionTime: number
    approvalRate: number
    bottlenecks: Array<{ stageName: string; averageTime: number; count: number }>
  } {
    const total = workflows.length
    const active = workflows.filter(w => w.status === 'active').length
    const completed = workflows.filter(w => w.status === 'completed').length
    
    // Calculate average completion time
    const completedWorkflows = workflows.filter(w => w.completedAt)
    const totalCompletionTime = completedWorkflows.reduce((sum, w) => {
      const start = new Date(w.createdAt).getTime()
      const end = new Date(w.completedAt!).getTime()
      return sum + (end - start)
    }, 0)
    
    const averageCompletionTime = completedWorkflows.length > 0 
      ? totalCompletionTime / completedWorkflows.length / (1000 * 60 * 60) // in hours
      : 0

    // Calculate approval rate
    const approvedWorkflows = workflows.filter(w => 
      w.status === 'completed' && w.totalRejections === 0
    ).length
    const approvalRate = completed > 0 ? (approvedWorkflows / completed) * 100 : 0

    // Identify bottlenecks
    const stageStats: Record<string, { totalTime: number; count: number }> = {}
    
    workflows.forEach(workflow => {
      workflow.stages.forEach(stage => {
        if (stage.startedAt && stage.completedAt) {
          const stageTime = new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime()
          
          if (!stageStats[stage.name]) {
            stageStats[stage.name] = { totalTime: 0, count: 0 }
          }
          
          stageStats[stage.name].totalTime += stageTime
          stageStats[stage.name].count++
        }
      })
    })

    const bottlenecks = Object.entries(stageStats)
      .map(([stageName, stats]) => ({
        stageName,
        averageTime: stats.totalTime / stats.count / (1000 * 60 * 60), // in hours
        count: stats.count
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5)

    return {
      total,
      active,
      completed,
      averageCompletionTime,
      approvalRate,
      bottlenecks
    }
  }

  /**
   * Get rule priority for sorting
   */
  private static getRulePriority(rule: ApprovalRule): number {
    const priority = 0
    
    // Higher priority for more restrictive author levels
    if (rule.conditions.authorLevel?.includes('guest')) priority += 100
    if (rule.conditions.authorLevel?.includes('regular')) priority += 50
    
    // Higher priority for technical content
    if (rule.conditions.contentArea?.some(area => 
      ['technical-specific', 'atpl-ground-school', 'type-rating'].includes(area)
    )) {
      priority += 75
    }
    
    // Higher priority for content requiring more approvers
    priority += rule.approvers.required * 25
    
    // Higher priority for rules with escalation
    if (rule.escalationRules) priority += 25
    
    return priority
  }

  /**
   * Generate approval request notifications
   */
  static generateApprovalNotifications(
    workflow: ApprovalWorkflow,
    stage: ApprovalStage,
    approvers: Array<{ _id: string; name: string; email: string }>
  ): Array<{
    recipientId: string
    recipientEmail: string
    type: 'approval_request' | 'approval_reminder' | 'approval_escalation'
    subject: string
    message: string
    priority: 'high' | 'medium' | 'low'
    dueDate?: string
  }> {
    const notifications = approvers.map(approver => ({
      recipientId: approver._id,
      recipientEmail: approver.email,
      type: 'approval_request' as const,
      subject: `Approval Required: ${workflow.contentId}`,
      message: `You have been assigned to review and approve content in the "${stage.name}" stage. Please review the content and provide your decision.`,
      priority: 'medium' as const,
      dueDate: stage.rule.escalationRules 
        ? new Date(Date.now() + stage.rule.escalationRules.timeoutHours * 60 * 60 * 1000).toISOString()
        : undefined
    }))

    return notifications
  }
}

export default ApprovalWorkflowService
