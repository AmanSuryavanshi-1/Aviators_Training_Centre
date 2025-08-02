'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { urlGenerator } from '@/lib/utils/urlGenerator';
import { useEffect, useState } from 'react';

// Note: metadata export removed since this is now a client component

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
      title: 'Open Sanity Studio',
      description: 'Create and manage blog posts',
      icon: PlusCircle,
      href: studioUrl,
      color: 'bg-blue-500',
      external: false, // Changed to false since it's now same-origin
      warning: isLocalhost ? 'Using localhost URL - ensure Studio is running locally' : undefined,
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
      href: '/admin/analytics',
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

export default function AdminDashboard() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [urlConfig, setUrlConfig] = useState<any>(null);

  useEffect(() => {
    // Initialize quick actions and URL configuration
    setQuickActions(getQuickActions());
    setUrlConfig(urlGenerator.getConfigSummary());
  }, []);

  const handleStudioNavigation = (href: string) => {
    // Generate navigation token for seamless Studio access
    const token = Math.random().toString(36).substring(2, 15);
    const navigationUrl = urlGenerator.getStudioNavigationUrl('', {
      token,
      returnUrl: '/admin',
    });
    
    // Open Studio in same tab for better UX
    window.location.href = navigationUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-aviation-primary to-aviation-primary/80 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Admin Dashboard
                </h1>
                <p className="text-aviation-primary/20 text-lg">
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

        {/* Analytics Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Analytics Overview</h2>
            <Button asChild variant="outline">
              <Link href="/admin/analytics">
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
                    <span className="text-xs">{urlConfig.isProduction && !urlConfig.isLocalhost ? 'Production Ready' : 'Development Mode'}</span>
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
                {action.title === 'Open Sanity Studio' ? (
                  <div onClick={() => handleStudioNavigation(action.href)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`p-4 rounded-xl ${action.color} group-hover:scale-110 transition-transform duration-200 relative`}>
                          <action.icon className="h-8 w-8 text-white" />
                          {action.warning && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="h-2 w-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                            {action.title}
                            <ExternalLink className="h-3 w-3" />
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{action.description}</p>
                          {action.warning && (
                            <p className="text-xs text-yellow-600 mt-2 font-medium">{action.warning}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                ) : action.external ? (
                  <a href={action.href} target="_blank" rel="noopener noreferrer">
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
                  </a>
                ) : (
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
                )}
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
                  Admin Dashboard - Aviators Training Centre
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" asChild className="hover:bg-aviation-primary hover:text-white transition-colors">
                  <Link href="/">
                    <Settings className="w-4 h-4 mr-2" />
                    View Website
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
  );
}
