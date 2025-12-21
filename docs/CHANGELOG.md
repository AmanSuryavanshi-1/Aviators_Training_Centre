# Documentation Changelog

> **Track documentation updates and additions**

---

## [1.1.0] - December 21, 2025

### Performance Improvements (LCP Optimization)

#### Improvements
- **Mobile LCP Optimization** - Fixed 10s+ LCP delay by implementing `StaticHero` server component.
- **Hero Image Preload** - Corrected `layout.tsx` preload URL mismatch (q=60 -> q=85).
- **Font Loading Strategy** - Added `preload: true` to primary fonts in `fonts.ts`.
- **Hybrid Rendering Pattern** - Implemented "Static-to-Dynamic" hydration pattern in `page.tsx` for instant perceived load.

#### Changed
- **src/app/page.tsx** - Added `StaticHero` loading state and dynamic imports.
- **src/components/features/courses/HeroSection.tsx** - Optimized image loading attributes.
- **src/app/layout.tsx** - Fixed image preload tags.
- **src/lib/fonts.ts** - Optimized font delivery.

---

## [1.0.0] - December 20, 2025

### Initial Documentation Release

Complete documentation suite for Aviators Training Centre codebase.

---

### Added

#### Core Architecture (8 documents)
- **FEATURE_INVENTORY.md** - Complete feature catalog with file references
- **ARCHITECTURE_OVERVIEW.md** - System design diagrams and tech stack
- **COMPONENT_ARCHITECTURE.md** - React component patterns and organization
- **API_INTEGRATION.md** - External service integrations
- **DATABASE_SCHEMA.md** - Sanity CMS and Firebase schemas
- **IMPLEMENTATION_PATTERNS.md** - Code patterns and best practices
- **DEPLOYMENT_RUNBOOK.md** - Deployment process and configuration
- **PERFORMANCE_TUNING.md** - Optimization strategies and metrics

#### Feature Guides (10 documents)
- **features/seo-implementation.md** - SEO and AI crawler optimization
- **features/analytics-system.md** - Multi-source analytics tracking
- **features/form-validation.md** - Client and server validation
- **features/blog-system.md** - Sanity CMS blog integration
- **features/cms-sanity.md** - Headless CMS configuration
- **features/image-optimization.md** - Next.js image optimization
- **features/authentication.md** - JWT authentication and security
- **features/admin-dashboard.md** - Analytics dashboard components
- **features/email-service.md** - Resend email integration
- **features/performance-optimization.md** - Core Web Vitals optimization

#### N8N Automation (3 documents)
- **n8n/OVERVIEW.md** - High-level N8N system explanation
- **n8n/CONTACT_FORM_DATA_FLOW.md** - Form submission data flow
- **n8n/WORKFLOWS_SUMMARY.md** - All active workflows reference

#### Supporting Documentation (4 documents)
- **troubleshooting/COMMON_ISSUES.md** - Troubleshooting guide
- **QUICK_START_DEVELOPER.md** - Quick start for new developers
- **DATA_FLOW_SUMMARY.md** - Data flow diagrams
- **CHANGELOG.md** - This file

#### README Updates
- Added N8N Automation section
- Added quick links to all documentation

---

### Documentation Standards

All documentation follows these standards:
- ✅ Code-focused with real file references
- ✅ Scannable with tables and headers
- ✅ Beginner-friendly explanations
- ✅ ASCII diagrams for visual clarity
- ✅ Links between related documents

---

## How to Update This Changelog

When adding or modifying documentation:

1. Add entry under new version header
2. Use categories: Added, Changed, Deprecated, Removed, Fixed
3. Include date and brief description
4. Link to affected files

Example:
```markdown
## [1.1.0] - YYYY-MM-DD

### Added
- **new-feature.md** - Description of new documentation

### Changed
- **existing-doc.md** - Updated X section with Y information

### Fixed
- **broken-doc.md** - Fixed broken link to Z
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 20, 2025 | Initial documentation release (27 documents) |
