/**
 * Admin Members Page
 * Page for managing Sanity project members
 */

import { Metadata } from 'next';
import MemberManagementDashboard from '@/components/admin/MemberManagementDashboard';

export const metadata: Metadata = {
  title: 'Member Management | Admin Dashboard',
  description: 'Manage Sanity project members and monitor activity',
};

export default function AdminMembersPage() {
  return (
    <div className="container mx-auto py-6">
      <MemberManagementDashboard />
    </div>
  );
}