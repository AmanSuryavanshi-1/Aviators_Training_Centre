/**
 * Simple Login Page
 * Redirects to Sanity Studio for authentication
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ExternalLink } from 'lucide-react';
import { checkSanityStudioAuth, redirectToSanityStudio } from '@/lib/auth/sanity-studio-auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/admin';
  
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await checkSanityStudioAuth();
      
      if (user && user.isAuthenticated) {
        // User is already authenticated, redirect to intended destination
        router.push(redirectTo);
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Failed to check authentication status');
      setIsChecking(false);
    }
  };

  const handleStudioLogin = () => {
    redirectToSanityStudio(redirectTo);
  };

  const handleSimpleLogin = async (email: string) => {
    try {
      setIsChecking(true);
      setError(null);

      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to intended destination
        router.push(redirectTo);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Simple login error:', error);
      setError('Login failed');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Access Required
          </CardTitle>
          <CardDescription className="text-gray-600">
            Please authenticate with Sanity Studio to access the admin dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Studio Login Button */}
            <Button
              onClick={handleStudioLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Login with Sanity Studio
            </Button>

            {/* Simple Login for Testing */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                🧪 Testing Login (Temporary)
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleSimpleLogin('amansuryavanshi2002@gmail.com')}
                >
                  Quick Login: Aman
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleSimpleLogin('adude890@gmail.com')}
                >
                  Quick Login: Myst
                </Button>
              </div>
            </div>

            {/* Information */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">
                    How This Works
                  </h3>
                  <div className="text-sm text-blue-700 mt-1 space-y-1">
                    <p>1. Click "Login with Sanity Studio"</p>
                    <p>2. Sign in with your Google account in Sanity</p>
                    <p>3. You'll be redirected back to the admin dashboard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Authorized members info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-700 mb-2">
                Authorized Members:
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>amansuryavanshi2002@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>adude890@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Direct Studio access */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-2">
                Or access Sanity Studio directly:
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => window.open('/studio', '_blank')}
              >
                Open Sanity Studio
              </Button>
            </div>

            {/* Security notice */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>Secured by Sanity Studio authentication</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading login page...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}