import { NextRequest, NextResponse } from 'next/server';

// n8n API configuration
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.aviatorstrainingcentre.in/';
const N8N_API_KEY = process.env.N8N_API_KEY;

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  startedAt: string;
  stoppedAt: string;
  status: 'success' | 'error' | 'waiting' | 'running';
}

export async function GET(request: NextRequest) {
  try {
    if (!N8N_API_KEY) {
      return NextResponse.json(
        { error: 'N8N API key not configured' },
        { status: 500 }
      );
    }

    const headers = {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    };

    // Fetch workflows
    const workflowsResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers,
    });

    if (!workflowsResponse.ok) {
      throw new Error(`Failed to fetch workflows: ${workflowsResponse.statusText}`);
    }

    const workflowsData = await workflowsResponse.json();
    const workflows: N8nWorkflow[] = workflowsData.data || [];

    // Filter ATC workflows
    const atcWorkflows = workflows.filter(w => 
      w.name.includes('ATC') || 
      w.name.includes('Lead Import') || 
      w.name.includes('WhatsApp')
    );

    // Fetch recent executions for each workflow
    const workflowStatuses = await Promise.all(
      atcWorkflows.map(async (workflow) => {
        try {
          const executionsResponse = await fetch(
            `${N8N_BASE_URL}/api/v1/executions?workflowId=${workflow.id}&limit=10`,
            { headers }
          );

          let executions: N8nExecution[] = [];
          let successRate = 0;
          let lastExecution = null;
          let lastError = null;

          if (executionsResponse.ok) {
            const executionsData = await executionsResponse.json();
            executions = executionsData.data || [];

            if (executions.length > 0) {
              lastExecution = executions[0].startedAt;
              
              // Calculate success rate
              const successCount = executions.filter(e => e.status === 'success').length;
              successRate = Math.round((successCount / executions.length) * 100);

              // Get last error
              const lastErrorExecution = executions.find(e => e.status === 'error');
              if (lastErrorExecution) {
                // Fetch execution details for error message
                try {
                  const executionDetailResponse = await fetch(
                    `${N8N_BASE_URL}/api/v1/executions/${lastErrorExecution.id}`,
                    { headers }
                  );
                  
                  if (executionDetailResponse.ok) {
                    const executionDetail = await executionDetailResponse.json();
                    lastError = executionDetail.data?.resultData?.error?.message || 'Unknown error';
                  }
                } catch (error) {
                  console.error('Failed to fetch execution details:', error);
                }
              }
            }
          }

          return {
            id: workflow.id,
            name: workflow.name,
            status: workflow.active ? 'active' : 'inactive',
            lastExecution,
            executionCount: executions.length,
            successRate,
            lastError,
          };
        } catch (error) {
          console.error(`Failed to fetch executions for workflow ${workflow.id}:`, error);
          return {
            id: workflow.id,
            name: workflow.name,
            status: 'error',
            lastExecution: null,
            executionCount: 0,
            successRate: 0,
            lastError: 'Failed to fetch execution data',
          };
        }
      })
    );

    return NextResponse.json({
      workflows: workflowStatuses,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('N8N status check failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch n8n status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, workflowId } = await request.json();

    if (!N8N_API_KEY) {
      return NextResponse.json(
        { error: 'N8N API key not configured' },
        { status: 500 }
      );
    }

    const headers = {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'activate':
        const activateResponse = await fetch(
          `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/activate`,
          {
            method: 'POST',
            headers,
          }
        );

        if (!activateResponse.ok) {
          throw new Error(`Failed to activate workflow: ${activateResponse.statusText}`);
        }

        return NextResponse.json({ success: true, message: 'Workflow activated' });

      case 'deactivate':
        const deactivateResponse = await fetch(
          `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/deactivate`,
          {
            method: 'POST',
            headers,
          }
        );

        if (!deactivateResponse.ok) {
          throw new Error(`Failed to deactivate workflow: ${deactivateResponse.statusText}`);
        }

        return NextResponse.json({ success: true, message: 'Workflow deactivated' });

      case 'trigger':
        const triggerResponse = await fetch(
          `${N8N_BASE_URL}/api/v1/workflows/${workflowId}/execute`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({}),
          }
        );

        if (!triggerResponse.ok) {
          throw new Error(`Failed to trigger workflow: ${triggerResponse.statusText}`);
        }

        const triggerData = await triggerResponse.json();
        return NextResponse.json({ 
          success: true, 
          message: 'Workflow triggered',
          executionId: triggerData.data?.id 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('N8N action failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform n8n action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}