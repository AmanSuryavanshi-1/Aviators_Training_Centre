# Developer Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Build & Test](#build--test)
- [Scripts Reference](#scripts-reference)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)
- [Unknowns & Inferences](#unknowns--inferences)

## Prerequisites

### Required Software

- **Node.js**: 18.0 or later
- **npm**: Latest version (comes with Node.js)
- **Git**: For version control
- **Vercel CLI**: `npm install -g vercel` (for deployment)
- **Sanity CLI**: `npm install -g @sanity/cli` (for CMS management)

### Required Service Accounts

You'll need accounts and API keys for:

1. **Sanity.io** - Content management system
2. **Firebase** - Analytics, authentication, and database
3. **Vercel** - Hosting and deployment platform
4. **Resend** - Email service for contact forms

## Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd aviators-training-centre
npm install
```

### 2. Environment Configuration

Copy the environment template and configure with your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual service credentials:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Sanity CMS - REQUIRED
NEXT_PUBLIC_SANITY_PROJECT_ID=[your_sanity_project_id]
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=[your_sanity_api_token]

# Firebase - REQUIRED
FIREBASE_API_KEY=[your_firebase_api_key]
FIREBASE_PROJECT_ID=[your_firebase_project_id]
FIREBASE_PRIVATE_KEY="[your_firebase_private_key]"
FIREBASE_CLIENT_EMAIL=[your_firebase_client_email]

# Email Service - REQUIRED
RESEND_API_KEY=[your_resend_api_key]
FROM_EMAIL=noreply@your-domain.com
OWNER1_EMAIL=[your_email]
OWNER2_EMAIL=[your_second_email]

# Admin Dashboard - REQUIRED
ADMIN_USERNAME=[your_admin_username]
ADMIN_PASSWORD=[your_secure_password]
ADMIN_JWT_SECRET=[your_32_character_jwt_secret]

# Analytics - OPTIONAL
NEXT_PUBLIC_GA_MEASUREMENT_ID=[your_ga4_measurement_id]
```

⚠️ **IMPORTANT**: Replace all placeholder values with your actual credentials from the respective services.

### 3. Studio Environment Setup

The Sanity Studio has its own environment configuration:

```bash
cd studio
cp .env.local.example .env.local
# Configure studio-specific environment variables
```

### 4. Automated Production Setup

For production environments, use the automated setup script:

```bash
npm run production:setup
```

This script will:
- Guide you through service configuration
- Generate secure secrets automatically
- Validate all required environment variables
- Create optimized production configurations

## Local Development

### Starting Development Servers

```bash
# Start the main Next.js application
npm run dev
# Runs on http://localhost:3000

# In a separate terminal, start Sanity Studio
cd studio
npm run dev
# Runs on http://localhost:3333
```

### Development Access Points

- **Main Website**: http://localhost:3000
- **Sanity Studio**: http://localhost:3333
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/system/health

### Hot Reload and Development Features

- **Next.js Hot Reload**: Automatic page refresh on file changes
- **TypeScript Checking**: Real-time type checking in development
- **Error Overlay**: Detailed error information in browser
- **React DevTools**: Browser extension support for debugging

### Development Workflow

1. **Make Changes**: Edit files in `src/` directory
2. **Check Types**: `npm run type-check`
3. **Lint Code**: `npm run lint`
4. **Test Changes**: `npm test`
5. **Build Locally**: `npm run build`

## Build & Test

### Build Commands

```bash
# Standard production build
npm run build

# Enhanced production build with optimizations
npm run build:production

# Build with bundle analysis
npm run build:analyze

# Safe build (continues with warnings)
npm run build:safe
```

### Testing Commands

```bash
# Run all tests (type checking + linting)
npm test

# Individual test suites
npm run type-check          # TypeScript validation
npm run lint                # ESLint validation
npm run test:unit           # Jest unit tests
npm run test:integration    # Integration tests
npm run test:e2e            # Playwright end-to-end tests

# Test with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Specific test suites
npm run test:blog-functionality    # Blog system tests
npm run test:sync                  # Synchronization tests
npm run test:analytics             # Analytics tests
```

### Validation Commands

```bash
# Environment validation
npm run validate:env               # Check environment variables
npm run validate:sanity            # Validate Sanity configuration
npm run validate:seo               # SEO implementation check
npm run validate:deployment        # Pre-deployment validation

# Production validation
npm run production:validate        # Production configuration check
npm run production:check           # Production readiness check
```

## Scripts Reference

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run dev:unified` | Start both Next.js and Studio together (inferred) |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | ESLint code linting |

### Build Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Standard production build |
| `npm run build:production` | Enhanced production build |
| `npm run build:analyze` | Build with bundle analysis |
| `npm run start` | Start production server |

### Testing Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run type checking and linting |
| `npm run test:unit` | Jest unit tests |
| `npm run test:integration` | Integration tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run test:watch` | Watch mode for development |

### Content Management Scripts

| Script | Description |
|--------|-------------|
| `npm run migrate:blog` | Migrate blog content to Sanity |
| `npm run blog:populate-images` | Auto-populate blog images |
| `npm run blog:enhance-posts` | Enhance existing blog posts |
| `npm run manage:blog-posts` | Blog post management utilities |

### Production Scripts

| Script | Description |
|--------|-------------|
| `npm run production:setup` | Production environment setup |
| `npm run production:validate` | Validate production config |
| `npm run deploy:production` | Full production deployment |
| `npm run production:backup` | Create system backup |

### Maintenance Scripts

| Script | Description |
|--------|-------------|
| `npm run fix:blog` | Run comprehensive blog fixes |
| `npm run cleanup` | Clean temporary files |
| `npm run health:check` | System health check |
| `npm run cache:invalidate` | Clear application cache |

### Analytics Scripts

| Script | Description |
|--------|-------------|
| `npm run setup:firestore-analytics` | Setup Firestore analytics |
| `npm run test:firestore-analytics` | Test analytics configuration |
| `npm run validate:production-analytics` | Validate production analytics |

## CI/CD

### GitHub Actions (Inferred)

The project likely uses GitHub Actions for continuous integration:

```yaml
# .github/workflows/ci.yml (inferred structure)
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run build
```

### Vercel Integration

Automatic deployments are configured through Vercel:

- **Preview Deployments**: On pull requests
- **Production Deployments**: On main branch pushes
- **Environment Variables**: Configured in Vercel dashboard

### Deployment Pipeline

1. **Code Push**: Push to repository
2. **CI Tests**: Automated testing via GitHub Actions
3. **Build**: Vercel builds the application
4. **Deploy**: Automatic deployment to preview/production
5. **Validation**: Post-deployment health checks

## Troubleshooting

### Common Issues

#### Build Failures

**Problem**: Build fails with TypeScript errors
```bash
# Solution: Check and fix type errors
npm run type-check
# Fix reported errors, then rebuild
npm run build
```

**Problem**: Build fails with dependency issues
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Environment Issues

**Problem**: Missing environment variables
```bash
# Solution: Validate environment configuration
npm run validate:env
# Check .env.local file and add missing variables
```

**Problem**: Sanity connection issues
```bash
# Solution: Test Sanity configuration
npm run validate:sanity
# Check project ID, dataset, and API token
```

#### Development Server Issues

**Problem**: Port already in use
```bash
# Solution: Kill process on port 3000
npx kill-port 3000
# Or use different port
PORT=3001 npm run dev
```

**Problem**: Hot reload not working
```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run dev
```

#### Firebase Issues

**Problem**: Firebase authentication errors
```bash
# Solution: Check Firebase configuration
npm run test:firestore-analytics
# Verify service account credentials
```

#### Studio Issues

**Problem**: Sanity Studio not loading
```bash
# Solution: Check studio configuration
cd studio
npm run dev
# Check browser console for errors
```

### Debug Commands

```bash
# Test individual services
npm run test:sanity              # Test Sanity connection
npm run test:firestore-analytics # Test Firebase connection
npm run health:check             # Overall system health

# Validate configurations
npm run validate:env             # Environment variables
npm run validate:sanity          # Sanity CMS setup
npm run validate:seo             # SEO configuration
```

### Performance Issues

**Problem**: Slow build times
```bash
# Solution: Analyze bundle size
npm run build:analyze
# Check for large dependencies or unused code
```

**Problem**: Runtime performance issues
```bash
# Solution: Check Core Web Vitals
# Use browser DevTools Performance tab
# Review Next.js build output for optimization suggestions
```

### Security Issues

**Problem**: Security vulnerabilities
```bash
# Solution: Run security audit
npm audit
npm audit fix
npm run security:check
```

### Getting Help

1. **Check Documentation**: Review relevant docs in `docs/` folder
2. **Check Logs**: Review browser console and server logs
3. **Test Individual Components**: Use specific test scripts
4. **Validate Configuration**: Run validation scripts
5. **Create Issue**: If problem persists, create a GitHub issue

## Unknowns & Inferences

### Inferences Made

1. **GitHub Actions**: CI/CD pipeline structure inferred from common Next.js patterns
2. **Port Configuration**: Standard Next.js (3000) and Sanity (3333) ports assumed
3. **Development Workflow**: Standard Git workflow inferred
4. **Testing Framework**: Jest and Playwright inferred from dependencies
5. **Deployment Strategy**: Vercel-based deployment inferred from configuration

### Unknown/Missing Information

1. **Exact CI/CD Configuration**: Specific GitHub Actions workflows not found
2. **Custom Deployment Scripts**: Some deployment scripts may have custom logic
3. **Database Migrations**: Specific migration procedures not documented
4. **Monitoring Setup**: Detailed monitoring configuration not fully documented
5. **Performance Benchmarks**: Specific performance targets not defined

### Areas Needing Clarification

1. **Service Account Setup**: Detailed steps for each service account creation
2. **Production Secrets Management**: How secrets are managed in production
3. **Backup Procedures**: Detailed backup and restore procedures
4. **Scaling Configuration**: How the application scales under load
5. **Error Monitoring**: Integration with external error tracking services

---

**Note**: This guide covers the essential development workflow. For specific feature implementation, refer to the [Components Reference](./COMPONENTS_REFERENCE.md) and individual documentation files in the `docs/` folder.