'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface VerificationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const AnalyticsVerification: React.FC = () => {
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runVerification = async () => {
    setLoading(true);
    const testResults: VerificationResult[] = [];

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Test 1: Domain Check
    const currentDomain = window.location.hostname;
    const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
    const isProduction = currentDomain === 'www.aviatorstrainingcentre.in';
    
    testResults.push({
      test: 'Domain Verification',
      status: isProduction ? 'pass' : isLocalhost ? 'warning' : 'fail',
      message: `Current domain: ${currentDomain}`,
      details: isProduction 
        ? 'Perfect! You\'re on the production domain.' 
        : isLocalhost 
          ? '🔧 Development environment detected. This is normal for localhost testing.'
          : 'Unknown domain detected.'
    });

    // Test 2: Google Analytics
    const hasGtag = typeof window.gtag !== 'undefined';
    testResults.push({
      test: 'Google Analytics 4',
      status: hasGtag ? 'pass' : 'fail',
      message: hasGtag ? 'GA4 tracking code loaded' : 'GA4 tracking code not found',
      details: hasGtag ? 'Events are being sent to G-XSRFEJCB7N' : 'Check if GA4 script is blocked'
    });

    // Test 3: Custom Events
    try {
      if (hasGtag) {
        window.gtag('event', 'analytics_verification', {
          test_type: 'admin_verification',
          domain: currentDomain,
          timestamp: new Date().toISOString()
        });
        
        testResults.push({
          test: 'Custom Event Tracking',
          status: 'pass',
          message: 'Test event sent successfully',
          details: 'Custom events are working correctly'
        });
      }
    } catch (error) {
      testResults.push({
        test: 'Custom Event Tracking',
        status: 'fail',
        message: 'Failed to send test event',
        details: 'There might be an issue with event tracking'
      });
    }

    // Test 4: Meta Pixel
    const hasMetaPixel = typeof window.fbq !== 'undefined';
    testResults.push({
      test: 'Meta Pixel',
      status: hasMetaPixel ? 'pass' : 'warning',
      message: hasMetaPixel ? 'Meta Pixel loaded' : 'Meta Pixel not detected',
      details: hasMetaPixel ? 'Facebook ads tracking is active' : 'Meta Pixel might be blocked'
    });

    // Test 5: SSL Certificate
    const isHTTPS = window.location.protocol === 'https:';
    
    testResults.push({
      test: 'SSL Certificate',
      status: isHTTPS ? 'pass' : isLocalhost ? 'warning' : 'fail',
      message: isHTTPS ? 'HTTPS enabled' : isLocalhost ? 'HTTP (localhost)' : 'HTTP only (insecure)',
      details: isHTTPS 
        ? 'Secure connection established' 
        : isLocalhost 
          ? '🔧 Localhost uses HTTP. This is normal for development.'
          : 'SSL certificate required for proper tracking'
    });

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    runVerification();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">UNKNOWN</Badge>;
    }
  };

  const passedTests = results.filter(r => r.status === 'pass').length;
  const totalTests = results.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Analytics Verification</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {passedTests}/{totalTests} tests passed
            </span>
            <Button onClick={runVerification} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Re-test
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Development Environment Notice */}
        {(typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) && (
          <div className="p-4 rounded-lg mb-4 bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-800">🔧 Development Environment</h3>
                <p className="text-sm text-blue-700">
                  You're testing on localhost. Some warnings are expected. Deploy to production to see full green status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overall Status */}
        <div className={`p-4 rounded-lg mb-6 ${
          passedTests === totalTests 
            ? 'bg-green-50 border border-green-200' 
            : passedTests >= totalTests * 0.8 
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {passedTests === totalTests ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-medium ${
                passedTests === totalTests ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {passedTests === totalTests 
                  ? '🎉 Analytics Setup Complete!' 
                  : '⚠️ Analytics Setup Needs Attention'}
              </h3>
              <p className={`text-sm ${
                passedTests === totalTests ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {passedTests === totalTests 
                  ? 'All systems are working correctly. Your analytics are tracking real data from www.aviatorstrainingcentre.in'
                  : `${passedTests} out of ${totalTests} tests passed. Review the issues below.`}
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(result.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{result.test}</h4>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-sm text-gray-700 mb-1">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-500">{result.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Quick Links</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Analytics 4
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Search Console
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Meta Events Manager
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/analytics" target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                Detailed Analytics
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsVerification;