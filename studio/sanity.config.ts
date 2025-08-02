/**
 * Production-Ready Sanity Studio Configuration
 * Simplified configuration with default authentication
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import React from 'react';

// Environment-aware configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'Aviators Training Centre - Content Management',
  
  projectId,
  dataset,
  apiVersion,
  
  // Set proper basePath for studio routing
  basePath: '/studio',
  
  plugins: [
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
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      logo: () => React.createElement('div', {
        style: { 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '16px', 
          fontWeight: 'bold',
          color: '#1e40af'
        }
      }, '✈️ ATC Studio'),
    },
  },

  // Use default Sanity authentication (includes Google OAuth)
  // No custom auth configuration needed - this will show all available providers
});