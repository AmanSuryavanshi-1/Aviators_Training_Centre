import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
import { RefreshCw } from 'lucide-react';
import { validateSession } from '@/lib/auth/adminAuth';

// Lazy load the authenticated analytics dashboard for better performance
const AuthenticatedAnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AuthenticatedAnalyticsDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-aviation-primary" />
          <span className="text-lg text-aviation-primary">Loading analytics dashboard...</span>
        </div>
      </div>
    )
  }
);

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Aviators Training Centre',
  description: 'Comprehensive analytics dashboard with genuine data from Google Analytics and Search Console for Aviators Training Centre',
  robots: 'noindex, nofollow', // Keep analytics private
};

export default async function AnalyticsPage() {
  // For now, allow access to analytics dashboard
  // Authentication will be handled by the AuthenticatedAnalyticsDashboard component
  // TODO: Implement proper server-side authentication check

  return (
    <AdminLayout 
      title="Analytics Dashboard" 
      description="Comprehensive analytics with genuine data from Google Analytics and Search Console"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-aviation-primary" />
            <span className="text-lg text-aviation-primary">Loading analytics dashboard...</span>
          </div>
        </div>
      }>
        <AuthenticatedAnalyticsDashboard />
      </Suspense>
    </AdminLayout>
  );
}