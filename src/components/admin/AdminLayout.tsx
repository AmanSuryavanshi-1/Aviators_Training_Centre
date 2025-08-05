'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  LogOut, 
  Shield, 
  User, 
  Clock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { clientSessionUtils, AdminSession } from '@/lib/auth/adminAuth';
import AdminErrorBoundary from './AdminErrorBoundary';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface LayoutState {
  isLoading: boolean;
  session: AdminSession | null;
  error: string | null;
  isLoggingOut: boolean;
}

export default function AdminLayout({ 
  children, 
  title = 'Admin Dashboard',
  description = 'Aviators Training Centre Administration'
}: AdminLayoutProps) {
  const router = useRouter();
  const [state, setState] = useState<LayoutState>({
    isLoading: true,
    session: null,
    error: null,
    isLoggingOut: false
  });

  // Check session on mount and set up refresh interval
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const sessionCheck = await clientSessionUtils.checkSession();
        
        if (!sessionCheck.valid) {
          // Session invalid, redirect to login
          router.replace('/studio/admin/login');
          return;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          session: sessionCheck.session || null,
          error: null
        }));

        // Set up session refresh if needed (check every 5 minutes)
        refreshInterval = setInterval(async () => {
          const refreshCheck = await clientSessionUtils.checkSession();
          if (!refreshCheck.valid) {
            router.replace('/studio/admin/login');
          } else {
            setState(prev => ({
              ...prev,
              session: refreshCheck.session || null
            }));
          }
        }, 5 * 60 * 1000); // 5 minutes

      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to verify session. Please try refreshing the page.'
        }));
      }
    };

    checkSession();

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [router]);

  const handleLogout = async () => {
    setState(prev => ({ ...prev, isLoggingOut: true }));

    try {
      const result = await clientSessionUtils.logout();
      
      if (result.success) {
        // Redirect to login page
        router.replace('/studio/admin/login');
      } else {
        setState(prev => ({
          ...prev,
          isLoggingOut: false,
          error: 'Logout failed. Please try again.'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoggingOut: false,
        error: 'Network error during logout. Please try again.'
      }));
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatTimeRemaining = (expiresAt: number): string => {
    const now = Date.now();
    const timeLeft = expiresAt - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--aviation-primary))]" />
          <p className="text-sm text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Session Error</h2>
                <p className="text-sm text-muted-foreground">{state.error}</p>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  onClick={() => router.replace('/studio/admin/login')} 
                  size="sm"
                  className="bg-[hsl(var(--aviation-primary))] hover:bg-[hsl(var(--aviation-primary))]/90"
                >
                  Login Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 flex flex-col admin-layout-container">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[hsl(var(--aviation-primary))] rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">{description}</p>
                </div>
              </div>
            </div>

            {/* Right side - User info and logout */}
            <div className="flex items-center space-x-4">
              {/* Session info */}
              {state.session && (
                <div className="hidden md:flex items-center space-x-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{state.session.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimeRemaining(state.session.expiresAt)}</span>
                  </div>
                </div>
              )}

              {/* Logout button */}
              <Button
                onClick={handleLogout}
                disabled={state.isLoggingOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {state.isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {state.isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Session warning for mobile */}
      {state.session && (
        <div className="md:hidden bg-gray-50 border-b border-gray-200 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3" />
              <span>{state.session.username}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Session: {formatTimeRemaining(state.session.expiresAt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Session expiry warning */}
      {state.session && state.session.expiresAt - Date.now() < 60 * 60 * 1000 && (
        <Alert className="mx-4 mt-4 border-yellow-200 bg-yellow-50 flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your session will expire in {formatTimeRemaining(state.session.expiresAt)}. 
            Please save your work and refresh the page to extend your session.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content - This is now scrollable */}
      <main className="flex-1 overflow-y-auto admin-main-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 Aviators Training Centre - Admin Dashboard
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secure Admin Access</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}