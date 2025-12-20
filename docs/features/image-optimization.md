# Image Optimization

> **Lazy loading, format optimization, and performance metrics**

Last Updated: December 20, 2025

---

## Overview

Image optimization achieves fast load times through:
- Next.js Image component
- AVIF/WebP format support
- Smart lazy loading
- Connection-aware quality
- Performance metrics tracking

---

## Current Implementation

### Architecture

```
Image Optimization
├── Next.js Image
│   ├── Automatic optimization
│   ├── Responsive srcset
│   └── Format conversion
│
├── Lazy Loading Service
│   ├── IntersectionObserver
│   ├── Placeholder images
│   └── Progressive loading
│
├── Connection-Aware
│   ├── Network detection
│   └── Quality adjustment
│
└── Performance Tracking
    ├── LCP monitoring
    └── Image load timing
```

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/image-optimization/index.ts` | Module exports |
| `src/lib/image-optimization/ImageLazyLoadService.ts` | Lazy loading |
| `src/lib/image-optimization/PerformanceImageProvider.tsx` | Context provider |
| `src/lib/image-optimization/PerformanceMetricsCollector.ts` | Metrics |
| `next.config.mjs` | Image configuration |

---

## Configuration

### Next.js Image Settings

```javascript
// next.config.mjs
images: {
  // Supported formats (AVIF is most efficient)
  formats: ['image/avif', 'image/webp'],
  
  // Responsive breakpoints
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Cache duration (1 year for versioned assets)
  minimumCacheTTL: 31536000,
  
  // Allowed external domains
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.sanity.io',
    },
    {
      protocol: 'https',
      hostname: 'www.aviatorstrainingcentre.in',
    },
  ],
},
```

---

## Core Logic

### Next.js Image Usage

```typescript
// Basic optimized image
import Image from 'next/image';

// Hero image (priority for LCP)
<Image
  src="/hero-image.jpg"
  alt="Aviation training"
  width={1920}
  height={1080}
  priority={true}  // Preload for above-fold
  quality={85}
/>

// Blog post image (lazy loaded)
<Image
  src={post.image}
  alt={post.title}
  width={800}
  height={450}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// Responsive image
<Image
  src="/course-image.jpg"
  alt="Course"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### Lazy Loading Service

```typescript
// src/lib/image-optimization/ImageLazyLoadService.ts
export class ImageLazyLoadService {
  private observer: IntersectionObserver;
  private loadedImages: Set<string> = new Set();

  constructor(options?: { rootMargin?: string; threshold?: number }) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: options?.rootMargin || '100px',
        threshold: options?.threshold || 0.1,
      }
    );
  }

  observe(img: HTMLImageElement): void {
    if (!this.loadedImages.has(img.src)) {
      this.observer.observe(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
      this.loadedImages.add(src);
    }
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}
```

### Connection-Aware Quality

```typescript
// src/lib/image-optimization/connectionAware.ts
export function getConnectionAwareQuality(): number {
  if (typeof navigator === 'undefined') return 75;

  const connection = (navigator as any).connection;
  if (!connection) return 75;

  // Adjust quality based on network speed
  switch (connection.effectiveType) {
    case '4g':
      return 85;  // High quality for fast connections
    case '3g':
      return 65;  // Medium quality
    case '2g':
      return 45;  // Lower quality for slow connections
    case 'slow-2g':
      return 30;  // Minimum quality
    default:
      return 75;
  }
}

export function shouldLoadImages(): boolean {
  if (typeof navigator === 'undefined') return true;

  const connection = (navigator as any).connection;
  if (!connection) return true;

  // Skip images on data saver mode
  return !connection.saveData;
}
```

### Performance Image Provider

```typescript
// src/lib/image-optimization/PerformanceImageProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ImageLazyLoadService } from './ImageLazyLoadService';

interface ImageContextValue {
  lazyLoadService: ImageLazyLoadService | null;
  quality: number;
  shouldLoadImages: boolean;
}

const ImageContext = createContext<ImageContextValue>({
  lazyLoadService: null,
  quality: 75,
  shouldLoadImages: true,
});

export function PerformanceImageProvider({ children }: { children: ReactNode }) {
  const [lazyLoadService, setLazyLoadService] = useState<ImageLazyLoadService | null>(null);
  const [quality, setQuality] = useState(75);
  const [shouldLoad, setShouldLoad] = useState(true);

  useEffect(() => {
    // Initialize lazy loading
    const service = new ImageLazyLoadService({ rootMargin: '200px' });
    setLazyLoadService(service);

    // Set connection-aware quality
    setQuality(getConnectionAwareQuality());
    setShouldLoad(shouldLoadImages());

    return () => service.disconnect();
  }, []);

  return (
    <ImageContext.Provider value={{ 
      lazyLoadService, 
      quality, 
      shouldLoadImages: shouldLoad 
    }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImageOptimization() {
  return useContext(ImageContext);
}
```

### Performance Metrics Collector

```typescript
// src/lib/image-optimization/PerformanceMetricsCollector.ts
export class PerformanceMetricsCollector {
  private metrics: Map<string, number> = new Map();

  collectLCP(): void {
    if (typeof window === 'undefined') return;

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('lcp', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }

  collectImageTimings(): void {
    if (typeof window === 'undefined') return;

    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.initiatorType === 'img') {
          const timing = {
            name: entry.name,
            duration: entry.duration,
            transferSize: (entry as any).transferSize,
          };
          console.debug('Image timing:', timing);
        }
      });
    }).observe({ type: 'resource', buffered: true });
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

---

## Sanity Image Optimization

### URL Builder

```typescript
import { urlFor } from '@/lib/sanity/client';

// Generate optimized Sanity image URL
const imageUrl = urlFor(image)
  .width(800)
  .height(450)
  .format('webp')
  .quality(80)
  .fit('crop')
  .url();

// With auto format (best for browser)
const autoFormatUrl = urlFor(image)
  .width(800)
  .auto('format')  // Let browser choose best format
  .url();
```

### Responsive Sanity Images

```typescript
// Generate srcset for responsive images
function getSanitySrcSet(image: any, sizes: number[]): string {
  return sizes
    .map(size => `${urlFor(image).width(size).url()} ${size}w`)
    .join(', ');
}

// Usage
const srcSet = getSanitySrcSet(post.image, [400, 800, 1200, 1920]);
```

---

## How to Use

### Above-the-Fold Images

```typescript
// Always use priority for hero images
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority  // Preloads this image
/>
```

### Blog Post Images

```typescript
// Use placeholder for better UX
<Image
  src={urlFor(post.image).width(800).url()}
  alt={post.title}
  width={800}
  height={450}
  placeholder="blur"
  blurDataURL={post.image.asset.metadata.lqip}
/>
```

### Avatar/Profile Images

```typescript
// Small images - use appropriate sizes
<Image
  src={author.image}
  alt={author.name}
  width={48}
  height={48}
  className="rounded-full"
/>
```

---

## Extension Guide

### Adding Blur Placeholder

```typescript
// Generate blur data URL from Sanity
const imageWithBlur = await client.fetch(groq`
  *[_type == "post"][0] {
    "image": image.asset->{
      url,
      "lqip": metadata.lqip  // Low Quality Image Placeholder
    }
  }
`);

// Use in Image component
<Image
  src={imageWithBlur.image.url}
  placeholder="blur"
  blurDataURL={imageWithBlur.image.lqip}
/>
```

### Custom Image Component

```typescript
// components/OptimizedImage.tsx
'use client';

import Image from 'next/image';
import { useImageOptimization } from '@/lib/image-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false 
}: OptimizedImageProps) {
  const { quality, shouldLoadImages } = useImageOptimization();

  if (!shouldLoadImages && !priority) {
    // Show placeholder for data saver mode
    return (
      <div 
        className="bg-gray-200 animate-pulse"
        style={{ width, height }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
    />
  );
}
```

---

## Performance Considerations

| Optimization | Benefit |
|--------------|---------|
| AVIF format | 50% smaller than JPEG |
| Lazy loading | Reduces initial load |
| Priority loading | Improves LCP |
| CDN caching | Faster delivery |
| Responsive srcset | Right size for device |

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Images not loading | Check `remotePatterns` config |
| Slow LCP | Add `priority` to hero image |
| Layout shift | Always specify `width` and `height` |
| Large bundle | Use dynamic imports for images |

---

## Related Documentation

- [Performance Tuning](../PERFORMANCE_TUNING.md)
- [CMS Sanity](cms-sanity.md)
- [Blog System](blog-system.md)
