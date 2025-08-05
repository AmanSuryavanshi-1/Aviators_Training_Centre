// Real-time Event Streaming and Offline Queue Management

interface StreamingConfig {
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  enableOfflineQueue: boolean;
  maxOfflineEvents: number;
  compressionEnabled: boolean;
  debug: boolean;
}

interface QueuedEvent {
  id: string;
  event: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export class EventStreamingManager {
  private config: StreamingConfig;
  private eventQueue: QueuedEvent[] = [];
  private offlineQueue: QueuedEvent[] = [];
  private isOnline: boolean = navigator.onLine;
  private flushTimer: NodeJS.Timeout | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private eventIdCounter: number = 0;

  constructor(config: Partial<StreamingConfig> = {}) {
    this.config = {
      endpoint: '/api/analytics/realtime',
      batchSize: 20,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      retryDelay: 1000,
      enableOfflineQueue: true,
      maxOfflineEvents: 1000,
      compressionEnabled: false,
      debug: false,
      ...config
    };

    this.initialize();
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Load offline queue from localStorage
    this.loadOfflineQueue();

    // Set up network status listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      this.startFlushTimer();
      if (this.config.debug) {
        console.log('EventStreaming: Back online, processing offline queue');
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopFlushTimer();
      if (this.config.debug) {
        console.log('EventStreaming: Gone offline, queuing events');
      }
    });

    // Set up page unload handler
    window.addEventListener('beforeunload', () => {
      this.flush(true);
      this.saveOfflineQueue();
    });

    // Start flush timer
    this.startFlushTimer();
  }

  public queueEvent(event: any, priority: 'high' | 'medium' | 'low' = 'medium') {
    const queuedEvent: QueuedEvent = {
      id: this.generateEventId(),
      event: this.sanitizeEvent(event),
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    if (this.isOnline) {
      this.eventQueue.push(queuedEvent);
      
      // Immediate flush for high priority events
      if (priority === 'high') {
        this.flush();
      }
      // Flush if queue is full
      else if (this.eventQueue.length >= this.config.batchSize) {
        this.flush();
      }
    } else if (this.config.enableOfflineQueue) {
      this.addToOfflineQueue(queuedEvent);
    }

    if (this.config.debug) {
      console.log('EventStreaming: Event queued', { 
        eventId: queuedEvent.id, 
        priority, 
        online: this.isOnline 
      });
    }
  }

  public async flush(immediate: boolean = false): Promise<boolean> {
    if (this.eventQueue.length === 0) return true;

    const events = this.eventQueue.splice(0, this.config.batchSize);
    
    try {
      const success = await this.sendEvents(events, immediate);
      
      if (!success) {
        // Re-queue failed events with retry logic
        this.handleFailedEvents(events);
      }
      
      return success;
    } catch (error) {
      console.error('EventStreaming: Flush failed', error);
      this.handleFailedEvents(events);
      return false;
    }
  }

  private async sendEvents(events: QueuedEvent[], immediate: boolean = false): Promise<boolean> {
    if (!this.isOnline) {
      this.addToOfflineQueue(...events);
      return false;
    }

    try {
      const payload = this.preparePayload(events);
      
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.compressionEnabled && { 'Content-Encoding': 'gzip' })
        },
        body: JSON.stringify(payload),
        keepalive: immediate,
        signal: immediate ? undefined : AbortSignal.timeout(10000) // 10 second timeout
      });

      if (response.ok) {
        if (this.config.debug) {
          console.log(`EventStreaming: Successfully sent ${events.length} events`);
        }
        return true;
      } else {
        console.error('EventStreaming: Server error', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('EventStreaming: Network error', error);
      return false;
    }
  }

  private preparePayload(events: QueuedEvent[]) {
    const payload = {
      type: 'batch_events',
      data: events.map(e => e.event),
      metadata: {
        batchId: this.generateEventId(),
        timestamp: Date.now(),
        eventCount: events.length,
        compressed: this.config.compressionEnabled
      }
    };

    // Apply compression if enabled
    if (this.config.compressionEnabled) {
      // In a real implementation, you would compress the payload here
      // For now, we'll just return the payload as-is
    }

    return payload;
  }

  private handleFailedEvents(events: QueuedEvent[]) {
    events.forEach(event => {
      event.retryCount++;
      
      if (event.retryCount <= this.config.maxRetries) {
        // Re-queue for retry
        setTimeout(() => {
          this.eventQueue.unshift(event);
        }, this.config.retryDelay * event.retryCount);
        
        if (this.config.debug) {
          console.log(`EventStreaming: Retrying event ${event.id} (attempt ${event.retryCount})`);
        }
      } else {
        // Max retries reached, move to offline queue
        if (this.config.enableOfflineQueue) {
          this.addToOfflineQueue(event);
        }
        
        if (this.config.debug) {
          console.log(`EventStreaming: Event ${event.id} moved to offline queue after ${event.retryCount} retries`);
        }
      }
    });
  }

  private addToOfflineQueue(...events: QueuedEvent[]) {
    if (!this.config.enableOfflineQueue) return;

    events.forEach(event => {
      // Reset retry count for offline events
      event.retryCount = 0;
      this.offlineQueue.push(event);
    });

    // Maintain queue size limit
    if (this.offlineQueue.length > this.config.maxOfflineEvents) {
      // Remove oldest events, keeping high priority ones
      this.offlineQueue.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1;
        if (b.priority === 'high' && a.priority !== 'high') return 1;
        return a.timestamp - b.timestamp;
      });
      
      this.offlineQueue = this.offlineQueue.slice(-this.config.maxOfflineEvents);
    }

    // Persist to localStorage
    this.saveOfflineQueue();
  }

  private async processOfflineQueue() {
    if (this.offlineQueue.length === 0) return;

    if (this.config.debug) {
      console.log(`EventStreaming: Processing ${this.offlineQueue.length} offline events`);
    }

    // Sort by priority and timestamp
    this.offlineQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    // Process in batches
    while (this.offlineQueue.length > 0 && this.isOnline) {
      const batch = this.offlineQueue.splice(0, this.config.batchSize);
      const success = await this.sendEvents(batch);
      
      if (!success) {
        // Re-add failed events to offline queue
        this.offlineQueue.unshift(...batch);
        break;
      }
      
      // Small delay between batches to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.saveOfflineQueue();
  }

  private sanitizeEvent(event: any): any {
    // Remove sensitive data and ensure event is serializable
    const sanitized = { ...event };
    
    // Remove functions
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'function') {
        delete sanitized[key];
      }
    });

    // Truncate long strings
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = sanitized[key].substring(0, 1000) + '...';
      }
    });

    // Add deduplication hash
    sanitized._hash = this.generateEventHash(sanitized);

    return sanitized;
  }

  private generateEventHash(event: any): string {
    // Simple hash for deduplication
    const str = JSON.stringify(event);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${++this.eventIdCounter}`;
  }

  private startFlushTimer() {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      if (this.isOnline && this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private saveOfflineQueue() {
    if (!this.config.enableOfflineQueue) return;
    
    try {
      const data = {
        queue: this.offlineQueue,
        timestamp: Date.now()
      };
      localStorage.setItem('analytics_offline_queue', JSON.stringify(data));
    } catch (error) {
      console.error('EventStreaming: Failed to save offline queue', error);
    }
  }

  private loadOfflineQueue() {
    if (!this.config.enableOfflineQueue) return;
    
    try {
      const stored = localStorage.getItem('analytics_offline_queue');
      if (stored) {
        const data = JSON.parse(stored);
        
        // Only load if data is recent (within 24 hours)
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          this.offlineQueue = data.queue || [];
          
          if (this.config.debug) {
            console.log(`EventStreaming: Loaded ${this.offlineQueue.length} events from offline queue`);
          }
        } else {
          // Clear old data
          localStorage.removeItem('analytics_offline_queue');
        }
      }
    } catch (error) {
      console.error('EventStreaming: Failed to load offline queue', error);
      localStorage.removeItem('analytics_offline_queue');
    }
  }

  // Public API methods
  public getQueueStatus() {
    return {
      online: this.isOnline,
      queueSize: this.eventQueue.length,
      offlineQueueSize: this.offlineQueue.length,
      totalPendingEvents: this.eventQueue.length + this.offlineQueue.length
    };
  }

  public clearOfflineQueue() {
    this.offlineQueue = [];
    localStorage.removeItem('analytics_offline_queue');
    
    if (this.config.debug) {
      console.log('EventStreaming: Offline queue cleared');
    }
  }

  public forceFlush(): Promise<boolean> {
    return this.flush(true);
  }

  public updateConfig(newConfig: Partial<StreamingConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Restart timer if interval changed
    if (newConfig.flushInterval) {
      this.stopFlushTimer();
      this.startFlushTimer();
    }
  }

  public destroy() {
    this.stopFlushTimer();
    this.flush(true);
    this.saveOfflineQueue();
    
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }
}

// Deduplication manager
export class EventDeduplicationManager {
  private seenEvents: Set<string> = new Set();
  private maxCacheSize: number = 10000;
  private cleanupInterval: number = 300000; // 5 minutes
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(maxCacheSize: number = 10000) {
    this.maxCacheSize = maxCacheSize;
    this.startCleanupTimer();
  }

  public isDuplicate(eventHash: string): boolean {
    return this.seenEvents.has(eventHash);
  }

  public markAsSeen(eventHash: string) {
    this.seenEvents.add(eventHash);
    
    // Cleanup if cache is too large
    if (this.seenEvents.size > this.maxCacheSize) {
      this.cleanup();
    }
  }

  private cleanup() {
    // Remove oldest half of the cache
    const entries = Array.from(this.seenEvents);
    const toRemove = entries.slice(0, Math.floor(entries.length / 2));
    toRemove.forEach(hash => this.seenEvents.delete(hash));
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  public destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.seenEvents.clear();
  }
}

// Global instances
let globalStreamingManager: EventStreamingManager | null = null;
let globalDeduplicationManager: EventDeduplicationManager | null = null;

export function initializeEventStreaming(config?: Partial<StreamingConfig>) {
  if (typeof window !== 'undefined') {
    globalStreamingManager = new EventStreamingManager(config);
    globalDeduplicationManager = new EventDeduplicationManager();
  }
  return { streamingManager: globalStreamingManager, deduplicationManager: globalDeduplicationManager };
}

export function getEventStreamingManager(): EventStreamingManager | null {
  return globalStreamingManager;
}

export function getDeduplicationManager(): EventDeduplicationManager | null {
  return globalDeduplicationManager;
}

// Convenience functions
export function streamEvent(event: any, priority?: 'high' | 'medium' | 'low') {
  if (globalDeduplicationManager && globalStreamingManager) {
    const eventHash = event._hash || JSON.stringify(event);
    
    if (!globalDeduplicationManager.isDuplicate(eventHash)) {
      globalDeduplicationManager.markAsSeen(eventHash);
      globalStreamingManager.queueEvent(event, priority);
    }
  }
}

export function getStreamingStatus() {
  return globalStreamingManager?.getQueueStatus() || null;
}

export function forceFlushEvents(): Promise<boolean> {
  return globalStreamingManager?.forceFlush() || Promise.resolve(false);
}