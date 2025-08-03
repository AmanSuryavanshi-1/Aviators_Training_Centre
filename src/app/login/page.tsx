/**
 * Login Page - Redirects to Sanity Studio
 * Unified authentication through Sanity Studio only
 */

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/admin';

  useEffect(() => {
    // Store the intended destination for after authentication
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('auth-redirect', redirectTo);
    }
    
    // Redirect directly to Sanity Studio for authentication
    router.push('/studio');
  }, [router, redirectTo]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-800">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center mb-8">
          <img 
            src="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" 
            alt="ATC Logo" 
            className="w-16 h-16 mr-4"
          />
          <div className="text-left">
            <h1 className="text-2xl font-bold text-[hsl(var(--aviation-primary))] font-heading">
              Aviators Training Centre
            </h1>
            <p className="text-sm text-[hsl(var(--aviation-secondary))] font-medium">
              Content Management Studio
            </p>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[hsl(var(--aviation-border))]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--aviation-primary))]" />
          <p className="text-[hsl(var(--aviation-text))] font-medium">Redirecting to Studio for authentication...</p>
          <p className="text-sm text-[hsl(var(--aviation-text-muted))] mt-2">Please wait while we prepare your workspace</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-sky-50 to-blue-50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-800">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/AVIATORS_TRAINING_CENTRE_LOGO_LightMode.png" 
              alt="ATC Logo" 
              className="w-16 h-16 mr-4"
            />
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[hsl(var(--aviation-primary))] font-heading">
                Aviators Training Centre
              </h1>
              <p className="text-sm text-[hsl(var(--aviation-secondary))] font-medium">
                Content Management Studio
              </p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-[hsl(var(--aviation-border))]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[hsl(var(--aviation-primary))]" />
            <p className="text-[hsl(var(--aviation-text))] font-medium">Loading workspace...</p>
          </div>
        </div>
      </div>
    }>
      <LoginRedirect />
    </Suspense>
  );
}