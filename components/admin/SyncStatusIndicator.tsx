'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useRealTimeSync } from '@/hooks/use-real-time-sync';
import { formatDistanceToNow } from 'date-fns';

export function SyncStatusIndicator() {
  const { 
    syncStatus, 
    recentEvents, 
    forceSyncCheck, 
    isConnected, 
    isPending, 
    hasErrors, 
    lastSync 
  } = useRealTimeSync();

  const getStatusIcon = () => {
    if (isPending) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (!isConnected) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (hasErrors) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (isPending) return 'default';
    if (!isConnected) return 'destructive';
    if (hasErrors) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (isPending) return 'Syncing...';
    if (!isConnected) return 'Disconnected';
    if (hasErrors) return 'Sync Issues';
    return 'Connected';
  };

  const getTooltipContent = () => {
    const content = [];
    
    if (lastSync) {
      content.push(`Last sync: ${formatDistanceToNow(new Date(lastSync), { addSuffix: true })}`);
    }
    
    if (syncStatus.pendingOperations > 0) {
      content.push(`${syncStatus.pendingOperations} operations pending`);
    }
    
    if (hasErrors) {
      content.push('Recent errors:');
      syncStatus.errors.slice(-3).forEach(error => {
        content.push(`• ${error}`);
      });
    }
    
    if (recentEvents.length > 0) {
      content.push('Recent activity:');
      recentEvents.slice(0, 3).forEach(event => {
        const timeAgo = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
        content.push(`• ${event.type} ${timeAgo}`);
      });
    }

    return content.length > 0 ? content.join('\n') : 'No recent activity';
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={getStatusColor()} 
              className="flex items-center gap-1 cursor-help"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <pre className="text-xs whitespace-pre-wrap">{getTooltipContent()}</pre>
          </TooltipContent>
        </Tooltip>

        <Button
          variant="ghost"
          size="sm"
          onClick={forceSyncCheck}
          disabled={isPending}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </TooltipProvider>
  );
}

export function DetailedSyncStatus() {
  const { syncStatus, recentEvents } = useRealTimeSync();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Connection Status</h4>
          <div className="flex items-center gap-2">
            {syncStatus.isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {syncStatus.isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Last Sync</h4>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {syncStatus.lastSync 
                ? formatDistanceToNow(new Date(syncStatus.lastSync), { addSuffix: true })
                : 'Never'
              }
            </span>
          </div>
        </div>
      </div>

      {syncStatus.pendingOperations > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Pending Operations</h4>
          <Badge variant="secondary">
            {syncStatus.pendingOperations} operations
          </Badge>
        </div>
      )}

      {syncStatus.errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-600">Recent Errors</h4>
          <div className="space-y-1">
            {syncStatus.errors.slice(-3).map((error, index) => (
              <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {recentEvents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Activity</h4>
          <div className="space-y-1">
            {recentEvents.slice(0, 5).map((event, index) => (
              <div key={index} className="text-xs bg-muted p-2 rounded flex justify-between">
                <span>{event.type} - {event.slug || event.postId}</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}