'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { SystemHealthDashboard } from '@/components/admin/SystemHealthDashboard';

export default function SystemHealthPage() {
  return (
    <AdminLayout>
      <SystemHealthDashboard />
    </AdminLayout>
  );
}