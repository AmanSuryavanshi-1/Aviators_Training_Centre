import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'

// Minimal, working Sanity Studio configuration
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'ATC Content Management',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  studioHost: 'aviators-training-centre-blog',
  
  plugins: [
    // Media management
    media(),
    
    // Structure tool with simple navigation
    structureTool(),
    
    // Vision tool for development
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  // Document actions with delete functionality
  document: {
    actions: (prev, context) => {
      // Ensure delete action is always available
      const deleteAction = prev.find(action => action.name === 'delete')
      const otherActions = prev.filter(action => action.name !== 'delete')
      
      // Custom delete actions with confirmation
      const customActions = []
      
      if (context.schemaType === 'post') {
        customActions.push({
          name: 'deletePost',
          title: 'Delete Post',
          color: 'danger',
          action: (props) => {
            const postTitle = props.draft?.title || props.published?.title || 'this post'
            if (confirm(`Delete "${postTitle}"? This cannot be undone.`)) {
              if (deleteAction && typeof deleteAction.action === 'function') {
                deleteAction.action(props)
              }
            }
          },
        })
      }
      
      if (context.schemaType === 'author') {
        customActions.push({
          name: 'deleteAuthor',
          title: 'Delete Author',
          color: 'danger',
          action: (props) => {
            const authorName = props.draft?.name || props.published?.name || 'this author'
            if (confirm(`Delete "${authorName}"? This will affect their blog posts. Cannot be undone.`)) {
              if (deleteAction && typeof deleteAction.action === 'function') {
                deleteAction.action(props)
              }
            }
          },
        })
      }
      
      if (context.schemaType === 'category') {
        customActions.push({
          name: 'deleteCategory',
          title: 'Delete Category',
          color: 'danger',
          action: (props) => {
            const categoryTitle = props.draft?.title || props.published?.title || 'this category'
            if (confirm(`Delete "${categoryTitle}"? This may affect blog posts. Cannot be undone.`)) {
              if (deleteAction && typeof deleteAction.action === 'function') {
                deleteAction.action(props)
              }
            }
          },
        })
      }
      
      // Return all actions
      return [
        ...(deleteAction ? [deleteAction] : []),
        ...otherActions,
        ...customActions
      ]
    },
  },

  // Studio customization
  studio: {
    components: {
      logo: () => 'ATC Content Management',
    },
  },

  // CORS configuration
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3333',
      'https://www.aviatorstrainingcentre.in',
      'https://www.aviatorstrainingcentre.com',
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
    ],
  },
})