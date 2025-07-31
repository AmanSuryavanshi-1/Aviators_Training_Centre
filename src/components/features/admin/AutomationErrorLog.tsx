'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Simple interface for error logs
interface AutomationErrorLog {
  _id: string;
  error: string;
  context: string;
  timestamp: string;
  stack?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
}

interface AutomationErrorLogProps {
  className?: string;
}

export function AutomationErrorLog({ className }: AutomationErrorLogProps) {
  const [errorLogs, setErrorLogs] = useState<AutomationErrorLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AutomationErrorLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  const fetchErrorLogs = async () => {
    setLoading(true);
    try {
      // This would be a real API endpoint in production
      // For now, we'll simulate fetching error logs
      const mockLogs: AutomationErrorLog[] = [
        {
          _id: 'err_1',
          error: 'Failed to process webhook payload',
          context: 'webhook_processing',
          timestamp: new Date().toISOString(),
          stack: 'Error: Failed to process webhook payload\n    at processWebhook (/app/api/n8n/webhook/simple/route.ts:45:11)',
          metadata: {
            draftId: 'draft_123',
            automationId: 'auto_456'
          },
          resolved: false
        },
        {
          _id: 'err_2',
          error: 'Invalid payload structure',
          context: 'content_validation',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          metadata: {
            validationErrors: ['Missing required field: content']
          },
          resolved: true
        },
        {
          _id: 'err_3',
          error: 'Database connection failed',
          context: 'draft_action',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          stack: 'Error: Database connection failed\n    at handleDraftAction (/app/api/n8n/drafts/simple/route.ts:78:9)',
          resolved: false
        }
      ];
      
      setErrorLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast.error('Error loading automation error logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, [showResolved]);

  const handleResolveError = async (errorId: string) => {
    setActionLoading(true);
    try {
      // This would be a real API call in production
      // For now, we'll simulate resolving an error
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setErrorLogs(prev => prev.map(log => 
        log._id === errorId ? { ...log, resolved: true } : log
      ));
      
      if (selectedLog?._id === errorId) {
        setSelectedLog(prev => prev ? { ...prev, resolved: true } : null);
      }
      
      toast.success('Error marked as resolved');
    } catch (error) {
      console.error('Error resolving error log:', error);
      toast.error('Failed to resolve error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteError = async (errorId: string) => {
    if (!confirm('Are you sure you want to delete this error log? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      // This would be a real API call in production
      // For now, we'll simulate deleting an error
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setErrorLogs(prev => prev.filter(log => log._id !== errorId));
      
      if (selectedLog?._id === errorId) {
        setSelectedLog(null);
      }
      
      toast.success('Error log deleted');
    } catch (error) {
      console.error('Error deleting error log:', error);
      toast.error('Failed to delete error log');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanupOldErrors = async () => {
    if (!confirm('Are you sure you want to delete all resolved error logs older than 30 days?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      // This would be a real API call in production
      // For now, we'll simulate cleaning up old errors
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter out resolved errors (simulating 30+ days old)
      setErrorLogs(prev => prev.filter(log => !log.resolved));
      setSelectedLog(prev => prev?.resolved ? null : prev);
      
      toast.success('Old error logs cleaned up');
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
      toast.error('Failed to clean up old error logs');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLogs = showResolved ? errorLogs : errorLogs.filter(log => !log.resolved);

  if (loading && errorLogs.length === 0) {
    return (
      <Card className={cn("bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Automation Error Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600 dark:text-slate-400">Loading error logs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }
 
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <AlertTriangle className="h-5 w-5" />
                Automation Error Logs
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                View and manage N8N automation error logs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? 'Hide Resolved' : 'Show Resolved'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchErrorLogs}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCleanupOldErrors}
                disabled={actionLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup Old
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Error Log List */}
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Error Logs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    No errors found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {showResolved ? "No error logs available." : "No unresolved errors found."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredLogs.map((log) => (
                    <div
                      key={log._id}
                      className={cn(
                        "p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors",
                        selectedLog?._id === log._id && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600"
                      )}
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                {log.error}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                {log.context}
                              </p>
                            </div>
                            
                            <Badge className={log.resolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {log.resolved ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {log.resolved ? "Resolved" : "Unresolved"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(log.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Details */}
        <div className="lg:col-span-2">
          {selectedLog ? (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-slate-900 dark:text-slate-100 line-clamp-2">
                      {selectedLog.error}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Context: {selectedLog.context}
                    </CardDescription>
                  </div>
                  <Badge className={selectedLog.resolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {selectedLog.resolved ? "Resolved" : "Unresolved"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Timestamp</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {formatDate(selectedLog.timestamp)}
                  </p>
                </div>

                {selectedLog.stack && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Stack Trace</h3>
                      <pre className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                        {selectedLog.stack}
                      </pre>
                    </div>
                  </>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">Metadata</h3>
                      <Table>
                        <TableBody>
                          {Object.entries(selectedLog.metadata).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>{JSON.stringify(value)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {!selectedLog.resolved && (
                    <Button
                      onClick={() => handleResolveError(selectedLog._id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Mark as Resolved
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleDeleteError(selectedLog._id)}
                    variant="destructive"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No error log selected
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Select an error log from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
