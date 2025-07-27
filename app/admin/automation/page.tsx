import { Metadata } from 'next';
import AutomationMonitoringDashboard from '@/components/admin/AutomationMonitoringDashboard';

export const metadata: Metadata = {
  title: 'Automation Monitoring | Admin Dashboard',
  description: 'Monitor N8N automation performance, errors, and audit logs',
};

export default function AutomationMonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <AutomationMonitoringDashboard />
    </div>
  );
}