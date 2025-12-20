# Architecture Overview

> **System design and structure of Aviators Training Centre**

Last Updated: December 20, 2025

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                     │
│  Browser → Next.js App (Vercel Edge Network)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                   │
│  Next.js 15 App Router │ React 18 │ TypeScript │ Tailwind CSS           │
│  ├── Server Components (SEO, Data fetching)                             │
│  ├── Client Components (Interactivity)                                  │
│  └── API Routes (Backend logic)                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   CONTENT (CMS)     │ │   DATA STORAGE      │ │   AUTOMATION        │
│   Sanity.io         │ │   Firebase          │ │   N8N               │
│   ├── Blog posts    │ │   ├── Realtime DB   │ │   ├── Webhooks      │
│   ├── Authors       │ │   │   (Contacts)    │ │   ├── Email seq     │
│   ├── Categories    │ │   └── Firestore     │ │   └── Follow-ups    │
│   └── CTAs          │ │       (Analytics)   │ │                     │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   EMAIL SERVICE     │ │   ANALYTICS         │ │   SCHEDULING        │
│   Resend            │ │   GA4 + Meta Pixel  │ │   Cal.com           │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15.4.8 | App Router, SSR, ISR |
| **Language** | TypeScript 5.5 | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | Radix UI + shadcn/ui | Accessible components |
| **State** | React Query | Server state management |
| **Forms** | React Hook Form + Zod | Form handling |
| **Animation** | Framer Motion | Animations |
| **CMS** | Sanity.io | Headless CMS |
| **Database** | Firebase (Realtime DB + Firestore) | Data storage |
| **Email** | Resend | Transactional email |
| **Automation** | N8N | Workflow automation |
| **Analytics** | GA4, Meta Pixel, Vercel | Tracking |
| **Hosting** | Vercel | Edge deployment |

---

## Directory Structure

```
Aviators_Training_Centre/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── about/              # About page
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes (150+ endpoints)
│   │   ├── blog/               # Blog pages
│   │   ├── contact/            # Contact page
│   │   ├── courses/            # Courses pages
│   │   ├── faq/                # FAQ page
│   │   ├── instructors/        # Instructors page
│   │   └── testimonials/       # Testimonials page
│   │
│   ├── components/             # React components (200+)
│   │   ├── admin/              # Admin dashboard (12 files)
│   │   ├── analytics/          # Analytics (23 files)
│   │   ├── features/           # Feature components (70 files)
│   │   │   ├── blog/           # Blog components (46 files)
│   │   │   ├── contact/        # Contact forms (8 files)
│   │   │   ├── courses/        # Course cards (9 files)
│   │   │   └── lead-generation/# Lead gen (6 files)
│   │   ├── layout/             # Layout components
│   │   ├── shared/             # Shared utilities (24 files)
│   │   └── ui/                 # UI primitives (49 files)
│   │
│   ├── hooks/                  # Custom React hooks (18 files)
│   │
│   ├── lib/                    # Core libraries (221 files)
│   │   ├── analytics/          # Analytics services (53 files)
│   │   ├── auth/               # Authentication (12 files)
│   │   ├── blog/               # Blog utilities (44 files)
│   │   ├── firebase/           # Firebase config (5 files)
│   │   ├── image-optimization/ # Image optimization (6 files)
│   │   ├── monitoring/         # System monitoring (13 files)
│   │   ├── n8n/                # N8N integration (9 files)
│   │   ├── sanity/             # Sanity client (7 files)
│   │   └── seo/                # SEO utilities (3 files)
│   │
│   └── types/                  # TypeScript types (2 files)
│
├── studio/                     # Sanity Studio
│   ├── schemaTypes/            # Content schemas (18 files)
│   ├── components/             # Studio components (31 files)
│   └── plugins/                # Studio plugins (6 files)
│
├── public/                     # Static assets
│   ├── Blogs/                  # Blog images
│   ├── Courses/                # Course images
│   └── Instructor/             # Instructor images
│
├── docs/                       # Documentation
│
└── atc-n8n-meeting-scheduler/  # N8N workflows
```

---

## Request Flow

### Page Request (SSR/ISR)
```
User Request → Vercel Edge → Next.js Server
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
            Server Component             Cached Response?
            (Data Fetching)                    │
                    │                          │ Yes
                    ▼                          ▼
            Sanity/Firebase              Return Cached
                    │
                    ▼
            Render HTML
                    │
                    ▼
            Cache (ISR: 30min)
                    │
                    ▼
            Return to User
```

### API Request
```
Client Request → API Route → Business Logic
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               Firebase       Sanity        External
                                             Services
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
                          JSON Response
```

### Contact Form Flow
```
User Fills Form → Frontend Validation → POST /api/contact
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            Server Validation          Firebase Storage          N8N Webhook
                    │                         │                         │
                    ▼                         ▼                         ▼
            Resend Email              Contact Saved             Email Sequence
            (Confirmation)                                       Triggered
                    │
                    ▼
            Success Response
```

---

## Component Architecture

### Server vs Client Components

| Type | Use Cases | Examples |
|------|-----------|----------|
| **Server** | Data fetching, SEO, Static content | `page.tsx`, Layout |
| **Client** | Interactivity, State, Effects | Forms, Modals, Analytics |

### Component Organization

```
components/
├── ui/                 # Primitive components (Button, Input, Card)
│   └── 49 components   # Built on Radix UI + shadcn/ui
│
├── shared/             # Reusable across features
│   └── 24 components   # WhatsApp, Modals, Providers
│
├── features/           # Feature-specific
│   ├── blog/           # Blog (36 components)
│   ├── contact/        # Contact forms (8 components)
│   ├── courses/        # Courses (9 components)
│   └── lead-generation/# Lead gen (6 components)
│
├── admin/              # Admin dashboard
│   └── 12 components   # Analytics, Dashboards
│
└── analytics/          # Tracking components
    └── 23 components   # UTM, Events, Metrics
```

---

## Data Flow

### Content (Sanity → Frontend)
```
Sanity Studio → Sanity CDN → Next.js → React Components
     │              │
     │              └── Cached (CDN + ISR)
     │
     └── Webhook → Cache Invalidation
```

### Analytics (Frontend → Firebase)
```
User Action → Analytics Client → API Route → Firestore
                  │
                  └── Batch (3 events, 30s flush)
```

### Email (Form → User)
```
Form Submit → API Route → Resend → User Inbox
                  │
                  └── N8N Webhook → Follow-up Sequence
```

---

## Caching Strategy

| Resource | Cache Type | Duration | Invalidation |
|----------|------------|----------|--------------|
| Static Assets | CDN | 1 year | Build |
| Images | Next.js Image | 1 year | Build |
| Blog Posts | ISR | 30 min | Webhook |
| API Responses | Stale-while-revalidate | 1 min | Time-based |
| Analytics | No cache | - | - |

### ISR Configuration
```typescript
// Blog pages
export const revalidate = 1800; // 30 minutes

// Static pages
export const revalidate = 3600; // 1 hour
```

---

## Security Architecture

### Authentication Flow
```
Login Request → Credentials Check → JWT Generation
                                         │
                                         ▼
                                   Cookie Set
                                   (admin-session)
                                         │
                                         ▼
Protected Route → Middleware → JWT Validation
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
              Valid Token                    Invalid/Expired
              (Continue)                     (Redirect Login)
```

### Security Headers
```javascript
// next.config.mjs
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

## External Service Integration

| Service | Purpose | Integration Point |
|---------|---------|-------------------|
| **Sanity** | CMS | `src/lib/sanity/client.ts` |
| **Firebase** | Database | `src/lib/firebase.js` |
| **Resend** | Email | `src/app/api/contact/route.ts` |
| **N8N** | Automation | `src/lib/n8n/contact-webhook.ts` |
| **GA4** | Analytics | `src/app/layout.tsx` |
| **Meta Pixel** | Ads | `src/app/layout.tsx` |
| **Vercel** | Hosting | `vercel.json` |
| **Cal.com** | Scheduling | N8N workflows |

---

## Related Documentation

- [Component Architecture](COMPONENT_ARCHITECTURE.md)
- [API Integration](API_INTEGRATION.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [N8N Overview](n8n/OVERVIEW.md)
