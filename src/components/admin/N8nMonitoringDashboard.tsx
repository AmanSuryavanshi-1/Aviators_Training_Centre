'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, FileSpreadsheet, Webhook, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface WorkflowStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastExecution: string;
  executionCount: number;
  successRate: number;
  lastError?: string;
}

interface LeadImportStats {
  totalImported: number;
  validLeads: number;
  invalidLeads: number;
  duplicates: number;
  lastImport: string;
  source: string;
}

export default function N8nMonitoringDashboard() {
  const [workflows, setWorkflows] = useState<WorkflowStatus[]>([]);
  const [leadStats, setLeadStats] = useState<LeadImportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Mock data - replace with actual API calls to your n8n instance
  useEffect(() => {
    fetchWorkflowStatus();
    fetchLeadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchWorkflowStatus();
      fetchLeadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchWorkflowStatus = async () => {
    try {
      // Replace with actual n8n API call
      // const response = await fetch('/api/n8n/workflows/status');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData: WorkflowStatus[] = [
        {
          id: 'lead-import',
          name: 'ATC Enhanced Lead Import & WhatsApp Outreach',
          status: 'active',
          lastExecution: new Date(Date.now() - 300000).toISOString(),
          executionCount: 45,
          successRate: 96.7,
        },
        {
          id: 'whatsapp-ai',
          name: 'ATC WhatsApp AI Conversation & Daily Digest',
          status: 'active',
          lastExecution: new Date(Date.now() - 120000).toISOString(),
          executionCount: 128,
          successRate: 98.4,
        }
      ];
      
      setWorkflows(mockData);
    } catch (error) {
      console.error('Failed to fetch workflow status:', error);
    }
  };

  const fetchLeadStats = async () => {
    try {
      // Replace with actual API call to Airtable or n8n
      // const response = await fetch('/api/leads/stats');
      // const data = await response.json();
      
      // Mock data
      const mockStats: LeadImportStats = {
        totalImported: 234,
        validLeads: 198,
        invalidLeads: 12,
        duplicates: 24,
        lastImport: new Date(Date.now() - 1800000).toISOString(),
        source: 'Google Sheets'
      };
      
      setLeadStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch lead stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    const formData = new FormData();
    formData.append('csv', csvFile);

    try {
      // Replace with your actual n8n webhook URL
      const response = await fetch(`${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/csv-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_TOKEN}`
        },
        body: formData
      });

      if (response.ok) {
        alert('CSV uploaded successfully!');
        setCsvFile(null);
        fetchLeadStats();
      } else {
        alert('Failed to upload CSV');
      }
    } catch (error) {
      console.error('CSV upload error:', error);
      alert('Error uploading CSV');
    }
  };

  const triggerManualImport = async () => {
    try {
      // Trigger Google Sheets check manually
      const response = await fetch(`${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/lead-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_TOKEN}`
        },
        body: JSON.stringify({
          leads: [],
          source: 'Manual Trigger',
          action: 'check_sheets'
        })
      });

      if (response.ok) {
        alert('Manual import triggered!');
        fetchWorkflowStatus();
      }
    } catch (error) {
      console.error('Manual trigger error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      error: 'destructive',
      inactive: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">n8n Workflow Monitoring</h2>
        <Button onClick={() => { fetchWorkflowStatus(); fetchLeadStats(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Workflow Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{workflow.name}</CardTitle>
              {getStatusIcon(workflow.status)}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                {getStatusBadge(workflow.status)}
                <span className="text-sm text-muted-foreground">
                  Success Rate: {workflow.successRate}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Executions: {workflow.executionCount}</p>
                <p>Last run: {new Date(workflow.lastExecution).toLocaleString()}</p>
                {workflow.lastError && (
                  <p className="text-red-500 mt-1">Error: {workflow.lastError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lead Import Stats */}
      {leadStats && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Import Statistics</CardTitle>
            <CardDescription>
              Last import from {leadStats.source} at {new Date(leadStats.lastImport).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{leadStats.totalImported}</div>
                <div className="text-sm text-muted-foreground">Total Imported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{leadStats.validLeads}</div>
                <div className="text-sm text-muted-foreground">Valid Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{leadStats.invalidLeads}</div>
                <div className="text-sm text-muted-foreground">Invalid Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{leadStats.duplicates}</div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              CSV Upload
            </CardTitle>
            <CardDescription>
              Upload a CSV file with leads (Name, Phone, Email columns required)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button 
              onClick={handleCsvUpload} 
              disabled={!csvFile}
              className="w-full"
            >
              Upload CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Google Sheets Import
            </CardTitle>
            <CardDescription>
              Manually trigger Google Sheets import check
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={triggerManualImport} className="w-full">
              <Webhook className="h-4 w-4 mr-2" />
              Trigger Import Check
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}