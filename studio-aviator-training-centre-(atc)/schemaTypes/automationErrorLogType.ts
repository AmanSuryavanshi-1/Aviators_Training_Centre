import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'automationErrorLog',
  title: 'Automation Error Log',
  type: 'document',
  fields: [
    defineField({
      name: 'error',
      title: 'Error Message',
      type: 'text',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'context',
      title: 'Error Context',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'stack',
      title: 'Stack Trace',
      type: 'text'
    }),
    defineField({
      name: 'metadata',
      title: 'Additional Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'draftId',
          title: 'Draft ID',
          type: 'string'
        }),
        defineField({
          name: 'automationId',
          title: 'Automation ID',
          type: 'string'
        }),
        defineField({
          name: 'action',
          title: 'Action',
          type: 'string'
        }),
        defineField({
          name: 'additionalInfo',
          title: 'Additional Info',
          type: 'text'
        })
      ]
    }),
    defineField({
      name: 'resolved',
      title: 'Resolved',
      type: 'boolean',
      initialValue: false
    })
  ],
  preview: {
    select: {
      title: 'error',
      subtitle: 'context',
      timestamp: 'timestamp'
    },
    prepare({ title, subtitle, timestamp }) {
      return {
        title: title || 'Unknown Error',
        subtitle: `${subtitle || 'Unknown Context'} - ${new Date(timestamp).toLocaleString()}`,
        media: {
          type: 'icon',
          icon: 'alert-triangle'
        }
      };
    }
  }
});