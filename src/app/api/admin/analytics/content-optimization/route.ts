import { NextRequest, NextResponse } from 'next/server';
import { ContentOptimizationService } from '@/lib/analytics/content-optimization-service';
import { client as sanityClient } from '@/lib/sanity/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const action = searchParams.get('action') || 'report';

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Fetch blog post from Sanity
    const blogPost = await sanityClient.fetch(
      `*[_type == "post" && _id == $postId][0] {
        _id,
        title,
        slug,
        excerpt,
        body,
        image,
        category->,
        author->,
        publishedAt,
        featured,
        seoTitle,
        seoDescription,
        focusKeyword,
        tags
      }`,
      { postId }
    );

    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    const optimizationService = new ContentOptimizationService();

    switch (action) {
      case 'report':
        const report = optimizationService.generateOptimizationReport(blogPost);
        const insights = optimizationService.generateActionableInsights(report);
        
        return NextResponse.json({
          report,
          insights,
          timestamp: new Date().toISOString()
        });

      case 'quick-analysis':
        // Quick analysis with just suggestions and score
        const quickReport = optimizationService.generateOptimizationReport(blogPost);
        
        return NextResponse.json({
          postId: blogPost._id,
          title: blogPost.title,
          overallScore: quickReport.overallScore,
          criticalIssues: quickReport.suggestions.filter(s => s.type === 'critical').length,
          totalSuggestions: quickReport.suggestions.length,
          topSuggestions: quickReport.suggestions.slice(0, 3),
          keywordOpportunities: quickReport.keywordOpportunities.slice(0, 5)
        });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Content optimization API error:', error);
    return NextResponse.json(
      { error: 'Failed to process content optimization request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const optimizationService = new ContentOptimizationService();

    switch (action) {
      case 'bulk-optimization':
        const { postIds } = data;
        
        if (!Array.isArray(postIds) || postIds.length === 0) {
          return NextResponse.json({ error: 'Post IDs array is required' }, { status: 400 });
        }

        // Fetch multiple blog posts
        const blogPosts = await sanityClient.fetch(
          `*[_type == "post" && _id in $postIds] {
            _id,
            title,
            slug,
            excerpt,
            image,
            category->,
            publishedAt,
            featured,
            seoTitle,
            seoDescription,
            focusKeyword
          }`,
          { postIds }
        );

        // Generate optimization reports for all posts
        const bulkReports = blogPosts.map(post => {
          const report = optimizationService.generateOptimizationReport(post);
          return {
            postId: post._id,
            title: post.title,
            overallScore: report.overallScore,
            criticalIssues: report.suggestions.filter(s => s.type === 'critical').length,
            totalSuggestions: report.suggestions.length,
            topSuggestion: report.suggestions[0] || null,
            keywordOpportunities: report.keywordOpportunities.slice(0, 3)
          };
        });

        // Sort by score (lowest first - needs most attention)
        bulkReports.sort((a, b) => a.overallScore - b.overallScore);

        return NextResponse.json({
          reports: bulkReports,
          summary: {
            totalPosts: bulkReports.length,
            averageScore: bulkReports.reduce((sum, r) => sum + r.overallScore, 0) / bulkReports.length,
            postsNeedingAttention: bulkReports.filter(r => r.overallScore < 70).length,
            totalCriticalIssues: bulkReports.reduce((sum, r) => sum + r.criticalIssues, 0)
          },
          timestamp: new Date().toISOString()
        });

      case 'compare-posts':
        const { postId1, postId2 } = data;
        
        if (!postId1 || !postId2) {
          return NextResponse.json({ error: 'Two post IDs are required for comparison' }, { status: 400 });
        }

        // Fetch both posts
        const [post1, post2] = await Promise.all([
          sanityClient.fetch(
            `*[_type == "post" && _id == $postId][0] {
              _id, title, excerpt, image, category->, seoTitle, seoDescription, focusKeyword
            }`,
            { postId: postId1 }
          ),
          sanityClient.fetch(
            `*[_type == "post" && _id == $postId][0] {
              _id, title, excerpt, image, category->, seoTitle, seoDescription, focusKeyword
            }`,
            { postId: postId2 }
          )
        ]);

        if (!post1 || !post2) {
          return NextResponse.json({ error: 'One or both posts not found' }, { status: 404 });
        }

        // Generate reports for both posts
        const report1 = optimizationService.generateOptimizationReport(post1);
        const report2 = optimizationService.generateOptimizationReport(post2);

        const comparison = {
          post1: {
            id: post1._id,
            title: post1.title,
            score: report1.overallScore,
            suggestions: report1.suggestions.length,
            keywordOpportunities: report1.keywordOpportunities.length
          },
          post2: {
            id: post2._id,
            title: post2.title,
            score: report2.overallScore,
            suggestions: report2.suggestions.length,
            keywordOpportunities: report2.keywordOpportunities.length
          },
          winner: report1.overallScore > report2.overallScore ? 'post1' : 'post2',
          scoreDifference: Math.abs(report1.overallScore - report2.overallScore),
          insights: [
            report1.overallScore > report2.overallScore 
              ? `${post1.title} performs better overall`
              : `${post2.title} performs better overall`,
            `Score difference: ${Math.abs(report1.overallScore - report2.overallScore)} points`,
            report1.suggestions.length < report2.suggestions.length
              ? `${post1.title} needs fewer optimizations`
              : `${post2.title} needs fewer optimizations`
          ]
        };

        return NextResponse.json({ comparison });

      default:
        return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Content optimization POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to process content optimization request' },
      { status: 500 }
    );
  }
}
