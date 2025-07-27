import { setupGlobalErrorHandling } from './error-monitoring';
import { cleanupService } from './cleanup-service';

/**
 * Initializes the N8N automation system
 * This should be called once when the application starts
 */
export function initializeAutomationSystem(): void {
  console.log('Initializing N8N automation system...');

  try {
    // Set up global error handling
    setupGlobalErrorHandling();
    console.log('✓ Global error handling initialized');

    // Start cleanup service in production
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        cleanupService.start();
        console.log('✓ Cleanup service started');
      }, 30000); // 30 second delay to allow system initialization
    } else {
      console.log('ℹ Cleanup service not started in development mode');
    }

    console.log('✓ N8N automation system initialized successfully');

  } catch (error) {
    console.error('✗ Failed to initialize N8N automation system:', error);
    
    // Don't throw here as it would crash the application
    // Instead, log the error and continue with degraded functionality
  }
}

/**
 * Gracefully shuts down the automation system
 * This should be called when the application is shutting down
 */
export function shutdownAutomationSystem(): void {
  console.log('Shutting down N8N automation system...');

  try {
    // Stop cleanup service
    cleanupService.stop();
    console.log('✓ Cleanup service stopped');

    console.log('✓ N8N automation system shutdown complete');

  } catch (error) {
    console.error('✗ Error during automation system shutdown:', error);
  }
}

// Auto-initialize in production
if (process.env.NODE_ENV === 'production') {
  initializeAutomationSystem();

  // Set up graceful shutdown handlers
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    shutdownAutomationSystem();
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    shutdownAutomationSystem();
    process.exit(0);
  });
}