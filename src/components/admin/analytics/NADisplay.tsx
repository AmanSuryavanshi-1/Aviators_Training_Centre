/**
 * NADisplay Component
 * 
 * Reusable component for displaying "NA" values with consistent styling,
 * tooltips, and accessibility features across the analytics dashboard.
 */

'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DisplayValue, NAReasonType } from '@/lib/analytics/NAWrapperService';

export interface NADisplayProps {
  value?: DisplayValue<any>;
  reason?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'muted' | 'warning' | 'error';
  showIcon?: boolean;
  showTooltip?: boolean;
  className?: string;
  'data-testid'?: string;
}

export interface NATooltipProps {
  reason: string;
  source?: string;
  timestamp?: Date;
  confidence?: number;
}

/**
 * Main NA Display Component
 */
export const NADisplay: React.FC<NADisplayProps> = ({
  value,
  reason,
  size = 'md',
  variant = 'default',
  showIcon = true,
  showTooltip = true,
  className,
  'data-testid': testId,
}) => {
  const displayReason = reason || value?.reason || 'Data not available';
  const isNA = value?.isNA ?? true;

  if (!isNA && value?.value !== undefined) {
    // If value is not NA, render the actual value
    return <span className={className}>{String(value.value)}</span>;
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const variantClasses = {
    default: 'text-muted-foreground',
    muted: 'text-muted-foreground/70',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  };

  const iconClasses = {
    default: 'text-muted-foreground/60',
    muted: 'text-muted-foreground/40',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="w-3 h-3" />;
      case 'error':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  const naElement = (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium select-none',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      aria-label={`Not available: ${displayReason}`}
      data-testid={testId}
    >
      {showIcon && getIcon()}
      <span>NA</span>
    </span>
  );

  if (!showTooltip) {
    return naElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {naElement}
        </TooltipTrigger>
        <TooltipContent>
          <NATooltip
            reason={displayReason}
            source={value?.source}
            timestamp={value?.timestamp}
            confidence={value?.confidence}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * NA Tooltip Component
 */
export const NATooltip: React.FC<NATooltipProps> = ({
  reason,
  source,
  timestamp,
  confidence
}) => {
  return (
    <div className="space-y-2 max-w-xs">
      <div className="font-medium text-sm">Data Not Available</div>
      <div className="text-xs text-muted-foreground">
        <div className="mb-1">{reason}</div>
        {source && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Source:</span>
            <span>{source}</span>
          </div>
        )}
        {timestamp && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Checked:</span>
            <span>{timestamp.toLocaleTimeString()}</span>
          </div>
        )}
        {confidence !== undefined && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Confidence:</span>
            <span>{(confidence * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * NA Badge Component for inline display
 */
export interface NABadgeProps {
  value?: DisplayValue<any>;
  reason?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  showTooltip?: boolean;
  className?: string;
}

export const NABadge: React.FC<NABadgeProps> = ({
  value,
  reason,
  variant = 'secondary',
  showTooltip = true,
  className
}) => {
  const displayReason = reason || value?.reason || 'Data not available';
  const isNA = value?.isNA ?? true;

  if (!isNA && value?.value !== undefined) {
    return <span className={className}>{String(value.value)}</span>;
  }

  const badgeElement = (
    <Badge variant={variant} className={cn('cursor-help', className)}>
      NA
    </Badge>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeElement}
        </TooltipTrigger>
        <TooltipContent>
          <NATooltip
            reason={displayReason}
            source={value?.source}
            timestamp={value?.timestamp}
            confidence={value?.confidence}
          />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * NA Card Component for larger displays
 */
export interface NACardProps {
  title: string;
  value?: DisplayValue<any>;
  reason?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const NACard: React.FC<NACardProps> = ({
  title,
  value,
  reason,
  icon,
  className
}) => {
  const displayReason = reason || value?.reason || 'Data not available';
  const isNA = value?.isNA ?? true;

  return (
    <div className={cn(
      'p-4 border rounded-lg bg-card text-card-foreground',
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon}
      </div>
      
      {isNA ? (
        <div className="space-y-2">
          <NADisplay
            value={value}
            reason={displayReason}
            size="lg"
            variant="muted"
            showTooltip={true}
          />
          <p className="text-xs text-muted-foreground/70">
            {displayReason}
          </p>
        </div>
      ) : (
        <div className="text-2xl font-bold">
          {String(value?.value)}
        </div>
      )}
    </div>
  );
};

/**
 * NA Table Cell Component
 */
export interface NATableCellProps {
  value?: DisplayValue<any>;
  reason?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const NATableCell: React.FC<NATableCellProps> = ({
  value,
  reason,
  align = 'left',
  className
}) => {
  const displayReason = reason || value?.reason || 'Data not available';
  const isNA = value?.isNA ?? true;

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  if (!isNA && value?.value !== undefined) {
    return (
      <td className={cn('px-4 py-2', alignClasses[align], className)}>
        {String(value.value)}
      </td>
    );
  }

  return (
    <td className={cn('px-4 py-2', alignClasses[align], className)}>
      <NADisplay
        value={value}
        reason={displayReason}
        size="sm"
        variant="muted"
        showTooltip={true}
      />
    </td>
  );
};

/**
 * Utility function to render value or NA
 */
export const renderValueOrNA = (
  value: DisplayValue<any> | any,
  options: {
    component?: 'display' | 'badge' | 'text';
    size?: NADisplayProps['size'];
    variant?: NADisplayProps['variant'];
    className?: string;
  } = {}
) => {
  const { component = 'display', ...props } = options;

  // Handle non-DisplayValue inputs
  if (value && typeof value === 'object' && 'isNA' in value) {
    // It's a DisplayValue
    switch (component) {
      case 'badge':
        return <NABadge value={value} {...props} />;
      case 'text':
        return value.isNA ? 'NA' : String(value.value);
      default:
        return <NADisplay value={value} {...props} />;
    }
  } else {
    // It's a raw value
    if (value === null || value === undefined) {
      switch (component) {
        case 'badge':
          return <NABadge {...props} />;
        case 'text':
          return 'NA';
        default:
          return <NADisplay {...props} />;
      }
    } else {
      return String(value);
    }
  }
};