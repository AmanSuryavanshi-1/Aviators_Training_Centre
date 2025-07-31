import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Ultra-minimal schema types - only the essentials
const minimalSchemaTypes = [
  {
    name: 'post',
    title: 'Blog Post',
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
        name: 'content',
        title: 'Content',
        type: 'array',
        of: [{type: 'block'}],
      },
      {
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
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
      },
      {
        name: 'bio',
        title: 'Bio',
        type: 'text',
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
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
      },
    ],
  },
]

// Ultra-minimal Sanity Studio configuration
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'ATC Content Management',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  
  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: minimalSchemaTypes,
  },

  // Simple document actions - just keep the defaults
  document: {
    actions: (prev, context) => {
      // Just return the default actions - this should include delete
      return prev
    },
  },

  studio: {
    components: {
      logo: () => 'ATC Studio',
    },
  },
})