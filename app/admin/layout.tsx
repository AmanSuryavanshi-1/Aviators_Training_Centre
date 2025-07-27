import { Metadata } from 'next';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Aviators Training Centre',
  description: 'Manage your blog content and website settings',
  robots: 'noindex, nofollow', // Prevent search engines from indexing admin pages
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </>
  );
}