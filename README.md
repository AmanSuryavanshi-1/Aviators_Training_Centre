# Aviators Training Centre - Full-Stack Aviation Training Platform

A comprehensive, production-ready aviation training platform built for Aviators Training Centre. This system combines Next.js 15, Sanity CMS, Firebase, and advanced analytics to deliver a professional content management experience with real-time tracking, form validation, and SEO optimization.

## 🚀 Key Features

### Content Management System
- **Sanity Studio Integration** - Professional headless CMS with real-time collaboration
- **Rich Content Editor** - PortableText support with HTML paste, media uploads, and structured content
- **Content Versioning** - Track changes and restore previous versions with audit trails
- **Scheduled Publishing** - Plan and automate content releases with workflow management
- **Preview System** - Preview drafts before publishing with staging environment
- **SEO Automation** - Automated meta tags, keyword analysis, structured data, and social previews
- **Multi-language Support** - Document internationalization ready (English/Hindi)

### Advanced Analytics & Tracking
- **Real-time Analytics** - Track pageviews, CTA clicks, user behavior, and engagement metrics
- **Conversion Tracking** - Monitor form submissions, demo bookings, and user journey funnels
- **Blog Analytics** - Track reading time, scroll depth, and content performance
- **Contact Form Analytics** - Track form starts, completions, and conversion rates
- **Traffic Source Detection** - Identify and track referral sources and campaign performance
- **Firebase Integration** - Firestore for analytics storage and real-time data sync

### Form Validation & User Experience
- **Advanced Form Validation** - Real-time email and phone number validation with Indian formats
- **Contact Form System** - Intelligent contact forms with demo booking capabilities
- **Validation Error Handling** - User-friendly error messages with accessibility support
- **Form Pre-population** - URL parameter support for course-specific inquiries
- **Success Tracking** - Form submission analytics and conversion optimization

### Performance & SEO
- **Next.js 15 Optimizations** - Latest performance features and experimental enhancements
- **Image Optimization** - WebP/AVIF support with responsive loading and CDN delivery
- **ISR (Incremental Static Regeneration)** - Smart caching with automatic revalidation
- **SEO Excellence** - Comprehensive meta tags, Open Graph, Twitter Cards, and XML sitemaps
- **Core Web Vitals** - Optimized for Google's performance metrics
- **Accessibility Compliance** - WCAG guidelines with screen reader support

### Developer Experience
- **TypeScript** - Full type safety across the entire stack with strict configuration
- **Modern Architecture** - Next.js 15 App Router with server components and streaming
- **Error Handling** - Multi-layered error boundaries with circuit breaker patterns
- **Testing Suite** - Comprehensive unit, integration, and E2E testing
- **Development Tools** - Hot reload, debugging, profiling, and validation scripts

## 🛠 Tech Stack

### Frontend Architecture
- **Framework:** Next.js 15 with App Router and React 18
- **Language:** TypeScript with strict type checking
- **Styling:** Tailwind CSS with custom aviation theme and responsive design
- **Components:** Custom React components with shadcn/ui and Radix UI primitives
- **Animations:** Framer Motion for smooth interactions and page transitions
- **State Management:** React Context, custom hooks, and client-side validation

### Backend & Services
- **CMS:** Sanity Studio with custom schemas and plugins
- **Database:** Firebase Firestore for analytics and real-time data
- **Authentication:** Firebase Auth with custom JWT and admin dashboard
- **Email Service:** Resend API for transactional emails and notifications
- **File Storage:** Sanity Assets with CDN optimization and image transformations
- **Analytics:** Custom analytics system with Google Analytics 4 integration

### Infrastructure & Deployment
- **Hosting:** Vercel with global CDN and edge functions
- **Domain:** Custom domain with SSL and security headers
- **Environment:** Production/development environment separation
- **Caching:** ISR, CDN caching, and browser caching strategies
- **Security:** HTTPS enforcement, CORS configuration, input validation, and rate limiting
- **Monitoring:** Built-in health checks, error tracking, and performance monitoring

## 📋 Prerequisites

Before setting up the project, ensure you have:

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Git** for version control
- **Vercel CLI** for deployment (`npm install -g vercel`)
- **Sanity CLI** for CMS management (`npm install -g @sanity/cli`)

### Required Service Accounts

You'll need accounts for:
- [Sanity.io](https://sanity.io) - Content management
- [Firebase](https://firebase.google.com) - Analytics and authentication
- [Vercel](https://vercel.com) - Hosting and deployment
- [Resend](https://resend.com) - Email service

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd your-project-directory

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.local.example .env.local

# Edit with your actual values
nano .env.local
```

### 3. Start Development

```bash
# Start the Next.js development server
npm run dev

# In a new terminal, start Sanity Studio
cd studio
npm install
npm run dev
```

### 4. Access the Application

- **Website:** http://localhost:3000
- **Sanity Studio:** http://localhost:3333
- **Admin Dashboard:** http://localhost:3000/admin

## 📁 Project Structure

```
your-project-directory/
├── 📁 src/                          # Application source code
│   ├── 📁 app/                      # Next.js App Router pages
│   │   ├── 📁 admin/                # Admin dashboard
│   │   ├── 📁 api/                  # API routes
│   │   ├── 📁 blog/                 # Blog pages
│   │   └── 📄 layout.tsx            # Root layout
│   ├── 📁 components/               # React components
│   │   ├── 📁 admin/                # Admin-specific components
│   │   ├── 📁 blog/                 # Blog components
│   │   ├── 📁 ui/                   # Reusable UI components
│   │   └── 📁 layout/               # Layout components
│   ├── 📁 lib/                      # Utility libraries
│   │   ├── 📁 sanity/               # Sanity client and queries
│   │   ├── 📁 firebase/             # Firebase configuration
│   │   ├── 📁 analytics/            # Analytics utilities
│   │   └── 📁 utils/                # General utilities
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 types/                    # TypeScript definitions
│   └── 📁 styles/                   # Global styles
├── 📁 studio/                       # Sanity Studio
│   ├── 📁 schemaTypes/              # Content schemas
│   ├── 📁 components/               # Studio components
│   ├── 📁 plugins/                  # Custom plugins
│   └── 📄 sanity.config.ts          # Studio configuration
├── 📁 public/                       # Static assets
├── 📁 docs/                         # Documentation
├── 📁 tests/                        # Test files
│   ├── 📁 unit/                     # Unit tests
│   ├── 📁 integration/              # Integration tests
│   └── 📁 e2e/                      # End-to-end tests
├── 📁 tools/                        # Build and deployment tools
│   ├── 📁 scripts/                  # Automation scripts
│   └── 📁 migration/                # Data migration tools
└── 📁 .kiro/                        # Kiro AI specifications
    └── 📁 specs/                    # Feature specifications
```

## 🔧 Configuration

### Environment Variables

The system requires several environment variables for different services. Current configuration:

#### Core Configuration
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=your_sanity_write_token

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@your-domain.com
OWNER1_EMAIL=your-email@domain.com
OWNER2_EMAIL=your-second-email@domain.com

# Admin Access
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

See [.env.local.example](.env.local.example) for the complete configuration template.

### Automated Setup

Use the automated setup script for production:

```bash
npm run production:setup
```

This script will:
- Guide you through configuration
- Generate secure secrets
- Create environment files
- Update deployment settings

## 📚 Documentation

### Setup & Deployment
- [📖 Production Setup Guide](docs/PRODUCTION_SETUP_GUIDE.md) - Complete production deployment guide
- [🔧 Environment Setup](docs/ENVIRONMENT_SETUP.md) - Development environment configuration
- [📋 Deployment Checklist](PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Pre and post-deployment verification

### Content Management & Features
- [📝 Blog System Guide](docs/BLOG_SYSTEM_README.md) - Comprehensive blog system with Sanity CMS integration
- [👤 Admin System Guide](docs/ADMIN_SYSTEM_README.md) - Admin dashboard and content management
- [🎨 Sanity Studio Guide](docs/SANITY_QUICK_SETUP.md) - CMS configuration and usage

### Implementation Specifications
- [✅ Contact Form Validation](/.kiro/specs/contact-form-validation/tasks.md) - Advanced form validation system
- [📊 Blog Studio Analytics](/.kiro/specs/blog-studio-analytics-system/tasks.md) - Analytics and CMS integration
- [🔧 Schema Field Validation](/.kiro/specs/sanity-schema-field-validation-fix/tasks.md) - Sanity schema fixes
- [🚀 Advanced SEO Maximization](/.kiro/specs/advanced-blog-seo-maximization/tasks.md) - SEO optimization roadmap

### Development & Architecture
- [🏗 System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md) - System design and architecture
- [📝 API Documentation](docs/api/API_DOCUMENTATION.md) - API endpoints and usage
- [📈 Monitoring Guide](docs/MONITORING_SYSTEM_README.md) - System monitoring and alerts

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Structure

- **Unit Tests** - Individual component and function testing
- **Integration Tests** - API routes and service integration
- **E2E Tests** - Full user journey testing
- **Performance Tests** - Load and performance testing

## 🚀 Deployment

### Development Deployment

```bash
# Build and test locally
npm run build
npm start

# Deploy to Vercel preview
vercel
```

### Production Deployment

```bash
# Validate configuration
npm run production:validate

# Deploy Sanity Studio
cd studio && npx sanity deploy

# Deploy to Vercel production
vercel --prod
```

### Automated Deployment

The system includes automated deployment via:
- **GitHub Actions** - CI/CD pipeline
- **Vercel Integration** - Automatic deployments on push
- **Sanity Webhooks** - Content-triggered rebuilds

## 📊 Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production with optimizations
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration
- `npm run type-check` - TypeScript type checking

### Testing & Validation
- `npm test` - Run type checking and linting
- `npm run test:blog-functionality` - Comprehensive blog system tests
- `npm run test:sync` - Test synchronization functionality
- `npm run validate:sanity` - Validate Sanity CMS configuration
- `npm run validate:seo` - SEO implementation validation
- `npm run validate:env` - Environment variables validation

### Content Management
- `npm run migrate:blog` - Migrate blog content to Sanity CMS
- `npm run manage:blog-posts` - Blog post management and statistics
- `npm run blog:populate-images` - Auto-populate blog images
- `npm run blog:enhance-posts` - Enhance existing blog posts

### Production & Deployment
- `npm run production:setup` - Production environment setup
- `npm run production:validate` - Validate production configuration
- `npm run deploy:production` - Full production deployment
- `npm run production:backup` - Create system backup

### Maintenance & Monitoring
- `npm run fix:blog` - Run comprehensive blog system fixes
- `npm run health:check` - System health check
- `npm run cleanup` - Clean up temporary files and dependencies
- `npm run monitoring:setup` - Setup production monitoring

## 🔍 Monitoring & Analytics

### Built-in Analytics
- **Pageview Tracking** - Automatic page visit tracking
- **User Behavior** - Click tracking and user journeys
- **Performance Metrics** - Core Web Vitals monitoring
- **Error Tracking** - Automatic error detection

### Admin Dashboard
Access the admin dashboard at `/admin` to view:
- Real-time analytics
- System health status
- Content management tools
- Performance metrics

### External Monitoring
Optional integrations:
- **Google Analytics** - Enhanced web analytics
- **Sentry** - Error tracking and performance monitoring
- **Vercel Analytics** - Deployment and performance insights

## 🛡 Security

### Security Features
- **HTTPS Enforcement** - All traffic encrypted
- **Authentication** - Secure admin access
- **Rate Limiting** - API protection
- **Input Validation** - XSS and injection prevention
- **CORS Configuration** - Cross-origin request control

### Security Best Practices
- Regular dependency updates
- Environment variable protection
- Secure API endpoints
- Content Security Policy
- Regular security audits

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**
   ```bash
   npm test
   ```
6. **Submit a pull request**

### Code Standards
- **TypeScript** - All code must be typed
- **ESLint** - Follow the configured linting rules
- **Prettier** - Code formatting is automated
- **Testing** - New features require tests
- **Documentation** - Update docs for significant changes

### Commit Convention
Use conventional commits:
```
feat: add new blog post template
fix: resolve mobile navigation issue
docs: update API documentation
test: add integration tests for analytics
```

## 📞 Support

### Getting Help
- **Documentation** - Check the docs folder for detailed guides
- **Issues** - Create GitHub issues for bugs or feature requests
- **Discussions** - Use GitHub Discussions for questions

### Troubleshooting
Common issues and solutions:

1. **Build Failures**
   - Check environment variables
   - Verify Node.js version
   - Clear cache: `npm run clean`

2. **Sanity Connection Issues**
   - Verify project ID and API token
   - Check network connectivity
   - Validate permissions

3. **Firebase Errors**
   - Check service account credentials
   - Verify Firestore rules
   - Test authentication

## 📄 License

This project is proprietary and confidential. All rights reserved by Aviators Training Centre.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Sanity](https://sanity.io/) - Content management
- [Firebase](https://firebase.google.com/) - Backend services
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

**Aviators Training Centre Blog System** - Empowering aviation education through modern web technology.