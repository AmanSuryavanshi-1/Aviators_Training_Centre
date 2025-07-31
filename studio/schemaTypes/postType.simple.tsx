import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    {
      name: 'content',
      title: 'Content',
      default: true,
    },
    {
      name: 'seo',
      title: 'SEO & Meta',
    },
    {
      name: 'settings',
      title: 'Settings',
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'H5', value: 'h5'},
            {title: 'H6', value: 'h6'},
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
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
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
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: false,
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
              validation: (rule) => rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption displayed below the image',
            },
          ],
        },
        // Raw HTML block for direct HTML content
        {
          type: 'object',
          name: 'htmlBlock',
          title: 'HTML Block',
          fields: [
            {
              name: 'html',
              title: 'HTML Content',
              type: 'text',
              rows: 10,
              description: 'Raw HTML content',
            },
            {
              name: 'description',
              title: 'Description',
              type: 'string',
              description: 'Brief description of this HTML block',
            },
          ],
          preview: {
            select: {
              html: 'html',
              description: 'description',
            },
            prepare({html, description}) {
              return {
                title: `🔧 ${description || 'HTML Block'}`,
                subtitle: html?.substring(0, 100) + (html?.length > 100 ? '...' : ''),
              }
            },
          },
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'content',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'content',
      to: [{type: 'category'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
      description: 'Select relevant tags for better content organization and SEO',
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Description of the image for accessibility',
        }
      ],
      description: 'Optional featured image for the blog post',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'settings',
      initialValue: () => new Date().toISOString(),
    }),
    // SEO Fields
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      rows: 3,
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'seoImage',
      title: 'SEO Image',
      type: 'image',
      group: 'seo',
      options: {hotspot: true},
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        },
      ],
    }),
    // Additional fields for full compatibility
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
      group: 'seo',
      description: 'Primary keyword for SEO optimization',
    }),
    defineField({
      name: 'additionalKeywords',
      title: 'Additional Keywords',
      type: 'array',
      group: 'seo',
      of: [{type: 'string'}],
      description: 'Secondary keywords for broader SEO coverage',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      group: 'settings',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(60),
      description: 'Estimated reading time',
    }),
    defineField({
      name: 'workflowStatus',
      title: 'Workflow Status',
      type: 'string',
      group: 'settings',
      options: {
        list: [
          {title: '✏️ Draft', value: 'draft'},
          {title: '👀 Under Review', value: 'review'},
          {title: '✅ Approved', value: 'approved'},
          {title: '🌐 Published', value: 'published'},
          {title: '📦 Archived', value: 'archived'},
        ],
      },
      initialValue: 'draft',
      description: 'Current workflow status of this post',
    }),
    // Performance Metrics
    defineField({
      name: 'performanceMetrics',
      title: 'Performance Metrics',
      type: 'object',
      group: 'settings',
      fields: [
        {
          name: 'estimatedReadingTime',
          title: 'Estimated Reading Time',
          type: 'number',
          description: 'Automatically calculated based on content length',
        },
        {
          name: 'wordCount',
          title: 'Word Count',
          type: 'number',
          description: 'Total word count of the article',
        },
        {
          name: 'lastSEOCheck',
          title: 'Last SEO Check',
          type: 'datetime',
          description: 'When SEO analysis was last performed',
        },
        {
          name: 'seoScore',
          title: 'SEO Score',
          type: 'number',
          description: 'Current SEO score (0-100)',
        },
      ],
      description: 'Automatically tracked performance metrics',
    }),
    // Content Validation
    defineField({
      name: 'contentValidation',
      title: 'Content Validation',
      type: 'object',
      group: 'settings',
      fields: [
        {
          name: 'hasRequiredFields',
          title: 'Has Required Fields',
          type: 'boolean',
          description: 'All required fields are completed',
        },
        {
          name: 'hasValidSEO',
          title: 'Has Valid SEO',
          type: 'boolean',
          description: 'SEO fields are properly configured',
        },
        {
          name: 'hasValidImages',
          title: 'Has Valid Images',
          type: 'boolean',
          description: 'All images have proper alt text',
        },
        {
          name: 'readyForPublish',
          title: 'Ready for Publish',
          type: 'boolean',
          description: 'Content passes all validation checks',
        },
      ],
      description: 'Content validation status',
    }),
    // CTA Configuration
    defineField({
      name: 'ctaPlacements',
      title: 'CTA Placements',
      type: 'array',
      group: 'settings',
      of: [
        {
          type: 'object',
          name: 'ctaPlacement',
          title: 'CTA Placement',
          fields: [
            {
              name: 'position',
              title: 'Position',
              type: 'string',
              options: {
                list: [
                  {title: 'Top of Article', value: 'top'},
                  {title: 'Middle of Article', value: 'middle'},
                  {title: 'Bottom of Article', value: 'bottom'},
                  {title: 'Sidebar', value: 'sidebar'},
                ],
              },
            },
            {
              name: 'ctaType',
              title: 'CTA Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Course Promotion', value: 'course-promo'},
                  {title: 'Free Consultation', value: 'consultation'},
                  {title: 'Newsletter Signup', value: 'newsletter'},
                  {title: 'Download Resource', value: 'download'},
                ],
              },
            },
            {
              name: 'customTitle',
              title: 'Custom CTA Title',
              type: 'string',
              description: 'Override default CTA title',
            },
            {
              name: 'customMessage',
              title: 'Custom Message',
              type: 'text',
              rows: 2,
              description: 'Custom promotional message',
            },
            {
              name: 'buttonText',
              title: 'Button Text',
              type: 'string',
              description: 'Custom button text (optional)',
            },
            {
              name: 'variant',
              title: 'Visual Variant',
              type: 'string',
              options: {
                list: [
                  {title: 'Primary (Teal)', value: 'primary'},
                  {title: 'Secondary (Blue)', value: 'secondary'},
                  {title: 'Outline', value: 'outline'},
                  {title: 'Minimal', value: 'minimal'},
                ],
              },
              initialValue: 'primary',
            },
          ],
        },
      ],
      description: 'Configure strategic CTA placements throughout the article',
    }),
    // Structured Data
    defineField({
      name: 'structuredData',
      title: 'Structured Data',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'articleType',
          title: 'Article Type',
          type: 'string',
          options: {
            list: [
              {title: 'Educational Article', value: 'EducationalArticle'},
              {title: 'How-To Article', value: 'HowTo'},
              {title: 'News Article', value: 'NewsArticle'},
              {title: 'Technical Article', value: 'TechArticle'},
            ],
          },
          initialValue: 'EducationalArticle',
        },
        {
          name: 'learningResourceType',
          title: 'Learning Resource Type',
          type: 'string',
          options: {
            list: [
              {title: 'Article', value: 'Article'},
              {title: 'Tutorial', value: 'Tutorial'},
              {title: 'Guide', value: 'Guide'},
              {title: 'Course Material', value: 'CourseMaterial'},
            ],
          },
          initialValue: 'Article',
        },
        {
          name: 'educationalLevel',
          title: 'Educational Level',
          type: 'string',
          options: {
            list: [
              {title: 'Beginner', value: 'beginner'},
              {title: 'Intermediate', value: 'intermediate'},
              {title: 'Advanced', value: 'advanced'},
              {title: 'Professional', value: 'professional'},
            ],
          },
        },
        {
          name: 'timeRequired',
          title: 'Time Required',
          type: 'string',
          description: 'e.g., "PT10M" for 10 minutes',
        },
      ],
      description: 'Structured data for rich search results',
    }),
    // Support for body field as alias
    defineField({
      name: 'body',
      title: 'Body Content (Alias)',
      type: 'array',
      group: 'content',
      hidden: true, // Hide from UI since we use 'content'
      of: [
        {
          type: 'block',
        }
      ],
      description: 'Alias for content field to support different import formats',
    }),
    // Raw HTML content field for direct HTML imports
    defineField({
      name: 'htmlContent',
      title: 'Raw HTML Content',
      type: 'text',
      group: 'content',
      rows: 20,
      description: 'Raw HTML content for direct imports (use content field for structured content)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'seoImage',
      publishedAt: 'publishedAt',
    },
    prepare({title, author, media, publishedAt}) {
      return {
        title,
        subtitle: `by ${author || 'Unknown'} • ${publishedAt ? new Date(publishedAt).toLocaleDateString() : 'Not published'}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Published Date (Newest)',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Published Date (Oldest)',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'}
      ]
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    },
  ],
})