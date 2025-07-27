# Aviator Training Centre

A modern, responsive website for aviation training services built with Next.js, TypeScript, and Sanity CMS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables (IMPORTANT!)
cp .env.local.example .env.local
# Edit .env.local with your Sanity credentials

# Start development server
npm run dev

# Build for production
npm run build:production

# Deploy to production
npm run deploy:production
```

## ⚙️ Environment Setup

**Important**: The blog system requires Sanity CMS configuration to work properly.

1. **Copy the environment template**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure Sanity credentials** in `.env.local`:
   ```bash
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   SANITY_API_TOKEN=your_api_token
   ```

3. **Get your credentials** from [Sanity Management Console](https://sanity.io/manage)

📖 **Full setup guide**: See [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

### What works without configuration:
- ✅ Blog reading and viewing
- ✅ Static content display
- ✅ Basic navigation

### What requires configuration:
- ❌ Blog post creation/editing
- ❌ View count tracking
- ❌ Real-time content sync

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable React components
│   ├── admin/             # Admin dashboard components
│   ├── blog/              # Blog-related components
│   ├── home/              # Homepage components
│   └── lead-generation/   # Lead generation tools
├── lib/                   # Utility libraries and configurations
│   ├── analytics/         # Analytics and tracking
│   ├── blog/              # Blog functionality
│   ├── cta/               # Call-to-action systems
│   ├── marketing/         # Marketing automation
│   ├── testing/           # Testing utilities
│   └── types/             # TypeScript type definitions
├── data/                  # Static data and content
│   ├── aviation-blog-posts/    # Legacy blog posts
│   └── optimized-blog-posts/   # SEO-optimized content
├── scripts/               # Build and maintenance scripts
│   ├── deployment/        # Production deployment scripts
│   ├── development/       # Development and testing scripts
│   └── maintenance/       # Bug fixes and maintenance
├── tests/                 # Test files
├── docs/                  # Documentation
│   ├── implementation/    # Implementation summaries
│   ├── guides/           # Setup and deployment guides
│   │   ├── SANITY_ENVIRONMENT_SETUP.md      # Complete Sanity setup guide
│   │   ├── SANITY_SYNC_TROUBLESHOOTING.md   # Troubleshooting guide
│   │   └── SANITY_DEPLOYMENT_CHECKLIST.md   # Production deployment checklist
│   ├── analysis/         # Performance and analysis reports
│   └── fixes/            # Bug fix documentation
├── studio-aviator-training-centre-(atc)/  # Sanity CMS configuration
└── public/               # Static assets
```

## Features

- **Modern Tech Stack**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Performance Optimized**: Core Web Vitals optimized with advanced Next.js features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **SEO Optimized**: Comprehensive meta tags, structured data, and sitemap generation
- **Sanity CMS Integration**: Rich content management with custom schemas
- **Blog System**: Feature-rich blog with categories, authors, and intelligent CTAs
- **Course Management**: Integrated course system with intelligent routing
- **Admin Interface**: Comprehensive admin dashboard for content management
- **Markdown Support**: Alternative content source with optimized blog posts
- **Content Migration**: Tools for migrating Markdown content to Sanity CMS

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Sanity account (for CMS functionality)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/aviators-training-centre.git
cd aviators-training-centre
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Sanity credentials
```

**Important:** Follow the [Sanity Environment Setup Guide](docs/guides/SANITY_ENVIRONMENT_SETUP.md) for detailed configuration instructions.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Troubleshooting

If you encounter issues with blog functionality or Sanity synchronization, refer to:
- [Sanity Sync Troubleshooting Guide](docs/guides/SANITY_SYNC_TROUBLESHOOTING.md)
- [Sanity Deployment Checklist](docs/guides/SANITY_DEPLOYMENT_CHECKLIST.md)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run build:analyze

# Run performance tests
npm run test:performance

# Generate sitemap
npm run postbuild

# Migrate Markdown to Sanity CMS
npm run migrate:blog

# Validate Sanity environment setup
npm run validate:sanity

# Run sync functionality tests
npm run test:sync
```

## Sanity CMS Configuration

The blog system uses Sanity CMS as the single source of truth for all content. Quick setup:

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Get API token from Sanity:**
   - Go to https://sanity.io/manage
   - Select "Aviators Training Centre" project
   - Create token with **Editor** permissions

3. **Update .env.local with your token:**
   ```bash
   ***REMOVED***k_your_token_here
   ```

4. **Validate setup:**
   ```bash
   npm run validate:sanity
   ```

For detailed setup instructions, see [Sanity Quick Setup](docs/SANITY_QUICK_SETUP.md).

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin interface pages
│   ├── api/                # API routes
│   ├── blog/               # Blog pages
│   └── courses/            # Course pages
├── components/             # React components
│   ├── admin/              # Admin components
│   ├── blog/               # Blog components
│   ├── layout/             # Layout components
│   └── ui/                 # UI components
├── content/                # Markdown content
│   └── blog/               # Blog posts in Markdown
├── data/                   # Data files
│   └── optimized-blog-posts/ # Optimized blog posts
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   ├── blog/               # Blog utilities
│   ├── sanity/             # Sanity client
│   └── types/              # TypeScript types
├── public/                 # Static assets
├── scripts/                # Utility scripts
├── studio-aviator-training-centre-(atc)/ # Sanity Studio
└── styles/                 # Global styles
```

## Markdown Blog System

The website includes a Markdown-based blog system as an alternative to Sanity CMS:

- **Location**: `data/optimized-blog-posts/`
- **API**: `app/api/blog/markdown/route.ts`
- **Client**: `lib/blog/markdown-api-client.ts`
- **Server Utils**: `lib/blog/markdown-server-utils.ts`
- **Features**:
  - 6 high-quality aviation blog posts
  - SEO optimized content
  - Category and tag support
  - Featured posts
  - Availability checking

### Markdown Blog API

The Markdown Blog API provides the following endpoints:

- `GET /api/blog/markdown?action=all` - Get all blog posts
- `GET /api/blog/markdown?action=featured` - Get featured blog posts
- `GET /api/blog/markdown?action=single&slug={slug}` - Get a single blog post by slug
- `GET /api/blog/markdown?action=by-category&category={category}` - Get posts by category
- `GET /api/blog/markdown?action=search&query={query}` - Search blog posts
- `GET /api/blog/markdown?action=categories` - Get all categories
- `GET /api/blog/markdown?action=tags` - Get all tags
- `GET /api/blog/markdown?action=availability` - Check if markdown blog posts are available

## Content Migration

The project includes tools for migrating Markdown content to Sanity CMS:

```bash
# Migrate Markdown to Sanity CMS
npm run migrate:blog
```

### Migration Features

- **Content Preservation**: Maintains all metadata, formatting, and structure
- **Automatic Conversion**: Transforms Markdown to Portable Text format
- **Asset Management**: Handles image uploads and references
- **SEO Optimization**: Generates SEO-friendly titles, descriptions, and keywords
- **Author & Category Creation**: Automatically creates missing authors and categories
- **CTA Integration**: Adds intelligent CTA placements based on content analysis
- **Error Handling**: Comprehensive error reporting and recovery mechanisms

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Contact

For questions or support, please contact [info@aviatorstrainingcentre.com](mailto:info@aviatorstrainingcentre.com).