'use client';

import { usePathname } from 'next/navigation';
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import AnalyticsScript from "@/components/analytics/AnalyticsScript";

export default function ConditionalAnalytics({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't load analytics on contact page to prevent Firebase conflicts
  const isContactPage = pathname === '/contact';
  
  if (isContactPage) {
    return <>{children}</>;
  }
  
  return (
    <AnalyticsProvider>
      {children}
      <AnalyticsScript />
    </AnalyticsProvider>
  );
}