'use client';

import { SimpleAutomatedDraftReview } from "@/components/features/admin/SimpleAutomatedDraftReview";
import { AdminErrorBoundary } from "@/components/features/admin/AdminErrorBoundary";

export default function N8NReviewPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">N8N Automation Review Queue</h1>
      <AdminErrorBoundary>
        <SimpleAutomatedDraftReview />
      </AdminErrorBoundary>
    </div>
  );
}
