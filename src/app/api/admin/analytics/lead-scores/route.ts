import { NextRequest, NextResponse } from 'next/server';
import { LeadScore } from '@/lib/analytics/enhanced-lead-scoring';

// Mock database - in production, use actual database
const leadScores: Map<string, LeadScore[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const { userId, score }: { userId: string; score: LeadScore } = await request.json();
    
    // Get existing scores for user
    const existingScores = leadScores.get(userId) || [];
    
    // Add new score
    existingScores.push(score);
    
    // Keep only last 50 scores per user
    if (existingScores.length > 50) {
      existingScores.splice(0, existingScores.length - 50);
    }
    
    leadScores.set(userId, existingScores);
    
    console.log(`Stored lead score for user ${userId}:`, score.totalScore);
    
    return NextResponse.json({
      success: true,
      userId,
      scoreId: `score_${Date.now()}`,
      message: 'Lead score stored successfully'
    });
  } catch (error) {
    console.error('Error storing lead score:', error);
    return NextResponse.json(
      { error: 'Failed to store lead score' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dateRange = searchParams.get('dateRange');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (userId) {
      // Get scores for specific user
      const userScores = leadScores.get(userId) || [];
      
      let filteredScores = userScores;
      
      // Apply date filter if provided
      if (dateRange) {
        const now = new Date();
        let startDate: Date;
        
        switch (dateRange) {
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case '90d':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        filteredScores = userScores.filter(score => 
          new Date(score.scoredAt) >= startDate
        );
      }
      
      // Sort by date (newest first) and limit
      const sortedScores = filteredScores
        .sort((a, b) => new Date(b.scoredAt).getTime() - new Date(a.scoredAt).getTime())
        .slice(0, limit);
      
      return NextResponse.json({
        success: true,
        userId,
        scores: sortedScores,
        total: filteredScores.length
      });
    }
    
    // Get aggregated scoring analytics
    const allScores: LeadScore[] = [];
    for (const userScores of leadScores.values()) {
      allScores.push(...userScores);
    }
    
    // Apply date filter
    let filteredScores = allScores;
    if (dateRange) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateRange) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      filteredScores = allScores.filter(score => 
        new Date(score.scoredAt) >= startDate
      );
    }
    
    // Calculate analytics
    const totalScores = filteredScores.length;
    const averageScore = totalScores > 0 
      ? filteredScores.reduce((sum, score) => sum + score.totalScore, 0) / totalScores 
      : 0;
    
    const qualityDistribution = {
      hot: filteredScores.filter(s => s.quality === 'hot').length,
      warm: filteredScores.filter(s => s.quality === 'warm').length,
      cold: filteredScores.filter(s => s.quality === 'cold').length,
      unqualified: filteredScores.filter(s => s.quality === 'unqualified').length
    };
    
    const qualifiedCount = filteredScores.filter(s => s.qualification.isQualified).length;
    const qualificationRate = totalScores > 0 ? (qualifiedCount / totalScores) * 100 : 0;
    
    // Score distribution by ranges
    const scoreRanges = {
      '0-200': filteredScores.filter(s => s.totalScore <= 200).length,
      '201-400': filteredScores.filter(s => s.totalScore > 200 && s.totalScore <= 400).length,
      '401-600': filteredScores.filter(s => s.totalScore > 400 && s.totalScore <= 600).length,
      '601-800': filteredScores.filter(s => s.totalScore > 600 && s.totalScore <= 800).length,
      '801-1000': filteredScores.filter(s => s.totalScore > 800).length
    };
    
    // Component analysis
    const componentAnalysis = {
      demographic: {
        average: totalScores > 0 
          ? filteredScores.reduce((sum, s) => sum + s.scores.demographic, 0) / totalScores 
          : 0,
        impact: 25 // Demographic impact on overall score
      },
      behavioral: {
        average: totalScores > 0 
          ? filteredScores.reduce((sum, s) => sum + s.scores.behavioral, 0) / totalScores 
          : 0,
        impact: 35 // Behavioral impact on overall score
      },
      intent: {
        average: totalScores > 0 
          ? filteredScores.reduce((sum, s) => sum + s.scores.intent, 0) / totalScores 
          : 0,
        impact: 30 // Intent impact on overall score
      },
      engagement: {
        average: totalScores > 0 
          ? filteredScores.reduce((sum, s) => sum + s.scores.engagement, 0) / totalScores 
          : 0,
        impact: 10 // Engagement impact on overall score
      }
    };
    
    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalScores,
          averageScore,
          qualificationRate,
          qualifiedCount
        },
        qualityDistribution,
        scoreRanges,
        componentAnalysis,
        recentScores: filteredScores
          .sort((a, b) => new Date(b.scoredAt).getTime() - new Date(a.scoredAt).getTime())
          .slice(0, 20)
      }
    });
  } catch (error) {
    console.error('Error fetching lead scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead scores' },
      { status: 500 }
    );
  }
}