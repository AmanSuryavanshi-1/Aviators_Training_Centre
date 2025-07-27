import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';
import { CTATemplateUpdateInput } from '@/lib/types/cta';

// GET /api/admin/cta-templates/[id] - Get single CTA template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const query = `*[_type == "ctaTemplate" && _id == $id][0]{
      _id,
      _type,
      _createdAt,
      _updatedAt,
      name,
      slug,
      category,
      ctaType,
      style,
      title,
      description,
      primaryButton,
      secondaryButton,
      urgencyElements,
      targetCourse->{
        _id,
        name,
        slug,
        category,
        description,
        shortDescription,
        targetUrl,
        keywords,
        ctaSettings,
        active
      },
      targetAudience,
      keywords,
      conversionGoal,
      priority,
      abTestVariants,
      positioning,
      displayRules,
      customCSS,
      active,
      version,
      notes
    }`;

    const template = await client.fetch(query, { id });

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'CTA template not found',
        },
        { status: 404 }
      );
    }

    // Get performance data for this template
    const performanceQuery = `*[_type == "ctaPerformance" && ctaTemplate._ref == $id] | order(dateRange.endDate desc)[0...5]{
      _id,
      position,
      variant,
      dateRange,
      impressions,
      clicks,
      conversions,
      revenue,
      metrics,
      blogPost->{
        _id,
        title,
        slug
      }
    }`;

    const performanceData = await client.fetch(performanceQuery, { id });

    return NextResponse.json({
      success: true,
      data: {
        ...template,
        performanceHistory: performanceData,
      },
    });
  } catch (error) {
    console.error('Error fetching CTA template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch CTA template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cta-templates/[id] - Update CTA template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: CTATemplateUpdateInput = await request.json();

    // Remove fields that shouldn't be updated directly
    const { _id, _type, _createdAt, ...updateData } = body as any;

    // Update the template
    const result = await client
      .patch(id)
      .set({
        ...updateData,
        _updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({
      success: true,
      data: result,
      message: 'CTA template updated successfully',
    });
  } catch (error) {
    console.error('Error updating CTA template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update CTA template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cta-templates/[id] - Delete CTA template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if template is being used in any blog posts
    const usageQuery = `*[_type == "post" && count(ctaPlacements[targetCourse._ref == $id]) > 0]{
      _id,
      title,
      slug
    }`;

    const usedInPosts = await client.fetch(usageQuery, { id });

    if (usedInPosts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete CTA template that is currently in use',
          usedInPosts,
        },
        { status: 400 }
      );
    }

    // Delete associated performance data first
    const performanceQuery = `*[_type == "ctaPerformance" && ctaTemplate._ref == $id]._id`;
    const performanceIds = await client.fetch(performanceQuery, { id });

    if (performanceIds.length > 0) {
      await Promise.all(performanceIds.map((perfId: string) => client.delete(perfId)));
    }

    // Delete the template
    await client.delete(id);

    return NextResponse.json({
      success: true,
      message: 'CTA template deleted successfully',
      deletedPerformanceRecords: performanceIds.length,
    });
  } catch (error) {
    console.error('Error deleting CTA template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete CTA template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/cta-templates/[id] - Partial update CTA template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Handle specific patch operations
    const { operation, ...data } = body;

    let patchOperation;

    switch (operation) {
      case 'toggle-active':
        patchOperation = client.patch(id).set({ active: data.active });
        break;
      
      case 'update-priority':
        patchOperation = client.patch(id).set({ priority: data.priority });
        break;
      
      case 'add-variant':
        patchOperation = client.patch(id).setIfMissing({ abTestVariants: [] }).append('abTestVariants', [data.variant]);
        break;
      
      case 'remove-variant':
        patchOperation = client.patch(id).unset([`abTestVariants[name == "${data.variantName}"]`]);
        break;
      
      case 'update-positioning':
        patchOperation = client.patch(id).set({ positioning: data.positioning });
        break;
      
      case 'update-display-rules':
        patchOperation = client.patch(id).set({ displayRules: data.displayRules });
        break;
      
      default:
        // General patch operation
        patchOperation = client.patch(id).set(data);
    }

    const result = await patchOperation.commit();

    return NextResponse.json({
      success: true,
      data: result,
      message: `CTA template ${operation || 'updated'} successfully`,
    });
  } catch (error) {
    console.error('Error patching CTA template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to patch CTA template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}