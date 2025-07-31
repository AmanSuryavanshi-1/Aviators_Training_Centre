import { NextRequest, NextResponse } from 'next/server';
import { LeadWorkflowExecution } from '@/lib/workflows/lead-qualification-routing';

// Mock database - in production, use actual database
const workflowExecutions: Map<string, LeadWorkflowExecution> = new Map();

export async function POST(request: NextRequest) {
  try {
    const execution: LeadWorkflowExecution = await request.json();
    
    // Store workflow execution
    workflowExecutions.set(execution.id, execution);
    
    console.log(`Stored workflow execution: ${execution.id} for rule: ${execution.ruleName}`);
    
    return NextResponse.json({
      success: true,
      executionId: execution.id,
      message: 'Workflow execution stored successfully'
    });
  } catch (error) {
    console.error('Error storing workflow execution:', error);
    return NextResponse.json(
      { error: 'Failed to store workflow execution' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');
    const userId = searchParams.get('userId');
    const ruleId = searchParams.get('ruleId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    if (executionId) {
      // Get specific execution
      const execution = workflowExecutions.get(executionId);
      if (!execution) {
        return NextResponse.json(
          { error: 'Workflow execution not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        execution
      });
    }
    
    // Get filtered executions
    let filteredExecutions = Array.from(workflowExecutions.values());
    
    if (userId) {
      filteredExecutions = filteredExecutions.filter(exec => exec.userId === userId);
    }
    
    if (ruleId) {
      filteredExecutions = filteredExecutions.filter(exec => exec.ruleId === ruleId);
    }
    
    if (status) {
      filteredExecutions = filteredExecutions.filter(exec => exec.status === status);
    }
    
    // Sort by start date (newest first)
    filteredExecutions.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    
    // Apply pagination
    const paginatedExecutions = filteredExecutions.slice(offset, offset + limit);
    
    // Calculate analytics
    const totalExecutions = filteredExecutions.length;
    const completedExecutions = filteredExecutions.filter(exec => exec.status === 'completed').length;
    const failedExecutions = filteredExecutions.filter(exec => exec.status === 'failed').length;
    const successRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;
    
    // Rule performance analytics
    const rulePerformance = new Map<string, {
      executions: number;
      successes: number;
      failures: number;
      averageExecutionTime: number;
    }>();
    
    filteredExecutions.forEach(exec => {
      const existing = rulePerformance.get(exec.ruleId) || {
        executions: 0,
        successes: 0,
        failures: 0,
        averageExecutionTime: 0
      };
      
      existing.executions++;
      if (exec.status === 'completed') existing.successes++;
      if (exec.status === 'failed') existing.failures++;
      
      if (exec.completedAt) {
        const executionTime = new Date(exec.completedAt).getTime() - new Date(exec.startedAt).getTime();
        existing.averageExecutionTime = (existing.averageExecutionTime * (existing.executions - 1) + executionTime) / existing.executions;
      }
      
      rulePerformance.set(exec.ruleId, existing);
    });
    
    // Convert to array for response
    const ruleAnalytics = Array.from(rulePerformance.entries()).map(([ruleId, stats]) => ({
      ruleId,
      ruleName: filteredExecutions.find(exec => exec.ruleId === ruleId)?.ruleName || 'Unknown',
      ...stats,
      successRate: stats.executions > 0 ? (stats.successes / stats.executions) * 100 : 0,
      averageExecutionTimeMinutes: stats.averageExecutionTime / (1000 * 60) // Convert to minutes
    }));
    
    return NextResponse.json({
      success: true,
      executions: paginatedExecutions,
      analytics: {
        total: totalExecutions,
        completed: completedExecutions,
        failed: failedExecutions,
        successRate,
        rulePerformance: ruleAnalytics
      },
      pagination: {
        limit,
        offset,
        total: filteredExecutions.length
      }
    });
  } catch (error) {
    console.error('Error fetching workflow executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow executions' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { executionId, updates } = await request.json();
    
    const execution = workflowExecutions.get(executionId);
    if (!execution) {
      return NextResponse.json(
        { error: 'Workflow execution not found' },
        { status: 404 }
      );
    }
    
    const updatedExecution: LeadWorkflowExecution = {
      ...execution,
      ...updates
    };
    
    workflowExecutions.set(executionId, updatedExecution);
    
    return NextResponse.json({
      success: true,
      execution: updatedExecution,
      message: 'Workflow execution updated successfully'
    });
  } catch (error) {
    console.error('Error updating workflow execution:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow execution' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');
    
    if (!executionId) {
      return NextResponse.json(
        { error: 'Execution ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = workflowExecutions.delete(executionId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Workflow execution not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workflow execution deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow execution:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow execution' },
      { status: 500 }
    );
  }
}
