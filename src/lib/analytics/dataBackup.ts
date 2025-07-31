// Analytics Data Backup System
// Stores analytics data permanently in your database

interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventType: string;
  eventData: Record<string, any>;
  userId?: string;
  sessionId: string;
  domain: string;
  userAgent: string;
  referrer: string;
  page: string;
}

interface DailyAnalyticsSummary {
  date: string;
  domain: string;
  totalPageviews: number;
  uniqueUsers: number;
  totalEvents: number;
  topPages: Array<{ page: string; views: number }>;
  trafficSources: Record<string, number>;
  conversions: number;
  bounceRate: number;
  avgSessionDuration: number;
}

class AnalyticsBackupService {
  private static instance: AnalyticsBackupService;
  private events: AnalyticsEvent[] = [];
  private dailySummaries: DailyAnalyticsSummary[] = [];

  static getInstance(): AnalyticsBackupService {
    if (!AnalyticsBackupService.instance) {
      AnalyticsBackupService.instance = new AnalyticsBackupService();
    }
    return AnalyticsBackupService.instance;
  }

  // Store individual events
  async storeEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...eventData
    };

    // Store in memory (in production, store in database)
    this.events.push(event);

    // Also send to your database API
    try {
      await fetch('/api/analytics/store-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to store analytics event:', error);
    }
  }

  // Generate daily summaries
  async generateDailySummary(date: string): Promise<DailyAnalyticsSummary> {
    const dayEvents = this.events.filter(event => 
      event.timestamp.startsWith(date)
    );

    const summary: DailyAnalyticsSummary = {
      date,
      domain: 'www.aviatorstrainingcentre.in',
      totalPageviews: dayEvents.filter(e => e.eventType === 'page_view').length,
      uniqueUsers: new Set(dayEvents.map(e => e.userId).filter(Boolean)).size,
      totalEvents: dayEvents.length,
      topPages: this.calculateTopPages(dayEvents),
      trafficSources: this.calculateTrafficSources(dayEvents),
      conversions: dayEvents.filter(e => e.eventType === 'contact_form_submit').length,
      bounceRate: this.calculateBounceRate(dayEvents),
      avgSessionDuration: this.calculateAvgSessionDuration(dayEvents)
    };

    this.dailySummaries.push(summary);

    // Store summary in database
    try {
      await fetch('/api/analytics/store-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary)
      });
    } catch (error) {
      console.error('Failed to store daily summary:', error);
    }

    return summary;
  }

  // Get historical data (your permanent record)
  async getHistoricalData(startDate: string, endDate: string): Promise<{
    events: AnalyticsEvent[];
    summaries: DailyAnalyticsSummary[];
  }> {
    try {
      const response = await fetch(`/api/analytics/historical?start=${startDate}&end=${endDate}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
      return { events: [], summaries: [] };
    }
  }

  // Export data for backup
  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    const data = {
      events: this.events,
      summaries: this.dailySummaries,
      exportDate: new Date().toISOString(),
      domain: 'www.aviatorstrainingcentre.in'
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return this.convertToCSV(data);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTopPages(events: AnalyticsEvent[]): Array<{ page: string; views: number }> {
    const pageViews: Record<string, number> = {};
    
    events
      .filter(e => e.eventType === 'page_view')
      .forEach(e => {
        const page = e.page || '/';
        pageViews[page] = (pageViews[page] || 0) + 1;
      });

    return Object.entries(pageViews)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  private calculateTrafficSources(events: AnalyticsEvent[]): Record<string, number> {
    const sources: Record<string, number> = {};
    
    events
      .filter(e => e.eventType === 'traffic_source_identified')
      .forEach(e => {
        const source = e.eventData.source || 'direct';
        sources[source] = (sources[source] || 0) + 1;
      });

    return sources;
  }

  private calculateBounceRate(events: AnalyticsEvent[]): number {
    // Simplified bounce rate calculation
    const sessions = new Set(events.map(e => e.sessionId));
    const bouncedSessions = Array.from(sessions).filter(sessionId => {
      const sessionEvents = events.filter(e => e.sessionId === sessionId);
      return sessionEvents.length === 1 && sessionEvents[0].eventType === 'page_view';
    });

    return sessions.size > 0 ? (bouncedSessions.length / sessions.size) * 100 : 0;
  }

  private calculateAvgSessionDuration(events: AnalyticsEvent[]): number {
    const sessions: Record<string, AnalyticsEvent[]> = {};
    
    events.forEach(event => {
      if (!sessions[event.sessionId]) {
        sessions[event.sessionId] = [];
      }
      sessions[event.sessionId].push(event);
    });

    const durations = Object.values(sessions).map(sessionEvents => {
      if (sessionEvents.length < 2) return 0;
      
      const sortedEvents = sessionEvents.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      const start = new Date(sortedEvents[0].timestamp).getTime();
      const end = new Date(sortedEvents[sortedEvents.length - 1].timestamp).getTime();
      
      return (end - start) / 1000; // Duration in seconds
    });

    return durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0;
  }

  private convertToCSV(data: any): string {
    // Convert to CSV format for Excel/Google Sheets
    const headers = ['Date', 'Event Type', 'Page', 'User ID', 'Domain', 'Referrer'];
    const rows = data.events.map((event: AnalyticsEvent) => [
      event.timestamp,
      event.eventType,
      event.page,
      event.userId || '',
      event.domain,
      event.referrer
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

export const analyticsBackup = AnalyticsBackupService.getInstance();