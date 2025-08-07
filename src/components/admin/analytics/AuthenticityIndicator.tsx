/**
 * AuthenticityIndicator Component
 * 
 * Visual indicators for data authenticity validation status.
 * Shows confidence scores, risk levels, and validation flags
 * for analytics metrics.
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  TrendingUp,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthenticityResult, AuthenticityFlag } from '@/lib/analytics/AuthenticityChecker';

export interface AuthenticityIndicatorProps {
  result: AuthenticityResult;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'icon' | 'full' | 'inline';
  showDetails?: boolean;
  className?: string;
}

export interface ConfidenceScoreProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export interface RiskLevelBadgeProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Main Authenticity Indicator Component
 */
export const AuthenticityIndicator: React.FC<AuthenticityIndicatorProps> = ({
  result,
  size = 'md',
  variant = 'badge',
  showDetails = false,
  className
}) => {
  const getIcon = () => {
    if (result.riskLevel === 'critical') return <ShieldX className="w-4 h-4" />;
    if (result.riskLevel === 'high') return <ShieldAlert className="w-4 h-4" />;
    if (result.riskLevel === 'medium') return <Shield className="w-4 h-4" />;
    return <ShieldCheck className="w-4 h-4" />;
  };

  const getColor = () => {
    switch (result.riskLevel) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  const getBadgeVariant = () => {
    switch (result.riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('inline-flex items-center', getColor(), className)}>
              {getIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <AuthenticityTooltip result={result} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'badge') {
    const badgeContent = (
      <Badge 
        variant={getBadgeVariant()} 
        className={cn('inline-flex items-center gap-1', sizeClasses[size], className)}
      >
        {getIcon()}
        <span>{result.authentic ? 'Verified' : 'Flagged'}</span>
      </Badge>
    );

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            <AuthenticityTooltip result={result} />
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1', getColor(), sizeClasses[size], className)}>
        {getIcon()}
        <span>{(result.confidence * 100).toFixed(0)}% confident</span>
      </span>
    );
  }

  // Full variant
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={getColor()}>
            {getIcon()}
          </div>
          <span className={cn('font-medium', sizeClasses[size])}>
            {result.authentic ? 'Data Verified' : 'Data Flagged'}
          </span>
        </div>
        <ConfidenceScore confidence={result.confidence} size={size} />
      </div>
      
      {showDetails && result.flags.length > 0 && (
        <div className="space-y-1">
          {result.flags.slice(0, 3).map((flag, index) => (
            <AuthenticityFlagDisplay key={index} flag={flag} size="sm" />
          ))}
          {result.flags.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{result.flags.length - 3} more issues
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Confidence Score Component
 */
export const ConfidenceScore: React.FC<ConfidenceScoreProps> = ({
  confidence,
  size = 'md',
  showLabel = true,
  className
}) => {
  const percentage = Math.round(confidence * 100);
  
  const getColor = () => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('inline-flex items-center gap-1', getColor(), sizeClasses[size], className)}>
      <Activity className="w-3 h-3" />
      <span className="font-medium">{percentage}%</span>
      {showLabel && <span className="text-muted-foreground">confident</span>}
    </div>
  );
};

/**
 * Risk Level Badge Component
 */
export const RiskLevelBadge: React.FC<RiskLevelBadgeProps> = ({
  riskLevel,
  size = 'md',
  className
}) => {
  const getVariant = () => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getIcon = () => {
    switch (riskLevel) {
      case 'critical': return <XCircle className="w-3 h-3" />;
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Info className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn('inline-flex items-center gap-1', sizeClasses[size], className)}
    >
      {getIcon()}
      <span className="capitalize">{riskLevel} Risk</span>
    </Badge>
  );
};

/**
 * Authenticity Flag Display Component
 */
export interface AuthenticityFlagDisplayProps {
  flag: AuthenticityFlag;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuthenticityFlagDisplay: React.FC<AuthenticityFlagDisplayProps> = ({
  flag,
  size = 'md',
  className
}) => {
  const getIcon = () => {
    switch (flag.severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn('flex items-start gap-2 p-2 rounded-md bg-muted/50', sizeClasses[size], className)}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="font-medium">{flag.description}</p>
        {flag.evidence && (
          <p className="text-muted-foreground mt-1">
            Evidence: {JSON.stringify(flag.evidence, null, 2).slice(0, 100)}...
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground capitalize">
            {flag.severity} severity
          </span>
          <span className="text-xs text-muted-foreground">
            {(flag.confidence * 100).toFixed(0)}% confidence
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Authenticity Tooltip Component
 */
export interface AuthenticityTooltipProps {
  result: AuthenticityResult;
}

export const AuthenticityTooltip: React.FC<AuthenticityTooltipProps> = ({ result }) => {
  return (
    <div className="space-y-3 max-w-sm">
      <div>
        <h4 className="font-medium text-sm">Data Authenticity</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {result.reason}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="font-medium">Confidence:</span>
          <div className="mt-1">
            <ConfidenceScore 
              confidence={result.confidence} 
              size="sm" 
              showLabel={false} 
            />
          </div>
        </div>
        <div>
          <span className="font-medium">Risk Level:</span>
          <div className="mt-1">
            <RiskLevelBadge riskLevel={result.riskLevel} size="sm" />
          </div>
        </div>
      </div>

      <div>
        <span className="font-medium text-xs">Source:</span>
        <p className="text-xs text-muted-foreground">{result.source}</p>
      </div>

      <div>
        <span className="font-medium text-xs">Last Checked:</span>
        <p className="text-xs text-muted-foreground">
          {result.timestamp.toLocaleTimeString()}
        </p>
      </div>

      {result.flags.length > 0 && (
        <div>
          <span className="font-medium text-xs">Issues Found:</span>
          <ul className="text-xs text-muted-foreground mt-1 space-y-1">
            {result.flags.slice(0, 2).map((flag, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="w-1 h-1 bg-current rounded-full" />
                {flag.description}
              </li>
            ))}
            {result.flags.length > 2 && (
              <li className="text-muted-foreground/70">
                +{result.flags.length - 2} more issues
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * Authenticity Alert Component for critical issues
 */
export interface AuthenticityAlertProps {
  result: AuthenticityResult;
  className?: string;
}

export const AuthenticityAlert: React.FC<AuthenticityAlertProps> = ({
  result,
  className
}) => {
  if (result.riskLevel === 'low' || result.authentic) {
    return null;
  }

  const getVariant = () => {
    if (result.riskLevel === 'critical') return 'destructive';
    return 'default';
  };

  return (
    <Alert variant={getVariant()} className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">Data Authenticity Warning</p>
          <p className="text-sm">{result.reason}</p>
          <div className="flex items-center gap-4 text-xs">
            <ConfidenceScore 
              confidence={result.confidence} 
              size="sm" 
            />
            <RiskLevelBadge 
              riskLevel={result.riskLevel} 
              size="sm" 
            />
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Utility function to render authenticity indicator based on data
 */
export const renderAuthenticityIndicator = (
  result: AuthenticityResult | null,
  options: {
    variant?: AuthenticityIndicatorProps['variant'];
    size?: AuthenticityIndicatorProps['size'];
    showDetails?: boolean;
    className?: string;
  } = {}
) => {
  if (!result) {
    return (
      <Badge variant="outline" className={options.className}>
        <Info className="w-3 h-3 mr-1" />
        Unknown
      </Badge>
    );
  }

  return (
    <AuthenticityIndicator
      result={result}
      variant={options.variant}
      size={options.size}
      showDetails={options.showDetails}
      className={options.className}
    />
  );
};