/**
 * Monitoring system initialization
 * This file should be imported in the main application entry point
 */

import { initializeSystemMonitoring } from './startup';

// Initialize monitoring system
let monitoringInitialized = false;

export function ensureMonitoringInitialized() {
  if (monitoringInitialized) {
    return;
  }

  try {
    initializeSystemMonitoring();
    monitoringInitialized = true;
    console.log('✅ Monitoring system initialization completed');
  } catch (error) {
    console.error('❌ Failed to initialize monitoring system:', error);
  }
}

// Auto-initialize in production or when explicitly enabled
if (typeof window === 'undefined') { // Server-side only
  const shouldAutoInit = 
    process.env.NODE_ENV === 'production' || 
    process.env.ENABLE_MONITORING === 'true' ||
    process.env.VERCEL_ENV === 'production';

  if (shouldAutoInit) {
    ensureMonitoringInitialized();
  }
}
