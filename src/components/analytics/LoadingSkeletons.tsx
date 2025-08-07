/**
 * Loading Skeletons for Analytics Dashboard
 * 
 * Provides consistent loading states for all analytics components
 * with proper skeleton animations and responsive design.
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

/**
 * Metric Card Skeleton
 */
export const MetricCardSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-3/4 mb-3" />

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Chart Skeleton
 */
export const ChartSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Table Skeleton
 */
export const TableSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Dashboard Loading Skeleton
 */
export const DashboardSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters */}
      <FilterSkeleton />

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Tables and Additional Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <TableSkeleton />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Filter Panel Skeleton
 */
export const FilterSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </CardContent>
    </Card>
  );
};

/**
 * Loading State with Message
 */
export interface LoadingStateProps extends SkeletonProps {
  title?: string;
  description?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Loading Analytics Data",
  description,
  className
}) => {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <h3 className="text-lg font-semibold text-primary mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground text-center max-w-md">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Chart Bar Skeleton
 */
export const ChartBarSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 8, 
  className 
}) => {
  return (
    <div className={cn('flex items-end justify-between gap-2 h-32', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-8 bg-gray-200 rounded-t animate-pulse"
          style={{ height: `${((i % 4) * 15) + 25}%` }}
        />
      ))}
    </div>
  );
};

/**
 * Realtime Metrics Skeleton
 */
export const RealtimeMetricsSkeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn('grid gap-4 md:grid-cols-3', className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSkeleton;