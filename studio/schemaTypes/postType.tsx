import React from 'react'
import {defineField, defineType} from 'sanity'
import {ComprehensivePreview} from '../components/ComprehensivePreview'
import {RealTimeSEOAnalyzer} from '../components/RealTimeSEOAnalyzer'
import {PreviewStatusIndicator} from '../components/PreviewStatusIndicator'
import {SEOAuditPanel} from '../components/SEOAuditPanel'
import {SEOWarningBanner} from '../components/SEOWarningBanner'
import {SocialImageGenerator} from '../components/SocialImageGenerator'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  components: {
    preview: ComprehensivePreview,
  },
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
    // SEO Warning Banner (appears at top)
    defineField({
      name: 'seoWarnings',
      title: 'SEO Status',
      type: 'object',
      group: 'content',
      fields: [
        {
          name: 'placeholder',
          type: 'string',
          title: 'Placeholder',
          hidden: true,
        }
      ],
      components: {
        input: (props) => <SEOWarningBanner document={props.document} />
      },
      description: 'SEO status and warnings',
    }),

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
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{type: 'reference', to: [{type: 'tag'}]}],
      description: 'Select relevant tags for better content organization and SEO',
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
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'H5', value: 'h5'},
            {title: 'H6', value: 'h6'},
            {title: 'Quote', value: 'blockquote'},
            {title: 'Code Block', value: 'code'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
            {title: 'Checklist', value: 'checklist'},
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
                    validation: (rule) => rule.required(),
                  },
                  {
                    title: 'Open in new tab',
                    name: 'blank',
                    type: 'boolean',
                    initialValue: false,
                  },
                ],
              },
              {
                title: 'Internal Link',
                name: 'internalLink',
                type: 'object',
                fields: [
                  {
                    title: 'Reference',
                    name: 'reference',
                    type: 'reference',
                    to: [
                      {type: 'post'},
                      {type: 'course'},
                    ],
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
              description: 'Describe the image for accessibility and SEO',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption displayed below the image',
            },
            {
              name: 'attribution',
              type: 'string',
              title: 'Attribution',
              description: 'Photo credit or source attribution',
            },
          ]
        },
        {
          type: 'object',
          name: 'callout',
          title: 'Callout Box',
          fields: [
            {
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  {title: 'Info', value: 'info'},
                  {title: 'Warning', value: 'warning'},
                  {title: 'Success', value: 'success'},
                  {title: 'Error', value: 'error'},
                  {title: 'Tip', value: 'tip'},
                ],
              },
              initialValue: 'info',
            },
            {
              name: 'title',
              title: 'Title',
              type: 'string',
            },
            {
              name: 'content',
              title: 'Content',
              type: 'text',
              rows: 3,
            },
          ],
          preview: {
            select: {
              title: 'title',
              type: 'type',
              content: 'content',
            },
            prepare({title, type, content}) {
              const typeEmojis = {
                info: 'ℹ️',
                warning: '⚠️',
                success: '✅',
                error: '❌',
                tip: '💡',
              }
              const emoji = typeEmojis[type as keyof typeof typeEmojis] || 'ℹ️'
              return {
                title: `${emoji} ${title || 'Callout'}`,
                subtitle: content,
              }
            },
          },
        },
        {
          type: 'object',
          name: 'codeBlock',
          title: 'Code Block',
          fields: [
            {
              name: 'language',
              title: 'Language',
              type: 'string',
              options: {
                list: [
                  {title: 'JavaScript', value: 'javascript'},
                  {title: 'TypeScript', value: 'typescript'},
                  {title: 'Python', value: 'python'},
                  {title: 'HTML', value: 'html'},
                  {title: 'CSS', value: 'css'},
                  {title: 'JSON', value: 'json'},
                  {title: 'Bash', value: 'bash'},
                  {title: 'Plain Text', value: 'text'},
                ],
              },
              initialValue: 'text',
            },
            {
              name: 'code',
              title: 'Code',
              type: 'text',
              rows: 10,
            },
            {
              name: 'filename',
              title: 'Filename',
              type: 'string',
              description: 'Optional filename to display',
            },
          ],
          preview: {
            select: {
              language: 'language',
              filename: 'filename',
              code: 'code',
            },
            prepare({language, filename, code}) {
              return {
                title: `💻 ${filename || `${language} code`}`,
                subtitle: code?.substring(0, 100) + (code?.length > 100 ? '...' : ''),
              }
            },
          },
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
      description: 'Main content of the blog post. Supports rich text, images, callouts, and code blocks. HTML can be pasted and will be converted automatically.',
    }),
    // Alias field for content (some imports might use 'content' instead of 'body')
    defineField({
      name: 'content',
      title: 'Content (Alias)',
      type: 'array',
      group: 'content',
      hidden: true, // Hide from UI since we use 'body'
      of: [
        {
          type: 'block',
        }
      ],
      description: 'Alias for body field to support different import formats',
    }),
    // Raw HTML content field for direct HTML imports
    defineField({
      name: 'htmlContent',
      title: 'Raw HTML Content',
      type: 'text',
      group: 'content',
      rows: 20,
      hidden: true, // Hide from UI unless needed
      description: 'Raw HTML content for direct imports (use body field for structured content)',
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
      description: 'Automatically calculated based on content length (can be manually overridden)',
    }),
    defineField({
      name: 'wordCount',
      title: 'Word Count',
      type: 'number',
      group: 'settings',
      description: 'Automatically calculated from content',
    }),
    defineField({
      name: 'ctaPositions',
      title: 'CTA Position Tracking',
      type: 'array',
      group: 'cta',
      of: [{type: 'number'}],
      description: 'Word count intervals where CTAs are positioned (automatically tracked)',
    }),
    defineField({
      name: 'featuredOnHome',
      title: 'Featured on Home Page',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Display this post in the featured section on the home page',
    }),
    // SEO Audit Panel
    defineField({
      name: 'seoAudit',
      title: 'SEO Audit & Analysis',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'placeholder',
          type: 'string',
          title: 'Placeholder',
          hidden: true,
        }
      ],
      components: {
        input: (props) => <SEOAuditPanel document={props.document} />
      },
      description: 'Comprehensive SEO analysis and recommendations',
    }),

    // Enhanced SEO Fields
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60),
      description: 'Optimized title for search engines (max 60 characters)',
      components: {
        input: (props) => (
          <div>
            {props.renderDefault(props)}
            <RealTimeSEOAnalyzer document={props.document} />
          </div>
        ),
      },
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

    // Social Image Generator
    defineField({
      name: 'socialImageGenerator',
      title: 'Generate Social Media Images',
      type: 'object',
      group: 'seo',
      fields: [
        {
          name: 'placeholder',
          type: 'string',
          title: 'Placeholder',
          hidden: true,
        }
      ],
      components: {
        input: (props) => <SocialImageGenerator document={props.document} />
      },
      description: 'Automatically generate optimized social media images',
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
    // Additional fields that might be used in imports
    defineField({
      name: 'estimatedReadingTime',
      title: 'Estimated Reading Time (Legacy)',
      type: 'number',
      group: 'settings',
      hidden: true, // Hide since we use performanceMetrics.estimatedReadingTime
      description: 'Legacy field for reading time',
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

    // Preview Status (read-only display)
    defineField({
      name: 'previewStatus',
      title: 'Preview Status',
      type: 'object',
      group: 'settings',
      readOnly: true,
      fields: [
        {
          name: 'placeholder',
          type: 'string',
          title: 'Placeholder'
        }
      ],
      components: {
        input: PreviewStatusIndicator
      },
      description: 'Preview availability and status information',
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
