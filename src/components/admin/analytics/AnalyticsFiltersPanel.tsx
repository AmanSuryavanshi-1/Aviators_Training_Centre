/**
 * AnalyticsFiltersPanel Component
 * 
 * Comprehensive filters panel for analytics dashboard with controlled state management.
 * Includes date range picker, dropdown filters, and "Apply Filters" button for
 * controlled data fetching without automatic refreshes.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CalendarIcon, 
  Filter, 
  RefreshCw, 
  X, 
  Settings,
  ShieldCheck,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
  };
  timeframe: 'custom' | 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year';
  sourceCategory?: string;
  deviceType?: string;
  location?: string;
  validOnly: boolean;
  includeBot: boolean;
  minConfidence: number;
  dataSource?: string;
}

export interface AnalyticsFiltersPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  loading?: boolean;
  lastApplied?: Date;
  className?: string;
}

const DEFAULT_FILTERS: FilterState = {
  dateRange: {
    from: subDays(new Date(), 7),
    to: new Date()
  },
  timeframe: 'week',
  validOnly: true,
  includeBot: false,
  minConfidence: 0.8
};

export const AnalyticsFiltersPanel: React.FC<AnalyticsFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  loading = false,
  lastApplied,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(false);

  // Track if filters have changed since last apply
  React.useEffect(() => {
    setPendingChanges(true);
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Auto-update date range when timeframe changes
    if (key === 'timeframe' && value !== 'custom') {
      const now = new Date();
      let from: Date;
      
      switch (value) {
        case 'today':
          from = startOfDay(now);
          newFilters.dateRange = { from, to: endOfDay(now) };
          break;
        case 'yesterday':
          from = startOfDay(subDays(now, 1));
          newFilters.dateRange = { from, to: endOfDay(subDays(now, 1)) };
          break;
        case 'week':
          from = subDays(now, 7);
          newFilters.dateRange = { from, to: now };
          break;
        case 'month':
          from = subDays(now, 30);
          newFilters.dateRange = { from, to: now };
          break;
        case 'quarter':
          from = subDays(now, 90);
          newFilters.dateRange = { from, to: now };
          break;
        case 'year':
          from = subDays(now, 365);
          newFilters.dateRange = { from, to: now };
          break;
      }
    }
    
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      handleFilterChange('dateRange', { from: range.from, to: range.to });
      handleFilterChange('timeframe', 'custom');
    }
  }, [handleFilterChange]);

  const handleApplyFilters = useCallback(() => {
    setPendingChanges(false);
    onApplyFilters();
  }, [onApplyFilters]);

  const handleResetFilters = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.sourceCategory && filters.sourceCategory !== 'all') count++;
    if (filters.deviceType && filters.deviceType !== 'all') count++;
    if (filters.location && filters.location !== 'all') count++;
    if (filters.dataSource && filters.dataSource !== 'all') count++;
    if (!filters.validOnly) count++;
    if (filters.includeBot) count++;
    if (filters.minConfidence !== 0.8) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings className="h-4 w-4" />
              {isExpanded ? 'Less' : 'More'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "MMM dd")} -{" "}
                        {format(filters.dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={filters.dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Time Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Select</Label>
            <Select 
              value={filters.timeframe} 
              onValueChange={(value: any) => handleFilterChange('timeframe', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Apply Filters Button */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Actions</Label>
            <div className="flex gap-2">
              <Button
                onClick={handleApplyFilters}
                disabled={loading || !pendingChanges}
                className="flex-1"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Secondary Filters - Expandable */}
        {isExpanded && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Source Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Traffic Source
                </Label>
                <Select 
                  value={filters.sourceCategory || 'all'} 
                  onValueChange={(value) => handleFilterChange('sourceCategory', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="organic">Organic Search</SelectItem>
                    <SelectItem value="direct">Direct Traffic</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="ai_assistant">AI Assistant</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="paid">Paid Advertising</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Device Type Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  Device Type
                </Label>
                <Select 
                  value={filters.deviceType || 'all'} 
                  onValueChange={(value) => handleFilterChange('deviceType', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Devices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="desktop">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3 w-3" />
                        Desktop
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3 w-3" />
                        Mobile
                      </div>
                    </SelectItem>
                    <SelectItem value="tablet">
                      <div className="flex items-center gap-2">
                        <Tablet className="h-3 w-3" />
                        Tablet
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Source Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Source</Label>
                <Select 
                  value={filters.dataSource || 'all'} 
                  onValueChange={(value) => handleFilterChange('dataSource', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="ga4">Google Analytics 4</SelectItem>
                    <SelectItem value="search_console">Search Console</SelectItem>
                    <SelectItem value="firebase">Firebase Analytics</SelectItem>
                    <SelectItem value="server_logs">Server Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Select 
                  value={filters.location || 'all'} 
                  onValueChange={(value) => handleFilterChange('location', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="other">Other Countries</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Data Quality Filters */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Data Quality & Authenticity
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Valid Traffic Only */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="valid-only"
                    checked={filters.validOnly}
                    onCheckedChange={(checked) => handleFilterChange('validOnly', checked)}
                  />
                  <Label htmlFor="valid-only" className="text-sm">
                    Valid Traffic Only
                  </Label>
                </div>

                {/* Include Bot Traffic */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-bot"
                    checked={filters.includeBot}
                    onCheckedChange={(checked) => handleFilterChange('includeBot', checked)}
                  />
                  <Label htmlFor="include-bot" className="text-sm">
                    Include Bot Traffic
                  </Label>
                </div>

                {/* Minimum Confidence */}
                <div className="space-y-2">
                  <Label className="text-sm">Min. Confidence</Label>
                  <Select 
                    value={filters.minConfidence.toString()} 
                    onValueChange={(value) => handleFilterChange('minConfidence', parseFloat(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any (0%)</SelectItem>
                      <SelectItem value="0.5">Low (50%)</SelectItem>
                      <SelectItem value="0.7">Medium (70%)</SelectItem>
                      <SelectItem value="0.8">High (80%)</SelectItem>
                      <SelectItem value="0.9">Very High (90%)</SelectItem>
                      <SelectItem value="0.95">Excellent (95%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Status and Reset */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {lastApplied && (
              <span>
                Last applied: {format(lastApplied, 'MMM dd, HH:mm')}
              </span>
            )}
            {pendingChanges && (
              <Badge variant="outline" className="text-xs">
                Changes pending
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};