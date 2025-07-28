'use client';

import { AutomationErrorLog } from "@/components/features/admin/AutomationErrorLog";
import { AdminErrorBoundary } from "@/components/features/admin/AdminErrorBoundary";

export default function N8NErrorsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">N8N Automation Error Logs</h1>
      <AdminErrorBoundary>
        <AutomationErrorLog />
      </AdminErrorBoundary>
    </div>
  );
}