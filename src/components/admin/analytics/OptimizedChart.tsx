'use client';

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  AlertTriangle,
  Download,
  Maximize2
} from 'lucide-react';
import { useMemoryOptimization } from '@/hooks/useMemoryOptimization';

interface ChartDataPoint {
  timestamp: number | string;
  [key: string]: any;
}

interface OptimizedChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'area' | 'bar' | 'pie';
  title: string;
  description?: string;
  xAxisKey: string;
  yAxisKeys: string[];
  colors?: string[];
  height?: number;
  maxDataPoints?: number;
  enableSampling?: boolean;
  enableZoom?: boolean;
  enableExport?: boolean;
  loading?: boolean;
  error?: string;
  onDataPointClick?: (data: ChartDataPoint) => void;
}

interface SamplingOptions {
  method: 'uniform' | 'peak' | 'adaptive';
  maxPoints: number;
}

const DEFAULT_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];

export default function OptimizedChart({
  data,
  type,
  title,
  description,
  xAxisKey,
  yAxisKeys,
  colors = DEFAULT_COLORS,
  height = 300,
  maxDataPoints = 1000,
  enableSampling = true,
  enableZoom = false,
  enableExport = false,
  loading = false,
  error,
  onDataPointClick
}: OptimizedChartProps) {
  const [samplingMethod, setSamplingMethod] = useState<SamplingOptions['method']>('adaptive');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  
  const { 
    createMemoizedProcessor, 
    getMemoryUsage, 
    startRenderMeasurement, 
    endRenderMeasurement 
  } = useMemoryOptimization({
    maxCacheSize: 50,
    enablePerformanceMonitoring: true
  });

  // Memoized data sampling
  const sampleData = useMemo(() => {
    if (!enableSampling || data.length <= maxDataPoints) {
      return data;
    }

    switch (samplingMethod) {
      case 'uniform':
        return uniformSampling(data, maxDataPoints);
      case 'peak':
        return peakSampling(data, maxDataPoints, yAxisKeys[0]);
      case 'adaptive':
        return adaptiveSampling(data, maxDataPoints, yAxisKeys[0]);
      default:
        return data.slice(0, maxDataPoints);
    }
  }, [data, samplingMethod, maxDataPoints, enableSampling, yAxisKeys]);

  // Memoized chart data processor
  const processChartData = createMemoizedProcessor(
    (rawData: ChartDataPoint[]) => {
      startRenderMeasurement();
      
      const processed = rawData.map(point => ({
        ...point,
        [xAxisKey]: formatXAxisValue(point[xAxisKey])
      }));
      
      endRenderMeasurement();
      return processed;
    },
    (data) => `chart_${type}_${data.length}_${JSON.stringify(yAxisKeys)}`,
    maxDataPoints
  );

  const chartData = useMemo(() => processChartData(sampleData), [processChartData, sampleData]);

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{formatTooltipLabel(label)}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}: {formatTooltipValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }, []);

  // Export functionality
  const handleExport = useCallback(async () => {
    if (!chartRef.current) return;

    try {
      // Create a canvas from the chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Export data as CSV
      const csvData = [
        [xAxisKey, ...yAxisKeys].join(','),
        ...chartData.map(point => 
          [point[xAxisKey], ...yAxisKeys.map(key => point[key])].join(',')
        )
      ].join('\n');

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_data.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [chartData, title, xAxisKey, yAxisKeys]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Performance monitoring
  const memoryUsage = getMemoryUsage();
  const shouldShowPerformanceWarning = 
    data.length > maxDataPoints * 2 || 
    (memoryUsage && memoryUsage.renderTime > 100);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yAxisKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={chartData.length <= 50}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yAxisKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {yAxisKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                onClick={onDataPointClick}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        const pieData = chartData.map((item, index) => ({
          name: item[xAxisKey],
          value: item[yAxisKeys[0]],
          fill: colors[index % colors.length]
        }));

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={isFullscreen ? 'fixed inset-0 z-50 m-4' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getChartIcon(type)}
              {title}
              <Badge variant="outline" className="ml-2">
                {chartData.length.toLocaleString()} points
              </Badge>
              {enableSampling && data.length > maxDataPoints && (
                <Badge variant="secondary" className="ml-1">
                  Sampled
                </Badge>
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {enableSampling && data.length > maxDataPoints && (
              <Select value={samplingMethod} onValueChange={(value: any) => setSamplingMethod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uniform">Uniform</SelectItem>
                  <SelectItem value="peak">Peak</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {enableExport && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {shouldShowPerformanceWarning && (
          <Alert className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Large dataset detected ({data.length.toLocaleString()} points). 
              Consider enabling sampling for better performance.
              {memoryUsage && ` Render time: ${memoryUsage.renderTime.toFixed(1)}ms`}
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      <CardContent>
        <div ref={chartRef} style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {memoryUsage && (
          <div className="mt-4 text-xs text-muted-foreground">
            Cache: {memoryUsage.cacheSize} items | 
            Memory: ~{memoryUsage.estimatedMemoryKB}KB |
            Render: {memoryUsage.renderTime.toFixed(1)}ms
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Sampling algorithms
function uniformSampling(data: ChartDataPoint[], maxPoints: number): ChartDataPoint[] {
  if (data.length <= maxPoints) return data;
  
  const step = Math.floor(data.length / maxPoints);
  const sampled: ChartDataPoint[] = [];
  
  for (let i = 0; i < data.length; i += step) {
    sampled.push(data[i]);
  }
  
  return sampled.slice(0, maxPoints);
}

function peakSampling(data: ChartDataPoint[], maxPoints: number, valueKey: string): ChartDataPoint[] {
  if (data.length <= maxPoints) return data;
  
  // Sort by value to identify peaks
  const sorted = [...data].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));
  const peaks = sorted.slice(0, Math.floor(maxPoints * 0.3)); // 30% peaks
  
  // Add uniform sampling for the rest
  const remaining = maxPoints - peaks.length;
  const uniform = uniformSampling(data, remaining);
  
  // Combine and sort by original order
  const combined = [...peaks, ...uniform];
  const originalIndices = new Map(data.map((item, index) => [item, index]));
  
  return combined.sort((a, b) => 
    (originalIndices.get(a) || 0) - (originalIndices.get(b) || 0)
  );
}

function adaptiveSampling(data: ChartDataPoint[], maxPoints: number, valueKey: string): ChartDataPoint[] {
  if (data.length <= maxPoints) return data;
  
  const sampled: ChartDataPoint[] = [];
  const step = data.length / maxPoints;
  
  for (let i = 0; i < maxPoints; i++) {
    const startIdx = Math.floor(i * step);
    const endIdx = Math.floor((i + 1) * step);
    const segment = data.slice(startIdx, endIdx);
    
    if (segment.length === 0) continue;
    
    // Find the point with the most significant value in this segment
    const significant = segment.reduce((prev, curr) => 
      (curr[valueKey] || 0) > (prev[valueKey] || 0) ? curr : prev
    );
    
    sampled.push(significant);
  }
  
  return sampled;
}

// Utility functions
function getChartIcon(type: string) {
  switch (type) {
    case 'line':
      return <Activity className="h-4 w-4" />;
    case 'area':
      return <TrendingUp className="h-4 w-4" />;
    case 'bar':
      return <BarChart3 className="h-4 w-4" />;
    case 'pie':
      return <PieChartIcon className="h-4 w-4" />;
    default:
      return <BarChart3 className="h-4 w-4" />;
  }
}

function formatXAxisValue(value: any): string {
  if (value instanceof Date) {
    return value.toLocaleDateString();
  }
  if (typeof value === 'number' && value > 1000000000000) {
    // Likely a timestamp
    return new Date(value).toLocaleDateString();
  }
  return String(value);
}

function formatTooltipLabel(label: any): string {
  if (typeof label === 'string' && label.includes('/')) {
    // Likely a date string
    return new Date(label).toLocaleString();
  }
  return String(label);
}

function formatTooltipValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  return String(value);
}