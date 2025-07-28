/**
 * Production metrics endpoint for monitoring
 * Provides Prometheus-compatible metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache/production-cache';

interface Metric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  help: string;
  value: number;
  labels?: Record<string, string>;
}

// Metrics collection
class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  
  // Increment counter metric
  incrementCounter(name: string, labels?: Record<string, string>, value: number = 1) {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);
    
    if (existing) {
      existing.value += value;
    } else {
      this.metrics.set(key, {
        name,
        type: 'counter',
        help: `Counter metric for ${name}`,
        value,
        labels,
      });
    }
  }
  
  // Set gauge metric
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    this.metrics.set(key, {
      name,
      type: 'gauge',
      help: `Gauge metric for ${name}`,
      value,
      labels,
    });
  }
  
  // Get all metrics
  getAllMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }
  
  // Clear metrics
  clear() {
    this.metrics.clear();
  }
  
  private getMetricKey(name: string, labels?: Record<string, string>): string {
    const labelStr = labels ? JSON.stringify(labels) : '';
    return `${name}${labelStr}`;
  }
}

const metricsCollector = new MetricsCollector();

// Collect system metrics
async function collectSystemMetrics() {
  const memUsage = process.memoryUsage();
  
  // Memory metrics
  metricsCollector.setGauge('nodejs_memory_heap_used_bytes', memUsage.heapUsed);
  metricsCollector.setGauge('nodejs_memory_heap_total_bytes', memUsage.heapTotal);
  metricsCollector.setGauge('nodejs_memory_external_bytes', memUsage.external);
  metricsCollector.setGauge('nodejs_memory_rss_bytes', memUsage.rss);
  
  // Process metrics
  metricsCollector.setGauge('nodejs_process_uptime_seconds', process.uptime());
  metricsCollector.setGauge('nodejs_process_cpu_usage_percent', process.cpuUsage().user / 1000000);
  
  // Event loop lag (simplified)
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
    metricsCollector.setGauge('nodejs_eventloop_lag_milliseconds', lag);
  });
}

// Collect application metrics
async function collectApplicationMetrics() {
  try {
    // Cache metrics
    const cacheStats = await (cache as any).getStats?.() || {
      hits: 0,
      misses: 0,
      size: 0,
      keys: 0,
      memory: 0,
    };
    metricsCollector.setGauge('blog_cache_hits_total', cacheStats.hits);
    metricsCollector.setGauge('blog_cache_misses_total', cacheStats.misses);
    metricsCollector.setGauge('blog_cache_size_bytes', cacheStats.size);
    metricsCollector.setGauge('blog_cache_keys_total', cacheStats.keys);
    metricsCollector.setGauge('blog_cache_memory_bytes', cacheStats.memory);
    
    // Blog-specific metrics (these would be tracked in actual usage)
    metricsCollector.setGauge('blog_posts_total', 0); // Would be populated from Sanity
    metricsCollector.setGauge('blog_page_views_total', 0); // Would be populated from analytics
    metricsCollector.setGauge('blog_cta_clicks_total', 0); // Would be populated from tracking
    
  } catch (error) {
    console.error('Error collecting application metrics:', error);
  }
}

// Format metrics in Prometheus format
function formatPrometheusMetrics(metrics: Metric[]): string {
  const lines: string[] = [];
  
  for (const metric of metrics) {
    // Add help comment
    lines.push(`# HELP ${metric.name} ${metric.help}`);
    lines.push(`# TYPE ${metric.name} ${metric.type}`);
    
    // Add metric line
    const labelsStr = metric.labels 
      ? `{${Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
      : '';
    
    lines.push(`${metric.name}${labelsStr} ${metric.value}`);
    lines.push(''); // Empty line between metrics
  }
  
  return lines.join('\n');
}

// Main metrics endpoint
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Clear previous metrics
    metricsCollector.clear();
    
    // Collect all metrics
    await Promise.all([
      collectSystemMetrics(),
      collectApplicationMetrics(),
    ]);
    
    const metrics = metricsCollector.getAllMetrics();
    const prometheusFormat = formatPrometheusMetrics(metrics);
    
    return new NextResponse(prometheusFormat, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error generating metrics:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}

// Note: metricsCollector is available internally but not exported to avoid Next.js route conflicts