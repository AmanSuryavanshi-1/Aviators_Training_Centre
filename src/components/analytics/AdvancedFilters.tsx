'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  Download,
  RefreshCw,
  Settings,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport: (format: 'csv' | 'excel') => void;
  onReset: () => void;
  loading?: boolean;
  className?: string;
}

const SOURCE_CATEGORIES = [
  { value: 'search', label: 'Search Engines' },
  { value: 'social', label: 'Social Media' },
  { value: 'direct', label: 'Direct Traffic' },
  { value: 'referral', label: 'Referral Sites' },
  { value: 'ai', label: 'AI Platforms' },
  { value: 'ads', label: 'Paid Advertising' }
];

const PAGE_CATEGORIES = [
  { value: 'home', label: 'Homepage' },
  { value: 'blog', label: 'Blog Posts' },
  { value: 'contact', label: 'Contact Pages' },
  { value: 'courses', label: 'Course Pages' },
  { value: 'about', label: 'About Pages' },
  { value: 'resources', label: 'Resources' }
];

const DEVICE_TYPES = [
  { value: 'desktop', label: 'Desktop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' }
];

const LOCATIONS = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'other', label: 'Other Countries' }
];

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onExport,
  onReset,
  loading = false,
  className
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.sourceCategory?.length) count++;
    if (filters.pageCategory?.length) count++;
    if (filters.deviceType?.length) count++;
    if (filters.location?.length) count++;
    if (filters.searchQuery) count++;
    if (filters.timeframe === 'custom') count++;
    if (!filters.validOnly) count++;
    if (!filters.includeAI) count++;
    if (filters.includeBots) count++;
    return count;
  };

  const clearFilter = (key: keyof FilterOptions) => {
    if (key === 'dateRange') {
      updateFilter('timeframe', 'week');
      updateFilter('dateRange', undefined);
    } else {
      updateFilter(key, key === 'validOnly' || key === 'includeAI' ? true : 
                       key === 'includeBots' ? false : undefined);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-aviation-primary/20"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            disabled={loading}
            className="border-aviation-primary/20 hover:bg-aviation-primary hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('excel')}
            disabled={loading}
            className="border-aviation-primary/20 hover:bg-aviation-primary hover:text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.sourceCategory?.map(source => (
            <Badge key={source} variant="secondary" className="gap-1">
              Source: {SOURCE_CATEGORIES.find(s => s.value === source)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleArrayFilter('sourceCategory', source)}
              />
            </Badge>
          ))}
          
          {filters.pageCategory?.map(page => (
            <Badge key={page} variant="secondary" className="gap-1">
              Page: {PAGE_CATEGORIES.find(p => p.value === page)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleArrayFilter('pageCategory', page)}
              />
            </Badge>
          ))}
          
          {filters.deviceType?.map(device => (
            <Badge key={device} variant="secondary" className="gap-1">
              Device: {DEVICE_TYPES.find(d => d.value === device)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleArrayFilter('deviceType', device)}
              />
            </Badge>
          ))}
          
          {filters.location?.map(location => (
            <Badge key={location} variant="secondary" className="gap-1">
              Location: {LOCATIONS.find(l => l.value === location)?.label}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => toggleArrayFilter('location', location)}
              />
            </Badge>
          ))}
          
          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearFilter('searchQuery')}
              />
            </Badge>
          )}
          
          {filters.timeframe === 'custom' && filters.dateRange && (
            <Badge variant="secondary" className="gap-1">
              Date: {format(filters.dateRange.from, 'MMM dd')} - {format(filters.dateRange.to, 'MMM dd')}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => clearFilter('dateRange')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aviation-primary">
              <Settings className="h-5 w-5" />
              Filter Options
            </CardTitle>
            <CardDescription>
              Customize your analytics view with advanced filtering options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Query */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Pages/Content</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by page title, URL, or content..."
                  value={filters.searchQuery || ''}
                  onChange={(e) => updateFilter('searchQuery', e.target.value || undefined)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Select 
                  value={filters.timeframe} 
                  onValueChange={(value) => updateFilter('timeframe', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
                
                {filters.timeframe === 'custom' && (
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-64 justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.from ? (
                          filters.dateRange.to ? (
                            <>
                              {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                              {format(filters.dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(filters.dateRange.from, "LLL dd, y")
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
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={(range) => updateFilter('dateRange', range)}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div className="space-y-3">
                <Label>Traffic Sources</Label>
                <div className="space-y-2">
                  {SOURCE_CATEGORIES.map(source => (
                    <div key={source.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`source-${source.value}`}
                        checked={filters.sourceCategory?.includes(source.value) || false}
                        onCheckedChange={() => toggleArrayFilter('sourceCategory', source.value)}
                      />
                      <Label htmlFor={`source-${source.value}`} className="text-sm font-normal">
                        {source.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Categories */}
              <div className="space-y-3">
                <Label>Page Categories</Label>
                <div className="space-y-2">
                  {PAGE_CATEGORIES.map(page => (
                    <div key={page.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`page-${page.value}`}
                        checked={filters.pageCategory?.includes(page.value) || false}
                        onCheckedChange={() => toggleArrayFilter('pageCategory', page.value)}
                      />
                      <Label htmlFor={`page-${page.value}`} className="text-sm font-normal">
                        {page.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Types */}
              <div className="space-y-3">
                <Label>Device Types</Label>
                <div className="space-y-2">
                  {DEVICE_TYPES.map(device => (
                    <div key={device.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`device-${device.value}`}
                        checked={filters.deviceType?.includes(device.value) || false}
                        onCheckedChange={() => toggleArrayFilter('deviceType', device.value)}
                      />
                      <Label htmlFor={`device-${device.value}`} className="text-sm font-normal">
                        {device.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3">
                <Label>Locations</Label>
                <div className="space-y-2">
                  {LOCATIONS.map(location => (
                    <div key={location.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`location-${location.value}`}
                        checked={filters.location?.includes(location.value) || false}
                        onCheckedChange={() => toggleArrayFilter('location', location.value)}
                      />
                      <Label htmlFor={`location-${location.value}`} className="text-sm font-normal">
                        {location.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Quality Options */}
            <div className="space-y-3">
              <Label>Data Quality</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="valid-only"
                    checked={filters.validOnly}
                    onCheckedChange={(checked) => updateFilter('validOnly', checked)}
                  />
                  <Label htmlFor="valid-only" className="text-sm font-normal">
                    Valid traffic only (exclude suspicious activity)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-ai"
                    checked={filters.includeAI}
                    onCheckedChange={(checked) => updateFilter('includeAI', checked)}
                  />
                  <Label htmlFor="include-ai" className="text-sm font-normal">
                    Include AI platform traffic (ChatGPT, Claude, etc.)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-bots"
                    checked={filters.includeBots}
                    onCheckedChange={(checked) => updateFilter('includeBots', checked)}
                  />
                  <Label htmlFor="include-bots" className="text-sm font-normal">
                    Include bot traffic (for debugging purposes)
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}