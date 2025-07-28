import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity/client';
import { CTATemplate, CTATemplateCreateInput, CTATemplateUpdateInput } from '@/lib/types/cta';

// GET /api/admin/cta-templates - Get all CTA templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const style = searchParams.get('style');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build GROQ query with filters
    let query = `*[_type == "ctaTemplate"`;
    const params: Record<string, any> = {};

    if (category) {
      query += ` && category == $category`;
      params.category = category;
    }

    if (active !== null) {
      query += ` && active == $active`;
      params.active = active === 'true';
    }

    if (style) {
      query += ` && style == $style`;
      params.style = style;
    }

    query += `] | order(priority desc, _createdAt desc)`;

    if (limit > 0) {
      query += `[${offset}...${offset + limit}]`;
    }

    query += `{
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
        category
      },
      targetAudience,
      keywords,
      conversionGoal,
      priority,
      abTestVariants,
      positioning,
      displayRules,
      active,
      version,
      notes
    }`;

    const templates = await client.fetch(query, params);

    // Get total count for pagination
    let countQuery = `count(*[_type == "ctaTemplate"`;
    if (category) countQuery += ` && category == $category`;
    if (active !== null) countQuery += ` && active == $active`;
    if (style) countQuery += ` && style == $style`;
    countQuery += `])`;

    const total = await client.fetch(countQuery, params);

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching CTA templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch CTA templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/cta-templates - Create new CTA template
export async function POST(request: NextRequest) {
  try {
    const body: CTATemplateCreateInput = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'category', 'ctaType', 'style', 'title', 'description', 'primaryButton', 'conversionGoal'];
    const missingFields = requiredFields.filter(field => !body[field as keyof CTATemplateCreateInput]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!body.slug) {
      body.slug = {
        current: body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };
    }

    // Set default values
    const templateData = {
      _type: 'ctaTemplate',
      ...body,
      priority: body.priority || 50,
      active: body.active !== undefined ? body.active : true,
      version: body.version || '1.0',
      positioning: body.positioning || {
        allowedPositions: ['top', 'middle', 'bottom'],
        preferredPosition: 'bottom',
      },
      displayRules: body.displayRules || {
        deviceTypes: ['desktop', 'tablet', 'mobile'],
      },
    };

    const result = await client.create(templateData);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'CTA template created successfully',
    });
  } catch (error) {
    console.error('Error creating CTA template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create CTA template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/cta-templates - Bulk update CTA templates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { updates } = body;

    if (!Array.isArray(updates)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Updates must be an array',
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { _id, ...updateData } = update;
        if (!_id) {
          errors.push({ error: 'Missing _id for update', data: update });
          continue;
        }

        const result = await client
          .patch(_id)
          .set(updateData)
          .commit();

        results.push(result);
      } catch (error) {
        errors.push({
          _id: update._id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Updated ${results.length} templates${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    });
  } catch (error) {
    console.error('Error bulk updating CTA templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bulk update CTA templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/cta-templates - Bulk delete CTA templates
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids')?.split(',') || [];

    if (ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No template IDs provided',
        },
        { status: 400 }
      );
    }

    // Check if templates are being used in any blog posts
    const usageQuery = `*[_type == "post" && count(ctaPlacements[targetCourse._ref in $ids]) > 0]{
      _id,
      title,
      slug
    }`;

    const usedInPosts = await client.fetch(usageQuery, { ids });

    if (usedInPosts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete CTA templates that are currently in use',
          usedInPosts,
        },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await client.delete(id);
        results.push({ _id: id, deleted: true });
      } catch (error) {
        errors.push({
          _id: id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
      message: `Deleted ${results.length} templates${errors.length > 0 ? `, ${errors.length} failed` : ''}`,
    });
  } catch (error) {
    console.error('Error bulk deleting CTA templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to bulk delete CTA templates',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}