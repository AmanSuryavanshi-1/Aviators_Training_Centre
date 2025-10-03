'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Eye, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface TestPost {
  _id: string;
  title: string;
  excerpt?: string;
  slug: { current: string };
  publishedAt: string;
  _createdAt: string;
}

interface TestContentReport {
  testPosts: TestPost[];
  summary: {
    totalPosts: number;
    testPosts: number;
    productionPosts: number;
    recommendations: string[];
  };
}

export default function TestContentCleanup() {
  const [report, setReport] = useState<TestContentReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const fetchReport = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/cleanup-test-content');
      const result = await response.json();
      
      if (result.success) {
        setReport(result.data);
        setMessage({ type: 'info', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to fetch report' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error while fetching report' });
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async (dryRun: boolean = true) => {
    setProcessing(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/cleanup-test-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', dryRun })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: dryRun 
            ? `Dry run completed: Would process ${result.data.removed.length} posts`
            : `Successfully processed ${result.data.removed.length} posts`
        });
        
        if (!dryRun) {
          // Refresh the report after actual cleanup
          await fetchReport();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Cleanup failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error during cleanup' });
    } finally {
      setProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    const confirmationCode = 'DELETE_TEST_POSTS_PERMANENTLY';
    const userConfirmation = prompt(
      `⚠️ DANGER: This will permanently delete all test posts!\n\nType "${confirmationCode}" to confirm:`
    );
    
    if (userConfirmation !== confirmationCode) {
      setMessage({ type: 'error', text: 'Deletion cancelled - incorrect confirmation code' });
      return;
    }
    
    setProcessing(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/cleanup-test-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', confirmationCode })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Permanently deleted ${result.data.deleted.length} test posts`
        });
        await fetchReport();
      } else {
        setMessage({ type: 'error', text: result.error || 'Deletion failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error during deletion' });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Content Cleanup</h1>
          <p className="text-muted-foreground">
            Remove test posts and development content from your live website
          </p>
        </div>
        <Button 
          onClick={fetchReport} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500' : message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Scanning content...</span>
          </CardContent>
        </Card>
      ) : report ? (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Content Analysis
              </CardTitle>
              <CardDescription>
                Overview of your blog content and test posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.summary.totalPosts}</div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{report.summary.productionPosts}</div>
                  <div className="text-sm text-muted-foreground">Production Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{report.summary.testPosts}</div>
                  <div className="text-sm text-muted-foreground">Test Posts</div>
                </div>
              </div>
              
              {report.summary.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {report.summary.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Posts List */}
          {report.testPosts.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Test Posts Found ({report.testPosts.length})
                </CardTitle>
                <CardDescription>
                  These posts will be hidden from your live website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {report.testPosts.map((post, index) => (
                    <div key={post._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Slug: {post.slug.current}
                        </div>
                        {post.excerpt && (
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {post.excerpt}
                          </div>
                        )}
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        Test Content
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => handleCleanup(true)}
                    disabled={processing}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Dry Run
                  </Button>
                  
                  <Button 
                    onClick={() => handleCleanup(false)}
                    disabled={processing}
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Move to Drafts
                  </Button>
                  
                  <Button 
                    onClick={handlePermanentDelete}
                    disabled={processing}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <div className="font-semibold text-green-700">All Clean!</div>
                  <div className="text-sm text-muted-foreground">
                    No test posts found. Your website is production-ready.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Dry Run:</strong> Preview what would be cleaned without making changes
          </div>
          <div>
            <strong>2. Move to Drafts:</strong> Safely move test posts to drafts (recommended)
          </div>
          <div>
            <strong>3. Delete Permanently:</strong> Completely remove test posts (cannot be undone)
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <strong>Note:</strong> The filtering system will automatically hide test content from your live website, 
            even if you don't delete the posts. This cleanup tool helps keep your CMS organized.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}