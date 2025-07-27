import { defineField, defineType } from 'sanity';

export const editorNotificationType = defineType({
  name: 'editorNotification',
  title: 'Editor Notification',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Notification Type',
      type: 'string',
      options: {
        list: [
          { title: 'New Automated Draft', value: 'new_automated_draft' },
          { title: 'Draft Needs Review', value: 'draft_needs_review' },
          { title: 'Automation Error', value: 'automation_error' },
          { title: 'Validation Warning', value: 'validation_warning' },
          { title: 'System Alert', value: 'system_alert' }
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().max(100)
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      validation: Rule => Rule.required().max(500)
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'high' },
          { title: 'Urgent', value: 'urgent' }
        ]
      },
      validation: Rule => Rule.required(),
      initialValue: 'medium'
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Unread', value: 'unread' },
          { title: 'Read', value: 'read' },
          { title: 'Dismissed', value: 'dismissed' },
          { title: 'Archived', value: 'archived' }
        ]
      },
      validation: Rule => Rule.required(),
      initialValue: 'unread'
    }),
    defineField({
      name: 'timestamp',
      title: 'Created At',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'When this notification should be automatically archived'
    }),
    defineField({
      name: 'metadata',
      title: 'Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'draftId',
          title: 'Draft ID',
          type: 'string',
          description: 'ID of the related draft post'
        }),
        defineField({
          name: 'automationId',
          title: 'Automation ID',
          type: 'string',
          description: 'ID of the automation workflow'
        }),
        defineField({
          name: 'sourceUrl',
          title: 'Source URL',
          type: 'url',
          description: 'Original source URL of the content'
        }),
        defineField({
          name: 'validationScore',
          title: 'Validation Score',
          type: 'number',
          description: 'Content validation score (0-100)'
        }),
        defineField({
          name: 'actionRequired',
          title: 'Action Required',
          type: 'boolean',
          description: 'Whether this notification requires user action',
          initialValue: false
        }),
        defineField({
          name: 'actionUrl',
          title: 'Action URL',
          type: 'string',
          description: 'URL to take action on this notification'
        }),
        defineField({
          name: 'actionText',
          title: 'Action Text',
          type: 'string',
          description: 'Text for the action button'
        })
      ]
    }),
    defineField({
      name: 'recipientId',
      title: 'Recipient ID',
      type: 'string',
      description: 'Specific user ID to receive this notification'
    }),
    defineField({
      name: 'recipientRole',
      title: 'Recipient Role',
      type: 'string',
      options: {
        list: [
          { title: 'Editor', value: 'editor' },
          { title: 'Admin', value: 'admin' },
          { title: 'Author', value: 'author' },
          { title: 'All', value: 'all' }
        ]
      },
      description: 'Role-based targeting for notifications',
      initialValue: 'editor'
    }),
    defineField({
      name: 'readAt',
      title: 'Read At',
      type: 'datetime',
      description: 'When this notification was marked as read'
    }),
    defineField({
      name: 'dismissedAt',
      title: 'Dismissed At',
      type: 'datetime',
      description: 'When this notification was dismissed'
    }),
    defineField({
      name: 'archivedAt',
      title: 'Archived At',
      type: 'datetime',
      description: 'When this notification was archived'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
      description: 'priority',
      status: 'status'
    },
    prepare(selection) {
      const { title, subtitle, description, status } = selection;
      const priorityEmoji = {
        low: '🔵',
        medium: '🟡',
        high: '🟠',
        urgent: '🔴'
      }[description] || '⚪';
      
      const statusEmoji = {
        unread: '📬',
        read: '📭',
        dismissed: '🗑️',
        archived: '📦'
      }[status] || '📄';

      return {
        title: `${priorityEmoji} ${title}`,
        subtitle: subtitle?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${statusEmoji} ${status?.toUpperCase()}`
      };
    }
  },
  orderings: [
    {
      title: 'Priority (urgent first)',
      name: 'priorityDesc',
      by: [
        { field: 'priority', direction: 'desc' },
        { field: 'timestamp', direction: 'desc' }
      ]
    },
    {
      title: 'Newest first',
      name: 'timestampDesc',
      by: [{ field: 'timestamp', direction: 'desc' }]
    },
    {
      title: 'Status',
      name: 'status',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'timestamp', direction: 'desc' }
      ]
    },
    {
      title: 'Unread first',
      name: 'unreadFirst',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'priority', direction: 'desc' },
        { field: 'timestamp', direction: 'desc' }
      ]
    }
  ]
});