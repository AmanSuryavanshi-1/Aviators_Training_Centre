# SEO Implementation

> **Search engine optimization and AI crawler strategy**

Last Updated: December 20, 2025

---

## Overview

The SEO implementation achieves **95+ Lighthouse SEO score** through:
- Comprehensive meta tag management
- JSON-LD structured data
- AI crawler optimization (GPTBot, Claude, Anthropic)
- Dynamic sitemap generation
- Canonical URL management

---

## Current Implementation

### Architecture

```
SEO System
├── Meta Tags (layout.tsx)
│   ├── Title, Description, Keywords
│   ├── Open Graph
│   ├── Twitter Cards
│   └── Verification tags
│
├── Structured Data (JSON-LD)
│   ├── EducationalOrganization
│   ├── BlogPosting (per post)
│   └── Course (per course)
│
├── Crawlers (robots.ts)
│   ├── Standard crawlers
│   └── AI crawlers (GPTBot, Claude)
│
└── Sitemap (next-sitemap.config.js)
    ├── Static pages
    └── Dynamic blog posts
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root metadata and structured data |
| `src/app/robots.ts` | Dynamic robots.txt generation |
| `src/lib/seo/blog-seo-optimizer.ts` | Blog post SEO optimization |
| `next-sitemap.config.js` | Sitemap configuration |
| `public/llms.txt` | AI crawler information |

---

## Core Logic

### Root Metadata (layout.tsx)

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "Aviators Training Centre - India's Premier ATC Training Institute | DGCA CPL/ATPL Exam Prep",
  description: "#1 Aviators Training Centre (ATC) in India. Expert-led DGCA ground school for CPL/ATPL exams...",
  keywords: "Aviators Training Centre, ATC courses, DGCA ground school, CPL training India...",
  
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  
  alternates: {
    canonical: "https://www.aviatorstrainingcentre.in",
  },
  
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.aviatorstrainingcentre.in",
    title: "Aviators Training Centre - India's Premier ATC Training Institute",
    description: "#1 Aviators Training Centre...",
    siteName: "Aviators Training Centre",
    images: [{
      url: "https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
      width: 1200,
      height: 630,
      alt: "Aviators Training Centre Logo"
    }]
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Aviators Training Centre",
    description: "#1 ATC in India...",
    images: ["https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png"]
  },
  
  verification: {
    google: "aE_FqlD0SbJberIaVs7Xe0flcsZF9gojWQg0BCQhiBc",
  },
};
```

### Structured Data (JSON-LD)

```typescript
// src/app/layout.tsx - Organization Schema
<Script
  id="organization-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Aviators Training Centre",
      "alternateName": "ATC",
      "description": "India's premier aviation training institute...",
      "url": "https://www.aviatorstrainingcentre.in",
      "logo": "https://www.aviatorstrainingcentre.in/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "hasCredential": [
        "DGCA CPL Ground Training",
        "DGCA ATPL Ground Training",
        "Type Rating Preparation",
        "RTR(A) Training"
      ],
      "employee": [
        {
          "@type": "Person",
          "name": "Ankit Kumar",
          "jobTitle": "Chief Flight Instructor"
        }
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150"
      }
    })
  }}
/>
```

### AI Crawler Configuration (robots.ts)

```typescript
// src/app/robots.ts
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.aviatorstrainingcentre.in';
  
  return {
    rules: [
      // Standard crawlers
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/studio/', '/_next/'],
      },
      
      // GPTBot (ChatGPT)
      {
        userAgent: 'GPTBot',
        allow: ['/blog/', '/courses/', '/about', '/instructors', '/faq'],
        disallow: ['/admin/', '/api/', '/contact'],
      },
      
      // ChatGPT-User
      {
        userAgent: 'ChatGPT-User',
        allow: ['/blog/', '/courses/', '/about'],
        disallow: ['/admin/', '/api/', '/contact'],
      },
      
      // Claude (Anthropic)
      {
        userAgent: 'anthropic-ai',
        allow: ['/blog/', '/courses/', '/about'],
        disallow: ['/admin/', '/api/', '/contact'],
      },
      
      // Claude-Web
      {
        userAgent: 'Claude-Web',
        allow: ['/blog/', '/courses/', '/about'],
        disallow: ['/admin/', '/api/', '/contact'],
      },
      
      // CCBot (Common Crawl)
      {
        userAgent: 'CCBot',
        allow: ['/blog/', '/courses/', '/about'],
        disallow: ['/admin/', '/api/', '/contact'],
      },
    ],
    
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

### Sitemap Configuration

```javascript
// next-sitemap.config.js
const config = {
  siteUrl: 'https://www.aviatorstrainingcentre.in',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/404', '/500', '/api/*'],
  
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://www.aviatorstrainingcentre.in/server-sitemap.xml',
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/404', '/500', '/api/*', '/admin/*'],
      },
    ],
  },
  
  transform: async (config, path) => {
    let priority = config.priority;
    let changefreq = config.changefreq;
    
    // Custom priorities
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/courses') {
      priority = 0.9;
      changefreq = 'weekly';
    } else if (path === '/testimonials') {
      priority = 0.9;
      changefreq = 'weekly';
    }
    
    return {
      loc: new URL(path, config.siteUrl).href,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
```

---

## Blog Post SEO

### SEO Optimizer Service

```typescript
// src/lib/seo/blog-seo-optimizer.ts
export class BlogSEOOptimizer {
  
  generateMetadata(post: BlogPost): Metadata {
    const title = post.seoTitle || post.title;
    const description = post.seoDescription || post.excerpt;
    
    return {
      title: `${title} | Aviators Training Centre`,
      description,
      keywords: this.generateKeywords(post),
      
      openGraph: {
        type: 'article',
        title,
        description,
        url: `https://www.aviatorstrainingcentre.in/blog/${post.slug}`,
        images: [{ url: post.image?.url }],
        publishedTime: post.publishedAt,
        authors: [post.author?.name],
      },
    };
  }
  
  generateStructuredData(post: BlogPost): object {
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author?.name
      },
      "datePublished": post.publishedAt,
      "publisher": {
        "@type": "Organization",
        "name": "Aviators Training Centre"
      },
      "image": post.image?.url,
    };
  }
  
  validateSEO(post: BlogPost): SEOReport {
    const issues: string[] = [];
    let score = 100;
    
    // Title length (50-60 chars optimal)
    if (!post.title) {
      issues.push('Missing title');
      score -= 30;
    } else if (post.title.length > 60) {
      issues.push('Title too long (>60 chars)');
      score -= 10;
    }
    
    // Description (150-160 chars optimal)
    if (!post.excerpt) {
      issues.push('Missing excerpt/description');
      score -= 20;
    } else if (post.excerpt.length > 160) {
      issues.push('Description too long (>160 chars)');
      score -= 5;
    }
    
    // Image
    if (!post.image) {
      issues.push('Missing featured image');
      score -= 15;
    }
    
    return { score, issues };
  }
}
```

---

## How to Use

### Page-Level SEO

```typescript
// src/app/courses/page.tsx
export const metadata: Metadata = {
  title: 'Aviation Courses | CPL ATPL Training | Aviators Training Centre',
  description: 'Explore our comprehensive aviation courses...',
  alternates: {
    canonical: 'https://www.aviatorstrainingcentre.in/courses',
  },
};
```

### Dynamic Blog Post SEO

```typescript
// src/app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  const optimizer = new BlogSEOOptimizer();
  
  return optimizer.generateMetadata(post);
}
```

### Adding Structured Data

```typescript
// In any page component
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.description,
      "provider": {
        "@type": "Organization",
        "name": "Aviators Training Centre"
      }
    })
  }}
/>
```

---

## Extension Guide

### Adding New AI Crawler

```typescript
// src/app/robots.ts - Add new rule
{
  userAgent: 'NewAIBot',
  allow: ['/blog/', '/courses/', '/about'],
  disallow: ['/admin/', '/api/', '/contact'],
},
```

### Adding New Schema Type

```typescript
// Create schema generator
function generateCourseSchema(course: Course) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Aviators Training Centre"
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online"
    }
  };
}
```

---

## Performance Considerations

- **Meta tags**: Loaded in `<head>` for immediate parsing
- **JSON-LD**: Loaded with `afterInteractive` strategy
- **Sitemap**: Generated at build time, ISR for dynamic content
- **robots.txt**: Generated dynamically for flexibility

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Title not showing in search | Check `metadata` export in page |
| OG image not appearing | Verify image URL is absolute |
| Duplicate content warning | Add canonical URLs |
| Low SEO score | Run Lighthouse, fix reported issues |

---

## Related Documentation

- [Blog System](blog-system.md)
- [Performance Tuning](../PERFORMANCE_TUNING.md)
