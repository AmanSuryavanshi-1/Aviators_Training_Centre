import {defineField, defineType} from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Blog Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'color',
      title: 'Category Color',
      type: 'string',
      options: {
        list: [
          {title: 'Teal (Primary)', value: 'teal'},
          {title: 'Blue (Secondary)', value: 'blue'},
          {title: 'Green (Success)', value: 'green'},
          {title: 'Orange (Warning)', value: 'orange'},
          {title: 'Red (Important)', value: 'red'},
          {title: 'Purple (Special)', value: 'purple'},
        ],
      },
      initialValue: 'teal',
    }),
    defineField({
      name: 'intelligentRouting',
      title: 'Intelligent CTA Routing',
      type: 'object',
      fields: [
        {
          name: 'defaultCourse',
          title: 'Default Course',
          type: 'reference',
          to: [{type: 'course'}],
          description: 'Default course to promote for this category',
        },
        {
          name: 'keywords',
          title: 'Category Keywords',
          type: 'array',
          of: [{type: 'string'}],
          description: 'Keywords that help identify content for this category',
        },
        {
          name: 'courseMapping',
          title: 'Course Mapping Rules',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'keywords',
                  title: 'Keywords',
                  type: 'array',
                  of: [{type: 'string'}],
                  description: 'If content contains these keywords...',
                },
                {
                  name: 'targetCourse',
                  title: 'Target Course',
                  type: 'reference',
                  to: [{type: 'course'}],
                  description: '...promote this course',
                },
              ],
              preview: {
                select: {
                  keywords: 'keywords',
                  courseName: 'targetCourse.name',
                },
                prepare({keywords, courseName}) {
                  return {
                    title: `${keywords?.join(', ') || 'No keywords'} → ${courseName || 'No course'}`,
                  }
                },
              },
            },
          ],
        },
      ],
      description: 'Configure how CTAs are intelligently routed for this category',
    }),
    defineField({
      name: 'seoSettings',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title Template',
          type: 'string',
          description: 'Template for category page titles',
        },
        {
          name: 'metaDescription',
          title: 'Meta Description Template',
          type: 'text',
          rows: 2,
          description: 'Template for category page descriptions',
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
