/**
 * ImageLazyLoader Utility
 * 
 * Utility to automatically enhance existing img tags with lazy loading
 * without modifying component code. Perfect for legacy components
 * or third-party components that can't be easily refactored.
 */

import ImageLazyLoadService, { LoadingPriority } from './ImageLazyLoadService';
import { PerformanceMetricsCollector } from './index';

export interface ImageLazyLoaderOptions {
  selector: string;
  priority: LoadingPriority;
  rootMargin?: string;
  threshold?: number;
  placeholder?: string;
  fallbackSrc?: string;
  respectDataSaver?: boolean;
  enablePerformanceTracking?: boolean;
}

class ImageLazyLoader {
  private static instances = new Map<string, ImageLazyLoader>();
  private observer: IntersectionObserver | null = null;
  private lazyLoadService: ImageLazyLoadService;
  private metricsCollector: PerformanceMetricsCollector | null = null;
  private enhancedImages = new Set<HTMLImageElement>();
  private options: ImageLazyLoaderOptions;

  private constructor(options: ImageLazyLoaderOptions) {
    this.options = options;
    this.lazyLoadService = ImageLazyLoadService.getInstance();
    
    if (options.enablePerformanceTracking) {
      this.metricsCollector = PerformanceMetricsCollector.getInstance();
    }
    
    this.initializeObserver();
    this.enhanceExistingImages();
  }

  /**
   * Enhance images matching the selector with lazy loading
   */
  public static enhance(options: ImageLazyLoaderOptions): ImageLazyLoader {
    const key = `${options.selector}-${options.priority}`;
    
    if (!ImageLazyLoader.instances.has(key)) {
      ImageLazyLoader.instances.set(key, new ImageLazyLoader(options));
    }
    
    return ImageLazyLoader.instances.get(key)!;
  }

  /**
   * Cleanup a specific instance
   */
  public static cleanup(selector: string, priority: LoadingPriority): void {
    const key = `${selector}-${priority}`;
    const instance = ImageLazyLoader.instances.get(key);
    
    if (instance) {
      instance.destroy();
      ImageLazyLoader.instances.delete(key);
    }
  }

  /**
   * Cleanup all instances
   */
  public static cleanupAll(): void {
    ImageLazyLoader.instances.forEach(instance => instance.destroy());
    ImageLazyLoader.instances.clear();
  }

  private initializeObserver(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: this.options.rootMargin || '200px 0px',
        threshold: this.options.threshold || 0.01,
      }
    );
  }

  private enhanceExistingImages(): void {
    if (typeof document === 'undefined') return;

    const images = document.querySelectorAll(this.options.selector) as NodeListOf<HTMLImageElement>;
    
    images.forEach((img) => {
      this.enhanceImage(img);
    });

    // Set up mutation observer to catch dynamically added images
    this.setupMutationObserver();
  }

  private setupMutationObserver(): void {
    if (typeof window === 'undefined' || !('MutationObserver' in window)) {
      return;
    }

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if the added element is an image matching our selector
            if (element.matches && element.matches(this.options.selector)) {
              this.enhanceImage(element as HTMLImageElement);
            }
            
            // Check for images within the added element
            const images = element.querySelectorAll?.(this.options.selector) as NodeListOf<HTMLImageElement>;
            images?.forEach((img) => {
              this.enhanceImage(img);
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private enhanceImage(img: HTMLImageElement): void {
    if (this.enhancedImages.has(img)) return;

    // Store original src
    const originalSrc = img.src || img.getAttribute('data-src') || '';
    if (!originalSrc) return;

    // Mark as enhanced
    this.enhancedImages.add(img);

    // Add performance tracking
    if (this.metricsCollector) {
      this.metricsCollector.startTracking(img, originalSrc, this.options.priority, true);
    }

    // Handle critical priority images (load immediately)
    if (this.options.priority === 'critical') {
      this.loadImage(img);
      return;
    }

    // Set up lazy loading
    if (this.observer) {
      // Clear src to prevent immediate loading
      img.removeAttribute('src');
      img.setAttribute('data-lazy-src', originalSrc);
      
      // Add placeholder if specified
      if (this.options.placeholder) {
        img.src = this.options.placeholder;
      }
      
      // Add loading class
      img.classList.add('lazy-loading');
      
      // Start observing
      this.observer.observe(img);
    } else {
      // Fallback: use native lazy loading
      img.loading = 'lazy';
    }

    // Add error handling
    img.addEventListener('error', () => {
      if (this.options.fallbackSrc && img.src !== this.options.fallbackSrc) {
        img.src = this.options.fallbackSrc;
      }
      
      if (this.metricsCollector) {
        this.metricsCollector.markAsError(img, 'Image load failed');
      }
    });

    // Add load success handling
    img.addEventListener('load', () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      if (this.metricsCollector) {
        this.metricsCollector.markAsLoaded(img);
      }
    });
  }

  private loadImage(img: HTMLImageElement): void {
    const lazySrc = img.getAttribute('data-lazy-src');
    if (lazySrc) {
      img.src = lazySrc;
      img.removeAttribute('data-lazy-src');
    }
  }

  /**
   * Manually enhance a specific image element
   */
  public enhanceImageElement(img: HTMLImageElement): void {
    this.enhanceImage(img);
  }

  /**
   * Get enhanced images count
   */
  public getEnhancedImagesCount(): number {
    return this.enhancedImages.size;
  }

  /**
   * Check if an image is enhanced
   */
  public isImageEnhanced(img: HTMLImageElement): boolean {
    return this.enhancedImages.has(img);
  }

  /**
   * Destroy this instance and cleanup resources
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Cleanup enhanced images
    this.enhancedImages.forEach((img) => {
      img.classList.remove('lazy-loading', 'lazy-loaded');
      
      if (this.metricsCollector) {
        this.metricsCollector.stopTracking(img);
      }
    });

    this.enhancedImages.clear();
  }
}

// Utility functions for common use cases

/**
 * Enhance all images in a container with lazy loading
 */
export function enhanceImagesInContainer(
  container: Element | string,
  priority: LoadingPriority = 'medium'
): ImageLazyLoader {
  const selector = typeof container === 'string' 
    ? `${container} img` 
    : `img`;
    
  return ImageLazyLoader.enhance({
    selector,
    priority,
    rootMargin: '200px 0px',
    threshold: 0.01,
    enablePerformanceTracking: true,
    respectDataSaver: true,
  });
}

/**
 * Enhance blog post images with optimized settings
 */
export function enhanceBlogImages(): ImageLazyLoader {
  return ImageLazyLoader.enhance({
    selector: '.blog-content img, .post-content img, [data-blog-image]',
    priority: 'medium',
    rootMargin: '150px 0px',
    threshold: 0.1,
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlmYTJhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
    fallbackSrc: '/placeholder-blog.jpg',
    enablePerformanceTracking: true,
    respectDataSaver: true,
  });
}

/**
 * Enhance testimonial images with optimized settings
 */
export function enhanceTestimonialImages(): ImageLazyLoader {
  return ImageLazyLoader.enhance({
    selector: '.testimonial img, [data-testimonial-image]',
    priority: 'low',
    rootMargin: '100px 0px',
    threshold: 0.1,
    fallbackSrc: '/placeholder-testimonial.jpg',
    enablePerformanceTracking: true,
    respectDataSaver: true,
  });
}

/**
 * Enhance gallery images with progressive loading
 */
export function enhanceGalleryImages(): ImageLazyLoader {
  return ImageLazyLoader.enhance({
    selector: '.gallery img, .image-grid img, [data-gallery-image]',
    priority: 'low',
    rootMargin: '50px 0px',
    threshold: 0.2,
    enablePerformanceTracking: true,
    respectDataSaver: true,
  });
}

export default ImageLazyLoader;