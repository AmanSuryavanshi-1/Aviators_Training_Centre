/**
 * Mobile Navigation Helper Component
 * Enhances mobile navigation experience in Sanity Studio
 */

import React, { useEffect, useState } from 'react';
import { Card, Button, Flex, Text } from '@sanity/ui';
import { MenuIcon, CloseIcon } from '@sanity/icons';

interface MobileNavigationHelperProps {
  renderDefault: (props: any) => React.ReactNode;
}

export const MobileNavigationHelper: React.FC<MobileNavigationHelperProps> = ({ renderDefault, ...props }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // Add mobile navigation enhancements
      const sidebar = document.querySelector('[data-ui="RootLayout"] > div:first-child');
      if (sidebar) {
        sidebar.setAttribute('data-open', sidebarOpen.toString());
      }

      // Handle backdrop clicks on mobile
      const handleBackdropClick = (event: MouseEvent) => {
        const target = event.target as Element;
        if (sidebarOpen && !target.closest('[data-ui="RootLayout"] > div:first-child')) {
          setSidebarOpen(false);
        }
      };

      if (sidebarOpen) {
        document.addEventListener('click', handleBackdropClick);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.removeEventListener('click', handleBackdropClick);
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, sidebarOpen]);

  // Add mobile menu toggle button
  if (isMobile) {
    return (
      <>
        <Flex align="center" gap={2}>
          <Button
            icon={sidebarOpen ? CloseIcon : MenuIcon}
            mode="ghost"
            tone="primary"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            style={{
              minHeight: '44px',
              minWidth: '44px',
              color: '#075E68'
            }}
          />
          {renderDefault(props)}
        </Flex>
        
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </>
    );
  }

  return renderDefault(props);
};