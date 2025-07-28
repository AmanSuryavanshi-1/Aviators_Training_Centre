import { NextRequest, NextResponse } from 'next/server';
import { LeadProfile } from '@/lib/analytics/enhanced-lead-scoring';

// Mock database - in production, use actual database
const leadProfiles: Map<string, LeadProfile> = new Map();

export async function POST(request: NextRequest) {
  try {
    const profile: LeadProfile = await request.json();
    
    // Store lead profile
    leadProfiles.set(profile.userId, profile);
    
    // In production, save to database
    console.log('Stored lead profile:', profile.id);
    
    return NextResponse.json({
      success: true,
      profileId: profile.id,
      message: 'Lead profile stored successfully'
    });
  } catch (error) {
    console.error('Error storing lead profile:', error);
    return NextResponse.json(
      { error: 'Failed to store lead profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (userId) {
      // Get specific user profile
      const profile = leadProfiles.get(userId);
      if (!profile) {
        return NextResponse.json(
          { error: 'Lead profile not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        profile
      });
    }
    
    // Get all profiles with pagination
    const allProfiles = Array.from(leadProfiles.values());
    const paginatedProfiles = allProfiles.slice(offset, offset + limit);
    
    return NextResponse.json({
      success: true,
      profiles: paginatedProfiles,
      total: allProfiles.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching lead profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead profiles' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();
    
    const existingProfile = leadProfiles.get(userId);
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Lead profile not found' },
        { status: 404 }
      );
    }
    
    const updatedProfile: LeadProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date()
    };
    
    leadProfiles.set(userId, updatedProfile);
    
    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Lead profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating lead profile:', error);
    return NextResponse.json(
      { error: 'Failed to update lead profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = leadProfiles.delete(userId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Lead profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Lead profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lead profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead profile' },
      { status: 500 }
    );
  }
}