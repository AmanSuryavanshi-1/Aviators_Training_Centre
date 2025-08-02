/**
 * Sanity Studio Authentication Integration
 * Uses Sanity Studio's built-in authentication for admin access
 */

import { createClient } from '@sanity/client';

// Create Sanity client
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
});

export interface SanityUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
}

/**
 * Check if user has valid Sanity Studio session
 * This works by checking if the browser has Sanity auth cookies
 */
export async function checkSanityStudioAuth(): Promise<SanityUser | null> {
  try {
    // In the browser, check for Sanity auth state
    if (typeof window !== 'undefined') {
      // Check if Sanity Studio auth exists in localStorage or sessionStorage
      const sanityAuth = localStorage.getItem('sanity-auth') || 
                        sessionStorage.getItem('sanity-auth');
      
      if (sanityAuth) {
        try {
          const authData = JSON.parse(sanityAuth);
          if (authData && authData.user) {
            return {
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.name || authData.user.displayName,
              role: authData.user.role || 'editor',
              isAuthenticated: true,
            };
          }
        } catch (e) {
          // Invalid auth data
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking Sanity Studio auth:', error);
    return null;
  }
}

/**
 * Redirect to Sanity Studio for authentication
 */
export function redirectToSanityStudio(returnUrl: string = '/admin') {
  if (typeof window !== 'undefined') {
    // Store return URL for after authentication
    sessionStorage.setItem('sanity-return-url', returnUrl);
    
    // Redirect to Sanity Studio
    window.location.href = '/studio';
  }
}

/**
 * Handle return from Sanity Studio authentication
 */
export function handleSanityStudioReturn() {
  if (typeof window !== 'undefined') {
    const returnUrl = sessionStorage.getItem('sanity-return-url') || '/admin';
    sessionStorage.removeItem('sanity-return-url');
    
    // Small delay to ensure auth state is set
    setTimeout(() => {
      window.location.href = returnUrl;
    }, 1000);
  }
}

/**
 * Check if user is authorized (member of Sanity project)
 */
export function isAuthorizedSanityMember(email: string): boolean {
  const authorizedEmails = [
    'amansuryavanshi2002@gmail.com',
    'adude890@gmail.com',
  ];
  
  return authorizedEmails.includes(email.toLowerCase());
}