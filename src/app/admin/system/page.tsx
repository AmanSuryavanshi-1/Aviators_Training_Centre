'use client';

import { AdminLayout } from "@/components/features/admin/AdminLayout";
import { SystemHealthDashboard } from "@/components/features/admin/SystemHealthDashboard";

export default function SystemHealthPage() {
  return (
    <AdminLayout>
      <SystemHealthDashboard />
    </AdminLayout>
  );
}
