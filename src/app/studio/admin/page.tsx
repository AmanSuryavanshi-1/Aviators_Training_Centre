'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Settings, 
  PlusCircle,
  Edit,
  Shield,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLayout from '@/components/admin/AdminLayout';
import ContentManagement from "@/components/features/admin/ContentManagement";
import AnalyticsVerification from "@/components/admin/AnalyticsVerification";
import CacheInvalidation from "@/components/admin/CacheInvalidation";
import { urlGenerator } from '@/lib/utils/urlGenerator';
import { useEffect, useState } from 'react';

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  external: boolean;
  warning?: string;
}



// Generate URLs using the URL generator
const getQuickActions = (): QuickAction[] => {
  const studioUrl = urlGenerator.getStudioUrl();
  const isLocalhost = urlGenerator.isLocalhostUrl(studioUrl);
  
  return [
    {
      title: 'Back to Sanity Studio',
      description: 'Return to content management studio',
      icon: PlusCircle,
      href: '/studio',
      color: 'bg-blue-500',
      external: false,
    },
    {
      title: 'View Blog',
      description: 'See published blog posts',
      icon: Edit,
      href: '/blog',
      color: 'bg-green-500',
      external: false,
    },
    {
      title: 'Analytics Dashboard',
      description: 'View comprehensive analytics and insights',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500',
      external: false,
    },
    {
      title: 'Website Home',
      description: 'Go to main website',
      icon: ExternalLink,
      href: '/',
      color: 'bg-orange-500',
      external: false,
    },
  ];
};

export default function StudioAdminDashboard() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [urlConfig, setUrlConfig] = useState<any>(null);

  useEffect(() => {
    // Initialize quick actions and URL configuration
    setQuickActions(getQuickActions());
    setUrlConfig(urlGenerator.getConfigSummary());
  }, []);

  return (
    <AdminLayout 
      title="ATC Admin Dashboard" 
      description="Manage your aviation training content and analytics"
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-aviation-primary to-aviation-primary/80 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3">
                Welcome to Admin Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Manage your aviation training content and monitor system performance
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">System Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Secure Access</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Settings className="w-10 h-10 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Content Management Panel */}
        <div className="mb-8">
          <ContentManagement />
        </div>

        {/* Analytics Verification */}
        <div className="mb-8">
          <AnalyticsVerification />
        </div>

        {/* Cache Management */}
        <div className="mb-8">
          <CacheInvalidation />
        </div>

        {/* Analytics Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Analytics Overview</h2>
            <Button asChild variant="outline">
              <Link href="/admin/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Analytics Dashboard
              </Link>
            </Button>
          </div>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Comprehensive Analytics Available</h3>
                  <p className="text-muted-foreground mt-2">
                    Access detailed analytics including real-time metrics, traffic sources, conversion funnels, 
                    AI platform referrals, and comprehensive reporting tools.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm">Real-time Data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">5 Dashboard Tabs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Advanced Filtering</span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URL Configuration Status */}
        {urlConfig && (
          <div className="mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">URL Configuration</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Environment: {urlConfig.environment} | Studio: {urlConfig.isLocalhost ? 'Local' : 'Production'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${urlConfig.isProduction && !urlConfig.isLocalhost ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs">{urlConfig.isProduction && !urlConfig.isLocalhost ? 'Production Ready - Unified Auth' : 'Development Mode'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Card key={action.title} className="group hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-0 shadow-md">
                <Link href={action.href}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`p-4 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                        <action.icon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base mb-2">{action.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

      {/* Quick Navigation */}
      <div className="mt-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-gray-900">
                Quick Navigation
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Access key areas of your system
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild className="hover:bg-aviation-primary hover:text-white transition-colors">
                <Link href="/studio">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Back to Studio
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="hover:bg-aviation-primary hover:text-white transition-colors">
                <Link href="/blog">
                  <Edit className="w-4 h-4 mr-2" />
                  View Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}