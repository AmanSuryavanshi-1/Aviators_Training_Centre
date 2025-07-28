"use client";

import React from 'react';
import { Loader2, BookOpen, Database, Wifi, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  variant?: 'spinner' | 'skeleton' | 'progress' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProgress?: boolean;
  progress?: number;
  steps?: LoadingStep[];
  currentStep?: number;
}

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  icon?: React.ComponentType<{ className?: string }>;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  submessage,
  variant = 'spinner',
  size = 'md',
  className = '',
  showProgress = false,
  progress = 0,
  steps,
  currentStep
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          spinner: 'h-4 w-4',
          text: 'text-sm',
          container: 'p-4'
        };
      case 'lg':
        return {
          spinner: 'h-8 w-8',
          text: 'text-lg',
          container: 'p-8'
        };
      default:
        return {
          spinner: 'h-6 w-6',
          text: 'text-base',
          container: 'p-6'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'progress' && steps) {
    return (
      <Card className={className}>
        <CardContent className={sizeClasses.container}>
          <div className="space-y-6">
            <div className="text-center">
              <h3 className={`font-semibold ${sizeClasses.text}`}>
                {message}
              </h3>
              {submessage && (
                <p className="text-muted-foreground text-sm mt-1">
                  {submessage}
                </p>
              )}
            </div>

            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="space-y-3">
              {steps.map((step, index) => {
                const StepIcon = step.icon || Database;
                const isActive = currentStep === index;
                const isCompleted = step.status === 'completed';
                const isError = step.status === 'error';
                const isLoading = step.status === 'loading' || isActive;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/10 border border-primary/20' : 
                      isCompleted ? 'bg-green-50 border border-green-200' :
                      isError ? 'bg-red-50 border border-red-200' :
                      'bg-muted/50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : isError ? (
                        <StepIcon className="h-4 w-4 text-red-600" />
                      ) : (
                        <StepIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-primary' :
                        isCompleted ? 'text-green-700' :
                        isError ? 'text-red-700' :
                        'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {isActive && (
                        <Badge variant="outline" className="text-xs">
                          In Progress
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          Done
                        </Badge>
                      )}
                      {isError && (
                        <Badge variant="destructive" className="text-xs">
                          Error
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center ${sizeClasses.container} ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${sizeClasses.spinner} bg-primary rounded-full animate-pulse`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
          <div className="text-center">
            <p className={`font-medium ${sizeClasses.text}`}>
              {message}
            </p>
            {submessage && (
              <p className="text-muted-foreground text-sm mt-1">
                {submessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${sizeClasses.container} ${className}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className={`${sizeClasses.spinner} bg-primary rounded-full animate-pulse`} />
          <div className="text-center">
            <p className={`font-medium ${sizeClasses.text}`}>
              {message}
            </p>
            {submessage && (
              <p className="text-muted-foreground text-sm mt-1">
                {submessage}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default spinner variant
  return (
    <div className={`flex items-center justify-center ${sizeClasses.container} ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className={`${sizeClasses.spinner} animate-spin text-primary`} />
        <div className="text-center">
          <p className={`font-medium ${sizeClasses.text}`}>
            {message}
          </p>
          {submessage && (
            <p className="text-muted-foreground text-sm mt-1">
              {submessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Specialized loading components for common use cases
export const BlogLoadingState: React.FC<{ message?: string }> = ({ 
  message = 'Loading blog posts...' 
}) => (
  <LoadingState
    message={message}
    submessage="Fetching latest content from Sanity CMS"
    variant="skeleton"
    className="min-h-[400px]"
  />
);

export const ConnectionLoadingState: React.FC<{ message?: string }> = ({ 
  message = 'Connecting to Sanity CMS...' 
}) => {
  const steps: LoadingStep[] = [
    {
      id: 'connection',
      label: 'Establishing connection',
      status: 'loading',
      icon: Wifi
    },
    {
      id: 'auth',
      label: 'Authenticating',
      status: 'pending',
      icon: CheckCircle
    },
    {
      id: 'data',
      label: 'Loading data',
      status: 'pending',
      icon: Database
    }
  ];

  return (
    <LoadingState
      message={message}
      variant="progress"
      steps={steps}
      currentStep={0}
      className="max-w-md mx-auto"
    />
  );
};

export default LoadingState;