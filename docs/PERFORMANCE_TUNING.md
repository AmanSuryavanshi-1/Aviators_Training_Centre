# Performance Tuning

> **Optimization strategies, metrics, and best practices**

Last Updated: December 20, 2025

---

## Performance Metrics

### Current Lighthouse Scores

| Metric | Score | Target |
|--------|-------|--------|
| **Performance** | 95+ | >90 |
| **Accessibility** | 100 | >95 |
| **Best Practices** | 100 | >95 |
| **SEO** | 100 | >95 |

### Core Web Vitals

| Metric | Value | Target |
|--------|-------|--------|
| **LCP** (Largest Contentful Paint) | <2.5s | <2.5s ✅ |
| **FID** (First Input Delay) | <100ms | <100ms ✅ |
| **CLS** (Cumulative Layout Shift) | <0.1 | <0.1 ✅ |
| **FCP** (First Contentful Paint) | <1.8s | <1.8s ✅ |
| **TTFB** (Time to First Byte) | <800ms | <800ms ✅ |

---

## Image Optimization

### Next.js Image Configuration

```javascript
// next.config.mjs
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year
  remotePatterns: [
    { hostname: 'cdn.sanity.io' },
    { hostname: 'www.aviatorstrainingcentre.in' },
  ],
},
```

### Image Component Usage

```typescript
// Optimized image with lazy loading
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Aviation training"
  width={1200}
  height={630}
  priority={false}  // Lazy load by default
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Above-the-fold images
<Image
  src="/logo.png"
  priority={true}   // Preload critical images
/>
```

### Lazy Loading Service

```typescript
// src/lib/image-optimization/ImageLazyLoadService.ts
export class ImageLazyLoadService {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target as HTMLImageElement);
            this.observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before viewport
    );
  }

  observe(img: HTMLImageElement) {
    this.observer.observe(img);
  }
}
```

### Connection-Aware Loading

```typescript
// Adjust quality based on network
export function getConnectionAwareQuality(): number {
  if (typeof navigator === 'undefined') return 75;
  
  const connection = (navigator as any).connection;
  if (!connection) return 75;

  switch (connection.effectiveType) {
    case '4g': return 85;
    case '3g': return 60;
    case '2g': return 40;
    default: return 75;
  }
}
```

---

## Bundle Optimization

### Code Splitting Configuration

```javascript
// next.config.mjs
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Framework bundle
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Vendor bundles per package
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              return `npm.${match[1].replace('@', '')}`;
            },
            priority: 30,
          },
        },
        maxInitialRequests: 25,
        minSize: 20000,
      },
    };
  }
  return config;
},
```

### Dynamic Imports

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

// Analytics dashboard - only load when needed
const AdvancedAnalyticsDashboard = dynamic(
  () => import('@/components/admin/AdvancedAnalyticsDashboard'),
  { 
    loading: () => <DashboardSkeleton />,
    ssr: false 
  }
);

// Modal - lazy load
const DemoModal = dynamic(
  () => import('@/components/features/lead-generation/DemoModal'),
  { loading: () => null }
);
```

### Tree Shaking

```typescript
// Import only what you need
// ❌ Bad
import { Button, Card, Dialog, Tabs, Table } from '@/components/ui';

// ✅ Good
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

---

## Caching Strategies

### Static Assets

```javascript
// vercel.json - 1 year cache for static assets
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### ISR (Incremental Static Regeneration)

```typescript
// Blog listing - revalidate every 30 minutes
export const revalidate = 1800;

// Static pages - revalidate every hour
export const revalidate = 3600;

// Dynamic API responses
export const dynamic = 'force-dynamic';
```

### API Response Caching

```javascript
// API routes - stale-while-revalidate
{
  "source": "/api/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate=300" }
  ]
}
```

### CDN Caching

```typescript
// next.config.mjs
images: {
  minimumCacheTTL: 31536000, // 1 year for images
},
```

---

## JavaScript Optimization

### Remove Console Logs in Production

```javascript
// next.config.mjs
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
},
```

### Minification

```javascript
// Enabled by default in Next.js production builds
// Uses SWC for fast minification
```

### Script Loading Strategy

```typescript
// Non-critical scripts
<Script
  src="https://analytics.example.com/script.js"
  strategy="afterInteractive"
/>

// Critical scripts
<Script
  src="/critical.js"
  strategy="beforeInteractive"
/>

// Worker thread
<Script
  src="/analytics.js"
  strategy="worker"
/>
```

---

## Font Optimization

### Next.js Font Optimization

```typescript
// src/app/layout.tsx
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${outfit.variable}`}>
      {children}
    </html>
  );
}
```

### Font Display Best Practices

```css
/* Fallback fonts while loading */
font-display: swap;

/* Preload critical fonts */
<link rel="preload" href="/fonts/inter.woff2" as="font" crossorigin />
```

---

## Database Query Optimization

### Sanity Query Optimization

```groq
// ❌ Bad - Fetches all fields
*[_type == "post"]

// ✅ Good - Project only needed fields
*[_type == "post"] {
  _id,
  title,
  slug,
  excerpt,
  "image": image.asset->url
}

// ✅ Good - Include limits
*[_type == "post"] | order(publishedAt desc)[0...10]
```

### Firebase Query Optimization

```typescript
// Use indexes for compound queries
const query = collection(db, 'analytics_events')
  .where('timestamp', '>=', startDate)
  .where('event.type', '==', 'page_view')
  .orderBy('timestamp', 'desc')
  .limit(100);
```

---

## Server-Side Optimization

### Parallel Data Fetching

```typescript
// ❌ Sequential (slow)
const posts = await getPosts();
const categories = await getCategories();
const authors = await getAuthors();

// ✅ Parallel (fast)
const [posts, categories, authors] = await Promise.all([
  getPosts(),
  getCategories(),
  getAuthors(),
]);
```

### Response Streaming

```typescript
// Stream large responses
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const item of fetchItems()) {
        controller.enqueue(encoder.encode(JSON.stringify(item) + '\n'));
      }
      controller.close();
    },
  });

  return new Response(stream);
}
```

---

## Monitoring

### Performance Metrics Collection

```typescript
// src/lib/image-optimization/PerformanceMetricsCollector.ts
export function analyzePerformanceMetrics(entries: PerformanceEntry[]) {
  const metrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0,
  };

  entries.forEach(entry => {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        metrics.lcp = entry.startTime;
        break;
      case 'first-input':
        metrics.fid = (entry as any).processingStart - entry.startTime;
        break;
      // ... more metrics
    }
  });

  return metrics;
}
```

### Vercel Analytics

```typescript
// Automatically tracked by Vercel
// Access via Vercel Dashboard → Analytics

// Manual speed insights
import { SpeedInsights } from '@vercel/speed-insights/next';

<SpeedInsights />
```

---

## Optimization Checklist

### Images
- [x] Use Next.js Image component
- [x] Enable AVIF/WebP formats
- [x] Lazy load below-the-fold images
- [x] Priority load hero images
- [x] Use blur placeholders

### JavaScript
- [x] Code split heavy components
- [x] Tree shake unused code
- [x] Minify production builds
- [x] Remove console logs
- [x] Async load non-critical scripts

### CSS
- [x] Use Tailwind's purge
- [x] Inline critical CSS
- [x] Lazy load below-fold styles

### Fonts
- [x] Use next/font
- [x] Font display swap
- [x] Subset fonts

### Caching
- [x] Static assets: 1 year
- [x] ISR for dynamic content
- [x] CDN for images
- [x] API response caching

---

## Related Documentation

- [Architecture Overview](ARCHITECTURE_OVERVIEW.md)
- [Deployment Runbook](DEPLOYMENT_RUNBOOK.md)
- [Image Optimization](features/image-optimization.md)
