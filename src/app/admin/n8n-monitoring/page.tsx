import { Metadata } from 'next';
import N8nMonitoringDashboard from '@/components/admin/N8nMonitoringDashboard';

export const metadata: Metadata = {
  title: 'n8n Workflow Monitoring | ATC Admin',
  description: 'Monitor and manage n8n workflows for lead import and WhatsApp automation',
};

export default function N8nMonitoringPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">n8n Workflow Monitoring</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your lead import and WhatsApp automation workflows in real-time
        </p>
      </div>
      
      <N8nMonitoringDashboard />
    </div>
  );
}