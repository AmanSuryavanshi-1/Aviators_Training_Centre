import { NextRequest, NextResponse } from 'next/server';
import { internalLinkingManager } from '@/lib/marketing/internal-linking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourcePage = searchParams.get('sourcePage');
    const status = searchParams.get('status');
    
    // Generate linking strategies
    const linkingStrategies = internalLinkingManager.generateLinkingStrategy();
    
    // Get linking analytics
    const analytics = internalLinkingManager.getLinkingAnalytics();
    
    // Generate link components for implementation
    const linkComponents = internalLinkingManager.generateLinkComponents();
    
    // Filter strategies if sourcePage is specified
    const filteredStrategies = sourcePage 
      ? linkingStrategies.filter(strategy => strategy.sourcePage === sourcePage)
      : linkingStrategies;

    // Mock additional data for comprehensive response
    const implementationGuide = {
      homePageLinks: [
        {
          location: 'Hero Section',
          component: 'HomePage_HeroSection',
          description: 'Add CTA button linking to pilot salary guide',
          priority: 'high',
          estimatedImpact: 'High traffic, high conversion potential',
        },
        {
          location: 'Why Choose Us Section',
          component: 'HomePage_WhyChooseUs',
          description: 'Contextual link to DGCA CPL guide within content',
          priority: 'medium',
          estimatedImpact: 'Medium traffic, educational value',
        },
      ],
      coursesPageLinks: [
        {
          location: 'CPL Training Section',
          component: 'CoursesPage_CPLSection',
          description: 'Resource box with link to complete CPL guide',
          priority: 'high',
          estimatedImpact: 'High relevance, strong conversion potential',
        },
        {
          location: 'Type Rating Section',
          component: 'CoursesPage_TypeRatingSection',
          description: 'Career impact analysis link for type rating decision',
          priority: 'high',
          estimatedImpact: 'High value for decision-making users',
        },
      ],
      aboutPageLinks: [
        {
          location: 'Success Stories Section',
          component: 'AboutPage_SuccessStories',
          description: 'Interview preparation guide for credibility',
          priority: 'medium',
          estimatedImpact: 'Medium traffic, builds trust',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: {
        strategies: filteredStrategies,
        analytics,
        linkComponents,
        implementationGuide,
        summary: {
          totalStrategies: linkingStrategies.length,
          totalLinks: analytics.totalLinks,
          activeLinks: analytics.activeLinks,
          averageCTR: analytics.averageCTR,
          expectedTrafficIncrease: linkingStrategies.reduce(
            (sum, strategy) => sum + strategy.expectedImpact.trafficIncrease, 0
          ),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching internal linking data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internal linking data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourcePage, targetBlogPost, anchorText, linkType, position, priority } = body;

    // Validate required fields
    if (!sourcePage || !targetBlogPost || !anchorText || !linkType || !position) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new internal link
    const newLink = {
      id: `internal_link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourcePage,
      sourceSection: 'Custom Section',
      targetBlogPost,
      anchorText,
      linkType,
      position,
      priority: priority || 'medium',
      status: 'active',
      metrics: {
        clicks: 0,
        impressions: 0,
        ctr: 0,
      },
    };

    // Generate implementation code for the new link
    const implementationCode = generateLinkImplementationCode(newLink);

    return NextResponse.json({
      success: true,
      data: {
        link: newLink,
        implementationCode,
        recommendations: [
          'Test the link placement with A/B testing',
          'Monitor click-through rates and adjust anchor text if needed',
          'Ensure the link adds value to the user experience',
          'Consider the link context and user intent',
        ],
      },
    });
  } catch (error) {
    console.error('Error creating internal link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create internal link' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkId, metrics } = body;

    if (!linkId || !metrics) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update link metrics
    internalLinkingManager.updateLinkMetrics(linkId, metrics);

    // Get updated analytics
    const updatedAnalytics = internalLinkingManager.getLinkingAnalytics();

    return NextResponse.json({
      success: true,
      data: {
        message: 'Link metrics updated successfully',
        analytics: updatedAnalytics,
      },
    });
  } catch (error) {
    console.error('Error updating link metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update link metrics' },
      { status: 500 }
    );
  }
}

function generateLinkImplementationCode(link: any): string {
  const blogUrl = `/blog/${link.targetBlogPost}`;
  
  switch (link.linkType) {
    case 'contextual':
      return `
<p className="text-muted-foreground">
  Your content here. 
  <Link 
    href="${blogUrl}"
    className="text-teal-600 hover:text-teal-700 underline font-medium ml-1"
  >
    ${link.anchorText}
  </Link> 
  and continue your content.
</p>`;

    case 'cta':
      return `
<div className="mt-8 text-center">
  <Link 
    href="${blogUrl}"
    className="inline-flex items-center px-6 py-3 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors duration-200"
  >
    <TrendingUp className="w-4 h-4 mr-2" />
    ${link.anchorText}
    <ArrowRight className="w-4 h-4 ml-2" />
  </Link>
</div>`;

    case 'resource':
      return `
<div className="mt-4 p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
  <h4 className="font-semibold text-teal-800 mb-2">📚 Additional Resource</h4>
  <p className="text-sm text-teal-700 mb-3">
    Get detailed insights and comprehensive guidance.
  </p>
  <Link 
    href="${blogUrl}"
    className="inline-flex items-center text-sm font-medium text-teal-600 hover:text-teal-700"
  >
    ${link.anchorText}
    <ExternalLink className="w-3 h-3 ml-1" />
  </Link>
</div>`;

    default:
      return `
<Link 
  href="${blogUrl}"
  className="text-teal-600 hover:text-teal-700 underline"
>
  ${link.anchorText}
</Link>`;
  }
}