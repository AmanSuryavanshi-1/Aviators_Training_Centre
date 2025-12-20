# Blog System

> **Sanity CMS integration, content rendering, and SEO optimization**

Last Updated: December 20, 2025

---

## Overview

The blog system provides:
- Sanity CMS content management
- PortableText rich content rendering
- Dynamic CTA integration
- SEO optimization per post
- Related posts recommendations

---

## Current Implementation

### Architecture

```
Blog System
├── Content Management (Sanity)
│   ├── Post schema
│   ├── Author schema
│   ├── Category schema
│   └── Tag schema
│
├── Data Fetching
│   ├── GROQ queries
│   ├── ISR caching
│   └── Error handling
│
├── Rendering
│   ├── PortableText components
│   ├── Code highlighting
│   ├── Image optimization
│   └── Callout boxes
│
└── Features
    ├── Featured carousel
    ├── Related posts
    ├── Table of contents
    └── Reading progress
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/blog/index.ts` | Main exports and utilities |
| `src/lib/blog/api.ts` | Data fetching functions |
| `src/app/blog/page.tsx` | Blog listing page |
| `src/app/blog/[slug]/page.tsx` | Single post page |
| `src/components/features/blog/` | 36 blog components |
| `studio/schemaTypes/postType.tsx` | Sanity schema |

---

## Core Logic

### Blog API Functions

```typescript
// src/lib/blog/api.ts
import { client } from '@/lib/sanity/client';
import { groq } from 'next-sanity';

// Get all published posts
export async function getBlogPosts(): Promise<BlogPost[]> {
  const query = groq`
    *[_type == "post" && publishedAt != null] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      "author": author->{name, image},
      "category": category->{title, slug},
      "image": image.asset->url,
      "estimatedReadingTime": round(length(pt::text(body)) / 5 / 200)
    }
  `;
  
  return await client.fetch(query);
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = groq`
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      body,
      publishedAt,
      "author": author->{name, bio, image, role},
      "category": category->{title, slug},
      "tags": tags[]->{title, slug},
      "image": image.asset->url,
      seoTitle,
      seoDescription,
      focusKeyphrase
    }
  `;
  
  return await client.fetch(query, { slug });
}

// Get related posts
export async function getRelatedPosts(
  currentSlug: string, 
  categorySlug: string
): Promise<BlogPost[]> {
  const query = groq`
    *[_type == "post" 
      && slug.current != $currentSlug 
      && category->slug.current == $categorySlug
    ] | order(publishedAt desc)[0...3] {
      _id,
      title,
      slug,
      excerpt,
      "image": image.asset->url
    }
  `;
  
  return await client.fetch(query, { currentSlug, categorySlug });
}

// Get featured posts
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const query = groq`
    *[_type == "post" && isFeatured == true] | order(publishedAt desc)[0...5] {
      _id,
      title,
      slug,
      excerpt,
      "image": image.asset->url
    }
  `;
  
  return await client.fetch(query);
}
```

### Blog Listing Page

```typescript
// src/app/blog/page.tsx
import { getBlogPosts, getCategories } from '@/lib/blog';

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Aviation Blog | Pilot Training Insights | Aviators Training Centre',
  description: 'Expert insights on DGCA exams, pilot training, aviation careers...',
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogPosts(),
    getCategories(),
  ]);

  return (
    <main>
      <BlogHero />
      <FeaturedPostsCarousel posts={posts.slice(0, 5)} />
      <CategoryFilter categories={categories} />
      <BlogGrid posts={posts} />
    </main>
  );
}
```

### Single Post Page

```typescript
// src/app/blog/[slug]/page.tsx
import { getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { BlogSEOOptimizer } from '@/lib/seo/blog-seo-optimizer';

export const revalidate = 1800;

// Generate static params for build
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map(post => ({ slug: post.slug.current }));
}

// Dynamic metadata per post
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  
  const optimizer = new BlogSEOOptimizer();
  return optimizer.generateMetadata(post);
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(
    params.slug, 
    post.category.slug.current
  );

  return (
    <article>
      <BlogPostHeader post={post} />
      <TableOfContents content={post.body} />
      <ReadingProgress />
      <PortableTextContent value={post.body} />
      <AuthorBio author={post.author} />
      <RelatedPosts posts={relatedPosts} />
      <BlogStructuredData post={post} />
    </article>
  );
}
```

### PortableText Components

```typescript
// src/components/features/blog/PortableTextComponents.tsx
import { PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export const portableTextComponents: PortableTextComponents = {
  types: {
    // Image block
    image: ({ value }) => (
      <figure className="my-8">
        <Image
          src={urlFor(value).width(800).url()}
          alt={value.alt || ''}
          width={800}
          height={450}
          className="rounded-lg"
        />
        {value.caption && (
          <figcaption className="text-center text-sm text-gray-500 mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),

    // Code block
    codeBlock: ({ value }) => (
      <div className="my-6">
        {value.filename && (
          <div className="bg-gray-800 text-gray-200 px-4 py-2 text-sm rounded-t">
            {value.filename}
          </div>
        )}
        <SyntaxHighlighter
          language={value.language || 'javascript'}
          customStyle={{ margin: 0, borderRadius: value.filename ? '0 0 8px 8px' : '8px' }}
        >
          {value.code}
        </SyntaxHighlighter>
      </div>
    ),

    // Callout box
    callout: ({ value }) => {
      const icons = {
        info: 'ℹ️',
        warning: '⚠️',
        tip: '💡',
        important: '❗',
      };
      
      return (
        <div className={`callout callout-${value.type} my-6 p-4 rounded-lg`}>
          <div className="flex gap-2">
            <span>{icons[value.type]}</span>
            <div>
              {value.title && <strong>{value.title}</strong>}
              <p>{value.content}</p>
            </div>
          </div>
        </div>
      );
    },
  },

  marks: {
    link: ({ children, value }) => (
      <a 
        href={value.href}
        target={value.blank ? '_blank' : undefined}
        rel={value.blank ? 'noopener noreferrer' : undefined}
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
  },

  block: {
    h2: ({ children }) => (
      <h2 id={slugify(children)} className="text-2xl font-bold mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugify(children)} className="text-xl font-semibold mt-6 mb-3">
        {children}
      </h3>
    ),
  },
};
```

---

## Blog Components

### Featured Posts Carousel

```typescript
// src/components/features/blog/FeaturedPostsCarousel.tsx
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

export function FeaturedPostsCarousel({ posts }) {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 5000 }}
      pagination={{ clickable: true }}
      spaceBetween={24}
      slidesPerView={1}
      breakpoints={{
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {posts.map(post => (
        <SwiperSlide key={post._id}>
          <BlogCard post={post} variant="featured" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
```

### Reading Progress

```typescript
// src/components/features/blog/ReadingProgress.tsx
'use client';

import { useEffect, useState } from 'react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const { top, height } = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrolled = Math.max(0, -top);
      const total = height - windowHeight;
      const percentage = Math.min(100, (scrolled / total) * 100);
      
      setProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
```

### Table of Contents

```typescript
// src/components/features/blog/TableOfContents.tsx
'use client';

export function TableOfContents({ content }) {
  const headings = extractHeadings(content);

  return (
    <nav className="sticky top-24 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold mb-3">Table of Contents</h4>
      <ul className="space-y-2">
        {headings.map((heading, i) => (
          <li key={i} className={heading.level === 'h3' ? 'pl-4' : ''}>
            <a 
              href={`#${heading.slug}`}
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## How to Use

### Create New Blog Post

1. Go to Sanity Studio (`/studio`)
2. Click "Post" → "Create new"
3. Fill in required fields:
   - Title (50-60 chars for SEO)
   - Slug (auto-generated)
   - Excerpt (150-160 chars)
   - Category
   - Content
4. Set SEO fields (optional but recommended)
5. Click "Publish"

### Add CTA to Post

CTAs are automatically added based on category:
- CPL posts → CPL course CTA
- ATPL posts → ATPL course CTA
- General → Contact CTA

---

## Extension Guide

### Adding New Block Type

```typescript
// 1. Add to Sanity schema (postType.tsx)
{
  type: 'object',
  name: 'videoEmbed',
  title: 'Video Embed',
  fields: [
    { name: 'url', type: 'url', title: 'YouTube URL' },
    { name: 'caption', type: 'string', title: 'Caption' },
  ],
}

// 2. Add to PortableText components
videoEmbed: ({ value }) => (
  <div className="my-8 aspect-video">
    <iframe 
      src={getYouTubeEmbedUrl(value.url)}
      className="w-full h-full rounded-lg"
      allowFullScreen
    />
    {value.caption && <p className="text-sm mt-2">{value.caption}</p>}
  </div>
),
```

---

## Performance Considerations

- **ISR**: 30-minute revalidation for blog pages
- **Image optimization**: Next.js Image with Sanity CDN
- **Code splitting**: Dynamic import for syntax highlighter
- **Lazy loading**: Images below fold are lazy loaded

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Post not appearing | Check `publishedAt` is set |
| Images broken | Verify Sanity CDN configured |
| Slow loading | Check ISR is working |
| TOC not updating | Ensure heading IDs are unique |

---

## Related Documentation

- [CMS Sanity](cms-sanity.md)
- [SEO Implementation](seo-implementation.md)
- [Image Optimization](image-optimization.md)
