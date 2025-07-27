'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';
import { ServiceNotifications } from '@/components/blog/ServiceNotifications';
import { 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';

interface SystemStatus {
  overall: boolean;
  services: {
    sanity: { healthy: boolean; error?: string };
    api: { healthy: boolean };
    fallbackMode: boolean;
  };
}

export default function MaintenancePage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [showDetailedDashboard, setShowDetailedDashboard] = useState(false);

  const checkSystemHealth = async () => {
    setChecking(true);
    try {
      const response = await fetch('/api/system/health');
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error('Failed to check system health:', error);
    } finally {
      setChecking(false);
    }
  };

  const attemptRecovery = async () => {
    try {
      const response = await fetch('/api/system/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'auto_recovery' }),
      });
      
      const result = await response.json();
      
      if (result.successful) {
        alert('System recovery successful! Redirecting to admin dashboard...');
        window.location.href = '/admin';
      } else {
        alert(`Recovery attempted but not fully successful. Actions taken: ${result.actions.join(', ')}`);
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      alert('Recovery failed. Please contact system administrator.');
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  useEffect(() => {
    if (!autoCheck) return;

    const interval = setInterval(checkSystemHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [autoCheck]);

  // If system is healthy, redirect to admin
  useEffect(() => {
    if (systemStatus?.overall && !systemStatus.services.fallbackMode) {
      setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
    }
  }, [systemStatus]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <ServiceNotifications />
      
      {showDetailedDashboard ? (
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <Button
              onClick={() => setShowDetailedDashboard(false)}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Simple View
            </Button>
          </div>
          <SystemHealthDashboard />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            System Maintenance
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            The admin system is currently experiencing issues and is in maintenance mode.
          </p>
        </div>

        {/* System Status */}
        {systemStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {systemStatus.overall ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                )}
                System Status
              </CardTitle>
              <CardDescription>
                Current status of system components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sanity CMS Status */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    systemStatus.services.sanity.healthy ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">Sanity CMS</span>
                </div>
                <span className={`text-sm ${
                  systemStatus.services.sanity.healthy ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.services.sanity.healthy ? 'Healthy' : 'Error'}
                </span>
              </div>

              {/* API Status */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    systemStatus.services.api.healthy ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">API Endpoints</span>
                </div>
                <span className={`text-sm ${
                  systemStatus.services.api.healthy ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.services.api.healthy ? 'Healthy' : 'Error'}
                </span>
              </div>

              {/* Fallback Mode */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    !systemStatus.services.fallbackMode ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <span className="font-medium">Fallback Mode</span>
                </div>
                <span className={`text-sm ${
                  !systemStatus.services.fallbackMode ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {systemStatus.services.fallbackMode ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Error Details */}
              {systemStatus.services.sanity.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Sanity CMS Error</AlertTitle>
                  <AlertDescription className="text-sm">
                    {systemStatus.services.sanity.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recovery Status */}
        {systemStatus?.overall && !systemStatus.services.fallbackMode && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>System Recovered</AlertTitle>
            <AlertDescription>
              System is now healthy. Redirecting to admin dashboard...
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery Actions</CardTitle>
            <CardDescription>
              Try these actions to resolve system issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={checkSystemHealth}
              disabled={checking}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
              Check System Status
            </Button>

            <Button
              onClick={attemptRecovery}
              className="w-full"
              variant="default"
            >
              <Settings className="h-4 w-4 mr-2" />
              Attempt Auto Recovery
            </Button>

            <Button
              onClick={() => setAutoCheck(!autoCheck)}
              className="w-full"
              variant="outline"
            >
              {autoCheck ? 'Disable' : 'Enable'} Auto Check
            </Button>

            <Button
              onClick={() => setShowDetailedDashboard(true)}
              className="w-full"
              variant="outline"
            >
              <Activity className="h-4 w-4 mr-2" />
              View Detailed System Dashboard
            </Button>

            <div className="pt-4 border-t">
              <Button
                onClick={() => window.location.href = '/admin'}
                className="w-full"
                variant="secondary"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Admin Dashboard Anyway
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>What's Happening?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <p>
              The admin system has detected critical issues and has entered maintenance mode to prevent data corruption or system instability.
            </p>
            <p>
              Common causes include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Sanity CMS connection issues</li>
              <li>API endpoint failures</li>
              <li>High error rates triggering circuit breakers</li>
              <li>Network connectivity problems</li>
            </ul>
            <p>
              The system will automatically attempt recovery. If issues persist, please contact the system administrator.
            </p>
          </CardContent>
        </Card>
          </div>
        </div>
      )}
    </div>
  );
}