'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
}

interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrafficSourceChartProps {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

export function TrafficSourceChart({ 
  data, 
  title = "Traffic Sources", 
  description = "Where your visitors are coming from",
  className 
}: TrafficSourceChartProps) {
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');
  
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  const chartData = useMemo(() => 
    data.map(item => ({
      ...item,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    })), [data, total]
  );

  const colors = [
    '#1e40af', // aviation-primary
    '#3b82f6', // blue-500
    '#60a5fa', // blue-400
    '#93c5fd', // blue-300
    '#dbeafe', // blue-100
    '#f3f4f6', // gray-100
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Select value={viewType} onValueChange={(value: 'pie' | 'bar') => setViewType(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Pie
                </div>
              </SelectItem>
              <SelectItem value="bar">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Bar
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {viewType === 'pie' ? (
          <div className="space-y-4">
            {/* Simple Pie Chart Representation */}
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {chartData.map((item, index) => {
                  const startAngle = chartData.slice(0, index).reduce((sum, d) => sum + (d.percentage / 100) * 360, 0);
                  const endAngle = startAngle + (item.percentage / 100) * 360;
                  const largeArcFlag = item.percentage > 50 ? 1 : 0;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={item.color || colors[index % colors.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      title={`${item.label}: ${item.value} (${item.percentage.toFixed(1)}%)`}
                    />
                  );
                })}
              </svg>
              
              {/* Center Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-aviation-primary">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2">
              {chartData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color || colors[index % colors.length] }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{item.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="space-y-3">
              {chartData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span>{item.value.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color || colors[index % colors.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DeviceBreakdownChartProps {
  data: ChartDataPoint[];
  title?: string;
  description?: string;
  className?: string;
}

export function DeviceBreakdownChart({ 
  data, 
  title = "Device Breakdown", 
  description = "Visitor device types",
  className 
}: DeviceBreakdownChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  
  const getDeviceIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('mobile')) return Smartphone;
    if (lowerLabel.includes('tablet')) return Smartphone;
    return Monitor;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const Icon = getDeviceIcon(item.label);
            
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="p-2 bg-aviation-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-aviation-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.value.toLocaleString()}</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-aviation-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface TrendChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
  description?: string;
  metric?: string;
  className?: string;
}

export function TrendChart({ 
  data, 
  title = "Traffic Trend", 
  description = "Visitor trends over time",
  metric = "Visitors",
  className 
}: TrendChartProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
  const minValue = useMemo(() => Math.min(...data.map(d => d.value)), [data]);
  const avgValue = useMemo(() => data.reduce((sum, d) => sum + d.value, 0) / data.length, [data]);
  
  const trend = useMemo(() => {
    if (data.length < 2) return 'stable';
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.05) return 'up';
    if (secondAvg < firstAvg * 0.95) return 'down';
    return 'stable';
  }, [data]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1", getTrendColor())}>
              {getTrendIcon()}
              <span className="text-sm font-medium capitalize">{trend}</span>
            </div>
            <Select value={period} onValueChange={(value: '7d' | '30d' | '90d') => setPeriod(value)}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {maxValue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Peak</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-aviation-primary">
                {Math.round(avgValue).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {minValue.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
          </div>
          
          {/* Simple Line Chart */}
          <div className="h-32 relative">
            <svg viewBox="0 0 400 100" className="w-full h-full">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
              
              {/* Data line */}
              <polyline
                fill="none"
                stroke="#1e40af"
                strokeWidth="2"
                points={data.map((point, index) => {
                  const x = (index / (data.length - 1)) * 400;
                  const y = 100 - ((point.value - minValue) / (maxValue - minValue)) * 100;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = 100 - ((point.value - minValue) / (maxValue - minValue)) * 100;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#1e40af"
                    className="hover:r-4 transition-all cursor-pointer"
                    title={`${point.date}: ${point.value.toLocaleString()}`}
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Time labels */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{data[0]?.date}</span>
            <span>{data[Math.floor(data.length / 2)]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConversionFunnelProps {
  data: Array<{
    stage: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  description?: string;
  className?: string;
}

export function ConversionFunnel({ 
  data, 
  title = "Conversion Funnel", 
  description = "User journey through your site",
  className 
}: ConversionFunnelProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((stage, index) => {
            const percentage = (stage.value / maxValue) * 100;
            const conversionRate = index > 0 ? (stage.value / data[index - 1].value) * 100 : 100;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{stage.value.toLocaleString()}</span>
                    {index > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {conversionRate.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded h-8 flex items-center">
                    <div 
                      className="h-full rounded transition-all duration-500 ease-out flex items-center justify-center text-white text-sm font-medium"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: stage.color || '#1e40af',
                        minWidth: percentage > 20 ? 'auto' : '60px'
                      }}
                    >
                      {stage.value.toLocaleString()}
                    </div>
                  </div>
                  
                  {index < data.length - 1 && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Export all chart components
export default {
  TrafficSourceChart,
  DeviceBreakdownChart,
  TrendChart,
  ConversionFunnel
};