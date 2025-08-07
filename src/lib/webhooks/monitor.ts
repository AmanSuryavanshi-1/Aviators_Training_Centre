/**
 * Webhook monitoring and health check utilities
 * Tracks webhook performance and provides debugging information
 */

interface WebhookEvent {
  id: string
  timestamp: string
  type: string
  event: string
  success: boolean
  duration: number
  error?: string
  payload?: any
}

interface WebhookStats {
  totalEvents: number
  successfulEvents: number
  failedEvents: number
  averageResponseTime: number
  lastEventTime: string
  errorRate: number
}

class WebhookMonitor {
  private events: WebhookEvent[] = []
  private maxEvents = 1000 // Keep last 1000 events in memory
  
  /**
   * Log a webhook event
   */
  logEvent(event: Omit<WebhookEvent, 'id' | 'timestamp'>): void {
    const webhookEvent: WebhookEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...event
    }
    
    this.events.unshift(webhookEvent)
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents)
    }
    
    // Log to console for debugging
    if (event.success) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Webhook processed: ${event.type}/${event.event} (${event.duration}ms)`);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ Webhook failed: ${event.type}/${event.event} - ${event.error}`);
      }
    }
  }
  
  /**
   * Get webhook statistics
   */
  getStats(timeRange?: { start: Date; end: Date }): WebhookStats {
    let filteredEvents = this.events
    
    if (timeRange) {
      filteredEvents = this.events.filter(event => {
        const eventTime = new Date(event.timestamp)
        return eventTime >= timeRange.start && eventTime <= timeRange.end
      })
    }
    
    const totalEvents = filteredEvents.length
    const successfulEvents = filteredEvents.filter(e => e.success).length
    const failedEvents = totalEvents - successfulEvents
    const averageResponseTime = totalEvents > 0 
      ? filteredEvents.reduce((sum, e) => sum + e.duration, 0) / totalEvents 
      : 0
    const lastEventTime = filteredEvents[0]?.timestamp || ''
    const errorRate = totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0
    
    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      averageResponseTime: Math.round(averageResponseTime),
      lastEventTime,
      errorRate: Math.round(errorRate * 100) / 100
    }
  }
  
  /**
   * Get recent events
   */
  getRecentEvents(limit = 50): WebhookEvent[] {
    return this.events.slice(0, limit)
  }
  
  /**
   * Get events by type
   */
  getEventsByType(type: string, limit = 50): WebhookEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(0, limit)
  }
  
  /**
   * Get failed events
   */
  getFailedEvents(limit = 50): WebhookEvent[] {
    return this.events
      .filter(event => !event.success)
      .slice(0, limit)
  }
  
  /**
   * Check webhook health
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical'
    message: string
    stats: WebhookStats
  } {
    const stats = this.getStats()
    const recentStats = this.getStats({
      start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      end: new Date()
    })
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'
    let message = 'Webhooks are operating normally'
    
    // Check error rate
    if (recentStats.errorRate > 50) {
      status = 'critical'
      message = `High error rate: ${recentStats.errorRate}% in the last 24 hours`
    } else if (recentStats.errorRate > 20) {
      status = 'warning'
      message = `Elevated error rate: ${recentStats.errorRate}% in the last 24 hours`
    }
    
    // Check if webhooks are being received
    const lastEventAge = stats.lastEventTime 
      ? Date.now() - new Date(stats.lastEventTime).getTime()
      : Infinity
    
    if (lastEventAge > 7 * 24 * 60 * 60 * 1000) { // 7 days
      status = 'warning'
      message = 'No webhook events received in the last 7 days'
    }
    
    // Check response time
    if (recentStats.averageResponseTime > 5000) { // 5 seconds
      status = status === 'critical' ? 'critical' : 'warning'
      message += `. Slow response times: ${recentStats.averageResponseTime}ms average`
    }
    
    return {
      status,
      message,
      stats: recentStats
    }
  }
  
  /**
   * Generate a unique ID for events
   */
  private generateId(): string {
    return `webhook_${Date.now()}_${crypto.randomUUID().slice(0, 9)}`
  }
  
  /**
   * Clear old events (useful for memory management)
   */
  clearOldEvents(olderThan: Date): void {
    this.events = this.events.filter(event => 
      new Date(event.timestamp) > olderThan
    )
  }
  
  /**
   * Export events for analysis
   */
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'type', 'event', 'success', 'duration', 'error']
      const rows = this.events.map(event => [
        event.id,
        event.timestamp,
        event.type,
        event.event,
        event.success.toString(),
        event.duration.toString(),
        event.error || ''
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(this.events, null, 2)
  }
}

// Global webhook monitor instance
export const webhookMonitor = new WebhookMonitor()

// Utility functions for webhook monitoring
export function trackWebhookEvent(
  type: string,
  event: string,
  startTime: number,
  success: boolean,
  error?: string,
  payload?: any
): void {
  const duration = Date.now() - startTime
  
  webhookMonitor.logEvent({
    type,
    event,
    success,
    duration,
    error,
    payload: payload ? JSON.stringify(payload) : undefined
  })
}

export function getWebhookHealth() {
  return webhookMonitor.getHealthStatus()
}

export function getWebhookStats(timeRange?: { start: Date; end: Date }) {
  return webhookMonitor.getStats(timeRange)
}

export function getRecentWebhookEvents(limit = 50) {
  return webhookMonitor.getRecentEvents(limit)
}

export function getFailedWebhookEvents(limit = 50) {
  return webhookMonitor.getFailedEvents(limit)
}

// Webhook performance metrics for admin dashboard
export function getWebhookMetrics() {
  const health = webhookMonitor.getHealthStatus()
  const recentEvents = webhookMonitor.getRecentEvents(10)
  const failedEvents = webhookMonitor.getFailedEvents(5)
  
  return {
    health,
    recentEvents,
    failedEvents,
    stats: health.stats
  }
}

// Cleanup function to run periodically
export function cleanupOldWebhookEvents(): void {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  webhookMonitor.clearOldEvents(thirtyDaysAgo)
}

export default webhookMonitor
