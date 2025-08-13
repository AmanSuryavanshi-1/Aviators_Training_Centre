# API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Integration Examples](#integration-examples)

## Overview

The Aviators Training Centre API provides endpoints for content management, analytics, monitoring, and integrations. All APIs are built using Next.js API routes and follow RESTful conventions.

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://aviatorstrainingcentre.in/api`

### Content Types
- **Request**: `application/json`
- **Response**: `application/json`

## Authentication

### Admin Authentication

Most administrative endpoints require JWT authentication:

```typescript
// Headers
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### API Key Authentication

Some endpoints use API key authentication:

```typescript
// Headers
{
  "X-API-Key": "<api_key>",
  "Content-Type": "application/json"
}
```

## API Endpoints

### System Health

#### GET /api/system/health
**Purpose**: Check system health and component status

**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "components": {
    "sanity": "healthy",
    "firebase": "healthy",
    "email": "healthy"
  },
  "uptime": 86400,
  "version": "1.0.0"
}
```

#### POST /api/system/health
**Purpose**: Reset circuit breakers or perform health checks

**Authentication**: Admin required

**Request Body**:
```json
{
  "action": "reset_circuit_breakers",
  "component": "sanity"
}
```

---

### Sanity CMS Integration

#### GET /api/sanity/health
**Purpose**: Check Sanity CMS connection and permissions

**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "connection": "active",
  "permissions": ["read", "write"],
  "dataset": "production",
  "projectId": "abc123"
}
```

#### POST /api/sanity/query
**Purpose**: Execute GROQ queries against Sanity

**Authentication**: Admin required

**Request Body**:
```json
{
  "query": "*[_type == 'blogPost'][0...10]",
  "params": {}
}
```

**Response**:
```json
{
  "result": [...],
  "ms": 45,
  "query": "*[_type == 'blogPost'][0...10]"
}
```

#### DELETE /api/sanity/delete
**Purpose**: Delete content from Sanity CMS

**Authentication**: Admin required

**Request Body**:
```json
{
  "documentId": "doc-123",
  "documentType": "blogPost"
}
```

#### POST /api/sanity/delete
**Purpose**: Bulk delete multiple documents

**Authentication**: Admin required

**Request Body**:
```json
{
  "documentIds": ["doc-123", "doc-456"],
  "documentType": "blogPost"
}
```

---

### Webhooks

#### POST /api/webhooks/sanity
**Purpose**: Handle Sanity CMS webhooks for content updates

**Authentication**: Webhook secret verification

**Request Body**:
```json
{
  "_type": "webhook",
  "event": "create",
  "document": {
    "_id": "doc-123",
    "_type": "blogPost",
    "title": "New Blog Post"
  }
}
```

**Response**:
```json
{
  "received": true,
  "processed": true,
  "revalidated": ["/blog", "/blog/new-post"]
}
```

#### GET /api/webhooks/sanity
**Purpose**: Webhook health check

**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "endpoint": "active",
  "lastProcessed": "2024-01-15T10:30:00Z"
}
```

---

### N8N Integration

#### POST /api/n8n/webhook
**Purpose**: Handle N8N automation webhooks

**Authentication**: Webhook secret verification

**Request Body**:
```json
{
  "automationId": "auto-123",
  "trigger": "content_update",
  "data": {
    "contentType": "blogPost",
    "action": "publish"
  }
}
```

#### GET /api/n8n/health
**Purpose**: N8N integration health check

**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "integrations": {
    "webhook": "active",
    "monitoring": "active"
  }
}
```

#### GET /api/n8n/monitoring/health
**Purpose**: Detailed N8N monitoring status

**Authentication**: Admin required

**Response**:
```json
{
  "status": "healthy",
  "metrics": {
    "totalAutomations": 15,
    "activeAutomations": 12,
    "failedAutomations": 1
  },
  "lastCheck": "2024-01-15T10:30:00Z"
}
```

---

### Analytics

#### GET /api/analytics/pageviews
**Purpose**: Get pageview analytics data

**Authentication**: Admin required

**Query Parameters**:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `page`: Optional page filter

**Response**:
```json
{
  "data": [
    {
      "page": "/blog/aviation-basics",
      "views": 1250,
      "uniqueViews": 980,
      "date": "2024-01-15"
    }
  ],
  "total": 15000,
  "period": "7d"
}
```

#### POST /api/analytics/track
**Purpose**: Track custom analytics events

**Authentication**: None required (public endpoint)

**Request Body**:
```json
{
  "event": "cta_click",
  "properties": {
    "ctaId": "book-demo-header",
    "page": "/courses/ppl",
    "userId": "anonymous-123"
  }
}
```

---

### Monitoring

#### GET /api/monitoring/uptime
**Purpose**: Get system uptime and availability metrics

**Authentication**: Admin required

**Response**:
```json
{
  "uptime": 99.9,
  "currentUptime": 86400,
  "incidents": [
    {
      "date": "2024-01-10T15:30:00Z",
      "duration": 300,
      "type": "service_degradation"
    }
  ]
}
```

#### POST /api/monitoring/uptime
**Purpose**: Record incident or maintenance

**Authentication**: Admin required

**Request Body**:
```json
{
  "type": "incident",
  "severity": "high",
  "description": "Database connection timeout",
  "startTime": "2024-01-15T10:30:00Z",
  "endTime": "2024-01-15T10:35:00Z"
}
```

---

### Preview System

#### GET /api/preview/[slug]
**Purpose**: Enable preview mode for draft content

**Authentication**: Preview token required

**Query Parameters**:
- `token`: Preview token
- `slug`: Content slug

**Response**:
```json
{
  "preview": true,
  "slug": "draft-blog-post",
  "expires": "2024-01-15T11:30:00Z"
}
```

#### DELETE /api/preview/[slug]
**Purpose**: Disable preview mode

**Authentication**: None required

**Response**:
```json
{
  "message": "Preview mode disabled"
}
```

---

### Testing Endpoints

#### GET /api/test/env
**Purpose**: Test environment variable loading (development only)

**Authentication**: Development environment only

**Response**:
```json
{
  "sanityConfigured": true,
  "firebaseConfigured": true,
  "emailConfigured": true,
  "environment": "development"
}
```

#### GET /api/test-sanity
**Purpose**: Test Sanity connection

**Authentication**: None required

**Response**:
```json
{
  "connected": true,
  "projectId": "abc123",
  "dataset": "production",
  "permissions": ["read", "write"]
}
```

## Data Models

### Blog Post
```typescript
interface BlogPost {
  _id: string;
  _type: 'blogPost';
  title: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  content: PortableTextBlock[];
  publishedAt: string;
  author: {
    name: string;
    image?: SanityImageAsset;
  };
  categories: Category[];
  tags: string[];
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}
```

### Analytics Event
```typescript
interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  page: string;
  userAgent: string;
  ip?: string;
}
```

### Health Check Response
```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  components: Record<string, ComponentHealth>;
  uptime: number;
  version: string;
  environment: string;
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123"
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

## Rate Limiting

### Default Limits
- **Public endpoints**: 100 requests per minute per IP
- **Admin endpoints**: 1000 requests per minute per user
- **Webhook endpoints**: 500 requests per minute per source

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

### Rate Limit Response
```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": 60
  }
}
```

## Integration Examples

### JavaScript/TypeScript Client

```typescript
class AviatorsCMSClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async getBlogPosts(limit = 10): Promise<BlogPost[]> {
    const response = await fetch(`${this.baseUrl}/api/sanity/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey })
      },
      body: JSON.stringify({
        query: `*[_type == 'blogPost'] | order(publishedAt desc)[0...${limit}]`
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  }

  async trackEvent(event: string, properties: Record<string, any>) {
    await fetch(`${this.baseUrl}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        properties
      })
    });
  }
}

// Usage
const client = new AviatorsCMSClient('https://aviatorstrainingcentre.in');
const posts = await client.getBlogPosts(5);
await client.trackEvent('page_view', { page: '/courses' });
```

### Webhook Integration

```typescript
// Express.js webhook handler example
app.post('/webhook/sanity', async (req, res) => {
  const signature = req.headers['x-sanity-signature'];
  
  // Verify webhook signature
  if (!verifySignature(req.body, signature)) {
    return res.status(401).send('Unauthorized');
  }

  const { event, document } = req.body;

  switch (event) {
    case 'create':
    case 'update':
      // Trigger cache invalidation
      await invalidateCache(document._type, document.slug?.current);
      break;
    case 'delete':
      // Handle content deletion
      await handleContentDeletion(document._id);
      break;
  }

  res.status(200).json({ received: true });
});
```

### Analytics Integration

```typescript
// Custom analytics tracking
class AnalyticsTracker {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async trackPageView(page: string, userId?: string) {
    await this.track('page_view', {
      page,
      timestamp: new Date().toISOString(),
      userId,
      userAgent: navigator.userAgent
    });
  }

  async trackCTAClick(ctaId: string, page: string) {
    await this.track('cta_click', {
      ctaId,
      page,
      timestamp: new Date().toISOString()
    });
  }

  private async track(event: string, properties: Record<string, any>) {
    try {
      await fetch(`${this.apiUrl}/api/analytics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event,
          properties
        })
      });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
    }
  }
}
```

---

**Note**: This API documentation covers the main endpoints discovered in the codebase. For the most up-to-date API information, refer to the source code in `src/app/api/` directory.