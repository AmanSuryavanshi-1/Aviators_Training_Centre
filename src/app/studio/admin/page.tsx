'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Settings, 
  PlusCircle,
  Edit,
  Shield,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import ContentManagement from "@/components/features/admin/ContentManagement";
import SimpleAnalyticsDashboard from "@/components/features/admin/SimpleAnalyticsDashboard";
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
      title: 'Detailed Analytics',
      description: 'View comprehensive analytics',
      icon: BarChart3,
      href: '/studio/admin/analytics',
      color: 'bg-purple-500',
      external: false,
    },
    {
      title: 'Website Home',
      description: 'Go to main website',
      icon: Settings,
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="admin-content overflow-y-auto max-h-screen pb-16">
        {/* Header */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-aviation-primary to-aviation-primary/80 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  ATC Admin Dashboard
                </h1>
                <p className="text-aviation-primary/20 text-lg">
                  Manage your aviation training content with unified Sanity Studio authentication
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">System Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Sanity Studio Auth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/studio" className="text-sm hover:underline">
                      ← Back to Studio
                    </Link>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                  <Settings className="w-12 h-12 text-white/80" />
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
              <Link href="/studio/admin/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Analytics
              </Link>
            </Button>
          </div>
          <SimpleAnalyticsDashboard />
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

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-semibold text-gray-900">
                  ATC Admin Dashboard - Aviators Training Centre
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date().toLocaleString()}
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
        </div>
      </div>
    </div>
  );
}