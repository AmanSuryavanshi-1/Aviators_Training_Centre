import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

// Minimal schema types to avoid React hook issues
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
        name: 'excerpt',
        title: 'Excerpt',
        type: 'text',
        rows: 3,
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
      {
        name: 'featured',
        title: 'Featured Post',
        type: 'boolean',
        initialValue: false,
      },
      {
        name: 'author',
        title: 'Author',
        type: 'reference',
        to: [{type: 'author'}],
      },
      {
        name: 'category',
        title: 'Category',
        type: 'reference',
        to: [{type: 'category'}],
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
        title: 'Biography',
        type: 'text',
        rows: 4,
      },
      {
        name: 'image',
        title: 'Profile Image',
        type: 'image',
        options: {hotspot: true},
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

// Minimal Sanity Studio configuration without problematic plugins
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

  studio: {
    components: {
      logo: () => 'ATC Studio',
    },
  },
})