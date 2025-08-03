/**
 * Admin Return Button Component
 * Provides a way to return to admin dashboard from Sanity Studio
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { 
  StudioNavigationManager,
  getNavigationContext 
} from '@/lib/navigation/studioNavigationManager';

interface AdminReturnButtonProps {
  className?: string;
  showOnlyWhenFromAdmin?: boolean;
}

export default function AdminReturnButton({ 
  className = '',
  showOnlyWhenFromAdmin = true 
}: AdminReturnButtonProps) {
  const [navigationContext, setNavigationContext] = useState<{
    isFromAdmin: boolean;
    returnUrl?: string;
  }>({ isFromAdmin: false });

  useEffect(() => {
    // Get navigation context
    const context = getNavigationContext();
    setNavigationContext(context);
  }, []);

  const handleReturnToAdmin = () => {
    const result = StudioNavigationManager.navigateToAdmin();
    
    if (!result.success) {
      console.error('Failed to return to admin:', result.error);
      // Fallback navigation
      window.location.href = '/admin';
    }
  };

  // Don't show button if not from admin and showOnlyWhenFromAdmin is true
  if (showOnlyWhenFromAdmin && !navigationContext.isFromAdmin) {
    return null;
  }

  return (
    <button
      onClick={handleReturnToAdmin}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-[hsl(var(--aviation-primary))] hover:bg-[hsl(var(--aviation-secondary))] text-white 
        rounded-lg transition-colors duration-200
        text-sm font-medium shadow-sm border border-[hsl(var(--aviation-primary-dark))]
        ${className}
      `}
      title={navigationContext.returnUrl ? `Return to ${navigationContext.returnUrl}` : 'Return to Admin Dashboard'}
    >
      <ArrowLeft className="w-4 h-4" />
      {navigationContext.isFromAdmin ? 'Return to Admin' : 'Go to Admin'}
    </button>
  );
}

/**
 * Floating Admin Return Button
 * Positioned as a floating action button
 */
export function FloatingAdminReturnButton() {
  const [navigationContext, setNavigationContext] = useState<{
    isFromAdmin: boolean;
    returnUrl?: string;
  }>({ isFromAdmin: false });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Get navigation context
    const context = getNavigationContext();
    setNavigationContext(context);
    
    // Show button after a delay if from admin
    if (context.isFromAdmin) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReturnToAdmin = () => {
    const result = StudioNavigationManager.navigateToAdmin();
    
    if (!result.success) {
      console.error('Failed to return to admin:', result.error);
      // Fallback navigation
      window.location.href = '/admin';
    }
  };

  if (!navigationContext.isFromAdmin || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleReturnToAdmin}
        className="
          flex items-center gap-2 px-4 py-3
          bg-[hsl(var(--aviation-primary))] hover:bg-[hsl(var(--aviation-secondary))] text-white
          rounded-full shadow-lg hover:shadow-xl
          transition-all duration-200 transform hover:scale-105
          text-sm font-medium border border-[hsl(var(--aviation-primary-dark))]
        "
        title={navigationContext.returnUrl ? `Return to ${navigationContext.returnUrl}` : 'Return to Admin Dashboard'}
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Return to Admin</span>
      </button>
    </div>
  );
}

/**
 * Studio Header Return Button
 * Integrated into studio header/toolbar
 */
export function StudioHeaderReturnButton() {
  const [navigationContext, setNavigationContext] = useState<{
    isFromAdmin: boolean;
    returnUrl?: string;
  }>({ isFromAdmin: false });

  useEffect(() => {
    // Get navigation context
    const context = getNavigationContext();
    setNavigationContext(context);
  }, []);

  const handleReturnToAdmin = () => {
    const result = StudioNavigationManager.navigateToAdmin();
    
    if (!result.success) {
      console.error('Failed to return to admin:', result.error);
      // Fallback navigation
      window.location.href = '/admin';
    }
  };

  if (!navigationContext.isFromAdmin) {
    return null;
  }

  return (
    <div className="flex items-center">
      <button
        onClick={handleReturnToAdmin}
        className="
          flex items-center gap-1 px-2 py-1
          text-[hsl(var(--aviation-primary))] hover:text-[hsl(var(--aviation-secondary))] hover:bg-[hsl(var(--aviation-light))]/10
          rounded transition-colors duration-200
          text-xs font-medium
        "
        title={navigationContext.returnUrl ? `Return to ${navigationContext.returnUrl}` : 'Return to Admin Dashboard'}
      >
        <ArrowLeft className="w-3 h-3" />
        Admin
      </button>
    </div>
  );
}