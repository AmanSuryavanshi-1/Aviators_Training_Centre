'use client';

import React, { useEffect } from 'react';
import { useContactTracking } from '@/lib/analytics/contactTracking';

interface ContactFormTrackerProps {
  children: React.ReactNode;
  formName?: string;
}

export const ContactFormTracker: React.FC<ContactFormTrackerProps> = ({ 
  children, 
  formName = 'contact-form' 
}) => {
  const { trackPageVisit } = useContactTracking();

  useEffect(() => {
    // Track that user visited a page with contact form
    trackPageVisit(window.location.pathname, document.title);
  }, [trackPageVisit]);

  return <>{children}</>;
};

interface CTAButtonProps {
  children: React.ReactNode;
  ctaText: string;
  location?: string;
  onClick?: () => void;
  className?: string;
}

export const TrackedCTAButton: React.FC<CTAButtonProps> = ({
  children,
  ctaText,
  location = 'unknown',
  onClick,
  className = ''
}) => {
  const { trackCTA } = useContactTracking();

  const handleClick = () => {
    trackCTA(ctaText, location);
    if (onClick) {
      onClick();
    }
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};

interface ContactFormProps {
  onSubmit: (data: any) => void;
  className?: string;
  children: React.ReactNode;
}

export const TrackedContactForm: React.FC<ContactFormProps> = ({
  onSubmit,
  className = '',
  children
}) => {
  const { trackFormSubmission } = useContactTracking();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    };

    // Track the form submission
    trackFormSubmission(data);
    
    // Call the original onSubmit
    onSubmit(data);
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      {children}
    </form>
  );
};

// Hook for manual tracking
export const useAnalyticsTracking = () => {
  const { trackCTA, trackFormSubmission, trackPageVisit } = useContactTracking();

  return {
    trackCTA,
    trackFormSubmission,
    trackPageVisit,
    // Convenience methods
    trackEnrollClick: () => trackCTA('Enroll Now', window.location.pathname),
    trackContactClick: () => trackCTA('Contact Us', window.location.pathname),
    trackCallClick: () => trackCTA('Call Now', window.location.pathname),
    trackWhatsAppClick: () => trackCTA('WhatsApp', window.location.pathname),
    trackBrochureDownload: () => trackCTA('Download Brochure', window.location.pathname),
  };
};