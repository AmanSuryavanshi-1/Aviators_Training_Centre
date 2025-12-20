# Database Schema

> **Data structures for Sanity CMS and Firebase**

Last Updated: December 20, 2025

---

## Overview

| Database | Purpose | Data Types |
|----------|---------|------------|
| **Sanity CMS** | Content management | Blog posts, authors, courses, CTAs |
| **Firebase Realtime DB** | Form submissions | Contact form data |
| **Firebase Firestore** | Analytics | Events, sessions, traffic sources |

---

## Sanity CMS Schemas

### Schema Types (18 total)

```
studio/schemaTypes/
├── postType.tsx           # Blog posts (925 lines)
├── authorType.ts          # Authors
├── categoryType.ts        # Categories
├── tagType.ts             # Tags
├── courseType.ts          # Courses
├── ctaTemplateType.ts     # CTA templates
├── ctaPerformanceType.ts  # CTA analytics
├── approvalWorkflowType.ts # Content approval
├── workflowType.ts        # Workflow automation
├── notificationType.ts    # System notifications
├── editorNotificationType.ts # Editor notifications
├── teamCommunicationType.ts # Team messages
├── permissionChangeLogType.ts # Permission audit
├── automationAuditLogType.ts # Automation logs
├── automationErrorLogType.ts # Error logs
└── ...more
```

---

### Post Schema (Blog)

```typescript
// studio/schemaTypes/postType.tsx
defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    // SEO Status (Custom component)
    defineField({
      name: 'seoStatus',
      title: 'SEO Status',
      type: 'object',
      components: { input: RealTimeSEOAnalyzer },
    }),

    // Content Fields
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(10).max(70),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(160),
    }),

    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
      ],
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),

    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },     // Rich text
        { type: 'image' },     // Images
        { type: 'callout' },   // Callout boxes
        { type: 'codeBlock' }, // Code snippets
        { type: 'htmlBlock' }, // Raw HTML
      ],
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),

    // SEO Fields
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      validation: (rule) => rule.max(60),
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      validation: (rule) => rule.max(160),
    }),

    defineField({
      name: 'focusKeyphrase',
      title: 'Focus Keyphrase',
      type: 'string',
    }),
  ],
})
```

---

### Author Schema

```typescript
defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' } }),
    defineField({ name: 'image', type: 'image' }),
    defineField({ name: 'bio', type: 'text' }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ name: 'socialLinks', type: 'array', of: [
      { type: 'object', fields: [
        { name: 'platform', type: 'string' },
        { name: 'url', type: 'url' },
      ]}
    ]},
  ],
})
```

---

### Category Schema

```typescript
defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'icon', type: 'string' }),
  ],
})
```

---

### CTA Template Schema

```typescript
defineType({
  name: 'ctaTemplate',
  title: 'CTA Template',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'type', type: 'string', options: {
      list: ['inline', 'banner', 'popup', 'sidebar'],
    }}),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'buttonText', type: 'string' }),
    defineField({ name: 'buttonUrl', type: 'url' }),
    defineField({ name: 'targetCategories', type: 'array', 
      of: [{ type: 'reference', to: [{ type: 'category' }] }]
    }),
    defineField({ name: 'isActive', type: 'boolean', initialValue: true }),
  ],
})
```

---

## Firebase Realtime Database

### Contacts Collection

**Path**: `/contacts/{contactId}`

```typescript
interface Contact {
  // Contact Information
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;

  // UTM Tracking
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  referrer: string;
  landing_page: string;
  source_description: string;

  // Metadata
  timestamp: ServerTimestamp;
  submitted_at: string; // ISO date
}
```

### Example Data

```json
{
  "contacts": {
    "-NxYz123abc": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "subject": "CPL Training Inquiry",
      "message": "I want to learn more about CPL ground school",
      "utm_source": "google",
      "utm_medium": "organic",
      "referrer": "https://google.com",
      "timestamp": 1703001600000,
      "submitted_at": "2024-12-20T10:00:00.000Z"
    }
  }
}
```

---

## Firebase Firestore (Analytics)

### Collections

```
firestore/
├── analytics_events     # Raw event data
├── user_sessions        # Session tracking
├── traffic_sources      # Source aggregation
└── realtime_analytics   # Live metrics
```

---

### Analytics Events Collection

**Path**: `analytics_events/{eventId}`

```typescript
interface AnalyticsEvent {
  userId?: string;
  sessionId: string;
  timestamp: Timestamp;
  
  event: {
    type: 'page_view' | 'conversion' | 'interaction' | 'form_submission';
    page: string;
    data?: Record<string, any>;
  };

  source: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
    category: string; // 'organic', 'paid', 'social', 'direct'
  };

  user: {
    ip?: string;
    userAgent: string;
    device: {
      type: 'desktop' | 'mobile' | 'tablet';
      browser: string;
      os: string;
    };
  };

  validation: {
    isValid: boolean;
    isBot: boolean;
    confidence: number;
    flags: string[];
  };
}
```

---

### User Sessions Collection

**Path**: `user_sessions/{sessionId}`

```typescript
interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: Timestamp;
  lastActivity: Timestamp;
  
  source: {
    utm_source?: string;
    utm_medium?: string;
    referrer?: string;
    category: string;
  };

  user: {
    device: string;
    browser: string;
    os: string;
  };

  landingPage: string;
  currentPage: string;
  pageViews: number;
  duration: number; // seconds

  status: 'active' | 'ended';
  endTime?: Timestamp;
  outcome?: 'conversion' | 'exit' | 'bounce';
}
```

---

### Traffic Sources Collection

**Path**: `traffic_sources/{sourceId}`

```typescript
interface TrafficSource {
  source: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
  category: string;
  
  firstSeen: Timestamp;
  lastSeen: Timestamp;
  
  totalVisits: number;
  totalConversions: number;
}
```

---

### Realtime Analytics Collection

**Path**: `realtime_analytics/{snapshotId}`

```typescript
interface RealtimeAnalytics {
  timestamp: Timestamp;
  activeUsers: number;
  currentPageViews: number;
  
  topPages: Array<{
    page: string;
    views: number;
  }>;
  
  topSources: Array<{
    source: string;
    visitors: number;
  }>;
  
  alerts: Array<{
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
  }>;
}
```

---

## Data Relationships

### Sanity References

```
┌─────────────┐     ┌─────────────┐
│    Post     │────▶│   Author    │
└─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐
       └───────────▶│  Category   │
       │            └─────────────┘
       │
       │            ┌─────────────┐
       └───────────▶│    Tags     │ (many)
                    └─────────────┘
```

### Firebase Data Flow

```
Form Submission
       │
       ▼
┌─────────────────┐
│ Realtime DB     │
│ (contacts)      │
└─────────────────┘
       │
       ▼
┌─────────────────┐     ┌─────────────────┐
│ N8N Webhook     │────▶│ Airtable CRM    │
└─────────────────┘     └─────────────────┘


Page View Event
       │
       ▼
┌─────────────────┐
│ Analytics Client │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│ Firestore       │
│ (analytics_events)
└─────────────────┘
       │
       ├──▶ user_sessions (aggregated)
       │
       └──▶ traffic_sources (aggregated)
```

---

## Data Validation

### Sanity Validation Rules

```typescript
// Title: 10-70 characters
validation: (rule) => rule.required().min(10).max(70)

// Slug: Required, auto-generated
validation: (rule) => rule.required()

// Excerpt: Max 160 characters (SEO)
validation: (rule) => rule.max(160)

// SEO Title: Max 60 characters
validation: (rule) => rule.max(60)

// SEO Description: Max 160 characters
validation: (rule) => rule.max(160)
```

### Firebase Validation (Server-side)

```typescript
// Contact form validation
if (!name || !email || !subject || !message) {
  return { error: 'Missing required fields' };
}

// Email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return { error: 'Invalid email format' };
}

// Phone format (Indian)
const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
if (phone && !phoneRegex.test(phone.replace(/\s/g, ''))) {
  return { error: 'Invalid phone format' };
}
```

---

## Indexes & Queries

### Sanity GROQ Examples

```groq
// All posts with category
*[_type == "post"] {
  ...,
  "category": category->title
}

// Posts by category
*[_type == "post" && category->slug.current == $categorySlug]

// Search posts
*[_type == "post" && (
  title match $query ||
  excerpt match $query
)]
```

### Firestore Indexes

```javascript
// Required composite indexes
// 1. analytics_events: timestamp DESC, event.type
// 2. user_sessions: startTime DESC, status
// 3. traffic_sources: totalVisits DESC, source
```

---

## Related Documentation

- [API Integration](API_INTEGRATION.md)
- [CMS Integration](features/cms-sanity.md)
- [Analytics System](features/analytics-system.md)
