import { NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

export async function GET() {
  try {
    // Fetch all image assets from Sanity
    const images = await enhancedClient.fetch(`
      *[_type == "sanity.imageAsset"] | order(_createdAt desc) {
        _id,
        url,
        originalFilename,
        size,
        mimeType,
        "uploadedAt": _createdAt,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
    `);

    return NextResponse.json({
      images: images || [],
      count: images?.length || 0
    });

  } catch (error) {
    console.error('Error fetching Sanity images:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions to read images from Sanity',
            details: 'Your API token needs read permissions for image assets'
          },
          { status: 403 }
        );
      }
      
      if (error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { 
            error: 'Unauthorized access to Sanity',
            details: 'Please check your SANITY_API_TOKEN environment variable'
          },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch images from Sanity',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}