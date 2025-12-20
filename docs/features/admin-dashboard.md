# Admin Dashboard

> **Analytics visualization, monitoring, and content management**

Last Updated: December 20, 2025

---

## Overview

The admin dashboard provides:
- Real-time analytics visualization
- Traffic source analysis
- N8N workflow monitoring
- Data export capabilities
- Content management

---

## Current Implementation

### Architecture

```
Admin Dashboard
├── Analytics (AdvancedAnalyticsDashboard)
│   ├── Key metrics cards
│   ├── Traffic source charts
│   ├── Conversion tracking
│   └── Date range filtering
│
├── UTM Analytics (UTMAnalyticsDashboard)
│   ├── Campaign performance
│   ├── Source/medium breakdown
│   └── Conversion attribution
│
├── N8N Monitoring (N8nMonitoringDashboard)
│   ├── Workflow status
│   ├── Execution history
│   └── Error alerts
│
├── System Health (SystemHealthDashboard)
│   ├── API response times
│   ├── Error rates
│   └── Cache status
│
└── Content Management
    ├── Blog posts
    ├── CTA templates
    └── Cache invalidation
```

### Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/admin/AdvancedAnalyticsDashboard.tsx` | 1655 | Main analytics |
| `src/components/admin/AdminLayout.tsx` | 150 | Layout wrapper |
| `src/components/admin/AdminLogin.tsx` | 200 | Login page |
| `src/components/admin/UTMAnalyticsDashboard.tsx` | 400 | UTM tracking |
| `src/components/admin/N8nMonitoringDashboard.tsx` | 300 | N8N status |

---

## Core Logic

### Advanced Analytics Dashboard

```typescript
// src/components/admin/AdvancedAnalyticsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';

interface DetailedAnalyticsData {
  // Content metrics
  totalPosts: number;
  totalAuthors: number;
  totalCategories: number;

  // Event metrics
  totalEvents: number;
  pageviews: number;
  ctaClicks: number;
  contactVisits: number;
  formSubmissions: number;

  // User metrics
  uniqueUsers: number;
  newUsers: number;
  returningUsers: number;
  bounceRate: number;
  avgSessionDuration: number;

  // Conversion metrics
  conversionRate: number;
  totalConversions: number;
  leadValue: number;

  // Traffic sources
  trafficSources: Array<{
    source: string;
    medium: string;
    visitors: number;
    conversions: number;
    bounceRate: number;
  }>;

  // Top pages
  topPages: Array<{
    path: string;
    views: number;
    avgTime: number;
  }>;

  // Bot detection
  botTraffic: {
    total: number;
    percentage: number;
    blocked: number;
  };
}

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<DetailedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/analytics/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: dateRange.from?.toISOString(),
            endDate: dateRange.to?.toISOString(),
          }),
        });
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Page Views"
          value={data?.pageviews || 0}
          icon={<EyeIcon />}
        />
        <MetricCard
          title="Unique Users"
          value={data?.uniqueUsers || 0}
          icon={<UsersIcon />}
        />
        <MetricCard
          title="Conversions"
          value={data?.totalConversions || 0}
          icon={<TrendingUpIcon />}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${(data?.conversionRate || 0).toFixed(2)}%`}
          icon={<PercentIcon />}
        />
      </div>

      {/* Traffic Sources Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficSourcesChart data={data?.trafficSources || []} />
        </CardContent>
      </Card>

      {/* Top Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <TopPagesTable pages={data?.topPages || []} />
        </CardContent>
      </Card>

      {/* Bot Traffic Alert */}
      {data?.botTraffic && data.botTraffic.percentage > 10 && (
        <Alert variant="warning">
          <AlertTitle>High Bot Traffic Detected</AlertTitle>
          <AlertDescription>
            {data.botTraffic.percentage.toFixed(1)}% of traffic is from bots.
            {data.botTraffic.blocked} requests blocked.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### Admin Layout

```typescript
// src/components/admin/AdminLayout.tsx
'use client';

import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={sidebarOpen ? 'ml-64' : 'ml-16'}>
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Admin Sidebar Navigation

```typescript
// src/components/admin/AdminSidebar.tsx
const navItems = [
  { 
    title: 'Dashboard', 
    href: '/admin', 
    icon: <DashboardIcon /> 
  },
  { 
    title: 'Analytics', 
    href: '/admin/analytics', 
    icon: <ChartIcon /> 
  },
  { 
    title: 'UTM Tracking', 
    href: '/admin/utm', 
    icon: <LinkIcon /> 
  },
  { 
    title: 'Blog Posts', 
    href: '/admin/blog', 
    icon: <FileTextIcon /> 
  },
  { 
    title: 'N8N Workflows', 
    href: '/admin/n8n', 
    icon: <WorkflowIcon /> 
  },
  { 
    title: 'System Health', 
    href: '/admin/health', 
    icon: <HeartIcon /> 
  },
  { 
    title: 'Settings', 
    href: '/admin/settings', 
    icon: <SettingsIcon /> 
  },
];
```

---

## N8N Monitoring Dashboard

```typescript
// src/components/admin/N8nMonitoringDashboard.tsx
'use client';

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastExecuted: string;
  executions: number;
  errors: number;
}

export function N8nMonitoringDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);

  useEffect(() => {
    async function fetchWorkflows() {
      const response = await fetch('/api/n8n/status');
      const data = await response.json();
      setWorkflows(data.workflows);
    }
    fetchWorkflows();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">N8N Workflow Status</h2>

      <div className="grid gap-4">
        {workflows.map(workflow => (
          <Card key={workflow.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="font-semibold">{workflow.name}</h3>
                <p className="text-sm text-gray-500">
                  Last run: {formatDate(workflow.lastExecuted)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant={
                  workflow.status === 'active' ? 'success' :
                  workflow.status === 'error' ? 'destructive' : 'secondary'
                }>
                  {workflow.status}
                </Badge>

                <div className="text-right">
                  <p className="text-sm">{workflow.executions} executions</p>
                  {workflow.errors > 0 && (
                    <p className="text-sm text-red-500">{workflow.errors} errors</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Data Export

### Export API

```typescript
// src/app/api/analytics/export/route.ts
export async function POST(req: NextRequest) {
  const { format, dateRange, metrics } = await req.json();

  // Fetch data
  const data = await getAnalyticsData(dateRange);

  if (format === 'csv') {
    const csv = convertToCSV(data, metrics);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=analytics.csv',
      },
    });
  }

  if (format === 'xlsx') {
    const xlsx = await convertToExcel(data, metrics);
    return new Response(xlsx, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=analytics.xlsx',
      },
    });
  }

  return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
}
```

### Export Button Component

```typescript
// src/components/admin/ExportButton.tsx
export function ExportButton({ dateRange }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        body: JSON.stringify({ format, dateRange }),
      });

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics.${format}`;
      a.click();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('xlsx')}>
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## How to Access

1. Navigate to `/admin` or `/studio/admin`
2. Login with admin credentials
3. Use sidebar to navigate between dashboards

---

## Extension Guide

### Adding New Dashboard Widget

```typescript
// 1. Create widget component
// src/components/admin/widgets/ConversionFunnel.tsx
export function ConversionFunnel({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Funnel visualization */}
      </CardContent>
    </Card>
  );
}

// 2. Add to dashboard
import { ConversionFunnel } from './widgets/ConversionFunnel';

// In AdvancedAnalyticsDashboard
<ConversionFunnel data={data?.funnelData} />
```

### Adding New Admin Page

```typescript
// 1. Create page
// src/app/admin/reports/page.tsx
export default function ReportsPage() {
  return (
    <AdminLayout>
      <h1>Custom Reports</h1>
      {/* Report content */}
    </AdminLayout>
  );
}

// 2. Add to sidebar navigation
const navItems = [
  // ...existing items
  { title: 'Reports', href: '/admin/reports', icon: <FileIcon /> },
];
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Dashboard loading slow | Add date range limits |
| Charts not rendering | Check data format |
| Export failing | Verify API route permissions |
| N8N status not updating | Check N8N API endpoint |

---

## Related Documentation

- [Authentication](authentication.md)
- [Analytics System](analytics-system.md)
- [N8N Overview](../n8n/OVERVIEW.md)
