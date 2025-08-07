'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Info,
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveChartProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  data?: any[];
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'funnel';
  exportable?: boolean;
  zoomable?: boolean;
  filterable?: boolean;
  className?: string;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  onFilter?: (filters: any) => void;
  onZoom?: (level: number) => void;
}

export default function InteractiveCharts({
  children,
  title,
  description,
  data = [],
  chartType = 'line',
  exportable = true,
  zoomable = true,
  filterable = false,
  className,
  onExport,
  onFilter,
  onZoom
}: InteractiveChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<any>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  const getChartIcon = () => {
    switch (chartType) {
      case 'bar': return BarChart3;
      case 'pie': return PieChart;
      case 'funnel': return Activity;
      default: return TrendingUp;
    }
  };

  const ChartIcon = getChartIcon();

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export functionality
      if (format === 'csv' && data.length > 0) {
        const csvContent = convertToCSV(data);
        downloadFile(csvContent, `${title.toLowerCase().replace(/\s+/g, '-')}.csv`, 'text/csv');
      } else if (format === 'png' && chartRef.current) {
        exportChartAsImage(chartRef.current, format);
      }
    }
  };

  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    let newZoomLevel = zoomLevel;
    
    switch (direction) {
      case 'in':
        newZoomLevel = Math.min(zoomLevel * 1.2, 3);
        break;
      case 'out':
        newZoomLevel = Math.max(zoomLevel / 1.2, 0.5);
        break;
      case 'reset':
        newZoomLevel = 1;
        break;
    }
    
    setZoomLevel(newZoomLevel);
    if (onZoom) {
      onZoom(newZoomLevel);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setTooltipPosition({ x: event.clientX, y: event.clientY });
    
    // Here you would typically calculate which data point is being hovered
    // For now, we'll show a simple tooltip
    setTooltipData({
      label: 'Data Point',
      value: 'Hover value',
      x,
      y
    });
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
    setTooltipData(null);
  };

  // Utility functions
  const convertToCSV = (data: any[]): string => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportChartAsImage = async (element: HTMLElement, format: 'png' | 'svg') => {
    try {
      // This would require a library like html2canvas for PNG export
      // For now, we'll show a placeholder implementation
      console.log(`Exporting chart as ${format.toUpperCase()}`);
      
      // Placeholder: In a real implementation, you'd use html2canvas or similar
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText('Chart Export Placeholder', 20, 30);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.${format}`;
            link.click();
            URL.revokeObjectURL(url);
          }
        }, `image/${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      <Card className={cn(
        \"interactive-chart-container relative\",
        isFullscreen && \"fixed inset-0 z-50 rounded-none\",
        className
      )}>
        <CardHeader>
          <div className=\"flex items-center justify-between\">
            <div className=\"min-w-0 flex-1\">
              <CardTitle className=\"flex items-center gap-2\">
                <ChartIcon className=\"h-5 w-5\" />
                {title}
              </CardTitle>
              {description && (
                <CardDescription>{description}</CardDescription>
              )}
            </div>
            
            <div className=\"flex items-center gap-2 ml-4\">
              {/* Data Info */}
              {data.length > 0 && (
                <Badge variant=\"outline\" className=\"text-xs\">
                  {data.length} points
                </Badge>
              )}
              
              {/* Filter Button */}
              {filterable && (
                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={() => onFilter && onFilter({})}
                  title=\"Filter data\"
                >
                  <Filter className=\"h-4 w-4\" />
                </Button>
              )}
              
              {/* Zoom Controls */}
              {zoomable && (
                <div className=\"flex items-center gap-1\">
                  <Button
                    variant=\"ghost\"
                    size=\"sm\"
                    onClick={() => handleZoom('out')}
                    disabled={zoomLevel <= 0.5}
                    title=\"Zoom out\"
                  >
                    <ZoomOut className=\"h-4 w-4\" />
                  </Button>
                  
                  <span className=\"text-xs text-muted-foreground min-w-[3rem] text-center\">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  
                  <Button
                    variant=\"ghost\"
                    size=\"sm\"
                    onClick={() => handleZoom('in')}
                    disabled={zoomLevel >= 3}
                    title=\"Zoom in\"
                  >
                    <ZoomIn className=\"h-4 w-4\" />
                  </Button>
                  
                  <Button
                    variant=\"ghost\"
                    size=\"sm\"
                    onClick={() => handleZoom('reset')}
                    disabled={zoomLevel === 1}
                    title=\"Reset zoom\"
                  >
                    <RotateCcw className=\"h-4 w-4\" />
                  </Button>
                </div>
              )}
              
              {/* Export Menu */}
              {exportable && (
                <div className=\"relative group\">
                  <Button
                    variant=\"ghost\"
                    size=\"sm\"
                    title=\"Export chart\"
                  >
                    <Download className=\"h-4 w-4\" />
                  </Button>
                  
                  <div className=\"absolute right-0 top-full mt-1 bg-background border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10\">
                    <div className=\"p-1 space-y-1 min-w-[120px]\">
                      <Button
                        variant=\"ghost\"
                        size=\"sm\"
                        className=\"w-full justify-start text-xs\"
                        onClick={() => handleExport('png')}
                      >
                        Export PNG
                      </Button>
                      <Button
                        variant=\"ghost\"
                        size=\"sm\"
                        className=\"w-full justify-start text-xs\"
                        onClick={() => handleExport('svg')}
                      >
                        Export SVG
                      </Button>
                      <Button
                        variant=\"ghost\"
                        size=\"sm\"
                        className=\"w-full justify-start text-xs\"
                        onClick={() => handleExport('csv')}
                      >
                        Export CSV
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Fullscreen Toggle */}
              <Button
                variant=\"ghost\"
                size=\"sm\"
                onClick={toggleFullscreen}
                title={isFullscreen ? \"Exit fullscreen\" : \"Enter fullscreen\"}
              >
                <Maximize2 className=\"h-4 w-4\" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className={cn(isFullscreen && \"flex-1 overflow-auto\")}>
          <div
            ref={chartRef}
            className=\"chart-content relative\"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease-out'
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {children}
          </div>
        </CardContent>
      </Card>

      {/* Tooltip */}
      {showTooltip && tooltipData && (
        <div
          className=\"fixed z-50 bg-background border rounded-md shadow-lg p-2 pointer-events-none\"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className=\"text-sm font-medium\">{tooltipData.label}</div>
          <div className=\"text-xs text-muted-foreground\">{tooltipData.value}</div>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className=\"fixed inset-0 bg-black/50 z-40\" onClick={toggleFullscreen} />
      )}
    </>
  );
}

// Specialized chart wrapper components
interface ChartWrapperProps extends Omit<InteractiveChartProps, 'chartType'> {}

export function LineChartWrapper(props: ChartWrapperProps) {
  return <InteractiveCharts {...props} chartType=\"line\" />;
}

export function BarChartWrapper(props: ChartWrapperProps) {
  return <InteractiveCharts {...props} chartType=\"bar\" />;
}

export function PieChartWrapper(props: ChartWrapperProps) {
  return <InteractiveCharts {...props} chartType=\"pie\" zoomable={false} />;
}

export function FunnelChartWrapper(props: ChartWrapperProps) {
  return <InteractiveCharts {...props} chartType=\"funnel\" zoomable={false} />;
}