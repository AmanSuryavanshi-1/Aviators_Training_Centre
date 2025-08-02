/**
 * CORS Configuration Panel Component
 * Provides UI for CORS validation and setup instructions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  Settings,
  Globe
} from 'lucide-react';
import { corsManager, CORSValidationResult, CORSInstructions, CORSStatus } from '@/lib/sanity/corsManager';

export default function CORSConfigurationPanel() {
  const [validationResult, setValidationResult] = useState<CORSValidationResult | null>(null);
  const [corsStatus, setCorsStatus] = useState<CORSStatus | null>(null);
  const [instructions, setInstructions] = useState<CORSInstructions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    validateCORS();
  }, []);

  const validateCORS = async () => {
    setIsLoading(true);
    try {
      const [validation, status] = await Promise.all([
        corsManager.validateCORSConfiguration(),
        corsManager.checkCORSStatus(),
      ]);
      
      setValidationResult(validation);
      setCorsStatus(status);
      setInstructions(corsManager.generateCORSInstructions());
    } catch (error) {
      console.error('CORS validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openSanityManagement = () => {
    const config = corsManager.getConfigurationSummary();
    window.open(config.apiSettingsUrl, '_blank');
  };

  if (!validationResult || !corsStatus || !instructions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading CORS configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* CORS Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            CORS Configuration Status
            <Button
              variant="outline"
              size="sm"
              onClick={validateCORS}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Status */}
          <div className="flex items-center gap-2">
            {validationResult.isValid && corsStatus.isConfigured ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">
              {validationResult.isValid && corsStatus.isConfigured 
                ? 'CORS is properly configured' 
                : 'CORS configuration needs attention'}
            </span>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <div key={index}>• {warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Required Origins */}
          <div>
            <h4 className="font-medium mb-2">Required CORS Origins:</h4>
            <div className="space-y-2">
              {validationResult.requiredOrigins.map((origin, index) => {
                const originStatus = corsStatus.origins.find(o => o.url === origin);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{origin}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={originStatus?.status === 'working' ? 'default' : 'destructive'}>
                        {originStatus?.status || 'unknown'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(origin)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={openSanityManagement} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Open Sanity Management
              <ExternalLink className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              {showInstructions ? 'Hide' : 'Show'} Setup Instructions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {showInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>{instructions.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Steps */}
            <div className="space-y-4">
              {instructions.steps.map((step) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                    <div className="bg-gray-50 p-2 rounded font-mono text-sm">
                      {step.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Troubleshooting */}
            <div>
              <h4 className="font-medium mb-3">Troubleshooting</h4>
              <div className="space-y-3">
                {instructions.troubleshooting.map((item, index) => (
                  <div key={index} className="border-l-4 border-yellow-400 pl-4">
                    <h5 className="font-medium text-sm">{item.issue}</h5>
                    <p className="text-sm text-gray-600">{item.solution}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Fixes */}
            <div>
              <h4 className="font-medium mb-3">Quick Fixes</h4>
              <div className="space-y-2">
                {corsManager.generateQuickFixes().map((fix, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-sm">{fix.issue}</h5>
                    <p className="text-sm text-gray-600 mb-2">{fix.fix}</p>
                    {fix.command && (
                      <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                        {fix.command}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}