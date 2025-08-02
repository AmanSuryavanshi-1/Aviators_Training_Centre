/**
 * Production Sanity Studio Configuration
 * Optimized for production deployment with proper environment handling
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// Environment-aware configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

// Production-specific plugins
const plugins = [
  structureTool({
    structure: (S) =>
      S.list()
        .title('Content')
        .items([
          S.listItem()
            .title('Blog Posts')
            .child(
              S.documentTypeList('post')
                .title('Blog Posts')
                .filter('_type == "post"')
                .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
            ),
          S.listItem()
            .title('Categories')
            .child(
              S.documentTypeList('category')
                .title('Categories')
                .filter('_type == "category"')
            ),
          S.listItem()
            .title('Tags')
            .child(
              S.documentTypeList('tag')
                .title('Tags')
                .filter('_type == "tag"')
            ),
          S.listItem()
            .title('Authors')
            .child(
              S.documentTypeList('author')
                .title('Authors')
                .filter('_type == "author"')
            ),
          S.divider(),
          ...S.documentTypeListItems().filter(
            (listItem) => !['post', 'category', 'tag', 'author'].includes(listItem.getId()!)
          ),
        ]),
  }),
];

// Add Vision tool only in development or for administrators
if (process.env.NODE_ENV === 'development' || process.env.SANITY_STUDIO_ENABLE_VISION === 'true') {
  plugins.push(visionTool());
}

export default defineConfig({
  name: 'aviators-training-centre-production',
  title: 'Aviators Training Centre - Content Management',
  
  projectId,
  dataset,
  apiVersion,
  
  plugins,

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      logo: () => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#1e40af'
        }}>
          ✈️ ATC Studio
        </div>
      ),
    },
  },

  // Production-specific settings
  document: {
    // Customize document actions for production
    actions: (prev, context) => {
      // Remove duplicate action for published documents in production
      if (context.schemaType === 'post' && process.env.NODE_ENV === 'production') {
        return prev.filter(action => action.action !== 'duplicate');
      }
      return prev;
    },
  },

  // Form configuration
  form: {
    // Customize form rendering for better UX
    image: {
      assetSources: (previousAssetSources) => {
        // Filter asset sources for production if needed
        return previousAssetSources;
      },
    },
  },

  // Tools configuration
  tools: (prev) => {
    // Customize available tools based on environment
    if (process.env.NODE_ENV === 'production') {
      // Remove or modify tools for production
      return prev;
    }
    return prev;
  },

  // CORS configuration for production
  cors: {
    credentials: true,
    origin: [
      'http://localhost:3000',
      'https://www.aviatorstrainingcentre.in',
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean) as string[],
  },

  // Authentication configuration
  auth: {
    mode: 'replace',
    redirectOnSingle: false,
  },
});