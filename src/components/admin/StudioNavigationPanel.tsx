/**
 * Studio Navigation Panel Component
 * Provides enhanced navigation controls and session management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  ArrowRight, 
  RefreshCw, 
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { 
  StudioNavigationManager, 
  NavigationOptions,
  NavigationResult 
} from '@/lib/navigation/studioNavigationManager';

interface NavigationStatus {
  isFromAdmin: boolean;
  returnUrl?: string;
  sessionAge?: number;
}

export default function StudioNavigationPanel() {
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatus | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastNavigation, setLastNavigation] = useState<NavigationResult | null>(null);

  useEffect(() => {
    // Get navigation context
    const context = StudioNavigationManager.getNavigationContext();
    setNavigationStatus(context);
  }, []);

  const handleStudioNavigation = async (options: Partial<NavigationOptions> = {}) => {
    setIsNavigating(true);
    
    try {
      const result = StudioNavigationManager.navigateToStudio({
        returnUrl: '/admin',
        preserveSession: true,
        openInNewTab: false,
        ...options,
      });
      
      setLastNavigation(result);
      
      if (!result.success) {
        console.error('Navigation failed:', result.error);
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setLastNavigation({
        success: false,
        url: '',
        method: 'redirect',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsNavigating(false);
    }
  };

  const handleAdminNavigation = () => {
    const result = StudioNavigationManager.navigateToAdmin();
    setLastNavigation(result);
  };

  const formatSessionAge = (age: number): string => {
    const minutes = Math.floor(age / (1000 * 60));
    const seconds = Math.floor((age % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Navigation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Studio Navigation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {navigationStatus && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {navigationStatus.isFromAdmin ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <span className="font-medium">
                  {navigationStatus.isFromAdmin 
                    ? 'Navigation session active' 
                    : 'No active navigation session'}
                </span>
              </div>

              {navigationStatus.isFromAdmin && (
                <div className="bg-green-50 p-3 rounded-lg space-y-2">
                  {navigationStatus.returnUrl && (
                    <div className="text-sm">
                      <span className="font-medium">Return URL:</span> {navigationStatus.returnUrl}
                    </div>
                  )}
                  {navigationStatus.sessionAge && (
                    <div className="text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">Session Age:</span> {formatSessionAge(navigationStatus.sessionAge)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Last Navigation Result */}
          {lastNavigation && (
            <Alert variant={lastNavigation.success ? 'default' : 'destructive'}>
              {lastNavigation.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <div>
                    <strong>Last Navigation:</strong> {lastNavigation.success ? 'Success' : 'Failed'}
                  </div>
                  <div className="text-sm">
                    <strong>Method:</strong> {lastNavigation.method}
                  </div>
                  {lastNavigation.url && (
                    <div className="text-sm">
                      <strong>URL:</strong> {lastNavigation.url}
                    </div>
                  )}
                  {lastNavigation.error && (
                    <div className="text-sm text-red-600">
                      <strong>Error:</strong> {lastNavigation.error}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Studio Navigation Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Navigate to Studio */}
            <Button
              onClick={() => handleStudioNavigation()}
              disabled={isNavigating}
              className="flex items-center gap-2"
            >
              {isNavigating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Open Studio (Same Tab)
            </Button>

            {/* Navigate to Studio in New Tab */}
            <Button
              variant="outline"
              onClick={() => handleStudioNavigation({ openInNewTab: true })}
              disabled={isNavigating}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Studio (New Tab)
            </Button>

            {/* Navigate to Specific Studio Path */}
            <Button
              variant="outline"
              onClick={() => handleStudioNavigation({ studioPath: '/desk/post' })}
              disabled={isNavigating}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Open Posts
            </Button>

            {/* Return to Admin */}
            {navigationStatus?.isFromAdmin && (
              <Button
                variant="secondary"
                onClick={handleAdminNavigation}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Return to Admin
              </Button>
            )}
          </div>

          {/* Navigation Options */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Quick Navigation</h4>
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudioNavigation({ studioPath: '/desk/post' })}
              >
                Posts
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudioNavigation({ studioPath: '/desk/category' })}
              >
                Categories
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudioNavigation({ studioPath: '/desk/tag' })}
              >
                Tags
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudioNavigation({ studioPath: '/desk/author' })}
              >
                Authors
              </Badge>
            </div>
          </div>

          {/* Debug Information */}
          <div className="pt-4 border-t">
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
              <div className="text-xs bg-gray-50 p-3 rounded font-mono">
                <div><strong>Studio URL:</strong> {StudioNavigationManager.generateStudioUrl()}</div>
                <div><strong>Admin URL:</strong> {StudioNavigationManager.generateAdminUrl()}</div>
                <div><strong>Is From Admin:</strong> {navigationStatus?.isFromAdmin ? 'Yes' : 'No'}</div>
                {navigationStatus?.sessionAge && (
                  <div><strong>Session Age:</strong> {navigationStatus.sessionAge}ms</div>
                )}
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}