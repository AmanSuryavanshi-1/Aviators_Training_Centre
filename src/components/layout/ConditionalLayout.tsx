'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppChat from "@/components/shared/WhatsAppChat";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Check if current route is studio
  const isStudioRoute = pathname?.startsWith('/studio');
  
  if (isStudioRoute) {
    // Studio layout: Full height, no header, no footer, no WhatsApp chat
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}