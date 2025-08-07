'use client';

// Define FilterOptions interface locally to avoid circular imports
export interface FilterOptions {
  timeframe: 'day' | 'week' | 'month' | 'all' | 'custom';
  dateRange?: {
    from: Date;
    to: Date;
  };
  sourceCategory?: string[];
  pageCategory?: string[];
  deviceType?: string[];
  location?: string[];
  validOnly: boolean;
  includeAI: boolean;
  includeBots: boolean;
  searchQuery?: string;
}

export interface ExportData {
  overview: {
    totalPageviews: number;
    uniqueUsers: number;
    ctaClicks: number;
    contactVisits: number;
    formSubmissions: number;
    totalEvents: number;
    conversionRate: number;
  };
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    uniqueUsers: number;
    avgTimeOnPage: string;
    bounceRate: number;
    conversions: number;
  }>;
  deviceTypes: Array<{
    device: string;
    users: number;
    percentage: number;
  }>;
  conversionFunnel: {
    visitors: number;
    blogReaders: number;
    contactViews: number;
    formSubmissions: number;
    conversionRate: number;
  };
}

class AnalyticsExportService {
  /**
   * Export analytics data to CSV format
   */
  async exportToCSV(data: ExportData, filters: FilterOptions): Promise<void> {
    try {
      const csvContent = this.generateCSVContent(data, filters);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = this.generateFilename('csv', filters);
      this.downloadFile(blob, filename);
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('Failed to export CSV file');
    }
  }

  /**
   * Export analytics data to Excel format
   */
  async exportToExcel(data: ExportData, filters: FilterOptions): Promise<void> {
    try {
      // For Excel export, we'll create a more structured format
      const workbookData = this.generateExcelContent(data, filters);
      const csvContent = workbookData; // Simplified - in production, use a proper Excel library
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const filename = this.generateFilename('xlsx', filters);
      this.downloadFile(blob, filename);
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export Excel file');
    }
  }

  /**
   * Generate CSV content from analytics data
   */
  private generateCSVContent(data: ExportData, filters: FilterOptions): string {
    const lines: string[] = [];
    
    // Header with export info
    lines.push('# Aviators Training Centre - Analytics Export');
    lines.push(`# Generated: ${new Date().toISOString()}`);
    lines.push(`# Timeframe: ${filters.timeframe}`);
    if (filters.dateRange) {
      lines.push(`# Date Range: ${filters.dateRange.from.toISOString()} to ${filters.dateRange.to.toISOString()}`);
    }
    lines.push('');

    // Overview Metrics
    lines.push('## Overview Metrics');
    lines.push('Metric,Value');
    lines.push(`Total Pageviews,${data.overview.totalPageviews}`);
    lines.push(`Unique Users,${data.overview.uniqueUsers}`);
    lines.push(`CTA Clicks,${data.overview.ctaClicks}`);
    lines.push(`Contact Visits,${data.overview.contactVisits}`);
    lines.push(`Form Submissions,${data.overview.formSubmissions}`);
    lines.push(`Total Events,${data.overview.totalEvents}`);
    lines.push(`Conversion Rate,${data.overview.conversionRate}%`);
    lines.push('');

    // Traffic Sources
    lines.push('## Traffic Sources');
    lines.push('Source,Visitors,Percentage');
    data.trafficSources.forEach(source => {
      lines.push(`${source.source},${source.visitors},${source.percentage}%`);
    });
    lines.push('');

    // Top Pages
    lines.push('## Top Pages');
    lines.push('Path,Title,Views,Unique Users,Avg Time on Page,Bounce Rate,Conversions');
    data.topPages.forEach(page => {
      const title = `"${page.title.replace(/"/g, '""')}"`;
      lines.push(`${page.path},${title},${page.views},${page.uniqueUsers},${page.avgTimeOnPage},${page.bounceRate}%,${page.conversions}`);
    });
    lines.push('');

    // Device Types
    lines.push('## Device Types');
    lines.push('Device,Users,Percentage');
    data.deviceTypes.forEach(device => {
      lines.push(`${device.device},${device.users},${device.percentage}%`);
    });
    lines.push('');

    // Conversion Funnel
    lines.push('## Conversion Funnel');
    lines.push('Stage,Count');
    lines.push(`Visitors,${data.conversionFunnel.visitors}`);
    lines.push(`Blog Readers,${data.conversionFunnel.blogReaders}`);
    lines.push(`Contact Views,${data.conversionFunnel.contactViews}`);
    lines.push(`Form Submissions,${data.conversionFunnel.formSubmissions}`);
    lines.push(`Conversion Rate,${data.conversionFunnel.conversionRate}%`);

    return lines.join('\n');
  }

  /**
   * Generate Excel content (simplified CSV format for now)
   */
  private generateExcelContent(data: ExportData, filters: FilterOptions): string {
    // In a production environment, you would use a library like xlsx or exceljs
    // For now, we'll return a tab-separated format that Excel can read
    const lines: string[] = [];
    
    // Create multiple sheets in tab-separated format
    lines.push('Aviators Training Centre - Analytics Export');
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push(`Timeframe: ${filters.timeframe}`);
    lines.push('');

    // Overview sheet
    lines.push('OVERVIEW METRICS');
    lines.push('Metric\tValue');
    lines.push(`Total Pageviews\t${data.overview.totalPageviews}`);
    lines.push(`Unique Users\t${data.overview.uniqueUsers}`);
    lines.push(`CTA Clicks\t${data.overview.ctaClicks}`);
    lines.push(`Contact Visits\t${data.overview.contactVisits}`);
    lines.push(`Form Submissions\t${data.overview.formSubmissions}`);
    lines.push(`Total Events\t${data.overview.totalEvents}`);
    lines.push(`Conversion Rate\t${data.overview.conversionRate}%`);
    lines.push('');

    // Traffic Sources sheet
    lines.push('TRAFFIC SOURCES');
    lines.push('Source\tVisitors\tPercentage');
    data.trafficSources.forEach(source => {
      lines.push(`${source.source}\t${source.visitors}\t${source.percentage}%`);
    });
    lines.push('');

    // Top Pages sheet
    lines.push('TOP PAGES');
    lines.push('Path\tTitle\tViews\tUnique Users\tAvg Time on Page\tBounce Rate\tConversions');
    data.topPages.forEach(page => {
      lines.push(`${page.path}\t${page.title}\t${page.views}\t${page.uniqueUsers}\t${page.avgTimeOnPage}\t${page.bounceRate}%\t${page.conversions}`);
    });

    return lines.join('\n');
  }

  /**
   * Generate filename based on filters and current date
   */
  private generateFilename(extension: string, filters: FilterOptions): string {
    const date = new Date().toISOString().split('T')[0];
    const timeframe = filters.timeframe;
    return `aviators-analytics-${timeframe}-${date}.${extension}`;
  }

  /**
   * Download file to user's device
   */
  private downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  /**
   * Fetch current analytics data for export
   */
  async fetchExportData(filters: FilterOptions): Promise<ExportData> {
    try {
      const params = new URLSearchParams({
        timeframe: filters.timeframe,
        export: 'true'
      });

      if (filters.dateRange) {
        params.append('from', filters.dateRange.from.toISOString());
        params.append('to', filters.dateRange.to.toISOString());
      }

      if (filters.sourceCategory?.length) {
        params.append('sources', filters.sourceCategory.join(','));
      }

      if (filters.pageCategory?.length) {
        params.append('pages', filters.pageCategory.join(','));
      }

      if (filters.deviceType?.length) {
        params.append('devices', filters.deviceType.join(','));
      }

      if (filters.location?.length) {
        params.append('locations', filters.location.join(','));
      }

      params.append('validOnly', filters.validOnly.toString());
      params.append('includeAI', filters.includeAI.toString());
      params.append('includeBots', filters.includeBots.toString());

      const response = await fetch(`/api/analytics/export?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch export data');
      }

      return result.data;
    } catch (error) {
      console.error('Export data fetch error:', error);
      throw error;
    }
  }
}

export const analyticsExportService = new AnalyticsExportService();