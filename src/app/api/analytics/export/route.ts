import { NextRequest, NextResponse } from 'next/server';
import { unifiedErrorHandler } from '@/lib/analytics/UnifiedErrorHandler';
import { authManager } from '@/lib/analytics/AuthenticationManager';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, timeframe, data } = body;

    // Check authentication status
    const authStatus = await authManager.getServiceStatus();
    
    // Generate export data
    const exportData = generateExportData(data, timeframe);
    
    if (format === 'csv') {
      const csvContent = convertToCSV(exportData);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'excel') {
      // For Excel, we'll return CSV for now (can be enhanced later)
      const csvContent = convertToCSV(exportData);
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': `attachment; filename="analytics-${timeframe}-${new Date().toISOString().split('T')[0]}.xls"`
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid export format'
    }, { status: 400 });

  } catch (error) {
    console.error('Export API error:', error);
    
    const errorResponse = await unifiedErrorHandler.handleServiceError(
      'unified',
      'export_analytics',
      error,
      {
        endpoint: '/api/analytics/export',
        timestamp: new Date()
      }
    );
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

function generateExportData(data: any, timeframe: string) {
  const timestamp = new Date().toISOString();
  
  return {
    summary: {
      timeframe,
      exportDate: timestamp,
      totalPageviews: data?.pageviews || 0,
      uniqueUsers: data?.uniqueUsers || 0,
      conversionRate: data?.conversionFunnel?.conversionRate || 0
    },
    trafficSources: data?.trafficSources || {},
    topPages: data?.topPages || [],
    deviceTypes: data?.deviceTypes || {},
    aiReferrals: data?.aiReferrals || {}
  };
}

function convertToCSV(data: any): string {
  const lines = [];
  
  // Header
  lines.push('Analytics Export Report');
  lines.push(`Generated: ${data.summary.exportDate}`);
  lines.push(`Timeframe: ${data.summary.timeframe}`);
  lines.push('');
  
  // Summary
  lines.push('Summary');
  lines.push('Metric,Value');
  lines.push(`Total Pageviews,${data.summary.totalPageviews}`);
  lines.push(`Unique Users,${data.summary.uniqueUsers}`);
  lines.push(`Conversion Rate,${data.summary.conversionRate.toFixed(2)}%`);
  lines.push('');
  
  // Traffic Sources
  lines.push('Traffic Sources');
  lines.push('Source,Visitors');
  Object.entries(data.trafficSources).forEach(([source, visitors]) => {
    lines.push(`${source},${visitors}`);
  });
  lines.push('');
  
  // Top Pages
  lines.push('Top Pages');
  lines.push('Path,Title,Views,Avg Time');
  data.topPages.forEach((page: any) => {
    lines.push(`"${page.path}","${page.title}",${page.views},"${page.avgTime}"`);
  });
  lines.push('');
  
  // Device Types
  lines.push('Device Types');
  lines.push('Device,Users');
  Object.entries(data.deviceTypes).forEach(([device, users]) => {
    lines.push(`${device},${users}`);
  });
  lines.push('');
  
  // AI Referrals
  lines.push('AI Platform Referrals');
  lines.push('Platform,Referrals');
  Object.entries(data.aiReferrals).forEach(([platform, referrals]) => {
    lines.push(`${platform},${referrals}`);
  });
  
  return lines.join('\n');
}