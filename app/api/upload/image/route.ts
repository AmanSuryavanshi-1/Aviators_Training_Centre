import { NextRequest, NextResponse } from 'next/server';
import { enhancedClient } from '@/lib/sanity/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Check if we have the necessary token for image uploads
    if (!process.env.SANITY_API_TOKEN) {
      return NextResponse.json(
        { error: 'Image upload not configured (missing API token)' },
        { status: 500 }
      );
    }

    try {
      // Convert File to Buffer
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      
      // Upload image to Sanity with retry logic
      let uploadAttempts = 0;
      const maxAttempts = 3;
      let uploadedImage = null;
      
      while (uploadAttempts < maxAttempts && !uploadedImage) {
        try {
          uploadAttempts++;
          uploadedImage = await enhancedClient.client.assets.upload('image', buffer, {
            filename: imageFile.name,
            contentType: imageFile.type,
          });
        } catch (uploadError) {
          console.error(`Image upload attempt ${uploadAttempts} failed:`, uploadError);
          if (uploadAttempts >= maxAttempts) throw uploadError;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
        }
      }

      if (!uploadedImage) {
        throw new Error('Failed to upload image after multiple attempts');
      }

      return NextResponse.json({
        message: 'Image uploaded successfully',
        assetId: uploadedImage._id,
        url: uploadedImage.url,
        filename: imageFile.name,
        size: imageFile.size,
        type: imageFile.type
      });

    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      
      if (uploadError instanceof Error) {
        if (uploadError.message.includes('Insufficient permissions')) {
          return NextResponse.json(
            { 
              error: 'Sanity API token lacks upload permissions',
              details: 'Your API token needs Editor permissions to upload images'
            },
            { status: 403 }
          );
        }
        
        if (uploadError.message.includes('Unauthorized')) {
          return NextResponse.json(
            { 
              error: 'Sanity API token is invalid or expired',
              details: 'Please check your SANITY_API_TOKEN environment variable'
            },
            { status: 401 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to upload image to Sanity' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing image upload:', error);
    return NextResponse.json(
      { error: 'Failed to process image upload' },
      { status: 500 }
    );
  }
}