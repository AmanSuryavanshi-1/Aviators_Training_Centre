'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppChat from "@/components/shared/WhatsAppChat";
import ScrollIndicator from "@/components/shared/ScrollIndicator";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route is studio
  const isStudioRoute = pathname?.startsWith('/studio');
  
  if (isStudioRoute) {
    // Studio layout: Full height, no header, no footer, no WhatsApp chat
    // Allow scrolling for admin routes but keep overflow hidden for Sanity studio
    const isAdminRoute = pathname?.includes('/admin');
    
    if (isAdminRoute) {
      return (
        <div className="min-h-screen overflow-y-auto bg-background text-foreground">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      );
    }
    
    return (
      <div className="h-screen overflow-hidden bg-background text-foreground">
        <main className="h-full">
          {children}
        </main>
      </div>
    );
  }
  
  // Regular layout: Header, Footer, and WhatsApp chat
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-visible">
      <Header />
      {/* Reserve space for fixed header: header heights are h-14 on base, h-16 on sm+ */}
      <main className="flex-grow pt-14 sm:pt-16">
        {children}
      </main>
      <Footer />
      <ScrollIndicator />
      <WhatsAppChat />
    </div>
  );
}