import { NextRequest, NextResponse } from 'next/server';
import { PerformanceOptimizer, PerformanceMetrics } from '@/lib/analytics/performance-optimizer';
import { AdvancedContentOptimizer } from '@/lib/analytics/advanced-content-optimizer';
import { ContentOptimizationService } from '@/lib/analytics/content-optimization-service';
import { client as sanityClient } from '@/lib/sanity/client';

// Mock performance data - in production, this would come from your analytics database
const mockPerformanceData: PerformanceMetrics[] = [
  {
    postId: '1',
    title: 'Complete Guide to DGCA Exam Preparation',
    views: 2500,
    uniqueVisitors: 1800,
    averageTimeOnPage: 240,
    bounceRate: 0.35,
    socialShares: 45,
    ctaClicks: 125,
    conversions: 18,
    conversionRate: 0.072,
    seoScore: 85,
    publishedAt: '2024-01-15T10:00:00Z',
    category: 'Technical General',
    keywords: ['dgca exam', 'pilot training', 'aviation theory']
  },
  {
    postId: '2',
    title: 'Commercial Pilot License Requirements in India',
    views: 1800,
    uniqueVisitors: 1200,
    averageTimeOnPage: 180,
    bounceRate: 0.45,
    socialShares: 32,
    ctaClicks: 89,
    conversions: 12,
    conversionRate: 0.067,
    seoScore: 78,
    publishedAt: '2024-01-10T14:30:00Z',
    category: 'Career Guidance',
    keywords: ['cpl license', 'commercial pilot', 'aviation career']
  },
  {
    postId: '3',
    title: 'Understanding Aircraft Navigation Systems',
    views: 1200,
    uniqueVisitors: 900,
    averageTimeOnPage: 320,
    bounceRate: 0.28,
    socialShares: 28,
    ctaClicks: 67,
    conversions: 8,
    conversionRate: 0.067,
    seoScore: 92,
    publishedAt: '2024-01-05T09:15:00Z',
    category: 'Technical Specific',
    keywords: ['navigation systems', 'avionics', 'flight instruments']
  },
  {
    postId: '4',
    title: 'Aviation Safety Best Practices for Student Pilots',
    views: 950,
    uniqueVisitors: 720,
    averageTimeOnPage: 200,
    bounceRate: 0.52,
    socialShares: 15,
    ctaClicks: 34,
    conversions: 3,
    conversionRate: 0.032,
    seoScore: 65,
    publishedAt: '2024-01-01T16:45:00Z',
    category: 'Safety',
    keywords: ['aviation safety', 'student pilot', 'flight safety']
  },
  {
    postId: '5',
    title: 'Weather Interpretation for Pilots',
    views: 1600,
    uniqueVisitors: 1100,
    averageTimeOnPage: 280,
    bounceRate: 0.38,
    socialShares: 38,
    ctaClicks: 78,
    conversions: 11,
    conversionRate: 0.069,
    seoScore: 88,
    publishedAt: '2023-12-28T11:20:00Z',
    category: 'Technical General',
    keywords: ['weather interpretation', 'meteorology', 'flight planning']
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const postId = searchParams.get('postId');
    const timeRange = searchParams.get('timeRange') || '30d';

    const optimizer = new PerformanceOptimizer(mockPerformanceData);
    const advancedOptimizer = new AdvancedContentOptimizer();
    const contentOptimizer = new ContentOptimizationService();

    switch (action) {
      case 'suggestions':
        if (!postId) {
          return NextResponse.json({ error: 'Post ID required for suggestions' }, { status: 400 });
        }
        const suggestions = optimizer.generateOptimizationSuggestions(postId);
        return NextResponse.json({ suggestions });

      case 'advanced-report':
        if (!postId) {
          return NextResponse.json({ error: 'Post ID required for advanced report' }, { status: 400 });
        }

        // Fetch blog post from Sanity
        const blogPost = await sanityClient.fetch(
          `*[_type == "post" && _id == $postId][0] {
            _id, title, excerpt, category->, featured, seoTitle, seoDescription, focusKeyword, image, author->
          }`,
          { postId }
        );

        if (!blogPost) {
          return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        const performanceData = mockPerformanceData.find(p => p.postId === postId);
        const advancedReport = advancedOptimizer.generateAdvancedReport(blogPost, performanceData);
        
        return NextResponse.json({ report: advancedReport });

      case 'content-optimization':
        if (!postId) {
          return NextResponse.json({ error: 'Post ID required for content optimization' }, { status: 400 });
        }

        const blogPostForOptimization = await sanityClient.fetch(
          `*[_type == "post" && _id == $postId][0] {
            _id, title, excerpt, category->, featured, seoTitle, seoDescription, focusKeyword, image
          }`,
          { postId }
        );

        if (!blogPostForOptimization) {
          return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        const performanceDataForOpt = mockPerformanceData.find(p => p.postId === postId);
        const optimizationReport = contentOptimizer.generateOptimizationReport(blogPostForOptimization, performanceDataForOpt);
        const insights = contentOptimizer.generateActionableInsights(optimizationReport);
        
        return NextResponse.json({ 
          report: optimizationReport,
          insights 
        });

      case 'trending':
        const trendingTopics = optimizer.identifyTrendingTopics();
        return NextResponse.json({ trendingTopics });

      case 'content-gaps':
        const contentGaps = optimizer.analyzeContentGaps();
        return NextResponse.json({ contentGaps });

      case 'performance-analysis':
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
          default:
            startDate.setDate(endDate.getDate() - 30);
        }

        const analysis = optimizer.analyzeContentPerformance({ start: startDate, end: endDate });
        return NextResponse.json({ analysis });

      case 'predict':
        if (!postId) {
          return NextResponse.json({ error: 'Post ID required for prediction' }, { status: 400 });
        }

        // Fetch blog post from Sanity
        const blogPostForPrediction = await sanityClient.fetch(
          `*[_type == "post" && _id == $postId][0] {
            _id, title, excerpt, category->, featured, seoTitle, seoDescription, author->
          }`,
          { postId }
        );

        if (!blogPostForPrediction) {
          return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
        }

        const prediction = optimizer.predictContentPerformance(blogPostForPrediction);
        return NextResponse.json({ prediction });

      case 'bulk-optimization':
        const allPosts = await sanityClient.fetch(
          `*[_type == "post"] {
            _id, title, excerpt, category->, featured, seoTitle, seoDescription, focusKeyword
          }`
        );

        const bulkOptimization = allPosts.map((post: any) => {
          const performanceData = mockPerformanceData.find(p => p.postId === post._id);
          const report = contentOptimizer.generateOptimizationReport(post, performanceData);
          
          return {
            postId: post._id,
            title: post.title,
            overallScore: report.overallScore,
            criticalIssues: report.suggestions.filter((s: any) => s.type === 'critical').length,
            quickWins: report.keywordOpportunities.length,
            topRecommendation: report.suggestions[0]?.title || 'No recommendations'
          };
        }).sort((a: any, b: any) => a.overallScore - b.overallScore);

        return NextResponse.json({ bulkOptimization });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance optimization API error:', error);
    return NextResponse.json(
      { error: 'Failed to process optimization request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const optimizer = new PerformanceOptimizer(mockPerformanceData);
    const advancedOptimizer = new AdvancedContentOptimizer();
    const contentOptimizer = new ContentOptimizationService();

    switch (action) {
      case 'bulk-analysis':
        const { postIds } = data;
        const bulkSuggestions = postIds.map((postId: string) => ({
          postId,
          suggestions: optimizer.generateOptimizationSuggestions(postId)
        }));
        return NextResponse.json({ bulkSuggestions });

      case 'advanced-bulk-analysis':
        const { postIds: advancedPostIds } = data;
        
        const advancedBulkResults = await Promise.all(
          advancedPostIds.map(async (postId: string) => {
            const blogPost = await sanityClient.fetch(
              `*[_type == "post" && _id == $postId][0] {
                _id, title, excerpt, category->, featured, seoTitle, seoDescription, focusKeyword, image, author->
              }`,
              { postId }
            );

            if (!blogPost) return null;

            const performanceData = mockPerformanceData.find(p => p.postId === postId);
            const report = advancedOptimizer.generateAdvancedReport(blogPost, performanceData);
            
            return {
              postId,
              title: blogPost.title,
              overallScore: report.overallScore,
              criticalIssues: report.criticalIssues.length,
              quickWins: report.quickWins.length,
              estimatedImpact: report.actionPlan.expectedImpact,
              timeToComplete: report.actionPlan.estimatedTimeToComplete
            };
          })
        );

        const validResults = advancedBulkResults.filter(result => result !== null);
        return NextResponse.json({ advancedBulkResults: validResults });

      case 'custom-prediction':
        const { blogPost } = data;
        const customPrediction = optimizer.predictContentPerformance(blogPost);
        return NextResponse.json({ prediction: customPrediction });

      case 'generate-content-ideas':
        const { category, keywords } = data;
        
        // Generate content ideas based on trending topics and gaps
        const trendingTopics = optimizer.identifyTrendingTopics();
        const contentGaps = optimizer.analyzeContentGaps();
        
        const contentIdeas = [
          ...trendingTopics.slice(0, 5).map(topic => ({
            title: `Complete Guide to ${topic.topic}`,
            type: 'trending',
            opportunity: topic.opportunityScore,
            keywords: topic.suggestedKeywords,
            estimatedViews: topic.searchVolume,
            difficulty: topic.competitionLevel
          })),
          ...contentGaps.slice(0, 5).map(gap => ({
            title: `Everything You Need to Know About ${gap.topic}`,
            type: 'gap',
            opportunity: (1 - gap.competitorCoverage),
            keywords: gap.missingKeywords,
            estimatedViews: gap.searchDemand,
            difficulty: gap.difficultyScore > 0.7 ? 'high' : gap.difficultyScore > 0.4 ? 'medium' : 'low'
          }))
        ].sort((a, b) => b.opportunity - a.opportunity);

        return NextResponse.json({ contentIdeas });

      case 'optimization-roadmap':
        const { timeframe, priority } = data;
        
        // Generate optimization roadmap based on all posts
        const allPosts = await sanityClient.fetch(
          `*[_type == "post"] {
            _id, title, excerpt, category->, featured, seoTitle, seoDescription, focusKeyword
          }`
        );

        const roadmapItems = allPosts.map((post: any) => {
          const performanceData = mockPerformanceData.find(p => p.postId === post._id);
          const report = advancedOptimizer.generateAdvancedReport(post, performanceData);
          
          return {
            postId: post._id,
            title: post.title,
            overallScore: report.overallScore,
            priority: report.criticalIssues.length > 0 ? 'high' : 
                     report.quickWins.length > 2 ? 'medium' : 'low',
            estimatedTime: report.actionPlan.estimatedTimeToComplete,
            expectedImpact: report.actionPlan.expectedImpact,
            nextActions: report.actionPlan.immediate.slice(0, 3)
          };
        }).sort((a: any, b: any) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        });

        return NextResponse.json({ roadmap: roadmapItems });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance optimization POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to process optimization request' },
      { status: 500 }
    );
  }
}