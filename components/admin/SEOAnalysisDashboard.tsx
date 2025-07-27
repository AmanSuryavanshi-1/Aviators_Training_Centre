'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Target,
  FileText,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { unifiedBlogService } from '@/lib/blog/unified-blog-service';
import { blogSEOOptimizer } from '@/lib/seo/blog-seo-optimizer';
import { BlogPost } from '@/lib/types/blog';

interface SEOAnalysis {
  overallScore: number;
  totalPosts: number;
  postsAnalyzed: number;
  issues: {
    critical: number;
    warning: number;
    info: number;
  };
  topPerformers: Array<{
    post: BlogPost;
    score: number;
    title: string;
  }>;
  needsImprovement: Array<{
    post: BlogPost;
    score: number;
    title: string;
    issues: string[];
  }>;
  recommendations: string[];
}

const SEOAnalysisDashboard: React.FC = () => {
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSEOAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all blog posts
      const result = await unifiedBlogService.getAllPosts();
      const posts = result.success ? result.data || [] : [];

      if (posts.length === 0) {
        setAnalysis({
          overallScore: 0,
          totalPosts: 0,
          postsAnalyzed: 0,
          issues: { critical: 0, warning: 0, info: 0 },
          topPerformers: [],
          needsImprovement: [],
          recommendations: ['Create blog posts to start SEO analysis'],
        });
        return;
      }

      // Analyze each post
      const postAnalyses = await Promise.all(
        posts.slice(0, 20).map(async (post) => { // Limit to 20 posts for performance
          try {
            // Get full post data
            const fullPostResult = await unifiedBlogService.getPostBySlug(post.slug.current);
            if (!fullPostResult.success || !fullPostResult.data) {
              return null;
            }
            
            const seoReport = blogSEOOptimizer.generateSEOReport(fullPostResult.data);
            return {
              post: fullPostResult.data,
              ...seoReport,
            };
          } catch (error) {
            console.warn(`Failed to analyze post ${post.slug.current}:`, error);
            return null;
          }
        })
      );

      const validAnalyses = postAnalyses.filter(Boolean);
      
      if (validAnalyses.length === 0) {
        throw new Error('Failed to analyze any posts');
      }

      // Calculate overall metrics
      const overallScore = Math.round(
        validAnalyses.reduce((sum, analysis) => sum + analysis.score, 0) / validAnalyses.length
      );

      // Count issues
      const issues = validAnalyses.reduce(
        (acc, analysis) => {
          analysis.validation.issues.forEach(issue => {
            if (issue.includes('missing')) {
              acc.critical++;
            } else if (issue.includes('too long') || issue.includes('too short')) {
              acc.warning++;
            } else {
              acc.info++;
            }
          });
          return acc;
        },
        { critical: 0, warning: 0, info: 0 }
      );

      // Get top performers (score >= 80)
      const topPerformers = validAnalyses
        .filter(analysis => analysis.score >= 80)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map(analysis => ({
          post: analysis.post,
          score: analysis.score,
          title: analysis.post.title,
        }));

      // Get posts needing improvement (score < 70)
      const needsImprovement = validAnalyses
        .filter(analysis => analysis.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5)
        .map(analysis => ({
          post: analysis.post,
          score: analysis.score,
          title: analysis.post.title,
          issues: analysis.recommendations.slice(0, 3),
        }));

      // Generate overall recommendations
      const recommendations = [];
      
      if (issues.critical > 0) {
        recommendations.push(`Fix ${issues.critical} critical SEO issues (missing titles/descriptions)`);
      }
      
      if (issues.warning > 5) {
        recommendations.push(`Optimize ${issues.warning} content length issues`);
      }
      
      const postsWithoutFocusKeyword = validAnalyses.filter(
        analysis => !analysis.post.seoEnhancement?.focusKeyword
      ).length;
      
      if (postsWithoutFocusKeyword > 0) {
        recommendations.push(`Add focus keywords to ${postsWithoutFocusKeyword} posts`);
      }
      
      const postsWithoutTags = validAnalyses.filter(
        analysis => !analysis.post.tags || analysis.post.tags.length === 0
      ).length;
      
      if (postsWithoutTags > 0) {
        recommendations.push(`Add tags to ${postsWithoutTags} posts for better categorization`);
      }
      
      if (overallScore < 75) {
        recommendations.push('Focus on improving meta descriptions and title optimization');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Great job! Your blog SEO is performing well. Keep creating quality content.');
      }

      setAnalysis({
        overallScore,
        totalPosts: posts.length,
        postsAnalyzed: validAnalyses.length,
        issues,
        topPerformers,
        needsImprovement,
        recommendations,
      });

    } catch (err) {
      console.error('SEO analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to run SEO analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSEOAnalysis();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">SEO Analysis</h2>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 animate-pulse text-blue-600" />
            <span className="text-sm text-gray-600">Analyzing blog posts...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">SEO Analysis</h2>
          <Button onClick={runSEOAnalysis} variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">SEO Analysis Failed</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Analysis</h2>
          <p className="text-sm text-gray-600">
            Analyzed {analysis.postsAnalyzed} of {analysis.totalPosts} blog posts
          </p>
        </div>
        <Button onClick={runSEOAnalysis} variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall SEO Score</h3>
              <p className="text-sm text-gray-600">Average across all analyzed posts</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}%
              </div>
              <Progress value={analysis.overallScore} className="w-24 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{analysis.issues.critical}</p>
                <p className="text-sm text-gray-600">Critical Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{analysis.issues.warning}</p>
                <p className="text-sm text-gray-600">Warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{analysis.issues.info}</p>
                <p className="text-sm text-gray-600">Improvements</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers and Needs Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Posts with excellent SEO scores (80%+)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.topPerformers.length > 0 ? (
                analysis.topPerformers.map((item, index) => (
                  <motion.div
                    key={item.post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.post.category?.title || 'General'}
                      </p>
                    </div>
                    <Badge variant={getScoreBadgeVariant(item.score)} className="ml-2">
                      {item.score}%
                    </Badge>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No posts with 80%+ scores yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Needs Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Needs Improvement
            </CardTitle>
            <CardDescription>
              Posts with low SEO scores (&lt;70%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.needsImprovement.length > 0 ? (
                analysis.needsImprovement.map((item, index) => (
                  <motion.div
                    key={item.post._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-red-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1">
                        {item.title}
                      </h4>
                      <Badge variant={getScoreBadgeVariant(item.score)} className="ml-2">
                        {item.score}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {item.issues.slice(0, 2).map((issue, issueIndex) => (
                        <p key={issueIndex} className="text-xs text-red-700">
                          • {issue}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 text-sm font-medium">Great job!</p>
                  <p className="text-gray-500 text-sm">All posts have good SEO scores</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            SEO Recommendations
          </CardTitle>
          <CardDescription>
            Action items to improve your blog's SEO performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="p-1 bg-blue-100 rounded">
                  <BarChart3 className="w-3 h-3 text-blue-600" />
                </div>
                <p className="text-sm text-blue-900 flex-1">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOAnalysisDashboard;