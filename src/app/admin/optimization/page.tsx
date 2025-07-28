'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PerformanceOptimizationDashboard from "@/components/features/admin/PerformanceOptimizationDashboard";
import { TrendingUp, Target, Lightbulb, BarChart3 } from 'lucide-react';

export default function OptimizationPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Optimization Center</h1>
          <p className="text-muted-foreground">
            AI-powered insights and recommendations to maximize blog performance and conversions
          </p>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78.5</div>
            <p className="text-xs text-muted-foreground">
              Average across all posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              High-impact improvements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              New content opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Gaps</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Missing topic areas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Optimization Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization Dashboard</CardTitle>
          <CardDescription>
            Comprehensive analytics and AI-powered recommendations for content optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceOptimizationDashboard />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common optimization tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Bulk Content Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Analyze multiple posts for optimization opportunities
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">SEO Health Check</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive SEO audit of all blog content
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Keyword Research</h3>
              <p className="text-sm text-muted-foreground">
                Discover new aviation training keywords to target
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Competitor Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Compare content performance against competitors
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Content Calendar</h3>
              <p className="text-sm text-muted-foreground">
                Plan content based on trending topics and gaps
              </p>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <h3 className="font-semibold mb-2">Performance Reports</h3>
              <p className="text-sm text-muted-foreground">
                Generate detailed optimization reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}