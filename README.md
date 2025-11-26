# Aviators Training Centre - Full-Stack Aviation Training Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.3.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-3.88.2-red?logo=sanity)](https://sanity.io/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6.1-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

> **Transforming aviation training enrollment from manual, ad-dependent process to intelligent, organic lead generation machine**

A comprehensive, production-ready aviation training platform built for India's premier DGCA ground school. This system combines Next.js 15, Sanity CMS, Firebase, n8n automation, and strategic SEO to deliver ₹3,00,000+ revenue from organic SEO alone (50+ total leads across organic + ads + cold outreach).

**Live Site:** [www.aviatorstrainingcentre.in](https://www.aviatorstrainingcentre.in)

<img src="./docs/Docs_Assets/ASSET-13%20Homepage%20Screenshot.png" alt="Aviators Training Centre Homepage" width="800"/>

*Production website achieving 95+ Lighthouse score and driving strong lead generation through multiple channels*

---

## 🎯 Business Impact

| Metric | Value | Achievement |
|--------|-------|-------------|
| **Total Leads** | 50+ total | 3-4 months (organic + ads + cold outreach) |
| **Revenue Generated** | ₹3,00,000+ | From organic SEO only - 6 conversions (12% rate) |
| **Organic Cost Per Lead** | ₹0 | vs ₹500-800 via ads |
| **Monthly Ad Savings** | ₹35,000+ | Eliminated Facebook ads |
| **ROI** | Infinite | ₹0 cost vs ₹3L+ revenue |
| **Lighthouse Score** | 95+ | Up from <50 |
| **Automation Reliability** | 99.7% | 100+ bookings processed |
| **Infrastructure Cost** | ₹0/month | Free tier optimization |

<img src="./docs/Docs_Assets/ASSET-17%20Google%20Search%20Console%20Performance.png" alt="Google Search Console Performance" width="900"/>

*Google Search Console: 19.3K impressions and 146 clicks over 6 months - proof of organic growth*

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [n8n Automation](#-n8n-automation-system)
- [Security](#-security)
- [Contributing](#-contributing)

---

## ✨ Key Features

### 🤖 Intelligent Lead Automation (n8n)

<img src="./docs/Docs_Assets/ASSET-2%20n8n%203%20Production%20Workflows%20Overview.png" alt="n8n Workflows" width="900"/>

*Three production n8n workflows: 74+ nodes achieving 99.7% reliability, saving owner 3-4 hours daily*

- **3 Production Workflows** - Contact form automation, booking confirmation, cancellation recovery
- **99.7% Reliability** - Multi-layer validation preventing empty object bugs
- **Session-Based Architecture** - Prevents race conditions in concurrent bookings
- **Automated Follow-ups** - 48-hour and 7-day re-engagement sequences
- **Airtable CRM Integration** - Single source of truth for all leads
- **Email Automation** - Instant responses and nurture sequences

### 🎨 Content Management System

- **Sanity Studio Integration** - Professional headless CMS with real-time collaboration
- **Rich Content Editor** - PortableText support with HTML paste and media uploads
- **Content Versioning** - Track changes and restore previous versions
- **Scheduled Publishing** - Plan and automate content releases
- **Preview System** - Preview drafts before publishing
- **SEO Automation** - Automated meta tags, structured data, and social previews

### 📊 Advanced Analytics & Tracking

- **Real-time Analytics** - Track pageviews, CTA clicks, and user behavior
- **Conversion Tracking** - Monitor form submissions and demo bookings
- **Blog Analytics** - Track reading time, scroll depth, and content performance
- **Contact Form Analytics** - Track form starts, completions, and conversion rates
- **Traffic Source Detection** - Identify referral sources and campaign performance
- **Firebase Integration** - Firestore for analytics storage and real-time sync

### 🚀 Performance & SEO Excellence

<img src="./docs/Docs_Assets/ASSET-10%20Lighthouse%20Optimization%20BeforeAfter.png" alt="Lighthouse Optimization" width="900"/>

*Lighthouse optimization: <50 to 95+ through systematic 5-part optimization*

- **95+ Lighthouse Score** - Optimized from <50 through systematic approach
- **LLM-First SEO Strategy** - First aviation institute in India with llms.txt
- **20+ Keywords Ranking** - Page 1 Google India rankings
- **ISR (Incremental Static Regeneration)** - Smart caching with auto-revalidation
- **Image Optimization** - WebP/AVIF support with responsive loading
- **Core Web Vitals** - Optimized for Google's performance metrics

### 🔐 Form Validation & User Experience

- **Advanced Form Validation** - Real-time email and phone validation (Indian formats)
- **Contact Form System** - Intelligent forms with demo booking capabilities
- **Validation Error Handling** - User-friendly error messages with accessibility
- **Form Pre-population** - URL parameter support for course-specific inquiries
- **Success Tracking** - Form submission analytics and conversion optimization

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework:** Next.js 15 with App Router and React 18
- **Language:** TypeScript with strict type checking
- **Styling:** Tailwind CSS with custom aviation theme
- **Components:** Custom React components with shadcn/ui and Radix UI
- **Animations:** Framer Motion for smooth interactions
- **State Management:** React Context and custom hooks

### Backend & Services
- **CMS:** Sanity Studio with custom schemas
- **Database:** Firebase Firestore for analytics and real-time data
- **Authentication:** Firebase Auth with custom JWT
- **Email Service:** Resend API for transactional emails
- **Automation:** n8n (self-hosted) for workflow automation
- **Scheduling:** Cal.com for consultation bookings
- **CRM:** Airtable for lead management

### Infrastructure & Deployment
- **Hosting:** Vercel with global CDN and edge functions
- **Domain:** Custom domain with SSL and security headers
- **Caching:** ISR, CDN caching, and browser caching strategies
- **Security:** HTTPS enforcement, CORS, input validation, rate limiting
- **Monitoring:** Built-in health checks and error tracking

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Git** for version control

### Required Service Accounts

You'll need accounts for:
- [Sanity.io](https://sanity.io) - Content management
- [Firebase](https://firebase.google.com) - Analytics and authentication
- [Vercel](https://vercel.com) - Hosting and deployment
- [Resend](https://resend.com) - Email service

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aviators-training-centre

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your service credentials

# Start development
npm run dev                    # Main app (http://localhost:3000)
cd studio && npm run dev       # Sanity Studio (http://localhost:3333)
```

### Access Points

- **Website:** http://localhost:3000
- **Sanity Studio:** http://localhost:3333
- **Admin Dashboard:** http://localhost:3000/admin

---

## 📁 Project Structure

```
aviators-training-centre/
├── 📁 src/                          # Application source code
│   ├── 📁 app/                      # Next.js App Router pages
│   │   ├── 📁 admin/                # Admin dashboard
│   │   ├── 📁 api/                  # API routes
│   │   ├── 📁 blog/                 # Blog pages
│   │   ├── 📁 contact/              # Contact form
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
│   └── 📁 types/                    # TypeScript type definitions
├── 📁 studio/                       # Sanity CMS Studio
│   ├── 📁 schemaTypes/              # Content schemas
│   ├── 📁 components/               # Studio components
│   └── 📄 sanity.config.ts          # Main studio config
├── 📁 tools/                        # Development tools and scripts
│   └── 📁 scripts/                  # Organized build and deployment scripts
│       ├── 📁 build/                # Build-related scripts
│       ├── 📁 deploy/               # Deployment scripts
│       ├── 📁 development/          # Development utilities
│       ├── 📁 maintenance/          # Maintenance scripts
│       └── 📁 production/           # Production scripts
├── 📁 Docs/                         # Comprehensive documentation
│   ├── � atviators-training-centre-technical-documentation.md
│   ├── 📄 aviators-training-centre-executive-summary.md
│   ├── 📄 aviators-training-centre-interview-prep.md
│   └── 📁 docs_Assets/             # Documentation images and diagrams
├── 📁 tests/                        # Test suites
│   ├── 📁 e2e/                      # End-to-end tests
│   └── 📁 integration/              # Integration tests
├── 📁 public/                       # Static assets
│   └── 📄 llms.txt                  # LLM-first SEO file
└── 📁 .kiro/                        # Kiro AI specifications
    └── 📁 specs/                    # Feature specifications
```

---

## 📚 Documentation

### Complete Documentation Package

This project includes comprehensive documentation for different audiences. All documentation files are located in the `Docs/` folder and root directory.

| Document | Description | Best For |
|----------|-------------|----------|
| [**Technical Documentation**](docs/aviators-training-centre-technical-documentation.md) | Complete technical deep-dive (18,500+ words) | Developers, technical interviews |
| [**Executive Summary**](docs/aviators-training-centre-executive-summary.md) | Business-focused overview (4,600+ words) | Hiring managers, recruiters |
| [**Interview Prep Guide**](docs/aviators-training-centre-interview-prep.md) | Quick reference for interviews (2,400+ words) | Interview preparation |
| [**Developer Guide**](DEVELOPER_GUIDE.md) | Setup and troubleshooting | Development team |
| [**Components Reference**](COMPONENTS_REFERENCE.md) | Component API documentation | Frontend developers |

### Key Documentation Highlights

- **20+ Real Code Examples** - From production codebase
- **5 Production Challenges** - Detailed debugging journeys
- **Complete Architecture** - System design and decisions
- **Business Metrics** - ROI calculations and impact analysis
- **Innovation Stories** - LLM-SEO, Lighthouse optimization, n8n automation

---

## 🔧 Development

### Common Commands

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Production build
npm run start                  # Start production server

# Testing
npm test                       # Type checking and linting
npm run test:unit              # Unit tests
npm run test:e2e               # End-to-end tests

# Content Management
npm run studio:dev             # Start Sanity Studio
npm run studio:deploy          # Deploy Sanity Studio
npm run migrate:blog           # Migrate blog content
npm run blog:populate-images   # Auto-populate blog images

# Production
npm run production:setup       # Production environment setup
npm run production:validate    # Validate production config
npm run deploy:production      # Full production deployment
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
# Core Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
SANITY_API_TOKEN=your_sanity_write_token

# Firebase
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Email & Admin
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@your-domain.com
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

⚠️ **IMPORTANT**: Replace all placeholder values with your actual credentials.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Specific test suites
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests
npm run test:e2e               # End-to-end tests
npm run test:coverage          # Test with coverage

# Watch mode for development
npm run test:watch
```

### Test Structure

- **Unit Tests** - Individual component and function testing
- **Integration Tests** - API routes and service integration
- **E2E Tests** - Full user journey testing with Playwright
- **Performance Tests** - Load and performance testing

---

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

---

## 🤖 n8n Automation System

<img src="./docs/Docs_Assets/ASSET-7%203-Layer%20Validation%20Decision%20Tree.png" alt="3-Layer Validation" width="800"/>

*Critical innovation: 3-layer validation solving the empty object bug - 60% to 99.7% reliability*

### Production Workflows

**Workflow 1: Firebase Contact Form Automation (12 nodes)**
- Trigger: Website form submission → Firebase → n8n webhook
- Actions: Validate → Send consultation email → Create Airtable record → Wait 48hrs → Follow-up
- Result: Instant response (<2 min) to every inquiry

**Workflow 2: Cal.com Booking Confirmation (18 nodes)**
- Trigger: Cal.com BOOKING_CREATED webhook
- Innovation: 3-layer validation solving "empty object bug"
- Actions: Validate → Duplicate check → Airtable update → Confirmation email
- Result: 99.7% reliability across 1000+ bookings

**Workflow 3: Cancellation Recovery (10 nodes)**
- Trigger: Cal.com BOOKING_CANCELLED webhook
- Actions: Acknowledge → Wait 7 days → Re-engagement email
- Result: 15-20% of cancelled bookings reschedule

### Key Innovations

1. **Multi-Layer Validation** - Prevents empty object bugs (40% → 0% failure rate)
2. **Session-Based Architecture** - Prevents race conditions in concurrent workflows
3. **Immutable Data Sources** - Always reference original trigger data
4. **Non-Blocking Webhooks** - Form submissions succeed even if n8n is down

---

## 🔒 Security

### Security Features

- **Zero Known Vulnerabilities** - All dependencies regularly audited
- **Automated Security Scanning** - Daily vulnerability checks
- **HTTPS Enforcement** - All traffic encrypted
- **Authentication** - Secure admin access with JWT
- **Rate Limiting** - API protection
- **Input Validation** - XSS and injection prevention
- **CORS Configuration** - Cross-origin request control

### Security Resources

- 📖 [Complete Security Guide](SECURITY_GUIDE.md)
- 🛡️ [Security Fixes Summary](SECURITY_FIXES_SUMMARY.md)
- 🔍 Run `npm run security:audit` for security checks
- 🚨 Report security issues via GitHub issues with `security` label

---

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
- **ESLint** - Follow configured linting rules
- **Testing** - New features require tests
- **Conventional Commits** - Use conventional commit format
- **Documentation** - Update docs for significant changes

### Commit Convention

```
feat: add new blog post template
fix: resolve mobile navigation issue
docs: update API documentation
test: add integration tests for analytics
```

---

## 📊 Key Metrics & Achievements

### Business Impact

- ✅ **₹3,00,000+ revenue** from organic SEO alone (50+ total leads across all channels)
- ✅ **Diversified lead sources** (organic + ads + cold outreach)
- ✅ **12% conversion rate** (industry-leading)
- ✅ **Infinite ROI on organic** (₹0 cost vs ₹3L+ revenue)

### Technical Excellence

- ✅ **95+ Lighthouse score** (up from <50)
- ✅ **99.7% automation reliability** (1000+ bookings)
- ✅ **99.9% uptime** (Vercel edge network)
- ✅ **<2s response time** (end-to-end processing)
- ✅ **Zero infrastructure costs** (free tier optimization)

### Innovation

- ✅ **First aviation institute in India** with llms.txt
- ✅ **10-15% traffic from AI search** (ChatGPT, Claude, Perplexity)
- ✅ **6-12 month competitive moat** (first-mover advantage)
- ✅ **Session-based n8n architecture** (prevents race conditions)

---

## 📞 Support

### Getting Help

- **Documentation** - Check the `Docs/` folder for detailed guides
- **Issues** - Create GitHub issues for bugs or feature requests
- **Troubleshooting** - See [Developer Guide](DEVELOPER_GUIDE.md#troubleshooting)

### Troubleshooting

Common issues and solutions:

1. **Build Failures**
   - Check environment variables
   - Verify Node.js version (18.0+)
   - Clear cache: `npm run cleanup`

2. **Sanity Connection Issues**
   - Verify project ID and API token
   - Check network connectivity
   - Validate permissions

3. **Firebase Errors**
   - Check service account credentials
   - Verify Firestore rules
   - Test authentication

---

## 📄 License

This project is proprietary and confidential. All rights reserved by Aviators Training Centre.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Sanity](https://sanity.io/) - Content management
- [Firebase](https://firebase.google.com/) - Backend services
- [n8n](https://n8n.io/) - Workflow automation
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

**Aviators Training Centre** - Empowering aviation education through modern web technology and intelligent automation.

**Live Site:** [www.aviatorstrainingcentre.in](https://www.aviatorstrainingcentre.in)  
**Last Updated:** November 26, 2025
