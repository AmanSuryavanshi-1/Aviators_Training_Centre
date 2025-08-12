/**
 * Production-Ready Sanity Studio Configuration
 * Professional configuration with embedded admin navigation
 */

import React from 'react';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import ATCAdminNavigator from './components/ATCAdminNavigator';
import { clearFieldPlugin } from './plugins/clearFieldPlugin';
import { keyboardShortcutsPlugin } from './plugins/keyboardShortcutsPlugin';

// Import aviation theme and enhanced styling layers (ordered by specificity)
import './styles/minimal-aviation-theme.css';

// TypeScript interfaces
interface NavbarProps {
  renderDefault: (props: any) => React.ReactNode;
}

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
  
  // Clean Aviation-themed Studio Configuration
  studio: {
    components: {
      // Remove Sanity logo/branding completely; keep default navbar functionality
      logo: () => null,
      navbar: (props: NavbarProps) => {
        return React.createElement('div', {
          style: {
            position: 'relative',
            width: '100%'
          }
        }, [
          // Default Sanity Navbar (unaltered)
          React.createElement(React.Fragment, { key: 'sanity-default' }, props.renderDefault(props)),

          // Website button positioned without affecting layout
          React.createElement('a', {
            key: 'back-link',
            href: '/',
            style: {
              position: 'absolute',
              top: '50%',
              right: 12,
              transform: 'translateY(-50%)',
              textDecoration: 'none',
              color: '#ffffff',
              backgroundColor: '#075E68',
              border: '1px solid #0C6E72',
              borderRadius: 4,
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1,
              fontFamily: 'system-ui, sans-serif'
            },
            title: 'Return to Website',
            'aria-label': 'Return to Website'
          }, 'Website')
        ]);
      }
    }
  },
  
  plugins: [
    clearFieldPlugin(),
    keyboardShortcutsPlugin({}),
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Add ATC Admin navigation at the top
            S.listItem()
              .id('atc-admin-dashboard')
              .title('🚀 ATC Admin Dashboard')
              .child(
                S.component()
                  .id('atc-admin-navigator')
                  .title('ATC Admin Dashboard')
                  .component(ATCAdminNavigator)
              ),
            S.divider(),
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

  // Use default Sanity authentication
});