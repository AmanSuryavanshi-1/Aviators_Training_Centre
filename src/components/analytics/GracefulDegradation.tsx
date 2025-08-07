'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  AlertTriangle,
  Info,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GracefulDegradationProps {
  type: 'partial' | 'complete' | 'maintenance';
  availableData?: {
    hasBasicMetrics?: boolean;
    hasTrafficData?: boolean;
    hasUserData?: boolean;
    hasContentData?: boolean;
  };
  onRetry?: () => void;
  estimatedRecovery?: string;
}

interface MockMetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  available: boolean;
}

function MockMetricCard({ title, value, subtitle, icon: Icon, trend, available }: MockMetricCardProps) {
  return (
    <Card className={cn(!available && \"opacity-50 border-dashed\")}>
      <CardContent className=\"p-6\">
        <div className=\"flex items-center justify-between mb-4\">
          <h3 className=\"text-sm font-medium text-muted-foreground\">{title}</h3>
          <div className={cn(
            \"p-2 rounded-lg\",
            available ? \"bg-aviation-primary\" : \"bg-gray-300\"
          )}>
            <Icon className={cn(
              \"h-4 w-4\",
              available ? \"text-white\" : \"text-gray-500\"
            )} />
          </div>
        </div>
        <div className=\"space-y-1\">
          <div className=\"text-2xl font-bold text-aviation-primary\">
            {available ? value : '---'}
          </div>
          <p className=\"text-xs text-muted-foreground flex items-center gap-1\">
            {available && trend && (
              <TrendingUp className={cn(
                \"h-3 w-3\",
                trend === 'up' ? \"text-green-600\" : trend === 'down' ? \"text-red-600\" : \"text-gray-600\"
              )} />
            )}
            {available ? subtitle : 'Data unavailable'}
          </p>
        </div>
        {!available && (
          <Badge variant=\"outline\" className=\"mt-2 text-xs\">
            Offline
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function GracefulDegradation({ 
  type, 
  availableData = {}, 
  onRetry,
  estimatedRecovery 
}: GracefulDegradationProps) {
  const getStatusInfo = () => {
    switch (type) {
      case 'partial':
        return {
          title: 'Partial Data Available',
          description: 'Some analytics services are temporarily unavailable. Showing available data.',
          color: 'border-yellow-500 bg-yellow-50',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600'
        };
      case 'maintenance':
        return {
          title: 'Maintenance Mode',
          description: 'Analytics services are undergoing scheduled maintenance.',
          color: 'border-blue-500 bg-blue-50',
          icon: Info,
          iconColor: 'text-blue-600'
        };
      default:
        return {
          title: 'Analytics Unavailable',
          description: 'Analytics services are currently unavailable. Please try again later.',
          color: 'border-red-500 bg-red-50',
          icon: AlertTriangle,
          iconColor: 'text-red-600'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Mock data for demonstration
  const mockMetrics = [
    {
      title: 'Total Users',
      value: '2,847',
      subtitle: '+12% from last month',
      icon: Users,
      trend: 'up' as const,
      available: availableData.hasUserData || false
    },
    {
      title: 'Page Views',
      value: '18,392',
      subtitle: '+8% from last month',
      icon: Eye,
      trend: 'up' as const,
      available: availableData.hasBasicMetrics || false
    },
    {
      title: 'Conversions',
      value: '156',
      subtitle: '+23% from last month',
      icon: MousePointer,
      trend: 'up' as const,
      available: availableData.hasBasicMetrics || false
    },
    {
      title: 'Active Sessions',
      value: '89',
      subtitle: 'Currently online',
      icon: Activity,
      available: availableData.hasUserData || false
    }
  ];

  return (
    <div className=\"space-y-6\">
      {/* Status Alert */}
      <Alert className={statusInfo.color}>
        <StatusIcon className={cn(\"h-4 w-4\", statusInfo.iconColor)} />
        <AlertDescription>
          <div className=\"space-y-2\">
            <div>
              <strong>{statusInfo.title}</strong>
              <p className=\"mt-1\">{statusInfo.description}</p>
            </div>
            
            {estimatedRecovery && (
              <p className=\"text-sm\">
                <strong>Estimated recovery:</strong> {estimatedRecovery}
              </p>
            )}
            
            {type === 'partial' && (
              <div className=\"mt-3\">
                <h4 className=\"font-medium mb-2\">Service Status:</h4>
                <div className=\"grid grid-cols-2 gap-2 text-sm\">
                  <div className=\"flex items-center gap-2\">
                    <div className={cn(
                      \"w-2 h-2 rounded-full\",
                      availableData.hasBasicMetrics ? \"bg-green-500\" : \"bg-red-500\"
                    )} />
                    Basic Metrics
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <div className={cn(
                      \"w-2 h-2 rounded-full\",
                      availableData.hasTrafficData ? \"bg-green-500\" : \"bg-red-500\"
                    )} />
                    Traffic Data
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <div className={cn(
                      \"w-2 h-2 rounded-full\",
                      availableData.hasUserData ? \"bg-green-500\" : \"bg-red-500\"
                    )} />
                    User Analytics
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <div className={cn(
                      \"w-2 h-2 rounded-full\",
                      availableData.hasContentData ? \"bg-green-500\" : \"bg-red-500\"
                    )} />
                    Content Analytics
                  </div>
                </div>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      {onRetry && (
        <div className=\"flex gap-3\">
          <Button 
            onClick={onRetry}
            className=\"bg-aviation-primary hover:bg-aviation-primary/90\"
          >
            <RefreshCw className=\"h-4 w-4 mr-2\" />
            Retry Connection
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant=\"outline\"
          >
            <RefreshCw className=\"h-4 w-4 mr-2\" />
            Reload Page
          </Button>
        </div>
      )}

      {/* Mock/Cached Metrics */}
      <div className=\"grid gap-4 md:grid-cols-2 lg:grid-cols-4\">
        {mockMetrics.map((metric, index) => (
          <MockMetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Placeholder Charts */}
      <div className=\"grid gap-6 md:grid-cols-2\">
        <Card className={cn(!availableData.hasTrafficData && \"opacity-50 border-dashed\")}>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <BarChart3 className=\"h-5 w-5\" />
              Traffic Sources
              {!availableData.hasTrafficData && (
                <Badge variant=\"outline\" className=\"ml-2\">Offline</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {availableData.hasTrafficData 
                ? \"Showing cached data from last successful sync\"
                : \"Traffic source data is currently unavailable\"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300\">
              <div className=\"text-center space-y-2\">
                <Globe className=\"h-12 w-12 text-gray-400 mx-auto\" />
                <p className=\"text-gray-500\">
                  {availableData.hasTrafficData ? \"Cached Data\" : \"Chart Unavailable\"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(!availableData.hasUserData && \"opacity-50 border-dashed\")}>
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <PieChart className=\"h-5 w-5\" />
              Device Breakdown
              {!availableData.hasUserData && (
                <Badge variant=\"outline\" className=\"ml-2\">Offline</Badge>
              )}
            </CardTitle>
            <CardDescription>
              {availableData.hasUserData 
                ? \"Showing cached data from last successful sync\"
                : \"Device analytics data is currently unavailable\"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className=\"h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300\">
              <div className=\"text-center space-y-2\">
                <Smartphone className=\"h-12 w-12 text-gray-400 mx-auto\" />
                <p className=\"text-gray-500\">
                  {availableData.hasUserData ? \"Cached Data\" : \"Chart Unavailable\"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fallback Information */}
      <Card>
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Info className=\"h-5 w-5\" />
            What's Happening?
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          <div className=\"space-y-3\">
            {type === 'complete' && (
              <div>
                <h4 className=\"font-medium mb-2\">Complete Service Outage</h4>
                <p className=\"text-sm text-muted-foreground\">
                  All analytics services are currently unavailable. This could be due to:
                </p>
                <ul className=\"text-sm text-muted-foreground mt-2 space-y-1 ml-4\">
                  <li>• Scheduled maintenance</li>
                  <li>• Network connectivity issues</li>
                  <li>• Third-party service outages (Google Analytics, etc.)</li>
                  <li>• Server maintenance</li>
                </ul>
              </div>
            )}

            {type === 'partial' && (
              <div>
                <h4 className=\"font-medium mb-2\">Partial Service Availability</h4>
                <p className=\"text-sm text-muted-foreground\">
                  Some analytics services are working while others are temporarily unavailable. 
                  We're showing you the data that's currently accessible.
                </p>
              </div>
            )}

            {type === 'maintenance' && (
              <div>
                <h4 className=\"font-medium mb-2\">Scheduled Maintenance</h4>
                <p className=\"text-sm text-muted-foreground\">
                  We're performing scheduled maintenance to improve our analytics services. 
                  All data will be available once maintenance is complete.
                </p>
              </div>
            )}

            <div className=\"bg-blue-50 p-3 rounded-lg border border-blue-200\">
              <h4 className=\"font-medium text-blue-800 mb-2\">What You Can Do</h4>
              <ul className=\"text-sm text-blue-700 space-y-1\">
                <li>• Check back in a few minutes</li>
                <li>• Use the retry button to check for recovery</li>
                <li>• Contact support if the issue persists</li>
                <li>• Bookmark this page and return later</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}