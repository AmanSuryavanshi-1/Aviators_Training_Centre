# Aviators Training Centre Blog System

A comprehensive, full-stack blog system with integrated CMS, analytics, and admin dashboard built for the Aviators Training Centre. This system combines Next.js, Sanity Studio, and Firebase to deliver a professional content management experience with real-time analytics and SEO optimization.

## 🚀 Features

### Content Management
- **Sanity Studio Integration** - Professional CMS with real-time collaboration
- **Rich Content Editor** - Support for HTML paste, media uploads, and structured content
- **Content Versioning** - Track changes and restore previous versions
- **Scheduled Publishing** - Plan and automate content releases
- **Preview System** - Preview drafts before publishing
- **SEO Automation** - Automated meta tags, keyword analysis, and social previews

### Analytics & Monitoring
- **Real-time Analytics** - Track pageviews, CTA clicks, and user behavior
- **Conversion Tracking** - Monitor form submissions and user journeys
- **Admin Dashboard** - Comprehensive analytics and system monitoring
- **Performance Metrics** - Core Web Vitals and performance tracking
- **Error Monitoring** - Automated error detection and reporting

### User Experience
- **Responsive Design** - Mobile-first approach with aviation theme
- **Fast Performance** - ISR, image optimization, and caching strategies
- **SEO Optimized** - Meta tags, Open Graph, Twitter Cards, and sitemaps
- **Accessibility** - WCAG compliant with screen reader support
- **Progressive Enhancement** - Works without JavaScript

### Developer Experience
- **TypeScript** - Full type safety across the entire stack
- **Modern Stack** - Next.js 14, React 18, and latest web standards
- **Automated Testing** - Unit, integration, and E2E tests
- **CI/CD Pipeline** - Automated deployment with Vercel
- **Development Tools** - Hot reload, debugging, and profiling

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom aviation theme
- **Components:** Custom React components with shadcn/ui
- **State Management:** React Context and custom hooks

### Backend & Services
- **CMS:** Sanity Studio with custom schemas
- **Database:** Firebase Firestore for analytics
- **Authentication:** Firebase Auth + custom JWT
- **Email:** Resend for transactional emails
- **File Storage:** Sanity Assets with CDN
- **Search:** Sanity's built-in search with custom indexing

### Infrastructure
- **Hosting:** Vercel with global CDN
- **Domain:** Custom domain with SSL
- **Monitoring:** Built-in analytics + optional Sentry
- **Caching:** ISR, CDN, and browser caching
- **Security:** HTTPS, CORS, rate limiting, and input validation

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
cd aviators-training-centre

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
aviators-training-centre/
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

The system requires several environment variables for different services:

#### Core Configuration
```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://aviatorstrainingcentre.com
NEXT_PUBLIC_SITE_NAME="Aviators Training Centre"

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
SANITY_API_TOKEN=your_api_token
SANITY_WEBHOOK_SECRET=your_webhook_secret

# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com

# Email Service
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@aviatorstrainingcentre.com

# Admin Access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
```

See [.env.local.example](.env.local.example) for the complete list.

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
- [📋 Deployment Checklist](PRODUCTION_DEPLOYMENT_CHECKLIST.md) - Pre and post-deployment verification
- [🔧 Environment Setup](docs/ENVIRONMENT_SETUP.md) - Development environment configuration

### Development
- [💻 Development Guide](docs/DEVELOPMENT_GUIDE.md) - Local development setup and workflows
- [🏗 Architecture Overview](docs/architecture/SYSTEM_ARCHITECTURE.md) - System design and architecture
- [📝 API Documentation](docs/api/API_DOCUMENTATION.md) - API endpoints and usage

### Content Management
- [📝 Blog System Guide](docs/BLOG_SYSTEM_README.md) - Content creation and management
- [🎨 Sanity Studio Guide](docs/SANITY_QUICK_SETUP.md) - CMS configuration and usage
- [📊 Analytics Guide](docs/ANALYTICS_SYSTEM_README.md) - Analytics setup and interpretation

### Administration
- [👤 Admin System Guide](docs/ADMIN_SYSTEM_README.md) - Admin dashboard usage
- [📈 Monitoring Guide](docs/MONITORING_SYSTEM_README.md) - System monitoring and alerts
- [🔒 Security Guide](docs/SECURITY_GUIDE.md) - Security best practices

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
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

### Testing
- `npm test` - Run all tests
- `npm run test:unit` - Unit tests only
- `npm run test:integration` - Integration tests
- `npm run test:e2e` - End-to-end tests
- `npm run test:coverage` - Test coverage report

### Production
- `npm run production:setup` - Production environment setup
- `npm run production:validate` - Validate production config
- `npm run production:deploy` - Full production deployment
- `npm run production:backup` - Create system backup

### Maintenance
- `npm run migrate:blog` - Migrate blog data
- `npm run validate:sanity` - Validate Sanity configuration
- `npm run health:check` - System health check
- `npm run cleanup` - Clean up temporary files

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