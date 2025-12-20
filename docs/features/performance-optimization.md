# Performance Optimization

> **Core Web Vitals, caching, and optimization techniques**

Last Updated: December 20, 2025

---

## Overview

Performance optimization achieves 95+ Lighthouse scores through:
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Bundle size reduction
- Core Web Vitals focus

---

## Current Metrics

### Lighthouse Scores

| Metric | Score |
|--------|-------|
| Performance | 95+ |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

### Core Web Vitals

| Metric | Value | Target |
|--------|-------|--------|
| LCP | <2.5s | ✅ Good |
| FID | <100ms | ✅ Good |
| CLS | <0.1 | ✅ Good |

---

## Optimization Strategies

### 1. Code Splitting

```javascript
// next.config.mjs
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // React/framework in separate chunk
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            priority: 40,
            enforce: true,
          },
          // Each npm package in its own chunk
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

### 2. Dynamic Imports

```typescript
// Heavy components - load on demand
import dynamic from 'next/dynamic';

// Admin dashboard - only for admin routes
const AdminDashboard = dynamic(
  () => import('@/components/admin/AdvancedAnalyticsDashboard'),
  { 
    loading: () => <DashboardSkeleton />,
    ssr: false 
  }
);

// Modal - load when needed
const DemoModal = dynamic(
  () => import('@/components/features/lead-generation/DemoModal'),
  { loading: () => null }
);

// Syntax highlighter - load for blog posts
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter')
);
```

### 3. Image Optimization

```javascript
// next.config.mjs
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  minimumCacheTTL: 31536000, // 1 year
},
```

```typescript
// Priority for above-fold images
<Image src="/hero.jpg" priority alt="Hero" />

// Lazy load below-fold
<Image src="/feature.jpg" loading="lazy" alt="Feature" />
```

### 4. Font Optimization

```typescript
// src/app/layout.tsx
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent FOUT
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});
```

### 5. Script Loading

```typescript
// Non-critical scripts - afterInteractive
<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XSRFEJCB7N"
  strategy="afterInteractive"
/>

// Analytics - lazyOnload
<Script
  src="/analytics.js"
  strategy="lazyOnload"
/>
```

### 6. Remove Console Logs

```javascript
// next.config.mjs
compiler: {
  removeConsole: process.env.NODE_ENV === 'production' ? {
    exclude: ['error', 'warn'],
  } : false,
},
```

---

## Caching Strategies

### ISR (Incremental Static Regeneration)

```typescript
// Blog pages - 30 minute cache
export const revalidate = 1800;

// Static pages - 1 hour cache
export const revalidate = 3600;

// Dynamic API - no cache
export const dynamic = 'force-dynamic';
```

### HTTP Cache Headers

```javascript
// next.config.mjs
async headers() {
  return [
    // Static assets - 1 year
    {
      source: '/images/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ],
    },
    // Fonts - 1 year
    {
      source: '/:path*.woff2',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
      ],
    },
    // HTML - short cache with revalidation
    {
      source: '/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' }
      ],
    },
  ];
},
```

### CDN Configuration (Vercel)

```json
// vercel.json
{
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Bundle Analysis

### Analyze Bundle Size

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
```

### Configuration

```javascript
// next.config.mjs
import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default bundleAnalyzer(nextConfig);
```

---

## Performance Monitoring

### Core Web Vitals Tracking

```typescript
// src/app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Metrics

```typescript
// src/lib/performance/metrics.ts
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lcp = entries[entries.length - 1];
    console.log('LCP:', lcp.startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // FID
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      console.log('FID:', entry.processingStart - entry.startTime);
    });
  }).observe({ type: 'first-input', buffered: true });

  // CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    console.log('CLS:', clsValue);
  }).observe({ type: 'layout-shift', buffered: true });
}
```

---

## Optimization Checklist

### Images
- [x] Use Next.js Image component
- [x] Enable AVIF/WebP formats
- [x] Lazy load below-fold images
- [x] Priority load hero images
- [x] Use blur placeholders

### JavaScript
- [x] Code split heavy components
- [x] Tree shake unused code
- [x] Remove console logs in production
- [x] Async load non-critical scripts

### CSS
- [x] Use Tailwind's purge
- [x] Minimize custom CSS
- [x] Avoid layout shifts

### Fonts
- [x] Use next/font for Google Fonts
- [x] Font display swap
- [x] Subset fonts to needed characters

### Caching
- [x] ISR for dynamic content
- [x] CDN for static assets
- [x] 1-year cache for images/fonts
- [x] Stale-while-revalidate for HTML

---

## Common Performance Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| High LCP | Large hero image | Use priority, optimize size |
| High CLS | No image dimensions | Always set width/height |
| High FID | Heavy JS | Code split, defer scripts |
| Slow TTFB | Server processing | Use ISR, edge functions |
| Large bundle | Unused dependencies | Audit and remove |

---

## Related Documentation

- [Image Optimization](image-optimization.md)
- [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)
- [Performance Tuning](../PERFORMANCE_TUNING.md)
