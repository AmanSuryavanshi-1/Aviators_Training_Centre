import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'automationAuditLog',
  title: 'Automation Audit Log',
  type: 'document',
  fields: [
    defineField({
      name: 'action',
      title: 'Action',
      type: 'string',
      validation: Rule => Rule.required(),
      options: {
        list: [
          { title: 'Draft Created', value: 'draft_created' },
          { title: 'Draft Approved', value: 'draft_approved' },
          { title: 'Draft Rejected', value: 'draft_rejected' },
          { title: 'Draft Deleted', value: 'draft_deleted' },
          { title: 'Webhook Received', value: 'webhook_received' },
          { title: 'Error Occurred', value: 'error_occurred' },
        ]
      }
    }),
    defineField({
      name: 'draftId',
      title: 'Draft ID',
      type: 'string'
    }),
    defineField({
      name: 'editorId',
      title: 'Editor ID',
      type: 'string'
    }),
    defineField({
      name: 'editorName',
      title: 'Editor Name',
      type: 'string'
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'text'
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'metadata',
      title: 'Additional Metadata',
      type: 'object',
      fields: [
        defineField({
          name: 'automationId',
          title: 'Automation ID',
          type: 'string'
        }),
        defineField({
          name: 'sourceUrl',
          title: 'Source URL',
          type: 'url'
        }),
        defineField({
          name: 'additionalInfo',
          title: 'Additional Info',
          type: 'text'
        })
      ]
    })
  ],
  preview: {
    select: {
      title: 'action',
      subtitle: 'editorName',
      timestamp: 'timestamp'
    },
    prepare({ title, subtitle, timestamp }) {
      const actionLabels = {
        draft_created: 'Draft Created',
        draft_approved: 'Draft Approved',
        draft_rejected: 'Draft Rejected',
        draft_deleted: 'Draft Deleted',
        webhook_received: 'Webhook Received',
        error_occurred: 'Error Occurred'
      };
      
      return {
        title: actionLabels[title as keyof typeof actionLabels] || title,
        subtitle: `${subtitle ? `By ${subtitle}` : ''} - ${new Date(timestamp).toLocaleString()}`,
        media: {
          type: 'icon',
          icon: title === 'draft_approved' ? 'check-circle' : 
                title === 'draft_rejected' ? 'x-circle' : 
                title === 'error_occurred' ? 'alert-triangle' : 'file-text'
        }
      };
    }
  }
});