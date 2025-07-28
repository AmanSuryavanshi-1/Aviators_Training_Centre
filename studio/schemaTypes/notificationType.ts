import {defineField, defineType} from 'sanity'

export const notificationType = defineType({
  name: 'notification',
  title: 'Notification',
  type: 'document',
  fields: [
    defineField({
      name: 'notificationId',
      title: 'Notification ID',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Unique identifier for this notification',
    }),
    defineField({
      name: 'recipient',
      title: 'Recipient',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
      description: 'The user who will receive this notification',
    }),
    defineField({
      name: 'type',
      title: 'Notification Type',
      type: 'string',
      options: {
        list: [
          {title: 'Workflow Status Change', value: 'workflow_status_change'},
          {title: 'Approval Request', value: 'approval_request'},
          {title: 'Comment Added', value: 'comment_added'},
          {title: 'Deadline Reminder', value: 'deadline_reminder'},
          {title: 'Mention Notification', value: 'mention_notification'},
          {title: 'Conflict Detected', value: 'conflict_detected'},
          {title: 'Team Announcement', value: 'team_announcement'},
          {title: 'System Update', value: 'system_update'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: '🔄 Workflow', value: 'workflow'},
          {title: '✅ Approval', value: 'approval'},
          {title: '💬 Collaboration', value: 'collaboration'},
          {title: '⚙️ System', value: 'system'},
          {title: '📝 Editorial', value: 'editorial'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          {title: '🔴 High', value: 'high'},
          {title: '🟡 Medium', value: 'medium'},
          {title: '🟢 Low', value: 'low'},
        ],
      },
      initialValue: 'medium',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Notification title/subject',
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
      description: 'Plain text message content',
    }),
    defineField({
      name: 'htmlContent',
      title: 'HTML Content',
      type: 'text',
      rows: 5,
      description: 'Rich HTML content for email notifications',
    }),
    defineField({
      name: 'data',
      title: 'Notification Data',
      type: 'object',
      fields: [
        {
          name: 'variables',
          title: 'Template Variables',
          type: 'object',
          description: 'Variables used to generate this notification',
        },
        {
          name: 'metadata',
          title: 'Additional Metadata',
          type: 'object',
          description: 'Additional data related to this notification',
        },
      ],
    }),
    defineField({
      name: 'channels',
      title: 'Delivery Channels',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: '📧 Email', value: 'email'},
          {title: '🔔 In-App', value: 'in_app'},
          {title: '📱 Push', value: 'push'},
          {title: '💬 SMS', value: 'sms'},
        ],
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: '⏳ Pending', value: 'pending'},
          {title: '📤 Sent', value: 'sent'},
          {title: '✅ Delivered', value: 'delivered'},
          {title: '👁️ Read', value: 'read'},
          {title: '❌ Failed', value: 'failed'},
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'sentAt',
      title: 'Sent At',
      type: 'datetime',
      description: 'When the notification was sent',
    }),
    defineField({
      name: 'deliveredAt',
      title: 'Delivered At',
      type: 'datetime',
      description: 'When the notification was delivered',
    }),
    defineField({
      name: 'readAt',
      title: 'Read At',
      type: 'datetime',
      description: 'When the notification was read by the recipient',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'When this notification expires (optional)',
    }),
    defineField({
      name: 'relatedWorkflow',
      title: 'Related Workflow',
      type: 'reference',
      to: [{type: 'workflow'}, {type: 'approvalWorkflow'}],
      description: 'Workflow this notification relates to',
    }),
    defineField({
      name: 'relatedContent',
      title: 'Related Content',
      type: 'reference',
      to: [{type: 'post'}, {type: 'course'}],
      description: 'Content this notification relates to',
    }),
    defineField({
      name: 'actionUrl',
      title: 'Action URL',
      type: 'url',
      description: 'URL for the primary action button',
    }),
    defineField({
      name: 'actionText',
      title: 'Action Text',
      type: 'string',
      description: 'Text for the primary action button',
    }),
    defineField({
      name: 'deliveryAttempts',
      title: 'Delivery Attempts',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'channel',
              title: 'Channel',
              type: 'string',
              options: {
                list: [
                  {title: 'Email', value: 'email'},
                  {title: 'In-App', value: 'in_app'},
                  {title: 'Push', value: 'push'},
                  {title: 'SMS', value: 'sms'},
                ],
              },
            },
            {
              name: 'attemptedAt',
              title: 'Attempted At',
              type: 'datetime',
            },
            {
              name: 'status',
              title: 'Status',
              type: 'string',
              options: {
                list: [
                  {title: 'Success', value: 'success'},
                  {title: 'Failed', value: 'failed'},
                  {title: 'Retry', value: 'retry'},
                ],
              },
            },
            {
              name: 'error',
              title: 'Error Message',
              type: 'string',
            },
            {
              name: 'response',
              title: 'Response Data',
              type: 'text',
            },
          ],
          preview: {
            select: {
              channel: 'channel',
              status: 'status',
              attemptedAt: 'attemptedAt',
            },
            prepare({channel, status, attemptedAt}) {
              const statusEmojis = {
                success: '✅',
                failed: '❌',
                retry: '🔄',
              }
              
              const emoji = statusEmojis[status as keyof typeof statusEmojis] || '❓'
              const date = new Date(attemptedAt).toLocaleString()
              
              return {
                title: `${emoji} ${channel}`,
                subtitle: `${status} • ${date}`,
              }
            },
          },
        },
      ],
      description: 'Record of delivery attempts across different channels',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      recipient: 'recipient.name',
      category: 'category',
      priority: 'priority',
      status: 'status',
      createdAt: 'createdAt',
    },
    prepare({title, recipient, category, priority, status, createdAt}) {
      const categoryEmojis = {
        workflow: '🔄',
        approval: '✅',
        collaboration: '💬',
        system: '⚙️',
        editorial: '📝',
      }
      
      const priorityEmojis = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }
      
      const statusEmojis = {
        pending: '⏳',
        sent: '📤',
        delivered: '✅',
        read: '👁️',
        failed: '❌',
      }
      
      const categoryEmoji = categoryEmojis[category as keyof typeof categoryEmojis] || '📄'
      const priorityEmoji = priorityEmojis[priority as keyof typeof priorityEmojis] || '🟡'
      const statusEmoji = statusEmojis[status as keyof typeof statusEmojis] || '⏳'
      const date = new Date(createdAt).toLocaleDateString()
      
      return {
        title: `${categoryEmoji} ${priorityEmoji} ${statusEmoji} ${title}`,
        subtitle: `To: ${recipient} • ${date}`,
        media: '🔔',
      }
    },
  },
  orderings: [
    {
      title: 'Most Recent',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Priority & Date',
      name: 'priorityDate',
      by: [
        {field: 'priority', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Status',
      name: 'status',
      by: [
        {field: 'status', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Recipient',
      name: 'recipient',
      by: [
        {field: 'recipient.name', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'}
      ]
    }
  ],
})