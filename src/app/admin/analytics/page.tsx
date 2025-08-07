import { Metadata } from 'next';
import AdvancedAnalyticsDashboard from '@/components/admin/AdvancedAnalyticsDashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Admin',
  description: 'Advanced analytics and insights for Aviators Training Centre',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <AdvancedAnalyticsDashboard />
    </div>
  );
}