'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon,
  FilterIcon,
  RotateCcwIcon,
  SaveIcon,
  SearchIcon
} from 'lucide-react';
import { format, subDays } from 'date-fns';

export interface FilterState {
  dateRange: { from: Date; to: Date; preset?: string };
  trafficSources: { categories: string[]; excludeBots: boolean; minConfidence: number };
  userAttributes: { deviceTypes: string[]; countries: string[] };
  pageAttributes: { categories: string[] };
  conversionFilters: { types: string[]; outcomeTypes: string[] };
}

interface AnalyticsFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const DATE_PRESETS = [
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 }
];

const TRAFFIC_CATEGORIES = [
  { value: 'organic', label: 'Organic Search' },
  { value: 'direct', label: 'Direct' },
  { value: 'social', label: 'Social Media' },
  { value: 'ai_assistant', label: 'AI Assistant' },
  { value: 'paid', label: 'Paid Advertising' }
];

export default function AnalyticsFilters({ filters, onFiltersChange }: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleDatePreset = (preset: string) => {
    const presetConfig = DATE_PRESETS.find(p => p.value === preset);
    if (presetConfig) {
      const to = new Date();
      const from = subDays(to, presetConfig.days);
      updateFilters({ dateRange: { from, to, preset } });
    }
  };

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      dateRange: { from: subDays(new Date(), 7), to: new Date() },
      trafficSources: { categories: [], excludeBots: true, minConfidence: 50 },
      userAttributes: { deviceTypes: [], countries: [] },
      pageAttributes: { categories: [] },
      conversionFilters: { types: [], outcomeTypes: [] }
    };
    onFiltersChange(defaultFilters);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Analytics Filters
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcwIcon className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={filters.dateRange.preset === preset.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleDatePreset(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Traffic Sources */}
            <div className="space-y-2">
              <Label>Traffic Sources</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {TRAFFIC_CATEGORIES.map((category) => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.trafficSources.categories.includes(category.value)}
                      onCheckedChange={(checked) => {
                        const categories = checked
                          ? [...filters.trafficSources.categories, category.value]
                          : filters.trafficSources.categories.filter(c => c !== category.value);
                        updateFilters({
                          trafficSources: { ...filters.trafficSources, categories }
                        });
                      }}
                    />
                    <Label className="text-sm">{category.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Bot Filtering */}
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={filters.trafficSources.excludeBots}
                onCheckedChange={(checked) => {
                  updateFilters({
                    trafficSources: { ...filters.trafficSources, excludeBots: !!checked }
                  });
                }}
              />
              <Label>Exclude bot traffic</Label>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}