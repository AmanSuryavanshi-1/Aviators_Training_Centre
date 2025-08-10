// Emergency service worker cache clearing script
// Use this to resolve service worker issues in production

(function() {
  'use strict';
  
  console.log('🔧 Starting service worker cache cleanup...');
  
  // Function to clear all caches
  async function clearAllCaches() {
    try {
      const cacheNames = await caches.keys();
      console.log('Found caches:', cacheNames);
      
      const deletePromises = cacheNames.map(cacheName => {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      });
      
      await Promise.all(deletePromises);
      console.log('✅ All caches cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      return false;
    }
  }
  
  // Function to unregister service worker
  async function unregisterServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('Found service worker registrations:', registrations.length);
        
        const unregisterPromises = registrations.map(registration => {
          console.log('Unregistering service worker:', registration.scope);
          return registration.unregister();
        });
        
        await Promise.all(unregisterPromises);
        console.log('✅ All service workers unregistered successfully');
        return true;
      } catch (error) {
        console.error('❌ Error unregistering service workers:', error);
        return false;
      }
    } else {
      console.log('Service workers not supported');
      return true;
    }
  }
  
  // Function to force reload without cache
  function forceReload() {
    console.log('🔄 Forcing page reload...');
    // Clear browser cache and reload
    if ('caches' in window) {
      window.location.reload(true); // Force reload from server
    } else {
      window.location.href = window.location.href + '?nocache=' + Date.now();
    }
  }
  
  // Main cleanup function
  async function performCleanup() {
    console.log('🧹 Starting comprehensive cleanup...');
    
    // Step 1: Clear all caches
    const cachesCleared = await clearAllCaches();
    
    // Step 2: Unregister service workers
    const swUnregistered = await unregisterServiceWorker();
    
    // Step 3: Clear localStorage and sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Browser storage cleared');
    } catch (error) {
      console.error('❌ Error clearing browser storage:', error);
    }
    
    // Step 4: Show results
    if (cachesCleared && swUnregistered) {
      console.log('✅ Cleanup completed successfully!');
      
      // Show user notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 16px;
          text-align: center;
          max-width: 400px;
        ">
          ✅ Service Worker cache cleared!<br>
          <small style="opacity: 0.9;">The page will reload in 3 seconds...</small>
        </div>
      `;
      
      document.body.appendChild(notification.firstElementChild);
      
      // Auto-reload after 3 seconds
      setTimeout(forceReload, 3000);
    } else {
      console.log('⚠️ Cleanup completed with some errors. Manual reload recommended.');
      
      // Show error notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10000;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 16px;
          text-align: center;
          max-width: 400px;
          cursor: pointer;
        ">
          ⚠️ Partial cleanup completed<br>
          <small style="opacity: 0.9;">Click here to reload manually</small>
        </div>
      `;
      
      const notificationEl = notification.firstElementChild;
      document.body.appendChild(notificationEl);
      notificationEl.addEventListener('click', forceReload);
    }
  }
  
  // Auto-run if this script is loaded directly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', performCleanup);
  } else {
    performCleanup();
  }
  
  // Expose cleanup function globally for manual use
  window.clearServiceWorkerCache = performCleanup;
  
  console.log('💡 You can also run window.clearServiceWorkerCache() manually');
})();