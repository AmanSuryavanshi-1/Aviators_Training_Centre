import { initializeMonitoring } from './automated-monitoring';

/**
 * Initialize monitoring system on application startup
 * This should be called in the main application entry point
 */
export function initializeSystemMonitoring() {
  // Only initialize in production or when explicitly enabled
  const shouldInitialize = 
    process.env.NODE_ENV === 'production' || 
    process.env.ENABLE_MONITORING === 'true' ||
    process.env.VERCEL_ENV === 'production';

  if (!shouldInitialize) {
    console.log('🔍 Monitoring system disabled in development mode');
    return null;
  }

  console.log('🚀 Initializing system monitoring...');

  const config = {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '15'), // minutes
    maintenanceEnabled: process.env.MAINTENANCE_ENABLED !== 'false',
    alertingEnabled: process.env.ALERTING_ENABLED !== 'false',
    autoStart: true
  };

  try {
    const monitoringService = initializeMonitoring(config);
    console.log('✅ System monitoring initialized successfully');
    return monitoringService;
  } catch (error) {
    console.error('❌ Failed to initialize system monitoring:', error);
    return null;
  }
}

/**
 * Health check endpoint for external monitoring systems
 */
export async function getSystemHealthSummary() {
  try {
    const { getGlobalMonitoringService } = await import('./automated-monitoring');
    const monitoringService = getGlobalMonitoringService();
    const status = monitoringService.getStatus();

    return {
      status: status.health.current?.overall || 'unknown',
      uptime: status.health.uptime,
      isMonitoring: status.isRunning,
      needsAttention: status.health.needsAttention,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'critical',
      uptime: 0,
      isMonitoring: false,
      needsAttention: true,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
