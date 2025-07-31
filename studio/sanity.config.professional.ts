import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {documentInternationalization} from '@sanity/document-internationalization'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'
import {seoHooksPlugin} from './plugins/seoHooks'
import {seoAuditPlugin} from './plugins/seoAuditPlugin'

// Professional Sanity Studio configuration
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'Aviators Training Centre - Content Management',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  studioHost: 'aviators-training-centre-blog',
  
  plugins: [
    // Media management
    media({
      creditLine: {
        enabled: true,
        excludeSources: ['unsplash'],
      },
    }),
    
    // Document internationalization
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'hi', title: 'Hindi'},
      ],
      schemaTypes: ['post', 'category'],
    }),
    
    // Structure tool with clean navigation
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content Management')
          .items([
            // Blog Posts
            S.listItem()
              .title('Blog Posts')
              .child(
                S.list()
                  .title('Blog Posts')
                  .items([
                    S.listItem()
                      .title('All Posts')
                      .child(
                        S.documentTypeList('post')
                          .title('All Blog Posts')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('Draft Posts')
                      .child(
                        S.documentList()
                          .title('Draft Posts')
                          .filter('_type == "post" && (!defined(publishedAt) || publishedAt > now())')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('Published Posts')
                      .child(
                        S.documentList()
                          .title('Published Posts')
                          .filter('_type == "post" && defined(publishedAt) && publishedAt <= now()')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('Featured Posts')
                      .child(
                        S.documentList()
                          .title('Featured Posts')
                          .filter('_type == "post" && featured == true')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Categories
            S.listItem()
              .title('Categories')
              .child(
                S.documentTypeList('category')
                  .title('Blog Categories')
                  .defaultOrdering([{field: 'title', direction: 'asc'}])
              ),
            
            // Authors
            S.listItem()
              .title('Authors')
              .child(
                S.documentTypeList('author')
                  .title('Authors')
                  .defaultOrdering([{field: 'name', direction: 'asc'}])
              ),
            
            S.divider(),
            
            // Courses
            S.listItem()
              .title('Courses')
              .child(
                S.list()
                  .title('Course Management')
                  .items([
                    S.listItem()
                      .title('All Courses')
                      .child(
                        S.documentTypeList('course')
                          .title('All Courses')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('Active Courses')
                      .child(
                        S.documentList()
                          .title('Active Courses')
                          .filter('_type == "course" && active == true')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('Course Categories')
                      .child(
                        S.list()
                          .title('Course Categories')
                          .items([
                            S.listItem()
                              .title('Technical General')
                              .child(
                                S.documentList()
                                  .title('Technical General Courses')
                                  .filter('_type == "course" && category == "technical-general"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('Technical Specific')
                              .child(
                                S.documentList()
                                  .title('Technical Specific Courses')
                                  .filter('_type == "course" && category == "technical-specific"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('CPL Ground School')
                              .child(
                                S.documentList()
                                  .title('CPL Ground School Courses')
                                  .filter('_type == "course" && category == "cpl-ground-school"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('ATPL Ground School')
                              .child(
                                S.documentList()
                                  .title('ATPL Ground School Courses')
                                  .filter('_type == "course" && category == "atpl-ground-school"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('Type Rating')
                              .child(
                                S.documentList()
                                  .title('Type Rating Courses')
                                  .filter('_type == "course" && category == "type-rating"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                          ])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Media
            S.listItem()
              .title('Media Library')
              .child(
                S.documentList()
                  .title('Media Library')
                  .filter('_type == "sanity.imageAsset"')
                  .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
              ),
          ])
    }),
    
    // Vision tool for development
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),

    // SEO plugins
    seoHooksPlugin(),
    seoAuditPlugin(),
  ],

  schema: {
    types: schemaTypes,
  },

  // Document actions
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'course') {
        return [
          ...prev,
          {
            name: 'previewCourse',
            title: 'Preview Course',
            action: (props) => {
              const slug = props.draft?.slug?.current || props.published?.slug?.current
              if (slug) {
                const previewUrl = `${process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'}/courses/${slug}?preview=true`
                window.open(previewUrl, '_blank', 'noopener,noreferrer')
              } else {
                alert('Please add a slug to preview this course')
              }
            },
          },
        ]
      }
      return prev
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
      'https://aviatorstrainingcentre.com',
      'https://www.aviatorstrainingcentre.com',
      'https://aviators-training-centre-blog.sanity.studio',
      /^https:\/\/.*\.vercel\.app$/,
      /^https:\/\/.*\.netlify\.app$/,
    ],
  },
})