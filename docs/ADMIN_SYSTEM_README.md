# Sanity CMS Admin System

A comprehensive blog management system for the Aviators Training Centre website powered by Sanity CMS. This headless CMS provides a professional content management interface for writers and content managers to create, edit, and manage blog posts with advanced features including scheduled publishing, media management, and internationalization support.

## Features

### 📊 Enhanced Content Management
- **Sanity Studio Interface**: Professional, user-friendly content management dashboard with enhanced plugins
- **Custom Admin Dashboard**: Comprehensive Next.js-based admin interface with modern UI
- **Organized Field Groups**: Content, SEO, CTA, and Settings tabs for better organization
- **Real-time Collaboration**: Multiple users can work simultaneously
- **Content Preview**: Live preview of blog posts before publishing with draft support
- **Version History**: Track changes and revert to previous versions
- **Responsive Admin Interface**: Mobile-first admin panel with collapsible navigation
- **Scheduled Publishing**: Schedule posts for future publication with automated workflow
- **Enhanced Media Management**: Professional media library with credit line support and advanced organization
- **Document Internationalization**: Multi-language support for global content management (English/Hindi ready)

### ✍️ Advanced Blog Management
- **Rich Text Editor**: PortableText editor with advanced formatting options and custom rendering
- **Advanced Content Rendering**: Custom PortableText renderer supporting:
  - Optimized images with WebP format and responsive sizing
  - Code blocks with syntax highlighting and proper overflow handling
  - Interactive callouts and alerts (info, warning, success, error)
  - Enhanced typography with custom heading hierarchy
  - Smart link processing with external link detection
  - Inline elements (code, highlights, emphasis) with design system integration
- **Enhanced Blog Listing Interface**: Interactive client-side blog listing with advanced user experience
  - Real-time search with URL state management and query persistence across page refreshes
  - Category-based filtering with visual indicators, active states, and color coding
  - Grid and list view modes with smooth animated transitions using Framer Motion
  - Smart pagination with intelligent page numbering and responsive controls
  - Comprehensive loading states with skeleton loaders and inline indicators
  - Advanced error handling with retry mechanisms and fallback UI components
  - Newsletter subscription integration with email validation and user feedback
  - Mobile-first responsive design with touch-friendly controls and gestures
  - Accessibility compliance with ARIA labels, keyboard navigation, and screen reader support
- **Client-Side SEO Management**: Dynamic SEO component with comprehensive meta tag injection
- **Educational Content Schema**: Specialized structured data for aviation training content
- **Organization Authority**: Structured data establishing educational credibility
- **Intelligent CTA System**: Strategic call-to-action placement and course routing
- **Advanced CTA Variants**: 6 distinct CTA layouts with built-in analytics:
  - **Card Variant**: Professional layout with course highlights and trust indicators
  - **Banner Variant**: Full-width impact design with statistics and social proof
  - **Inline Variant**: Contextual integration within blog content
  - **Minimal Variant**: Clean, unobtrusive design for content-focused pages
  - **Gradient Variant**: Modern design with pricing and duration information
  - **Testimonial Variant**: Social proof focused with student success stories
- **Category Management**: Organize posts with intelligent routing capabilities
- **Author Profiles**: Comprehensive author management with credentials
- **Image Management**: Advanced image handling with CDN optimization
- **Featured Posts**: Mark posts for homepage carousel display

### 🔒 Enterprise Security & Reliability
- **Sanity Authentication**: Secure user management and role-based access
- **API Token Management**: Secure API access with environment variables
- **Enhanced Client**: Retry logic, circuit breakers, and error recovery mechanisms
- **Input Validation**: Built-in validation for all content fields
- **Advanced Error Handling System**: Multi-layered error handling architecture
  - React Error Boundaries with custom fallback UI components
  - Circuit breaker pattern preventing cascading failures
  - Intelligent retry logic with exponential backoff
  - Comprehensive error tracking and analytics integration
  - Graceful degradation with fallback content providers
  - Health monitoring and automatic recovery mechanisms

### 🔄 Advanced Approval Workflow System
- **Multi-Stage Approval Process**: Configurable approval stages with parallel and sequential processing
- **Rule-Based Routing**: Intelligent approval routing based on content type, author level, and content characteristics
- **Auto-Approval Conditions**: Automated approval for trusted authors and content meeting specific criteria
- **Escalation Management**: Time-based escalation with configurable timeout rules
- **Approval Analytics**: Comprehensive workflow statistics and bottleneck identification
- **Flexible Approver Selection**: Support for specific authors, author levels, and exclusion rules

### 📊 Advanced Analytics & Performance Monitoring
- **CTA Analytics Dashboard**: Comprehensive dashboard for monitoring CTA performance and conversion metrics
- **Real-Time Performance Tracking**: Monitor impressions, clicks, conversions, and revenue attribution
- **Conversion Funnel Analysis**: Track the complete blog-to-course enrollment journey
- **Attribution Model Comparison**: Compare different attribution models (first-touch, last-touch, linear, time-decay, position-based) with variance analysis to understand conversion paths 
- **Enhanced Trending Topic Identification**: Multi-layered analysis system featuring:
  - **Current Trends Analysis**: Real-time performance data analysis with category and keyword tracking
  - **Seasonal Trends Detection**: Automatic identification of seasonal opportunities (admission periods, exam seasons)
  - **Emerging Trends Monitoring**: Detection of new keywords and topics gaining traction in recent content
  - **Advanced Opportunity Scoring**: Multi-factor algorithm considering search volume, competition, relevance, and content gaps
- **A/B Testing Integration**: Built-in A/B testing framework with statistical significance calculation
- **Top Posts Performance**: Identify highest-converting blog posts and optimize content strategy
- **Interactive Data Visualization**: Professional charts and graphs using Recharts library
- **Date Range Filtering**: Flexible time period analysis (7-day, 30-day, 90-day windows)
- **Model Variance Analysis**: Analyze revenue and conversion ranges across different attribution models

### 🔄 Content Migration & Import Tools
- **Automated Migration**: Seamless migration from Markdown to Sanity CMS
- **Content Preservation**: Maintains all metadata, formatting, and structure
- **Asset Management**: Handles image uploads and maintains proper references
- **SEO Optimization**: Generates SEO-friendly titles, descriptions, and keywords
- **Progress Tracking**: Real-time migration progress with detailed reporting

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Next.js 15 project setup with experimental features enabled
- Sanity CLI installed globally: `npm install -g @sanity/cli`

### Installation

1. **Install Dependencies**
   ```bash
   # Install main project dependencies
   npm install
   
   # Install Sanity Studio dependencies
   cd studio-aviator-training-centre-(atc)
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Sanity CMS Configuration
   ***REMOVED***
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_sanity_api_token
   NEXT_PUBLIC_SITE_URL=https://aviatorstrainingcentre.com
   ```

3. **Start Development Servers**
   ```bash
   # Start Next.js development server
   npm run dev
   
   # In a separate terminal, start Sanity Studio
   cd studio-aviator-training-centre-(atc)
   sanity dev
   ```

### Accessing Sanity Studio

1. Navigate to `http://localhost:3333` (Sanity Studio)
2. Sign in with your Sanity account credentials
3. Start creating and managing content through the professional CMS interface

## Admin Interface Components

### AdminSidebar Component

The `AdminSidebar` component provides a comprehensive navigation interface for the admin dashboard with the following features:

#### Key Features
- **Responsive Design**: Mobile-first approach with collapsible navigation
- **Hierarchical Navigation**: Organized menu structure with expandable sections
- **Active State Management**: Visual indicators for current page/section
- **Quick Actions**: Direct access to common tasks like creating new posts
- **Mobile Optimization**: Touch-friendly interface with overlay and hamburger menu

#### Navigation Structure
```typescript
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}
```

#### Main Navigation Sections
1. **Dashboard** (`/admin`) - Overview and statistics
2. **Blog Management** (`/admin/blogs`) - Content management hub
   - All Posts - Complete blog post listing
   - Create New - Blog post creation form
   - Categories - Category management
3. **SEO Tools** (`/admin/seo`) - Search optimization
   - SEO Overview - General SEO health
4. **Settings** (`/admin/settings`) - System configuration

> **Note**: The admin navigation has been simplified to focus on core functionality. Advanced features like Analytics, Automation, and Author Management have been removed to improve stability.

#### Mobile Features
- **Hamburger Menu**: Fixed position toggle button for mobile access
- **Overlay Navigation**: Full-screen overlay with backdrop blur
- **Touch Gestures**: Optimized for mobile interaction
- **Auto-Close**: Automatic menu closure on navigation

#### Accessibility Features
- **Keyboard Navigation**: Full keyboard support with proper focus management
- **ARIA Labels**: Screen reader compatibility
- **High Contrast**: Clear visual hierarchy and color contrast
- **Focus Indicators**: Visible focus states for all interactive elements

#### Usage Example
```tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

## Usage Guide

### Accessing the Admin Dashboard

1. **Navigate to Admin Panel**
   - Go to `/admin` to access the main dashboard
   - Use the responsive sidebar navigation to access different sections

2. **Mobile Navigation**
   - Tap the hamburger menu (☰) in the top-left corner on mobile devices
   - Navigate through the collapsible menu structure
   - Tap outside the menu or the X button to close

### Creating a New Blog Post

1. **Access Sanity Studio**
   - Navigate to `http://localhost:3333` (development) or your deployed Studio URL
   - Sign in with your Sanity account credentials

2. **Create New Post**
   - Click "Blog Posts" in the navigation
   - Click "Create" button and select "Blog Post"

3. **Content Tab - Fill in Basic Information**
   - **Title**: Enter a compelling, SEO-optimized blog title (10-80 characters)
   - **Slug**: Auto-generated from title, can be customized
   - **Excerpt**: Write a brief summary (120-160 characters) for listings and meta descriptions
   - **Featured Image**: Upload an image with proper alt text
   - **Category**: Select from available categories
   - **Author**: Choose from author profiles
   - **Body**: Use the rich PortableText editor for content creation

4. **SEO & Meta Tab - Optimize for Search Engines**
   - **SEO Title**: Custom title for search engines (max 60 characters)
   - **SEO Description**: Custom meta description (max 160 characters)
   - **Focus Keyword**: Primary SEO keyword
   - **Additional Keywords**: Secondary keywords for broader coverage
   - **Open Graph Image**: Custom social sharing image
   - **Structured Data**: Configure article type and educational metadata

5. **CTA & Conversion Tab - Maximize Course Enrollments**
   - **CTA Placements**: Add strategic call-to-action sections
   - **Intelligent Routing**: Enable automatic course recommendations
   - **Target Courses**: Override automatic course detection if needed

6. **Settings Tab - Publication Controls**
   - **Published Date**: Set publication timestamp
   - **Featured Post**: Mark for homepage carousel inclusion
   - **Reading Time**: Estimate reading time in minutes

### Editing Existing Posts

1. **Find the Post**
   - Use the search bar to find specific posts
   - Browse through the blog list

2. **Edit Content**
   - Click the "Edit" button next to any blog post
   - Modify content, metadata, or settings
   - Save changes or delete the post

3. **Update or Delete**
   - **Update Blog**: Save your changes
   - **Preview**: Check your changes before saving
   - **Delete**: Permanently remove the blog post

### Managing Categories

Predefined categories include:
- Aviation Training
- DGCA Exams
- Safety Tips
- Career Guidance
- Technical Knowledge
- Industry News

### Best Practices

#### Content Writing
- **SEO-Friendly Titles**: Use descriptive, keyword-rich titles
- **Engaging Excerpts**: Write compelling summaries
- **Quality Images**: Use high-resolution, relevant images
- **Proper Formatting**: Use headings, lists, and paragraphs effectively

#### Markdown Tips
```markdown
# Main Heading (H1)
## Section Heading (H2)
### Subsection (H3)

**Bold text**
*Italic text*

- Bullet point 1
- Bullet point 2

1. Numbered list item 1
2. Numbered list item 2

[Link text](https://example.com)

![Image alt text](image-url.jpg)

> Blockquote for important information

`Inline code`

```code
Code block
```
```

#### Image Guidelines
- **Format**: Use WebP or AVIF for better performance
- **Size**: Optimize images (recommended: 1200x630px for covers)
- **Alt Text**: Always include descriptive alt text
- **Storage**: Store images in `/public` directory or use a CDN

## Automation System Components

### AdminErrorBoundary Component (`components/admin/AdminErrorBoundary.tsx`)

The `AdminErrorBoundary` component provides comprehensive error handling for the admin interface:

#### Key Features
- **Graceful Error Display**: User-friendly error messages with recovery options
- **Detailed Error Information**: Development-mode error details for debugging
- **Recovery Options**: Reload functionality to recover from errors
- **Fallback UI**: Professional fallback interface when components fail

### Simple n8n Webhook Integration

The system now includes a simplified n8n webhook integration for automated content ingestion and management:

#### Key Features
- **Automated Content Ingestion**: Receive and process content from n8n workflows
- **Draft Creation**: Automatically create draft blog posts from external sources
- **Review System**: Simple review interface for approving or rejecting automated drafts
- **Error Logging**: Comprehensive error tracking with Sanity CMS integration
- **Health Monitoring**: Webhook health check endpoint for system monitoring

#### Webhook Endpoint (`app/api/n8n/webhook/simple/route.ts`)
- **POST**: Receives content from n8n workflows and creates draft blog posts
- **GET**: Health check endpoint to verify webhook availability

```typescript
// Simple interface for N8N content payload
interface SimpleN8NPayload {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  sourceUrl?: string;
  automationId?: string;
}
```

#### Draft Management API
- **GET `/api/n8n/drafts/simple`**: Fetch all automated drafts with filtering options
- **POST `/api/n8n/drafts/simple`**: Approve or reject drafts
- **GET `/api/n8n/drafts/simple/[id]`**: Fetch a specific draft by ID
- **POST `/api/n8n/drafts/simple/[id]`**: Approve or reject a specific draft
- **DELETE `/api/n8n/drafts/simple/[id]`**: Delete a draft

#### Error Logging System
The system includes a simple error logging mechanism that stores errors in Sanity CMS:

```typescript
// Simple error logging function
async function logError(error: any, context: string) {
  console.error(`N8N Automation Error (${context}):`, error);
  
  try {
    // Create a simple error log in Sanity
    await enhancedClient.create({
      _type: 'automationErrorLog',
      error: error instanceof Error ? error.message : String(error),
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    });
  } catch (logError) {
    console.error('Failed to log error to Sanity:', logError);
  }
}
```

#### SimpleAutomatedDraftReview Component
The `SimpleAutomatedDraftReview` component provides a user-friendly interface for reviewing automated drafts:

- **Draft Listing**: View all automated drafts with filtering options
- **Status Filtering**: Filter drafts by status (pending, approved, rejected)
- **Search**: Search drafts by title or content
- **Preview**: View draft content before making decisions
- **Approval Workflow**: Approve or reject drafts with comments
- **Delete Option**: Remove drafts that are no longer needed

#### Configuration
To use the n8n webhook integration, add the following environment variable:

```env
N8N_WEBHOOK_SECRET=your_webhook_secret
```

This secret is used to authenticate webhook requests from n8n.

## File Structure

```
📦 Aviators_Training_Centre/
├── 📂 studio-aviator-training-centre-(atc)/ # Sanity Studio
│   ├── 📂 schemaTypes/       # Content schemas
│   │   ├── 📄 postType.ts    # Blog post schema with enhanced fields
│   │   ├── 📄 categoryType.ts # Category schema with intelligent routing
│   │   ├── 📄 courseType.ts  # Course schema for CTA integration
│   │   ├── 📄 authorType.ts  # Author schema with credentials
│   │   └── 📄 automationErrorLogType.ts # Error logging schema
│   ├── 📂 migrations/        # Data migrations and sample data
│   ├── 📄 sanity.config.ts   # Studio configuration with custom structure
│   └── 📄 package.json       # Studio-specific dependencies
├── 📂 components/
│   └── 📂 admin/             # Admin interface components
│       ├── 📄 AdminSidebar.tsx # Simplified admin navigation sidebar
│       ├── 📄 DashboardStats.tsx # Dashboard statistics and metrics
│       ├── 📄 BlogPostTable.tsx # Blog post management table
│       ├── 📄 BlogEditor.tsx # Rich text blog post editor
│       ├── 📄 CategoryManager.tsx # Category management interface
│       ├── 📄 BulkActions.tsx # Bulk operations for blog posts
│       ├── 📄 QuickActions.tsx # Quick action buttons and shortcuts
│       ├── 📄 SEOAnalyzer.tsx # SEO analysis and optimization tools
│       ├── 📄 AdminErrorBoundary.tsx # Error handling component
│       └── 📄 SimpleAutomatedDraftReview.tsx # Draft review interface
├── 📂 lib/
│   ├── 📂 sanity/            # Sanity CMS integration
│   │   └── 📄 client.ts      # Sanity client configuration
│   ├── 📂 n8n/               # n8n automation utilities
│   │   └── 📄 simple-error-logger.ts # Error logging utilities
│   └── 📄 blog.ts            # Blog utilities with GROQ queries
├── 📂 app/
│   ├── 📂 admin/             # Admin dashboard pages
│   │   ├── 📄 page.tsx       # Main admin dashboard
│   │   ├── 📄 layout.tsx     # Admin layout with sidebar
│   │   ├── 📂 blogs/         # Blog management pages
│   │   │   └── 📄 page.tsx   # Blog listing and management
│   │   ├── 📂 new/           # Create new blog post
│   │   │   └── 📄 page.tsx   # Blog creation form
│   │   ├── 📂 edit/          # Edit existing blog posts
│   │   │   └── 📂 [id]/      # Dynamic edit pages
│   │   │       └── 📄 page.tsx # Blog editing interface
│   │   ├── 📂 seo/           # SEO tools and analysis
│   │   │   └── 📄 page.tsx   # SEO overview
│   │   └── 📂 settings/      # Admin settings
│   │       └── 📄 page.tsx   # Configuration settings
│   └── 📂 api/
│       ├── 📂 blogs/         # Blog API endpoints
│       │   ├── 📄 route.ts   # Blog operations
│       │   └── 📂 [slug]/
│       │       └── 📄 route.ts # Individual blog operations
│       └── 📂 n8n/           # n8n automation endpoints
│           ├── 📂 webhook/   # Webhook handlers
│           │   └── 📂 simple/ # Simple webhook implementation
│           │       └── 📄 route.ts # Simple webhook endpoint
│           └── 📂 drafts/    # Draft management API
│               ├── 📂 simple/ # Simple draft management
│               │   ├── 📄 route.ts # Draft listing and actions
│               │   └── 📂 [id]/ # Individual draft operations
│               │       └── 📄 route.ts # Draft details and actions
│   ├── 📂 blog/              # Public blog pages
│   │   ├── 📄 page.tsx       # Blog listing page
│   │   └── 📂 [slug]/        # Dynamic blog post pages
│   │       └── 📄 page.tsx   # Individual blog post
├── 📂 scripts/               # Automation and utility scripts
│   ├── 📄 publish-aviation-posts-clean.ts # High-conversion content publishing
│   ├── 📄 migrate-markdown-to-sanity.ts # Markdown to Sanity migration
│   ├── 📄 test-seo-features.ts # SEO validation testing
│   └── 📄 test-automation-system.ts # n8n workflow testing
```

## API Endpoints

### Blog Management
- `GET /api/blogs` - Fetch all blogs
- `POST /api/blogs` - Create new blog
- `GET /api/blogs/[slug]` - Fetch single blog
- `PUT /api/blogs/[slug]` - Update blog
- `DELETE /api/blogs/[slug]` - Delete blog

### n8n Automation
- `GET /api/n8n/webhook/simple` - Health check for webhook availability
- `POST /api/n8n/webhook/simple` - Receive content from n8n and create draft posts
- `GET /api/n8n/drafts/simple` - Fetch all automated drafts with filtering
- `POST /api/n8n/drafts/simple` - Approve or reject drafts
- `GET /api/n8n/drafts/simple/[id]` - Fetch a specific draft by ID
- `POST /api/n8n/drafts/simple/[id]` - Approve or reject a specific draft
- `DELETE /api/n8n/drafts/simple/[id]` - Delete a draft

### Authentication
- `GET /api/auth` - Basic authentication challenge

## Troubleshooting

### Common Issues

1. **Sanity Studio Access Problems**
   - Verify Sanity project ID and dataset in environment variables
   - Check if you have proper permissions for the Sanity project
   - Clear browser cache and try signing in again

2. **Content Not Saving**
   - Ensure all required fields are filled (title, slug, excerpt, image, category)
   - Check network connection and Sanity API status
   - Verify API token has write permissions

3. **Images Not Loading**
   - Check if images are properly uploaded to Sanity's CDN
   - Verify image URLs are generated correctly
   - Ensure proper alt text is provided for all images

4. **CTA Routing Not Working**
   - Verify course references are properly set up
   - Check if intelligent routing keywords are configured
   - Ensure courses are marked as active

### Error Messages

- **"Missing required fields"**: Fill in all required fields (title, excerpt, image, category)
- **"Invalid slug"**: Ensure slug is unique and URL-friendly
- **"Failed to publish"**: Check API permissions and network connection
- **"Image upload failed"**: Verify image format and size limits

## Security Considerations

### Production Deployment

1. **Change Default Credentials**
   ```env
   ADMIN_USERNAME=your_secure_username
   ADMIN_PASSWORD=your_very_secure_password
   ```

2. **Use HTTPS**
   - Always use HTTPS in production
   - Configure SSL certificates

3. **Environment Variables**
   - Never commit credentials to version control
   - Use secure environment variable management

4. **Rate Limiting**
   - Consider implementing rate limiting for API endpoints
   - Add CSRF protection for forms

### Backup Strategy

1. **Content Backup**
   - Regularly backup the `content/blog` directory
   - Use version control (Git) for content versioning

2. **Database Backup** (if using database)
   - Set up automated database backups
   - Test restore procedures regularly

## Advanced Features

### Future Enhancements

- **Rich Text Editor**: WYSIWYG editor integration
- **Image Upload**: Direct image upload functionality
- **User Roles**: Multiple user roles and permissions
- **Analytics**: Detailed blog performance analytics
- **SEO Tools**: Built-in SEO optimization tools
- **Scheduling**: Schedule posts for future publication
- **Comments**: Blog comment management system

### Customization

#### Adding New Categories
Edit the categories array in:
- `/app/admin/new/page.tsx`
- `/app/admin/edit/[id]/page.tsx`

#### Styling Customization
- Modify Tailwind classes in component files
- Update the color scheme in `tailwind.config.js`
- Customize UI components in `/components/ui/`

#### Adding Custom Fields
1. Update the `BlogFormData` interface
2. Add form fields in the admin pages
3. Update API endpoints to handle new fields
4. Modify the blog frontmatter structure

## Content Publishing Scripts

### Blog Post Management System

The system includes a comprehensive blog post management script (`scripts/manage-optimized-blog-posts.ts`) for managing and validating optimized blog content:

#### Management Features
- **File Validation**: Verify all blog post files exist and are accessible
- **Quality Metrics**: Display distribution of content quality and conversion potential
- **Word Count Verification**: Validate metadata accuracy against actual file content
- **Statistics Dashboard**: Comprehensive overview of the blog post collection
- **Task Summaries**: Generate reports for project documentation updates

#### Usage Commands
```bash
# Display comprehensive blog post statistics
npx tsx scripts/manage-optimized-blog-posts.ts stats

# Validate all blog post files exist
npx tsx scripts/manage-optimized-blog-posts.ts validate

# List all posts with detailed information (by priority)
npx tsx scripts/manage-optimized-blog-posts.ts list

# Verify word counts match metadata
npx tsx scripts/manage-optimized-blog-posts.ts verify-words

# Generate task summary for project updates
npx tsx scripts/manage-optimized-blog-posts.ts summary
```

#### Blog Post Collection
The system manages **6 high-quality, production-ready blog posts** in `data/optimized-blog-posts/`:
- **Total Word Count**: 7,221 words
- **Average Word Count**: 1,204 words per post
- **Quality Distribution**: All posts rated as "high" quality
- **Conversion Potential**: 2 very-high, 1 high, 3 medium conversion potential
- **Categories**: DGCA Exam Preparation, Aviation Medical, Career Guidance, Flight Training, Technical Knowledge

### High-Conversion Aviation Content Publisher

The system includes a comprehensive script (`scripts/publish-aviation-posts-clean.ts`) for publishing professional, SEO-optimized aviation blog posts authored by Aman Suryavanshi:

#### Features
- **Pre-written High-Quality Content**: 5 professionally written aviation blog posts covering key topics
- **SEO Optimization**: Complete SEO setup with focus keywords, meta descriptions, and structured data
- **Author Profile Creation**: Automated creation of professional author profiles with credentials
- **Category Management**: Strategic blog categories with intelligent CTA routing
- **CTA Integration**: Strategic call-to-action placement for maximum conversion potential
- **Structured Data**: Rich snippets with educational content schema
- **Professional Authority**: Content by ATPL-certified instructor with 12,000+ flight hours

#### Usage
```bash
# Set your Sanity API token
export SANITY_API_TOKEN=your_sanity_write_token

# Run the publishing script
npx tsx scripts/publish-aviation-posts-clean.ts
```

#### Published Content
1. **DGCA CPL Complete Guide 2024** - Comprehensive commercial pilot license guide (Featured)
2. **DGCA Medical Examination Tips** - Critical medical preparation guide (Featured)
3. **Pilot Salary in India 2024** - Career earnings and progression guide (Featured)
4. **Flight Simulator Training Benefits** - Modern training technology advantages
5. **Aviation Technology Trends** - Future of aviation technology
6. **Airline Industry Career Opportunities** - Diverse aviation career paths

#### Content Quality Standards
- **Expert Authorship**: Written by certified flight instructor with 15+ years experience
- **Conversion Focus**: Strategic CTA placement for course enrollment and consultation
- **SEO Excellence**: Optimized for high-value aviation keywords
- **Educational Value**: Comprehensive guides with actionable insights
- **Industry Authority**: Establishes credibility and expertise

## Testing and Validation

### SEO Testing Infrastructure
The system includes comprehensive SEO testing capabilities:

#### SEO Features Testing Script (`scripts/test-seo-features.ts`)
Automated testing suite that validates all SEO functionality:

```bash
# Run SEO tests
npm run test:seo
# or
node scripts/test-seo-features.ts
```

**Testing Coverage:**
- **Metadata Generation**: Validates blog post metadata creation and structure
- **SEO Title Optimization**: Tests title length (≤60 characters) and keyword integration
- **Meta Description Quality**: Ensures descriptions are 120-160 characters with focus keywords
- **Focus Keyword Integration**: Verifies keyword presence in titles and descriptions
- **Structured Data Validation**: Tests JSON-LD markup for educational content schema
- **URL Structure Compliance**: Validates slug format and SEO-friendly URL patterns
- **Meta Tag Completeness**: Ensures all required Open Graph and Twitter Card tags are generated

**Test Results:**
- 7-point validation system with detailed pass/fail analysis
- Mock data testing using realistic blog post scenarios
- Automated reporting with CI/CD integration support
- Exit codes for automated testing pipelines

#### SEO Validation Checklist
Before publishing content, ensure:
- [ ] SEO title is ≤60 characters and includes focus keyword
- [ ] Meta description is 120-160 characters with focus keyword
- [ ] URL slug follows SEO-friendly format (lowercase, hyphens, no special characters)
- [ ] All required meta tags are generated (Open Graph, Twitter Card)
- [ ] Structured data validates for educational content
- [ ] Focus keyword appears in both title and description
- [ ] All SEO tests pass in the automated testing script

## Support

For technical support or questions:
1. Check this documentation first
2. Run the SEO testing script to validate functionality
3. Review error messages and logs
4. Check the browser console for JavaScript errors
5. Contact the development team

## Contributing

When contributing to the admin system:
1. Follow the existing code style
2. Add proper TypeScript types
3. Include error handling
4. Update documentation
5. Test all functionality before submitting

---

**Note**: This admin system is designed for the Aviators Training Centre website. Customize it according to your specific needs and requirements.