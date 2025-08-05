import { Metadata } from 'next';
import AdvancedAnalyticsDashboard from '@/components/admin/AdvancedAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Admin',
  description: 'Advanced analytics and insights for Aviators Training Centre',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for your training centre
        </p>
      </div>
      <AdvancedAnalyticsDashboard />
    </div>
  );
}