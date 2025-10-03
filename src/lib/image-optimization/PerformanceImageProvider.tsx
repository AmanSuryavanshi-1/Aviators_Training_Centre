'use client';

/**
 * Performance Image Provider Context
 * 
 * Lightweight React context for global image optimization settings
 * with zero re-render overhead and connection-aware configuration.
 */

import React, { createContext, useContext, useMemo, useRef, useEffect } from 'react';
import { ImageOptimizationConfig, LoadingPriority, ConnectionInfo } from './types';
import ImageLazyLoadService from './ImageLazyLoadService';

// Default performance-first configuration
const DEFAULT_CONFIG: ImageOptimizationConfig = {
  enableLazyLoading: true,
  defaultPriority: 'medium',
  rootMargin: '200px 0px', // Aggressive preloading for zero-lag experience
  threshold: 0.01, // Minimal threshold for early loading
  enablePerformanceTracking: true,
  fallbackImage: '/placeholder.svg',
  respectDataSaver: true,
  respectReducedMotion: true,
};

// Connection-aware configurations
const CONNECTION_CONFIGS = {
  '2g': {
    enableLazyLoading: true,
    defaultPriority: 'low' as LoadingPriority,
    rootMargin: '50px 0px', // Conservative preloading on slow connections
    threshold: 0.1,
    respectDataSaver: true,
  },
  '3g': {
    enableLazyLoading: true,
    defaultPriority: 'medium' as LoadingPriority,
    rootMargin: '100px 0px',
    threshold: 0.05,
    respectDataSaver: true,
  },
  '4g': {
    enableLazyLoading: true,
    defaultPriority: 'high' as LoadingPriority,
    rootMargin: '200px 0px', // Aggressive preloading on fast connections
    threshold: 0.01,
    respectDataSaver: false,
  },
  wifi: {
    enableLazyLoading: true,
    defaultPriority: 'high' as LoadingPriority,
    rootMargin: '300px 0px', // Very aggressive preloading on WiFi
    threshold: 0.01,
    respectDataSaver: false,
  },
};

interface PerformanceImageContextValue {
  config: ImageOptimizationConfig;
  connectionInfo: ConnectionInfo | null;
  lazyLoadService: ImageLazyLoadService;
  updateConfig: (updates: Partial<ImageOptimizationConfig>) => void;
  getOptimalConfig: () => ImageOptimizationConfig;
}

const PerformanceImageContext = createContext<PerformanceImageContextValue | null>(null);

interface PerformanceImageProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<ImageOptimizationConfig>;
  enableConnectionAwareness?: boolean;
}

export function PerformanceImageProvider({
  children,
  initialConfig = {},
  enableConnectionAwareness = true,
}: PerformanceImageProviderProps) {
  // Use refs to avoid re-renders when config changes
  const configRef = useRef<ImageOptimizationConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const connectionInfoRef = useRef<ConnectionInfo | null>(null);
  const lazyLoadServiceRef = useRef<ImageLazyLoadService>(ImageLazyLoadService.getInstance());

  // Detect connection information
  useEffect(() => {
    if (!enableConnectionAwareness || typeof navigator === 'undefined') {
      return;
    }

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        connectionInfoRef.current = {
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 50,
          saveData: connection.saveData || false,
        };

        // Update config based on connection
        const connectionConfig = CONNECTION_CONFIGS[connection.effectiveType] || CONNECTION_CONFIGS['4g'];
        configRef.current = {
          ...configRef.current,
          ...connectionConfig,
        };
      }
    };

    // Initial detection
    updateConnectionInfo();

    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateConnectionInfo);
      
      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, [enableConnectionAwareness]);

  // Detect user preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && configRef.current.respectReducedMotion) {
      configRef.current = {
        ...configRef.current,
        // Disable aggressive preloading for users who prefer reduced motion
        rootMargin: '50px 0px',
        threshold: 0.1,
      };
    }

    // Respect data saver preference
    const connection = (navigator as any).connection;
    if (connection?.saveData && configRef.current.respectDataSaver) {
      configRef.current = {
        ...configRef.current,
        // Conservative settings for data saver mode
        enableLazyLoading: true,
        defaultPriority: 'low',
        rootMargin: '25px 0px',
        threshold: 0.2,
      };
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<PerformanceImageContextValue>(() => ({
    config: configRef.current,
    connectionInfo: connectionInfoRef.current,
    lazyLoadService: lazyLoadServiceRef.current,
    
    updateConfig: (updates: Partial<ImageOptimizationConfig>) => {
      configRef.current = { ...configRef.current, ...updates };
    },
    
    getOptimalConfig: (): ImageOptimizationConfig => {
      const connection = connectionInfoRef.current;
      if (!connection) return configRef.current;

      // Return connection-aware configuration
      const connectionConfig = CONNECTION_CONFIGS[connection.effectiveType] || CONNECTION_CONFIGS['4g'];
      
      return {
        ...configRef.current,
        ...connectionConfig,
        // Override if data saver is enabled
        ...(connection.saveData && configRef.current.respectDataSaver ? {
          defaultPriority: 'low' as LoadingPriority,
          rootMargin: '25px 0px',
          threshold: 0.2,
        } : {}),
      };
    },
  }), []); // Empty dependency array since we use refs

  return (
    <PerformanceImageContext.Provider value={contextValue}>
      {children}
    </PerformanceImageContext.Provider>
  );
}

// Custom hook to use the performance image context
export function usePerformanceImage(): PerformanceImageContextValue {
  const context = useContext(PerformanceImageContext);
  
  if (!context) {
    throw new Error(
      'usePerformanceImage must be used within a PerformanceImageProvider. ' +
      'Make sure to wrap your component tree with <PerformanceImageProvider>.'
    );
  }
  
  return context;
}

// Hook for getting optimal image configuration
export function useOptimalImageConfig(): ImageOptimizationConfig {
  const { getOptimalConfig } = usePerformanceImage();
  return getOptimalConfig();
}

// Hook for connection-aware image loading
export function useConnectionAwareLoading(): {
  shouldLazyLoad: boolean;
  priority: LoadingPriority;
  rootMargin: string;
  isSlowConnection: boolean;
  isDataSaverEnabled: boolean;
} {
  const { connectionInfo, getOptimalConfig } = usePerformanceImage();
  const config = getOptimalConfig();
  
  const isSlowConnection = connectionInfo ? 
    (connectionInfo.effectiveType === '2g' || 
     (connectionInfo.effectiveType === '3g' && connectionInfo.downlink < 1.5)) : false;
  
  const isDataSaverEnabled = connectionInfo?.saveData || false;
  
  return {
    shouldLazyLoad: config.enableLazyLoading,
    priority: config.defaultPriority,
    rootMargin: config.rootMargin,
    isSlowConnection,
    isDataSaverEnabled,
  };
}

// Hook for performance metrics
export function useImagePerformanceMetrics() {
  const { lazyLoadService } = usePerformanceImage();
  
  return {
    getMetrics: () => lazyLoadService.getPerformanceMetrics(),
    preloadImage: (src: string, priority?: LoadingPriority) => 
      lazyLoadService.preload(src, priority),
  };
}

// Higher-order component for automatic performance optimization
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => {
    const { config } = usePerformanceImage();
    
    // Add performance optimization props if the component accepts them
    const enhancedProps = {
      ...props,
      // Add performance-related props that components can use
      performanceConfig: config,
    };
    
    return <Component {...enhancedProps} />;
  };
  
  WrappedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Utility function to get connection-aware image quality
export function getConnectionAwareQuality(connectionInfo: ConnectionInfo | null): number {
  if (!connectionInfo) return 85; // Default quality
  
  switch (connectionInfo.effectiveType) {
    case '2g':
      return connectionInfo.saveData ? 60 : 70;
    case '3g':
      return connectionInfo.saveData ? 70 : 80;
    case '4g':
      return connectionInfo.saveData ? 80 : 90;
    default:
      return 85;
  }
}

// Utility function to determine if image should be preloaded
export function shouldPreloadImage(
  priority: LoadingPriority,
  connectionInfo: ConnectionInfo | null
): boolean {
  if (priority === 'critical') return true;
  if (!connectionInfo) return priority === 'high';
  
  // Don't preload on slow connections or data saver mode
  if (connectionInfo.saveData) return false;
  if (connectionInfo.effectiveType === '2g') return false;
  if (connectionInfo.effectiveType === '3g' && connectionInfo.downlink < 1.5) return false;
  
  return priority === 'high';
}

export default PerformanceImageProvider;