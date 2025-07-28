import {defineField, defineType} from 'sanity'

export const permissionChangeLogType = defineType({
  name: 'permissionChangeLog',
  title: 'Permission Change Log',
  type: 'document',
  fields: [
    defineField({
      name: 'changedBy',
      title: 'Changed By',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
      description: 'The author who made the permission change',
    }),
    defineField({
      name: 'targetAuthor',
      title: 'Target Author',
      type: 'reference',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
      description: 'The author whose permissions were changed',
    }),
    defineField({
      name: 'changes',
      title: 'Changes Made',
      type: 'object',
      fields: [
        {
          name: 'authorLevel',
          title: 'Author Level Change',
          type: 'object',
          fields: [
            {
              name: 'from',
              title: 'From',
              type: 'string',
              options: {
                list: [
                  {title: 'Admin', value: 'admin'},
                  {title: 'Senior', value: 'senior'},
                  {title: 'Regular', value: 'regular'},
                  {title: 'Guest', value: 'guest'},
                ],
              },
            },
            {
              name: 'to',
              title: 'To',
              type: 'string',
              options: {
                list: [
                  {title: 'Admin', value: 'admin'},
                  {title: 'Senior', value: 'senior'},
                  {title: 'Regular', value: 'regular'},
                  {title: 'Guest', value: 'guest'},
                ],
              },
            },
          ],
        },
        {
          name: 'permissions',
          title: 'Permission Changes',
          type: 'object',
          fields: [
            {
              name: 'canPublishDirectly',
              title: 'Can Publish Directly',
              type: 'object',
              fields: [
                {name: 'from', type: 'boolean'},
                {name: 'to', type: 'boolean'},
              ],
            },
            {
              name: 'canEditOthersContent',
              title: 'Can Edit Others Content',
              type: 'object',
              fields: [
                {name: 'from', type: 'boolean'},
                {name: 'to', type: 'boolean'},
              ],
            },
            {
              name: 'canManageCategories',
              title: 'Can Manage Categories',
              type: 'object',
              fields: [
                {name: 'from', type: 'boolean'},
                {name: 'to', type: 'boolean'},
              ],
            },
            {
              name: 'canManageCourses',
              title: 'Can Manage Courses',
              type: 'object',
              fields: [
                {name: 'from', type: 'boolean'},
                {name: 'to', type: 'boolean'},
              ],
            },
            {
              name: 'requiresApproval',
              title: 'Requires Approval',
              type: 'object',
              fields: [
                {name: 'from', type: 'boolean'},
                {name: 'to', type: 'boolean'},
              ],
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'reason',
      title: 'Reason for Change',
      type: 'text',
      rows: 3,
      description: 'Optional reason for the permission change',
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'ipAddress',
      title: 'IP Address',
      type: 'string',
      description: 'IP address from which the change was made',
    }),
    defineField({
      name: 'userAgent',
      title: 'User Agent',
      type: 'string',
      description: 'Browser/client information',
    }),
  ],
  preview: {
    select: {
      changedBy: 'changedBy.name',
      targetAuthor: 'targetAuthor.name',
      timestamp: 'timestamp',
      authorLevelFrom: 'changes.authorLevel.from',
      authorLevelTo: 'changes.authorLevel.to',
    },
    prepare({changedBy, targetAuthor, timestamp, authorLevelFrom, authorLevelTo}) {
      const date = new Date(timestamp).toLocaleDateString()
      const time = new Date(timestamp).toLocaleTimeString()
      
      let changeDescription = 'Permission update'
      if (authorLevelFrom && authorLevelTo && authorLevelFrom !== authorLevelTo) {
        changeDescription = `Level: ${authorLevelFrom} → ${authorLevelTo}`
      }
      
      return {
        title: `${changedBy} → ${targetAuthor}`,
        subtitle: `${changeDescription} • ${date} ${time}`,
        media: '🔐',
      }
    },
  },
  orderings: [
    {
      title: 'Most Recent',
      name: 'timestampDesc',
      by: [
        {field: 'timestamp', direction: 'desc'}
      ]
    },
    {
      title: 'By Changed Author',
      name: 'changedBy',
      by: [
        {field: 'changedBy.name', direction: 'asc'},
        {field: 'timestamp', direction: 'desc'}
      ]
    },
    {
      title: 'By Target Author',
      name: 'targetAuthor',
      by: [
        {field: 'targetAuthor.name', direction: 'asc'},
        {field: 'timestamp', direction: 'desc'}
      ]
    }
  ],
})