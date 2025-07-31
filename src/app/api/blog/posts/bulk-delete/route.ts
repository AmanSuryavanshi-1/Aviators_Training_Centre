import { NextRequest, NextResponse } from 'next/server';
import { blogDeletionService } from '@/lib/blog/blog-deletion-service';

/**
 * POST /api/blog/posts/bulk-delete
 * Delete multiple blog posts by their IDs or slugs
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `bulk_del_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  
  try {
    const body = await request.json();
    const { identifiers, options = {} } = body;

    console.log(`🗑️ Bulk DELETE request started (Request ID: ${requestId}):`, {
      count: identifiers?.length,
      options
    });

    // Validate request body
    if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Array of post identifiers (IDs or slugs) is required',
            code: 'INVALID_IDENTIFIERS',
            suggestedAction: 'Provide an array of valid post IDs or slugs'
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          }
        },
        { status: 400 }
      );
    }

    // Validate identifiers
    const validIdentifiers = identifiers.filter(id => 
      id && typeof id === 'string' && id.trim().length > 0
    );

    if (validIdentifiers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'No valid identifiers provided',
            code: 'NO_VALID_IDENTIFIERS',
            suggestedAction: 'Ensure all identifiers are non-empty strings'
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime
          }
        },
        { status: 400 }
      );
    }

    // Limit bulk operations to prevent abuse
    const maxBulkSize = 50;
    if (validIdentifiers.length > maxBulkSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `Bulk deletion limited to ${maxBulkSize} posts at once`,
            code: 'BULK_LIMIT_EXCEEDED',
            suggestedAction: `Split your request into smaller batches of ${maxBulkSize} or fewer posts`
          },
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
            duration: Date.now() - startTime,
            requestedCount: validIdentifiers.length,
            maxAllowed: maxBulkSize
          }
        },
        { status: 400 }
      );
    }

    // Perform bulk deletion
    const bulkResult = await blogDeletionService.bulkDeletePosts(validIdentifiers, {
      retryAttempts: options.retryAttempts || 2,
      retryDelay: options.retryDelay || 1000,
      skipCacheInvalidation: options.skipCacheInvalidation || false,
      validateBeforeDelete: options.validateBeforeDelete ?? true,
      continueOnError: options.continueOnError ?? true,
      maxConcurrent: options.maxConcurrent || 3
    });

    const duration = Date.now() - startTime;

    // Log results
    console.log(`Bulk deletion completed (Request ID: ${requestId}):`, {
      totalRequested: bulkResult.totalRequested,
      successCount: bulkResult.successCount,
      failureCount: bulkResult.failureCount,
      duration
    });

    // Determine response status
    let statusCode = 200;
    if (bulkResult.failureCount > 0) {
      if (bulkResult.successCount === 0) {
        statusCode = 500; // All failed
      } else {
        statusCode = 207; // Multi-status (partial success)
      }
    }

    // Prepare detailed results
    const detailedResults = bulkResult.results.map(result => ({
      success: result.success,
      postId: result.postId,
      slug: result.slug,
      title: result.title,
      error: result.error ? {
        code: result.error.code,
        message: result.error.message,
        category: result.error.category,
        retryable: result.error.retryable,
        suggestedAction: result.error.suggestedAction
      } : undefined,
      cacheInvalidated: result.cacheInvalidated,
      retryCount: result.retryCount,
      validationPassed: result.validationPassed
    }));

    // Group errors by category for summary
    const errorSummary: Record<string, number> = {};
    bulkResult.results.forEach(result => {
      if (!result.success && result.error) {
        errorSummary[result.error.category] = (errorSummary[result.error.category] || 0) + 1;
      }
    });

    return NextResponse.json(
      {
        success: bulkResult.success,
        data: {
          summary: {
            totalRequested: bulkResult.totalRequested,
            successCount: bulkResult.successCount,
            failureCount: bulkResult.failureCount,
            successRate: Math.round((bulkResult.successCount / bulkResult.totalRequested) * 100),
            errorSummary
          },
          results: detailedResults
        },
        meta: {
          requestId,
          timestamp: bulkResult.timestamp,
          duration,
          batchProcessing: true
        }
      },
      { status: statusCode }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Unexpected error in bulk deletion:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      duration
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error occurred during bulk deletion',
          code: 'BULK_DELETE_INTERNAL_ERROR',
          category: 'server',
          retryable: true,
          suggestedAction: 'Try again in a few moments or contact support if the issue persists'
        },
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/blog/posts/bulk-delete
 * Get information about bulk deletion capabilities and limits
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      maxBulkSize: 50,
      defaultConcurrency: 3,
      maxConcurrency: 10,
      supportedIdentifierTypes: ['id', 'slug'],
      supportedOptions: [
        'retryAttempts',
        'retryDelay', 
        'skipCacheInvalidation',
        'validateBeforeDelete',
        'continueOnError',
        'maxConcurrent'
      ],
      rateLimit: {
        requests: 10,
        window: '1 minute',
        description: 'Maximum 10 bulk deletion requests per minute'
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      endpoint: '/api/blog/posts/bulk-delete'
    }
  });
}
