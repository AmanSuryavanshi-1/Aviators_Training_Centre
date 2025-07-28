# Sanity-Exclusive Blog API Endpoints

This directory contains the new Sanity-exclusive API endpoints that replace the unified blog service. All endpoints only interact with Sanity CMS as the single source of truth for blog content.

## Overview

The API follows RESTful conventions and returns consistent JSON responses with the following structure:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
    source: 'sanity';
    cached?: boolean;
    count?: number;
  };
}
```

## Endpoints

### Blog Posts

#### `GET /api/blog/posts`
Fetch all blog posts from Sanity CMS.

**Query Parameters:**
- `limit` (optional): Number of posts to return (1-100, default: 50)
- `offset` (optional): Number of posts to skip (default: 0)
- `featured` (optional): Filter by featured status (`true`/`false`)
- `category` (optional): Filter by category slug
- `includeUnpublished` (optional): Include unpublished posts (`true`/`false`, default: `false`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "post-id",
      "title": "Post Title",
      "slug": "post-slug",
      "publishedAt": "2024-01-01T00:00:00Z",
      "excerpt": "Post excerpt...",
      "readingTime": 5,
      "featured": false,
      "tags": ["tag1", "tag2"],
      "category": {
        "_id": "category-id",
        "title": "Category Title",
        "slug": "category-slug"
      },
      "author": {
        "_id": "author-id",
        "name": "Author Name",
        "slug": "author-slug"
      }
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123",
    "source": "sanity",
    "count": 10,
    "hasMore": false
  }
}
```

#### `POST /api/blog/posts`
Create a new blog post in Sanity CMS.

**Request Body:**
```json
{
  "title": "New Post Title",
  "slug": {
    "current": "new-post-slug"
  },
  "excerpt": "Post excerpt...",
  "body": [
    {
      "_type": "block",
      "children": [
        {
          "_type": "span",
          "text": "Post content..."
        }
      ]
    }
  ],
  "category": {
    "_id": "category-id"
  },
  "author": {
    "_id": "author-id"
  },
  "featured": false,
  "tags": ["tag1", "tag2"]
}
```

#### `GET /api/blog/posts/[slug]`
Fetch a single blog post by slug.

**Response:** Full blog post object with all fields including body content.

#### `PUT /api/blog/posts/[slug]`
Update a blog post by slug.

**Request Body:** Partial blog post object with fields to update.

#### `DELETE /api/blog/posts/[slug]`
Delete a blog post by slug.

#### `GET /api/blog/posts/id/[id]`
Fetch a single blog post by ID (for admin operations).

#### `PUT /api/blog/posts/id/[id]`
Update a blog post by ID (for admin operations).

#### `DELETE /api/blog/posts/id/[id]`
Delete a blog post by ID (for admin operations).

#### `GET /api/blog/posts/[slug]/related`
Fetch related blog posts for a given post.

**Query Parameters:**
- `limit` (optional): Number of related posts to return (1-20, default: 3)
- `category` (optional): Override category for finding related posts

### Categories

#### `GET /api/blog/categories`
Fetch all blog categories from Sanity CMS.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category-id",
      "title": "Category Title",
      "slug": "category-slug",
      "description": "Category description...",
      "color": "#075E68"
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123",
    "source": "sanity",
    "count": 5
  }
}
```

### Authors

#### `GET /api/blog/authors`
Fetch all blog authors from Sanity CMS.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "author-id",
      "name": "Author Name",
      "slug": "author-slug",
      "role": "Chief Flight Instructor",
      "bio": [
        {
          "_type": "block",
          "children": [
            {
              "_type": "span",
              "text": "Author bio..."
            }
          ]
        }
      ]
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123",
    "source": "sanity",
    "count": 3
  }
}
```

### Utility Endpoints

#### `GET /api/blog/slugs`
Fetch all blog post slugs (useful for static generation).

**Response:**
```json
{
  "success": true,
  "data": {
    "slugs": ["post-1", "post-2", "post-3"],
    "paths": [
      { "params": { "slug": "post-1" } },
      { "params": { "slug": "post-2" } },
      { "params": { "slug": "post-3" } }
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123",
    "source": "sanity",
    "count": 3
  }
}
```

#### `GET /api/blog/health`
Health check endpoint for the blog system.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "responseTime": 150,
    "sanity": {
      "status": "healthy",
      "connection": true,
      "writeCapability": true,
      "performance": {
        "readLatency": 100,
        "writeLatency": 200
      },
      "configuration": {
        "projectId": "3u4fa9kl",
        "dataset": "production",
        "hasToken": true,
        "useCdn": true
      }
    },
    "metrics": {
      "posts": {
        "available": true,
        "count": 25
      },
      "categories": {
        "available": true,
        "count": 5
      },
      "authors": {
        "available": true,
        "count": 3
      }
    }
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": "Additional error details (optional)"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-123",
    "source": "sanity"
  }
}
```

### Common Error Codes

- `INVALID_SLUG`: Invalid or missing slug parameter
- `INVALID_POST_ID`: Invalid or missing post ID parameter
- `INVALID_LIMIT`: Limit parameter out of valid range
- `INVALID_OFFSET`: Negative offset parameter
- `INVALID_JSON`: Malformed JSON in request body
- `POST_NOT_FOUND`: Requested blog post not found
- `FETCH_ERROR`: Error fetching data from Sanity
- `CREATE_ERROR`: Error creating new blog post
- `UPDATE_ERROR`: Error updating blog post
- `DELETE_ERROR`: Error deleting blog post
- `VALIDATION_ERROR`: Data validation failed
- `INTERNAL_ERROR`: Unexpected server error

## Caching

All GET endpoints implement caching with appropriate TTL values:

- Blog posts: 5 minutes
- Categories: 10 minutes
- Authors: 10 minutes
- Related posts: 5 minutes
- Slugs: 5 minutes

Cache tags are used for selective invalidation when content is updated.

## Authentication

Write operations (POST, PUT, DELETE) require a valid Sanity API token with appropriate permissions. The token should be configured in the `SANITY_API_TOKEN` environment variable.

## Rate Limiting

The API relies on Sanity's built-in rate limiting. If you encounter rate limit errors (429 status), implement exponential backoff in your client code.

## Migration from Unified API

The new endpoints replace the following legacy endpoints:

- `/api/blog/unified` → `/api/blog/posts`
- `/api/blogs` → `/api/blog/posts`
- `/api/blogs/[id]` → `/api/blog/posts/id/[id]`

Update your client code to use the new endpoint structure and response format.