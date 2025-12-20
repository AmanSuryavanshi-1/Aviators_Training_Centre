# Data Flow Summary

> **How data moves through the system**

Last Updated: December 20, 2025

---

## Overview Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    (Browser/Device)                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Page View   │     │  Form Submit  │     │  Admin Login  │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Analytics   │     │  Contact API  │     │   Auth API    │
│    Client     │     │    Route      │     │    Route      │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   Firebase    │     │   Firebase    │     │     JWT       │
│   Firestore   │     │  Realtime DB  │     │   Session     │
│  (analytics)  │     │   (contacts)  │     │   (cookie)    │
└───────────────┘     └───────────────┘     └───────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │   N8N         │
                      │   Webhook     │
                      └───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  User Email   │     │  Admin Email  │     │  Follow-up    │
│ (Resend)      │     │ (Resend)      │     │   Sequence    │
└───────────────┘     └───────────────┘     └───────────────┘
```

---

## Content Flow (Sanity → Website)

```
┌─────────────────┐
│  Sanity Studio  │
│  (Content Edit) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Sanity CDN    │
│    (Cache)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js App    │
│  (ISR Cache)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vercel CDN    │
│  (Edge Cache)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      User       │
│   (Browser)     │
└─────────────────┘
```

**Cache Times**:
- Sanity CDN: Instant
- ISR Cache: 30 minutes (blog)
- Vercel CDN: 1 hour (HTML)

---

## Contact Form Flow

```
User fills form
       │
       ▼
Frontend validates
       │
       ▼
POST /api/contact ────────────┐
       │                      │
       ├──▶ Validate again    │
       │                      │
       ├──▶ Firebase ─────────┼──▶ Stores contact
       │                      │
       └──▶ N8N Webhook ──────┼──▶ Emails + Follow-up
       │                      │
       ▼                      │
Success response ◀────────────┘
       │
       ▼
"Thank you" shown
```

---

## Analytics Flow

```
User interaction
       │
       ▼
Analytics Client
       │
       ├──▶ Queue event
       │
       ├──▶ Batch (3 events)
       │
       └──▶ Flush to API
       │
       ▼
POST /api/analytics/events
       │
       ├──▶ Bot detection
       │
       ├──▶ Validate
       │
       └──▶ Firestore
       │
       ▼
Dashboard reads data
```

---

## Authentication Flow

```
Login request
       │
       ▼
POST /api/auth/login
       │
       ├──▶ Validate credentials
       │
       ├──▶ Check Sanity member
       │
       └──▶ Generate JWT
       │
       ▼
Set cookie (admin-session)
       │
       ▼
Redirect to /admin
       │
       ▼
Middleware checks JWT
       │
       ├──▶ Valid: Allow access
       │
       └──▶ Invalid: Redirect to login
```

---

## Email Flow

### Immediate Emails (on form submit)

```
Contact API
       │
       ├──▶ User confirmation ──▶ Resend ──▶ User inbox
       │
       └──▶ Admin notification ──▶ Resend ──▶ Owner inbox
```

### Follow-up Sequence (N8N)

```
User added to list
       │
       ▼
Wait 3 days
       │
       ▼
Email #1 sent
       │
       ▼
Wait 7 days
       │
       ▼
Email #2 sent
       │
       ▼
Wait 14 days
       │
       ▼
Email #3 sent (final)
```

---

## Database Relationships

```
Firebase Realtime DB
├── contacts/
│   └── {contactId}
│       ├── name
│       ├── email
│       ├── phone
│       ├── message
│       ├── utm_source
│       └── timestamp

Firebase Firestore
├── analytics_events/
│   └── {eventId}
│       ├── type
│       ├── page
│       ├── userId
│       ├── sessionId
│       └── timestamp
│
├── user_sessions/
│   └── {sessionId}
│       ├── startTime
│       ├── pageViews
│       └── source
│
└── traffic_sources/
    └── {sourceId}
        ├── source
        ├── visits
        └── conversions

Sanity CMS
├── post
│   ├── title
│   ├── body
│   ├── author ──▶ reference to author
│   └── category ──▶ reference to category
│
├── author
│   ├── name
│   └── bio
│
└── category
    ├── title
    └── description
```

---

## API Request Flow

```
Client Request
       │
       ▼
Vercel Edge Network
       │
       ├──▶ Static? Return from CDN
       │
       └──▶ Dynamic? Route to function
       │
       ▼
Next.js API Route
       │
       ├──▶ Middleware (auth check)
       │
       ├──▶ Validation
       │
       ├──▶ Business Logic
       │
       └──▶ External Services
       │         ├── Firebase
       │         ├── Sanity
       │         ├── Resend
       │         └── N8N
       │
       ▼
JSON Response
```

---

## Quick Reference

| Data Type | Storage | Access Pattern |
|-----------|---------|----------------|
| Blog content | Sanity | ISR (30 min cache) |
| Contact forms | Firebase Realtime | Direct write |
| Analytics | Firestore | Batched writes, aggregated reads |
| Sessions | JWT cookie | Stateless |
| Images | Sanity CDN | Long cache (1 year) |
| Static assets | Vercel CDN | Immutable cache |

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [API Integration](API_INTEGRATION.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [N8N Data Flow](n8n/CONTACT_FORM_DATA_FLOW.md)
