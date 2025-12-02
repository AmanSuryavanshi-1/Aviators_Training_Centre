// Enhanced Service Worker for Core Web Vitals Optimization
const CACHE_VERSION = 'v1754837742124'; // Updated timestamp for cache refresh
const STATIC_CACHE_NAME = `aviators-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `aviators-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `aviators-images-${CACHE_VERSION}`;
const API_CACHE_NAME = `aviators-api-${CACHE_VERSION}`;

// Critical resources to cache immediately for LCP optimization
const CRITICAL_ASSETS = [
  '/',
  '/blog',
  '/fonts/inter-regular.woff2',
  '/fonts/inter-semibold.woff2',
  '/fonts/inter-bold.woff2',
  '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png',
  '/AVIATORS_TRAINING_CENTRE_LOGO_DarkMode.png',
  '/placeholder.svg',
];

// Additional static assets for performance
const STATIC_ASSETS = [
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Static assets - Cache first
  static: [
    /\/_next\/static\//,
    /\/fonts\//,
    /\.woff2$/,
    /\.woff$/,
    /\.ttf$/,
    /\.eot$/,
  ],

  // Images - Cache first with fallback
  images: [
    /\.jpg$/,
    /\.jpeg$/,
    /\.png$/,
    /\.webp$/,
    /\.avif$/,
    /\.svg$/,
    /cdn\.sanity\.io/,
  ],

  // API calls - Network first with cache fallback
  api: [
    /\/api\//,
    /\.sanity\.io/,
  ],

  // Blog pages - Stale while revalidate
  pages: [
    /\/blog\//,
  ],
};

// Install event - cache critical assets for Core Web Vitals
self.addEventListener('install', (event) => {
  console.log('Enhanced Service Worker installing for Core Web Vitals...');

  event.waitUntil(
    Promise.allSettled([
      // Cache critical assets first for LCP optimization
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        console.log('Caching critical assets for LCP...');
        const cachePromises = CRITICAL_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cache.put(asset, response);
              console.log('Cached:', asset);
            } else {
              console.warn('Failed to fetch asset:', asset, response.status);
            }
          } catch (error) {
            console.warn('Error caching asset:', asset, error.message);
          }
        });

        await Promise.allSettled(cachePromises);
        return 'critical-assets-cached';
      }),

      // Cache additional static assets
      caches.open(STATIC_CACHE_NAME).then(async (cache) => {
        console.log('Caching additional static assets...');
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cache.put(asset, response);
              console.log('Cached static asset:', asset);
            } else {
              console.warn('Static asset not found:', asset, response.status);
            }
          } catch (error) {
            console.warn('Error caching static asset:', asset, error.message);
          }
        });

        await Promise.allSettled(cachePromises);
        return 'static-assets-cached';
      })
    ])
      .then((results) => {
        console.log('Service Worker installation completed');
        console.log('Installation results:', results);

        // Report installation success for monitoring
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PERFORMANCE_METRIC',
              metric: 'sw_install_success',
              value: 1,
              timestamp: Date.now()
            });
          });
        });

        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker installation failed:', error);

        // Report installation failure
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PERFORMANCE_METRIC',
              metric: 'sw_install_failure',
              value: 1,
              timestamp: Date.now()
            });
          });
        });

        // Don't prevent installation, just log the error
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and optimize for Core Web Vitals
self.addEventListener('activate', (event) => {
  console.log('Enhanced Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim clients immediately for better performance
      self.clients.claim()
    ])
      .then(() => {
        console.log('Service Worker activated successfully');
        // Report activation success
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'PERFORMANCE_METRIC',
              metric: 'sw_activate_success',
              value: 1,
              timestamp: Date.now()
            });
          });
        });
      })
      .catch((error) => {
        console.error('Service Worker activation failed:', error);
      })
  );
});

// Message event - handle commands from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_CRITICAL_RESOURCES') {
    event.waitUntil(preloadCriticalResources(event.data.resources));
  }

  if (event.data && event.data.type === 'SYNC_DATA') {
    event.waitUntil(syncOfflineData());
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

// Preload critical resources for LCP optimization
async function preloadCriticalResources(resources) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const preloadPromises = resources.map(async (resource) => {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response);
          console.log('Preloaded critical resource:', resource);
        }
      } catch (error) {
        console.warn('Failed to preload resource:', resource, error);
      }
    });

    await Promise.allSettled(preloadPromises);
    console.log('Critical resources preloading completed');
  } catch (error) {
    console.error('Critical resources preloading failed:', error);
  }
}

// Sync offline data when back online
async function syncOfflineData() {
  try {
    // Sync any queued analytics data
    await syncAnalytics();

    // Update dynamic caches with fresh content
    const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedRequests = await dynamicCache.keys();

    // Update blog posts and API responses
    const updatePromises = cachedRequests
      .filter(request => request.url.includes('/blog') || request.url.includes('/api'))
      .map(async (request) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await dynamicCache.put(request, response);
          }
        } catch (error) {
          console.warn('Failed to update cached resource:', request.url);
        }
      });

    await Promise.allSettled(updatePromises);
    console.log('Offline data sync completed');
  } catch (error) {
    console.error('Offline data sync failed:', error);
  }
}

// Clear all caches (for debugging/maintenance)
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('All caches cleared');
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  try {
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
      return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
      return;
    }

    // Skip requests with no-cache headers
    if (request.headers.get('cache-control') === 'no-cache') {
      return;
    }

    // Skip requests to localhost during development
    if (url.hostname === 'localhost' && url.port !== '3000') {
      return;
    }

    event.respondWith(handleRequest(request));
  } catch (error) {
    console.error('Error in fetch event listener:', error);
    // Let the browser handle the request if there's an error
    return;
  }
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Skip requests to chrome-extension, moz-extension, etc.
    if (!url.protocol.startsWith('http')) {
      return fetch(request);
    }

    // Skip requests to different origins unless it's a known CDN
    if (url.origin !== self.location.origin &&
      !url.hostname.includes('cdn.sanity.io') &&
      !url.hostname.includes('images.unsplash.com')) {
      return fetch(request);
    }

    // Static assets - Cache first
    if (matchesPattern(url.href, CACHE_STRATEGIES.static)) {
      return await cacheFirst(request, STATIC_CACHE_NAME);
    }

    // Images - Cache first with fallback
    if (matchesPattern(url.href, CACHE_STRATEGIES.images)) {
      return await cacheFirstWithFallback(request, IMAGE_CACHE_NAME);
    }

    // API calls - Network first
    if (matchesPattern(url.href, CACHE_STRATEGIES.api)) {
      return await networkFirst(request, API_CACHE_NAME);
    }

    // Blog pages - Stale while revalidate
    if (matchesPattern(url.href, CACHE_STRATEGIES.pages)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
    }

    // Default - Network first with timeout
    return await networkFirstWithTimeout(request, DYNAMIC_CACHE_NAME, 5000);

  } catch (error) {
    console.error('Service Worker fetch error:', error);

    // Try to return a cached response as fallback
    try {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }

    // Final fallback - let the browser handle it
    return fetch(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request, {
      mode: 'cors',
      credentials: 'same-origin'
    });

    if (networkResponse.ok) {
      // Clone before caching to avoid consuming the response
      const responseToCache = networkResponse.clone();
      cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    console.error('Network request failed for:', request.url, error);

    // Return a fallback response for critical assets
    if (request.url.includes('fonts/') || request.url.includes('logo')) {
      return new Response('', {
        status: 404,
        statusText: 'Asset not found',
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    throw error;
  }
}

// Cache first with fallback strategy
async function cacheFirstWithFallback(request, cacheName) {
  try {
    return await cacheFirst(request, cacheName);
  } catch (error) {
    // Return placeholder image for failed image requests
    if (request.destination === 'image') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return await cache.match('/placeholder.svg');
    }
    throw error;
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request, {
      mode: 'cors',
      credentials: 'same-origin',
      cache: 'default'
    });

    if (networkResponse.ok) {
      // Only cache successful responses
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return a fallback response instead of throwing
    if (request.destination === 'image') {
      return new Response('', { status: 404, statusText: 'Image not found' });
    }

    // For other resources, return a minimal response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to fetch from network in background
  const networkResponsePromise = fetch(request, {
    mode: 'cors',
    credentials: 'same-origin'
  })
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('Background fetch failed:', error);
      return null;
    });

  // Return cached response immediately if available
  if (cachedResponse) {
    // Don't await the network promise, let it update in background
    networkResponsePromise.catch(() => { }); // Prevent unhandled rejection
    return cachedResponse;
  }

  // If no cached response, wait for network
  const networkResponse = await networkResponsePromise;
  if (networkResponse) {
    return networkResponse;
  }

  // Final fallback
  return new Response('Content not available', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/plain' }
  });
}

// Network first with timeout strategy
async function networkFirstWithTimeout(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeout);
    });

    // Race between network request and timeout
    const networkResponse = await Promise.race([
      fetch(request, {
        mode: 'cors',
        credentials: 'same-origin'
      }),
      timeoutPromise
    ]);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network request timed out or failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return a fallback response
    return new Response('Service temporarily unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Helper function to match URL patterns
function matchesPattern(url, patterns) {
  return patterns.some(pattern => pattern.test(url));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'blog-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync any pending analytics data when back online
  try {
    const cache = await caches.open('analytics-queue');
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.log('Failed to sync analytics:', error);
      }
    }
  } catch (error) {
    console.error('Analytics sync failed:', error);
  }
}

// Push notifications for blog updates (if needed in future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png',
      badge: '/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png',
      data: data.url,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

console.log('Service Worker loaded successfully');