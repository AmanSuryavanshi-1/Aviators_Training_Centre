'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Zap,
  Globe,
  Database,
  Lock,
  Eye,
  Smartphone,
  Bug,
  Activity,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadinessCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
  critical: boolean;
}

interface ReadinessReport {
  overall: 'ready' | 'warning' | 'not-ready';
  score: number;
  checks: ReadinessCheck[];
  timestamp: string;
}

export default function ProductionReadinessDashboard() {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadinessReport = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics/production-readiness');
      const result = await response.json();

      if (result.success) {
        setReport(result.data);
      } else {
        setError(result.error || 'Failed to fetch readiness report');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadinessReport();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'fail': return XCircle;
      case 'warning': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-600';
      case 'fail': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getOverallStatusColor = (overall: string) => {
    switch (overall) {
      case 'ready': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'not-ready': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (checkName: string) => {
    if (checkName.includes('API') || checkName.includes('Analytics')) return Activity;
    if (checkName.includes('Security')) return Lock;
    if (checkName.includes('Database') || checkName.includes('Sanity')) return Database;
    if (checkName.includes('Performance')) return Zap;
    if (checkName.includes('Accessibility')) return Eye;
    if (checkName.includes('Responsive') || checkName.includes('Mobile')) return Smartphone;
    if (checkName.includes('Error') || checkName.includes('Browser')) return Bug;
    if (checkName.includes('Environment')) return Globe;
    return Shield;
  };

  const groupChecksByCategory = (checks: ReadinessCheck[]) => {
    const categories: { [key: string]: ReadinessCheck[] } = {
      'Core Services': [],
      'Security': [],
      'Performance': [],
      'User Experience': [],
      'System Health': []
    };

    checks.forEach(check => {
      if (check.name.includes('API') || check.name.includes('Analytics') || check.name.includes('Database') || check.name.includes('Sanity')) {
        categories['Core Services'].push(check);
      } else if (check.name.includes('Security') || check.name.includes('Environment') || check.name.includes('Authentication')) {
        categories['Security'].push(check);
      } else if (check.name.includes('Performance') || check.name.includes('Caching')) {
        categories['Performance'].push(check);
      } else if (check.name.includes('Accessibility') || check.name.includes('Responsive') || check.name.includes('Browser')) {
        categories['User Experience'].push(check);
      } else {
        categories['System Health'].push(check);
      }
    });

    return categories;
  };

  const exportReport = () => {
    if (!report) return;

    const reportData = {
      timestamp: report.timestamp,
      overall: report.overall,
      score: report.score,
      summary: {
        total: report.checks.length,
        passed: report.checks.filter(c => c.status === 'pass').length,
        failed: report.checks.filter(c => c.status === 'fail').length,
        warnings: report.checks.filter(c => c.status === 'warning').length,
        critical_failures: report.checks.filter(c => c.status === 'fail' && c.critical).length
      },
      checks: report.checks.map(check => ({
        name: check.name,
        status: check.status,
        message: check.message,
        details: check.details,
        critical: check.critical
      }))
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `production-readiness-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-aviation-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-aviation-primary">
                  Running Production Readiness Checks
                </h3>
                <p className="text-muted-foreground">
                  This may take a few moments...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Failed to Run Readiness Checks
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchReadinessReport} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground">
                No Readiness Report Available
              </h3>
              <p className="text-muted-foreground mb-4">
                Click the button below to run production readiness checks
              </p>
              <Button onClick={fetchReadinessReport}>
                <Shield className="h-4 w-4 mr-2" />
                Run Checks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = groupChecksByCategory(report.checks);
  const criticalFailures = report.checks.filter(c => c.status === 'fail' && c.critical);
  const warnings = report.checks.filter(c => c.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-aviation-primary tracking-tight">
            Production Readiness Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive system health and deployment readiness checks
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          
          <Button onClick={fetchReadinessReport} variant="outline" size="sm">
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Overall System Status
          </CardTitle>
          <CardDescription>
            Last checked: {new Date(report.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                getOverallStatusColor(report.overall)
              )}>
                <div className="text-2xl font-bold text-white">
                  {report.score}%
                </div>
              </div>
              <h3 className="font-semibold text-lg capitalize mb-1">
                {report.overall.replace('-', ' ')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {report.overall === 'ready' && 'System is ready for production deployment'}
                {report.overall === 'warning' && 'System has warnings but can be deployed'}
                {report.overall === 'not-ready' && 'Critical issues must be resolved before deployment'}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Readiness Score</span>
                <span className="font-semibold">{report.score}%</span>
              </div>
              <Progress value={report.score} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div>
                  <div className="font-semibold text-green-600">
                    {report.checks.filter(c => c.status === 'pass').length}
                  </div>
                  <div className="text-muted-foreground">Passed</div>
                </div>
                <div>
                  <div className="font-semibold text-yellow-600">
                    {warnings.length}
                  </div>
                  <div className="text-muted-foreground">Warnings</div>
                </div>
                <div>
                  <div className="font-semibold text-red-600">
                    {report.checks.filter(c => c.status === 'fail').length}
                  </div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Quick Actions</h4>
              {criticalFailures.length > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {criticalFailures.length} critical issue{criticalFailures.length > 1 ? 's' : ''} must be resolved
                  </AlertDescription>
                </Alert>
              )}
              {warnings.length > 0 && criticalFailures.length === 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    {warnings.length} warning{warnings.length > 1 ? 's' : ''} should be addressed
                  </AlertDescription>
                </Alert>
              )}
              {report.overall === 'ready' && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    System is ready for production deployment
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checks by Category */}
      {Object.entries(categories).map(([category, checks]) => {
        if (checks.length === 0) return null;

        const categoryPassed = checks.filter(c => c.status === 'pass').length;
        const categoryScore = Math.round((categoryPassed / checks.length) * 100);

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(getCategoryIcon(category), { className: "h-5 w-5" })}
                  {category}
                </CardTitle>
                <Badge variant="outline">
                  {categoryPassed}/{checks.length} passed ({categoryScore}%)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checks.map((check, index) => {
                  const StatusIcon = getStatusIcon(check.status);
                  const statusColor = getStatusColor(check.status);

                  return (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={cn("p-1 rounded-full", statusColor)}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{check.name}</h4>
                          {check.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-1">
                          {check.message}
                        </p>
                        
                        {check.details && (
                          <p className="text-xs text-muted-foreground">
                            {check.details}
                          </p>
                        )}
                      </div>
                      
                      <Badge 
                        variant={check.status === 'pass' ? 'default' : 'outline'}
                        className={cn(
                          "text-xs",
                          check.status === 'pass' && "bg-green-100 text-green-800",
                          check.status === 'fail' && "bg-red-100 text-red-800",
                          check.status === 'warning' && "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {check.status.toUpperCase()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Deployment Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Deployment Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.overall === 'ready' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>Ready for Production:</strong> All critical systems are operational. 
                  You can proceed with deployment to production environment.
                </AlertDescription>
              </Alert>
            )}

            {report.overall === 'warning' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  <strong>Deploy with Caution:</strong> System can be deployed but some features 
                  may not work optimally. Address warnings for best user experience.
                </AlertDescription>
              </Alert>
            )}

            {report.overall === 'not-ready' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Do Not Deploy:</strong> Critical issues must be resolved before 
                  production deployment. System may not function correctly.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Before Deployment:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Verify all environment variables are set</li>
                  <li>• Test API endpoints with production data</li>
                  <li>• Confirm authentication system works</li>
                  <li>• Check SSL certificates and security</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">After Deployment:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Monitor system performance and errors</li>
                  <li>• Verify analytics data collection</li>
                  <li>• Test user authentication flows</li>
                  <li>• Check responsive design on devices</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}