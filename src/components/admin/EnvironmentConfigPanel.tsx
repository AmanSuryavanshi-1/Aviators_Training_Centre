/**
 * Environment Configuration Panel Component
 * Displays environment validation results and configuration status
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
  Settings, 
  RefreshCw,
  Copy,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  validateEnvironment, 
  generateConfigurationReport, 
  getQuickFixes,
  ValidationResult 
} from '@/lib/config/environmentValidator';

export default function EnvironmentConfigPanel() {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  useEffect(() => {
    performValidation();
  }, []);

  const performValidation = async () => {
    setIsLoading(true);
    try {
      // Simulate async validation (in case we add API calls later)
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = validateEnvironment();
      setValidation(result);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    if (!validation) return;
    
    const report = generateConfigurationReport(validation);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environment-config-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const maskSensitiveValue = (value: string, show: boolean) => {
    if (!value) return 'Not set';
    if (show) return value;
    return value.length > 10 ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : '***';
  };

  if (isLoading || !validation) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Validating environment configuration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const criticalErrors = validation.errors.filter(e => e.severity === 'critical');
  const highErrors = validation.errors.filter(e => e.severity === 'high');
  const quickFixes = getQuickFixes(validation);

  return (
    <div className="space-y-6">
      {/* Configuration Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Configuration Status
            <Button
              variant="outline"
              size="sm"
              onClick={performValidation}
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
            {validation.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium">
              {validation.isValid 
                ? 'Configuration is valid' 
                : 'Configuration has issues'}
            </span>
            <Badge variant={validation.environment === 'production' ? 'default' : 'secondary'}>
              {validation.environment}
            </Badge>
          </div>

          {/* Critical Errors */}
          {criticalErrors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">Critical Issues ({criticalErrors.length})</div>
                  {criticalErrors.slice(0, 3).map((error, index) => (
                    <div key={index} className="text-sm">• {error.message}</div>
                  ))}
                  {criticalErrors.length > 3 && (
                    <div className="text-sm">... and {criticalErrors.length - 3} more</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* High Priority Errors */}
          {highErrors.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium">High Priority Issues ({highErrors.length})</div>
                  {highErrors.slice(0, 2).map((error, index) => (
                    <div key={index} className="text-sm">• {error.message}</div>
                  ))}
                  {highErrors.length > 2 && (
                    <div className="text-sm">... and {highErrors.length - 2} more</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReport(!showReport)}
            >
              {showReport ? 'Hide' : 'Show'} Detailed Report
            </Button>
            <Button
              variant="outline"
              onClick={downloadReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
            >
              {showSensitiveData ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showSensitiveData ? 'Hide' : 'Show'} Values
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sanity Configuration */}
          <div>
            <h4 className="font-medium mb-2">Sanity Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Project ID:</span>
                <span className="text-sm font-mono">
                  {maskSensitiveValue(validation.configuration.sanity?.projectId || '', showSensitiveData)}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Dataset:</span>
                <span className="text-sm font-mono">
                  {validation.configuration.sanity?.dataset || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">API Version:</span>
                <span className="text-sm font-mono">
                  {validation.configuration.sanity?.apiVersion || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">API Token:</span>
                <span className="text-sm font-mono">
                  {validation.configuration.sanity?.apiToken 
                    ? (showSensitiveData ? validation.configuration.sanity.apiToken : '***...***')
                    : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Site Configuration */}
          <div>
            <h4 className="font-medium mb-2">Site Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Site URL:</span>
                <span className="text-sm font-mono">
                  {validation.configuration.site?.url || 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">Environment:</span>
                <Badge variant={validation.configuration.site?.environment === 'production' ? 'default' : 'secondary'}>
                  {validation.configuration.site?.environment || 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Services Status */}
          <div>
            <h4 className="font-medium mb-2">External Services</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant={validation.configuration.services?.firebase ? 'default' : 'outline'}>
                Firebase: {validation.configuration.services?.firebase ? 'Configured' : 'Not configured'}
              </Badge>
              <Badge variant={validation.configuration.services?.resend ? 'default' : 'outline'}>
                Resend: {validation.configuration.services?.resend ? 'Configured' : 'Not configured'}
              </Badge>
              <Badge variant={validation.configuration.services?.analytics ? 'default' : 'outline'}>
                Analytics: {validation.configuration.services?.analytics ? 'Configured' : 'Not configured'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Fixes */}
      {quickFixes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Fixes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickFixes.map((fix, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded">
                <h5 className="font-medium text-sm">{fix.issue}</h5>
                <p className="text-sm text-gray-600 mb-2">{fix.fix}</p>
                {fix.command && (
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-900 text-green-400 p-2 rounded font-mono text-xs flex-1">
                      {fix.command}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(fix.command!)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Report */}
      {showReport && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Configuration Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* All Errors */}
              {validation.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Issues ({validation.errors.length})</h4>
                  <div className="space-y-2">
                    {validation.errors.map((error, index) => (
                      <div key={index} className={`p-3 rounded ${getSeverityColor(error.severity)}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{error.field}</div>
                            <div className="text-sm">{error.message}</div>
                            {error.fix && (
                              <div className="text-xs mt-1 opacity-75">Fix: {error.fix}</div>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {error.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Warnings ({validation.warnings.length})</h4>
                  <div className="space-y-2">
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="p-3 bg-yellow-50 text-yellow-800 rounded">
                        <div className="font-medium text-sm">{warning.field}</div>
                        <div className="text-sm">{warning.message}</div>
                        <div className="text-xs mt-1 opacity-75">Recommendation: {warning.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {validation.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <div className="space-y-1">
                    {validation.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm">• {rec}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}