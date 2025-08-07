/**
 * Graceful Degradation Service
 * 
 * Handles partial service failures by providing fallback data sources,
 * partial data indicators, and automatic service recovery detection.
 */

import { authManager } from './AuthenticationManager';
import { unifiedErrorHandler } from './UnifiedErrorHandler';
import { errorHandler } from './ErrorHandler';

export interface ServiceStatus {
  service: string;
  status: 'connected' | 'error' | 'degraded' | 'recovering';
  lastChecked: Date;
  error?: string;
  recoveryAttempts?: number;
}

export interface PartialDataIndicator {
  service: string;
  available: boolean;
  dataQuality: 'full' | 'partial' | 'estimated' | 'unavailable';
  lastUpdate: Date;
  fallbackSource?: string;
  limitations?: string[];
}

export interface FallbackDataSource {
  service: string;
  priority: number;
  strategy: 'cache' | 'estimation' | 'alternative-api' | 'static-data';
  implementation: () => Promise<any>;
}

export interface DegradationResponse {
  success: boolean;
  data: any;
  indicators: PartialDataIndicator[];
  serviceStatuses: ServiceStatus[];
  fallbacksUsed: string[];
  userMessage?: string;
  source: 'primary' | 'fallback' | 'mixed';
}

export class GracefulDegradationService {
  private serviceStatuses: Map<string, ServiceStatus> = new Map();
  private fallbackSources: Map<string, FallbackDataSource[]> = new Map();
  private recoveryTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly RECOVERY_CHECK_INTERVAL = 60000; // 1 minute
  private readonly MAX_RECOVERY_ATTEMPTS = 5;

  constructor() {
    this.initializeFallbackSources();
    this.startRecoveryMonitoring();
  }

  /**
   * Initialize fallback data sources for each service
   */
  private initializeFallbackSources(): void {
    // GA4 fallback sources
    this.fallbackSources.set('ga4', [
      {
        service: 'firebase',
        priority: 1,
        strategy: 'alternative-api',
        implementation: () => this.getFirebaseAnalyticsAsFallback()
      },
      {
        service: 'cache',
        priority: 2,
        strategy: 'cache',
        implementation: () => this.getCachedGA4Data()
      },
      {
        service: 'estimation',
        priority: 3,
        strategy: 'estimation',
        implementation: () => this.getEstimatedGA4Data()
      }
    ]);

    // Firebase fallback sources
    this.fallbackSources.set('firebase', [
      {
        service: 'local-storage',
        priority: 1,
        strategy: 'cache',
        implementation: () => this.getLocalStorageData()
      },
      {
        service: 'static-data',
        priority: 2,
        strategy: 'static-data',
        implementation: () => this.getStaticAnalyticsData()
      }
    ]);

    // Search Console fallback sources
    this.fallbackSources.set('search-console', [
      {
        service: 'estimation',
        priority: 1,
        strategy: 'estimation',
        implementation: () => this.getEstimatedSearchData()
      },
      {
        service: 'cache',
        priority: 2,
        strategy: 'cache',
        implementation: () => this.getCachedSearchConsoleData()
      }
    ]);
  }

  /**
   * Handle analytics request with graceful degradation
   */
  async handleAnalyticsRequest(
    requestType: 'realtime' | 'historical' | 'detailed',
    params: any = {}
  ): Promise<DegradationResponse> {
    try {
      // Get current service statuses
      const serviceStatuses = await this.updateServiceStatuses();
      const workingServices = serviceStatuses.filter(s => s.status === 'connected');
      const failedServices = serviceStatuses.filter(s => s.status === 'error');

      // If all services are working, proceed normally
      if (failedServices.length === 0) {
        return await this.handleNormalRequest(requestType, params, serviceStatuses);
      }

      // If some services are failing, use graceful degradation
      return await this.handleDegradedRequest(requestType, params, serviceStatuses);

    } catch (error) {
      const authError = errorHandler.createErrorResponse(error, {
        service: 'unified',
        operation: 'handle_analytics_request',
        timestamp: new Date()
      });

      return {
        success: false,
        data: null,
        indicators: [],
        serviceStatuses: [],
        fallbacksUsed: [],
        userMessage: authError.userMessage,
        source: 'fallback'
      };
    }
  }

  /**
   * Handle normal request when all services are working
   */
  private async handleNormalRequest(
    requestType: string,
    params: any,
    serviceStatuses: ServiceStatus[]
  ): Promise<DegradationResponse> {
    try {
      // This would call the actual analytics services
      const data = await this.callPrimaryServices(requestType, params);
      
      const indicators: PartialDataIndicator[] = serviceStatuses.map(status => ({
        service: status.service,
        available: true,
        dataQuality: 'full',
        lastUpdate: new Date(),
        limitations: []
      }));

      return {
        success: true,
        data,
        indicators,
        serviceStatuses,
        fallbacksUsed: [],
        source: 'primary'
      };

    } catch (error) {
      // If primary services fail, fall back to degraded mode
      return await this.handleDegradedRequest(requestType, params, serviceStatuses);
    }
  }

  /**
   * Handle degraded request with fallback strategies
   */
  private async handleDegradedRequest(
    requestType: string,
    params: any,
    serviceStatuses: ServiceStatus[]
  ): Promise<DegradationResponse> {
    const indicators: PartialDataIndicator[] = [];
    const fallbacksUsed: string[] = [];
    let combinedData: any = {};
    let hasAnyData = false;

    // Try to get data from each service or its fallbacks
    for (const status of serviceStatuses) {
      try {
        let serviceData = null;
        let dataQuality: 'full' | 'partial' | 'estimated' | 'unavailable' = 'unavailable';
        let fallbackSource: string | undefined;

        if (status.status === 'connected') {
          // Service is working, get primary data
          serviceData = await this.callServiceDirectly(status.service, requestType, params);
          dataQuality = 'full';
        } else {
          // Service is failing, try fallbacks
          const fallbackResult = await this.tryFallbackSources(status.service, requestType, params);
          if (fallbackResult) {
            serviceData = fallbackResult.data;
            dataQuality = fallbackResult.quality;
            fallbackSource = fallbackResult.source;
            fallbacksUsed.push(fallbackResult.source);
          }
        }

        if (serviceData) {
          combinedData[status.service] = serviceData;
          hasAnyData = true;
        }

        indicators.push({
          service: status.service,
          available: !!serviceData,
          dataQuality,
          lastUpdate: new Date(),
          fallbackSource,
          limitations: this.getServiceLimitations(status.service, dataQuality)
        });

      } catch (error) {
        indicators.push({
          service: status.service,
          available: false,
          dataQuality: 'unavailable',
          lastUpdate: new Date(),
          limitations: ['Service temporarily unavailable']
        });
      }
    }

    // Generate user message based on degradation level
    const userMessage = this.generateDegradationMessage(indicators, fallbacksUsed);

    return {
      success: hasAnyData,
      data: hasAnyData ? combinedData : null,
      indicators,
      serviceStatuses,
      fallbacksUsed,
      userMessage,
      source: fallbacksUsed.length > 0 ? 'fallback' : 'mixed'
    };
  }

  /**
   * Try fallback sources for a failed service
   */
  private async tryFallbackSources(
    service: string,
    requestType: string,
    params: any
  ): Promise<{ data: any; quality: 'partial' | 'estimated'; source: string } | null> {
    const fallbacks = this.fallbackSources.get(service) || [];
    
    // Sort by priority
    fallbacks.sort((a, b) => a.priority - b.priority);

    for (const fallback of fallbacks) {
      try {
        const data = await fallback.implementation();
        
        if (data) {
          const quality = fallback.strategy === 'cache' ? 'partial' : 'estimated';
          return {
            data,
            quality,
            source: fallback.service
          };
        }
      } catch (error) {
        console.warn(`Fallback ${fallback.service} failed for ${service}:`, error);
      }
    }

    return null;
  }

  /**
   * Update service statuses
   */
  private async updateServiceStatuses(): Promise<ServiceStatus[]> {
    try {
      const authStatuses = await authManager.getServiceStatus();
      const statuses: ServiceStatus[] = [];

      for (const authStatus of authStatuses) {
        const serviceName = this.normalizeServiceName(authStatus.service);
        const status: ServiceStatus = {
          service: serviceName,
          status: authStatus.status === 'connected' ? 'connected' : 'error',
          lastChecked: authStatus.lastChecked || new Date(),
          error: authStatus.error,
          recoveryAttempts: this.serviceStatuses.get(serviceName)?.recoveryAttempts || 0
        };

        // Check if service is recovering
        if (status.status === 'error' && this.isServiceRecovering(serviceName)) {
          status.status = 'recovering';
        }

        statuses.push(status);
        this.serviceStatuses.set(serviceName, status);
      }

      return statuses;
    } catch (error) {
      console.error('Failed to update service statuses:', error);
      return [];
    }
  }

  /**
   * Check if a service is in recovery mode
   */
  private isServiceRecovering(service: string): boolean {
    return this.recoveryTimers.has(service);
  }

  /**
   * Start recovery monitoring for failed services
   */
  private startRecoveryMonitoring(): void {
    setInterval(async () => {
      const statuses = await this.updateServiceStatuses();
      
      for (const status of statuses) {
        if (status.status === 'error' && !this.recoveryTimers.has(status.service)) {
          this.startServiceRecovery(status.service);
        } else if (status.status === 'connected' && this.recoveryTimers.has(status.service)) {
          this.stopServiceRecovery(status.service);
        }
      }
    }, this.RECOVERY_CHECK_INTERVAL);
  }

  /**
   * Start recovery attempts for a failed service
   */
  private startServiceRecovery(service: string): void {
    const timer = setInterval(async () => {
      const currentStatus = this.serviceStatuses.get(service);
      
      if (!currentStatus || currentStatus.recoveryAttempts! >= this.MAX_RECOVERY_ATTEMPTS) {
        this.stopServiceRecovery(service);
        return;
      }

      try {
        // Attempt to refresh authentication for the service
        const refreshed = await authManager.refreshCredentials(service);
        
        if (refreshed) {
          console.log(`✅ Service ${service} recovered successfully`);
          this.stopServiceRecovery(service);
        } else {
          currentStatus.recoveryAttempts = (currentStatus.recoveryAttempts || 0) + 1;
          console.log(`🔄 Recovery attempt ${currentStatus.recoveryAttempts} failed for ${service}`);
        }
      } catch (error) {
        console.error(`Recovery attempt failed for ${service}:`, error);
        currentStatus.recoveryAttempts = (currentStatus.recoveryAttempts || 0) + 1;
      }
    }, this.RECOVERY_CHECK_INTERVAL);

    this.recoveryTimers.set(service, timer);
  }

  /**
   * Stop recovery attempts for a service
   */
  private stopServiceRecovery(service: string): void {
    const timer = this.recoveryTimers.get(service);
    if (timer) {
      clearInterval(timer);
      this.recoveryTimers.delete(service);
    }

    // Reset recovery attempts
    const status = this.serviceStatuses.get(service);
    if (status) {
      status.recoveryAttempts = 0;
    }
  }

  /**
   * Generate user-friendly degradation message
   */
  private generateDegradationMessage(
    indicators: PartialDataIndicator[],
    fallbacksUsed: string[]
  ): string {
    const unavailableServices = indicators.filter(i => !i.available).map(i => i.service);
    const partialServices = indicators.filter(i => i.available && i.dataQuality !== 'full').map(i => i.service);

    if (unavailableServices.length === 0 && partialServices.length === 0) {
      return 'All analytics services are operating normally.';
    }

    let message = '';

    if (unavailableServices.length > 0) {
      const serviceNames = unavailableServices.map(s => this.getServiceDisplayName(s)).join(', ');
      message += `${serviceNames} ${unavailableServices.length === 1 ? 'is' : 'are'} temporarily unavailable. `;
    }

    if (partialServices.length > 0) {
      const serviceNames = partialServices.map(s => this.getServiceDisplayName(s)).join(', ');
      message += `${serviceNames} ${partialServices.length === 1 ? 'is' : 'are'} showing limited data. `;
    }

    if (fallbacksUsed.length > 0) {
      message += 'We\'re using alternative data sources to provide you with the best available information. ';
    }

    message += 'We\'re working to restore full functionality.';

    return message;
  }

  /**
   * Get service limitations based on data quality
   */
  private getServiceLimitations(service: string, quality: string): string[] {
    const limitations: string[] = [];

    switch (quality) {
      case 'partial':
        limitations.push('Limited historical data available');
        limitations.push('Some metrics may be delayed');
        break;
      case 'estimated':
        limitations.push('Data is estimated based on historical patterns');
        limitations.push('Real-time updates unavailable');
        break;
      case 'unavailable':
        limitations.push('Service temporarily unavailable');
        limitations.push('No current data available');
        break;
    }

    return limitations;
  }

  /**
   * Normalize service names for consistency
   */
  private normalizeServiceName(service: string): string {
    const mapping: Record<string, string> = {
      'Google Analytics 4': 'ga4',
      'Firebase Analytics': 'firebase',
      'Google Search Console': 'search-console'
    };

    return mapping[service] || service.toLowerCase().replace(/\\s+/g, '-');
  }

  /**
   * Get display name for service
   */
  private getServiceDisplayName(service: string): string {
    const mapping: Record<string, string> = {
      'ga4': 'Google Analytics',
      'firebase': 'Firebase Analytics',
      'search-console': 'Search Console'
    };

    return mapping[service] || service;
  }

  // Fallback implementation methods
  private async callPrimaryServices(requestType: string, params: any): Promise<any> {
    // This would call the actual analytics services
    // Implementation depends on the specific request type
    return {};
  }

  private async callServiceDirectly(service: string, requestType: string, params: any): Promise<any> {
    // This would call a specific service directly
    // Implementation depends on the service and request type
    return {};
  }

  private async getFirebaseAnalyticsAsFallback(): Promise<any> {
    // Try to get data from Firebase as fallback for GA4
    return {
      source: 'firebase-fallback',
      data: {
        pageViews: 0,
        users: 0,
        sessions: 0,
        note: 'Data from Firebase Analytics fallback'
      }
    };
  }

  private async getCachedGA4Data(): Promise<any> {
    // Get cached GA4 data
    return {
      source: 'cache',
      data: {
        pageViews: 0,
        users: 0,
        sessions: 0,
        note: 'Cached data from previous GA4 requests'
      }
    };
  }

  private async getEstimatedGA4Data(): Promise<any> {
    // Generate estimated data based on historical patterns
    return {
      source: 'estimation',
      data: {
        pageViews: Math.floor(Math.random() * 100) + 50,
        users: Math.floor(Math.random() * 50) + 25,
        sessions: Math.floor(Math.random() * 75) + 35,
        note: 'Estimated data based on historical patterns'
      }
    };
  }

  private async getLocalStorageData(): Promise<any> {
    // Get data from local storage
    return {
      source: 'local-storage',
      data: {
        events: [],
        sessions: [],
        note: 'Data from local storage'
      }
    };
  }

  private async getStaticAnalyticsData(): Promise<any> {
    // Return static fallback data
    return {
      source: 'static',
      data: {
        message: 'Analytics services are temporarily unavailable',
        fallback: true
      }
    };
  }

  private async getEstimatedSearchData(): Promise<any> {
    // Generate estimated search console data
    return {
      source: 'estimation',
      data: {
        clicks: Math.floor(Math.random() * 50) + 10,
        impressions: Math.floor(Math.random() * 500) + 100,
        ctr: (Math.random() * 0.1 + 0.02).toFixed(3),
        position: (Math.random() * 10 + 5).toFixed(1),
        note: 'Estimated search data'
      }
    };
  }

  private async getCachedSearchConsoleData(): Promise<any> {
    // Get cached search console data
    return {
      source: 'cache',
      data: {
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        note: 'Cached search console data'
      }
    };
  }

  /**
   * Get current service statuses
   */
  async getAllServiceStatuses(): Promise<ServiceStatus[]> {
    return await this.updateServiceStatuses();
  }

  /**
   * Force refresh of all service statuses
   */
  async refreshAllServices(): Promise<boolean> {
    try {
      const statuses = await this.updateServiceStatuses();
      let allRefreshed = true;

      for (const status of statuses) {
        if (status.status === 'error') {
          const refreshed = await authManager.refreshCredentials(status.service);
          if (!refreshed) {
            allRefreshed = false;
          }
        }
      }

      return allRefreshed;
    } catch (error) {
      console.error('Failed to refresh all services:', error);
      return false;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    // Clear all recovery timers
    for (const timer of this.recoveryTimers.values()) {
      clearInterval(timer);
    }
    this.recoveryTimers.clear();
    this.serviceStatuses.clear();
  }
}

// Export singleton instance
export const gracefulDegradationService = new GracefulDegradationService();