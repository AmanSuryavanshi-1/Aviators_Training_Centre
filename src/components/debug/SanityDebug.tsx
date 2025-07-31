'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface DebugData {
  success: boolean;
  connection?: string;
  data?: any;
  config?: any;
  error?: string;
}

const SanityDebug: React.FC = () => {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-sanity');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      setDebugData({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test connection'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {debugData?.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : debugData?.success === false ? (
              <XCircle className="w-5 h-5 text-red-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            Sanity Connection Debug
          </div>
          <Button onClick={testConnection} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
            <span>Testing connection...</span>
          </div>
        ) : debugData ? (
          <div className="space-y-4">
            {/* Status */}
            <div className={`p-3 rounded-lg ${
              debugData.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                debugData.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {debugData.success ? 'Connection Successful' : 'Connection Failed'}
              </p>
              {debugData.error && (
                <p className="text-red-600 text-sm mt-1">{debugData.error}</p>
              )}
            </div>

            {/* Configuration */}
            {debugData.config && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Configuration</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Project ID:</span>
                    <span className="ml-2 font-mono">{debugData.config.projectId || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dataset:</span>
                    <span className="ml-2 font-mono">{debugData.config.dataset || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">API Version:</span>
                    <span className="ml-2 font-mono">{debugData.config.apiVersion || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Has Token:</span>
                    <span className={`ml-2 ${debugData.config.hasToken ? 'text-green-600' : 'text-red-600'}`}>
                      {debugData.config.hasToken ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Data Summary */}
            {debugData.data && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Data Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Posts:</span>
                    <span className="ml-2">{debugData.data.posts?.count || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Authors:</span>
                    <span className="ml-2">{debugData.data.authors?.count || 0}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Categories:</span>
                    <span className="ml-2">{debugData.data.categories?.count || 0}</span>
                  </div>
                </div>

                {/* Sample Data */}
                {debugData.data.posts?.sample && debugData.data.posts.sample.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">Sample Posts</h4>
                    <div className="space-y-2">
                      {debugData.data.posts.sample.map((post: any) => (
                        <div key={post._id} className="bg-white p-2 rounded border text-xs">
                          <div><strong>Title:</strong> {post.title}</div>
                          <div><strong>Slug:</strong> {post.slug || 'No slug'}</div>
                          <div><strong>Has Author:</strong> {post.hasAuthor ? 'Yes' : 'No'}</div>
                          <div><strong>Has Category:</strong> {post.hasCategory ? 'Yes' : 'No'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Click "Test Connection" to check Sanity configuration
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SanityDebug;