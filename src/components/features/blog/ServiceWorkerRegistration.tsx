"use client";

import { useEffect } from 'react';

const ServiceWorkerRegistration: React.FC = () => {
  useEffect(() => {
    // Only register service worker in production for better Core Web Vitals
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'imports', // Cache imports for better performance
      });

      console.log('Service Worker registered successfully:', registration);

      // Preload critical resources immediately for Core Web Vitals optimization
      if (registration.active) {
        registration.active.postMessage({
          type: 'PRELOAD_CRITICAL_RESOURCES',
          resources: [
            '/fonts/inter-regular.woff2',
            '/fonts/inter-semibold.woff2',
            '/fonts/inter-bold.woff2',
            '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png',
            '/AVIATORS_TRAINING_CENTRE_LOGO_DarkMode.png',
          ],
        });
      }

      // Handle service worker updates with better UX
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('New service worker available');
              
              // Show a subtle notification instead of intrusive alert
              showUpdateNotification();
            }
          });
        }
      });

      // Handle service worker messages for performance monitoring
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload);
        }
        
        if (event.data && event.data.type === 'PERFORMANCE_METRIC') {
          // Report performance metrics from service worker
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'sw_performance', {
              event_category: 'Service Worker',
              event_label: event.data.metric,
              value: event.data.value,
              non_interaction: true,
            });
          }
        }
      });

      // Periodic update check for fresh content (every 30 minutes)
      setInterval(() => {
        registration.update();
      }, 30 * 60 * 1000);

      // Handle offline/online events for better UX
      window.addEventListener('online', () => {
        console.log('Back online - syncing data');
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SYNC_DATA',
          });
        }
        hideOfflineIndicator();
      });

      window.addEventListener('offline', () => {
        console.log('Gone offline - cached content available');
        showOfflineIndicator();
      });

      // Register for background sync if supported
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          // Background sync registration (if supported by browser)
          if ('sync' in registration) {
            (registration as any).sync.register('background-sync');
            console.log('Background sync registered');
          }
        } catch (error) {
          console.log('Background sync registration failed:', error);
        }
      }

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const showUpdateNotification = () => {
    // Create a subtle update notification for better UX
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
      ">
        ✨ New content available! Click to refresh
      </div>
    `;
    
    const notificationEl = notification.firstElementChild as HTMLElement;
    document.body.appendChild(notificationEl);
    
    // Add hover effect
    notificationEl.addEventListener('mouseenter', () => {
      notificationEl.style.transform = 'translateY(-2px)';
      notificationEl.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
    });
    
    notificationEl.addEventListener('mouseleave', () => {
      notificationEl.style.transform = 'translateY(0)';
      notificationEl.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });
    
    notificationEl.addEventListener('click', () => {
      // Smooth reload with loading indicator
      notificationEl.innerHTML = '🔄 Refreshing...';
      notificationEl.style.background = '#6b7280';
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
    
    // Auto-hide after 15 seconds
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.style.opacity = '0';
        notificationEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
          notificationEl.remove();
        }, 300);
      }
    }, 15000);
  };

  const showOfflineIndicator = () => {
    // Show offline indicator with better styling
    if (document.getElementById('offline-indicator')) return; // Prevent duplicates
    
    const offlineIndicator = document.createElement('div');
    offlineIndicator.innerHTML = `
      <div id="offline-indicator" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 8px;
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        📡 You're offline. Browsing cached content.
      </div>
    `;
    
    const indicatorEl = offlineIndicator.firstElementChild as HTMLElement;
    document.body.appendChild(indicatorEl);
    
    // Slide in animation
    setTimeout(() => {
      indicatorEl.style.transform = 'translateY(0)';
    }, 100);
  };

  const hideOfflineIndicator = () => {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        if (indicator.parentNode) {
          indicator.remove();
        }
      }, 300);
    }
  };

  return null; // This component doesn't render anything
};

export default ServiceWorkerRegistration;
