'use client';

import { AdminLayout } from '@/components/features/admin/AdminLayout';
import ProductionAdminDashboard from '@/components/features/admin/ProductionAdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated and not loading, redirect to studio for auth
    if (!isLoading && !isAuthenticated) {
      router.push('/studio?redirect=/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-800">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" 
              alt="ATC Logo" 
              className="w-16 h-16 mr-4"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[hsl(var(--aviation-primary))] font-heading">
                Aviators Training Centre
              </h1>
              <p className="text-sm text-[hsl(var(--aviation-secondary))] font-medium">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[hsl(var(--aviation-border))]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--aviation-primary))]" />
            <p className="text-[hsl(var(--aviation-text))] font-medium">Verifying authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized state if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-800">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" 
              alt="ATC Logo" 
              className="w-16 h-16 mr-4"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[hsl(var(--aviation-primary))] font-heading">
                Aviators Training Centre
              </h1>
              <p className="text-sm text-[hsl(var(--aviation-secondary))] font-medium">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[hsl(var(--aviation-border))]">
            <p className="text-[hsl(var(--aviation-text))] font-medium mb-4">Authentication required</p>
            <p className="text-sm text-[hsl(var(--aviation-text-muted))]">Redirecting to authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render authenticated admin dashboard
  return (
    <AdminLayout className="admin-content">
      <ProductionAdminDashboard />
    </AdminLayout>
  );
}


