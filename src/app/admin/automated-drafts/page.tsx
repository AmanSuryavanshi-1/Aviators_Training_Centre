'use client';

import { AdminLayout } from "@/components/features/admin/AdminLayout";
import { AutomatedDraftReview } from "@/components/features/admin/AutomatedDraftReview";

export default function AutomatedDraftsPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Automated Draft Review
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Review and manage AI-generated blog drafts from N8N automation
            </p>
          </div>
        </div>
      </div>

      <AutomatedDraftReview />
    </AdminLayout>
  );
}