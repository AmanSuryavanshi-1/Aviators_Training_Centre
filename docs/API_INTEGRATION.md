# API Integration

> **External services, endpoints, and integration patterns**

Last Updated: December 20, 2025

---

## External Services Overview

| Service | Purpose | Integration File |
|---------|---------|------------------|
| **Sanity CMS** | Content management | `src/lib/sanity/client.ts` |
| **Firebase Realtime DB** | Contact form storage | `src/lib/firebase.js` |
| **Firebase Firestore** | Analytics storage | `src/lib/firebase/collections.ts` |
| **Resend** | Transactional email | `src/app/api/contact/route.ts` |
| **N8N** | Workflow automation | `src/lib/n8n/contact-webhook.ts` |
| **Google Analytics 4** | Website analytics | `src/app/layout.tsx` |
| **Meta Pixel** | Facebook ads tracking | `src/app/layout.tsx` |
| **Vercel** | Hosting & edge functions | `vercel.json` |
| **Cal.com** | Meeting scheduling | N8N workflows |

---

## Sanity CMS Integration

### Configuration

```typescript
// src/lib/sanity/client.ts
import { createClient } from '@sanity/client';

const config = {
  projectId: '3u4fa9kl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // Enable CDN for read operations
};

export const client = createClient(config);
```

### Enhanced Client with Retry Logic

```typescript
// Error handling with retry
export class EnhancedSanityClient {
  private static maxRetries = 3;
  private static retryDelay = 1000;

  static async fetchWithRetry<T>(query: string, params?: object): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await client.fetch<T>(query, params);
      } catch (error) {
        lastError = error;
        await this.delay(this.retryDelay * (attempt + 1));
      }
    }
    
    throw lastError;
  }
}
```

### GROQ Queries

```typescript
// src/lib/sanity/queries.ts

// Get all published blog posts
export const allPostsQuery = groq`
  *[_type == "post" && publishedAt != null] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    "author": author->name,
    "category": category->title,
    "image": image.asset->url
  }
`;

// Get single post by slug
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    body,
    publishedAt,
    "author": author->{name, bio, image},
    "category": category->{title, slug},
    "tags": tags[]->title
  }
`;
```

### Environment Variables
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=3u4fa9kl
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

---

## Firebase Integration

### Realtime Database (Contact Forms)

```typescript
// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
```

### Saving Contact Form

```typescript
// src/app/api/contact/route.ts
import { ref, push, serverTimestamp } from 'firebase/database';

const contactsRef = ref(db, 'contacts');
const newContactRef = await push(contactsRef, {
  name,
  email,
  phone,
  subject,
  message,
  utm_source,
  utm_medium,
  utm_campaign,
  timestamp: serverTimestamp(),
});
```

### Firestore (Analytics)

```typescript
// src/lib/firebase/collections.ts
import { getFirestore, collection, addDoc } from 'firebase/firestore';

export class AnalyticsEventsService {
  private static collection = db.collection('analytics_events');

  static async createEvent(eventData: {
    userId?: string;
    sessionId: string;
    event: {
      type: 'page_view' | 'conversion' | 'interaction';
      page: string;
      data?: any;
    };
  }) {
    return await addDoc(this.collection, {
      ...eventData,
      timestamp: serverTimestamp(),
    });
  }
}
```

---

## Resend Email Integration

### Configuration

```typescript
// src/app/api/contact/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
```

### Sending Emails

```typescript
// User confirmation email
await resend.emails.send({
  from: `Aviators Training Centre <${process.env.FROM_EMAIL}>`,
  to: [userEmail],
  subject: 'Thank you for contacting Aviators Training Centre',
  html: userConfirmationTemplate,
});

// Owner notification (batch send)
await resend.emails.send({
  from: `Aviators Training Centre <${process.env.FROM_EMAIL}>`,
  to: [process.env.OWNER1_EMAIL, process.env.OWNER2_EMAIL],
  subject: `New Contact Form Submission from ${name}`,
  html: ownerNotificationTemplate,
});
```

### Email Templates

Templates are embedded in `src/app/api/contact/route.ts`:
- `user-confirmation` - Sent to user after form submission
- `owner-notification` - Sent to owners with form details

### Environment Variables
```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@aviatorstrainingcentre.in
OWNER1_EMAIL=owner1@example.com
OWNER2_EMAIL=owner2@example.com
```

---

## N8N Webhook Integration

### Triggering Webhook

```typescript
// src/lib/n8n/contact-webhook.ts
import axios from 'axios';

export async function triggerContactFormWebhook(
  formData: ContactFormData,
  formId: string
): Promise<void> {
  const webhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL;
  const authToken = process.env.N8N_WEBHOOK_AUTH_TOKEN;

  const payload = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    subject: formData.subject,
    message: formData.message,
    timestamp: new Date().toISOString(),
    formId,
    isDemoBooking: formData.subject?.toLowerCase().includes('demo'),
  };

  try {
    await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      timeout: 5000, // 5 second timeout
    });
  } catch (error) {
    // Log but don't throw - webhook failures shouldn't break form
    console.error('Webhook failed:', error);
  }
}
```

### Non-Blocking Pattern

```typescript
// Webhook is called but doesn't block form submission
if (newContactRef?.key) {
  // Fire and forget - don't await
  triggerContactFormWebhook(formData, newContactRef.key).catch(console.error);
}
```

---

## Google Analytics 4 Integration

### Script Loading

```typescript
// src/app/layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XSRFEJCB7N"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XSRFEJCB7N');
  `}
</Script>
```

### Event Tracking

```typescript
// Client-side event
export function trackEvent(eventName: string, params?: object) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Usage
trackEvent('form_submission', {
  form_type: 'contact',
  source: 'homepage',
});
```

---

## Meta Pixel Integration

### Script Loading

```typescript
// src/app/layout.tsx
<Script id="meta-pixel" strategy="afterInteractive">
  {`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1982191385652109');
    fbq('track', 'PageView');
  `}
</Script>
```

### Event Tracking

```typescript
// Track conversion
export function trackFBEvent(eventName: string, params?: object) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
}

// Usage
trackFBEvent('Lead', {
  content_name: 'Contact Form',
  content_category: 'Lead Generation',
});
```

---

## API Routes Structure

### Internal API Endpoints

```
src/app/api/
├── analytics/              # 38 endpoints
│   ├── route.ts           # Main analytics
│   ├── events/route.ts    # Event tracking
│   ├── dashboard/route.ts # Dashboard data
│   └── export/route.ts    # Data export
│
├── blog/                   # 14 endpoints
│   ├── route.ts           # Blog posts
│   ├── [slug]/route.ts    # Single post
│   └── search/route.ts    # Search
│
├── contact/route.ts        # Contact form
│
├── n8n/                    # N8N webhook handlers
│   ├── webhook/route.ts   # Incoming webhooks
│   └── status/route.ts    # Workflow status
│
├── sanity/                 # Sanity proxy
│   └── route.ts           # CORS-enabled proxy
│
└── health/route.ts         # Health check
```

### API Route Pattern

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');

  try {
    const formData = await req.json();
    
    // Validation
    if (!formData.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers }
      );
    }

    // Business logic
    // ...

    return NextResponse.json(
      { message: 'Success' },
      { status: 200, headers }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500, headers }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return new NextResponse(null, { status: 204, headers });
}
```

---

## Environment Variables Summary

```bash
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=3u4fa9kl
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_DATABASE_URL=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx

# Resend Email
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@aviatorstrainingcentre.in
OWNER1_EMAIL=xxx
OWNER2_EMAIL=xxx

# N8N
N8N_CONTACT_WEBHOOK_URL=https://xxx
N8N_WEBHOOK_AUTH_TOKEN=xxx

# Admin Auth
ADMIN_JWT_SECRET=xxx

# Site
NEXT_PUBLIC_SITE_URL=https://www.aviatorstrainingcentre.in
```

---

## Error Handling Patterns

### Timeout Protection

```typescript
// Prevent hanging requests
const savePromise = push(contactsRef, data);
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), 10000)
);

await Promise.race([savePromise, timeoutPromise]);
```

### Graceful Degradation

```typescript
// Continue even if webhook fails
try {
  await triggerWebhook(data);
} catch (error) {
  console.error('Webhook failed, continuing...');
  // Form submission still succeeds
}
```

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [N8N Overview](n8n/OVERVIEW.md)
