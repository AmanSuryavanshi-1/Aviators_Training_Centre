import {defineField, defineType} from 'sanity'

export const workflowType = defineType({
  name: 'workflow',
  title: 'Content Workflow',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Workflow Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'contentRef',
      title: 'Content Reference',
      type: 'reference',
      to: [{type: 'post'}, {type: 'course'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'currentStatus',
      title: 'Current Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Under Review', value: 'review'},
          {title: 'Approved', value: 'approved'},
          {title: 'Published', value: 'published'},
          {title: 'Archived', value: 'archived'},
        ],
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'assignedTo',
      title: 'Assigned To',
      type: 'reference',
      to: [{type: 'author'}],
      description: 'Author currently responsible for this content',
    }),
    defineField({
      name: 'reviewer',
      title: 'Assigned Reviewer',
      type: 'reference',
      to: [{type: 'author'}],
      description: 'Editor assigned to review this content',
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
      name: 'dueDate',
      title: 'Due Date',
      type: 'date',
      description: 'Target completion date',
    }),
    defineField({
      name: 'workflowHistory',
      title: 'Workflow History',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'action',
              title: 'Action',
              type: 'string',
              options: {
                list: [
                  {title: 'Created', value: 'created'},
                  {title: 'Submitted for Review', value: 'submitted'},
                  {title: 'Approved', value: 'approved'},
                  {title: 'Rejected', value: 'rejected'},
                  {title: 'Published', value: 'published'},
                  {title: 'Archived', value: 'archived'},
                  {title: 'Reassigned', value: 'reassigned'},
                ],
              },
            },
            {
              name: 'performedBy',
              title: 'Performed By',
              type: 'reference',
              to: [{type: 'author'}],
            },
            {
              name: 'notes',
              title: 'Notes',
              type: 'text',
              rows: 2,
            },
          ],
          preview: {
            select: {
              action: 'action',
              timestamp: 'timestamp',
              performedBy: 'performedBy.name',
            },
            prepare({action, timestamp, performedBy}) {
              return {
                title: action,
                subtitle: `${performedBy} - ${new Date(timestamp).toLocaleDateString()}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'comments',
      title: 'Comments & Feedback',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'author',
              title: 'Comment Author',
              type: 'reference',
              to: [{type: 'author'}],
            },
            {
              name: 'comment',
              title: 'Comment',
              type: 'text',
              rows: 3,
            },
            {
              name: 'type',
              title: 'Comment Type',
              type: 'string',
              options: {
                list: [
                  {title: '💬 General Comment', value: 'general'},
                  {title: '✏️ Edit Request', value: 'edit'},
                  {title: '❌ Issue Found', value: 'issue'},
                  {title: '✅ Approval', value: 'approval'},
                  {title: '🔍 SEO Feedback', value: 'seo'},
                ],
              },
              initialValue: 'general',
            },
            {
              name: 'resolved',
              title: 'Resolved',
              type: 'boolean',
              initialValue: false,
            },
          ],
          preview: {
            select: {
              comment: 'comment',
              author: 'author.name',
              type: 'type',
              resolved: 'resolved',
            },
            prepare({comment, author, type, resolved}) {
              const typeEmojis = {
                general: '💬',
                edit: '✏️',
                issue: '❌',
                approval: '✅',
                seo: '🔍',
              }
              
              const emoji = typeEmojis[type as keyof typeof typeEmojis] || '💬'
              const status = resolved ? '✅' : '⏳'
              
              return {
                title: `${emoji} ${status} ${comment.substring(0, 50)}...`,
                subtitle: `by ${author}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'notifications',
      title: 'Notification Settings',
      type: 'object',
      fields: [
        {
          name: 'notifyOnStatusChange',
          title: 'Notify on Status Change',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'notifyOnComment',
          title: 'Notify on New Comment',
          type: 'boolean',
          initialValue: true,
        },
        {
          name: 'reminderFrequency',
          title: 'Reminder Frequency',
          type: 'string',
          options: {
            list: [
              {title: 'Daily', value: 'daily'},
              {title: 'Weekly', value: 'weekly'},
              {title: 'None', value: 'none'},
            ],
          },
          initialValue: 'weekly',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'currentStatus',
      priority: 'priority',
      assignedTo: 'assignedTo.name',
    },
    prepare({title, status, priority, assignedTo}) {
      const statusEmojis = {
        draft: '✏️',
        review: '👀',
        approved: '✅',
        published: '🌐',
        archived: '📦',
      }
      
      const priorityEmojis = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }
      
      const statusEmoji = statusEmojis[status as keyof typeof statusEmojis] || '✏️'
      const priorityEmoji = priorityEmojis[priority as keyof typeof priorityEmojis] || '🟡'
      
      return {
        title: `${statusEmoji} ${priorityEmoji} ${title}`,
        subtitle: `Assigned to: ${assignedTo || 'Unassigned'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Priority & Due Date',
      name: 'priorityDue',
      by: [
        {field: 'priority', direction: 'asc'},
        {field: 'dueDate', direction: 'asc'}
      ]
    },
    {
      title: 'Status',
      name: 'status',
      by: [
        {field: 'currentStatus', direction: 'asc'},
        {field: '_updatedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Last Updated',
      name: 'updated',
      by: [
        {field: '_updatedAt', direction: 'desc'}
      ]
    }
  ],
})