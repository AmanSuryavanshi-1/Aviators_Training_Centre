import { NextRequest, NextResponse } from 'next/server';
import { createRealGA4Client } from '@/lib/analytics/RealGA4Client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching real user journeys data...');
    
    const url = new URL(request.url);
    const timeframe = url.searchParams.get('timeframe') || 'week';
    
    // Set date range based on timeframe
    let startDate = '7daysAgo';
    let endDate = 'today';
    
    switch (timeframe) {
      case 'day':
        startDate = 'yesterday';
        endDate = 'today';
        break;
      case 'week':
        startDate = '7daysAgo';
        endDate = 'today';
        break;
      case 'month':
        startDate = '30daysAgo';
        endDate = 'today';
        break;
      case 'quarter':
        startDate = '90daysAgo';
        endDate = 'today';
        break;
      case 'year':
        startDate = '365daysAgo';
        endDate = 'today';
        break;
    }

    console.log(`📅 Fetching user journeys for ${timeframe}: ${startDate} to ${endDate}`);

    // Fetch real data from GA4
    const realGA4Client = createRealGA4Client();
    const realData = await realGA4Client.getHistoricalData(startDate, endDate);
    
    console.log(`📊 Real user journey data: ${realData.userJourney.landingPages.length} landing pages, ${realData.userJourney.exitPages.length} exit pages`);

    const userJourneysData = {
      // Overall journey metrics
      totalSessions: realData.sessions,
      totalUsers: realData.activeUsers,
      totalPageviews: realData.pageviews,
      avgPagesPerSession: realData.sessions > 0 ? Math.round((realData.pageviews / realData.sessions) * 100) / 100 : 0,
      avgSessionDuration: realData.engagementRate > 0 ? Math.round(realData.engagementRate * 60) : 0, // Convert to seconds
      bounceRate: realData.bounceRate,
      
      // Entry points (Landing pages)
      entryPoints: {
        summary: {
          totalLandingPages: realData.userJourney.landingPages.length,
          totalEntrySessions: realData.userJourney.landingPages.reduce((sum, page) => sum + page.sessions, 0),
          avgBounceRate: realData.userJourney.landingPages.length > 0 
            ? realData.userJourney.landingPages.reduce((sum, page) => sum + page.bounceRate, 0) / realData.userJourney.landingPages.length 
            : 0
        },
        topLandingPages: realData.userJourney.landingPages.slice(0, 10).map(page => ({
          ...page,
          percentage: realData.sessions > 0 ? Math.round((page.sessions / realData.sessions) * 100) : 0,
          conversionRate: 100 - page.bounceRate // Simplified conversion rate
        }))
      },
      
      // Exit points
      exitPoints: {
        summary: {
          totalExitPages: realData.userJourney.exitPages.length,
          totalExits: realData.userJourney.exitPages.reduce((sum, page) => sum + page.exits, 0),
          avgExitRate: realData.userJourney.exitPages.length > 0 
            ? realData.userJourney.exitPages.reduce((sum, page) => sum + page.exitRate, 0) / realData.userJourney.exitPages.length 
            : 0
        },
        topExitPages: realData.userJourney.exitPages.slice(0, 10).map(page => ({
          ...page,
          percentage: realData.pageviews > 0 ? Math.round((page.exits / realData.pageviews) * 100) : 0
        }))
      },
      
      // Page performance
      pagePerformance: realData.topPages.slice(0, 15).map(page => ({
        ...page,
        percentage: realData.pageviews > 0 ? Math.round((page.views / realData.pageviews) * 100) : 0,
        // Find if this page is a landing page
        isLandingPage: realData.userJourney.landingPages.some(landing => landing.page === page.path),
        // Find if this page is an exit page
        isExitPage: realData.userJourney.exitPages.some(exit => exit.page === page.path),
        // Get bounce rate if it's a landing page
        bounceRate: realData.userJourney.landingPages.find(landing => landing.page === page.path)?.bounceRate || 0,
        // Get exit rate if it's an exit page
        exitRate: realData.userJourney.exitPages.find(exit => exit.page === page.path)?.exitRate || 0
      })),
      
      // User flow patterns (simplified analysis)
      userFlowPatterns: {
        // Most common entry-to-exit paths (simplified)
        commonPaths: realData.userJourney.landingPages.slice(0, 5).map(landing => {
          const matchingExit = realData.userJourney.exitPages.find(exit => 
            exit.page === landing.page
          );
          return {
            entryPage: landing.page,
            exitPage: matchingExit?.page || 'Various pages',
            sessions: landing.sessions,
            bounceRate: landing.bounceRate,
            exitRate: matchingExit?.exitRate || 0
          };
        }),
        
        // Content categories performance
        contentCategories: {
          blog: {
            pages: realData.topPages.filter(page => page.path.includes('/blog')),
            totalViews: realData.topPages.filter(page => page.path.includes('/blog')).reduce((sum, page) => sum + page.views, 0)
          },
          courses: {
            pages: realData.topPages.filter(page => page.path.includes('/course')),
            totalViews: realData.topPages.filter(page => page.path.includes('/course')).reduce((sum, page) => sum + page.views, 0)
          },
          home: {
            pages: realData.topPages.filter(page => page.path === '/' || page.path === '/home'),
            totalViews: realData.topPages.filter(page => page.path === '/' || page.path === '/home').reduce((sum, page) => sum + page.views, 0)
          },
          other: {
            pages: realData.topPages.filter(page => !page.path.includes('/blog') && !page.path.includes('/course') && page.path !== '/' && page.path !== '/home'),
            totalViews: realData.topPages.filter(page => !page.path.includes('/blog') && !page.path.includes('/course') && page.path !== '/' && page.path !== '/home').reduce((sum, page) => sum + page.views, 0)
          }
        }
      },
      
      // Engagement metrics by page type
      engagementByPageType: {
        landingPages: {
          avgBounceRate: realData.userJourney.landingPages.length > 0 
            ? realData.userJourney.landingPages.reduce((sum, page) => sum + page.bounceRate, 0) / realData.userJourney.landingPages.length 
            : 0,
          totalSessions: realData.userJourney.landingPages.reduce((sum, page) => sum + page.sessions, 0)
        },
        exitPages: {
          avgExitRate: realData.userJourney.exitPages.length > 0 
            ? realData.userJourney.exitPages.reduce((sum, page) => sum + page.exitRate, 0) / realData.userJourney.exitPages.length 
            : 0,
          totalExits: realData.userJourney.exitPages.reduce((sum, page) => sum + page.exits, 0)
        },
        allPages: {
          avgEngagementRate: realData.engagementRate,
          totalPageviews: realData.pageviews
        }
      }
    };

    return NextResponse.json({
      success: true,
      data: userJourneysData,
      timeframe,
      dateRange: { startDate, endDate },
      lastUpdated: new Date().toISOString(),
      metadata: {
        dataSource: 'real',
        hasRealData: true,
        message: `Showing real user journeys: ${realData.userJourney.landingPages.length} landing pages, ${realData.userJourney.exitPages.length} exit pages`,
        rawMetrics: {
          sessions: realData.sessions,
          activeUsers: realData.activeUsers,
          pageviews: realData.pageviews,
          bounceRate: realData.bounceRate,
          engagementRate: realData.engagementRate,
          landingPagesCount: realData.userJourney.landingPages.length,
          exitPagesCount: realData.userJourney.exitPages.length
        }
      }
    });

  } catch (error) {
    console.error('❌ User journeys API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch real user journeys data',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}