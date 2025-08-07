'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStudioAdminAuth } from '@/lib/auth/studioAdminAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  LogIn,
  ArrowLeft 
} from 'lucide-react';
import EnhancedAnalyticsDashboard from './EnhancedAnalyticsDashboard';
// AnalyticsErrorBoundary removed due to syntax issues

interface AuthenticatedAnalyticsDashboardProps {
  fallbackUrl?: string;
}

export default function AuthenticatedAnalyticsDashboard({ 
  fallbackUrl = '/studio/admin/login' 
}: AuthenticatedAnalyticsDashboardProps) {
  const { user, isAuthenticated, isLoading, checkPermission } = useStudioAdminAuth();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check authentication status
    if (!isLoading && !isAuthenticated) {
      setAuthError('Authentication required to access analytics dashboard');
    } else if (isAuthenticated && !checkPermission('analytics') && user?.role !== 'admin') {
      setAuthError('Insufficient permissions to access analytics dashboard');
    } else {
      setAuthError(null);
    }
  }, [isAuthenticated, isLoading, user, checkPermission]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setAuthError(null);
    // Force re-check authentication
    window.location.reload();
  };

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`${fallbackUrl}?returnUrl=${returnUrl}`);
  };

  const handleGoBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-aviation-primary mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-aviation-primary">
              Authenticating...
            </h3>
            <p className="text-muted-foreground">
              Verifying your access to the analytics dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Authentication error state
  if (authError) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Shield className="h-5 w-5" />
              Access Restricted
            </CardTitle>
            <CardDescription className="text-red-600">
              {authError}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {!isAuthenticated 
                  ? "You need to be logged in to access the analytics dashboard."
                  : "Your account doesn't have the required permissions to view analytics data."
                }
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              {!isAuthenticated ? (
                <Button 
                  onClick={handleLogin}
                  className="bg-aviation-primary hover:bg-aviation-primary/90"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              ) : (
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="border-aviation-primary/20 hover:bg-aviation-primary hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Access
                </Button>
              )}
              
              <Button 
                onClick={handleGoBack}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            {user && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-900 mb-2">Current Session</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>User:</strong> {user.name} ({user.email})</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Permissions:</strong> {user.permissions.join(', ') || 'None'}</p>
                </div>
              </div>
            )}

            {retryCount > 2 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  If you continue to experience issues, please contact your administrator 
                  or try clearing your browser cache and cookies.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - render the analytics dashboard
  return (
    <div className="space-y-6">
      {/* User context header */}
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Shield className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800">
              Authenticated as {user?.name}
            </p>
            <p className="text-xs text-green-600">
              Role: {user?.role} • Analytics access granted
            </p>
          </div>
        </div>
        
        <div className="text-xs text-green-600">
          Session active
        </div>
      </div>

      {/* Analytics Dashboard */}
      <EnhancedAnalyticsDashboard />
    </div>
  );
}