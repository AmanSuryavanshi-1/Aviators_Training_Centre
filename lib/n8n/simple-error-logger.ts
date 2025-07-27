import { enhancedClient } from '@/lib/sanity/client';

// Simple error log interface
export interface AutomationErrorLog {
  _id?: string;
  _type: 'automationErrorLog';
  error: string;
  context: string;
  timestamp: string;
  stack?: string;
  metadata?: Record<string, any>;
  resolved?: boolean;
}

/**
 * Simple function to log automation errors to Sanity
 */
export async function logAutomationError(
  error: Error | string,
  context: string,
  metadata?: Record<string, any>
): Promise<string | undefined> {
  try {
    const errorLog: AutomationErrorLog = {
      _type: 'automationErrorLog',
      error: error instanceof Error ? error.message : error,
      context,
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined,
      metadata,
      resolved: false
    };

    // Create error log in Sanity
    const result = await enhancedClient.create(errorLog);
    console.error(`N8N Automation Error (${context}):`, error);
    return result._id;
  } catch (logError) {
    // If we can't log to Sanity, at least log to console
    console.error('Failed to log automation error to Sanity:', logError);
    console.error('Original error:', error);
    return undefined;
  }
}

/**
 * Get recent automation errors
 */
export async function getRecentErrors(
  limit: number = 50,
  includeResolved: boolean = false
): Promise<AutomationErrorLog[]> {
  try {
    const query = includeResolved
      ? '*[_type == "automationErrorLog"] | order(timestamp desc)[0...${limit}]'
      : '*[_type == "automationErrorLog" && (resolved != true)] | order(timestamp desc)[0...${limit}]';
    
    return await enhancedClient.fetch(query, { limit });
  } catch (error) {
    console.error('Failed to fetch automation errors:', error);
    return [];
  }
}

/**
 * Mark an error as resolved
 */
export async function resolveError(errorId: string): Promise<boolean> {
  try {
    await enhancedClient
      .patch(errorId)
      .set({ resolved: true })
      .commit();
    return true;
  } catch (error) {
    console.error('Failed to resolve error:', error);
    return false;
  }
}

/**
 * Delete old resolved errors (cleanup function)
 */
export async function cleanupOldErrors(olderThanDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const oldErrors = await enhancedClient.fetch(
      '*[_type == "automationErrorLog" && resolved == true && timestamp < $cutoffDate]._id',
      { cutoffDate: cutoffDate.toISOString() }
    );
    
    if (oldErrors.length === 0) {
      return 0;
    }
    
    // Delete in batches to avoid overwhelming the API
    const batchSize = 10;
    let deletedCount = 0;
    
    for (let i = 0; i < oldErrors.length; i += batchSize) {
      const batch = oldErrors.slice(i, i + batchSize);
      await Promise.all(batch.map(id => enhancedClient.delete(id)));
      deletedCount += batch.length;
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup old errors:', error);
    return 0;
  }
}