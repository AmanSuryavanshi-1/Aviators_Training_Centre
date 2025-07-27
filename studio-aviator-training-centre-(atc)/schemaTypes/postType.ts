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
      name: 'cta',
      title: 'CTA & Conversion',
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
      validation: (rule) => rule.required().min(10).max(80),
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
      validation: (rule) => rule.required().min(120).max(160),
      description: 'Brief summary that appears in blog listings and search results',
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
      // Image is now optional - removed validation rule
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
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'content',
      to: [{type: 'author'}],
      description: 'Select the author of this post',
    }),
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
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
              validation: (rule) => rule.required(),
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ]
        }
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      group: 'settings',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Featured posts appear in the hero carousel',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      group: 'settings',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(60),
    }),
    // Enhanced SEO Fields
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60),
      description: 'Optimized title for search engines (max 60 characters)',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      rows: 2,
      validation: (rule) => rule.max(160),
      description: 'Meta description for search results (max 160 characters)',
    }),
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
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      group: 'seo',
      description: 'Override canonical URL if needed',
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      group: 'seo',
      options: {hotspot: true},
      description: 'Custom image for social media sharing (1200x630px recommended)',
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
        }
      ],
    }),
    // Structured Data Fields
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
    // CTA Configuration Fields
    defineField({
      name: 'ctaPlacements',
      title: 'CTA Placements',
      type: 'array',
      group: 'cta',
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
              validation: (rule) => rule.required(),
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
              validation: (rule) => rule.required(),
            },
            {
              name: 'targetCourse',
              title: 'Target Course',
              type: 'reference',
              to: [{type: 'course'}],
              hidden: ({parent}) => parent?.ctaType !== 'course-promo',
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
          preview: {
            select: {
              position: 'position',
              ctaType: 'ctaType',
              customTitle: 'customTitle',
            },
            prepare({position, ctaType, customTitle}) {
              return {
                title: customTitle || `${ctaType} CTA`,
                subtitle: `Position: ${position}`,
              }
            },
          },
        },
      ],
      description: 'Configure strategic CTA placements throughout the article',
    }),
    defineField({
      name: 'intelligentCTARouting',
      title: 'Intelligent CTA Routing',
      type: 'object',
      group: 'cta',
      fields: [
        {
          name: 'enableIntelligentRouting',
          title: 'Enable Intelligent Routing',
          type: 'boolean',
          initialValue: true,
          description: 'Automatically route CTAs based on content analysis',
        },
        {
          name: 'primaryCourseTarget',
          title: 'Primary Course Target',
          type: 'reference',
          to: [{type: 'course'}],
          description: 'Override automatic course detection',
        },
        {
          name: 'fallbackAction',
          title: 'Fallback Action',
          type: 'string',
          options: {
            list: [
              {title: 'Contact Page', value: 'contact'},
              {title: 'Courses Overview', value: 'courses-overview'},
              {title: 'Free Consultation', value: 'consultation'},
            ],
          },
          initialValue: 'courses-overview',
        },
      ],
      description: 'Configure intelligent CTA routing based on content analysis',
    }),
    // Workflow Management
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
    defineField({
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      group: 'settings',
      rows: 3,
      description: 'Notes from editors or reviewers',
    }),
    defineField({
      name: 'scheduledPublishAt',
      title: 'Scheduled Publish Date',
      type: 'datetime',
      group: 'settings',
      description: 'Schedule this post to be published at a specific date and time',
    }),
    // Performance Tracking
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
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      publishedAt: 'publishedAt',
      workflowStatus: 'workflowStatus',
      featured: 'featured',
      category: 'category.title',
    },
    prepare({title, media, publishedAt, workflowStatus, featured, category}) {
      const statusEmojis = {
        draft: '✏️',
        review: '👀',
        approved: '✅',
        published: '🌐',
        archived: '📦',
      }
      
      const statusEmoji = statusEmojis[workflowStatus as keyof typeof statusEmojis] || '✏️'
      const featuredEmoji = featured ? '⭐ ' : ''
      
      return {
        title: `${statusEmoji} ${featuredEmoji}${title}`,
        media,
        subtitle: `${category || 'No category'} • ${publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'}`,
      }
    },
  },
  orderings: [
    {
      title: 'Published Date (Newest)',
      name: 'publishedAtDesc',
      by: [
        {field: 'publishedAt', direction: 'desc'},
        {field: '_createdAt', direction: 'desc'}
      ]
    },
    {
      title: 'Published Date (Oldest)',
      name: 'publishedAtAsc',
      by: [
        {field: 'publishedAt', direction: 'asc'},
        {field: '_createdAt', direction: 'asc'}
      ]
    },
    {
      title: 'Title (A-Z)',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    },
    {
      title: 'Last Updated',
      name: 'updatedAtDesc',
      by: [
        {field: '_updatedAt', direction: 'desc'}
      ]
    },
    {
      title: 'Workflow Status',
      name: 'workflowStatus',
      by: [
        {field: 'workflowStatus', direction: 'asc'},
        {field: '_updatedAt', direction: 'desc'}
      ]
    }
  ],
})
