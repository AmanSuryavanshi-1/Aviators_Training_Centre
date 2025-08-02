/**
 * Combined App Providers
 * Wraps the application with all necessary context providers
 */

'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { NavigationProvider } from './NavigationContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </AuthProvider>
  );
}

export default AppProviders;