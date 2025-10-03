'use client';

/**
 * Hero Image Performance Monitor
 * 
 * Monitors and reports on hero image loading performance
 * for Core Web Vitals optimization.
 */

import { useEffect, useRef } from 'react';
import { PerformanceMetricsCollector, analyzePerformanceMetrics } from '@/lib/image-optimization';

interface HeroImagePerformanceMonitorProps {
  slideCount: number;
  currentSlide: number;
  onPerformanceUpdate?: (metrics: {
    averageLoadTime: number;
    lcpCandidate: boolean;
    recommendations: string[];
  }) => void;
}

export const HeroImagePerformanceMonitor: React.FC<HeroImagePerformanceMonitorProps> = ({
  slideCount,
  currentSlide,
  onPerformanceUpdate,
}) => {
  const metricsCollector = useRef<PerformanceMetricsCollector | null>(null);
  const performanceObserver = useRef<PerformanceObserver | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize metrics collector
    metricsCollector.current = PerformanceMetricsCollector.getInstance();

    // Monitor LCP specifically for hero images
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcpEntry = entry as PerformanceEntry & { element?: Element };
            
            // Check if LCP element is our hero image
            if (lcpEntry.element && lcpEntry.element.tagName === 'IMG') {
              const isHeroImage = lcpEntry.element.closest('[data-hero-image]');
              
              if (isHeroImage && onPerformanceUpdate) {
                onPerformanceUpdate({
                  averageLoadTime: entry.startTime,
                  lcpCandidate: true,
                  recommendations: entry.startTime > 2500 
                    ? ['Hero image LCP is too slow, consider optimizing image size and format']
                    : [],
                });
              }
            }
          }
        });
      });

      try {
        performanceObserver.current.observe({
          entryTypes: ['largest-contentful-paint'],
          buffered: true,
        });
      } catch (error) {
        console.warn('LCP observation not supported:', error);
      }
    }

    // Monitor overall hero image performance
    const performanceCheckInterval = setInterval(() => {
      if (metricsCollector.current) {
        const allMetrics = metricsCollector.current.getAllMetrics();
        const heroMetrics = allMetrics.filter(m => 
          m.priority === 'critical' || m.imageId.includes('hero')
        );

        if (heroMetrics.length > 0) {
          const analysis = analyzePerformanceMetrics(heroMetrics);
          const averageLoadTime = heroMetrics.reduce((sum, m) => sum + m.loadTime, 0) / heroMetrics.length;

          onPerformanceUpdate?.({
            averageLoadTime,
            lcpCandidate: heroMetrics.some(m => m.loadTime < 2500),
            recommendations: analysis.recommendations,
          });
        }
      }
    }, 5000); // Check every 5 seconds

    return () => {
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      clearInterval(performanceCheckInterval);
    };
  }, [onPerformanceUpdate]);

  // Monitor slide changes for performance impact
  useEffect(() => {
    if (metricsCollector.current) {
      const summary = metricsCollector.current.getPerformanceSummary();
      
      // Log performance metrics for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Hero Performance Summary:', {
          currentSlide,
          totalImages: summary.totalImages,
          averageLoadTime: summary.averageLoadTime,
          criticalImages: summary.priorityBreakdown.critical,
        });
      }
    }
  }, [currentSlide]);

  // This component doesn't render anything visible
  return null;
};

export default HeroImagePerformanceMonitor;