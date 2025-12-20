# Feature Inventory

> **Complete inventory of all features in the Aviators Training Centre codebase**

Last Updated: December 20, 2025

---

## Quick Navigation

| Feature | Priority | Status | Key Files |
|---------|----------|--------|-----------|
| [SEO Implementation](#1-seo-implementation) | HIGH | ✅ Production | `layout.tsx`, `robots.ts` |
| [Analytics System](#2-analytics-system) | HIGH | ✅ Production | `src/lib/analytics/` |
| [Blog System](#3-blog-system) | HIGH | ✅ Production | `src/lib/blog/` |
| [Form Validation](#4-form-validation) | HIGH | ✅ Production | `validation.ts` |
| [CMS (Sanity)](#5-cms-sanity-integration) | MEDIUM | ✅ Production | `src/lib/sanity/` |
| [Admin Dashboard](#6-admin-dashboard) | MEDIUM | ✅ Production | `src/components/admin/` |
| [Email Service](#7-email-service) | MEDIUM | ✅ Production | `api/contact/route.ts` |
| [Authentication](#8-authentication--security) | MEDIUM | ✅ Production | `src/lib/auth/` |
| [Image Optimization](#9-image-optimization) | MEDIUM | ✅ Production | `src/lib/image-optimization/` |
| [N8N Automation](#10-n8n-automation) | HIGH | ✅ Production | `src/lib/n8n/` |

---

## 1. SEO Implementation

**Purpose**: Optimize website for search engines and AI crawlers

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with meta tags, Open Graph, structured data |
| `src/app/robots.ts` | Dynamic robots.txt with AI crawler rules |
| `src/lib/seo/blog-seo-optimizer.ts` | Blog post SEO metadata generation |
| `next-sitemap.config.js` | Sitemap generation configuration |
| `public/sitemap.xml` | Generated XML sitemap |
| `public/llms.txt` | AI/LLM crawler information file |

### Features
- Comprehensive meta tag management
- JSON-LD structured data for EducationalOrganization
- AI crawler optimization (GPTBot, Claude, Anthropic, CCBot)
- Dynamic sitemap generation with priority settings
- Canonical URL management
- Open Graph and Twitter Card support

### External Services
- Google Search Console (verification: `aE_FqlD0SbJberIaVs7Xe0flcsZF9gojWQg0BCQhiBc`)

**Detailed Guide**: [features/seo-implementation.md](features/seo-implementation.md)

---

## 2. Analytics System

**Purpose**: Track user behavior, conversions, and traffic sources

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/analytics/client.ts` | Client-side tracking singleton |
| `src/lib/analytics/conversion-tracking.ts` | Conversion event tracking |
| `src/lib/analytics/botDetection.ts` | Bot detection and filtering |
| `src/lib/analytics/userJourneyTracker.ts` | User journey analytics |
| `src/lib/firebase/collections.ts` | Firestore collections for analytics |
| `src/components/analytics/UTMTracker.tsx` | UTM parameter tracking |
| `src/app/api/analytics/` | 38 analytics API endpoints |

### Features
- Multi-source tracking (GA4, Firebase, Meta Pixel, Vercel Analytics)
- Bot detection with confidence scoring
- Conversion tracking and ROI calculation
- User journey analytics
- Traffic source categorization
- Real-time dashboard data
- Data export (CSV/Excel)

### External Services
- Google Analytics 4 (ID: `G-XSRFEJCB7N`)
- Firebase Firestore
- Meta Pixel (ID: `1982191385652109`)
- Vercel Analytics

**Detailed Guide**: [features/analytics-system.md](features/analytics-system.md)

---

## 3. Blog System

**Purpose**: Content management and blog post rendering

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/blog/index.ts` | Main blog API exports |
| `src/lib/blog/api.ts` | Blog data fetching functions |
| `src/lib/blog/sanity-blog-service.ts` | Sanity CMS integration |
| `src/lib/blog/cta-routing.ts` | Intelligent CTA routing |
| `src/app/blog/page.tsx` | Blog listing page |
| `src/app/blog/[slug]/page.tsx` | Dynamic blog post page |
| `src/components/features/blog/` | 36 blog components |
| `studio/schemaTypes/postType.tsx` | Sanity blog post schema |

### Features
- Sanity CMS integration with GROQ queries
- PortableText content rendering
- Featured posts carousel
- Dynamic CTA integration based on content
- Category and tag filtering
- Related posts recommendations
- Reading progress tracking
- Social sharing
- SEO optimization per post

**Detailed Guide**: [features/blog-system.md](features/blog-system.md)

---

## 4. Form Validation

**Purpose**: Validate contact forms and user input

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/validation.ts` | Core validation utilities |
| `src/hooks/use-form-validation.ts` | React validation hook |
| `src/app/api/contact/route.ts` | Contact form API with validation |
| `src/components/features/contact/ContactFormCard.tsx` | Contact form UI |
| `src/components/features/contact/ValidationError.tsx` | Error display component |

### Features
- Email format validation with domain checking
- Indian phone number validation (+91, 10-digit)
- Real-time error display
- Field-level and form-level validation
- UTM tracking integration
- Server-side re-validation

**Detailed Guide**: [features/form-validation.md](features/form-validation.md)

---

## 5. CMS (Sanity Integration)

**Purpose**: Headless CMS for content management

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/sanity/client.ts` | Enhanced Sanity client with retry logic |
| `src/lib/sanity/queries.ts` | GROQ query definitions |
| `src/lib/sanity/service.ts` | Sanity service layer |
| `studio/sanity.config.ts` | Sanity Studio configuration |
| `studio/schemaTypes/` | 18 schema type definitions |

### Schema Types (18 total)
- `postType.tsx` - Blog posts
- `authorType.ts` - Authors  
- `categoryType.ts` - Categories
- `tagType.ts` - Tags
- `courseType.ts` - Courses
- `ctaTemplateType.ts` - CTA templates
- `approvalWorkflowType.ts` - Content approval
- `workflowType.ts` - Workflow automation
- `notificationType.ts` - Notifications

**Detailed Guide**: [features/cms-sanity.md](features/cms-sanity.md)

---

## 6. Admin Dashboard

**Purpose**: Analytics visualization and content management

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/components/admin/AdvancedAnalyticsDashboard.tsx` | Main dashboard (1655 lines) |
| `src/components/admin/AdminLayout.tsx` | Admin layout wrapper |
| `src/components/admin/AdminLogin.tsx` | Login page |
| `src/components/admin/UTMAnalyticsDashboard.tsx` | UTM tracking dashboard |
| `src/components/admin/N8nMonitoringDashboard.tsx` | N8N workflow monitoring |

### Features
- Real-time analytics visualization
- Traffic source analysis
- Conversion tracking
- Bot detection reports
- Date range filtering
- Data export (CSV/Excel)

**Detailed Guide**: [features/admin-dashboard.md](features/admin-dashboard.md)

---

## 7. Email Service

**Purpose**: Transactional email sending

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/contact/route.ts` | Main email sending logic |
| Email templates embedded in route file | HTML email templates |

### Features
- Resend API integration
- User confirmation emails
- Owner notification emails (2 recipients)
- HTML email templates
- Rate limit handling with fallback

**Detailed Guide**: [features/email-service.md](features/email-service.md)

---

## 8. Authentication & Security

**Purpose**: Admin authentication and route protection

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth/jwtService.ts` | JWT token generation/validation |
| `middleware.ts` | Route protection middleware |
| `src/lib/auth/adminAuth.ts` | Admin authentication |
| `src/lib/auth/sessionService.ts` | Session management |

### Features
- JWT-based authentication
- Role-based access (administrator/editor)
- Session persistence
- Security headers

**Detailed Guide**: [features/authentication.md](features/authentication.md)

---

## 9. Image Optimization

**Purpose**: Optimize images for performance

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/image-optimization/index.ts` | Library exports |
| `src/lib/image-optimization/ImageLazyLoadService.ts` | Lazy loading service |
| `src/lib/image-optimization/PerformanceImageProvider.tsx` | React context provider |
| `next.config.mjs` | Next.js image configuration |

### Features
- Next.js Image optimization
- Lazy loading with IntersectionObserver
- AVIF/WebP format support
- Connection-aware quality

**Detailed Guide**: [features/image-optimization.md](features/image-optimization.md)

---

## 10. N8N Automation

**Purpose**: Automated email sequences and lead processing

**Status**: ✅ Production Ready

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/n8n/init.ts` | Automation system initialization |
| `src/lib/n8n/contact-webhook.ts` | Contact form webhook trigger |
| `src/app/api/n8n/` | N8N webhook endpoints |
| `atc-n8n-meeting-scheduler/` | N8N workflow definitions |

### Workflows
1. **Contact Form → Email + Storage** - Immediate response
2. **Follow-up Email Sequence** - Days 3, 10, 24
3. **Cancellation Processing** - Unsubscribe handling

**Detailed Guide**: [n8n/OVERVIEW.md](n8n/OVERVIEW.md)

---

## Statistics Summary

| Metric | Count |
|--------|-------|
| Total Features | 10 |
| Production Ready | 10 |
| API Endpoints | 150+ |
| React Components | 200+ |
| Sanity Schema Types | 18 |
| Custom Hooks | 18 |
| Analytics Services | 53 |
| Blog Components | 36 |

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [Component Architecture](COMPONENT_ARCHITECTURE.md)
- [API Integration](API_INTEGRATION.md)
- [N8N Overview](n8n/OVERVIEW.md)
