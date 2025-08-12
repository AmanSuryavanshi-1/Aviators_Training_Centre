import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Working schema types without complex components
const workingSchemaTypes = [
  {
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
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        group: 'content',
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        group: 'content',
        options: {source: 'title'},
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'excerpt',
        title: 'Excerpt',
        type: 'text',
        group: 'content',
        rows: 3,
        validation: (rule: any) => rule.max(200),
      },
      {
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
                      validation: (rule: any) => rule.required(),
                    },
                    {
                      title: 'Link Text (for SEO)',
                      name: 'title',
                      type: 'string',
                      description: 'Descriptive text for better SEO',
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
                title: 'Alt Text (Required for SEO)',
                description: 'Describe the image for screen readers and SEO',
                validation: (rule: any) => rule.required(),
              },
              {
                name: 'caption',
                type: 'string',
                title: 'Caption',
                description: 'Optional caption displayed below image',
              },
            ],
          },
        ],
      },
      {
        name: 'author',
        title: 'Author',
        type: 'reference',
        group: 'content',
        to: [{type: 'author'}],
      },
      {
        name: 'category',
        title: 'Category',
        type: 'reference',
        group: 'content',
        to: [{type: 'category'}],
      },
      {
        name: 'tags',
        title: 'Tags',
        type: 'array',
        group: 'content',
        of: [{type: 'string'}],
        options: {
          layout: 'tags',
        },
      },
      {
        name: 'featured',
        title: 'Featured Post',
        type: 'boolean',
        group: 'settings',
        initialValue: false,
      },
      {
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
        group: 'settings',
      },
      // SEO Fields - Separate Tab
      {
        name: 'seoTitle',
        title: 'SEO Title',
        type: 'string',
        group: 'seo',
        description: 'Title for search engines (50-60 characters)',
        validation: (rule: any) => rule.max(60),
      },
      {
        name: 'seoDescription',
        title: 'SEO Description',
        type: 'text',
        group: 'seo',
        rows: 3,
        description: 'Description for search engines (150-160 characters)',
        validation: (rule: any) => rule.max(160),
      },
      {
        name: 'focusKeyword',
        title: 'Focus Keyword',
        type: 'string',
        group: 'seo',
        description: 'Main keyword you want to rank for',
      },
      {
        name: 'seoImage',
        title: 'SEO Image',
        type: 'image',
        group: 'seo',
        description: 'Image for social media sharing (1200x630px recommended)',
        options: {hotspot: true},
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Alt Text',
          },
        ],
      },
    ],
  },
  {
    name: 'author',
    title: 'Author',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Name',
        type: 'string',
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {source: 'name'},
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'image',
        title: 'Profile Image',
        type: 'image',
        options: {hotspot: true},
        fields: [
          {
            name: 'alt',
            type: 'string',
            title: 'Alt Text',
          },
        ],
      },
      {
        name: 'bio',
        title: 'Biography',
        type: 'text',
        rows: 4,
      },
      {
        name: 'email',
        title: 'Email',
        type: 'string',
        validation: (rule: any) => rule.email(),
      },
    ],
  },
  {
    name: 'category',
    title: 'Category',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {source: 'title'},
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
      },
      {
        name: 'color',
        title: 'Color',
        type: 'string',
        options: {
          list: [
            {title: 'Blue', value: '#3B82F6'},
            {title: 'Green', value: '#10B981'},
            {title: 'Red', value: '#EF4444'},
            {title: 'Yellow', value: '#F59E0B'},
            {title: 'Purple', value: '#8B5CF6'},
          ],
        },
      },
    ],
  },
]

// Working Sanity Studio configuration
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'ATC Content Management - Working',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  
  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: workingSchemaTypes,
  },

  // Document actions with explicit delete functionality
  document: {
    actions: (prev, context) => {
      // Ensure delete action is always present and visible
      return prev.map(action => {
        if (action.name === 'delete') {
          return {
            ...action,
            title: 'Delete',
            color: 'danger',
            icon: () => '🗑️',
          }
        }
        return action
      })
    },
  },

  studio: {
    components: {
      logo: () => 'ATC Studio - Working Version',
    },
  },
})