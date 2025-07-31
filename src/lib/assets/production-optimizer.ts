/**
 * Production asset optimization utilities
 * Handles image compression, format conversion, and CDN integration
 */

import { createLogger } from '@/lib/logging/production-logger';

const assetLogger = createLogger('assets');

// Asset optimization configuration
export const ASSET_CONFIG = {
  // Image quality settings
  imageQuality: {
    high: 90,
    medium: 75,
    low: 60,
    thumbnail: 50,
  },
  
  // Image size breakpoints
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    large: 1280,
    xl: 1920,
  },
  
  // Supported formats
  formats: {
    modern: ['avif', 'webp'],
    fallback: ['jpeg', 'png'],
  },
  
  // CDN settings
  cdn: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL,
    enabled: process.env.NODE_ENV === 'production',
  },
  
  // Performance thresholds
  performance: {
    maxImageSize: 500000, // 500KB
    maxLoadTime: 1000, // 1 second
    criticalImageCount: 5,
  },
};

// Image optimization utilities
export class AssetOptimizer {
  // Generate responsive image URLs
  static generateResponsiveUrls(src: string, sizes: number[] = [640, 768, 1024, 1280, 1920]): string[] {
    return sizes.map(size => this.optimizeImageUrl(src, { width: size }));
  }
  
  // Optimize image URL with parameters
  static optimizeImageUrl(src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    if (!src) return '';
    
    const { width, height, quality = ASSET_CONFIG.imageQuality.medium, format } = options;
    
    try {
      // Handle Sanity CDN optimization
      if (src.includes('cdn.sanity.io')) {
        const url = new URL(src);
        
        if (width) url.searchParams.set('w', width.toString());
        if (height) url.searchParams.set('h', height.toString());
        if (quality) url.searchParams.set('q', quality.toString());
        if (format) url.searchParams.set('fm', format);
        
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'max');
        
        return url.toString();
      }
      
      // Handle custom CDN
      if (ASSET_CONFIG.cdn.enabled && ASSET_CONFIG.cdn.baseUrl) {
        const url = new URL(src, ASSET_CONFIG.cdn.baseUrl);
        
        if (width) url.searchParams.set('w', width.toString());
        if (height) url.searchParams.set('h', height.toString());
        if (quality) url.searchParams.set('q', quality.toString());
        if (format) url.searchParams.set('f', format);
        
        return url.toString();
      }
      
      return src;
    } catch (error) {
      assetLogger.error('Failed to optimize image URL', { src, options }, error as Error);
      return src;
    }
  }
  
  // Generate srcset for responsive images
  static generateSrcSet(src: string, sizes: number[] = [640, 768, 1024, 1280, 1920]): string {
    const srcsetEntries = sizes.map(size => {
      const optimizedUrl = this.optimizeImageUrl(src, { width: size });
      return `${optimizedUrl} ${size}w`;
    });
    
    return srcsetEntries.join(', ');
  }
  
  // Generate picture element sources for modern formats
  static generatePictureSources(src: string, sizes: number[] = [640, 768, 1024, 1280, 1920]) {
    const sources = [];
    
    // AVIF sources (most modern)
    if (ASSET_CONFIG.formats.modern.includes('avif')) {
      const avifSrcset = sizes.map(size => {
        const url = this.optimizeImageUrl(src, { width: size, format: 'avif' });
        return `${url} ${size}w`;
      }).join(', ');
      
      sources.push({
        srcSet: avifSrcset,
        type: 'image/avif',
      });
    }
    
    // WebP sources
    if (ASSET_CONFIG.formats.modern.includes('webp')) {
      const webpSrcset = sizes.map(size => {
        const url = this.optimizeImageUrl(src, { width: size, format: 'webp' });
        return `${url} ${size}w`;
      }).join(', ');
      
      sources.push({
        srcSet: webpSrcset,
        type: 'image/webp',
      });
    }
    
    return sources;
  }
  
  // Preload critical images
  static preloadImage(src: string, options: {
    as?: 'image';
    fetchpriority?: 'high' | 'low' | 'auto';
    sizes?: string;
  } = {}): void {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = options.as || 'image';
    link.href = src;
    
    if (options.fetchpriority) {
      link.setAttribute('fetchpriority', options.fetchpriority);
    }
    
    if (options.sizes) {
      link.setAttribute('sizes', options.sizes);
    }
    
    document.head.appendChild(link);
    
    assetLogger.info('Image preloaded', { src, options });
  }
  
  // Lazy load images with intersection observer
  static setupLazyLoading(selector: string = 'img[data-lazy]'): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.lazy;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-lazy');
            observer.unobserve(img);
            
            assetLogger.info('Lazy image loaded', { src });
          }
        }
      });
    }, {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.1,
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  // Optimize CSS and fonts
  static optimizeCSS(): void {
    if (typeof window === 'undefined') return;
    
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-var-italic.woff2',
    ];
    
    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font;
      document.head.appendChild(link);
    });
    
    // Inline critical CSS for above-the-fold content
    this.inlineCriticalCSS();
  }
  
  // Inline critical CSS
  private static inlineCriticalCSS(): void {
    const criticalCSS = `
      /* Critical CSS for above-the-fold content */
      body { margin: 0; font-family: Inter, sans-serif; }
      .hero { min-height: 100vh; }
      .nav { position: fixed; top: 0; width: 100%; z-index: 1000; }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
  
  // Monitor asset performance
  static monitorAssetPerformance(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Log slow loading assets
          if (resourceEntry.duration > ASSET_CONFIG.performance.maxLoadTime) {
            assetLogger.warn('Slow asset detected', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType,
            });
          }
          
          // Log large assets
          if (resourceEntry.transferSize > ASSET_CONFIG.performance.maxImageSize) {
            assetLogger.warn('Large asset detected', {
              name: resourceEntry.name,
              size: resourceEntry.transferSize,
              type: resourceEntry.initiatorType,
            });
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
  
  // Compress images client-side (for uploads)
  static async compressImage(file: File, options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
  } = {}): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;
    
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: format,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, format, quality);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
  
  // Generate WebP fallback
  static generateWebPFallback(src: string): { webp: string; fallback: string } {
    const webpSrc = this.optimizeImageUrl(src, { format: 'webp' });
    return {
      webp: webpSrc,
      fallback: src,
    };
  }
}

// Asset preloading utilities
export const preloadCriticalAssets = (): void => {
  if (typeof window === 'undefined') return;
  
  // Preload critical images
  const criticalImages = [
    '/images/logo.webp',
    '/images/hero-bg.webp',
    '/images/course-preview.webp',
  ];
  
  criticalImages.forEach(src => {
    AssetOptimizer.preloadImage(src, { fetchpriority: 'high' });
  });
  
  // Preload critical CSS
  const criticalCSS = [
    '/styles/critical.css',
  ];
  
  criticalCSS.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
  
  assetLogger.info('Critical assets preloaded', {
    images: criticalImages.length,
    css: criticalCSS.length,
  });
};

// Service worker for asset caching
export const registerAssetServiceWorker = (): void => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      assetLogger.info('Service worker registered', {
        scope: registration.scope,
      });
      
      // Update service worker when new version is available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              assetLogger.info('New service worker available');
            }
          });
        }
      });
    })
    .catch(error => {
      assetLogger.error('Service worker registration failed', {}, error);
    });
};

// Initialize asset optimization
export const initializeAssetOptimization = (): void => {
  if (typeof window === 'undefined') return;
  
  // Setup lazy loading
  AssetOptimizer.setupLazyLoading();
  
  // Optimize CSS
  AssetOptimizer.optimizeCSS();
  
  // Monitor performance
  AssetOptimizer.monitorAssetPerformance();
  
  // Register service worker
  if (process.env.NODE_ENV === 'production') {
    registerAssetServiceWorker();
  }
  
  assetLogger.info('Asset optimization initialized');
};

export default AssetOptimizer;
