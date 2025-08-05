// Data Export and Reporting Service

import { format } from 'date-fns';

export interface ExportConfig {
  format: 'csv' | 'excel' | 'json' | 'pdf';
  dateRange: { from: Date; to: Date };
  filters: any;
  metrics: string[];
  groupBy?: string[];
  includeCharts?: boolean;
  template?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  config: ExportConfig;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
  };
}

export class AnalyticsExportService {
  private templates: Map<string, ReportTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * Export analytics data in specified format
   */
  async exportData(config: ExportConfig): Promise<Blob> {
    const data = await this.fetchAnalyticsData(config);
    
    switch (config.format) {
      case 'csv':
        return this.exportToCSV(data, config);
      case 'excel':
        return this.exportToExcel(data, config);
      case 'json':
        return this.exportToJSON(data, config);
      case 'pdf':
        return this.exportToPDF(data, config);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  /**
   * Generate CSV export
   */
  private async exportToCSV(data: any[], config: ExportConfig): Promise<Blob> {
    if (data.length === 0) {
      return new Blob(['No data available for the selected criteria'], { type: 'text/csv' });
    }

    // Get headers from first data item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      // Header row
      headers.join(','),
      // Data rows
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  }

  /**
   * Generate Excel export
   */
  private async exportToExcel(data: any[], config: ExportConfig): Promise<Blob> {
    // For a real implementation, you would use a library like xlsx
    // For now, we'll create a simple tab-separated format that Excel can read
    
    if (data.length === 0) {
      return new Blob(['No data available for the selected criteria'], { type: 'application/vnd.ms-excel' });
    }

    const headers = Object.keys(data[0]);
    
    const excelContent = [
      // Header row
      headers.join('\t'),
      // Data rows
      ...data.map(row => 
        headers.map(header => row[header] || '').join('\t')
      )
    ].join('\n');

    return new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  }

  /**
   * Generate JSON export
   */
  private async exportToJSON(data: any[], config: ExportConfig): Promise<Blob> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: {
          from: config.dateRange.from.toISOString(),
          to: config.dateRange.to.toISOString()
        },
        filters: config.filters,
        metrics: config.metrics,
        recordCount: data.length
      },
      data: data
    };

    return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  }

  /**
   * Generate PDF export
   */
  private async exportToPDF(data: any[], config: ExportConfig): Promise<Blob> {
    // For a real implementation, you would use a library like jsPDF or Puppeteer
    // For now, we'll create a simple HTML-based PDF
    
    const htmlContent = this.generateHTMLReport(data, config);
    
    // In a real implementation, you would convert HTML to PDF
    // For now, return HTML as blob
    return new Blob([htmlContent], { type: 'text/html' });
  }

  /**
   * Generate HTML report content
   */
  private generateHTMLReport(data: any[], config: ExportConfig): string {
    const dateRange = `${format(config.dateRange.from, 'MMM dd, yyyy')} - ${format(config.dateRange.to, 'MMM dd, yyyy')}`;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Analytics Report - ${dateRange}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .summary { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #e9f4ff; border-radius: 5px; }
        .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Analytics Report</h1>
        <p><strong>Date Range:</strong> ${dateRange}</p>
        <p><strong>Generated:</strong> ${format(new Date(), 'MMM dd, yyyy HH:mm')}</p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">
            <strong>Total Records:</strong> ${data.length.toLocaleString()}
        </div>
        <div class="metric">
            <strong>Export Format:</strong> ${config.format.toUpperCase()}
        </div>
        <div class="metric">
            <strong>Metrics:</strong> ${config.metrics.join(', ')}
        </div>
    </div>
    
    ${data.length > 0 ? this.generateDataTable(data) : '<p>No data available for the selected criteria.</p>'}
    
    <div class="footer">
        <p>Generated by Aviators Training Centre Analytics Dashboard</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate HTML table from data
   */
  private generateDataTable(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    
    return `
<table>
    <thead>
        <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
        </tr>
    </thead>
    <tbody>
        ${data.slice(0, 100).map(row => `
            <tr>
                ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
        `).join('')}
    </tbody>
</table>
${data.length > 100 ? `<p><em>Showing first 100 of ${data.length} records</em></p>` : ''}`;
  }

  /**
   * Fetch analytics data based on config
   */
  private async fetchAnalyticsData(config: ExportConfig): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        type: 'events',
        start: config.dateRange.from.toISOString(),
        end: config.dateRange.to.toISOString(),
        ...config.filters
      });

      const response = await fetch(`/api/analytics/advanced?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching analytics data for export:', error);
      return [];
    }
  }

  /**
   * Save report template
   */
  saveTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
    
    // In a real implementation, you would save to a database
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem('analytics_report_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save report template:', error);
    }
  }

  /**
   * Get all report templates
   */
  getTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ReportTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    
    if (deleted) {
      try {
        const templates = Array.from(this.templates.values());
        localStorage.setItem('analytics_report_templates', JSON.stringify(templates));
      } catch (error) {
        console.error('Failed to update stored templates:', error);
      }
    }
    
    return deleted;
  }

  /**
   * Generate report from template
   */
  async generateFromTemplate(templateId: string, overrides?: Partial<ExportConfig>): Promise<Blob> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const config = { ...template.config, ...overrides };
    return this.exportData(config);
  }

  /**
   * Schedule report generation
   */
  scheduleReport(templateId: string, schedule: ReportTemplate['schedule']): void {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    template.schedule = schedule;
    this.saveTemplate(template);

    // In a real implementation, you would set up a cron job or similar
    console.log(`Report scheduled: ${template.name}`, schedule);
  }

  /**
   * Send report via email
   */
  async sendReport(templateId: string, recipients: string[]): Promise<void> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const reportBlob = await this.generateFromTemplate(templateId);
    
    // In a real implementation, you would integrate with an email service
    console.log(`Sending report "${template.name}" to:`, recipients);
    console.log('Report size:', reportBlob.size, 'bytes');
    
    // Mock email sending
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Report sent successfully');
        resolve();
      }, 1000);
    });
  }

  /**
   * Initialize default report templates
   */
  private initializeDefaultTemplates(): void {
    // Load templates from localStorage
    try {
      const stored = localStorage.getItem('analytics_report_templates');
      if (stored) {
        const templates = JSON.parse(stored) as ReportTemplate[];
        templates.forEach(template => {
          this.templates.set(template.id, template);
        });
        return;
      }
    } catch (error) {
      console.error('Failed to load stored templates:', error);
    }

    // Create default templates
    const defaultTemplates: ReportTemplate[] = [
      {
        id: 'weekly_summary',
        name: 'Weekly Summary Report',
        description: 'Comprehensive weekly analytics summary',
        config: {
          format: 'pdf',
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            to: new Date()
          },
          filters: { validOnly: true },
          metrics: ['pageViews', 'conversions', 'trafficSources', 'userJourneys'],
          includeCharts: true
        }
      },
      {
        id: 'traffic_sources_csv',
        name: 'Traffic Sources Export',
        description: 'Detailed traffic source data in CSV format',
        config: {
          format: 'csv',
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date()
          },
          filters: {},
          metrics: ['trafficSources'],
          groupBy: ['source', 'category']
        }
      },
      {
        id: 'conversion_analysis',
        name: 'Conversion Analysis Report',
        description: 'Detailed conversion tracking and attribution analysis',
        config: {
          format: 'excel',
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date()
          },
          filters: { outcomeType: 'conversion' },
          metrics: ['conversions', 'attribution', 'journeys'],
          includeCharts: true
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Save default templates
    try {
      localStorage.setItem('analytics_report_templates', JSON.stringify(defaultTemplates));
    } catch (error) {
      console.error('Failed to save default templates:', error);
    }
  }

  /**
   * Get export statistics
   */
  getExportStats(): {
    totalTemplates: number;
    scheduledReports: number;
    lastExportDate?: Date;
  } {
    const templates = Array.from(this.templates.values());
    const scheduledReports = templates.filter(t => t.schedule).length;

    return {
      totalTemplates: templates.length,
      scheduledReports,
      lastExportDate: new Date() // In a real implementation, track actual last export
    };
  }
}

// Global instance
let globalExportService: AnalyticsExportService | null = null;

export function getExportService(): AnalyticsExportService {
  if (!globalExportService) {
    globalExportService = new AnalyticsExportService();
  }
  return globalExportService;
}

// Convenience functions
export async function exportAnalyticsData(config: ExportConfig): Promise<Blob> {
  return getExportService().exportData(config);
}

export function saveReportTemplate(template: ReportTemplate): void {
  getExportService().saveTemplate(template);
}

export function getReportTemplates(): ReportTemplate[] {
  return getExportService().getTemplates();
}

export async function generateScheduledReports(): Promise<void> {
  const service = getExportService();
  const templates = service.getTemplates().filter(t => t.schedule);

  for (const template of templates) {
    try {
      if (template.schedule?.recipients) {
        await service.sendReport(template.id, template.schedule.recipients);
      }
    } catch (error) {
      console.error(`Failed to generate scheduled report: ${template.name}`, error);
    }
  }
}