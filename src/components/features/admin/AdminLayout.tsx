'use client';

import { AdminSidebarEnhanced as AdminSidebar } from './AdminSidebarEnhanced';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <AdminErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-sky-50/20 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-800">
        <div className="flex h-screen overflow-hidden">
          <AdminSidebar />
          <main className={cn(
            "flex-1 overflow-y-auto",
            "transition-all duration-300 ease-in-out",
            className
          )}>
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500" />
            
            {/* Main content area - removed container constraint */}
            <div className="min-h-full p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminErrorBoundary>
  );
}
