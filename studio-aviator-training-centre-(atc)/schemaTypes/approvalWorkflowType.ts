import {defineField, defineType} from 'sanity'

export const approvalWorkflowType = defineType({
  name: 'approvalWorkflow',
  title: 'Approval Workflow',
  type: 'document',
  fields: [
    defineField({
      name: 'contentRef',
      title: 'Content Reference',
      type: 'reference',
      to: [{type: 'post'}, {type: 'course'}],
      validation: (rule) => rule.required(),
      description: 'The content that requires approval',
    }),
    defineField({
      name: 'workflowId',
      title: 'Workflow ID',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'Unique identifier for this approval workflow',
    }),
    defineField({
      name: 'currentStage',
      title: 'Current Stage',
      type: 'number',
      initialValue: 0,
      description: 'Current stage index in the approval process',
    }),
    defineField({
      name: 'status',
      title: 'Workflow Status',
      type: 'string',
      options: {
        list: [
          {title: '🔄 Active', value: 'active'},
          {title: '✅ Completed', value: 'completed'},
          {title: '❌ Cancelled', value: 'cancelled'},
        ],
      },
      initialValue: 'active',
    }),
    defineField({
      name: 'stages',
      title: 'Approval Stages',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'approvalStage',
          title: 'Approval Stage',
          fields: [
            {
              name: 'stageId',
              title: 'Stage ID',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'name',
              title: 'Stage Name',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            },
            {
              name: 'order',
              title: 'Order',
              type: 'number',
              validation: (rule) => rule.required().min(1),
            },
            {
              name: 'status',
              title: 'Stage Status',
              type: 'string',
              options: {
                list: [
                  {title: '⏳ Pending', value: 'pending'},
                  {title: '🔄 In Progress', value: 'in_progress'},
                  {title: '✅ Completed', value: 'completed'},
                  {title: '⏭️ Skipped', value: 'skipped'},
                ],
              },
              initialValue: 'pending',
            },
            {
              name: 'requiredApprovals',
              title: 'Required Approvals',
              type: 'number',
              validation: (rule) => rule.required().min(0),
              description: 'Number of approvals needed to complete this stage',
            },
            {
              name: 'approverLevels',
              title: 'Approver Levels',
              type: 'array',
              of: [{type: 'string'}],
              options: {
                list: [
                  {title: 'Admin', value: 'admin'},
                  {title: 'Senior', value: 'senior'},
                ],
              },
              description: 'Author levels that can approve at this stage',
            },
            {
              name: 'specificApprovers',
              title: 'Specific Approvers',
              type: 'array',
              of: [{
                type: 'reference',
                to: [{type: 'author'}]
              }],
              description: 'Specific authors assigned to approve at this stage',
            },
            {
              name: 'startedAt',
              title: 'Started At',
              type: 'datetime',
              description: 'When this stage was started',
            },
            {
              name: 'completedAt',
              title: 'Completed At',
              type: 'datetime',
              description: 'When this stage was completed',
            },
            {
              name: 'dueDate',
              title: 'Due Date',
              type: 'datetime',
              description: 'When this stage should be completed by',
            },
            {
              name: 'canSkip',
              title: 'Can Skip',
              type: 'boolean',
              initialValue: false,
              description: 'Whether this stage can be skipped under certain conditions',
            },
            {
              name: 'isParallel',
              title: 'Is Parallel',
              type: 'boolean',
              initialValue: false,
              description: 'Whether this stage runs in parallel with others',
            },
            {
              name: 'escalationHours',
              title: 'Escalation Hours',
              type: 'number',
              description: 'Hours after which to escalate if not completed',
            },
            {
              name: 'escalateTo',
              title: 'Escalate To',
              type: 'array',
              of: [{type: 'string'}],
              options: {
                list: [
                  {title: 'Admin', value: 'admin'},
                  {title: 'Senior', value: 'senior'},
                ],
              },
              description: 'Author levels to escalate to after timeout',
            },
          ],
          preview: {
            select: {
              name: 'name',
              status: 'status',
              order: 'order',
              requiredApprovals: 'requiredApprovals',
            },
            prepare({name, status, order, requiredApprovals}) {
              const statusEmojis = {
                pending: '⏳',
                in_progress: '🔄',
                completed: '✅',
                skipped: '⏭️',
              }
              
              const emoji = statusEmojis[status as keyof typeof statusEmojis] || '⏳'
              
              return {
                title: `${order}. ${name}`,
                subtitle: `${emoji} ${status} • ${requiredApprovals} approval${requiredApprovals !== 1 ? 's' : ''} required`,
              }
            },
          },
        },
      ],
      description: 'The stages in this approval workflow',
    }),
    defineField({
      name: 'decisions',
      title: 'Approval Decisions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'approvalDecision',
          title: 'Approval Decision',
          fields: [
            {
              name: 'decisionId',
              title: 'Decision ID',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'stageId',
              title: 'Stage ID',
              type: 'string',
              validation: (rule) => rule.required(),
              description: 'The stage this decision belongs to',
            },
            {
              name: 'approver',
              title: 'Approver',
              type: 'reference',
              to: [{type: 'author'}],
              validation: (rule) => rule.required(),
            },
            {
              name: 'decision',
              title: 'Decision',
              type: 'string',
              options: {
                list: [
                  {title: '✅ Approve', value: 'approve'},
                  {title: '❌ Reject', value: 'reject'},
                  {title: '🔄 Request Changes', value: 'request_changes'},
                ],
              },
              validation: (rule) => rule.required(),
            },
            {
              name: 'timestamp',
              title: 'Decision Time',
              type: 'datetime',
              validation: (rule) => rule.required(),
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'notes',
              title: 'Decision Notes',
              type: 'text',
              rows: 3,
              description: 'Comments or feedback from the approver',
            },
            {
              name: 'conditions',
              title: 'Approval Conditions',
              type: 'array',
              of: [{type: 'string'}],
              description: 'Any conditions that must be met for approval',
            },
            {
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
            },
            {
              name: 'relatedFields',
              title: 'Related Fields',
              type: 'array',
              of: [{type: 'string'}],
              description: 'Content fields this decision relates to',
            },
          ],
          preview: {
            select: {
              decision: 'decision',
              approver: 'approver.name',
              timestamp: 'timestamp',
              notes: 'notes',
            },
            prepare({decision, approver, timestamp, notes}) {
              const decisionEmojis = {
                approve: '✅',
                reject: '❌',
                request_changes: '🔄',
              }
              
              const emoji = decisionEmojis[decision as keyof typeof decisionEmojis] || '❓'
              const date = new Date(timestamp).toLocaleDateString()
              
              return {
                title: `${emoji} ${decision} by ${approver}`,
                subtitle: `${date} • ${notes ? notes.substring(0, 50) + '...' : 'No notes'}`,
              }
            },
          },
        },
      ],
      description: 'All approval decisions made in this workflow',
    }),
    defineField({
      name: 'totalApprovals',
      title: 'Total Approvals',
      type: 'number',
      initialValue: 0,
      description: 'Total number of approvals received',
    }),
    defineField({
      name: 'totalRejections',
      title: 'Total Rejections',
      type: 'number',
      initialValue: 0,
      description: 'Total number of rejections received',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
      description: 'When the workflow was completed',
    }),
    defineField({
      name: 'escalations',
      title: 'Escalations',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'stageId',
              title: 'Stage ID',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'escalatedAt',
              title: 'Escalated At',
              type: 'datetime',
              validation: (rule) => rule.required(),
            },
            {
              name: 'escalatedTo',
              title: 'Escalated To',
              type: 'array',
              of: [{
                type: 'reference',
                to: [{type: 'author'}]
              }],
            },
            {
              name: 'reason',
              title: 'Escalation Reason',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'resolvedAt',
              title: 'Resolved At',
              type: 'datetime',
            },
          ],
          preview: {
            select: {
              stageId: 'stageId',
              escalatedAt: 'escalatedAt',
              reason: 'reason',
              resolved: 'resolvedAt',
            },
            prepare({stageId, escalatedAt, reason, resolved}) {
              const date = new Date(escalatedAt).toLocaleDateString()
              const status = resolved ? '✅ Resolved' : '⏳ Pending'
              
              return {
                title: `Escalation: ${stageId}`,
                subtitle: `${date} • ${status} • ${reason}`,
              }
            },
          },
        },
      ],
      description: 'Record of any escalations in this workflow',
    }),
    defineField({
      name: 'metadata',
      title: 'Workflow Metadata',
      type: 'object',
      fields: [
        {
          name: 'contentType',
          title: 'Content Type',
          type: 'string',
          description: 'Type of content being approved',
        },
        {
          name: 'contentArea',
          title: 'Content Area',
          type: 'string',
          description: 'Content area/category',
        },
        {
          name: 'wordCount',
          title: 'Word Count',
          type: 'number',
          description: 'Word count of the content',
        },
        {
          name: 'hasImages',
          title: 'Has Images',
          type: 'boolean',
          description: 'Whether content includes images',
        },
        {
          name: 'hasSEOData',
          title: 'Has SEO Data',
          type: 'boolean',
          description: 'Whether content has SEO metadata',
        },
        {
          name: 'originalAuthor',
          title: 'Original Author',
          type: 'reference',
          to: [{type: 'author'}],
          description: 'The author who created the content',
        },
        {
          name: 'requestedBy',
          title: 'Requested By',
          type: 'reference',
          to: [{type: 'author'}],
          description: 'Who requested the approval workflow',
        },
        {
          name: 'priority',
          title: 'Workflow Priority',
          type: 'string',
          options: {
            list: [
              {title: '🔴 High', value: 'high'},
              {title: '🟡 Medium', value: 'medium'},
              {title: '🟢 Low', value: 'low'},
            ],
          },
          initialValue: 'medium',
        },
        {
          name: 'tags',
          title: 'Tags',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Tags for categorizing this workflow',
        },
      ],
    }),
    defineField({
      name: 'notifications',
      title: 'Notification Settings',
      type: 'object',
      fields: [
        {
          name: 'notifyOnDecision',
          title: 'Notify on Decision',
          type: 'boolean',
          initialValue: true,
          description: 'Send notifications when decisions are made',
        },
        {
          name: 'notifyOnEscalation',
          title: 'Notify on Escalation',
          type: 'boolean',
          initialValue: true,
          description: 'Send notifications when escalations occur',
        },
        {
          name: 'reminderFrequency',
          title: 'Reminder Frequency',
          type: 'string',
          options: {
            list: [
              {title: 'Daily', value: 'daily'},
              {title: 'Every 2 Days', value: 'every_2_days'},
              {title: 'Weekly', value: 'weekly'},
              {title: 'None', value: 'none'},
            ],
          },
          initialValue: 'every_2_days',
        },
        {
          name: 'customRecipients',
          title: 'Custom Recipients',
          type: 'array',
          of: [{
            type: 'reference',
            to: [{type: 'author'}]
          }],
          description: 'Additional people to notify about this workflow',
        },
      ],
    }),
  ],
  preview: {
    select: {
      contentTitle: 'contentRef.title',
      status: 'status',
      currentStage: 'currentStage',
      totalStages: 'stages',
      createdAt: 'createdAt',
      completedAt: 'completedAt',
    },
    prepare({contentTitle, status, currentStage, totalStages, createdAt, completedAt}) {
      const statusEmojis = {
        active: '🔄',
        completed: '✅',
        cancelled: '❌',
      }
      
      const emoji = statusEmojis[status as keyof typeof statusEmojis] || '🔄'
      const stageInfo = totalStages ? `Stage ${currentStage + 1}/${totalStages.length}` : 'No stages'
      const date = completedAt 
        ? `Completed ${new Date(completedAt).toLocaleDateString()}`
        : `Created ${new Date(createdAt).toLocaleDateString()}`
      
      return {
        title: `${emoji} ${contentTitle || 'Untitled Content'}`,
        subtitle: `${stageInfo} • ${date}`,
        media: '📋',
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
      title: 'Status',
      name: 'status',
      by: [
        {field: 'status', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Completion Date',
      name: 'completedAt',
      by: [
        {field: 'completedAt', direction: 'desc'}
      ]
    }
  ],
})