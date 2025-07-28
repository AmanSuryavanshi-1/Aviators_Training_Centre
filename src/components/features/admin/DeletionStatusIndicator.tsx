'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Info,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeletionStatus = 
  | 'idle'
  | 'validating'
  | 'deleting'
  | 'cache-invalidating'
  | 'success'
  | 'error'
  | 'retrying';

export interface DeletionProgress {
  status: DeletionStatus;
  message: string;
  progress?: number;
  retryCount?: number;
  maxRetries?: number;
  error?: {
    code: string;
    message: string;
    category: string;
    retryable: boolean;
    suggestedAction?: string;
  };
  duration?: number;
  postTitle?: string;
  cacheInvalidated?: boolean;
}

interface DeletionStatusIndicatorProps {
  progress: DeletionProgress;
  onRetry?: () => void;
  onCancel?: () => void;
  compact?: boolean;
  showDetails?: boolean;
}

const statusConfig = {
  idle: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Ready',
    description: 'Ready to delete'
  },
  validating: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Validating',
    description: 'Checking prerequisites'
  },
  deleting: {
    icon: Trash2,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    label: 'Deleting',
    description: 'Removing from database'
  },
  'cache-invalidating': {
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    label: 'Updating Cache',
    description: 'Invalidating cached data'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Success',
    description: 'Successfully deleted'
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Failed',
    description: 'Deletion failed'
  },
  retrying: {
    icon: RefreshCw,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100',
    label: 'Retrying',
    description: 'Attempting retry'
  }
};

export function DeletionStatusIndicator({
  progress,
  onRetry,
  onCancel,
  compact = false,
  showDetails = true
}: DeletionStatusIndicatorProps) {
  const [animationKey, setAnimationKey] = useState(0);

  // Trigger animation when status changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [progress.status]);

  const config = statusConfig[progress.status];
  const IconComponent = config.icon;
  const isLoading = ['validating', 'deleting', 'cache-invalidating', 'retrying'].includes(progress.status);
  const isComplete = progress.status === 'success';
  const hasError = progress.status === 'error';

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (progress.progress !== undefined) {
      return progress.progress;
    }

    switch (progress.status) {
      case 'idle': return 0;
      case 'validating': return 10;
      case 'deleting': return 50;
      case 'cache-invalidating': return 80;
      case 'success': return 100;
      case 'error': return 0;
      case 'retrying': return 25;
      default: return 0;
    }
  };

  const progressPercentage = getProgressPercentage();

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={hasError ? 'destructive' : isComplete ? 'default' : 'secondary'}
              className={cn(
                'flex items-center gap-1 transition-all duration-200',
                config.bgColor,
                config.color
              )}
            >
              <IconComponent 
                className={cn(
                  'h-3 w-3',
                  isLoading && 'animate-spin'
                )} 
              />
              {config.label}
              {progress.retryCount && progress.retryCount > 0 && (
                <span className="text-xs">({progress.retryCount})</span>
              )}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{progress.message}</div>
              {progress.duration && (
                <div className="text-xs text-gray-500 mt-1">
                  Duration: {(progress.duration / 1000).toFixed(1)}s
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
            config.bgColor
          )}>
            <IconComponent 
              className={cn(
                'h-4 w-4 transition-all duration-200',
                config.color,
                isLoading && 'animate-spin'
              )} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{config.label}</span>
              {progress.retryCount && progress.retryCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  Retry {progress.retryCount}/{progress.maxRetries || 3}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600">{progress.message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasError && onRetry && progress.error?.retryable && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {isLoading && onCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className="text-xs"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(isLoading || hasError) && (
        <div className="space-y-1">
          <Progress 
            value={progressPercentage} 
            className={cn(
              'h-2 transition-all duration-300',
              hasError && 'bg-red-100'
            )}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{config.description}</span>
            {progress.duration && (
              <span>{(progress.duration / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
      )}

      {/* Error Details */}
      {hasError && progress.error && showDetails && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <div>
                <span className="font-medium text-red-800">
                  {progress.error.code}:
                </span>
                <span className="text-red-700 ml-1">
                  {progress.error.message}
                </span>
              </div>
              {progress.error.suggestedAction && (
                <div className="text-red-600 text-xs">
                  <strong>Suggestion:</strong> {progress.error.suggestedAction}
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-red-600">
                <span>Category: {progress.error.category}</span>
                <span>Retryable: {progress.error.retryable ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success Details */}
      {isComplete && showDetails && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm">
            <div className="space-y-1">
              <div className="text-green-800">
                {progress.postTitle ? (
                  <>Successfully deleted "{progress.postTitle}"</>
                ) : (
                  'Post successfully deleted'
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-green-600">
                {progress.duration && (
                  <span>Duration: {(progress.duration / 1000).toFixed(1)}s</span>
                )}
                {progress.cacheInvalidated !== undefined && (
                  <span>
                    Cache: {progress.cacheInvalidated ? 'Invalidated' : 'Not invalidated'}
                  </span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Additional Info */}
      {showDetails && !hasError && !isComplete && isLoading && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Info className="h-3 w-3" />
          <span>
            {progress.status === 'validating' && 'Checking post existence and permissions...'}
            {progress.status === 'deleting' && 'Removing post from database...'}
            {progress.status === 'cache-invalidating' && 'Updating cached data...'}
            {progress.status === 'retrying' && 'Attempting operation again...'}
          </span>
        </div>
      )}
    </div>
  );
}