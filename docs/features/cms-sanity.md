# CMS Sanity Integration

> **Headless CMS configuration, schemas, and content management**

Last Updated: December 20, 2025

---

## Overview

Sanity CMS provides:
- 18 content schema types
- Real-time content preview
- SEO analysis in editor
- Approval workflows
- GROQ query language

---

## Current Implementation

### Architecture

```
Sanity CMS
├── Studio (Admin UI)
│   ├── Content editing
│   ├── Media management
│   ├── Real-time preview
│   └── SEO analyzer
│
├── Schemas (18 types)
│   ├── Content: Post, Author, Category, Tag
│   ├── Business: Course, CTA Template
│   ├── Workflow: Approval, Notification
│   └── Analytics: CTA Performance
│
├── Client (Frontend)
│   ├── Enhanced client with retry
│   ├── GROQ queries
│   └── CDN caching
│
└── Integration
    ├── Webhooks
    └── Image CDN
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/sanity/client.ts` | Enhanced Sanity client |
| `src/lib/sanity/queries.ts` | GROQ query definitions |
| `studio/sanity.config.ts` | Studio configuration |
| `studio/schemaTypes/` | 18 schema definitions |

---

## Configuration

### Sanity Client

```typescript
// src/lib/sanity/client.ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '3u4fa9kl',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: true, // Enable CDN for faster reads
};

export const client = createClient(config);

// Image URL builder
const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
```

### Enhanced Client with Retry

```typescript
// src/lib/sanity/client.ts
export class EnhancedSanityClient {
  private static maxRetries = 3;
  private static retryDelay = 1000;

  static async fetchWithRetry<T>(
    query: string,
    params?: object
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await client.fetch<T>(query, params);
        return result;
      } catch (error) {
        lastError = error as Error;
        console.error(`Sanity fetch attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.maxRetries - 1) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw lastError || new Error('Failed to fetch from Sanity');
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async validateConnection(): Promise<boolean> {
    try {
      await client.fetch('*[_type == "post"][0]._id');
      return true;
    } catch {
      return false;
    }
  }
}
```

### Studio Configuration

```typescript
// studio/sanity.config.ts
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'aviators-training-centre',
  title: 'Aviators Training Centre',
  projectId: '3u4fa9kl',
  dataset: 'production',
  
  plugins: [
    deskTool(),
    visionTool(), // GROQ playground
  ],
  
  schema: {
    types: schemaTypes,
  },
});
```

---

## Schema Types

### Post Schema (Main Content)

```typescript
// studio/schemaTypes/postType.tsx
import { defineType, defineField } from 'sanity';

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content' },
    { name: 'seo', title: 'SEO' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    // SEO Status (Custom component)
    defineField({
      name: 'seoStatus',
      title: 'SEO Status',
      type: 'object',
      group: 'content',
      components: { input: RealTimeSEOAnalyzer },
      fields: [{ name: 'placeholder', type: 'string', hidden: true }],
    }),

    // Title
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().min(10).max(70),
    }),

    // Slug
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),

    // Excerpt
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      validation: (rule) => rule.max(160),
      description: 'Brief summary for listings and SEO',
    }),

    // Featured Image
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        { name: 'alt', type: 'string', title: 'Alt Text' },
      ],
    }),

    // Category
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'content',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),

    // Tags
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'content',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),

    // Author
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'content',
      to: [{ type: 'author' }],
    }),

    // Body (Rich Content)
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      group: 'content',
      of: [
        { type: 'block' },      // Rich text
        { type: 'image' },      // Images
        { type: 'callout' },    // Callout boxes
        { type: 'codeBlock' },  // Code snippets
        { type: 'htmlBlock' },  // Raw HTML
      ],
    }),

    // Published Date
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'settings',
    }),

    // SEO Fields
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      validation: (rule) => rule.max(60),
    }),

    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      group: 'seo',
      validation: (rule) => rule.max(160),
    }),

    defineField({
      name: 'focusKeyphrase',
      title: 'Focus Keyphrase',
      type: 'string',
      group: 'seo',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'image',
    },
    prepare({ title, author, media }) {
      return {
        title,
        subtitle: author ? `by ${author}` : '',
        media,
      };
    },
  },
});
```

### Author Schema

```typescript
// studio/schemaTypes/authorType.ts
export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' } }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', type: 'text', rows: 4 }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ 
      name: 'socialLinks', 
      type: 'array', 
      of: [{
        type: 'object',
        fields: [
          { name: 'platform', type: 'string' },
          { name: 'url', type: 'url' },
        ],
      }],
    }),
  ],
});
```

### Category Schema

```typescript
// studio/schemaTypes/categoryType.ts
export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'icon', type: 'string' }),
    defineField({ name: 'color', type: 'string' }),
  ],
});
```

### CTA Template Schema

```typescript
// studio/schemaTypes/ctaTemplateType.ts
export const ctaTemplateType = defineType({
  name: 'ctaTemplate',
  title: 'CTA Template',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ 
      name: 'type', 
      type: 'string',
      options: {
        list: ['inline', 'banner', 'popup', 'sidebar'],
      },
    }),
    defineField({ name: 'headline', type: 'string' }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'buttonText', type: 'string' }),
    defineField({ name: 'buttonUrl', type: 'url' }),
    defineField({ 
      name: 'targetCategories', 
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({ name: 'isActive', type: 'boolean', initialValue: true }),
  ],
});
```

---

## GROQ Queries

### Common Queries

```typescript
// src/lib/sanity/queries.ts
import { groq } from 'next-sanity';

// All published posts
export const allPostsQuery = groq`
  *[_type == "post" && publishedAt != null] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    "author": author->{name, image},
    "category": category->{title, slug},
    "image": image.asset->url
  }
`;

// Single post by slug
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    body,
    publishedAt,
    "author": author->{name, bio, image, role},
    "category": category->{title, slug},
    "tags": tags[]->{title, slug},
    "image": image.asset->url,
    seoTitle,
    seoDescription
  }
`;

// Posts by category
export const postsByCategoryQuery = groq`
  *[_type == "post" && category->slug.current == $categorySlug] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    "image": image.asset->url
  }
`;

// All categories
export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description,
    "postCount": count(*[_type == "post" && references(^._id)])
  }
`;

// Active CTAs
export const activeCtasQuery = groq`
  *[_type == "ctaTemplate" && isActive == true] {
    _id,
    name,
    type,
    headline,
    description,
    buttonText,
    buttonUrl,
    "targetCategories": targetCategories[]->slug.current
  }
`;
```

---

## How to Use

### Fetch Data in Server Component

```typescript
// src/app/blog/page.tsx
import { client } from '@/lib/sanity/client';
import { allPostsQuery } from '@/lib/sanity/queries';

export default async function BlogPage() {
  const posts = await client.fetch(allPostsQuery);
  return <BlogList posts={posts} />;
}
```

### Use Image URL Builder

```typescript
import { urlFor } from '@/lib/sanity/client';

// Generate optimized image URL
const imageUrl = urlFor(post.image)
  .width(800)
  .height(450)
  .format('webp')
  .url();
```

### Access Sanity Studio

1. Navigate to `/studio`
2. Login with Sanity account
3. Edit content in the dashboard

---

## Environment Variables

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=3u4fa9kl
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

---

## Extension Guide

### Adding New Schema Type

```typescript
// 1. Create schema file
// studio/schemaTypes/testimonialType.ts
export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string' }),
    defineField({ name: 'role', type: 'string' }),
    defineField({ name: 'quote', type: 'text' }),
    defineField({ name: 'rating', type: 'number', validation: r => r.min(1).max(5) }),
  ],
});

// 2. Add to schema index
// studio/schemaTypes/index.ts
export const schemaTypes = [
  // ...existing types
  testimonialType,
];
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Content not updating | Check ISR revalidation, clear cache |
| Images not loading | Verify `remotePatterns` in next.config |
| GROQ errors | Use Vision tool to debug queries |
| Studio not loading | Check project ID and dataset |

---

## Related Documentation

- [Blog System](blog-system.md)
- [API Integration](../API_INTEGRATION.md)
- [Database Schema](../DATABASE_SCHEMA.md)
