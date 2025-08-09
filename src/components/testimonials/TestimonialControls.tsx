"use client"
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/ui/utils';
import { Search, Filter, SortAsc, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';

export interface FilterOptions {
  courses: string[];
  years: number[];
  verifiedOnly: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}

interface TestimonialControlsProps {
  onSearch: (query: string) => void;
  onFilter: (filters: FilterOptions) => void;
  onSort: (sortBy: string) => void;
  availableCourses: string[];
  availableYears: number[];
  className?: string;
}

const sortOptions: SortOption[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'highest-confidence', label: 'Highest Confidence' },
];

export default function TestimonialControls({
  onSearch,
  onFilter,
  onSort,
  availableCourses,
  availableYears,
  className
}: TestimonialControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 350);

  // Handle search
  React.useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch]); // Remove onSearch from dependencies to prevent infinite loop

  // Handle filter changes
  React.useEffect(() => {
    onFilter({
      courses: selectedCourses,
      years: selectedYears,
      verifiedOnly
    });
  }, [selectedCourses, selectedYears, verifiedOnly]); // Remove onFilter from dependencies to prevent infinite loop

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSort(value);
  };

  // Handle course selection
  const toggleCourse = (course: string) => {
    setSelectedCourses(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  // Handle year selection
  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCourses([]);
    setSelectedYears([]);
    setVerifiedOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCourses.length > 0 || selectedYears.length > 0 || verifiedOnly || searchQuery;

  return (
    <motion.div
      className={cn("space-y-4 p-4 bg-card/50 rounded-lg border", className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Course Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-2" />
              Course
              {selectedCourses.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {selectedCourses.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Course</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableCourses.map((course) => (
              <DropdownMenuCheckboxItem
                key={course}
                checked={selectedCourses.includes(course)}
                onCheckedChange={() => toggleCourse(course)}
              >
                {course}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Year Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-4 h-4 mr-2" />
              Year
              {selectedYears.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {selectedYears.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Graduation Year</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableYears.map((year) => (
              <DropdownMenuCheckboxItem
                key={year}
                checked={selectedYears.includes(year)}
                onCheckedChange={() => toggleYear(year)}
              >
                {year}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Verified Only Toggle */}
        <Button
          variant={verifiedOnly ? "default" : "outline"}
          size="sm"
          className="h-8"
          onClick={() => setVerifiedOnly(!verifiedOnly)}
        >
          ✓ Verified Only
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 min-h-[44px]"
            onClick={clearFilters}
            aria-label="Clear all filters"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedCourses.map((course) => (
            <Badge key={course} variant="secondary" className="text-xs">
              {course}
              <button
                onClick={() => toggleCourse(course)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {selectedYears.map((year) => (
            <Badge key={year} variant="secondary" className="text-xs">
              {year}
              <button
                onClick={() => toggleYear(year)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {verifiedOnly && (
            <Badge variant="secondary" className="text-xs">
              Verified Only
              <button
                onClick={() => setVerifiedOnly(false)}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </motion.div>
  );
}