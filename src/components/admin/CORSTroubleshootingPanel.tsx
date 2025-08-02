/**
 * CORS Troubleshooting Panel Component
 * Provides automated CORS testing and troubleshooting tools
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
  RefreshCw, 
  ExternalLink,
  Copy,
  Download,
  Play,
  Clock
} from 'lucide-react';
import { corsChecker, CORSCheckReport } from '@/lib/diagnostics/corsChecker';

export default function CORSTroubleshootingPanel() {
  const [report, setReport] = useState<CORSCheckReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testOrigins, setTestOrigins] = useState<string[]>([]);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  useEffect(() => {
    // Initialize with common origins
    const origins = [
      'https://www.aviatorstrainingcentre.in',
      'https://aviatorstrainingcentre.in',
    ];
    
    // Add localhost for development
    if (process.env.NODE_ENV === 'development') {
      origins.push('http://localhost:3000');
    }
    
    setTestOrigins(origins);
  }, []);

  const runCORSTest = async () => {
    setIsLoading(true);
    try {
      const testReport = await corsChecker.performCORSCheck(testOrigins);
      setReport(testReport);
    } catch (error) {
      console.error('CORS test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuickTest = async (origin: string) => {
    try {
      const result = await corsChecker.quickTest(origin);
      console.log(`Quick test for ${origin}:`, result);
      
      // Show result in UI (you could add a toast notification here)
      alert(`${origin}: ${result.isWorking ? 'Working' : 'Failed'}\n${result.error || 'No errors'}`);
    } catch (error) {
      console.error('Quick test failed:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadReport = () => {
    if (!report) return;
    
    const detailedReport = corsChecker.generateDetailedReport(report);
    const blob = new Blob([detailedReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cors-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openSanityManagement = () => {
    window.open('https://www.sanity.io/manage/personal/project/3u4fa9kl/api', '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'fail': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* CORS Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            CORS Troubleshooting Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Origins */}
          <div>
            <h4 className="font-medium mb-2">Origins to Test:</h4>
            <div className="space-y-2">
              {testOrigins.map((origin, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{origin}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runQuickTest(origin)}
                      disabled={isLoading}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Quick Test
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(origin)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={runCORSTest}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Full CORS Test
            </Button>
            <Button
              variant="outline"
              onClick={openSanityManagement}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Sanity Console
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {report.overallStatus === 'pass' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : report.overallStatus === 'partial' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              CORS Test Results
              <Badge className={getStatusColor(report.overallStatus)}>
                {report.overallStatus}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold">{report.summary.totalOrigins}</div>
                <div className="text-sm text-gray-600">Total Origins</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{report.summary.workingOrigins}</div>
                <div className="text-sm text-gray-600">Working</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{report.summary.failedOrigins}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {/* Individual Results */}
            <div className="space-y-2">
              <h4 className="font-medium">Origin Results:</h4>
              {report.results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {result.isWorking ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-mono text-sm">{result.origin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.responseTime && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {result.responseTime}ms
                      </div>
                    )}
                    <Badge variant={result.isWorking ? 'default' : 'destructive'}>
                      {result.isWorking ? 'Working' : 'Failed'}
                    </Badge>
                    {result.details.credentials && (
                      <Badge variant="outline" className="text-xs">
                        Credentials OK
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Recommendations:</div>
                    {report.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm">• {rec}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDetailedReport(!showDetailedReport)}
              >
                {showDetailedReport ? 'Hide' : 'Show'} Detailed Report
              </Button>
              <Button
                variant="outline"
                onClick={downloadReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Report */}
      {showDetailedReport && report && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed CORS Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Fix Suggestions */}
              {(() => {
                const suggestions = corsChecker.generateFixSuggestions(report);
                return suggestions.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-3">Fix Suggestions:</h4>
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium">{suggestion.issue}</h5>
                            <Badge variant={
                              suggestion.priority === 'high' ? 'destructive' :
                              suggestion.priority === 'medium' ? 'default' : 'secondary'
                            }>
                              {suggestion.priority} priority
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.solution}</p>
                          <div className="text-xs">
                            <div className="font-medium mb-1">Steps:</div>
                            <ol className="list-decimal list-inside space-y-1">
                              {suggestion.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Raw Report */}
              <div>
                <h4 className="font-medium mb-2">Raw Report Data:</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('/docs/CORS_SETUP_GUIDE.md', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Setup Guide
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/docs/TROUBLESHOOTING.md', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Troubleshooting Guide
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard('https://www.aviatorstrainingcentre.in')}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Production URL
            </Button>
            <Button
              variant="outline"
              onClick={openSanityManagement}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Sanity Management
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}