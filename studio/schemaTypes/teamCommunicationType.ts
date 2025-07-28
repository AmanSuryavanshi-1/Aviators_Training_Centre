import {defineField, defineType} from 'sanity'

export const teamCommunicationType = defineType({
  name: 'teamCommunication',
  title: 'Team Communication',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Communication Type',
      type: 'string',
      options: {
        list: [
          {title: '📢 Announcement', value: 'announcement'},
          {title: '💬 Discussion', value: 'discussion'},
          {title: '📝 Update', value: 'update'},
          {title: '🚨 Alert', value: 'alert'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
      description: 'Clear, concise title for the communication',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
      description: 'Who created this communication',
    }),
    defineField({
      name: 'targetAudience',
      title: 'Target Audience',
      type: 'string',
      options: {
        list: [
          {title: '👥 All Team Members', value: 'all'},
          {title: '✍️ Authors Only', value: 'authors'},
          {title: '👨‍💼 Editors Only', value: 'editors'},
          {title: '👑 Admins Only', value: 'admins'},
          {title: '🎯 Specific Users', value: 'specific'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'specificUsers',
      title: 'Specific Users',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{type: 'author'}]
      }],
      hidden: ({parent}) => parent?.targetAudience !== 'specific',
      validation: (rule) => 
        rule.custom((specificUsers, context) => {
          const parent = context.parent as any
          if (parent?.targetAudience === 'specific' && (!specificUsers || specificUsers.length === 0)) {
            return 'Please select specific users when target audience is "Specific Users"'
          }
          return true
        }),
      description: 'Select specific users to notify',
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
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'General', value: 'general'},
          {title: 'Editorial', value: 'editorial'},
          {title: 'Technical', value: 'technical'},
          {title: 'Policy', value: 'policy'},
          {title: 'Training', value: 'training'},
          {title: 'System', value: 'system'},
          {title: 'Workflow', value: 'workflow'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      description: 'Tags for categorizing and searching',
    }),
    defineField({
      name: 'isSticky',
      title: 'Pin to Top',
      type: 'boolean',
      initialValue: false,
      description: 'Pin this communication to the top of the list',
    }),
    defineField({
      name: 'allowComments',
      title: 'Allow Comments',
      type: 'boolean',
      initialValue: true,
      description: 'Allow team members to comment on this communication',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires At',
      type: 'datetime',
      description: 'When this communication should be automatically hidden (optional)',
    }),
    defineField({
      name: 'comments',
      title: 'Comments',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'comment',
          title: 'Comment',
          fields: [
            {
              name: 'commentId',
              title: 'Comment ID',
              type: 'string',
              validation: (rule) => rule.required(),
            },
            {
              name: 'author',
              title: 'Comment Author',
              type: 'reference',
              to: [{type: 'author'}],
              validation: (rule) => rule.required(),
            },
            {
              name: 'content',
              title: 'Comment Content',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            },
            {
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
              validation: (rule) => rule.required(),
              initialValue: () => new Date().toISOString(),
            },
            {
              name: 'parentId',
              title: 'Parent Comment ID',
              type: 'string',
              description: 'ID of parent comment for replies',
            },
            {
              name: 'isEdited',
              title: 'Is Edited',
              type: 'boolean',
              initialValue: false,
            },
            {
              name: 'editedAt',
              title: 'Edited At',
              type: 'datetime',
            },
          ],
          preview: {
            select: {
              content: 'content',
              author: 'author.name',
              timestamp: 'timestamp',
              parentId: 'parentId',
            },
            prepare({content, author, timestamp, parentId}) {
              const date = new Date(timestamp).toLocaleDateString()
              const isReply = parentId ? '↳ ' : ''
              
              return {
                title: `${isReply}${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
                subtitle: `by ${author} • ${date}`,
                media: parentId ? '💬' : '🗨️',
              }
            },
          },
        },
      ],
      description: 'Comments and discussions on this communication',
    }),
    defineField({
      name: 'reactions',
      title: 'Reactions',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'user',
              title: 'User',
              type: 'reference',
              to: [{type: 'author'}],
              validation: (rule) => rule.required(),
            },
            {
              name: 'type',
              title: 'Reaction Type',
              type: 'string',
              options: {
                list: [
                  {title: '👍 Like', value: 'like'},
                  {title: '❤️ Love', value: 'love'},
                  {title: '😂 Laugh', value: 'laugh'},
                  {title: '😮 Wow', value: 'wow'},
                  {title: '😢 Sad', value: 'sad'},
                  {title: '😠 Angry', value: 'angry'},
                ],
              },
              validation: (rule) => rule.required(),
            },
            {
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
              validation: (rule) => rule.required(),
              initialValue: () => new Date().toISOString(),
            },
          ],
          preview: {
            select: {
              type: 'type',
              user: 'user.name',
              timestamp: 'timestamp',
            },
            prepare({type, user, timestamp}) {
              const reactionEmojis = {
                like: '👍',
                love: '❤️',
                laugh: '😂',
                wow: '😮',
                sad: '😢',
                angry: '😠',
              }
              
              const emoji = reactionEmojis[type as keyof typeof reactionEmojis] || '👍'
              const date = new Date(timestamp).toLocaleDateString()
              
              return {
                title: `${emoji} ${type}`,
                subtitle: `by ${user} • ${date}`,
              }
            },
          },
        },
      ],
      description: 'Reactions from team members',
    }),
    defineField({
      name: 'readBy',
      title: 'Read By',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'user',
              title: 'User',
              type: 'reference',
              to: [{type: 'author'}],
              validation: (rule) => rule.required(),
            },
            {
              name: 'timestamp',
              title: 'Read At',
              type: 'datetime',
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: {
              user: 'user.name',
              timestamp: 'timestamp',
            },
            prepare({user, timestamp}) {
              const date = new Date(timestamp).toLocaleString()
              
              return {
                title: user,
                subtitle: `Read at ${date}`,
                media: '👁️',
              }
            },
          },
        },
      ],
      description: 'Track who has read this communication',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      description: 'Last time this communication was updated',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      type: 'type',
      author: 'author.name',
      priority: 'priority',
      targetAudience: 'targetAudience',
      createdAt: 'createdAt',
      isSticky: 'isSticky',
      commentsCount: 'comments',
    },
    prepare({title, type, author, priority, targetAudience, createdAt, isSticky, commentsCount}) {
      const typeEmojis = {
        announcement: '📢',
        discussion: '💬',
        update: '📝',
        alert: '🚨',
      }
      
      const priorityEmojis = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }
      
      const audienceEmojis = {
        all: '👥',
        authors: '✍️',
        editors: '👨‍💼',
        admins: '👑',
        specific: '🎯',
      }
      
      const typeEmoji = typeEmojis[type as keyof typeof typeEmojis] || '📄'
      const priorityEmoji = priorityEmojis[priority as keyof typeof priorityEmojis] || '🟡'
      const audienceEmoji = audienceEmojis[targetAudience as keyof typeof audienceEmojis] || '👥'
      const stickyEmoji = isSticky ? '📌 ' : ''
      const date = new Date(createdAt).toLocaleDateString()
      const commentCount = Array.isArray(commentsCount) ? commentsCount.length : 0
      
      return {
        title: `${stickyEmoji}${typeEmoji} ${priorityEmoji} ${title}`,
        subtitle: `${audienceEmoji} by ${author} • ${date} • ${commentCount} comment${commentCount !== 1 ? 's' : ''}`,
        media: typeEmoji,
      }
    },
  },
  orderings: [
    {
      title: 'Sticky & Recent',
      name: 'stickyRecent',
      by: [
        {field: 'isSticky', direction: 'desc'},
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
      title: 'Most Recent',
      name: 'createdAtDesc',
      by: [
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Type',
      name: 'type',
      by: [
        {field: 'type', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Author',
      name: 'author',
      by: [
        {field: 'author.name', direction: 'asc'},
        {field: 'createdAt', direction: 'desc'}
      ]
    }
  ],
})