import {defineField, defineType} from 'sanity'

export const courseType = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Course Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Course Category',
      type: 'string',
      options: {
        list: [
          {title: 'Technical General', value: 'technical-general'},
          {title: 'Technical Specific', value: 'technical-specific'},
          {title: 'CPL Ground School', value: 'cpl-ground-school'},
          {title: 'ATPL Ground School', value: 'atpl-ground-school'},
          {title: 'Type Rating', value: 'type-rating'},
          {title: 'General Aviation', value: 'general-aviation'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'string',
      validation: (rule) => rule.required().max(100),
      description: 'Brief description for CTA displays',
    }),
    defineField({
      name: 'targetUrl',
      title: 'Target URL',
      type: 'string',
      validation: (rule) => rule.required(),
      description: 'URL path where users should be directed (e.g., /courses/technical-general)',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Course price in INR',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'e.g., "6 months", "3 weeks"',
    }),
    defineField({
      name: 'level',
      title: 'Course Level',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
          {title: 'Professional', value: 'professional'},
        ],
      },
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Keywords for intelligent CTA routing (e.g., "dgca", "ground school", "commercial pilot")',
    }),
    defineField({
      name: 'ctaSettings',
      title: 'CTA Settings',
      type: 'object',
      fields: [
        {
          name: 'primaryButtonText',
          title: 'Primary Button Text',
          type: 'string',
          initialValue: 'Enroll Now',
        },
        {
          name: 'secondaryButtonText',
          title: 'Secondary Button Text',
          type: 'string',
          initialValue: 'Learn More',
        },
        {
          name: 'ctaTitle',
          title: 'CTA Title Template',
          type: 'string',
          initialValue: 'Ready to Start Your {courseName}?',
          description: 'Use {courseName} as placeholder',
        },
        {
          name: 'ctaMessage',
          title: 'CTA Message Template',
          type: 'text',
          rows: 2,
          initialValue: 'Take the next step in your aviation career with our comprehensive {courseName} program.',
          description: 'Use {courseName} as placeholder',
        },
      ],
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Only active courses appear in CTA selections',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      active: 'active',
    },
    prepare({title, subtitle, active}) {
      return {
        title: `${title}${!active ? ' (Inactive)' : ''}`,
        subtitle,
      }
    },
  },
})