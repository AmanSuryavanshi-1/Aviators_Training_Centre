import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {scheduledPublishing} from '@sanity/scheduled-publishing'
import {documentInternationalization} from '@sanity/document-internationalization'
import {media} from 'sanity-plugin-media'
import {schemaTypes} from './schemaTypes'

// Enhanced dashboard components with production features
const ContentAnalyticsDashboard = () => {
  return {
    type: 'component',
    component: () => 'Content Analytics Dashboard - Coming Soon'
  }
}

const SEOHealthDashboard = () => {
  return {
    type: 'component', 
    component: () => 'SEO Health Dashboard - Coming Soon'
  }
}

const MediaLibraryPanel = () => {
  return {
    type: 'component',
    component: () => 'Media Library - Coming Soon'
  }
}

// Production-ready Sanity Studio configuration
export default defineConfig({
  name: 'aviators-training-centre-blog',
  title: 'Aviators Training Centre - Blog Management',
  
  projectId: '3u4fa9kl',
  dataset: 'production',
  
  // Production API version
  apiVersion: '2024-01-01',
  
  // Studio configuration
  studioHost: 'aviators-training-centre-blog',
  
  plugins: [
    // Enhanced media management
    media({
      creditLine: {
        enabled: true,
        excludeSources: ['unsplash'],
      },
    }),
    
    // Scheduled publishing for production workflow
    scheduledPublishing(),
    
    // Document internationalization (future-ready)
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'hi', title: 'Hindi'},
      ],
      schemaTypes: ['post', 'category'],
    }),
    
    // Enhanced structure tool with production features
    structureTool({
      structure: (S) =>
        S.list()
          .title('📚 Content Management Dashboard')
          .items([
            // Quick Actions Section
            S.listItem()
              .title('🚀 Quick Actions')
              .icon(() => '⚡')
              .child(
                S.list()
                  .title('Quick Actions')
                  .items([
                    S.listItem()
                      .title('✍️ Create New Blog Post')
                      .child(
                        S.document()
                          .schemaType('post')
                          .documentId('new-post')
                      ),
                    S.listItem()
                      .title('📊 Content Analytics')
                      .child(
                        S.documentList()
                          .title('Content Analytics Dashboard')
                          .filter('_type == "post"')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('🔍 SEO Health Check')
                      .child(
                        S.documentList()
                          .title('SEO Health Check')
                          .filter('_type == "post" && (!defined(seoTitle) || !defined(seoDescription))')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Blog Posts Section with Enhanced Organization
            S.listItem()
              .title('📝 Blog Posts')
              .icon(() => '📝')
              .child(
                S.list()
                  .title('Blog Post Management')
                  .items([
                    S.listItem()
                      .title('📋 All Posts')
                      .child(
                        S.documentTypeList('post')
                          .title('All Blog Posts')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                          .filter('_type == "post"')
                      ),
                    S.listItem()
                      .title('✏️ Draft Posts')
                      .child(
                        S.documentList()
                          .title('Draft Posts')
                          .filter('_type == "post" && (!defined(publishedAt) || publishedAt > now())')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('🌟 Featured Posts')
                      .child(
                        S.documentList()
                          .title('Featured Posts')
                          .filter('_type == "post" && featured == true')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('📅 Recently Published')
                      .child(
                        S.documentList()
                          .title('Recently Published')
                          .filter('_type == "post" && defined(publishedAt) && publishedAt <= now()')
                          .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('🏷️ Posts by Category')
                      .child(
                        S.documentTypeList('category')
                          .title('Select Category')
                          .child((categoryId) =>
                            S.documentList()
                              .title('Posts in Category')
                              .filter('_type == "post" && category._ref == $categoryId')
                              .params({ categoryId })
                              .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                          )
                      ),
                    S.listItem()
                      .title('👤 Posts by Author')
                      .child(
                        S.documentTypeList('author')
                          .title('Select Author')
                          .child((authorId) =>
                            S.documentList()
                              .title('Posts by Author')
                              .filter('_type == "post" && author._ref == $authorId')
                              .params({ authorId })
                              .defaultOrdering([{field: 'publishedAt', direction: 'desc'}])
                          )
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Workflow Management
            S.listItem()
              .title('⚡ Workflow Management')
              .icon(() => '⚡')
              .child(
                S.list()
                  .title('Content Workflow')
                  .items([
                    S.listItem()
                      .title('📋 All Workflows')
                      .child(
                        S.documentTypeList('workflow')
                          .title('All Content Workflows')
                          .defaultOrdering([{field: '_updatedAt', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('⏳ Pending Review')
                      .child(
                        S.documentList()
                          .title('Content Pending Review')
                          .filter('_type == "workflow" && currentStatus == "review"')
                          .defaultOrdering([{field: 'dueDate', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('🔴 High Priority')
                      .child(
                        S.documentList()
                          .title('High Priority Items')
                          .filter('_type == "workflow" && priority == "high"')
                          .defaultOrdering([{field: 'dueDate', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('📅 Due Soon')
                      .child(
                        S.documentList()
                          .title('Due in Next 7 Days')
                          .filter('_type == "workflow" && dueDate >= now() && dueDate <= dateTime(now()) + 7*24*60*60')
                          .defaultOrdering([{field: 'dueDate', direction: 'asc'}])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Content Organization
            S.listItem()
              .title('🏷️ Categories')
              .icon(() => '🏷️')
              .child(
                S.documentTypeList('category')
                  .title('Blog Categories')
                  .defaultOrdering([{field: 'title', direction: 'asc'}])
              ),
            S.listItem()
              .title('👥 Authors')
              .icon(() => '👤')
              .child(
                S.list()
                  .title('Author Management')
                  .items([
                    S.listItem()
                      .title('👥 All Authors')
                      .child(
                        S.documentTypeList('author')
                          .title('All Authors')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('👑 Admin Authors')
                      .child(
                        S.documentList()
                          .title('Admin Level Authors')
                          .filter('_type == "author" && authorLevel == "admin"')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('✅ Active Authors')
                      .child(
                        S.documentList()
                          .title('Active Authors')
                          .filter('_type == "author" && status == "active"')
                          .defaultOrdering([{field: 'lastActive', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('🆕 New Authors')
                      .child(
                        S.documentList()
                          .title('Recently Joined Authors')
                          .filter('_type == "author" && joinedDate >= dateTime(now()) - 30*24*60*60')
                          .defaultOrdering([{field: 'joinedDate', direction: 'desc'}])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Course Management with Enhanced Structure
            S.listItem()
              .title('🎓 Course Management')
              .icon(() => '🎓')
              .child(
                S.list()
                  .title('Course Management')
                  .items([
                    S.listItem()
                      .title('📚 All Courses')
                      .child(
                        S.documentTypeList('course')
                          .title('All Courses')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('✅ Active Courses')
                      .child(
                        S.documentList()
                          .title('Active Courses')
                          .filter('_type == "course" && active == true')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('❌ Inactive Courses')
                      .child(
                        S.documentList()
                          .title('Inactive Courses')
                          .filter('_type == "course" && active != true')
                          .defaultOrdering([{field: 'name', direction: 'asc'}])
                      ),
                    S.listItem()
                      .title('📂 Courses by Category')
                      .child(
                        S.list()
                          .title('Course Categories')
                          .items([
                            S.listItem()
                              .title('⚙️ Technical General')
                              .child(
                                S.documentList()
                                  .title('Technical General Courses')
                                  .filter('_type == "course" && category == "technical-general"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('🔧 Technical Specific')
                              .child(
                                S.documentList()
                                  .title('Technical Specific Courses')
                                  .filter('_type == "course" && category == "technical-specific"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('🛩️ CPL Ground School')
                              .child(
                                S.documentList()
                                  .title('CPL Ground School Courses')
                                  .filter('_type == "course" && category == "cpl-ground-school"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('✈️ ATPL Ground School')
                              .child(
                                S.documentList()
                                  .title('ATPL Ground School Courses')
                                  .filter('_type == "course" && category == "atpl-ground-school"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('🎯 Type Rating')
                              .child(
                                S.documentList()
                                  .title('Type Rating Courses')
                                  .filter('_type == "course" && category == "type-rating"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                            S.listItem()
                              .title('🌐 General Aviation')
                              .child(
                                S.documentList()
                                  .title('General Aviation Courses')
                                  .filter('_type == "course" && category == "general-aviation"')
                                  .defaultOrdering([{field: 'name', direction: 'asc'}])
                              ),
                          ])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // CTA Management Section
            S.listItem()
              .title('🎯 CTA Management')
              .icon(() => '🎯')
              .child(
                S.list()
                  .title('CTA Management')
                  .items([
                    S.listItem()
                      .title('📋 All CTA Templates')
                      .child(
                        S.documentTypeList('ctaTemplate')
                          .title('All CTA Templates')
                          .defaultOrdering([{field: 'priority', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('✅ Active CTAs')
                      .child(
                        S.documentList()
                          .title('Active CTA Templates')
                          .filter('_type == "ctaTemplate" && active == true')
                          .defaultOrdering([{field: 'priority', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('📊 CTA Performance')
                      .child(
                        S.documentTypeList('ctaPerformance')
                          .title('CTA Performance Analytics')
                          .defaultOrdering([{field: 'lastUpdated', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('🏆 Top Performing CTAs')
                      .child(
                        S.documentList()
                          .title('Top Performing CTAs')
                          .filter('_type == "ctaPerformance" && metrics.ctr > 3')
                          .defaultOrdering([{field: 'metrics.ctr', direction: 'desc'}])
                      ),
                    S.listItem()
                      .title('📂 CTAs by Category')
                      .child(
                        S.list()
                          .title('CTA Categories')
                          .items([
                            S.listItem()
                              .title('🎓 Course Enrollment')
                              .child(
                                S.documentList()
                                  .title('Course Enrollment CTAs')
                                  .filter('_type == "ctaTemplate" && category == "course-enrollment"')
                                  .defaultOrdering([{field: 'priority', direction: 'desc'}])
                              ),
                            S.listItem()
                              .title('💬 Free Consultation')
                              .child(
                                S.documentList()
                                  .title('Consultation CTAs')
                                  .filter('_type == "ctaTemplate" && category == "consultation"')
                                  .defaultOrdering([{field: 'priority', direction: 'desc'}])
                              ),
                            S.listItem()
                              .title('🎬 Demo Booking')
                              .child(
                                S.documentList()
                                  .title('Demo Booking CTAs')
                                  .filter('_type == "ctaTemplate" && category == "demo-booking"')
                                  .defaultOrdering([{field: 'priority', direction: 'desc'}])
                              ),
                            S.listItem()
                              .title('📞 Contact Form')
                              .child(
                                S.documentList()
                                  .title('Contact Form CTAs')
                                  .filter('_type == "ctaTemplate" && category == "contact-form"')
                                  .defaultOrdering([{field: 'priority', direction: 'desc'}])
                              ),
                          ])
                      ),
                  ])
              ),
            
            S.divider(),
            
            // Media Management
            S.listItem()
              .title('🖼️ Media Library')
              .icon(() => '🖼️')
              .child(
                S.documentList()
                  .title('Media Guidelines')
                  .filter('_type == "sanity.imageAsset"')
                  .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
              ),
          ])
    }),
    

    
    // Vision tool for development (can be removed in production)
    visionTool({
      defaultApiVersion: '2024-01-01',
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  // Enhanced document actions configuration for production workflow
  document: {
    actions: (prev, context) => {
      // Enhanced actions for blog posts
      if (context.schemaType === 'post') {
        return [
          ...prev,
          // Enhanced preview action with draft support
          {
            name: 'preview',
            title: 'Preview Post',
            icon: () => '👁️',
            action: (props) => {
              const slug = props.draft?.slug?.current || props.published?.slug?.current
              if (slug) {
                const previewUrl = `${process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'}/blog/${slug}?preview=true`
                window.open(previewUrl, '_blank', 'noopener,noreferrer')
              } else {
                alert('Please add a slug to preview this post')
              }
            },
          },
          // SEO validation action
          {
            name: 'validateSEO',
            title: 'Validate SEO',
            icon: () => '🔍',
            action: (props) => {
              const doc = props.draft || props.published
              const issues = []
              
              if (!doc?.seoTitle) issues.push('Missing SEO title')
              if (!doc?.seoDescription) issues.push('Missing SEO description')
              if (!doc?.focusKeyword) issues.push('Missing focus keyword')
              if (!doc?.image) issues.push('Missing featured image')
              if (doc?.seoTitle && doc.seoTitle.length > 60) issues.push('SEO title too long (>60 chars)')
              if (doc?.seoDescription && doc.seoDescription.length > 160) issues.push('SEO description too long (>160 chars)')
              
              if (issues.length === 0) {
                alert('✅ SEO validation passed! This post is optimized for search engines.')
              } else {
                alert(`❌ SEO Issues Found:\n\n${issues.join('\n')}`)
              }
            },
          },
          // Content readiness check
          {
            name: 'checkReadiness',
            title: 'Check Readiness',
            icon: () => '✅',
            action: (props) => {
              const doc = props.draft || props.published
              const checks = {
                'Title': !!doc?.title,
                'Slug': !!doc?.slug?.current,
                'Excerpt': !!doc?.excerpt,
                'Content': !!doc?.body && doc.body.length > 0,
                'Featured Image': !!doc?.image,
                'Category': !!doc?.category,
                'Author': !!doc?.author,
                'SEO Title': !!doc?.seoTitle,
                'SEO Description': !!doc?.seoDescription,
                'Focus Keyword': !!doc?.focusKeyword,
              }
              
              const passed = Object.values(checks).filter(Boolean).length
              const total = Object.keys(checks).length
              const percentage = Math.round((passed / total) * 100)
              
              const failedChecks = Object.entries(checks)
                .filter(([_, passed]) => !passed)
                .map(([check, _]) => check)
              
              let message = `📊 Content Readiness: ${percentage}% (${passed}/${total})\n\n`
              
              if (failedChecks.length > 0) {
                message += `Missing:\n${failedChecks.map(check => `• ${check}`).join('\n')}`
              } else {
                message += '🎉 All checks passed! This post is ready for publication.'
              }
              
              alert(message)
            },
          },
        ]
      }
      
      // Enhanced actions for courses
      if (context.schemaType === 'course') {
        return [
          ...prev,
          // Course preview action
          {
            name: 'previewCourse',
            title: 'Preview Course',
            icon: () => '🎓',
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
    
    // Enhanced production badges
    badges: (prev, context) => {
      if (context.schemaType === 'post') {
        return [
          ...prev,
          // Workflow status badge
          {
            name: 'workflowStatus',
            title: 'Workflow Status',
            color: 'primary',
            component: (props) => {
              const status = props.draft?.workflowStatus || props.published?.workflowStatus || 'draft'
              const statusConfig = {
                draft: { emoji: '✏️', color: 'gray', label: 'Draft' },
                review: { emoji: '👀', color: 'yellow', label: 'Under Review' },
                approved: { emoji: '✅', color: 'green', label: 'Approved' },
                published: { emoji: '🌐', color: 'blue', label: 'Published' },
                archived: { emoji: '📦', color: 'red', label: 'Archived' },
              }
              
              const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
              
              return {
                title: `${config.emoji} ${config.label}`,
                color: config.color,
              }
            },
          },
          // SEO health badge
          {
            name: 'seoHealth',
            title: 'SEO Health',
            component: (props) => {
              const doc = props.draft || props.published
              const seoScore = doc?.performanceMetrics?.seoScore || 0
              
              let color = 'red'
              let emoji = '❌'
              
              if (seoScore >= 80) {
                color = 'green'
                emoji = '✅'
              } else if (seoScore >= 60) {
                color = 'yellow'
                emoji = '⚠️'
              }
              
              return {
                title: `${emoji} SEO: ${seoScore}%`,
                color,
              }
            },
          },
        ]
      }
      return prev
    },
  },

  // Production environment configuration
  env: {
    development: {
      plugins: [visionTool()],
    },
    production: {
      plugins: [],
    },
  },

  // Studio customization
  studio: {
    components: {
      logo: () => '✈️ ATC Blog',
    },
  },

  // CORS and API configuration for production
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
