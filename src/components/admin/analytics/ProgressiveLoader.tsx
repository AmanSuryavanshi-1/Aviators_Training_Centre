'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Database,
  TrendingUp
} from 'lucide-react';

interface LoadingStage {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // in milliseconds
  priority: 'high' | 'medium' | 'low';
}

interface ProgressiveLoaderProps {
  stages: LoadingStage[];
  onStageComplete: (stageId: string) => Promise<any>;
  onAllComplete: (results: Record<string, any>) => void;
  onError: (error: Error, stageId: string) => void;
  autoStart?: boolean;
  title?: string;
  description?: string;
}

interface StageStatus {
  id: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  startTime?: number;
  endTime?: number;
  result?: any;
  error?: Error;
  progress?: number;
}

export default function ProgressiveLoader({
  stages,
  onStageComplete,
  onAllComplete,
  onError,
  autoStart = false,
  title = 'Loading Analytics Data',
  description = 'Please wait while we fetch and process your analytics data'
}: ProgressiveLoaderProps) {
  const [stageStatuses, setStageStatuses] = useState<Record<string, StageStatus>>({});
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // Initialize stage statuses
  useEffect(() => {
    const initialStatuses: Record<string, StageStatus> = {};
    stages.forEach(stage => {
      initialStatuses[stage.id] = {
        id: stage.id,
        status: 'pending'
      };
    });
    setStageStatuses(initialStatuses);
  }, [stages]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isLoading && !isComplete) {
      startLoading();
    }
  }, [autoStart]);

  // Update overall progress and time estimation
  useEffect(() => {
    const completedStages = Object.values(stageStatuses).filter(s => s.status === 'completed').length;
    const totalStages = stages.length;
    const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;
    
    setOverallProgress(progress);

    // Estimate remaining time
    if (isLoading && completedStages > 0) {
      const elapsedTime = Date.now() - startTimeRef.current;
      const avgTimePerStage = elapsedTime / completedStages;
      const remainingStages = totalStages - completedStages;
      setEstimatedTimeRemaining(Math.round(avgTimePerStage * remainingStages / 1000));
    }
  }, [stageStatuses, stages.length, isLoading]);

  const updateStageStatus = useCallback((stageId: string, updates: Partial<StageStatus>) => {
    setStageStatuses(prev => ({
      ...prev,
      [stageId]: { ...prev[stageId], ...updates }
    }));
  }, []);

  const startLoading = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setIsComplete(false);
    setCurrentStageIndex(0);
    startTimeRef.current = Date.now();
    abortControllerRef.current = new AbortController();

    // Reset all stages to pending
    stages.forEach(stage => {
      updateStageStatus(stage.id, { status: 'pending', progress: 0 });
    });

    try {
      const results: Record<string, any> = {};

      // Process stages based on priority
      const prioritizedStages = [...stages].sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      // Process high priority stages first (in parallel)
      const highPriorityStages = prioritizedStages.filter(s => s.priority === 'high');
      const mediumPriorityStages = prioritizedStages.filter(s => s.priority === 'medium');
      const lowPriorityStages = prioritizedStages.filter(s => s.priority === 'low');

      // Execute high priority stages in parallel
      if (highPriorityStages.length > 0) {
        await Promise.all(
          highPriorityStages.map(stage => processStage(stage, results))
        );
      }

      // Execute medium priority stages in parallel
      if (mediumPriorityStages.length > 0) {
        await Promise.all(
          mediumPriorityStages.map(stage => processStage(stage, results))
        );
      }

      // Execute low priority stages sequentially to avoid overwhelming the system
      for (const stage of lowPriorityStages) {
        if (abortControllerRef.current?.signal.aborted) break;
        await processStage(stage, results);
      }

      if (!abortControllerRef.current?.signal.aborted) {
        setIsComplete(true);
        onAllComplete(results);
      }
    } catch (error) {
      console.error('Progressive loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, stages, onStageComplete, onAllComplete, onError, updateStageStatus]);

  const processStage = async (stage: LoadingStage, results: Record<string, any>) => {
    if (abortControllerRef.current?.signal.aborted) return;

    const stageIndex = stages.findIndex(s => s.id === stage.id);
    setCurrentStageIndex(stageIndex);

    updateStageStatus(stage.id, {
      status: 'loading',
      startTime: Date.now(),
      progress: 0
    });

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (abortControllerRef.current?.signal.aborted) {
          clearInterval(progressInterval);
          return;
        }

        updateStageStatus(stage.id, prev => ({
          ...prev,
          progress: Math.min((prev.progress || 0) + Math.random() * 20, 90)
        }));
      }, 200);

      const result = await onStageComplete(stage.id);
      clearInterval(progressInterval);

      if (!abortControllerRef.current?.signal.aborted) {
        updateStageStatus(stage.id, {
          status: 'completed',
          endTime: Date.now(),
          result,
          progress: 100
        });
        results[stage.id] = result;
      }
    } catch (error) {
      updateStageStatus(stage.id, {
        status: 'error',
        endTime: Date.now(),
        error: error as Error,
        progress: 0
      });
      onError(error as Error, stage.id);
    }
  };

  const stopLoading = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  const retryStage = useCallback(async (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    updateStageStatus(stageId, { status: 'pending', error: undefined });
    
    try {
      const results: Record<string, any> = {};
      await processStage(stage, results);
    } catch (error) {
      console.error(`Retry failed for stage ${stageId}:`, error);
    }
  }, [stages, updateStageStatus]);

  const getStageIcon = (status: StageStatus['status']) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStageVariant = (status: StageStatus['status']) => {
    switch (status) {
      case 'loading':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            {isLoading && (
              <Badge variant="outline" className="animate-pulse">
                Loading...
              </Badge>
            )}
            {isComplete && (
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          {isLoading && estimatedTimeRemaining > 0 && (
            <p className="text-xs text-muted-foreground">
              Estimated time remaining: {estimatedTimeRemaining}s
            </p>
          )}
        </div>

        {/* Stage List */}
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const status = stageStatuses[stage.id];
            const duration = status?.startTime && status?.endTime 
              ? status.endTime - status.startTime 
              : 0;

            return (
              <div key={stage.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  {getStageIcon(status?.status || 'pending')}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{stage.name}</h4>
                    <Badge variant={getStageVariant(status?.status || 'pending')} className="text-xs">
                      {status?.status || 'pending'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {stage.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {stage.description}
                  </p>
                  
                  {status?.status === 'loading' && (
                    <Progress value={status.progress || 0} className="h-1" />
                  )}
                  
                  {status?.status === 'completed' && duration > 0 && (
                    <p className="text-xs text-green-600">
                      Completed in {formatDuration(duration)}
                    </p>
                  )}
                  
                  {status?.status === 'error' && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        {status.error?.message || 'An error occurred'}
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2 h-6 text-xs"
                          onClick={() => retryStage(stage.id)}
                        >
                          Retry
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          {!isLoading && !isComplete && (
            <Button onClick={startLoading} className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Start Loading
            </Button>
          )}
          
          {isLoading && (
            <Button variant="outline" onClick={stopLoading}>
              Cancel
            </Button>
          )}
          
          {isComplete && (
            <Button variant="outline" onClick={startLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}