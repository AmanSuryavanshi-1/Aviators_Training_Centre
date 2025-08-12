# API Documentation

This document provides comprehensive information about the Aviators Training Centre Blog System API endpoints.

## 🌐 Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://www.aviatorstrainingcentre.in`

## 🔐 Authentication

### Admin Authentication

Admin endpoints require JWT authentication:

```bash
# Login to get token
POST /api/auth/login
{
  "username": "admin",
  "password": "your_password"
}

# Use token in subsequent requests
Authorization: Bearer <jwt_token>
```

### API Key Authentication

Some endpoints support API key authentication:

```bash
# Include in headers
X-API-Key: your_api_key
```

## 📊 Analytics API

### Track Pageview

Records a page visit for analytics.

**Endpoint:** `POST /api/analytics/pageview`

**Request Body:**
```json
{
  "postSlug": "string",
  "userId": "string",
  "sessionId": "string",
  "referrer": "string (optional)",
  "userAgent": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example:**
```bash
curl -X POST https://www.aviatorstrainingcentre.in/api/analytics/pageview \
  -H "Content-Type: application/json" \
  -d '{
    "postSlug": "flight-training-basics",
    "userId": "user_123",
    "sessionId": "session_456",
    "referrer": "https://google.com"
  }'
```

### Track CTA Click

Records a call-to-action button click.

**Endpoint:** `POST /api/analytics/cta`

**Request Body:**
```json
{
  "postSlug": "string",
  "ctaPosition": "number",
  "ctaType": "string",
  "userId": "string",
  "sessionId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Example:**
```bash
curl -X POST https://www.aviatorstrainingcentre.in/api/analytics/cta \
  -H "Content-Type: application/json" \
  -d '{
    "postSlug": "flight-training-basics",
    "ctaPosition": 1,
    "ctaType": "course-signup",
    "userId": "user_123",
    "sessionId": "session_456"
  }'
```

### Track Contact Visit

Records a visit to the contact page.

**Endpoint:** `POST /api/analytics/contactVisit`

**Request Body:**
```json
{
  "source": "string",
  "referrerSlug": "string (optional)",
  "userId": "string",
  "sessionId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Track Form Submission

Records a form submission event.

**Endpoint:** `POST /api/analytics/formSubmission`

**Request Body:**
```json
{
  "formType": "string",
  "source": "string",
  "userId": "string",
  "sessionId": "string",
  "formData": "object (optional, sanitized)"
}
```

**Response:**
```json
{
  "success": true,
  "eventId": "string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Analytics Data

Retrieves aggregated analytics data (Admin only).

**Endpoint:** `GET /api/analytics/data`

**Query Parameters:**
- `startDate` - ISO date string (optional)
- `endDate` - ISO date string (optional)
- `postSlug` - Filter by specific post (optional)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pageviews": {
      "total": 1000,
      "today": 50,
      "thisWeek": 300,
      "thisMonth": 800
    },
    "ctaClicks": {
      "total": 100,
      "conversionRate": 10.0
    },
    "topPosts": [
      {
        "slug": "flight-training-basics",
        "title": "Flight Training Basics",
        "views": 500,
        "ctaClicks": 50,
        "conversionRate": 10.0
      }
    ],
    "timeSeriesData": [
      {
        "date": "2024-01-01",
        "pageviews": 100,
        "ctaClicks": 10,
        "conversions": 2
      }
    ]
  }
}
```

## 📝 Blog API

### Get All Posts

Retrieves a list of published blog posts.

**Endpoint:** `GET /api/blog/posts`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Posts per page (default: 10, max: 50)
- `category` - Filter by category slug
- `tag` - Filter by tag slug
- `featured` - Filter featured posts (true/false)
- `search` - Search in title and content

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "post_id",
        "title": "Flight Training Basics",
        "slug": {
          "current": "flight-training-basics"
        },
        "excerpt": "Learn the fundamentals...",
        "mainImage": {
          "asset": {
            "_ref": "image_ref"
          },
          "alt": "Flight training image"
        },
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "readingTime": 5,
        "category": {
          "title": "Training",
          "slug": {
            "current": "training"
          },
          "color": "#3B82F6"
        },
        "tags": [
          {
            "title": "Basics",
            "slug": {
              "current": "basics"
            }
          }
        ],
        "author": {
          "name": "John Doe",
          "slug": {
            "current": "john-doe"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Single Post

Retrieves a single blog post by slug.

**Endpoint:** `GET /api/blog/posts/[slug]`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "post_id",
    "title": "Flight Training Basics",
    "slug": {
      "current": "flight-training-basics"
    },
    "seoTitle": "Complete Guide to Flight Training Basics",
    "seoDescription": "Learn everything you need to know...",
    "focusKeyword": "flight training",
    "mainImage": {
      "asset": {
        "_ref": "image_ref"
      },
      "alt": "Flight training image"
    },
    "content": [
      {
        "_type": "block",
        "children": [
          {
            "_type": "span",
            "text": "Flight training is essential..."
          }
        ]
      }
    ],
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "readingTime": 5,
    "wordCount": 1200,
    "featuredOnHome": true,
    "ctaPositions": [300, 600, 900],
    "category": {
      "title": "Training",
      "slug": {
        "current": "training"
      }
    },
    "tags": [
      {
        "title": "Basics",
        "slug": {
          "current": "basics"
        }
      }
    ],
    "author": {
      "name": "John Doe",
      "slug": {
        "current": "john-doe"
      },
      "image": {
        "asset": {
          "_ref": "image_ref"
        }
      },
      "bio": "Experienced flight instructor..."
    }
  }
}
```

### Get Featured Posts

Retrieves posts marked as featured.

**Endpoint:** `GET /api/blog/featured`

**Query Parameters:**
- `limit` - Number of posts (default: 3, max: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "post_id",
      "title": "Flight Training Basics",
      "slug": {
        "current": "flight-training-basics"
      },
      "excerpt": "Learn the fundamentals...",
      "mainImage": {
        "asset": {
          "_ref": "image_ref"
        }
      },
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "readingTime": 5,
      "category": {
        "title": "Training",
        "color": "#3B82F6"
      }
    }
  ]
}
```

### Get Categories

Retrieves all blog categories.

**Endpoint:** `GET /api/blog/categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "title": "Flight Training",
      "slug": {
        "current": "flight-training"
      },
      "description": "Everything about flight training",
      "color": "#3B82F6",
      "postCount": 25
    }
  ]
}
```

### Get Tags

Retrieves all blog tags.

**Endpoint:** `GET /api/blog/tags`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "tag_id",
      "title": "Basics",
      "slug": {
        "current": "basics"
      },
      "description": "Basic concepts and fundamentals",
      "postCount": 15
    }
  ]
}
```

## 📧 Contact API

### Submit Contact Form

Handles contact form submissions.

**Endpoint:** `POST /api/contact`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string (optional)",
  "subject": "string",
  "message": "string",
  "source": "string (optional)",
  "captcha": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message. We'll get back to you soon!",
  "submissionId": "string"
}
```

**Example:**
```bash
curl -X POST https://www.aviatorstrainingcentre.in/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Flight Training Inquiry",
    "message": "I am interested in learning more about your flight training programs.",
    "source": "blog"
  }'
```

## 🔗 Webhook API

### Sanity Webhook

Handles content updates from Sanity CMS.

**Endpoint:** `POST /api/webhooks/sanity`

**Headers:**
```
Content-Type: application/json
sanity-webhook-signature: <signature>
```

**Request Body:**
```json
{
  "_type": "post",
  "_id": "post_id",
  "title": "Post Title",
  "slug": {
    "current": "post-slug"
  },
  "webhook": {
    "event": "create|update|delete|publish|unpublish"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "actions": [
    "cache_invalidated",
    "rebuild_triggered"
  ]
}
```

## 🏥 Health Check API

### System Health

Checks the health of all system components.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 50
    },
    "sanity": {
      "status": "healthy",
      "responseTime": 100
    },
    "firebase": {
      "status": "healthy",
      "responseTime": 75
    },
    "email": {
      "status": "healthy",
      "responseTime": 200
    }
  },
  "version": "1.0.0",
  "uptime": 86400
}
```

### Detailed Health Check

Provides detailed system information (Admin only).

**Endpoint:** `GET /api/health/detailed`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "system": {
    "nodeVersion": "18.17.0",
    "nextVersion": "14.0.0",
    "memoryUsage": {
      "rss": 100000000,
      "heapTotal": 50000000,
      "heapUsed": 30000000
    },
    "uptime": 86400
  },
  "services": {
    "sanity": {
      "status": "healthy",
      "projectId": "abc123",
      "dataset": "production",
      "responseTime": 100
    },
    "firebase": {
      "status": "healthy",
      "projectId": "aviators-training",
      "responseTime": 75
    },
    "email": {
      "status": "healthy",
      "provider": "resend",
      "responseTime": 200
    }
  },
  "cache": {
    "status": "healthy",
    "hitRate": 85.5,
    "size": "50MB"
  }
}
```

## 🔐 Authentication API

### Admin Login

Authenticates admin users and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "username": "admin",
    "role": "administrator"
  },
  "expiresIn": 3600
}
```

### Verify Token

Verifies JWT token validity.

**Endpoint:** `GET /api/auth/verify`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "username": "admin",
    "role": "administrator"
  },
  "expiresAt": "2024-01-01T01:00:00.000Z"
}
```

### Logout

Invalidates JWT token.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 🔍 Search API

### Search Posts

Searches blog posts by title, content, and metadata.

**Endpoint:** `GET /api/search`

**Query Parameters:**
- `q` - Search query (required)
- `limit` - Results limit (default: 10, max: 50)
- `category` - Filter by category
- `tag` - Filter by tag

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "post_id",
        "title": "Flight Training Basics",
        "slug": {
          "current": "flight-training-basics"
        },
        "excerpt": "Learn the fundamentals...",
        "relevanceScore": 0.95,
        "matchedFields": ["title", "content"]
      }
    ],
    "total": 25,
    "query": "flight training",
    "executionTime": 50
  }
}
```

## 📊 Admin API

### Get Dashboard Data

Retrieves admin dashboard data (Admin only).

**Endpoint:** `GET /api/admin/dashboard`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPosts": 100,
      "publishedPosts": 85,
      "draftPosts": 15,
      "totalViews": 50000,
      "totalUsers": 1000
    },
    "recentPosts": [
      {
        "_id": "post_id",
        "title": "Recent Post",
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "views": 500
      }
    ],
    "analytics": {
      "pageviews": {
        "today": 100,
        "thisWeek": 700,
        "thisMonth": 3000
      },
      "topPosts": [
        {
          "slug": "popular-post",
          "title": "Popular Post",
          "views": 1000
        }
      ]
    },
    "systemHealth": {
      "status": "healthy",
      "services": {
        "sanity": "healthy",
        "firebase": "healthy",
        "email": "healthy"
      }
    }
  }
}
```

## 🚨 Error Responses

All API endpoints return consistent error responses:

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400) - Invalid request data
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - Service temporarily unavailable

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": "The email field must contain a valid email address"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔒 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Analytics endpoints:** 100 requests per 15 minutes per IP
- **Contact form:** 5 submissions per hour per IP
- **Search:** 60 requests per minute per IP
- **Admin endpoints:** 1000 requests per hour per authenticated user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 📝 Request/Response Examples

### JavaScript/Fetch

```javascript
// Track pageview
const trackPageview = async (postSlug) => {
  try {
    const response = await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postSlug,
        userId: getUserId(),
        sessionId: getSessionId(),
        referrer: document.referrer
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('Pageview tracked:', data.eventId)
    }
  } catch (error) {
    console.error('Failed to track pageview:', error)
  }
}

// Get blog posts
const getBlogPosts = async (page = 1, category = null) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '10'
  })
  
  if (category) {
    params.append('category', category)
  }
  
  try {
    const response = await fetch(`/api/blog/posts?${params}`)
    const data = await response.json()
    
    if (data.success) {
      return data.data
    }
  } catch (error) {
    console.error('Failed to fetch posts:', error)
  }
}
```

### Node.js/Axios

```javascript
const axios = require('axios')

// Submit contact form
const submitContactForm = async (formData) => {
  try {
    const response = await axios.post('/api/contact', {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      source: 'website'
    })
    
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.data)
    } else {
      console.error('Network Error:', error.message)
    }
    throw error
  }
}

// Get analytics data (admin)
const getAnalyticsData = async (token, startDate, endDate) => {
  try {
    const response = await axios.get('/api/analytics/data', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        startDate,
        endDate
      }
    })
    
    return response.data.data
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    throw error
  }
}
```

## 🔧 SDK and Libraries

### Official JavaScript SDK

```javascript
import { BlogAPI } from '@aviators/blog-sdk'

const api = new BlogAPI({
  baseURL: 'https://www.aviatorstrainingcentre.in',
  apiKey: 'your_api_key' // Optional for public endpoints
})

// Get posts
const posts = await api.posts.getAll({ category: 'training' })

// Track analytics
await api.analytics.trackPageview({
  postSlug: 'flight-training-basics',
  userId: 'user_123'
})

// Submit contact form
await api.contact.submit({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello!'
})
```

## 📚 Additional Resources

- [Sanity GROQ Documentation](https://www.sanity.io/docs/groq)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [JWT Authentication Guide](https://jwt.io/introduction)

## 🆘 Support

For API support:
- Check the [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- Review error messages and status codes
- Test with the provided examples
- Contact the development team for assistance

---

This API documentation is automatically updated with each release. For the latest version, check the project repository.