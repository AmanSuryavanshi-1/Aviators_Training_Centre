/**
 * Comprehensive Notification Service for Multi-Author Blog System
 * Handles email notifications, in-app notifications, and team communication
 */

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  htmlTemplate: string
  textTemplate: string
  variables: string[]
  category: 'workflow' | 'approval' | 'collaboration' | 'system' | 'editorial'
  priority: 'high' | 'medium' | 'low'
  channels: ('email' | 'in_app' | 'push' | 'sms')[]
}

export interface Notification {
  id: string
  recipientId: string
  recipientEmail: string
  type: string
  category: 'workflow' | 'approval' | 'collaboration' | 'system' | 'editorial'
  priority: 'high' | 'medium' | 'low'
  title: string
  message: string
  htmlContent?: string
  data?: Record<string, any>
  channels: ('email' | 'in_app' | 'push' | 'sms')[]
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  createdAt: string
  sentAt?: string
  readAt?: string
  expiresAt?: string
  relatedWorkflowId?: string
  relatedContentId?: string
  actionUrl?: string
  actionText?: string
}

export interface NotificationPreferences {
  userId: string
  email: {
    enabled: boolean
    workflowUpdates: boolean
    approvalRequests: boolean
    comments: boolean
    mentions: boolean
    deadlines: boolean
    systemUpdates: boolean
    frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  }
  inApp: {
    enabled: boolean
    workflowUpdates: boolean
    approvalRequests: boolean
    comments: boolean
    mentions: boolean
    deadlines: boolean
    systemUpdates: boolean
  }
  push: {
    enabled: boolean
    workflowUpdates: boolean
    approvalRequests: boolean
    comments: boolean
    mentions: boolean
    deadlines: boolean
  }
  digest: {
    enabled: boolean
    frequency: 'daily' | 'weekly'
    time: string // HH:MM format
    includeCompleted: boolean
  }
}

export interface ActivityLog {
  id: string
  userId: string
  action: string
  category: 'content' | 'workflow' | 'approval' | 'collaboration' | 'system'
  description: string
  metadata: Record<string, any>
  timestamp: string
  relatedUsers: string[]
  relatedContent?: string
  relatedWorkflow?: string
  visibility: 'public' | 'team' | 'private'
}

export interface TeamCommunication {
  id: string
  type: 'announcement' | 'discussion' | 'update' | 'alert'
  title: string
  content: string
  authorId: string
  authorName: string
  targetAudience: 'all' | 'authors' | 'editors' | 'admins' | 'specific'
  specificUsers?: string[]
  priority: 'high' | 'medium' | 'low'
  category: string
  tags: string[]
  createdAt: string
  updatedAt?: string
  expiresAt?: string
  isSticky: boolean
  allowComments: boolean
  comments: Array<{
    id: string
    authorId: string
    authorName: string
    content: string
    timestamp: string
    parentId?: string
  }>
  reactions: Array<{
    userId: string
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
    timestamp: string
  }>
  readBy: Array<{
    userId: string
    timestamp: string
  }>
}

// Default notification templates
export const defaultNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'workflow_status_change',
    name: 'Workflow Status Change',
    subject: 'Content Status Updated: {{contentTitle}}',
    htmlTemplate: `
      <h2>Content Status Update</h2>
      <p>The status of your content "<strong>{{contentTitle}}</strong>" has been changed to <strong>{{newStatus}}</strong>.</p>
      {{#if notes}}<p><strong>Notes:</strong> {{notes}}</p>{{/if}}
      <p><a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Content</a></p>
    `,
    textTemplate: `Content Status Update\n\nThe status of your content "{{contentTitle}}" has been changed to {{newStatus}}.\n\n{{#if notes}}Notes: {{notes}}\n\n{{/if}}View content: {{actionUrl}}`,
    variables: ['contentTitle', 'newStatus', 'notes', 'actionUrl'],
    category: 'workflow',
    priority: 'medium',
    channels: ['email', 'in_app']
  },
  {
    id: 'approval_request',
    name: 'Approval Request',
    subject: 'Approval Required: {{contentTitle}}',
    htmlTemplate: `
      <h2>Approval Request</h2>
      <p>You have been assigned to review and approve the content "<strong>{{contentTitle}}</strong>" by {{authorName}}.</p>
      <p><strong>Content Type:</strong> {{contentType}}</p>
      <p><strong>Priority:</strong> {{priority}}</p>
      {{#if dueDate}}<p><strong>Due Date:</strong> {{dueDate}}</p>{{/if}}
      <p><a href="{{actionUrl}}" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Review Content</a></p>
    `,
    textTemplate: `Approval Request\n\nYou have been assigned to review and approve the content "{{contentTitle}}" by {{authorName}}.\n\nContent Type: {{contentType}}\nPriority: {{priority}}\n{{#if dueDate}}Due Date: {{dueDate}}\n{{/if}}\nReview content: {{actionUrl}}`,
    variables: ['contentTitle', 'authorName', 'contentType', 'priority', 'dueDate', 'actionUrl'],
    category: 'approval',
    priority: 'high',
    channels: ['email', 'in_app', 'push']
  },
  {
    id: 'comment_added',
    name: 'New Comment',
    subject: 'New Comment on {{contentTitle}}',
    htmlTemplate: `
      <h2>New Comment</h2>
      <p><strong>{{commenterName}}</strong> added a comment to "<strong>{{contentTitle}}</strong>":</p>
      <blockquote style="border-left: 4px solid #007bff; padding-left: 15px; margin: 15px 0; color: #666;">{{commentText}}</blockquote>
      <p><a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a></p>
    `,
    textTemplate: `New Comment\n\n{{commenterName}} added a comment to "{{contentTitle}}":\n\n"{{commentText}}"\n\nView comment: {{actionUrl}}`,
    variables: ['commenterName', 'contentTitle', 'commentText', 'actionUrl'],
    category: 'collaboration',
    priority: 'medium',
    channels: ['email', 'in_app']
  },
  {
    id: 'deadline_reminder',
    name: 'Deadline Reminder',
    subject: 'Deadline Reminder: {{contentTitle}}',
    htmlTemplate: `
      <h2>Deadline Reminder</h2>
      <p>This is a reminder that the content "<strong>{{contentTitle}}</strong>" is due {{timeUntilDue}}.</p>
      <p><strong>Current Status:</strong> {{currentStatus}}</p>
      <p><strong>Due Date:</strong> {{dueDate}}</p>
      <p><a href="{{actionUrl}}" style="background: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Content</a></p>
    `,
    textTemplate: `Deadline Reminder\n\nThis is a reminder that the content "{{contentTitle}}" is due {{timeUntilDue}}.\n\nCurrent Status: {{currentStatus}}\nDue Date: {{dueDate}}\n\nView content: {{actionUrl}}`,
    variables: ['contentTitle', 'timeUntilDue', 'currentStatus', 'dueDate', 'actionUrl'],
    category: 'workflow',
    priority: 'high',
    channels: ['email', 'in_app', 'push']
  },
  {
    id: 'mention_notification',
    name: 'Mention Notification',
    subject: 'You were mentioned in {{contentTitle}}',
    htmlTemplate: `
      <h2>You Were Mentioned</h2>
      <p><strong>{{mentionerName}}</strong> mentioned you in a comment on "<strong>{{contentTitle}}</strong>":</p>
      <blockquote style="border-left: 4px solid #007bff; padding-left: 15px; margin: 15px 0; color: #666;">{{commentText}}</blockquote>
      <p><a href="{{actionUrl}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a></p>
    `,
    textTemplate: `You Were Mentioned\n\n{{mentionerName}} mentioned you in a comment on "{{contentTitle}}":\n\n"{{commentText}}"\n\nView comment: {{actionUrl}}`,
    variables: ['mentionerName', 'contentTitle', 'commentText', 'actionUrl'],
    category: 'collaboration',
    priority: 'high',
    channels: ['email', 'in_app', 'push']
  },
  {
    id: 'conflict_detected',
    name: 'Editing Conflict Detected',
    subject: 'Editing Conflict: {{contentTitle}}',
    htmlTemplate: `
      <h2>Editing Conflict Detected</h2>
      <p>A conflict has been detected in the content "<strong>{{contentTitle}}</strong>" due to simultaneous editing by multiple authors.</p>
      <p><strong>Conflicting Authors:</strong> {{conflictingAuthors}}</p>
      <p><strong>Affected Fields:</strong> {{affectedFields}}</p>
      <p><a href="{{actionUrl}}" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resolve Conflict</a></p>
    `,
    textTemplate: `Editing Conflict Detected\n\nA conflict has been detected in the content "{{contentTitle}}" due to simultaneous editing by multiple authors.\n\nConflicting Authors: {{conflictingAuthors}}\nAffected Fields: {{affectedFields}}\n\nResolve conflict: {{actionUrl}}`,
    variables: ['contentTitle', 'conflictingAuthors', 'affectedFields', 'actionUrl'],
    category: 'collaboration',
    priority: 'high',
    channels: ['email', 'in_app', 'push']
  }
]

export class NotificationService {
  /**
   * Send a notification using a template
   */
  static async sendNotification(
    templateId: string,
    recipientId: string,
    recipientEmail: string,
    variables: Record<string, any>,
    options: {
      priority?: 'high' | 'medium' | 'low'
      channels?: ('email' | 'in_app' | 'push' | 'sms')[]
      expiresAt?: string
      actionUrl?: string
      actionText?: string
      relatedWorkflowId?: string
      relatedContentId?: string
    } = {}
  ): Promise<Notification> {
    const template = defaultNotificationTemplates.find(t => t.id === templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Compile templates with variables
    const subject = this.compileTemplate(template.subject, variables)
    const htmlContent = this.compileTemplate(template.htmlTemplate, variables)
    const textContent = this.compileTemplate(template.textTemplate, variables)

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipientId,
      recipientEmail,
      type: templateId,
      category: template.category,
      priority: options.priority || template.priority,
      title: subject,
      message: textContent,
      htmlContent,
      data: variables,
      channels: options.channels || template.channels,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: options.expiresAt,
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      relatedWorkflowId: options.relatedWorkflowId,
      relatedContentId: options.relatedContentId
    }

    // Send through configured channels
    await this.deliverNotification(notification)

    return notification
  }

  /**
   * Send bulk notifications
   */
  static async sendBulkNotifications(
    templateId: string,
    recipients: Array<{
      id: string
      email: string
      variables?: Record<string, any>
    }>,
    commonVariables: Record<string, any> = {},
    options: {
      priority?: 'high' | 'medium' | 'low'
      channels?: ('email' | 'in_app' | 'push' | 'sms')[]
      expiresAt?: string
      actionUrl?: string
      actionText?: string
      relatedWorkflowId?: string
      relatedContentId?: string
    } = {}
  ): Promise<Notification[]> {
    const notifications = await Promise.all(
      recipients.map(recipient =>
        this.sendNotification(
          templateId,
          recipient.id,
          recipient.email,
          { ...commonVariables, ...recipient.variables },
          options
        )
      )
    )

    return notifications
  }

  /**
   * Create team announcement
   */
  static async createTeamAnnouncement(
    announcement: Omit<TeamCommunication, 'id' | 'createdAt' | 'comments' | 'reactions' | 'readBy'>
  ): Promise<TeamCommunication> {
    const teamAnnouncement: TeamCommunication = {
      ...announcement,
      id: `announce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      comments: [],
      reactions: [],
      readBy: []
    }

    // Send notifications to target audience
    if (announcement.targetAudience !== 'specific' || announcement.specificUsers) {
      const recipients = await this.getAnnouncementRecipients(announcement)
      
      await this.sendBulkNotifications(
        'team_announcement',
        recipients.map(r => ({ id: r.id, email: r.email })),
        {
          announcementTitle: announcement.title,
          announcementContent: announcement.content,
          authorName: announcement.authorName,
          actionUrl: `/admin/announcements/${teamAnnouncement.id}`
        },
        {
          priority: announcement.priority,
          channels: ['email', 'in_app']
        }
      )
    }

    return teamAnnouncement
  }

  /**
   * Log activity
   */
  static async logActivity(
    userId: string,
    action: string,
    category: ActivityLog['category'],
    description: string,
    metadata: Record<string, any> = {},
    options: {
      relatedUsers?: string[]
      relatedContent?: string
      relatedWorkflow?: string
      visibility?: 'public' | 'team' | 'private'
    } = {}
  ): Promise<ActivityLog> {
    const activity: ActivityLog = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      category,
      description,
      metadata,
      timestamp: new Date().toISOString(),
      relatedUsers: options.relatedUsers || [],
      relatedContent: options.relatedContent,
      relatedWorkflow: options.relatedWorkflow,
      visibility: options.visibility || 'team'
    }

    // Notify related users if specified
    if (options.relatedUsers && options.relatedUsers.length > 0) {
      // Implementation would send notifications to related users
    }

    return activity
  }

  /**
   * Get notification preferences for user
   */
  static getDefaultNotificationPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      email: {
        enabled: true,
        workflowUpdates: true,
        approvalRequests: true,
        comments: true,
        mentions: true,
        deadlines: true,
        systemUpdates: false,
        frequency: 'immediate'
      },
      inApp: {
        enabled: true,
        workflowUpdates: true,
        approvalRequests: true,
        comments: true,
        mentions: true,
        deadlines: true,
        systemUpdates: true
      },
      push: {
        enabled: false,
        workflowUpdates: false,
        approvalRequests: true,
        comments: false,
        mentions: true,
        deadlines: true
      },
      digest: {
        enabled: true,
        frequency: 'daily',
        time: '09:00',
        includeCompleted: false
      }
    }
  }

  /**
   * Generate daily/weekly digest
   */
  static async generateDigest(
    userId: string,
    type: 'daily' | 'weekly',
    preferences: NotificationPreferences
  ): Promise<{
    subject: string
    htmlContent: string
    textContent: string
    stats: Record<string, number>
  }> {
    const now = new Date()
    const startDate = new Date()
    
    if (type === 'daily') {
      startDate.setDate(now.getDate() - 1)
    } else {
      startDate.setDate(now.getDate() - 7)
    }

    // This would fetch actual data from the database
    const mockStats = {
      pendingApprovals: 3,
      newComments: 5,
      workflowUpdates: 2,
      completedTasks: 4,
      mentions: 1
    }

    const subject = `${type === 'daily' ? 'Daily' : 'Weekly'} Digest - ${now.toLocaleDateString()}`
    
    const htmlContent = `
      <h2>${subject}</h2>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Summary</h3>
        <ul>
          <li><strong>${mockStats.pendingApprovals}</strong> items pending your approval</li>
          <li><strong>${mockStats.newComments}</strong> new comments on your content</li>
          <li><strong>${mockStats.workflowUpdates}</strong> workflow status updates</li>
          <li><strong>${mockStats.completedTasks}</strong> tasks completed</li>
          <li><strong>${mockStats.mentions}</strong> mentions</li>
        </ul>
      </div>
      <p><a href="/admin/dashboard" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
    `

    const textContent = `
${subject}

Summary:
- ${mockStats.pendingApprovals} items pending your approval
- ${mockStats.newComments} new comments on your content
- ${mockStats.workflowUpdates} workflow status updates
- ${mockStats.completedTasks} tasks completed
- ${mockStats.mentions} mentions

View your dashboard: /admin/dashboard
    `

    return {
      subject,
      htmlContent,
      textContent,
      stats: mockStats
    }
  }

  /**
   * Check for deadline reminders
   */
  static async checkDeadlineReminders(): Promise<Array<{
    workflowId: string
    contentId: string
    contentTitle: string
    assignedTo: string
    dueDate: string
    timeUntilDue: string
    urgency: 'overdue' | 'due_today' | 'due_tomorrow' | 'due_this_week'
  }>> {
    // This would query the database for workflows with approaching deadlines
    // For now, returning mock data
    return []
  }

  /**
   * Private helper methods
   */
  private static compileTemplate(template: string, variables: Record<string, any>): string {
    let compiled = template
    
    // Simple template compilation (in production, use a proper template engine)
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      compiled = compiled.replace(regex, String(value || ''))
    })

    // Handle conditional blocks (simplified)
    compiled = compiled.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
      return variables[condition] ? content : ''
    })

    return compiled
  }

  private static async deliverNotification(notification: Notification): Promise<void> {
    // Implementation would handle actual delivery through various channels
    // For now, just log the notification
    console.log('Delivering notification:', {
      id: notification.id,
      type: notification.type,
      recipient: notification.recipientEmail,
      channels: notification.channels,
      priority: notification.priority
    })

    // Update status to sent
    notification.status = 'sent'
    notification.sentAt = new Date().toISOString()
  }

  private static async getAnnouncementRecipients(
    announcement: Pick<TeamCommunication, 'targetAudience' | 'specificUsers'>
  ): Promise<Array<{ id: string; email: string; authorLevel: string }>> {
    // This would query the database for users based on target audience
    // For now, returning mock data
    return [
      { id: 'user1', email: 'user1@example.com', authorLevel: 'admin' },
      { id: 'user2', email: 'user2@example.com', authorLevel: 'senior' }
    ]
  }
}

export default NotificationService